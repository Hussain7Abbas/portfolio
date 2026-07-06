import { Elysia, t } from "elysia";
import { prisma } from "@devport/db";
import { DEFAULT_TEMPLATE_SLUG, isValidTemplateSlug } from "@devport/templates";
import { authMacro, type SessionUser } from "../plugins/auth";
import {
  isReservedUsername,
  isValidUsernameFormat,
} from "../lib/reserved-usernames";
import { isValidEmail, isValidHttpUrl } from "../lib/url-validate";

const URL_FIELD_NAMES = [
  "photoUrl",
  "resumeUrl",
  "githubUrl",
  "linkedinUrl",
  "twitterUrl",
  "websiteUrl",
] as const;

type UrlFieldName = (typeof URL_FIELD_NAMES)[number];

function findInvalidUrlField(
  data: Partial<Record<UrlFieldName, string | null>>,
): UrlFieldName | null {
  for (const name of URL_FIELD_NAMES) {
    const value = data[name];
    if (value && !isValidHttpUrl(value)) {
      return name;
    }
  }
  return null;
}

const profileBody = t.Object({
  username: t.Optional(t.String()),
  displayName: t.Optional(t.String()),
  title: t.Optional(t.Union([t.String(), t.Null()])),
  bio: t.Optional(t.Union([t.String(), t.Null()])),
  photoUrl: t.Optional(t.Union([t.String(), t.Null()])),
  resumeUrl: t.Optional(t.Union([t.String(), t.Null()])),
  githubUrl: t.Optional(t.Union([t.String(), t.Null()])),
  linkedinUrl: t.Optional(t.Union([t.String(), t.Null()])),
  twitterUrl: t.Optional(t.Union([t.String(), t.Null()])),
  websiteUrl: t.Optional(t.Union([t.String(), t.Null()])),
  emailPublic: t.Optional(t.Union([t.String(), t.Null()])),
  activeTemplate: t.Optional(t.String()),
  published: t.Optional(t.Boolean()),
});

export const profileRoutes = new Elysia()
  .use(authMacro)
  .get(
    "/api/profile",
    async ({ user }) => {
      const u = user as SessionUser;
      const profile = await prisma.profile.findUnique({
        where: { userId: u.id },
      });
      return { profile };
    },
    { auth: true },
  )
  .put(
    "/api/profile",
    async ({ user, body, set }) => {
      const u = user as SessionUser;
      const data = body;

      if (data.username !== undefined) {
        const normalized = data.username.trim().toLowerCase();
        if (!isValidUsernameFormat(normalized)) {
          set.status = 400;
          return { error: "Invalid username format" };
        }
        if (isReservedUsername(normalized)) {
          set.status = 400;
          return { error: "Username is reserved" };
        }
        const taken = await prisma.profile.findFirst({
          where: {
            username: normalized,
            userId: { not: u.id },
          },
        });
        if (taken) {
          set.status = 409;
          return { error: "Username is already taken" };
        }
      }

      if (
        data.activeTemplate !== undefined &&
        !isValidTemplateSlug(data.activeTemplate)
      ) {
        set.status = 400;
        return { error: "Unknown template" };
      }

      const invalidUrlField = findInvalidUrlField(data);
      if (invalidUrlField) {
        set.status = 400;
        return { error: `Invalid URL for ${invalidUrlField}` };
      }

      if (data.emailPublic && !isValidEmail(data.emailPublic)) {
        set.status = 400;
        return { error: "Invalid public email" };
      }

      const existing = await prisma.profile.findUnique({
        where: { userId: u.id },
      });

      if (!existing) {
        if (!data.username?.trim() || !data.displayName?.trim()) {
          set.status = 400;
          return { error: "username and displayName are required for new profile" };
        }
        const normalized = data.username.trim().toLowerCase();
        const profile = await prisma.profile.create({
          data: {
            userId: u.id,
            username: normalized,
            displayName: data.displayName.trim(),
            title: data.title ?? null,
            bio: data.bio ?? null,
            photoUrl: data.photoUrl ?? null,
            resumeUrl: data.resumeUrl ?? null,
            githubUrl: data.githubUrl ?? null,
            linkedinUrl: data.linkedinUrl ?? null,
            twitterUrl: data.twitterUrl ?? null,
            websiteUrl: data.websiteUrl ?? null,
            emailPublic: data.emailPublic ?? null,
            activeTemplate: data.activeTemplate ?? DEFAULT_TEMPLATE_SLUG,
            published: data.published ?? true,
          },
        });
        return { profile };
      }

      const nextUsername =
        data.username !== undefined
          ? data.username.trim().toLowerCase()
          : existing.username;

      if (data.username !== undefined) {
        if (!isValidUsernameFormat(nextUsername)) {
          set.status = 400;
          return { error: "Invalid username format" };
        }
        if (isReservedUsername(nextUsername)) {
          set.status = 400;
          return { error: "Username is reserved" };
        }
      }

      const profile = await prisma.profile.update({
        where: { userId: u.id },
        data: {
          ...(data.username !== undefined ? { username: nextUsername } : {}),
          ...(data.displayName !== undefined
            ? { displayName: data.displayName.trim() }
            : {}),
          ...(data.title !== undefined ? { title: data.title } : {}),
          ...(data.bio !== undefined ? { bio: data.bio } : {}),
          ...(data.photoUrl !== undefined ? { photoUrl: data.photoUrl } : {}),
          ...(data.resumeUrl !== undefined ? { resumeUrl: data.resumeUrl } : {}),
          ...(data.githubUrl !== undefined ? { githubUrl: data.githubUrl } : {}),
          ...(data.linkedinUrl !== undefined
            ? { linkedinUrl: data.linkedinUrl }
            : {}),
          ...(data.twitterUrl !== undefined ? { twitterUrl: data.twitterUrl } : {}),
          ...(data.websiteUrl !== undefined ? { websiteUrl: data.websiteUrl } : {}),
          ...(data.emailPublic !== undefined
            ? { emailPublic: data.emailPublic }
            : {}),
          ...(data.activeTemplate !== undefined
            ? { activeTemplate: data.activeTemplate }
            : {}),
          ...(data.published !== undefined ? { published: data.published } : {}),
        },
      });

      return { profile };
    },
    { auth: true, body: profileBody },
  )
  .post(
    "/api/profile/username/check",
    async ({ user, body }) => {
      const u = user as SessionUser;
      const raw = body.username.trim().toLowerCase();
      if (!isValidUsernameFormat(raw)) {
        return { available: false, reason: "invalid_format" };
      }
      if (isReservedUsername(raw)) {
        return { available: false, reason: "reserved" };
      }
      const taken = await prisma.profile.findFirst({
        where: {
          username: raw,
          userId: { not: u.id },
        },
      });
      return { available: !taken, reason: taken ? "taken" : null };
    },
    { auth: true, body: t.Object({ username: t.String() }) },
  );
