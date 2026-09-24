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
  email: "astrokshitij5@gmail.com",

  // Portrait shown at the top of the About page sidebar.
  portrait: "/images/portraits/kshitij-bits.jpg",
  portraitAlt: "Kshitij Pandey",
};

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
  {
    year: "2023",
    detail:
      "Co-authored a paper on high-energy collisions near naked singularities",
  },
  { year: "—", detail: "TEDx speaker" },
  { year: "—", detail: "Recipient of a Science Communicator Award" },
];

// Editorial copy for the redesigned site. Existing facts only; no inferred dates.
export const EDITORIAL = {
  hero: {
    eyebrow: "Astro Kshitij / Physics & the universe",
    title: "The universe is stranger than you think.",
    intro:
      "I’m Kshitij Pandey, a physicist and science communicator exploring the ideas that reshape how we understand reality.",
  },
  credentials: [
    "MSc Physics · Astrophysics & Cosmology",
    "TEDx speaker",
  ],
  explorations: [
    {
      category: "Investigation",
      title: "The Way the Universe Might Actually Die Is Disturbing",
      description:
        "False vacuum decay, the Higgs field, and the unsettling possibility that our universe is only temporarily stable.",
      type: "7 min read",
      href: "/blog/how-the-universe-might-actually-die",
      image: "/images/blog/universe-death.png",
      alt: "An illustration of false vacuum decay spreading through space",
      cta: "Explore the investigation",
    },
    {
      category: "Gravitation / Research",
      title: "At the edge of a singularity",
      description:
        "My co-authored work on high-energy particle collisions near naked singularities.",
      type: "Research paper",
      href: "https://www.sciencedirect.com/science/article/abs/pii/S2212686425002948",
      image: "/images/story/msc-poster.jpg",
      alt: "Kshitij presenting his research poster",
      cta: "View the research",
    },
    {
      category: "Physics / On screen",
      title: "Follow the question further.",
      description:
        "Long-form explainers and experiments in understanding the universe, in Hindi.",
      type: "YouTube channel",
      href: SOCIALS[0].href,
      image: "/images/story/after-msc-talk.jpg",
      alt: "Kshitij explaining physics at a chalkboard",
      cta: "Watch on YouTube",
    },
  ],
  room: {
    title: "Physics in the room.",
    intro: "Some ideas are best explored together.",
    body: "From the TEDx stage to a room full of students, I bring difficult ideas into conversations people can be part of.",
    caption: "Kshitij Pandey / On the TEDx stage",
    offerings: [
      "Talks that make space for curiosity",
      "Quantum Mechanics for Everyone",
      "Science communication training for institutions",
    ],
    note: "Both workshop programmes are in development. Enquiries and expressions of interest are welcome.",
  },
  about: {
    eyebrow: "Behind the questions",
    title: "A physicist. A storyteller. Still a student of the universe.",
    body: "My path runs through studying physics, asking questions about the universe, and sharing what I learn. The question that follows me everywhere: how do we make these difficult ideas understandable?",
    cta: "The story so far",
  },
  writing: {
    eyebrow: "Featured writing / My abstract thoughts",
    intro: "For ideas that need a little more room.",
    summary:
      "A journey into false vacuum decay, and what the apparent stability of our universe might be hiding.",
  },
  closing: {
    eyebrow: "A conversation worth having",
    title: "Let’s make difficult ideas impossible to ignore.",
    body: "Talks, workshops, institutional training, and research or creator collaborations. Tell me what you have in mind.",
  },
  aboutCredentials: [
    "MSc Physics · Astrophysics & Cosmology",
    "TEDx speaker",
    "Silver Medal · University Physics Competition",
    "SLAC Summer Institute",
    "Founder · Astro Kshitij",
  ],
};

export const PROGRAMMES = [
  {
    id: "quantum-mechanics-for-everyone",
    number: "01",
    category: "For the curious",
    title: "Quantum Mechanics for Everyone",
    intro: "Two hours. One big idea. A different way of seeing reality.",
    audience:
      "Students, working professionals, and anyone curious about physics. No mathematical background required.",
    duration: "2 hours",
    format: "Live online · Questions throughout",
    availability: "In development · Register interest",
    description:
      "An invitation to slow down, question what seems obvious, and follow the experiments that forced us to rethink reality. We explore the fundamentals without memorising equations or compressing a textbook into a lecture.",
    outcomes: [
      "Understand what quantum mechanics says about the physical world",
      "Follow the experiments that challenged classical intuition",
      "Separate quantum physics from common myths about consciousness and reality",
      "Build confidence in asking better questions about nature",
    ],
    action: "Register your interest",
  },
  {
    id: "science-communication-that-reaches-people",
    number: "02",
    category: "For institutions",
    title: "Science Communication That Reaches People",
    intro:
      "Help your research travel beyond the people who already understand it.",
    audience:
      "Universities, laboratories, science departments, graduate cohorts, and research teams.",
    duration: "To be agreed with your institution",
    format: "On site · Practical exercises",
    availability: "In development · Institutional enquiries welcome",
    description:
      "A programme for researchers who want to communicate with non-specialists while protecting scientific accuracy. Participants work with their own research and communication challenges, with a focus on public engagement, outreach, and reaching prospective students.",
    outcomes: [
      "Explain complex research to a non-specialist audience",
      "Turn a paper into a clear, engaging story",
      "Develop stronger openings for science outreach",
      "Practise communicating your own research without losing accuracy",
    ],
    action: "Discuss an institutional session",
  },
];

export const CONTACT = {
  title: "Good questions start good conversations.",
  intro:
    "For talks, workshops, research and creator collaborations. Or simply to tell me I got something wrong.",
  types: [
    "Speaking invitation",
    "Quantum mechanics workshop",
    "Institutional training",
    "Research or creator collaboration",
    "Question or correction",
  ],
  formTitle: "Tell me what you have in mind.",
  emailNote:
    "Email is the best way to reach me. I usually reply within a couple of days.",
  draftNote:
    "This prepares an email in your mail app. You can review it before sending; nothing is submitted here.",
};

export const PAGE_COPY = {
  home: {
    reachLabel: "Reach / In rooms and on screen",
    reachTitle: "Physics in front of rooms. Curiosity beyond them.",
    headline: ["The universe is", "stranger than", "you think."],
    workLabel: "01 / Selected explorations",
    workTitle: ["Follow a question.", "See where it takes you."],
    workIntro:
      "Research, stories, and ideas from a universe that keeps surprising us.",
    roomLabel: "02 / Beyond the screen",
    portraitCaption: "Kshitij Pandey / Physicist & science communicator",
    channelsLabel: "05 / The conversation continues",
    channelsTitle: "Find me in your orbit.",
  },
  writing: {
    eyebrow: "Writing / My abstract thoughts",
    title: "Some questions deserve more room.",
    intro:
      "Physics, the universe, and the rabbit holes that refuse to fit into a short video.",
    videoIntro:
      "The same curiosity, in a different format. Explore physics and astronomy on YouTube.",
  },
  workshops: {
    eyebrow: "Workshops / Shared curiosity",
    title: "Understanding changes everything.",
    intro:
      "Talks and workshops that make complex ideas easier to understand, question, and think about.",
    caption: "Physics is a conversation. Bring your questions.",
    notice:
      "No dates or places are confirmed yet. Tell me your interests and we can discuss the next step.",
  },
  interest: {
    title: "Be part of the conversation.",
    intro:
      "Tell me which programme interests you and what you hope to understand. I’ll reply to discuss your interests and share details when the programme is ready.",
    notice:
      "This is an expression of interest, not a confirmed booking. No payment is taken and no dates are announced.",
  },
  contact: {
    corrections:
      "If I got something wrong in a video, a post, or a talk, please tell me. I’ll credit you if you’d like. Questions and friendly arguments about physics are always welcome.",
    socialNote:
      "Instagram DMs are read but pile up quickly. For anything with a date attached, please use email.",
  },
};
