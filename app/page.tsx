import "./light-journey.css";
import { LightJourneyStage } from "@/components/site/light-journey-stage";
import { SpectrumScroll } from "@/components/site/spectrum-scroll";

export default function Home() {
  return (
    <>
      <SpectrumScroll />
      <LightJourneyStage />
    </>
  );
}
