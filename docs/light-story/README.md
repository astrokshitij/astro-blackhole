# Personal story, carried by light

Review preview of astrokshitij.com. Production changes require the owner's approval.

## Editorial sequence

1. Curiosity: the existing atmospheric prism opens on Kshitij's identity, portrait and invitation to explore his work.
2. Communication: a coherent-light double-slit scene sits beside his speaking photograph, communication work, audience reach and YouTube link.
3. Investigation: the camera moves toward the same detection screen. Individual events build a pattern beside his research photograph, writing and research links.
4. Building: a clearly separate photoelectric experiment accompanies his product and AI work and desk photograph.
5. The person and work: a large portrait, short personal introduction, selected projects, featured essay and contact invitation complete the page.

Main headings are about Kshitij. Physics explanations are optional supporting details. All photos are existing real owner photographs. The new apparatus images contain no people.

## Visual correction and implementation

The initial fully modelled Three.js apparatus was rejected as cartoonish and less aesthetic than the live website. It is not the final implementation. The current preview retains the original prism shader unchanged. Later scenes use generated photographic apparatus illustrations, a scroll-driven Three.js camera, and live calculated wave/pattern/detection overlays. This is a hybrid presentation with depth and camera movement, not a claim that every piece of hardware is a freely orbitable 3D model.

The apparatus imagery establishes mood and approximate geometry. It is not to scale. In particular, changing the simulated slit-separation parameter changes the calculated pattern; the photographic slit plate is schematic and does not physically reconfigure. Screen coordinates are mapped onto the photographed detector to keep the overlays attached through camera moves. Wavefront drawings are schematic. The statistical intensity and detection distributions use physical parameters independently of the image geometry.

## Physics

- Interference includes the finite single-slit diffraction envelope and the two-slit cosine factor, at 530 nm, slit width 35 micrometres and a 1 m screen distance. The screen spans ±9 mm.
- Photon positions are deterministic random samples from a normalized numerical CDF of that intensity. Their count is tied to scroll progress. They are detection events, not literal visible photon trajectories.
- Switching which-path recording begins a fresh run and samples from the incoherent sum of two single-slit intensities. It does not rewrite earlier events or attribute a physical change to human consciousness.
- The photoelectric scene is a separate experiment and an illustrative surface with work function 2.5 eV. Photon energy is hc/lambda; displayed electron energy is the maximum available kinetic energy. Below threshold there are no emitted electron markers. This assumes the ordinary single-photon regime, not intense multiphoton photoemission.
- The original prism shader uses Snell's law and magnified Cauchy dispersion. Its optional note discloses the visual magnification and visible-beam scattering convention.

Scientific grounding: [single-photon interference buildup experiment](https://arxiv.org/abs/1304.4943), [Feynman on probability amplitudes and distinguishable alternatives](https://www.feynmanlectures.caltech.edu/III_03.html), [APS on the photoelectric effect](https://physics.aps.org/articles/v18/15).

## References consulted

- User-supplied 3D Updated Guide.pdf: camera cues, foreground HTML, restrained finish, and adaptive quality.
- [14islands scroll rig](https://github.com/14islands/r3f-scroll-rig) and its [progressively enhanced WebGL tutorial](https://github.com/14islands/codrops-scroll-rig-tutorial): reference for pairing HTML content and visual scenes. No source code copied and no scroll-rig dependency installed.
- [Three.js renderer documentation](https://threejs.org/docs/pages/WebGLRenderer.html).

## Assets and review

The built-in Image Gen tool produced double-slit-studio.png and photoelectric-studio.png. The original project copies are preserved under docs/light-story/originals; exact prompts and attached reference paths are stored alongside this document. Optimized WebP copies under public/images/light-story total 88,870 bytes and are the versions loaded by the page. Initial concept studies and the selected personal-story revision are in E:/github/astrokshitij/design/light-story.

The page keeps native scrolling, link navigation, keyboard-operated controls, labelled ranges, a path-recording switch, pause controls, reduced-motion preference handling, and a photograph fallback if the later WebGL stage fails. Performance on a physical phone remains a separate verification task; viewport checks are not a substitute for that measurement.

Prepared on codex/home-light-story for an isolated Vercel preview so the owner can review on a phone. Production publication remains subject to owner approval.
