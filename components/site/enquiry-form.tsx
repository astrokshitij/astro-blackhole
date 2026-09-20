"use client";
import { useState } from "react";
import { CONTACT, FORM_ACCESS_KEY, SITE } from "@/lib/content";
import { buttonStyles } from "./ui";

export function EnquiryForm({ preselect }: { preselect?: string }) {
  const [status, setStatus] = useState<
    "idle" | "sending" | "sent" | "error" | "draft"
  >("idle");
  const [draft, setDraft] = useState("");
  const [copied, setCopied] = useState(false);
  const [subject, setSubject] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    if (data.get("botcheck")) return;
    const topic = String(data.get("type"));
    const body = [
      "Hi Kshitij,",
      "",
      ...["name", "email", "organisation", "audience", "date", "message"].map(
        (key) =>
          key[0].toUpperCase() +
          key.slice(1) +
          ": " +
          String(data.get(key) || "Not specified"),
      ),
      "",
    ].join("\n");
    setSubject(topic);
    setDraft(body);
    setCopied(false);
    if (!FORM_ACCESS_KEY) {
      setStatus("draft");
      return;
    }
    setStatus("sending");
    data.append("access_key", FORM_ACCESS_KEY);
    data.append("subject", "Astro Kshitij enquiry: " + topic);
    data.append("from_name", "Astro Kshitij website");
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: data,
      });
      const result = (await res.json()) as { success?: boolean };
      if (!res.ok || !result.success) throw new Error("Delivery failed");
      setStatus("sent");
      form.reset();
    } catch {
      setStatus("error");
    }
  }
  return (
    <form
      action={`mailto:${SITE.email}`}
      method="post"
      encType="text/plain"
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
        {FORM_ACCESS_KEY
          ? "Your enquiry is delivered by Web3Forms to Kshitij’s inbox. Please include only the details needed to discuss your enquiry."
          : CONTACT.draftNote}
      </p>
      <button
        type="submit"
        disabled={status === "sending"}
        className={buttonStyles()}
      >
        {status === "sending"
          ? "Sending…"
          : FORM_ACCESS_KEY
            ? "Send enquiry"
            : "Prepare email"}{" "}
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
      {status === "draft" && (
        <div className="email-draft" role="status">
          <p>
            Your draft is ready. Open it in your email app, or copy it into an
            email to {SITE.email}.
          </p>
          <a
            className="text-link"
            href={`mailto:${SITE.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(draft)}`}
          >
            Open email draft ↗
          </a>
          <button
            className="text-link ml-5"
            type="button"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(subject + "\n\n" + draft);
                setCopied(true);
              } catch {
                setCopied(false);
              }
            }}
          >
            {copied ? "Copied" : "Copy draft"}
          </button>
          <details className="form-note">
            <summary className="cursor-pointer py-3">View draft</summary>
            <pre className="whitespace-pre-wrap break-words font-sans">
              {draft}
            </pre>
          </details>
        </div>
      )}
    </form>
  );
}
