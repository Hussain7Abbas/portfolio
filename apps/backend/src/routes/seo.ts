import { Elysia, t } from "elysia";
import { prisma } from "@devport/db";
import { authMacro, type SessionUser } from "../plugins/auth";

const seoBody = t.Object({
  title: t.Optional(t.Union([t.String(), t.Null()])),
  description: t.Optional(t.Union([t.String(), t.Null()])),
  ogImage: t.Optional(t.Union([t.String(), t.Null()])),
  keywords: t.Optional(t.Union([t.String(), t.Null()])),
});

export const seoRoutes = new Elysia()
  .use(authMacro)
  .get(
    "/api/seo",
    async ({ user }) => {
      const u = user as SessionUser;
      const seoMeta = await prisma.sEOMeta.findUnique({
        where: { userId: u.id },
      });
      return { seoMeta };
    },
    { auth: true },
  )
  .put(
    "/api/seo",
    async ({ user, body }) => {
      const u = user as SessionUser;
      const seoMeta = await prisma.sEOMeta.upsert({
        where: { userId: u.id },
        create: {
          userId: u.id,
          title: body.title ?? null,
          description: body.description ?? null,
          ogImage: body.ogImage ?? null,
          keywords: body.keywords ?? null,
        },
        update: {
          ...(body.title !== undefined ? { title: body.title } : {}),
          ...(body.description !== undefined ? { description: body.description } : {}),
          ...(body.ogImage !== undefined ? { ogImage: body.ogImage } : {}),
          ...(body.keywords !== undefined ? { keywords: body.keywords } : {}),
        },
      });
      return { seoMeta };
    },
    { auth: true, body: seoBody },
  );
