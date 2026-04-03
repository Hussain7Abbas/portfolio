import { Elysia, t } from "elysia";
import { prisma } from "@devport/db";
import { authMacro, type SessionUser } from "../plugins/auth";

const eventBody = t.Object({
  name: t.String(),
  image: t.Optional(t.Union([t.String(), t.Null()])),
  description: t.Optional(t.Union([t.String(), t.Null()])),
  url: t.Optional(t.Union([t.String(), t.Null()])),
  order: t.Optional(t.Number()),
});

const eventPatchBody = t.Object({
  name: t.Optional(t.String()),
  image: t.Optional(t.Union([t.String(), t.Null()])),
  description: t.Optional(t.Union([t.String(), t.Null()])),
  url: t.Optional(t.Union([t.String(), t.Null()])),
  order: t.Optional(t.Number()),
});

export const eventRoutes = new Elysia()
  .use(authMacro)
  .get(
    "/api/events",
    async ({ user }) => {
      const u = user as SessionUser;
      const events = await prisma.event.findMany({
        where: { userId: u.id },
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      });
      return { events };
    },
    { auth: true },
  )
  .post(
    "/api/events",
    async ({ user, body, set }) => {
      const u = user as SessionUser;
      const maxOrder = await prisma.event.aggregate({
        where: { userId: u.id },
        _max: { order: true },
      });
      const nextOrder = (maxOrder._max.order ?? -1) + 1;
      const event = await prisma.event.create({
        data: {
          userId: u.id,
          name: body.name.trim(),
          image: body.image ?? null,
          description: body.description ?? null,
          url: body.url ?? null,
          order: body.order ?? nextOrder,
        },
      });
      set.status = 201;
      return { event };
    },
    { auth: true, body: eventBody },
  )
  .put(
    "/api/events/:id",
    async ({ user, params, body, set }) => {
      const u = user as SessionUser;
      const existing = await prisma.event.findFirst({
        where: { id: params.id, userId: u.id },
      });
      if (!existing) {
        set.status = 404;
        return { error: "Not found" };
      }
      const event = await prisma.event.update({
        where: { id: params.id },
        data: {
          ...(body.name !== undefined ? { name: body.name.trim() } : {}),
          ...(body.image !== undefined ? { image: body.image } : {}),
          ...(body.description !== undefined ? { description: body.description } : {}),
          ...(body.url !== undefined ? { url: body.url } : {}),
          ...(body.order !== undefined ? { order: body.order } : {}),
        },
      });
      return { event };
    },
    {
      auth: true,
      params: t.Object({ id: t.String() }),
      body: eventPatchBody,
    },
  )
  .delete(
    "/api/events/:id",
    async ({ user, params, set }) => {
      const u = user as SessionUser;
      const existing = await prisma.event.findFirst({
        where: { id: params.id, userId: u.id },
      });
      if (!existing) {
        set.status = 404;
        return { error: "Not found" };
      }
      await prisma.event.delete({ where: { id: params.id } });
      set.status = 204;
      return null;
    },
    { auth: true, params: t.Object({ id: t.String() }) },
  );
