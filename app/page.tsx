import "./light-journey.css";
import { LightJourney3D } from "@/components/site/light-journey-3d";
import { SpectrumScroll } from "@/components/site/spectrum-scroll";

export default function Home() {
  return (
    <>
      <SpectrumScroll />
      <LightJourney3D />
    </>
  );
}
