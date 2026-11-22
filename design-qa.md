# Live homepage review, 23 November 2026

Status: working interactive preview for owner review. Production approval and aesthetic acceptance are pending. This replaces the rejected hybrid-image implementation. Its historical audit remains in docs/light-story-v2/AUDIT.md.

## Live behaviour

The homepage uses one Three.js scene and a continuous native-scroll timeline. Prism, selector, lens, double-slit plate and detector are geometry. No apparatus photograph or storyboard texture is used by the renderer. Six HTML chapters retain the owner's real photographs and existing destinations.

## Reference comparison

Reference: docs/light-story-v2/originals/storyboard-six-scenes.png. This is a six-frame lighting/choreography concept, not a viewport-specific page mock.

The local production captures in qa/live-3d/ were inspected against the full storyboard. Desktop: 1440 x 900 CSS pixels. Phone: 320 x 740, with additional 390 x 844 development checks. Browser captures exclude the scrollbar and may use native scaling.

- Typography/content: existing Jost/Geist, warm personal headings and real owner photos remain central. Desktop content has a reserved left column; mobile content flows below a separate pinned scene. No text sits over the moving field.
- Spacing: all six anchors and intermediate scroll states were inspected. The document has no horizontal overflow at 320/390 CSS pixels. A separate visual band adapts the concept's full-bleed composition to readable personal content.
- Colour: obsidian, pearl and gold remain the page palette. Spectral/green light belongs to the experiment. All viewports omit the bloom pass after reproducing and fixing a blank-frame failure at multiple sizes.
- Images: portraits, speaking and research photographs are substantially larger than in the rejected version. The portrait crop includes the face. Writing and product chapters reuse an existing desk photograph.
- Materials: the geometric prism has weaker face reflections than the photographic storyboard, and the hardware reads more matte. These are visible fidelity gaps, not proof of a finished photographic look. Aesthetic review remains pending; this is not a production sign-off.
- Scientific imagery: the concept's smooth final hump is replaced by a finite-slit interference distribution and its probability curve. This is an intentional physical correction. Travelling waves remain schematic; the detector uses SI dimensions.

## Corrections during live testing

- Reserved canvas pixels so personal copy/photos never sit underneath the moving field.
- Corrected final camera framing and removed the foreground slit assembly in a detector cutaway. It previously blocked the close-up.
- Removed the bloom post-effect after reproducing blank research frames at phone and 1280px desktop sizes. Shader-based beam lighting remains.
- Corrected pointer interception by the closed physics-details container.
- Made exposure replay reset on each click and rebuild a prefix of detection events.
- Preserved vertical touch scrolling during horizontal prism interaction.
- Stopped repeated reduced-motion frames for fractional scroll values. Context loss disposes the scene and selects the supplied-photo fallback.

## Checks

- npm run build passed, all 18 routes generated.
- npx tsc --noEmit, npm run lint and git diff --check passed.
- Eight Node physics tests passed; their Node-only module-type warning is non-fatal.
- Native scrolling changed intermediate wave/camera states and arriving detector fringes.
- Chapter controls reached their corresponding personal sections.
- Prism keyboard input changed its range and calculated ray angle.
- Pause became Resume motion with aria-pressed=true.
- Exposure click reset the count; another click reset it again. The pattern completed.
- Mobile navigation opened above the pinned scene at 320px.

## Limits

Physical iPhone Safari/GPU performance, thermal load, full screen-reader behaviour and forced WebGL-loss recovery remain untested. Reduced-motion behaviour was reviewed in code, not forced through browser emulation. Hosted access is verified separately once the deployment is ready. This is reviewable live work, not aesthetic acceptance.
