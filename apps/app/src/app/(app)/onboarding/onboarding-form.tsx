"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Label, Textarea } from "@devport/ui";
import { apiJson } from "@/lib/client-fetch";

export function OnboardingForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [title, setTitle] = useState("");
  const [bio, setBio] = useState("");
  const [activeTemplate, setActiveTemplate] = useState("vscode");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    setError(null);
    try {
      await apiJson<{ profile: unknown }>("/api/profile", {
        method: "PUT",
        body: JSON.stringify({
          username,
          displayName,
          title: title || null,
          bio: bio || null,
          activeTemplate,
        }),
      });
      router.push("/profile");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: "28rem" }}>
      <h1 style={{ marginTop: 0 }}>Welcome to DevPort</h1>
      <p style={{ color: "var(--muted)", marginBottom: "1.5rem" }}>
        Step {step} of 3 — set up your public portfolio.
      </p>

      {step === 1 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div>
            <Label htmlFor="username">Username (URL)</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="jane"
              autoComplete="username"
            />
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
          <Button onClick={() => setStep(2)} disabled={!username.trim() || !displayName.trim()}>
            Continue
          </Button>
        </div>
      ) : null}

      {step === 2 ? (
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
            <Button variant="secondary" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button onClick={() => setStep(3)}>Continue</Button>
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
            <option value="vscode">VS Code</option>
          </select>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <Button variant="secondary" onClick={() => setStep(2)}>
              Back
            </Button>
            <Button onClick={() => void submit()} disabled={loading}>
              {loading ? "Saving…" : "Finish"}
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
