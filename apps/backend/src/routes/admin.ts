import { Elysia, t } from "elysia";
import { prisma } from "@devport/db";
import { authMacro, type SessionUser } from "../plugins/auth";

export const adminRoutes = new Elysia()
  .use(authMacro)
  .get(
    "/api/admin/overview",
    async () => {
      const [userCount, profileCount, messageCount] = await Promise.all([
        prisma.user.count(),
        prisma.profile.count(),
        prisma.contactMessage.count(),
      ]);
      return { userCount, profileCount, messageCount };
    },
    { admin: true },
  )
  .get(
    "/api/admin/users",
    async ({ query }) => {
      const page = Math.max(1, Number(query.page ?? 1));
      const limit = Math.min(50, Math.max(1, Number(query.limit ?? 20)));
      const search = query.search?.trim();
      const where = search
        ? {
            OR: [
              { email: { contains: search, mode: "insensitive" as const } },
              { name: { contains: search, mode: "insensitive" as const } },
              {
                profile: {
                  username: {
                    contains: search,
                    mode: "insensitive" as const,
                  },
                },
              },
            ],
          }
        : {};

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * limit,
          take: limit,
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
            profile: { select: { username: true } },
          },
        }),
        prisma.user.count({ where }),
      ]);

      return { users, total, page, limit };
    },
    {
      admin: true,
      query: t.Object({
        page: t.Optional(t.String()),
        limit: t.Optional(t.String()),
        search: t.Optional(t.String()),
      }),
    },
  )
  .get(
    "/api/admin/users/:id",
    async ({ params, set }) => {
      const user = await prisma.user.findUnique({
        where: { id: params.id },
        include: {
          profile: true,
          _count: {
            select: {
              projects: true,
              certificates: true,
              messages: true,
            },
          },
        },
      });
      if (!user) {
        set.status = 404;
        return { error: "Not found" };
      }
      return { user };
    },
    { admin: true, params: t.Object({ id: t.String() }) },
  )
  .patch(
    "/api/admin/users/:id",
    async ({ params, body, user, set }) => {
      const admin = user as SessionUser;
      const role = body.role;
      if (role !== "admin" && role !== "user") {
        set.status = 400;
        return { error: "Invalid role" };
      }
      if (params.id === admin.id && role === "user") {
        set.status = 400;
        return { error: "Cannot demote yourself" };
      }
      const existing = await prisma.user.findUnique({
        where: { id: params.id },
      });
      if (!existing) {
        set.status = 404;
        return { error: "Not found" };
      }
      const updated = await prisma.user.update({
        where: { id: params.id },
        data: { role },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          profile: { select: { username: true } },
        },
      });
      return { user: updated };
    },
    {
      admin: true,
      params: t.Object({ id: t.String() }),
      body: t.Object({ role: t.String() }),
    },
  )
  .delete(
    "/api/admin/users/:id",
    async ({ params, user, set }) => {
      const admin = user as SessionUser;
      if (params.id === admin.id) {
        set.status = 400;
        return { error: "Cannot delete yourself" };
      }
      const existing = await prisma.user.findUnique({
        where: { id: params.id },
      });
      if (!existing) {
        set.status = 404;
        return { error: "Not found" };
      }
      await prisma.user.delete({ where: { id: params.id } });
      set.status = 204;
      return null;
    },
    { admin: true, params: t.Object({ id: t.String() }) },
  );
