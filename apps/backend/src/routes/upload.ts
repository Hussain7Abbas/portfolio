import { Elysia, t } from "elysia";
import { authMacro, type SessionUser } from "../plugins/auth";
import {
  deleteS3Object,
  generatePresignedPutUrl,
  isS3Configured,
  parseS3KeyFromPublicUrl,
} from "../lib/s3";

export const uploadRoutes = new Elysia()
  .use(authMacro)
  .post(
    "/api/upload/presigned-url",
    async ({ user, body, set }) => {
      if (!isS3Configured()) {
        set.status = 503;
        return { error: "File uploads are not configured" };
      }
      const u = user as SessionUser;
      const safeName = body.filename.replace(/[^a-zA-Z0-9._-]/g, "_");
      const key = `uploads/${u.id}/${Date.now()}-${safeName}`;
      const result = await generatePresignedPutUrl(key, body.contentType);
      if (!result) {
        set.status = 503;
        return { error: "Could not create upload URL" };
      }
      return {
        uploadUrl: result.uploadUrl,
        key,
        publicUrl: result.publicUrl,
      };
    },
    {
      auth: true,
      body: t.Object({
        filename: t.String({ minLength: 1 }),
        contentType: t.String({ minLength: 1 }),
      }),
    },
  )
  .delete(
    "/api/upload",
    async ({ user, body, set }) => {
      if (!isS3Configured()) {
        set.status = 503;
        return { error: "File uploads are not configured" };
      }
      const u = user as SessionUser;
      const key = parseS3KeyFromPublicUrl(body.publicUrl);
      if (!key || !key.startsWith(`uploads/${u.id}/`)) {
        set.status = 400;
        return { error: "Invalid file URL" };
      }
      await deleteS3Object(key);
      set.status = 204;
      return null;
    },
    { auth: true, body: t.Object({ publicUrl: t.String() }) },
  );
