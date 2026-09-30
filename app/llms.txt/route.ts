import { getPosts } from "@/lib/posts";

export const dynamic = "force-static";

const BASE = "https://astrokshitij.com";

const HEAD = "# Astro Kshitij \u2014 Kshitij Pandey\n\n> Personal website and digital publication of Kshitij Pandey (Astro Kshitij), an Indian physicist, astrophysics researcher, TEDx speaker, and science communicator reaching 137k+ people online and 100+ live audiences across universities, schools, and research institutions.\n\n- **Canonical URL**: https://astrokshitij.com\n- **Primary Identity**: Kshitij Pandey (known publicly as \"Astro Kshitij\")\n- **Role**: Physicist, Science Communicator, TEDx Speaker, Workshop Facilitator\n- **Location**: India\n- **Contact**: astrokshitij5@gmail.com\n\n## Academic & Scientific Credentials\n\n- **M.Sc. in Physics (Astrophysics & Cosmology)** \u2014 Charotar University of Science and Technology (CHARUSAT).\n- **B.Sc. in Physics (Hons.)** \u2014 The ICFAI University, Jaipur (elected Student Council President; dissertation on WIMP dark matter).\n- **Peer-Reviewed Astrophysics Research**: Co-authored research with Prof. Pankaj S. Joshi on high-energy particle collisions in the vicinity of naked singularities, published in *Physics of the Dark Universe* (ScienceDirect): https://www.sciencedirect.com/science/article/abs/pii/S2212686425002948\n- **Dark Matter Research**: Worked with Prof. Kaushik Bhattacharya at IIT Kanpur on scalar-field dark matter.\n- **Additional Training & Honours**:\n  - Participant, SLAC Summer Institute (Stanford University).\n  - Silver Medal, International University Physics Competition.\n  - Recipient of a Science Communicator Award.\n  - TEDx Speaker (*\"Thinking Like a Kid\"* \u2014 on how adult education dulls natural scientific curiosity).\n\n## Public Reach & Impact\n\n- **137k+ People Reached** across YouTube (`@astrokshitij`), Instagram (`@astro.kshitij`), and digital platforms through deep physics explainers.\n- **100+ Live Talks & Sessions** delivered at IITs, universities, research institutions, and schools across India.\n\n## Key Website Sections & Canonical URLs\n\n- [Home](https://astrokshitij.com/): Overview of Kshitij Pandey's science communication work, live interactive WebGL black hole gravitational lensing simulation, selected explorations, and speaking reach.\n- [About Kshitij Pandey](https://astrokshitij.com/about): Full biographical narrative from Class 9 science exhibitions and undergraduate physics competitions to M.Sc. astrophysics research on naked singularities and science communication.\n";

const TAIL = "- [Workshops & Programmes](https://astrokshitij.com/workshops):\n  1. **Quantum mechanics, in two hours** (Public workshop / Live online): A two-hour foundational session on superposition, measurement, and wavefunctions without heavy mathematical prerequisites.\n  2. **Science communication for research institutions** (Institutional workshop / On site): Training for physics and STEM departments, labs, and graduate cohorts on translating complex research for non-specialist audiences.\n- [Contact & Speaking Enquiries](https://astrokshitij.com/contact): Direct booking and enquiry form for university talks, keynotes, institutional workshops, and collaborations.\n\n## Official Profiles & Citation Links\n\n- **Website**: https://astrokshitij.com\n- **ScienceDirect Publication**: https://www.sciencedirect.com/science/article/abs/pii/S2212686425002948\n- **YouTube**: https://www.youtube.com/@astrokshitij\n- **Instagram**: https://www.instagram.com/astro.kshitij\n- **LinkedIn**: https://www.linkedin.com/in/kshitij-pandey-30215314b/\n";

/**
 * llms.txt for AI assistants. The writing list is generated from the posts,
 * so a new post shows up here without anyone editing this file.
 */
export function GET() {
  const posts = getPosts()
    .map(
      (post) =>
        `  - [${post.title}](${BASE}/blog/${post.slug}): ${post.readTime ? `A ${post.readTime} read. ` : ""}${post.excerpt.replace(/\s+/g, " ").trim()}`,
    )
    .join("\n");

  const body = `${HEAD}- [Blog / Writing](${BASE}/blog): Long-form essays and investigations into cosmology, quantum mechanics, theoretical physics and how science is changing.\n${posts}\n${TAIL}`;
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
