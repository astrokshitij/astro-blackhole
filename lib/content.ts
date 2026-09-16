/* ==================================================================== *
 *  ALL EDITABLE TEXT LIVES HERE                                        *
 *                                                                      *
 *  Change any words between the quote marks and the site updates.      *
 *  To add an item, copy one { ... } block, paste it below the last     *
 *  one, and edit it. Keep every comma.                                 *
 * ==================================================================== */

export const SITE = {
  name: "Astro Kshitij",
  person: "Kshitij Pandey",
  tagline: "Physics in Hindi, for people who were taught to memorise it.",
  email: "astrokshitij5@gmail.com",

  // Portrait shown at the top of the About page sidebar.
  portrait: "/images/portraits/kshitij-bits.jpg",
  portraitAlt: "Kshitij Pandey",
};

/**
 * Paste your Web3Forms access key here to switch the registration form on.
 * Get one free at web3forms.com by entering the email you want the
 * registrations sent to. Nothing to install, no account to manage.
 * While this is empty the form shows a short notice instead.
 */
export const FORM_ACCESS_KEY = "";

// `glyph` picks the icon, `accent` is the brand colour used on hover only.
export const SOCIALS = [
  {
    label: "YouTube",
    handle: "@astrokshitij",
    href: "https://www.youtube.com/@astrokshitij",
    note: "Long-form explainers and experiments in understanding the universe.",
    glyph: "youtube" as const,
    accent: "#ff0033",
  },
  {
    label: "Instagram",
    handle: "@astro.kshitij",
    href: "https://www.instagram.com/astro.kshitij",
    note: "Short, curious dives into physics, astronomy and scientific thinking.",
    glyph: "instagram" as const,
    accent: "#e1306c",
  },
  {
    label: "LinkedIn",
    handle: "Kshitij Pandey",
    href: "https://www.linkedin.com/in/kshitij-pandey-30215314b/",
    note: "Talks, workshops and what I'm building beyond the screen.",
    glyph: "linkedin" as const,
    accent: "#0a66c2",
  },
];

/**
 * Shown on the home page beside the audience photo.
 */
export const STATS = [
  { to: 100, suffix: "+", label: "Talks" },
  { to: 137, suffix: "k+", label: "People Reached" },
];

// Blog posts are NOT here. Each post is its own markdown file in
// `content/blog/`. See the README for the format.

export const WORKSHOPS = [
  {
    title: "Quantum mechanics, in two hours",
    format: "Live online",
    audience: "Open to anyone",
    blurb:
      "Not a lecture course compressed into a session. Two hours of thinking hard about one genuinely strange thing, in an era that has made sustained attention rare. No mathematical background assumed.",
    points: [
      "Two hours, live, with questions taken throughout",
      "No prerequisites beyond school-level curiosity",
      "Built around one idea followed all the way down, not a survey",
    ],
    // Optional photo, for example "/images/workshop-qm.jpg"
    photo: "",
    photoAlt: "",
  },
  {
    title: "Science communication for research institutions",
    format: "On site",
    audience: "Departments, labs and graduate cohorts",
    blurb:
      "For researchers who can defend a thesis to a committee but lose a room of non-specialists in ninety seconds. Built around what actually travels, tested continuously on an audience of ninety thousand.",
    points: [
      "Why most outreach fails in its first eight seconds",
      "Turning a paper into something a stranger will finish",
      "Workshopping each participant's own research live",
    ],
    photo: "",
    photoAlt: "",
  },
];

export const CREDENTIALS = [
  { year: "2023", detail: "MSc Physics, astrophysics and cosmology focus" },
  { year: "2023", detail: "Co-authored a peer-reviewed paper on high-energy collisions near naked singularities" },
  { year: "—", detail: "TEDx speaker" },
  { year: "—", detail: "Recipient of a Science Communicator Award" },
];
