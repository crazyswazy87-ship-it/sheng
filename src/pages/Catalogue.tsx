import { useEffect, useRef } from "react";
import { useScrollVideo } from "../hooks/useScrollVideo";
import skyfall from "../../public/assets/videos/skyfall.mp4"


export default function Catalogue() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useScrollVideo(sectionRef, videoRef);

  

  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    const onLoaded = () => {
      video.pause();
      video.currentTime = 0;
    };

    video.addEventListener("loadedmetadata", onLoaded);

    return () => {
      video.removeEventListener("loadedmetadata", onLoaded);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="hero-section"
    >
      <div className="hero-sticky">

        <video
          ref={videoRef}
          className="hero-video"
          preload="auto"
          muted
          playsInline
          preload="auto"
          src={skyfall}
        />

        <div className="hero-overlay">

          <div className="hero-top">
            <p>FERNWEH</p>
          </div>

          <div className="hero-center">
            <h1>
              Escape
              <br />
              Into Nature
            </h1>
          </div>

          <div className="hero-bottom">
            Scroll
          </div>

        </div>

      </div>
    </section>
  );
}