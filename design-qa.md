# Homepage design QA

final result: passed

## Reference and intent

Selected visual reference: E:/github/astrokshitij/design/light-story/01-follow-the-beam.png.
Revised personal-content reference: E:/github/astrokshitij/design/light-story/04-personal-story-selected.png.
Original atmospheric hero reference: E:/github/astrokshitij/audits/homepage-2026-11-22/01-desktop-hero.jpg.

The owner's later instructions take precedence over the mock: personal headings and photographs must remain prominent, and full 3D geometry must not degrade the original aesthetic.

## Comparison history

1. Initial screenshots qa/01-hero-initial.jpg and qa/02-communication-initial.jpg exposed P1 visual regressions: a bright gray table and crude hardware replaced the dark atmospheric finish; the speaking photo cropped the head; the detector was offscreen. These findings blocked handoff.
2. Restored original prism shader, corrected photo crop and camera framing. qa/03-hero-restored.jpg and qa/04-communication-dark.jpg showed that simply darkening basic geometry was insufficient. The hardware presentation remained P1.
3. Replaced basic hardware with photographic generated apparatus assets and preserved calculated overlays. qa/05-communication-cinematic.jpg, qa/06-detections-cinematic.jpg and qa/08-building-cinematic.jpg show the revised treatment and real personal photos. The change is intentional and documented as hybrid imagery plus live optics, not a full geometrical apparatus simulation.
4. Mobile checks found P2 missing prism visibility and excessive stage spacing. Moved the mobile prism focus, reduced panel spacing, adjusted camera framing, and moved pause controls into each mobile section. qa/12-mobile-hero-revised.jpg and qa/13-mobile-speaking.jpg show the corrected prism and photo balance. The production 320px capture, qa/final-03-mobile-320.jpg, confirms the final frame and accessible pause control.

## Required fidelity surfaces

- Typography: existing Jost, Geist and mono fonts retained. Large headings stay about the owner. Wrapping and readability checked at 1440px and 320px, with an additional 390px development check. No clipping of primary headings or actions.
- Spacing: desktop text and imagery use the existing site width. Mobile stages shortened after review. No horizontal overflow at the tested widths; controls can be reached with native scrolling.
- Colours: near-black, warm white and amber retained. Spectral and green light stays in the supporting experiment scenes.
- Image quality: real owner photographs are preserved; speaking photo crop corrected. Apparatus assets match the selected photographic direction rather than substitute box models.
- Content: personal biography, speaking, research, writing, product work and contact remain central. Optional details distinguish schematic artwork from calculated physical quantities.

## Functional checks completed in development

- Native scroll and chapter links changed the camera stage.
- Slit-spacing range responded to keyboard End and updated its value.
- Path-recording switch started Run 2 and reset the detection count, with a broad non-interfering distribution after further scroll.
- Wavelength 700 nm showed 1.77 eV and no photoemission; 380 nm showed 3.26 eV and photoemission.
- No horizontal overflow at 390px or 320px in measured document bounds.
- Four independent physics tests plus Snell helper test passed. TypeScript and lint passed before final refinements.

## Final production verification

- npm run build passed, generating all 18 routes. npx tsc --noEmit, npm run lint, node --test scripts/light-physics.test.mjs and git diff --check passed. The Node test runner's module-type warning is non-fatal and does not occur in the browser.
- Production browser warning/error log was empty after inspecting the story and personal sections. The development-only React eval warning and Next dev badge are absent from production.
- 1440 x 900 CSS viewport: qa/final-01-desktop-hero.jpg, qa/final-02-desktop-speaking.jpg, qa/final-05-personal-portrait.jpg, qa/final-06-photoelectric-threshold.jpg. Native screenshot files are 1425 x 891 pixels as captured by the browser provider. No manual reconstruction or fabricated screenshots.
- 320 x 740 CSS viewport: qa/final-03-mobile-320.jpg is 305 x 705 native pixels; the document client width and scroll width both measured 305px. The provider excludes the scrollbar and uses its native capture scaling. qa/final-04-mobile-menu.jpg shows the open dialog.
- Mobile Escape closed the menu and returned focus to the trigger. The pause control changed to Resume motion and its pressed state updated across scenes.
- Production slit-spacing keyboard action changed 180 to 185 micrometres. Production path-recording switch started a fresh Run 2 and reset to 80 detections. Production wavelength range at 700 nm displayed 1.77 eV, no emitted markers and Below emission threshold; returned to 450 nm for review.
- The Work action reached the actual selected-work section. The large owner portrait and biography remain prominent before that grid. Research, article, product and social links preserve existing destinations; no enquiry was sent.

## Combined comparison evidence

- qa/comparison-hero.png places the original live hero and the production hero together in one image. Both sources are native 1425 x 891 captures of a 1440 x 900 CSS viewport, uniformly normalized to 720 x 450 panels for side-by-side review. Typography, palette, original prism treatment, text clearance and main actions were inspected together.
- qa/comparison-speaking.png places the corresponding communication part of the selected personal-story study next to the final production frame. The 748 x 2103 reference is a long-page concept rather than an exact browser viewport; the crop x0..748, y480..948 was normalized to 720 x 450 alongside the uniformly normalized 1425 x 891 production frame. This is a composition comparison, not a claim of pixel-identical viewport fidelity.
- Focused checks used the full-resolution production screenshots for the speaking photo's face/crop, optional details, range control, photoelectric status, and 320px menu and actions. The combined speaking view explicitly shows the user-requested replacement of the concept's optical inset with a real speaking photograph.

## Accepted adaptations and remaining polish

- The original live prism renderer takes precedence over the selected mock's different glass rendering, following the owner's aesthetic correction. It is retained unchanged; only its placement and lifecycle are controlled by the new story.
- The chapter titles, photographs, personal sections and work links follow the owner's personal-website correction. The mock's experiment-heavy information hierarchy is intentionally changed.
- The photographic hardware is not a freely orbitable model. A 3D camera and live calculated overlays provide the transitions and interaction. This is an explicit, documented visual-quality choice rather than an undisclosed simulation claim.
- The quiet numbered chapter rail at 1440px avoids covering the text or detector. Names remain accessible; wider desktop layouts show the full names.
- P3: the optional physics summary can share the prism's atmospheric glow at the smallest width. Primary copy and actions remain clear. More elaborate real-device camera choreography and focus refinements are possible in a later iteration.
- No actionable P0/P1/P2 findings remain in the verified local preview. Final aesthetic acceptance remains with the owner.

## Limits

Real-device GPU smoothness, thermal load, full screen-reader testing, and forced WebGL-loss behavior are not verified. Do not interpret screenshots as proof of these properties.
