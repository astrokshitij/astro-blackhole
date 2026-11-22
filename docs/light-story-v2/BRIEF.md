# Follow the light. Complete the pattern.

Design research and storyboard, 23 November 2026. This is a proposal for review, not a finished 3D implementation. Production publication still requires Kshitij's approval.

## What changed in the brief

The owner rejected the apparatus-heavy preview. The new direction is one continuous, beautiful optical journey: white beam → rotating prism → selected colour → two slits → interference → individual detections and their probability distribution. Personal content and real photographs remain the purpose of the homepage. The request now is to find reusable source first and make a storyboard before another homepage build.

## Design decision

Use a single optical world and a camera that follows a continuous path through it. An object leaving a shot must be the same object entering the next shot. No crossfade that pretends a new photograph is the next camera position. Keep the original obsidian, pearl, Jost and restrained gold language. Colours belong to the light. Remove the separate photoelectric experiment from this proposed story.

The desired completion loop is a design hypothesis, not a claim about every visitor's psychology. The opening promises a pattern to uncover. Following the same beam provides visible progress. At the detector, an initially incomplete scatter of arrivals becomes a recognisable interference pattern. The final invitation leads to Kshitij's work. No quiz, mandatory drag, waiting gate or requirement to complete the animation before navigating.

## Six scenes and transitions

| Scene | Camera and visual | Personal content | Interaction and handoff |
| --- | --- | --- | --- |
| 01 / Arrival, 0–12% | Low three-quarter view. A white beam enters a substantial, clear glass prism. Preserve the original hero atmosphere. | Original universe headline, Kshitij's name and a large real portrait. One sentence about his work; Watch / Explore links. | A quiet invitation to follow the light. The prism remains the anchor when the visitor scrolls. |
| 02 / Reveal, 12–27% | Small rotation of the same prism. Resolve refraction through both faces, then a continuous spectral fan. | Brief background: MSc Physics, astrophysics and cosmology, curiosity that connects his work. Keep the portrait present through the move. | Scroll performs the rotation automatically. Optional pointer/drag or keyboard adjustment adds agency without blocking progress. |
| 03 / Follow, 27–42% | Track along one green band. A visible spectral aperture selects a narrow band; spatial filtering and collimation prepare coherent illumination over both slits. Other wavelengths stop at the mask. | A prominent speaking photograph and communication work, with a YouTube/talks link. | Other colours recede because they are filtered, not because wavelengths turn into green. The green beam leads out toward the slit plate. |
| 04 / Two paths, 42–62% | Orbit just far enough to reveal exactly two parallel slits. Overlapping wave-amplitude surfaces lead to the same distant detector. | Research photograph, co-authored singularity work and the research link. Approx. 25–35 words on screen at a time. | Geometry, waves and detector stay linked. A single optional slit-spacing control belongs in an expandable experiment drawer, not over the headline or photograph. |
| 05 / Look closer, 62–82% | Push into that detector. Switch explicitly to a low-flux counting view. Sparse discrete absorbed-photon events appear at screen coordinates. | Writing and investigation. The Sayana/speed-of-light essay is a natural featured link. A real desk photograph supports the process. | Scroll reveals increasingly large prefixes of one deterministic seeded detection run. An optional exposure button can play the same sequence. This is the unfinished pattern the visitor can complete. |
| 06 / Pattern revealed, 82–100% | More detection events build the same interference distribution. A labelled probability overlay can explain the apparent fuzziness. Settle the camera; retain the completed pattern as context. | Product/AI work, selected projects, a generous personal portrait and a clear contact invitation. Existing employer figures require review before reuse. | Finish on “Research. Stories. Things I build.” and working project/contact links. Optional replay; ordinary scrolling continues into the work. No additional unrelated experiment. |

Percentages refer to the cinematic sequence, not the full site's total height. Tune against reading time, not a fixed ten-screen target. Initial pacing target: approximately 5–7 comfortable viewport lengths on desktop, 6–8 on phone, to be validated in a motion proof.

## Physics that constrains the visual

- White illumination is broadband. Rotating the prism changes ray directions and the dispersion geometry; it does not change a photon's frequency. Use Snell's law at both faces with a wavelength-dependent refractive index. Disclose any exaggerated separation.
- Selecting a narrow spectral band alone is not a blanket guarantee of spatial coherence. The scene includes a spatial filter and collimating optics, with path difference inside the coherence length. The artwork's single lens is a schematic placeholder for that preparation, not an approved optical engineering drawing.
- Coherent illumination must cover both slits. After the plate, show interfering field/amplitude contributions, not two streams of tiny balls. Vertical slits produce fringes varying horizontally across the detector.
- The detector pattern must include the single-slit diffraction envelope, not equal-strength infinite stripes. Baseline proposal: λ = 530 nm, slit width 35 μm, separation 180 μm, L = 1 m. In the far field, adjacent bright fringes are approximately λL/d = 2.94 mm apart, with the first envelope zero near λL/a = 15.14 mm. A larger detector crop than the previous ±9 mm view can show the envelope clearly.
- The classical intensity view and photon counting view describe the same geometry but different illumination/readout regimes. Make that change explicit. A dim coherent source is not a claim to a heralded pure single-photon source.
- Discrete events sample the probability distribution. The probability surface is explanatory, not glowing matter, measured photon trajectories, or photons emerging from a detector. A detected photon is absorbed.
- An optional path-marker comparison must start a fresh run and remove the interference cross term while keeping single-slit diffraction. Human consciousness does not trigger the effect. Omit this control from the main sequence if it makes the story less clear.
- Beam glow represents scattering in the medium; wave speed and dimensions are schematic. The generated storyboard establishes mood and shot order only. Computed geometry and intensity have final authority.

Primary grounding: [Feynman, probability amplitudes](https://www.feynmanlectures.caltech.edu/III_03.html), [Waterloo IQC, quantum mechanics and single-photon pattern buildup](https://uwaterloo.ca/institute-for-quantum-computing/outreach/quantum-101/quantum-mechanics), [Adamini's source and explicit classical-model limits](https://github.com/nicolasadamini/young-double-slit).

## Reusable source shortlist

These are components to combine and adapt. No verified ready-made template supplies this complete personal site, correct optics, continuous camera choreography and phone optimisation with zero integration work.

### 1. Poimandres prism example: rendering components

- [Source](https://github.com/pmndrs/examples/tree/main/examples/nextjs-prism), [live demo](https://pmndrs.github.io/examples/nextjs-prism/), [MIT licence](https://github.com/pmndrs/examples/blob/main/LICENSE).
- Inspected App.tsx, util.ts, Prism.tsx, the component directory and metadata. Live demo opened and interacted with in the browser. It is pointer-driven and initially nearly dark, which is a reason to give our homepage a finished autonomous default state.
- Reuse candidates: Prism, Beam, Reflect, Rainbow and Flare components; transmission/glass treatment and beam hit handling.
- Do not reuse the physics unchanged: App.tsx multiplies a refraction angle by 6, and its util defaults to IOR 2.5. It is a visual example, not a calibrated two-face dispersive optical solver. Tune bloom sharply down from the demo and retain our physically explicit ray model. Check model/font provenance before importing associated assets.
- Inspected repository commit: `541599ac5ad913de85796403c1c6927ada3b303c`. App.tsx blob: `b44128d9ac2a9a23543c17daa9a1020b7aa34905`.

### 2. Nicolas Adamini's Young double slit: wave-field shader

- [Source](https://github.com/nicolasadamini/young-double-slit), [minimal source](https://github.com/nicolasadamini/young-double-slit/blob/main/minimal.html), [MIT licence](https://github.com/nicolasadamini/young-double-slit/blob/main/LICENSE).
- Inspected README, minimal.html shader and licence. It sums finite-slit sub-sources with complex amplitudes, uses wavelength in metres correctly, and exposes polarisation overlap. Its own documentation explicitly says it is classical wave optics, with no photon detection or collapse model.
- Reuse candidate: the finite-aperture wave-field shader/phasor structure for the plane between slit plate and screen. Our existing tested detector distribution can supply the low-cost far-field readout and seeded detections.
- Adaptation required: replace the lab control panel with the cinematic stage, preserve the physical interpretation, limit shader samples/resolution on phone, benchmark cost before choosing full-screen fields. Source reviewed; live integration and physical-phone performance are not tested.
- Inspected commit: `80b2f1fabc63022494749d209191d0adb37abca8`. minimal.html blob: `9703c6e27d3cb1bdd8b0f04e5acf5d9e0d96e0b5`.

### 3. 14islands scroll rig and lens tutorial: HTML, photos and WebGL together

- [Library](https://github.com/14islands/r3f-scroll-rig), [tutorial source](https://github.com/14islands/codrops-scroll-rig-tutorial), [tutorial MIT licence](https://github.com/14islands/codrops-scroll-rig-tutorial/blob/main/LICENSE).
- Inspected App.jsx and Image.jsx. The useful pattern is one GlobalCanvas that tracks real responsive image/HTML rectangles, with normal content fallback. This directly addresses photos becoming tiny decorative add-ons.
- Reuse candidates: tracked image placement, restrained photo parallax and progressive enhancement. Do not put all accessible copy into a canvas simply to reproduce the tutorial's full-page lens effect.
- The tutorial is a React 18 / Fiber 8 project. Our website is React 19. The library declares broader minimum peer ranges, but that is not proof of compatibility. Port a small example into a React 19/Fiber 9 proof before adopting the full dependency. Preserve native phone scrolling. The repository LICENSE says MIT while its package.json says ISC; retain the actual licence text and clarify the metadata if distributing the library.
- Tutorial commit: `f903c1ed917bf1c2f8a351aea54f1045db6fc129`. Image.jsx blob: `f1ef22b1cc0da870b188d00fbf4ee57a1d54ca55`.

### 4. Drei / React Three Fiber: supported building blocks

- [Drei](https://github.com/pmndrs/drei), [React Three Fiber compatibility guidance](https://r3f.docs.pmnd.rs/getting-started/introduction), [ScrollControls source](https://github.com/pmndrs/drei/blob/master/src/web/ScrollControls.tsx).
- Drei source is MIT. Its inspected package peers target React 19 / Fiber 9, matching the website's React generation. Useful helpers include transmission materials, adaptive rendering and camera/scroll helpers. Choose one scroll owner and one scene timeline, rather than mixing independently damped systems.
- Prefer a native-document scroll integration for this personal homepage. ScrollControls is a reference/alternative, not an instruction to introduce a nested scrolling container.

## References that are not free drop-in source

- [Lumette Relay](https://lumette.ai/kits/relay): live hero and several scroll stages inspected. Strong reference for one beam, shared scene coordinates and a clear ending. It is a commercially licensed kit, not a verified public open-source repository. The listing describes a 2D optical bench, so do not assume arbitrary free rotation is supported by its source. No purchase or kit download was made.
- [Lumette Fieldmark](https://lumette.ai/kits/fieldmark): live hero inspected. Strong reference for photographic scale, foreground depth and a single narrative environment. Its listing describes photo projection onto a mesh and depth maps; its supplied people-free generated photography is not a replacement for Kshitij's real photographs. No purchase or kit download was made.
- Both Lumette listings say their real-phone Safari testing is incomplete. They establish visual references, not a Safari performance guarantee for our site.

## Candidates not selected as the physics base

- [Quantum Diffraction Simulator](https://github.com/sofianebeloucif/Quantum-Diffraction-Simulator): MIT, but inspected js/shaders.js computes `lambdaM = lambda * 1e-6` while README/UI use nanometres. That conversion should be 1e-9 for metres. The screen coordinates are also visually scaled. Its README still lists mobile touch and 3D propagation as future work. Useful secondary visual reference; not a physics-correct drop-in engine without correction and calibration.
- [Nicky Case's double-slit](https://github.com/ncase/double-slit): README declares code/art CC0. Inspected quantum.js. It is a compact 2D phasor teaching sketch rather than a cinematic 3D website or a photon-counting model. A useful learning reference, but Adamini's finite-aperture shader is the closer fit.

## Mobile and accessibility direction

- Compose for 390px Safari first. One persistent optical view, paired with one readable personal content beat at a time. Photos receive their own proper editorial space; optics never sit behind body copy.
- Use limited prism rotation on touch so vertical gestures still scroll. A tap or labelled keyboard control can perform the optional interaction. Do not make dragging mandatory.
- Pause, reduced motion and direct Work/About/Writing links remain available. Reduced motion shows the six settled states, with all personal content available.
- Render on input/scroll and briefly while state settles. Cap pixel ratio, use a lower glass tier on phones, limit wave samples, stop offscreen work, avoid multiple WebGL contexts. These are implementation targets, not measured performance claims.
- Before another full homepage build, prove three linked shots on an actual iPhone: rotating prism → selected coherent green illumination → two-slit field. If clear glass, continuity or frame pacing fails, fix that proof before adding more scenes.

## Proposed implementation order

1. Owner reviews the storyboard, content placement and aesthetic direction.
2. Build a small isolated motion proof with the reusable modules above and real photos. Demonstrate the continuous camera move, not another crossfade of apparatus images.
3. Validate iPhone Safari, desktop, reduced motion, WebGL fallback, touch scrolling, content readability and resource use.
4. Extend the same world through detector buildup. Integrate the personal work sections and content links.
5. Publish another shareable preview. Production remains unchanged until owner approval.

Generated visual: built-in Image Gen, one six-panel art-direction storyboard, originals/storyboard-six-scenes.png. The exact prompt is storyboard-prompt.txt. Generated images are concept art, not evidence of an implemented 3D scene.
