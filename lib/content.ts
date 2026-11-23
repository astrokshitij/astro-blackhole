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

/**
 * Paste your Google Analytics 4 Measurement ID here (starts with 'G-').
 * You can also set it via the NEXT_PUBLIC_GA_ID environment variable.
 * While this is empty, analytics tracking is turned off.
 */
export const GOOGLE_ANALYTICS_ID = process.env.NEXT_PUBLIC_GA_ID || "G-6TLR45R8ME";
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
    note: "AI products, growth, and what I'm building beyond the screen.",
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
      "I’m Kshitij Pandey, a physicist and science communicator exploring the ideas that reshape how we understand reality. I also build AI products and grow audiences the way a product manager would.",
  },
  credentials: [
    "MSc Physics · Astrophysics & Cosmology",
    "TEDx speaker",
    "Product & AI builder",
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
    {
      category: "Product / AI",
      title: "Product work: PRDs, wireframes and case studies",
      description:
        "How I think about users, problems and AI products, shown through the work.",
      type: "Product",
      href: "https://nextleap.app/portfolio/kshitij-pandey",
      // TODO: Replace with dedicated product portfolio screenshot when available
      image: "/images/story/msc-research.jpg",
      alt: "Product management and AI case studies by Kshitij Pandey",
      cta: "See my product work",
    },
  ],
  about: {
    eyebrow: "Behind the questions",
    title: "A physicist. A storyteller. Still a student of the universe.",
    body: "My path runs through studying physics, asking questions about the universe, and sharing what I learn. The question that follows me everywhere: how do we make these difficult ideas understandable? I treat science communication like a product: audience personas, retention data, and a steady stream of experiments.",
    cta: "The story so far",
  },
  writing: {
    eyebrow: "Featured writing / My abstract thoughts",
    intro: "For ideas that need a little more room.",
    aiNote: "Written while building AI tools of my own.",
  },
  closing: {
    eyebrow: "A conversation worth having",
    title: "Let’s make difficult ideas impossible to ignore.",
    body: "Research or creator collaborations, questions about the physics, or a correction. Tell me what you have in mind.",
  },
  aboutCredentials: [
    "MSc Physics · Astrophysics & Cosmology",
    "TEDx speaker",
    "Silver Medal · University Physics Competition · 2019",
    "SLAC Summer Institute",
  ],
};

export const CONTACT = {
  title: "Good questions start good conversations.",
  intro:
    "For research and creator collaborations, questions about the physics, or to tell me I got something wrong.",
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
    portraitCaption: "Kshitij Pandey / Physicist & science communicator",
    channelsLabel: "04 / The conversation continues",
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
  contact: {
    socialNote:
      "Instagram DMs are read but pile up quickly. For anything time-sensitive, please use email.",
  },
};

/**
 * Home page: one light journey, six moments. Keep each line short; the
 * picture does most of the talking. `photo` paths are in /public.
 * `focus` is the CSS object-position for the crop (horizontal vertical).
 */
export const LIGHT_JOURNEY = {
  // House style: no full stops in headlines or lines.
  chapters: [
    {
      id: "journey-start",
      eyebrow: "Kshitij Pandey / Astro Kshitij",
      title: "Kshitij means horizon, welcome to mine",
      // How the opening headline breaks; the last line is gold.
      titleLines: ["Kshitij means horizon", "Welcome to mine"],
      line: "The universe is stranger than you think, follow the light",
      photo: "/images/portraits/kshitij-bits.jpg",
      alt: "Kshitij Pandey, arms crossed, in a T-shirt printed with Gauss's law",
      focus: "42% 28%",
      size: "xl",
      label: "Sunlight",
      links: [
        { label: "Follow the light", href: "#journey-early" },
        { label: "Watch on YouTube", href: SOCIALS[0].href },
      ],
    },
    {
      id: "journey-early",
      eyebrow: "01",
      title: "Curious since class 2",
      titleLines: [] as string[],
      line: "By class 9, that curiosity had its own stall at the science fair: time travel and wormholes",
      photo: "/images/story/9th-class-exhibition.jpg",
      alt: "A school science exhibition stand about methods of time travel, space-time warps and wormholes",
      focus: "50% 60%",
      size: "xl",
      label: "Many colours",
      links: [{ label: "The story so far", href: "/about" }],
    },
    {
      id: "journey-research",
      eyebrow: "02",
      title: "Then I picked one hard question",
      titleLines: [] as string[],
      line: "In my MSc in astrophysics, I co-authored research on particle collisions near naked singularities",
      photo: "/images/story/msc-poster.jpg",
      alt: "Kshitij beside his research poster on particle collisions near naked singularities",
      focus: "30% 50%",
      size: "l",
      label: "One colour gets through",
      links: [
        {
          label: "Read the paper",
          href: "https://www.sciencedirect.com/science/article/abs/pii/S2212686425002948",
        },
      ],
    },
    {
      id: "journey-explain",
      eyebrow: "03",
      title: "Ideas travel further when they’re shared",
      titleLines: [] as string[],
      line: "On stage and on screen, I make physics something you can picture, not just memorise",
      photo: "/images/home/stats-audience.jpg",
      alt: "Kshitij explaining physics to an audience",
      focus: "50% 12%",
      size: "l",
      label: "Two slits",
      links: [{ label: "Read the essay", href: "/blog/the-trouble-with-making-science-simple" }],
    },
    {
      id: "journey-writing",
      eyebrow: "04",
      title: "One claim at a time",
      titleLines: [] as string[],
      line: "Myths, viral facts, “ancient science”: I test them and show my working",
      photo: "/images/story/msc-research.jpg",
      alt: "Kshitij writing in a notebook beside a laptop showing a plot",
      focus: "45% 45%",
      size: "xl",
      label: "One photon at a time",
      links: [{ label: "Read an investigation", href: "/blog/did-an-ancient-text-know-the-speed-of-light" }],
    },
    {
      id: "work",
      eyebrow: "05",
      title: "The bigger picture keeps growing",
      titleLines: [] as string[],
      line: "Today it’s physics, plus growth, AI and building useful products",
      photo: "/images/story/telescope.jpg",
      alt: "Kshitij standing beside a large telescope on a hillside",
      focus: "62% 80%",
      size: "l",
      label: "Where it’s likely to land",
      links: [{ label: "See my product work", href: "https://nextleap.app/portfolio/kshitij-pandey" }],
    },
  ],
  closer: {
    title: "Let’s talk",
    line: "Tell me what you’re working on, or what you’re wondering about",
    href: "/contact",
  },
  pause: "Pause motion",
  resume: "Play motion",
  fallback: "A still of the light journey. The live scene needs WebGL 2.",
  notesLabel: "About the light",
  notes:
    "These clips are 3D renders made in Blender from the same calculations the site's tests check, not a live simulation. Sunlight reflects off a flat mirror into a glass prism; each colour is refracted at both faces with Snell's law, with the spread enlarged seven times so it is visible. A pinhole passes a narrow green band and a lens collimates it, which prepares the light to be coherent enough for the slits; picking a colour alone would not do that. Two vertical slits give vertical bright and dark bands. The detector pattern is calculated for 530 nm light, 35 µm slits 180 µm apart and a screen 1 m away (36 mm across), including the single-slit envelope. Each dot is one detection drawn from that distribution; a detected photon is absorbed. The curve is the probability, drawn as a guide. Wave spacing, sizes and timing are schematic, and the visible beams stand for light scattered by dust: in a vacuum you would not see a beam from the side.",
};
