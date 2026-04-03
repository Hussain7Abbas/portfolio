"use client";

import { useState } from "react";
import styles from "@vscode/styles/ContactPage.module.css";

const apiBase = () => process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:3001";

export function ContactForm({ username }: { username: string }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">("idle");
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErr(null);
    try {
      const res = await fetch(
        `${apiBase()}/api/portfolio/${encodeURIComponent(username)}/contact`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            subject: subject.trim(),
            message: message.trim(),
          }),
        },
      );
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || "Request failed");
      }
      setStatus("ok");
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch (er) {
      setStatus("err");
      setErr(er instanceof Error ? er.message : "Failed");
    }
  }

  return (
    <form className={styles.form} onSubmit={(e) => void submit(e)}>
      <label>
        Name
        <input value={name} onChange={(e) => setName(e.target.value)} required />
      </label>
      <label>
        Email
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </label>
      <label>
        Subject
        <input value={subject} onChange={(e) => setSubject(e.target.value)} required />
      </label>
      <label>
        Message
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} required rows={6} />
      </label>
      <button type="submit" disabled={status === "loading"}>
        {status === "loading" ? "Sending…" : "Send"}
      </button>
      {status === "ok" ? <p style={{ color: "var(--button-text, #dcffe4)" }}>Message sent.</p> : null}
      {status === "err" && err ? (
        <p style={{ color: "#f85149" }} role="alert">
          {err}
        </p>
      ) : null}
    </form>
  );
}
