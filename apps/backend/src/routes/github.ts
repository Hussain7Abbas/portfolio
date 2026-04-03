import { Elysia, t } from "elysia";
import { prisma } from "@devport/db";
import { authMacro, type SessionUser } from "../plugins/auth";

const configBody = t.Object({
  githubUsername: t.String(),
  selectedRepos: t.Array(t.String()),
});

export const githubRoutes = new Elysia()
  .use(authMacro)
  .get(
    "/api/github/config",
    async ({ user }) => {
      const u = user as SessionUser;
      const config = await prisma.githubConfig.findUnique({
        where: { userId: u.id },
      });
      return { config };
    },
    { auth: true },
  )
  .put(
    "/api/github/config",
    async ({ user, body }) => {
      const u = user as SessionUser;
      const username = body.githubUsername.trim();
      const config = await prisma.githubConfig.upsert({
        where: { userId: u.id },
        create: {
          userId: u.id,
          githubUsername: username,
          selectedRepos: body.selectedRepos,
        },
        update: {
          githubUsername: username,
          selectedRepos: body.selectedRepos,
        },
      });
      return { config };
    },
    { auth: true, body: configBody },
  )
  .get(
    "/api/github/repos/:username",
    async ({ params, set }) => {
      const token = process.env.GITHUB_API_KEY;
      const headers: Record<string, string> = {
        Accept: "application/vnd.github+json",
        "User-Agent": "DevPort",
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      const res = await fetch(
        `https://api.github.com/users/${encodeURIComponent(params.username)}/repos?per_page=100&sort=updated`,
        { headers },
      );
      if (!res.ok) {
        set.status = res.status === 404 ? 404 : 502;
        return { error: "Failed to fetch repositories" };
      }
      const repos = (await res.json()) as Array<{
        id: number;
        name: string;
        description: string | null;
        html_url: string;
        stargazers_count: number;
        language: string | null;
        fork: boolean;
        private: boolean;
      }>;
      const mapped = repos
        .filter((r) => !r.fork && !r.private)
        .map((r) => ({
          id: r.id,
          name: r.name,
          description: r.description,
          htmlUrl: r.html_url,
          stars: r.stargazers_count,
          language: r.language,
        }))
        .sort((a, b) => b.stars - a.stars);
      return { repos: mapped };
    },
    { auth: true, params: t.Object({ username: t.String() }) },
  );
