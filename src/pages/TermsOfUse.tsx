import HeroSection from "../components/shared/HeroSection"
import vida from "../../public/assets/videos/talantwo.mp4"
import blockbasa from "../../public/assets/images/bseven-white.png"

const TermsOfUse = () => {
  return (
    <>
     <HeroSection
         logoSrc={blockbasa}
         videoSrc={vida}
        posterSrc="/assets/hero-poster.jpg"
        eyebrow="Kling AI · Video 3.0"
        collapsedHeight="64vh"
        slideHoldMs={5200}
        slideFadeMs={1000}
        slides={[
          {
            headline: "Turn a single sentence into cinema.",
            subhead:
              "Generate multi-shot, native-audio video from text or a single image — up to 4K, up to 15 seconds.",
          },
          {
            headline: "Every frame, exactly as you imagined it.",
            subhead:
              "Element Lock keeps faces, props, and scenes stable across the whole sequence.",
          },
          {
            headline: "One take. Any language.",
            subhead: "Native lip-sync generates localized dialogue straight from your script.",
          },
        ]}
        primaryCtaLabel="Create Now"
        secondaryCtaLabel="Watch Showcase"
        onPrimaryCta={() => console.log("primary cta")}
        onSecondaryCta={() => console.log("secondary cta")}
      />

      {/* Whatever comes next becomes visible as soon as the hero settles */}
      <section style={{ minHeight: "100vh", background: "#0c0c0f" }}>
        <h2 style={{ color: "#fff", padding: "80px 56px" }}>Next section</h2>
      </section>
    </>
  )
}

export default TermsOfUse