import { Elysia, t } from "elysia";
import { prisma } from "@devport/db";
import type {
  Certificate,
  Event,
  GithubConfig,
  Profile,
  Project,
  SEOMeta,
} from "@devport/db";
import { isRateLimited } from "../lib/rate-limit";
import { getClientIp } from "../lib/request-ip";
import { isValidEmail } from "../lib/url-validate";
import { fetchPublicRepos, type GithubRepo } from "../lib/github-api";

const CONTACT_RATE_LIMIT = 5;
const CONTACT_RATE_WINDOW_MS = 10 * 60 * 1000;

function publicProfile(profile: Profile) {
  return {
    id: profile.id,
    username: profile.username,
    displayName: profile.displayName,
    title: profile.title,
    bio: profile.bio,
    photoUrl: profile.photoUrl,
    resumeUrl: profile.resumeUrl,
    githubUrl: profile.githubUrl,
    linkedinUrl: profile.linkedinUrl,
    twitterUrl: profile.twitterUrl,
    websiteUrl: profile.websiteUrl,
    emailPublic: profile.emailPublic,
    activeTemplate: profile.activeTemplate,
  };
}

function publicProject(project: Project) {
  return {
    id: project.id,
    name: project.name,
    image: project.image,
    description: project.description,
    tags: project.tags,
    demoUrl: project.demoUrl,
    sourceUrl: project.sourceUrl,
    order: project.order,
  };
}

function publicCertificate(certificate: Certificate) {
  return {
    id: certificate.id,
    name: certificate.name,
    image: certificate.image,
    description: certificate.description,
    url: certificate.url,
    order: certificate.order,
  };
}

function publicEvent(event: Event) {
  return {
    id: event.id,
    name: event.name,
    image: event.image,
    description: event.description,
    url: event.url,
    order: event.order,
  };
}

function publicGithubConfig(config: GithubConfig | null) {
  if (!config) return null;
  return {
    githubUsername: config.githubUsername,
    selectedRepos: config.selectedRepos,
  };
}

function publicSeoMeta(seo: SEOMeta | null) {
  if (!seo) return null;
  return {
    title: seo.title,
    description: seo.description,
    ogImage: seo.ogImage,
    keywords: seo.keywords,
  };
}

export const portfolioPublicRoutes = new Elysia()
  .get("/api/portfolio/sitemap", async () => {
    const profiles = await prisma.profile.findMany({
      where: { published: true },
      select: {
        username: true,
        activeTemplate: true,
        updatedAt: true,
      },
    });
    return {
      profiles: profiles.map((p) => ({
        username: p.username,
        activeTemplate: p.activeTemplate,
        updatedAt: p.updatedAt.toISOString(),
      })),
    };
  })
  .get(
    "/api/portfolio/:username",
    async ({ params, set }) => {
      const username = params.username.trim().toLowerCase();
      const profile = await prisma.profile.findUnique({
        where: { username },
      });
      if (!profile || !profile.published) {
        set.status = 404;
        return { error: "Portfolio not found" };
      }
      const userId = profile.userId;
      const [projects, certificates, events, githubConfig, seoMeta] =
        await Promise.all([
          prisma.project.findMany({
            where: { userId },
            orderBy: [{ order: "asc" }, { createdAt: "asc" }],
          }),
          prisma.certificate.findMany({
            where: { userId },
            orderBy: [{ order: "asc" }, { createdAt: "asc" }],
          }),
          prisma.event.findMany({
            where: { userId },
            orderBy: [{ order: "asc" }, { createdAt: "asc" }],
          }),
          prisma.githubConfig.findUnique({ where: { userId } }),
          prisma.sEOMeta.findUnique({ where: { userId } }),
        ]);

      return {
        profile: publicProfile(profile),
        projects: projects.map(publicProject),
        certificates: certificates.map(publicCertificate),
        events: events.map(publicEvent),
        githubConfig: publicGithubConfig(githubConfig),
        seoMeta: publicSeoMeta(seoMeta),
      };
    },
    { params: t.Object({ username: t.String() }) },
  )
  .get(
    "/api/portfolio/:username/github",
    async ({ params, set }) => {
      const username = params.username.trim().toLowerCase();
      const profile = await prisma.profile.findUnique({
        where: { username },
        select: { userId: true, published: true },
      });
      if (!profile || !profile.published) {
        set.status = 404;
        return { error: "Portfolio not found" };
      }
      const config = await prisma.githubConfig.findUnique({
        where: { userId: profile.userId },
      });
      if (!config || config.selectedRepos.length === 0) {
        return { githubUsername: config?.githubUsername ?? null, repos: [] };
      }
      try {
        const allRepos = await fetchPublicRepos(config.githubUsername);
        const byName = new Map(allRepos.map((r) => [r.name, r]));
        const repos = config.selectedRepos
          .map((name) => byName.get(name))
          .filter((r): r is GithubRepo => Boolean(r));
        return { githubUsername: config.githubUsername, repos };
      } catch {
        // Best-effort: don't break the public page if GitHub is unreachable.
        return { githubUsername: config.githubUsername, repos: [] };
      }
    },
    { params: t.Object({ username: t.String() }) },
  )
  .post(
    "/api/portfolio/:username/contact",
    async ({ params, body, set, request, server }) => {
      // Honeypot: bots fill hidden fields; pretend success without persisting.
      if (body.company) {
        set.status = 201;
        return { ok: true };
      }

      const ip = getClientIp(request, server);
      if (isRateLimited(`contact:${ip}`, CONTACT_RATE_LIMIT, CONTACT_RATE_WINDOW_MS)) {
        set.status = 429;
        return { error: "Too many messages sent. Please try again later." };
      }

      if (!isValidEmail(body.email.trim())) {
        set.status = 400;
        return { error: "Invalid email address" };
      }

      const username = params.username.trim().toLowerCase();
      const profile = await prisma.profile.findUnique({
        where: { username },
        select: { userId: true, published: true },
      });
      if (!profile || !profile.published) {
        set.status = 404;
        return { error: "Portfolio not found" };
      }
      await prisma.contactMessage.create({
        data: {
          userId: profile.userId,
          name: body.name.trim(),
          email: body.email.trim(),
          subject: body.subject.trim(),
          message: body.message.trim(),
        },
      });
      set.status = 201;
      return { ok: true };
    },
    {
      params: t.Object({ username: t.String() }),
      body: t.Object({
        name: t.String({ minLength: 1, maxLength: 100 }),
        email: t.String({ minLength: 3, maxLength: 254 }),
        subject: t.String({ minLength: 1, maxLength: 200 }),
        message: t.String({ minLength: 1, maxLength: 5000 }),
        // Honeypot: hidden from real users via CSS; bots tend to fill every field.
        company: t.Optional(t.String({ maxLength: 200 })),
      }),
    },
  );
