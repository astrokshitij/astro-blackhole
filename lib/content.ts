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

/** The light tells a visual story; the words remain about Kshitij. */
export const LIGHT_STORY = {
  chapters: ["Curiosity", "Communication", "Investigation", "Building"],
  hero: {
    label: "Kshitij Pandey / Physicist & science communicator",
    intro: "I explore difficult ideas, share them, and build things from what I learn.",
    scroll: "Follow the light. Meet the person behind the questions.",
  },
  communication: {
    label: "01 / In rooms and on screen",
    title: "I make difficult ideas worth following.",
    body: "Through videos, talks and stories, I bring physics closer to people. From a room full of questions to a screen full of possibilities.",
    caption: "Physics, in conversation.",
  },
  investigation: {
    label: "02 / Research & writing",
    title: "A good question deserves a closer look.",
    body: "My curiosity takes me from high-energy collisions near naked singularities to the claims we repeat about our universe. I research, write, and put the reasoning on the page.",
    caption: "Presenting my research on naked singularities.",
  },
  building: {
    label: "03 / Product & AI",
    title: "I turn questions into things people can use.",
    body: "Beyond science communication, I build AI products and approach growth through product thinking: understand the person, find the problem, test an idea.",
    caption: "Working through a question, one page at a time.",
  },
  personal: {
    label: "Behind all of this",
    title: "A physicist. A storyteller. Still curious.",
    body: "Physics is where I began. Making difficult ideas understandable is what keeps me going. Whether I’m at a chalkboard, writing an essay, or building a product, I’m usually following a question.",
    cta: "The story so far",
  },
  work: {
    label: "Selected work / Follow a question further",
    title: "The ideas become work.",
    intro: "A few places that curiosity has taken me.",
  },
  controls: {
    pause: "Pause motion", resume: "Resume motion", skip: "Go straight to my work",
    slit: "Slit spacing", path: "Record which path", wavelength: "Wavelength",
    why: "A little physics, if you're curious",
    newRun: "New run", photonCount: "detections", below: "Below emission threshold", above: "Photoelectrons emitted",
  },
  physics: {
    prism: "White light, many colours. Different wavelengths refract by different amounts.",
    waves: "A new experiment: coherent green light passes through two slits. Overlapping waves produce bright and dark fringes.",
    quantum: "Individual detections build an interference pattern. Recording the path removes the interference, not the single-slit diffraction.",
    energy: "A separate photoelectric experiment. Above the surface’s threshold, light can release electrons.",
    prismDetail: "The rays follow Snell’s law at both prism surfaces. Dispersion is magnified to make the colours visible at this scale. Visible beams represent scattering in a slightly dusty room; light is not visible side-on in a vacuum.",
    slitDetail: "This is a schematic apparatus with a calculated far-field pattern: wavelength 530 nm, slit width 35 μm, screen distance 1 m. Change slit spacing to change fringe spacing. The apparatus dimensions are exaggerated for visibility.",
    quantumDetail: "Dots are sampled from the two-slit probability distribution. Switching path recording starts a fresh run with fully distinguishable paths. The new distribution adds the two single-slit intensities. No conscious observer is needed, and a detected photon is absorbed at the screen.",
    energyDetail: "For this illustrative surface, the work function is 2.5 eV. Photon energy is E = hc/λ. In the ordinary single-photon regime, emission needs a photon above the threshold; extra brightness alone cannot make a lower-energy photon eject an electron. The shown kinetic energy is the maximum, not every electron’s energy.",
  },
};

/** Personal content paired with the live optical journey. */
export const LIVE_LIGHT_STORY = {
  chapters: ["The question", "A different angle", "In conversation", "Research", "Writing", "Things I build"],
  intro: "I’m Kshitij Pandey. Physicist, science communicator, and someone who follows a question wherever it leads.",
  scroll: "Follow the light. See what emerges.", rotate: "Turn the prism", loading: "Opening the light…", fallback: "Explore the story below. The live optical scene could not open on this device.",
  pause: "Pause motion", resume: "Resume motion", reveal: "Reveal the pattern", reset: "Replay the exposure", skip: "Explore my work",
  scenes: [
    { id: "curiosity", label: "Kshitij Pandey / Astro Kshitij", title: "The universe is stranger than you think.", body: "I explore difficult ideas, share them, and build things from what I learn.", photo: "/images/portraits/kshitij-bits.jpg", alt: "Kshitij Pandey wearing a physics T-shirt", caption: "Physicist. Storyteller. Still curious.", link: "#work", cta: "Explore my work" },
    { id: "perspective", label: "01 / A question worth following", title: "A different angle changes the question.", body: "My background is in physics, astrophysics and cosmology. That curiosity carries into everything I do.", photo: "/images/portraits/kshitij-bits.jpg", alt: "Kshitij Pandey", caption: "MSc Physics / Astrophysics & Cosmology", link: "/about", cta: "The story so far" },
    { id: "communication", label: "02 / In rooms and on screen", title: "I bring physics into the room.", body: "Through talks, videos and conversations, I make difficult ideas easier to follow.", photo: "/images/home/stats-audience.jpg", alt: "Kshitij speaking to an audience", caption: "Physics, in conversation.", link: SOCIALS[0].href, cta: "Watch on YouTube" },
    { id: "investigation", label: "03 / Research", title: "I stay with difficult questions.", body: "My co-authored research explores high-energy particle collisions near naked singularities.", photo: "/images/story/msc-poster.jpg", alt: "Kshitij presenting his research poster on naked singularities", caption: "A question taken to the research poster.", link: EDITORIAL.explorations[1].href, cta: "Explore my research" },
    { id: "writing", label: "04 / Writing & investigation", title: "I put the reasoning on the page.", body: "From the speed of light in an ancient text to the fate of the universe, I test the claims and follow the evidence.", photo: "/images/story/msc-research.jpg", alt: "Kshitij working through a question at his desk", caption: "Working through it, one page at a time.", link: "/blog/did-an-ancient-text-know-the-speed-of-light", cta: "Read the investigation" },
    { id: "building", label: "05 / Product & AI", title: "Curiosity becomes something you can use.", body: "I bring the same habit to products: understand the person, find the problem, and test an idea.", photo: "/images/story/msc-research.jpg", alt: "Kshitij writing at his desk", caption: "Research. Stories. Things I build.", link: EDITORIAL.explorations[3].href, cta: "See my product work" },
  ],
  opticalLabels: ["White light. One question.", "One prism. Many wavelengths.", "A narrow green band. A path to follow.", "Two openings. Overlapping waves.", "One detection at a time.", "The pattern emerges."],
  physicsLabel: "About the light",
  physics: "This is a live 3D optical scene. The prism solves Snell’s law at both faces; dispersion is enlarged 4× for clarity. The filter selects a narrow green band and the lens collimates it. Ideal coherent illumination is assumed at the double slit; selecting a colour alone does not guarantee coherence. Wavefront spacing, slit geometry and time are schematic. The detector is calculated at 530 nm, 35 μm slit width, 180 μm slit separation and a 1 m screen distance, with a 36 mm field of view. Individual detections sample that intensity, including the diffraction envelope. The final curve represents probability, not physical matter. Detected photons are absorbed at the screen.",
};

/** Personal journey for the alternating inline optical compositions. */
export const JOURNEY_STORY = {
  chapters: ["Start", "Early questions", "Research", "Conversation", "Writing", "Next"],
  scroll: "Follow the question",
  physicsLabel: "About the light",
  physics: "The optical scenes are a visual companion to this story. Prism rays follow Snell’s law, with dispersion enlarged for visibility. The later experiment assumes ideal coherent green illumination; selecting a colour alone does not guarantee coherence. Travelling waves and apparatus dimensions are schematic. The detector uses 530 nm light, 35 μm slit width, 180 μm slit separation and a 1 m screen distance. Individual detections sample the calculated interference and diffraction pattern. The final curve represents probability, not physical matter or light continuing after absorption.",
  scenes: [
    {
      id: "curiosity",
      label: "Kshitij Pandey / Astro Kshitij",
      title: "The universe is stranger than you think.",
      body: "I’m Kshitij. Physics is where I began. These days, I explore the universe through research, videos and writing, and bring that curiosity to products and AI.",
      photo: "/images/portraits/kshitij-bits.jpg",
      alt: "Kshitij Pandey wearing a physics T-shirt",
      caption: "Kshitij Pandey / Physicist and science communicator",
      link: "#early-questions",
      cta: "Follow the question",
    },
    {
      id: "early-questions",
      label: "Before the research papers",
      title: "The questions started early.",
      body: "At school, I took the ideas that fascinated me to a science exhibition. I liked working them out for myself, then finding a way to make someone else curious.",
      photo: "/images/story/9th-class-exhibition.jpg",
      alt: "Kshitij at a school science exhibition",
      caption: "A school science exhibition, before the research papers.",
      link: "",
      cta: "",
    },
    {
      id: "research",
      label: "Into physics",
      title: "Then the questions got harder.",
      body: "I co-authored research on high-energy particle collisions near naked singularities. Studying astrophysics and cosmology taught me to stay with difficult problems and follow an idea through the mathematics.",
      photo: "/images/story/msc-poster.jpg",
      alt: "Kshitij presenting his research poster on high-energy collisions near naked singularities",
      caption: "Presenting the research on naked singularities.",
      link: "https://www.sciencedirect.com/science/article/abs/pii/S2212686425002948",
      cta: "Read the research",
    },
    {
      id: "conversation",
      label: "Outside the research room",
      title: "What did my explanation make you imagine?",
      body: "In talks and videos, I’m interested in what an explanation makes you picture. When a simpler story leaves the wrong idea behind, I want to understand what went wrong.",
      photo: "/images/home/stats-audience.jpg",
      alt: "Kshitij speaking about physics with an audience",
      caption: "Physics, in conversation.",
      link: "/blog/the-trouble-with-making-science-simple",
      cta: "Read the talk",
    },
    {
      id: "thinking",
      label: "The claims I come back to",
      title: "Some ideas deserve a closer look.",
      body: "How might the universe end? What could AI discover? Does a claim about ancient knowledge survive a physics test? I write to work through the reasoning, including the awkward parts.",
      photo: "/images/story/msc-research.jpg",
      alt: "Kshitij working through a question at his desk",
      caption: "Working it out, one page at a time.",
      link: "/blog",
      cta: "Read my investigations",
    },
    {
      id: "next",
      label: "Still following the question",
      title: "The path hasn’t been a straight line.",
      body: "After my master’s, I moved into marketing, growth and AI. Now I’m exploring products: understanding the person, working out the problem, and testing what might actually help.",
      photo: "/images/story/telescope.jpg",
      alt: "Kshitij beside a telescope at an outdoor observing session",
      caption: "Still going out to look.",
      link: "https://nextleap.app/portfolio/kshitij-pandey",
      cta: "See what I’m building",
    },
  ],
  closing: {
    eyebrow: "A question, a project, a conversation",
    title: "What are you working on?",
    body: "If you’re making something, planning a talk, or working through a question I might help with, I’d like to hear about it.",
    cta: "Talk to me",
    link: "/contact",
  },
};
