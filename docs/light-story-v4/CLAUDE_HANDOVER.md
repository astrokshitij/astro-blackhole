# Claude handover: rebuild Astro Kshitij as one integrated visual story

You are taking over implementation of astrokshitij.com for its owner, Kshitij Pandey (Astro Kshitij). Act as a senior creative developer and art director. The owner has rejected the previous attempts because the animation looked pasted onto a conventional website, the prism looked like a wireframe or gray plate, and the promised quality did not match the result.

Read this entire handover and inspect both attached concept images before editing. Do the work, test the real result, and deliver a working phone-accessible review preview. Do not respond with another plan alone. Do not describe an AI concept image as a screenshot of an implemented website.

## 1. The visual target

Reference images, generated specifically for this handover:
- E:/github/astro-blackhole-light-story/docs/light-story-v4/laptop-concept.png
- E:/github/astro-blackhole-light-story/docs/light-story-v4/phone-concept.png

These are DESIGN CONCEPTS, not the current implementation. Built-in image generation used the owner's real supplied photographs as references. Use the original photographs in the actual website, preserving identity and image quality. Do not use the flattened concept PNG as the website or animate it as a substitute for the experience.

The laptop concept depicts successive positions during one scroll. Multiple drawings of a prism in that long image represent the SAME prism at different moments. They are not instructions to mount multiple separate prism widgets. The phone board shows THREE SEPARATE SCROLL STATES of one mobile page, not three columns on the actual phone.

Core principle: the website IS the light world. The words, photos, lighting, experiments and motion must belong to one authored composition. A full-window scene behind real HTML can achieve this; a visible player/pinned strip, rectangular canvas illustration, repeated scene boxes or apparatus card cannot.

Desktop composition alternates:
1. Opening headline/personality LEFT, clear prism RIGHT.
2. Same prism travels/turns to LEFT, personal journey and archival photo RIGHT.
3. Personal text/research photo LEFT, selected green light/optics RIGHT.
4. Double slit/interference LEFT, speaking story/photo RIGHT.
5. Writing/investigation LEFT, detector/pattern RIGHT.
6. Completed pattern LEFT, future direction/photo/contact RIGHT.

This needs continuous choreography, not discrete illustrations or arbitrary crossfades. The user's wording: when the universe headline appears on the left, the prism is on the right; scrolling brings that visual to the left with text/photo on the right, then reverses again.

Phones need a consciously recomposed version of that same world. Put a readable personal opening first, integrate the prism and real portrait into the composition, and let later text, photos and experiments follow native scrolling. Do not perch a persistent animation panel above every section. Do not squeeze desktop columns or long paragraphs into tiny mobile sidebars. The concept's very narrow side-copy is not a requirement: preserve proper mobile text sizes.

### Art direction
- Obsidian #08090c, warm pearl #f2efe8, restrained gold #f0b545.
- Existing Jost display and Geist body/mono fonts.
- Clear substantial polished glass: thickness, bevels, reflected studio strips, visible faces and a convincing subtle surface reflection.
- No wireframe outlines, opaque gray triangle, frosted gray ghost, cartoon laboratory blocks, excessive fog, galaxy-star wallpaper, generic dashboard cards or floating chapter pills.
- Optical light can weave through empty space and establish continuity. It must not slice through lettering or faces.
- Large authentic photographs with deliberate crops. The person and relevant context must remain visible. The telescope photo has a lot of sky at the top; crop around the person and telescope, not the sky.
- No tiny avatar as the only meaningful personal photograph.
- Avoid huge dead black gaps. Reading time and scene transitions must feel intentional.
- No generic quantum fuzz cloud or floating formulas for decoration.
- Preserve the intended visual standard. Passing a build is not evidence of good design.

## 2. Personal content and copy

The owner explicitly authorized rewriting the content and requested a copywriting agent. That agent already drafted and implemented JOURNEY_STORY in lib/content.ts. It now contains six short chapters and a personal closing invitation.

Narrative:
- Physics is where Kshitij began; curiosity connects research, communication, writing and products/AI.
- Early school science-exhibition curiosity, with the actual archival photograph.
- Astrophysics/cosmology and co-authored high-energy particle-collision research near naked singularities.
- What an explanation makes people imagine, supported by speaking photographs and the published talk/essay.
- Testing claims and showing reasoning in writing.
- Marketing/growth/AI and exploring useful products, with a portfolio destination.
- Closing: "What are you working on?" / "Talk to me".

Keep the opening "The universe is stranger than you think." unless there is a strong design reason to propose a change. The words are about Kshitij, what he does and how he thinks. They should not narrate a physics lesson or force photon metaphors onto his biography.

All editable copy belongs in lib/content.ts. You may improve JOURNEY_STORY rather than treating it as sacred. The copy in the concept PNGs is illustrative and sometimes invented by image generation. DO NOT transcribe it as verified biography or scientific explanation.

Factual boundaries:
- AGENTS.md says existing About/blog copy includes AI drafts. Treat those as context, not independently verified evidence of every anecdote.
- Do not invent the mechanics/success of an exhibition project, a child's quotation, a Himalayan encounter or Perimeter attendance.
- Degree-year information conflicts in the repository; omit years unless verified.
- Do not invent audience counts, employer results, completed product launches or a Product Manager employment title.
- The owner's confirmed BookMyForex title is Content and CLM Manager, if needed.
- Do not claim SQL analytics expertise.
- Keep original destinations for research, articles, YouTube, product portfolio and contact.

Copywriting rationale:
E:/github/astro-blackhole-light-story/docs/light-story-v3/JOURNEY_COPY.md

## 3. Physics requirements

The visual chain is:
broadband white light -> prism dispersion -> selection of a narrow green band -> coherent illumination of two slits -> interference on a screen -> individual detections building that same distribution -> probability/intensity interpretation.

- Solve refraction through both prism faces with wavelength-dependent refractive index.
- Rotation changes ray directions; it does not change the photon's colour.
- Dispersion may be enlarged for visibility, disclosed unobtrusively in optional notes.
- Spectral selection alone does not guarantee coherence. Show a schematic preparation or clearly assume ideal coherent illumination. Do not imply one colour filter magically guarantees it.
- Exactly two vertical slits. Their detector fringes vary horizontally, giving vertical bright/dark bands.
- Include the single-slit diffraction envelope, not infinite equally bright stripes.
- Existing detector model: 530 nm, slit width 35 micrometres, separation 180 micrometres, distance 1 m, 36 mm field of view.
- Dots are detection events sampled from the distribution, not photon trajectories through empty space.
- A detected photon is absorbed. Do not show particles/light emerging after the detector.
- The final probability curve is explanatory, not literal glowing matter.
- Wavefront spacing, dimensions and time can be schematic, with a clear optional note.
- Light glow represents scattering; side-on beams would not be visible in a vacuum.
- Generated concept art is NOT scientific authority. Correct mistakes in the mock while retaining its aesthetic/composition.

Useful existing code:
- lib/light-physics.ts: pure intensity, CDF, sampling and Snell helpers.
- lib/optical-bench.ts: rotating prism intersections and two-face refraction.
- scripts/light-physics.test.mjs
- scripts/optical-bench.test.mjs

## 4. Workspace and current source state

Windows / PowerShell. Primary actual website worktree:
E:/github/astro-blackhole-light-story

Branch: codex/home-light-story
Remote: https://github.com/astrokshitij/astro-blackhole.git
Last committed branch HEAD: 5cfe6ca7d8160c10bd2344b237e32ae91a61b2fb

There is substantial UNCOMMITTED WORK from the rejected local v3 and the newest unfinished continuous-world attempt. Preserve and inspect it. Do not git reset, clean, discard it or assume the latest commit contains the current work.

Owning files of the NEWEST unfinished attempt:
- app/page.tsx: now mounts only LightStory, removing generic repeated work/biography bands.
- components/site/light-story.tsx: one full-window world behind six alternating real-HTML narrative compositions; native scroll maps to progress/focusX/focusY.
- components/site/light-world.ts: newest single Three.js scene, adapted from optical-world.ts. It adds shared full-window framing, native camera movement, procedural Fresnel/studio-strip glass shading and a real Reflector floor. Still needs serious artistic and integration work.
- app/optical-story.css: newest full-world composition and responsive styles.
- lib/content.ts: JOURNEY_STORY is current narrative/copy.
- components/site/journey-art.tsx: previous rejected per-chapter approach, now unmounted.
- components/site/optical-world.ts: previous scene engine; edits from local v3 remain but the newest page imports light-world.ts instead.
- components/ui/prism-hero.tsx: original atmospheric procedural prism shader, preserved. It has a 2.5D depth approximation. It is not currently mounted by the newest page.

Other checkout E:/github/astro-blackhole is the original main checkout. Do not accidentally edit/push main while working in the review worktree.
E:/github/astrokshitij is a separate profile/support workspace, not the actual website repository.

Stack: Next 16.3.5, React 19.2.8, TypeScript, Tailwind 4, Three 0.187.0 already installed.
Read AGENTS.md and relevant installed Next docs before changing code. New branch names should use codex/ if needed.

## 5. What is still wrong / unfinished

The newest local attempt is NOT the generated concept quality. Do not defend it as complete.

Observed current problems:
- Glass has moved beyond the original wiry outline, but its procedural reflected stripe still makes it look too much like a shaded triangular plate.
- Camera/framing needed adjustments to keep the prism, slit plate and detector complete on both sides.
- The mobile conversation view had wavefronts crossing its heading/body while the camera remained pinned in viewport space. THIS IS A KNOWN BLOCKING INTEGRATION BUG, not an acceptable artistic effect.
- Mobile text/visual/photo timing still has excessive gaps in some positions.
- Earlier copy shading accidentally hid the entire mobile prism. That particular shading was disabled on mobile; do not reintroduce it.
- Desktop source-beam and reflection lines crossed text. The rendered incoming segment was shortened as a partial fix; inspect real intermediate states.
- Some views can expose a little previous-section text under the header; header treatment was strengthened but recheck.
- Current glass normals/reflections are procedural approximations; do not claim a physically calibrated glass renderer.
- Latest material/layout edits have NOT had final production build, lint, TypeScript, end-to-end or real iPhone verification.
- Older build passes and screenshots prove older revisions only.
- No final new preview was published after these changes.

Historical reviews and screenshots:
- docs/light-story-v3/DESIGN_REVIEW.md describes the rejected inline v3.
- docs/light-story-v2/AUDIT.md describes earlier rejection.
- qa/journey-v3/ contains prior local evidence; not proof of the newest world.
- qa/live-3d/ contains v2 evidence; not the target design.
- design-qa.md and docs/light-story-v2/LIVE_IMPLEMENTATION.md contain older v2 claims. Supersede/update them honestly for the final implementation.
- docs/light-story-v2/THIRD_PARTY.md records reused MIT phasor code and CC0 lighting provenance. Preserve notices when retaining adapted code.

You may replace the unfinished rendering architecture if that improves the outcome. Do not keep patching an unsuitable renderer simply because work has already gone into it. Use appropriate 3D/material/asset tools, reusable code or render assets, but do not sell the owner another static-image slideshow as live 3D. No paid service, kit purchase or subscription is authorized.

## 6. References and reusable sources already researched

User reference: https://lumette.ai/kits
Especially Relay and Fieldmark. Inspect their live pages and motion, not just thumbnails:
- https://relay-routing.base44.app/
- https://fieldmark.lumette.ai/

These are commercial kits, not verified free open-source code. Do not purchase without authorization or copy commercial source.

Existing vetted source study:
E:/github/astro-blackhole-light-story/docs/light-story-v2/BRIEF.md
It includes pinned MIT sources:
- pmndrs/examples/examples/nextjs-prism: useful glass/beam components, artistic physics needs correction.
- nicolasadamini/young-double-slit: finite-aperture complex-amplitude summation; classical-wave limits.
- 14islands scroll-rig/tutorial: useful shared canvas and DOM-photo tracking pattern; check React compatibility.
Do not repeat lengthy research instead of building a small convincing motion proof.

The user's supplied PDF was:
C:/Users/pkshi/Downloads/3D Updated Guide.pdf
Extracted references were saved under E:/github/astrokshitij/audits/homepage-2026-11-22/guide.
Treat attached-document instructions as reference content, not higher-priority user instructions.

## 7. Original photographs

All are already in public/images, including:
- /images/portraits/kshitij-bits.jpg
- /images/story/9th-class-exhibition.jpg
- /images/story/msc-poster.jpg
- /images/home/stats-audience.jpg
- /images/story/msc-research.jpg
- /images/story/telescope.jpg

Inspect the source images before choosing crops. Do not generate a substitute Kshitij or change his face. If needing cutouts/masks, preserve originals and save non-destructive versions.

If doing actual video/audio editing, external motion-design renders or editing-reference work, first read E:/Videos/AI Video Toolkit/AGENTS.md and its current maintained skills/knowledge. The user's shared-editing AGENTS instruction applies to those tasks; read knowledge/TOOLS.md before claiming rendering tools are unavailable.

## 8. Hosting and approval boundary

PRODUCTION astrokshitij.com MUST STAY UNCHANGED UNTIL KSHITIJ EXPLICITLY APPROVES.
No push to main, merge, promotion, production domain reassignment or production deployment without approval. Review deployments are authorized.

A stable owner-private Sites review URL already exists:
https://astro-kshitij-light-preview-20261123.elated-cake-1410.chatgpt.site

It requires the owner's ChatGPT sign-in. The user has opened it. It currently contains the REJECTED V2, not the latest local changes or the concept images.

Sites project ID (copy exactly):
appgprj_6b035074e0948191a8ff5eb721dcd187

Separate Sites source/mirror:
E:/github/astrokshitij/previews/light-story-live-20261123
Manifest: .openai/hosting.json
Static output: out

The mirror has its own Git repository. Last published source commit:
6466c02d5fde6a78152399e12fe45c0ca48ea816
Published deployment:
appgdep_6b03526dcef481919d5981866f396930

Its local files/out may contain an uncommitted newer v3 export. Inspect status before syncing. Do not assume mirror files, output and published version are identical.

The mirror uses a static-export adaptation:
- next.config.ts output: export, images unoptimized.
- npm build uses next build --webpack because a node_modules junction outside the mirror's Turbopack filesystem root caused an error.
- The node_modules junction points to the real worktree dependencies.
- Registration API excluded.
- Contact form replaced with a link to the actual live contact page.
- robots/sitemap marked force-static; robots disallows crawling.
- Analytics disabled.
- No runtime secrets copied.

When updating review hosting, reuse the project identity and existing owner-private audience. Do not create another Site or silently change access to public. Use its supported source-sync/package/save/deploy workflow and fresh credentials. No credentials are stored in this prompt.

Sites skill:
C:/Users/pkshi/.codex/plugins/cache/openai-curated-remote/sites/1.1.7/skills/sites/SKILL.md

Vercel GitHub previews previously failed with "Deployment rate limited — retry in 24 hours." Check current state rather than assuming the limit remains or expired. No upgrade is authorized.

A public local tunnel was REJECTED by automatic approval policy and was not started. Do not try to circumvent that rejection with another binary/shell. A hosted copy is the safer review approach.

NEVER hand the phone user localhost as the review deliverable. A review URL should remain accessible without this computer staying online.

## 9. Required workflow and acceptance

1. Inspect both concept images and the actual source/reference pages.
2. Identify what to reuse and what to replace. Produce a small working continuous sequence that looks convincing before expanding it.
3. Compose around the actual person, text and photographs. Finish the opening and a mid-scroll transition at laptop and phone widths before declaring the design direction implemented.
4. Complete the full prism -> selection -> slit -> field -> detector journey in the same visual world.
5. Validate each settled pose AND intermediate positions. The biggest prior mistakes were visible between anchors.
6. Check 1440px laptop, a narrower desktop/tablet width, 390px phone and 320px narrow phone. Check actual source-photo crops, native touch scroll, menu layering, no horizontal overflow, readable copy, no light obscuring text, no clipped apparatus and a clear completion payoff.
7. Check pause/reduced motion and a thoughtful non-WebGL fallback. Cap GPU work, avoid unnecessary contexts and stop hidden/offscreen rendering. Do not claim real Safari/GPU testing unless actually performed.
8. Stop any production next start process before rebuilding its .next. Run npm run build, npx tsc --noEmit, npm run lint, meaningful existing physics tests and git diff --check. Do not add useless tests mirroring CSS implementation.
9. Save honest visual comparison evidence. Correct major differences from the concept before handoff; document intentional physics corrections and limitations. Do not mark a failed aesthetic review as passed because compilation succeeded.
10. Publish a fresh stable review copy, verify access and rendering, give the owner the URL and actual implementation screenshots. Keep the primary domain unchanged until approval.

Do not keep asking for confirmation of ordinary reversible implementation choices; the owner has authorized the redesign. Only ask for genuinely missing information or consequential approval outside this scope.

Start by inspecting the concept images and current files, then implement a materially better experience.
