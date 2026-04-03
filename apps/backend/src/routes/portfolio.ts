import { Elysia, t } from "elysia";
import { prisma } from "@devport/db";

export const portfolioPublicRoutes = new Elysia()
  .get("/api/portfolio/sitemap", async () => {
    const profiles = await prisma.profile.findMany({
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
      if (!profile) {
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
        profile,
        projects,
        certificates,
        events,
        githubConfig,
        seoMeta,
      };
    },
    { params: t.Object({ username: t.String() }) },
  )
  .post(
    "/api/portfolio/:username/contact",
    async ({ params, body, set }) => {
      const username = params.username.trim().toLowerCase();
      const profile = await prisma.profile.findUnique({
        where: { username },
        select: { userId: true },
      });
      if (!profile) {
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
        name: t.String({ minLength: 1 }),
        email: t.String({ minLength: 3 }),
        subject: t.String({ minLength: 1 }),
        message: t.String({ minLength: 1 }),
      }),
    },
  );
