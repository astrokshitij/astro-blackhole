"use client";

import { useState } from "react";
import { buttonStyles } from "./ui";
import { ArrowGlyph } from "./icons";
import { FORM_ACCESS_KEY, SITE, WORKSHOPS } from "@/lib/content";

type Status = "idle" | "sending" | "sent" | "error";

const field =
  "w-full rounded-lg border border-white/15 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-white/35 transition-colors focus:border-white/45 focus:bg-white/[0.06] focus:outline-none";
const label =
  "font-mono block text-xs uppercase tracking-[0.18em] text-white/55";

export function RegistrationForm({ preselect }: { preselect?: string }) {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  // No access key configured, so registration runs on email. The visitor is
  // never shown that distinction: they get a working way to sign up either way.
  if (!FORM_ACCESS_KEY) {
    const body = [
      "Hi Kshitij,",
      "",
      "I would like to register for:",
      preselect ?? WORKSHOPS[0]?.title ?? "",
      "",
      "Name:",
      "Phone, with country code:",
      "City:",
      "",
      "What I want to get out of it (optional):",
      "",
    ].join("\n");

    return (
      <div className="rounded-xl border border-white/12 bg-white/[0.02] p-7 sm:p-9">
        <p className="font-display text-lg font-light text-white sm:text-xl">
          Registration runs on email.
        </p>
        <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/65">
          Send your name, phone number and which session you want. I put you on
          the list and reply with the date and how to pay. Registering commits
          you to nothing.
        </p>
        <a
          href={`mailto:${SITE.email}?subject=${encodeURIComponent(
            "Workshop registration",
          )}&body=${encodeURIComponent(body)}`}
          className={`${buttonStyles({ variant: "primary" })} mt-7`}
        >
          Email to register
          <ArrowGlyph className="h-4 w-4" />
        </a>
        <p className="mt-5 text-xs leading-relaxed text-white/55">
          The message opens pre-written. Usually a reply within a couple of
          days, from {SITE.email}.
        </p>
      </div>
    );
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setMessage("");

    const form = event.currentTarget;
    const data = new FormData(form);
    data.append("access_key", FORM_ACCESS_KEY);
    data.append("subject", "New workshop registration");
    data.append("from_name", "astrokshitij.com");

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: data,
      });
      const json = (await res.json()) as { success?: boolean; message?: string };

      if (json.success) {
        setStatus("sent");
        form.reset();
      } else {
        setStatus("error");
        setMessage(json.message ?? "Something went wrong.");
      }
    } catch {
      setStatus("error");
      setMessage("Could not reach the server. Check your connection.");
    }
  }

  if (status === "sent") {
    return (
      <div
        role="status"
        className="rounded-xl border border-white/25 bg-white/[0.04] p-7 sm:p-10"
      >
        <p className="font-display text-2xl font-light text-white sm:text-3xl">
          You are on the list.
        </p>
        <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/65">
          You will get an email from {SITE.email} with the date, the joining
          link and how to pay. If nothing arrives within two days, check spam
          and then write to me directly.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-xl border border-white/12 bg-white/[0.02] p-7 sm:p-9"
    >
      {/* Bots fill this in, people never see it. */}
      <input
        type="checkbox"
        name="botcheck"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden
      />

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={label} htmlFor="workshop">
            Which session
          </label>
          <select
            id="workshop"
            name="workshop"
            defaultValue={preselect ?? WORKSHOPS[0]?.title}
            className={`${field} mt-2.5`}
          >
            {WORKSHOPS.map((w) => (
              <option key={w.title} value={w.title} className="bg-black">
                {w.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={label} htmlFor="name">
            Your name
          </label>
          <input
            id="name"
            name="name"
            required
            autoComplete="name"
            placeholder="Kshitij Pandey"
            className={`${field} mt-2.5`}
          />
        </div>

        <div>
          <label className={label} htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            className={`${field} mt-2.5`}
          />
        </div>

        <div>
          <label className={label} htmlFor="phone">
            Phone, with country code
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            autoComplete="tel"
            placeholder="+91 90000 00000"
            className={`${field} mt-2.5`}
          />
        </div>

        <div>
          <label className={label} htmlFor="city">
            City
          </label>
          <input
            id="city"
            name="city"
            autoComplete="address-level2"
            placeholder="Gurgaon"
            className={`${field} mt-2.5`}
          />
        </div>

        <div className="sm:col-span-2">
          <label className={label} htmlFor="goal">
            What do you want to get out of it? Optional
          </label>
          <textarea
            id="goal"
            name="goal"
            rows={4}
            placeholder="A sentence is plenty. It genuinely shapes what I cover."
            className={`${field} mt-2.5 resize-y`}
          />
        </div>
      </div>

      {status === "error" ? (
        <p role="alert" className="mt-6 text-sm text-white">
          {message} You can always email {SITE.email} instead.
        </p>
      ) : null}

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={status === "sending"}
          className={`${buttonStyles({ variant: "primary" })} disabled:opacity-60`}
        >
          {status === "sending" ? "Sending" : "Register"}
          <ArrowGlyph className="h-4 w-4" />
        </button>
        <p className="text-xs leading-relaxed text-white/55">
          No payment here. You get an email with the date and how to pay.
        </p>
      </div>
    </form>
  );
}
