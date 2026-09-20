"use client";
import { useState } from "react";
import { CONTACT, SITE } from "@/lib/content";
import { buttonStyles } from "./ui";

export function EnquiryForm({ preselect }: { preselect?: string }) {
  const [status, setStatus] = useState<
    "idle" | "sending" | "sent" | "error"
  >("idle");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    if (data.get("botcheck")) return;
    setStatus("sending");
    data.append("source", window.location.pathname);
    try {
      const res = await fetch("/api/registrations", {
        method: "POST",
        body: data,
      });
      const result = (await res.json()) as { ok?: boolean };
      if (!res.ok || !result.ok) throw new Error("Registration failed");
      setStatus("sent");
      form.reset();
    } catch {
      setStatus("error");
    }
  }
  return (
    <form
      action="/api/registrations"
      method="post"
      encType="multipart/form-data"
      onSubmit={submit}
      className="enquiry-form"
      onChange={() => {
        if (status !== "sending") setStatus("idle");
      }}
    >
      <h2>{CONTACT.formTitle}</h2>
      <input
        type="text"
        name="botcheck"
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />
      <div className="form-grid">
        <label className="full">
          Enquiry type
          <select name="type" defaultValue={preselect ?? CONTACT.types[0]}>
            {CONTACT.types.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>
        </label>
        <label>
          Your name
          <input name="name" required autoComplete="name" maxLength={100} />
        </label>
        <label>
          Email address
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            maxLength={254}
          />
        </label>
        <label className="full">
          Organisation (optional)
          <input
            name="organisation"
            autoComplete="organization"
            maxLength={160}
          />
        </label>
        <label>
          Audience (optional)
          <input name="audience" placeholder="Who is it for?" maxLength={160} />
        </label>
        <label>
          Approximate date (optional)
          <input
            name="date"
            placeholder="Month, date, or flexible"
            maxLength={80}
          />
        </label>
        <label className="full">
          What do you have in mind?
          <textarea name="message" required rows={5} maxLength={2000} />
        </label>
      </div>
      <p className="form-note">
        Your details are stored securely so Kshitij can respond and follow up
        about this enquiry. Please include only the information needed to discuss
        it.
      </p>
      <button
        type="submit"
        disabled={status === "sending"}
        className={buttonStyles()}
      >
        {status === "sending"
          ? "Sending…"
          : "Send enquiry"}{" "}
        <span aria-hidden="true">↗</span>
      </button>
      <noscript>
        <p className="form-note">
          Please email <a href={`mailto:${SITE.email}`}>{SITE.email}</a> with
          your enquiry, organisation, audience, and approximate date.
        </p>
      </noscript>
      {status === "sent" && (
        <p className="form-note" role="status">
          Thank you. Your enquiry has been sent. I’ll reply by email.
        </p>
      )}
      {status === "error" && (
        <p className="form-note" role="alert">
          Your enquiry could not be sent. Your details are still here. Please
          try again or email {SITE.email} directly.
        </p>
      )}
    </form>
  );
}
