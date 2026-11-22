# Live optical homepage

The root homepage now mounts components/site/light-story.tsx and lazily loads optical-world.ts. The old /review/light-story page is a historical storyboard, not the interactive deliverable.

## Timeline

0. Curiosity: white light reaches the prism beside the owner's headline and portrait.
1. Perspective: the prism turns and separates wavelengths beside the physics-background chapter. Range input or horizontal dragging changes rotating-triangle intersections and outgoing rays.
2. Communication: the camera follows a selected green band through an aperture and lens beside a speaking photograph.
3. Research: two slits emit overlapping schematic wavefronts beside the research poster. Continued scroll brings the detector fringes into view.
4. Writing: the continuous field fades into individual detection events beside the writing chapter.
5. Building: the completed pattern and probability curve accompany the owner's product-work invitation. Exposure replay rebuilds the pattern.

This is one camera/world. A foreground cutaway removes the slit assembly for the detector close-up. Desktop reserves a right visual column. Phones use a pinned upper scene and normal document scrolling for personal content.

## Physics conventions

- lib/optical-bench.ts solves both intersections and Snell refractions on the rotating triangular cross-section. Normal dispersion is magnified 4 times for legibility and disclosed in the optional details.
- Colour selection alone does not guarantee coherence. Ideal coherent illumination is assumed at the double slit. The aperture/lens is a visual handoff, not a complete laboratory source specification.
- The travelling field adapts finite-aperture complex-amplitude summation from the MIT source in THIRD_PARTY.md. Time, wavelength and apparatus scale in this view are schematic.
- The detector independently uses 530 nm, 35 micrometre slit width, 180 micrometre separation, 1 metre screen distance and 36 mm field of view. It includes the sinc-squared diffraction envelope and cosine-squared interference term.
- Seeded dots sample that intensity. They are detection events on a screen, not photon trajectories or a quantum collapse simulation. The curve represents probability, not physical matter or light after absorption.

## Runtime and scope

Three.js was already installed. The scene uses a local CC0 1K HDR lighting environment with a procedural fallback, existing owner photographs and existing fonts. No new paid service is needed.

DPR is capped at 1 on phones and 1.4 on desktop; animated rendering is approximately 30 fps with a slow-frame resolution reduction. Stationary prism/completed detector states render on demand. Hidden/offscreen scenes stop. Bloom postprocessing is omitted after reproduced blank frames at multiple sizes. Shader-based beam lighting remains.

Pause freezes ambient wave/exposure motion while preserving native scroll. Reduced motion selects complete chapter poses and exposures. WebGL failure keeps HTML content and substitutes a supplied portrait. Physical iPhone validation remains pending.

The original prism renderer and previous engine remain unmounted in the repository. Other routes and the enquiry backend are unchanged. Do not promote this branch until the owner approves the actual live preview.

## Hosted review copy

Vercel rejected the branch deployment with a 24-hour rate limit. A separate owner-private Sites review copy is available at https://astro-kshitij-light-preview-20261123.elated-cake-1410.chatgpt.site . It requires the owner’s ChatGPT sign-in and does not depend on this computer staying online. The Site project ID is appgprj_6b035074e0948191a8ff5eb721dcd187. Its source is E:/github/astrokshitij/previews/light-story-live-20261123, with .openai/hosting.json preserving that identity.

The copy statically exports the same frontend with unoptimized local images. Its contact form is replaced by a link to the real contact page; the registration API and runtime secrets are excluded. Analytics is disabled and robots disallows crawling. Updates must reuse the Site identity and existing audience. The actual domain and main branch are unchanged.
