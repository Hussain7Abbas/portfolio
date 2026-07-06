"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Input, Label, Textarea, useToast } from "@devport/ui";
import { apiJson, ApiError } from "@/lib/client-fetch";
import { FileUploadField } from "@/components/file-upload";

type Profile = {
  username: string;
  displayName: string;
  title: string | null;
  bio: string | null;
  photoUrl: string | null;
  resumeUrl: string | null;
  githubUrl: string | null;
  linkedinUrl: string | null;
  twitterUrl: string | null;
  websiteUrl: string | null;
  emailPublic: string | null;
  activeTemplate: string;
};

export function ProfileForm({ initial }: { initial: Profile }) {
  const router = useRouter();
  const toast = useToast();
  const [p, setP] = useState(initial);
  const [saving, setSaving] = useState(false);

  async function save() {
    if (saving) return;
    setSaving(true);
    try {
      await apiJson("/api/profile", {
        method: "PUT",
        body: JSON.stringify({
          displayName: p.displayName,
          title: p.title,
          bio: p.bio,
          photoUrl: p.photoUrl,
          resumeUrl: p.resumeUrl,
          githubUrl: p.githubUrl,
          linkedinUrl: p.linkedinUrl,
          twitterUrl: p.twitterUrl,
          websiteUrl: p.websiteUrl,
          emailPublic: p.emailPublic,
        }),
      });
      toast.success("Profile saved.");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Failed to save profile");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ maxWidth: "32rem" }}>
      <h1 style={{ marginTop: 0 }}>Profile</h1>
      <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
        Username is set at onboarding; contact support to change it.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "1rem" }}>
        <div>
          <Label>Username</Label>
          <Input value={p.username} readOnly style={{ opacity: 0.75 }} />
        </div>
        <div>
          <Label htmlFor="dn">Display name</Label>
          <Input id="dn" value={p.displayName} onChange={(e) => setP({ ...p, displayName: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="ti">Title</Label>
          <Input id="ti" value={p.title ?? ""} onChange={(e) => setP({ ...p, title: e.target.value || null })} />
        </div>
        <div>
          <Label htmlFor="bio">Bio</Label>
          <Textarea id="bio" value={p.bio ?? ""} onChange={(e) => setP({ ...p, bio: e.target.value || null })} />
        </div>
        <FileUploadField
          label="Photo"
          accept="image/*"
          currentUrl={p.photoUrl}
          onUploaded={(url) => setP({ ...p, photoUrl: url })}
          onCleared={() => setP({ ...p, photoUrl: null })}
        />
        <div>
          <Label htmlFor="photoUrl" style={{ fontSize: "0.78rem" }}>
            Or paste a photo URL
          </Label>
          <Input
            id="photoUrl"
            value={p.photoUrl ?? ""}
            onChange={(e) => setP({ ...p, photoUrl: e.target.value || null })}
          />
        </div>
        <FileUploadField
          label="Resume (PDF)"
          accept="application/pdf"
          currentUrl={p.resumeUrl}
          onUploaded={(url) => setP({ ...p, resumeUrl: url })}
          onCleared={() => setP({ ...p, resumeUrl: null })}
        />
        <div>
          <Label htmlFor="resumeUrl" style={{ fontSize: "0.78rem" }}>
            Or paste a resume URL
          </Label>
          <Input
            id="resumeUrl"
            value={p.resumeUrl ?? ""}
            onChange={(e) => setP({ ...p, resumeUrl: e.target.value || null })}
          />
        </div>
        <div>
          <Label htmlFor="gh">GitHub URL</Label>
          <Input id="gh" value={p.githubUrl ?? ""} onChange={(e) => setP({ ...p, githubUrl: e.target.value || null })} />
        </div>
        <div>
          <Label htmlFor="li">LinkedIn URL</Label>
          <Input
            id="li"
            value={p.linkedinUrl ?? ""}
            onChange={(e) => setP({ ...p, linkedinUrl: e.target.value || null })}
          />
        </div>
        <div>
          <Label htmlFor="tw">Twitter / X URL</Label>
          <Input
            id="tw"
            value={p.twitterUrl ?? ""}
            onChange={(e) => setP({ ...p, twitterUrl: e.target.value || null })}
          />
        </div>
        <div>
          <Label htmlFor="web">Website</Label>
          <Input
            id="web"
            value={p.websiteUrl ?? ""}
            onChange={(e) => setP({ ...p, websiteUrl: e.target.value || null })}
          />
        </div>
        <div>
          <Label htmlFor="em">Public email</Label>
          <Input
            id="em"
            type="email"
            value={p.emailPublic ?? ""}
            onChange={(e) => setP({ ...p, emailPublic: e.target.value || null })}
          />
        </div>
        <Button onClick={() => void save()} loading={saving}>
          Save profile
        </Button>
      </div>
    </div>
  );
}
