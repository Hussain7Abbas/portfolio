import { Elysia, t } from "elysia";
import { prisma } from "@devport/db";
import { authMacro, type SessionUser } from "../plugins/auth";
import { isValidHttpUrl } from "../lib/url-validate";

function findInvalidUrl(fields: {
  image?: string | null;
  demoUrl?: string | null;
  sourceUrl?: string | null;
}): string | null {
  if (fields.image && !isValidHttpUrl(fields.image)) return "image";
  if (fields.demoUrl && !isValidHttpUrl(fields.demoUrl)) return "demoUrl";
  if (fields.sourceUrl && !isValidHttpUrl(fields.sourceUrl)) return "sourceUrl";
  return null;
}

const projectBody = t.Object({
  name: t.String(),
  image: t.Optional(t.Union([t.String(), t.Null()])),
  description: t.Optional(t.Union([t.String(), t.Null()])),
  tags: t.Optional(t.Array(t.String())),
  demoUrl: t.Optional(t.Union([t.String(), t.Null()])),
  sourceUrl: t.Optional(t.Union([t.String(), t.Null()])),
  order: t.Optional(t.Number()),
});

const projectPatchBody = t.Object({
  name: t.Optional(t.String()),
  image: t.Optional(t.Union([t.String(), t.Null()])),
  description: t.Optional(t.Union([t.String(), t.Null()])),
  tags: t.Optional(t.Array(t.String())),
  demoUrl: t.Optional(t.Union([t.String(), t.Null()])),
  sourceUrl: t.Optional(t.Union([t.String(), t.Null()])),
  order: t.Optional(t.Number()),
});

export const projectRoutes = new Elysia()
  .use(authMacro)
  .get(
    "/api/projects",
    async ({ user }) => {
      const u = user as SessionUser;
      const projects = await prisma.project.findMany({
        where: { userId: u.id },
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      });
      return { projects };
    },
    { auth: true },
  )
  .post(
    "/api/projects",
    async ({ user, body, set }) => {
      const u = user as SessionUser;
      const invalidField = findInvalidUrl(body);
      if (invalidField) {
        set.status = 400;
        return { error: `Invalid URL for ${invalidField}` };
      }
      const maxOrder = await prisma.project.aggregate({
        where: { userId: u.id },
        _max: { order: true },
      });
      const nextOrder = (maxOrder._max.order ?? -1) + 1;
      const project = await prisma.project.create({
        data: {
          userId: u.id,
          name: body.name.trim(),
          image: body.image ?? null,
          description: body.description ?? null,
          tags: body.tags ?? [],
          demoUrl: body.demoUrl ?? null,
          sourceUrl: body.sourceUrl ?? null,
          order: body.order ?? nextOrder,
        },
      });
      set.status = 201;
      return { project };
    },
    { auth: true, body: projectBody },
  )
  .put(
    "/api/projects/:id",
    async ({ user, params, body, set }) => {
      const u = user as SessionUser;
      const existing = await prisma.project.findFirst({
        where: { id: params.id, userId: u.id },
      });
      if (!existing) {
        set.status = 404;
        return { error: "Not found" };
      }
      const invalidField = findInvalidUrl(body);
      if (invalidField) {
        set.status = 400;
        return { error: `Invalid URL for ${invalidField}` };
      }
      const project = await prisma.project.update({
        where: { id: params.id },
        data: {
          ...(body.name !== undefined ? { name: body.name.trim() } : {}),
          ...(body.image !== undefined ? { image: body.image } : {}),
          ...(body.description !== undefined ? { description: body.description } : {}),
          ...(body.tags !== undefined ? { tags: body.tags } : {}),
          ...(body.demoUrl !== undefined ? { demoUrl: body.demoUrl } : {}),
          ...(body.sourceUrl !== undefined ? { sourceUrl: body.sourceUrl } : {}),
          ...(body.order !== undefined ? { order: body.order } : {}),
        },
      });
      return { project };
    },
    {
      auth: true,
      params: t.Object({ id: t.String() }),
      body: projectPatchBody,
    },
  )
  .delete(
    "/api/projects/:id",
    async ({ user, params, set }) => {
      const u = user as SessionUser;
      const existing = await prisma.project.findFirst({
        where: { id: params.id, userId: u.id },
      });
      if (!existing) {
        set.status = 404;
        return { error: "Not found" };
      }
      await prisma.project.delete({ where: { id: params.id } });
      set.status = 204;
      return null;
    },
    { auth: true, params: t.Object({ id: t.String() }) },
  )
  .put(
    "/api/projects/reorder",
    async ({ user, body, set }) => {
      const u = user as SessionUser;
      const ids = body.ids;
      const count = await prisma.project.count({
        where: { userId: u.id, id: { in: ids } },
      });
      if (count !== ids.length) {
        set.status = 400;
        return { error: "Invalid project ids" };
      }
      await prisma.$transaction(
        ids.map((id, index) =>
          prisma.project.update({
            where: { id },
            data: { order: index },
          }),
        ),
      );
      return { ok: true };
    },
    { auth: true, body: t.Object({ ids: t.Array(t.String()) }) },
  );
