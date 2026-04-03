import { Elysia } from "elysia";
import { auth } from "@devport/auth/server";

export type SessionUser = NonNullable<
  Awaited<ReturnType<typeof auth.api.getSession>>
>["user"];

export const authMacro = new Elysia({ name: "auth-macro" }).macro({
  auth: {
    async resolve({ status, request: { headers } }) {
      const session = await auth.api.getSession({ headers });
      if (!session) {
        return status(401, { error: "Unauthorized" });
      }
      return {
        user: session.user,
        session: session.session,
      };
    },
  },
  admin: {
    async resolve({ status, request: { headers } }) {
      const session = await auth.api.getSession({ headers });
      if (!session) {
        return status(401, { error: "Unauthorized" });
      }
      const role = (session.user as SessionUser & { role?: string }).role;
      if (role !== "admin") {
        return status(403, { error: "Forbidden" });
      }
      return {
        user: session.user,
        session: session.session,
      };
    },
  },
});
