import { Elysia, t } from "elysia";
import { authMacro, type SessionUser } from "../plugins/auth";
import {
  deleteS3Object,
  generatePresignedPutUrl,
  isS3Configured,
  parseS3KeyFromPublicUrl,
} from "../lib/s3";

const ALLOWED_CONTENT_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "application/pdf",
]);

const MAX_UPLOAD_BYTES: Record<string, number> = {
  "application/pdf": 10 * 1024 * 1024,
};
const DEFAULT_MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export const uploadRoutes = new Elysia()
  .use(authMacro)
  .post(
    "/api/upload/presigned-url",
    async ({ user, body, set }) => {
      if (!isS3Configured()) {
        set.status = 503;
        return { error: "File uploads are not configured" };
      }
      if (!ALLOWED_CONTENT_TYPES.has(body.contentType)) {
        set.status = 400;
        return { error: "Unsupported file type" };
      }
      const maxBytes = MAX_UPLOAD_BYTES[body.contentType] ?? DEFAULT_MAX_UPLOAD_BYTES;
      if (body.contentLength !== undefined && body.contentLength > maxBytes) {
        set.status = 400;
        return { error: `File is too large (max ${Math.round(maxBytes / (1024 * 1024))} MB)` };
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
        contentLength: t.Optional(t.Number()),
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
