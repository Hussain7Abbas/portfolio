import { Elysia, t } from "elysia";
import { prisma } from "@devport/db";
import { authMacro, type SessionUser } from "../plugins/auth";
import { fetchPublicRepos, GithubApiError } from "../lib/github-api";

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
      try {
        const repos = await fetchPublicRepos(params.username);
        return { repos };
      } catch (err) {
        if (err instanceof GithubApiError) {
          set.status = err.status === 404 ? 404 : 502;
          return { error: "Failed to fetch repositories" };
        }
        throw err;
      }
    },
    { auth: true, params: t.Object({ username: t.String() }) },
  );
