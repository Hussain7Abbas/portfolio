import { Elysia, t } from "elysia";
import { prisma } from "@devport/db";
import { authMacro, type SessionUser } from "../plugins/auth";

export const messageRoutes = new Elysia()
  .use(authMacro)
  .get(
    "/api/messages",
    async ({ user, query }) => {
      const u = user as SessionUser;
      const page = Math.max(1, Number(query.page ?? 1));
      const limit = Math.min(50, Math.max(1, Number(query.limit ?? 20)));
      const unreadOnly = query.unread === "1" || query.unread === "true";
      const where = {
        userId: u.id,
        ...(unreadOnly ? { read: false } : {}),
      };
      const [messages, total] = await Promise.all([
        prisma.contactMessage.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.contactMessage.count({ where }),
      ]);
      return { messages, total, page, limit };
    },
    {
      auth: true,
      query: t.Object({
        page: t.Optional(t.String()),
        limit: t.Optional(t.String()),
        unread: t.Optional(t.String()),
      }),
    },
  )
  .get(
    "/api/messages/unread-count",
    async ({ user }) => {
      const u = user as SessionUser;
      const count = await prisma.contactMessage.count({
        where: { userId: u.id, read: false },
      });
      return { count };
    },
    { auth: true },
  )
  .put(
    "/api/messages/:id/read",
    async ({ user, params, set }) => {
      const u = user as SessionUser;
      const existing = await prisma.contactMessage.findFirst({
        where: { id: params.id, userId: u.id },
      });
      if (!existing) {
        set.status = 404;
        return { error: "Not found" };
      }
      const message = await prisma.contactMessage.update({
        where: { id: params.id },
        data: { read: true },
      });
      return { message };
    },
    { auth: true, params: t.Object({ id: t.String() }) },
  )
  .delete(
    "/api/messages/:id",
    async ({ user, params, set }) => {
      const u = user as SessionUser;
      const existing = await prisma.contactMessage.findFirst({
        where: { id: params.id, userId: u.id },
      });
      if (!existing) {
        set.status = 404;
        return { error: "Not found" };
      }
      await prisma.contactMessage.delete({ where: { id: params.id } });
      set.status = 204;
      return null;
    },
    { auth: true, params: t.Object({ id: t.String() }) },
  );
