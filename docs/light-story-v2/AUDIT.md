# Rejected preview: visual audit

23 November 2026. Current hosted preview examined directly in this run. No claim of aesthetic acceptance or accessibility certification.

Overall: rejected. The original prism atmosphere survives, but the page does not deliver a coherent, personally centred visual journey. The previous design-qa.md passing verdict did not adequately evaluate continuous scroll states.

1. Hero, mixed: qa/review-v2/01-desktop-hero.jpg. Good atmosphere, but the portrait is a tiny avatar and bottom controls add unrelated interface weight.
2. Communication, poor: 02-desktop-speaking.jpg. Large apparatus dominates, speaking photo is small and low in the frame, parameter controls compete with fixed controls.
3. Transition, poor: 03-desktop-transition.jpg. Controls float over the detector, while prior and next content occupy awkward fragments of the screen. The camera move does not make a clear destination promise.
4. Research, poor: 04-desktop-research.jpg. The enlarged detector is mostly empty at the default detection count. The real research photo gets far less emphasis than a nearly blank apparatus panel. There is no compelling completion payoff.
5. Phone communication, poor: 10-mobile-speaking.jpg, verified 390 x 844 CSS viewport. Long text arrives ahead of the visual. Speaking photo and apparatus occupy the same crowded region, followed by more control text.
6. Phone transition, poor: 11-mobile-transition.jpg. A large dark gap separates controls from the next chapter, then the apparatus sits behind the research heading/body. Readability and visual continuity both suffer.

The earlier attempted phone research capture 05-mobile-research.jpg is rejected as evidence: its viewport remained desktop. The 390px captures above were verified against innerWidth and innerHeight before use. Desktop captures in this run include 1280 x 720 CSS views as well as the reference 1440 x 900 captures; do not label every saved frame as 1440px.

Confirmed source comparison: Lumette Relay's live hero and scroll stages, and Fieldmark's live hero were inspected and captured in 06–09. Poimandres prism demo was opened, interacted with and captured in 12. They are references, not proof that our proposed implementation works on a physical phone.

Accessibility risks visible here: text over variable light/imagery, small low-emphasis secondary controls, unclear separation between optional experiments and primary personal content, and substantial motion through long sections. Keyboard and screen-reader behaviour, real iPhone GPU performance and full WCAG conformance are outside this visual audit.

Correction direction: maintain one scene/world and one timeline, make owner photos large, reserve a clear text region, move optional physics controls into a dedicated drawer, and finish with a completed detection pattern and personal work invitation. See BRIEF.md and the review storyboard.
