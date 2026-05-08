"use client";

import { useEffect, useRef, useState } from "react";
import IntroFlowField from "./IntroFlowField";

type IntroSceneProps = {
  onComplete: () => void;
};

function clamp01(v: number) {
  return Math.min(1, Math.max(0, v));
}

function range(value: number, start: number, end: number) {
  if (end <= start) return value >= end ? 1 : 0;
  return clamp01((value - start) / (end - start));
}

function fadeWindow(
  value: number,
  fadeInStart: number,
  fadeInEnd: number,
  fadeOutStart: number,
  fadeOutEnd: number
) {
  const fadeIn = range(value, fadeInStart, fadeInEnd);
  const fadeOut = 1 - range(value, fadeOutStart, fadeOutEnd);
  return clamp01(fadeIn * fadeOut);
}

function layerMotion(
  progress: number,
  enterStart: number,
  enterEnd: number,
  exitStart: number,
  exitEnd: number,
  enterY: number,
  exitY: number,
  enterBlur: number,
  exitBlur: number
) {
  const enter = 1 - range(progress, enterStart, enterEnd);
  const exit = range(progress, exitStart, exitEnd);

  return {
    opacity: fadeWindow(progress, enterStart, enterEnd, exitStart, exitEnd),
    y: enterY * enter - exitY * exit,
    blur: enterBlur * enter + exitBlur * exit,
  };
}

export default function IntroScene({ onComplete }: IntroSceneProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  
  // Referencias para el seguimiento de partículas
  const titleRef = useRef<HTMLDivElement | null>(null);
  const p2Ref = useRef<HTMLParagraphElement | null>(null);
  const p3Ref = useRef<HTMLParagraphElement | null>(null);

  const [progress, setProgress] = useState(0);
  const [isEntering, setIsEntering] = useState(false); // Estado para la transición final

  const [anchors, setAnchors] = useState({
    title: { x: 0.5, y: 0.28 },
    p2: { x: 0.5, y: 0.50 },
    p3: { x: 0.5, y: 0.70 }
  });

  // Cálculo del progreso de scroll
  useEffect(() => {
    const update = () => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = Math.max(el.offsetHeight - window.innerHeight, 1);
      setProgress(clamp01(-rect.top / total));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  // Seguimiento de las posiciones de los textos para el FlowField
  useEffect(() => {
    const updateAnchor = () => {
      const getAnchor = (el: HTMLElement | null) => {
        if (!el) return { x: 0.5, y: 0.5 };
        const rect = el.getBoundingClientRect();
        return {
          x: (rect.left + rect.width / 2) / window.innerWidth,
          y: (rect.top + rect.height / 2) / window.innerHeight,
        };
      };
      setAnchors({
        title: getAnchor(titleRef.current),
        p2: getAnchor(p2Ref.current),
        p3: getAnchor(p3Ref.current),
      });
    };
    updateAnchor();
    window.addEventListener("resize", updateAnchor);
    window.addEventListener("scroll", updateAnchor, { passive: true });
    return () => {
      window.removeEventListener("resize", updateAnchor);
      window.removeEventListener("scroll", updateAnchor);
    };
  }, []);

  const handleEnter = () => {
    setIsEntering(true);
    // Esperamos 2.5s para que la luz blanca cubra todo antes de avisar al padre
    setTimeout(() => {
      onComplete();
    }, 2500);
  };

  const titleMotion = layerMotion(progress, 0.00, 0.14, 0.22, 0.40, 360, 150, 20, 8);
  const p2Motion = layerMotion(progress, 0.20, 0.40, 0.50, 0.72, 300, 130, 18, 8);
  const p3Motion = layerMotion(progress, 0.42, 0.62, 0.72, 0.92, 240, 110, 16, 8);
  const buttonMotion = layerMotion(progress, 0.78, 0.92, 2.00, 2.10, 120, 40, 10, 4);

  const titleScale = 0.965 + 0.035 * range(progress, 0.00, 0.14);
  const buttonReady = progress > 0.88;

  return (
    <section
      ref={ref}
      style={{
        position: "relative",
        minHeight: "300vh",
        background: "#000",
      }}
    >
      <div
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          overflow: "hidden",
          background: "radial-gradient(circle at 50% 24%, rgba(40,60,90,0.12), transparent 38%), #000",
        }}
      >
        <IntroFlowField progress={progress} anchors={anchors} />

        <div
          style={{
            position: "relative",
            zIndex: 2,
            height: "100%",
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "6vh 24px 10vh",
            pointerEvents: "none",
            // Si estamos entrando al Hub, desvanecemos todo el contenido DOM suavemente
            opacity: isEntering ? 0 : 1,
            transition: "opacity 1s ease-out",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 1200,
              margin: "0 auto",
              textAlign: "center",
              color: "rgba(255,255,255,0.92)",
            }}
          >
            <div
              ref={titleRef}
              style={{
                transform: `translateY(${titleMotion.y}px) scale(${titleScale})`,
                opacity: titleMotion.opacity,
                filter: `blur(${titleMotion.blur}px)`,
                willChange: "transform, opacity, filter",
              }}
            >
              <div style={{ fontSize: 12, letterSpacing: "0.32em", textTransform: "uppercase", color: "rgba(255,255,255,0.42)", marginBottom: 18 }}>
                Welcome to
              </div>
              <h1 style={{ margin: 0, fontFamily: "serif", fontWeight: 400, fontSize: "clamp(52px, 10vw, 140px)", lineHeight: 0.92, letterSpacing: "-0.04em", color: "rgba(255,255,255,0.78)", textWrap: "balance" }}>
                My Digital World
              </h1>
            </div>

            <p
              ref={p2Ref}
              style={{
                margin: "42px auto 0",
                maxWidth: 920,
                fontFamily: "serif",
                fontSize: "clamp(24px, 2.2vw, 32px)",
                lineHeight: 1.65,
                color: "rgba(255,255,255,0.58)",
                opacity: p2Motion.opacity,
                transform: `translateY(${p2Motion.y}px)`,
                filter: `blur(${p2Motion.blur}px)`,
                willChange: "transform, opacity, filter",
              }}
            >
              A digital environment built to present who I am, what I create, and how I think across web, AI, and interactive systems.
            </p>

            <p
              ref={p3Ref}
              style={{
                margin: "28px auto 0",
                maxWidth: 780,
                fontSize: 18,
                lineHeight: 1.7,
                color: "rgba(255,255,255,0.36)",
                opacity: p3Motion.opacity,
                transform: `translateY(${p3Motion.y}px)`,
                filter: `blur(${p3Motion.blur}px)`,
                willChange: "transform, opacity, filter",
              }}
            >
              Scroll a little further and enter the central hub of the portfolio.
            </p>

            {/* BOTÓN MEJORADO */}
            <div
              style={{
                marginTop: 42,
                opacity: isEntering ? 0 : buttonMotion.opacity,
                transform: isEntering 
                  ? `translateY(${buttonMotion.y + 40}px) scale(0.9)` 
                  : `translateY(${buttonMotion.y}px) scale(1)`,
                transition: "opacity 0.6s ease, transform 0.8s cubic-bezier(0.2, 0, 0, 1)",
                pointerEvents: "auto",
              }}
            >
              <button
                onClick={handleEnter}
                disabled={!buttonReady || isEntering}
                style={{
                  appearance: "none",
                  position: "relative",
                  padding: "18px 44px",
                  borderRadius: 999,
                  background: buttonReady ? "rgba(255, 255, 255, 0.08)" : "rgba(255, 255, 255, 0.02)",
                  border: "1px solid",
                  borderColor: buttonReady ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.1)",
                  color: buttonReady ? "#ffffff" : "rgba(255,255,255,0.2)",
                  fontSize: 14,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  cursor: buttonReady ? "pointer" : "default",
                  backdropFilter: "blur(15px)",
                  boxShadow: buttonReady ? "0 0 30px rgba(255,255,255,0.15)" : "none",
                  textShadow: buttonReady ? "0 0 10px rgba(255,255,255,0.5)" : "none",
                  transition: "all 0.4s ease",
                  outline: "none"
                }}
              >
                {buttonReady ? "Enter the hub" : "Keep scrolling"}
              </button>
            </div>
          </div>
        </div>

        {/* INDICADOR DE SCROLL */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            bottom: 24,
            transform: "translateX(-50%)",
            color: "rgba(255,255,255,0.28)",
            fontSize: 12,
            letterSpacing: "0.24em",
            textTransform: "uppercase",
            zIndex: 2,
            opacity: (1 - range(progress, 0.08, 0.22)) * (isEntering ? 0 : 1),
            pointerEvents: "none",
          }}
        >
          Scroll down
        </div>

        {/* === EFECTO TÚNEL DE LUZ FINAL === */}
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "radial-gradient(circle at center, #000000 0%, rgba(0,0,0,0) 70%)",
            opacity: isEntering ? 1 : 0,
            transform: isEntering ? "scale(3)" : "scale(0)",
            transition: "opacity 1s ease-in, transform 2.2s cubic-bezier(0.4, 0, 0.2, 1)",
            pointerEvents: "none",
            zIndex: 100,
            mixBlendMode: "screen",
          }}
        />
        
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "#000000",
            opacity: isEntering ? 1 : 0,
            transition: "opacity 1s ease-in",
            transitionDelay: "1.2s",
            pointerEvents: "none",
            zIndex: 101,
          }}
        />
      </div>
    </section>
  );
}