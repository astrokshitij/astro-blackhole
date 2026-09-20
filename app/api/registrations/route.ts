import { CONTACT } from "@/lib/content";
import { saveRegistration, type RegistrationInput } from "@/lib/registrations";

export const runtime = "nodejs";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function text(form: FormData, field: string, maxLength: number) {
  return String(form.get(field) ?? "").trim().slice(0, maxLength);
}

function parseRegistration(form: FormData): RegistrationInput | null {
  const type = text(form, "type", 100);
  const name = text(form, "name", 100);
  const email = text(form, "email", 254).toLowerCase();
  const message = text(form, "message", 2000);

  if (
    !CONTACT.types.includes(type as (typeof CONTACT.types)[number]) ||
    !name ||
    !EMAIL_PATTERN.test(email) ||
    !message
  ) {
    return null;
  }

  return {
    type,
    name,
    email,
    organisation: text(form, "organisation", 160),
    audience: text(form, "audience", 160),
    preferredDate: text(form, "date", 80),
    message,
    source: text(form, "source", 80) || "website",
  };
}

async function sendNotification(input: RegistrationInput) {
  const accessKey = process.env.WEB3FORMS_ACCESS_KEY;
  if (!accessKey) return;

  const notification = new FormData();
  notification.set("access_key", accessKey);
  notification.set("subject", `Astro Kshitij enquiry: ${input.type}`);
  notification.set("from_name", "Astro Kshitij website");
  Object.entries(input).forEach(([key, value]) => notification.set(key, value));

  await fetch("https://api.web3forms.com/submit", {
    method: "POST",
    body: notification,
  });
}

export async function POST(request: Request) {
  try {
    const form = await request.formData();

    // Silently accept bot submissions without storing them.
    if (text(form, "botcheck", 200)) {
      return Response.json({ ok: true });
    }

    const input = parseRegistration(form);
    if (!input) {
      return Response.json(
        { ok: false, error: "Please check the required fields." },
        { status: 400 },
      );
    }

    const id = await saveRegistration(input);

    // Saving the registration is the source of truth. Email is only a courtesy
    // notification, so an email outage must not lose or reject a registration.
    try {
      await sendNotification(input);
    } catch (error) {
      console.error("Registration notification failed", error);
    }

    return Response.json({ ok: true, id }, { status: 201 });
  } catch (error) {
    console.error("Registration could not be saved", error);
    return Response.json(
      { ok: false, error: "Your details could not be saved. Please try again." },
      { status: 500 },
    );
  }
}
