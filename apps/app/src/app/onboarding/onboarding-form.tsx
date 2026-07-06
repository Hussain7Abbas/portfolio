"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Label, Spinner, Textarea, useToast } from "@devport/ui";
import { DEFAULT_TEMPLATE_SLUG, TEMPLATES } from "@devport/templates";
import { apiJson } from "@/lib/client-fetch";
import { FileUploadField } from "@/components/file-upload";

// Must mirror apps/backend/src/lib/reserved-usernames.ts#isValidUsernameFormat
const USERNAME_FORMAT = /^[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])?$/;

function portfolioBase(): string {
  return (process.env.NEXT_PUBLIC_PORTFOLIO_URL ?? "http://localhost:3002").replace(
    /^https?:\/\//,
    "",
  );
}

type UsernameStatus =
  | { state: "idle" }
  | { state: "checking" }
  | { state: "available" }
  | { state: "unavailable"; reason: string };

const steps = ["Username", "About you", "Photo", "Template", "First project"] as const;

export function OnboardingForm() {
  const router = useRouter();
  const toast = useToast();
  const [step, setStep] = useState(0);

  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>({ state: "idle" });

  const [title, setTitle] = useState("");
  const [bio, setBio] = useState("");

  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  const [activeTemplate, setActiveTemplate] = useState(DEFAULT_TEMPLATE_SLUG);

  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const normalizedUsername = username.trim().toLowerCase();
  const usernameFormatValid = USERNAME_FORMAT.test(normalizedUsername);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!normalizedUsername) {
      setUsernameStatus({ state: "idle" });
      return;
    }
    if (!usernameFormatValid) {
      setUsernameStatus({
        state: "unavailable",
        reason: "3-30 characters: lowercase letters, numbers, hyphens.",
      });
      return;
    }
    setUsernameStatus({ state: "checking" });
    debounceRef.current = setTimeout(() => {
      void (async () => {
        try {
          const data = await apiJson<{ available: boolean; reason: string | null }>(
            "/api/profile/username/check",
            {
              method: "POST",
              body: JSON.stringify({ username: normalizedUsername }),
            },
          );
          if (data.available) {
            setUsernameStatus({ state: "available" });
          } else {
            const messages: Record<string, string> = {
              invalid_format: "3-30 characters: lowercase letters, numbers, hyphens.",
              reserved: "This username is reserved.",
              taken: "Username is already taken.",
            };
            setUsernameStatus({
              state: "unavailable",
              reason: messages[data.reason ?? ""] ?? "Username is unavailable.",
            });
          }
        } catch {
          setUsernameStatus({ state: "idle" });
        }
      })();
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [normalizedUsername, usernameFormatValid]);

  const canContinueStep0 = useMemo(
    () => Boolean(displayName.trim()) && usernameStatus.state === "available",
    [displayName, usernameStatus],
  );

  async function finish() {
    setSubmitting(true);
    setError(null);
    try {
      await apiJson<{ profile: unknown }>("/api/profile", {
        method: "PUT",
        body: JSON.stringify({
          username: normalizedUsername,
          displayName: displayName.trim(),
          title: title.trim() || null,
          bio: bio.trim() || null,
          photoUrl,
          activeTemplate,
        }),
      });

      if (projectName.trim()) {
        try {
          await apiJson("/api/projects", {
            method: "POST",
            body: JSON.stringify({
              name: projectName.trim(),
              description: projectDescription.trim() || null,
            }),
          });
        } catch {
          toast.error("Profile created, but the first project couldn't be saved. Add it from Projects.");
        }
      }

      toast.success("Welcome to DevPort! Your portfolio is live.");
      router.push("/profile");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const usernameHint =
    usernameStatus.state === "checking" ? (
      <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", color: "var(--muted)" }}>
        <Spinner size={12} /> Checking availability…
      </span>
    ) : usernameStatus.state === "available" ? (
      <span style={{ color: "var(--success)" }}>Available</span>
    ) : usernameStatus.state === "unavailable" ? (
      <span style={{ color: "var(--error)" }}>{usernameStatus.reason}</span>
    ) : null;

  return (
    <div>
      <h1 style={{ marginTop: 0, marginBottom: "0.25rem" }}>Welcome to DevPort</h1>
      <p style={{ color: "var(--muted)", marginBottom: "1.5rem" }}>
        Step {step + 1} of {steps.length} — {steps[step]}
      </p>

      {step === 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div>
            <Label htmlFor="username">Username (URL)</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="jane"
              autoComplete="username"
              autoFocus
            />
            <p style={{ margin: "0.35rem 0 0", fontSize: "0.8rem", minHeight: "1.1rem" }}>
              {usernameHint ?? (
                <span style={{ color: "var(--muted)" }}>
                  {portfolioBase()}/{normalizedUsername || "username"}/{activeTemplate}
                </span>
              )}
            </p>
          </div>
          <div>
            <Label htmlFor="displayName">Display name</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Jane Developer"
            />
          </div>
          <Button onClick={() => setStep(1)} disabled={!canContinueStep0}>
            Continue
          </Button>
        </div>
      ) : null}

      {step === 1 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div>
            <Label htmlFor="title">Headline</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Full Stack Developer"
            />
          </div>
          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Short intro…" />
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <Button variant="secondary" onClick={() => setStep(0)}>
              Back
            </Button>
            <Button onClick={() => setStep(2)}>Continue</Button>
          </div>
        </div>
      ) : null}

      {step === 2 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <p style={{ margin: 0, color: "var(--muted)", fontSize: "0.9rem" }}>
            Add a profile photo (optional — you can also add this later from Profile).
          </p>
          <FileUploadField label="Photo" accept="image/*" onUploaded={(url) => setPhotoUrl(url)} />
          {photoUrl ? (
            <img
              src={photoUrl}
              alt="Preview"
              style={{ width: "5rem", height: "5rem", objectFit: "cover", borderRadius: "50%" }}
            />
          ) : null}
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <Button variant="secondary" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button onClick={() => setStep(3)}>{photoUrl ? "Continue" : "Skip"}</Button>
          </div>
        </div>
      ) : null}

      {step === 3 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <Label htmlFor="tpl">Template</Label>
          <select
            id="tpl"
            value={activeTemplate}
            onChange={(e) => setActiveTemplate(e.target.value)}
            style={{
              padding: "0.5rem",
              borderRadius: "6px",
              border: "1px solid var(--border)",
              background: "var(--input-bg)",
              color: "var(--fg)",
              maxWidth: "24rem",
            }}
          >
            {TEMPLATES.map((tpl) => (
              <option key={tpl.slug} value={tpl.slug}>
                {tpl.name}
              </option>
            ))}
          </select>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <Button variant="secondary" onClick={() => setStep(2)}>
              Back
            </Button>
            <Button onClick={() => setStep(4)}>Continue</Button>
          </div>
        </div>
      ) : null}

      {step === 4 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <p style={{ margin: 0, color: "var(--muted)", fontSize: "0.9rem" }}>
            Add your first project now (optional — you can always add more later).
          </p>
          <div>
            <Label htmlFor="pname">Project name</Label>
            <Input
              id="pname"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="My awesome app"
            />
          </div>
          <div>
            <Label htmlFor="pdesc">Description</Label>
            <Textarea
              id="pdesc"
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              placeholder="What did you build?"
            />
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <Button variant="secondary" onClick={() => setStep(3)} disabled={submitting}>
              Back
            </Button>
            <Button onClick={() => void finish()} loading={submitting}>
              Finish
            </Button>
          </div>
        </div>
      ) : null}

      {error ? (
        <p role="alert" style={{ color: "var(--error)", marginTop: "1rem" }}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
