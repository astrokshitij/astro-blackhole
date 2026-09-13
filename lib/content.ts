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
};

// `glyph` picks the icon, `accent` is the brand colour used on hover only.
export const SOCIALS = [
  {
    label: "YouTube",
    handle: "@astrokshitij",
    href: "https://www.youtube.com/@astrokshitij",
    note: "Long explainers and short films",
    glyph: "play" as const,
    accent: "#ff0033",
  },
  {
    label: "Instagram",
    handle: "@astro.kshitij",
    href: "https://www.instagram.com/astro.kshitij",
    note: "Reels, four a week",
    glyph: "camera" as const,
    accent: "#e1306c",
  },
  {
    label: "LinkedIn",
    handle: "Kshitij Pandey",
    href: "https://www.linkedin.com/in/kshitij-pandey-30215314b/",
    note: "Talks, workshops and work",
    glyph: "network" as const,
    accent: "#0a66c2",
  },
];

export const STATS = [
  { value: "90K+", label: "Instagram followers" },
  { value: "35K", label: "YouTube subscribers" },
  { value: "12M+", label: "Views on reels" },
  { value: "580+", label: "Videos published" },
];

/**
 * Blog entries. The first one renders large as the featured piece.
 *
 *  category  one or two words, shown as a tag
 *  readTime  free text, shown next to the category
 *  status    "In progress" or "Published". Published entries need an href.
 *  href      optional. Adding it makes the whole card a link.
 */
export const POSTS = [
  {
    title: "Turn around twice",
    category: "Quantum",
    readTime: "9 min",
    status: "In progress",
    blurb:
      "An electron has to rotate a full 720 degrees before it looks like itself again. Not a metaphor, not a simplification for beginners. Here is what that actually means, and why it is the reason matter holds its shape at all.",
  },
  {
    title: "Why you do not fall through your chair",
    category: "Matter",
    readTime: "7 min",
    status: "In progress",
    blurb:
      "Atoms are almost entirely empty space, so the honest answer is not electrical repulsion. It is a rule about identity that most explanations skip because it is harder to draw.",
  },
  {
    title: "What school gets wrong about electricity",
    category: "Myth break",
    readTime: "6 min",
    status: "In progress",
    blurb:
      "Charges drift through a wire slower than you walk, and the energy is not travelling inside the wire at all. The reel on this reached 1.7 million people who had never been told.",
  },
];

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
  },
];

export const CREDENTIALS = [
  { year: "2023", detail: "MSc Physics, astrophysics and cosmology focus" },
  { year: "2023", detail: "Co-authored a peer-reviewed paper on high-energy collisions near naked singularities" },
  { year: "—", detail: "TEDx speaker" },
  { year: "—", detail: "Recipient of a Science Communicator Award" },
];
