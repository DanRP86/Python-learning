"use client";

import Link from "next/link";
import {
  motion,
  AnimatePresence,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { ArrowUpRight, Mail, MapPin, ExternalLink } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

// ============================================================================
// DATOS DEL PERFIL EJECUTIVO REAL (HISTORIAL COMPLETO 8 PUESTOS)
// ============================================================================
type Section = "work" | "education" | "languages";

type AppView =
  | { type: "work"; roleIndex: number }
  | { type: "education" }
  | { type: "languages" };

type Maturity = 'Consolidated' | 'Emerging' | 'Low/Not relevant';

interface SkillSignal {
  name: string;
  maturity: Maturity;
  intensity: number;
}

interface CVRole {
  id: string;
  company: string;
  role: string;
  date: string;
  periodShort: string;
  bullets: string[];
  sidebarSummary: string;
  stack: string[];
  skills: SkillSignal[];
}

const cvProfile = {
  name: "Daniel Rubio Paniagua",
  title: "Asset Portfolio & Operations Leader",
  location: "Madrid, Spain",
  email: "d.rubio.paniagua@gmail.com",
  linkedin: "https://www.linkedin.com/in/danielrubiopaniagua",
};

const cvRoles: CVRole[] = [
  {
    id: "pmi-ref",
    company: "Philip Morris International",
    role: "Regional Manager - Real Estate & Facilities",
    date: "Nov 2024 — Present",
    periodShort: "2024 — now",
    bullets: [
      "Multi-market portfolio governance across 20+ markets and ~150 buildings (range), primarily offices, including support for asset disposals and land transactions.",
      "Focus on capex and opex governance, space optimization, standardization/harmonization, supplier performance routines, and value realization.",
      "Department-wide capex exposure of ~US$50M (function-wide), supporting prioritization, governance cadence, and delivery oversight."
    ],
    sidebarSummary: "Leadership of the asset portfolio and operations, executing multi-market governance strategies and standardizing performance at scale.",
    stack: ["Capex/Opex", "Portfolio Governance", "Vendor Perf", "Value Realization"],
    skills: [
      { name: "Process Excellence", maturity: "Consolidated", intensity: 6 },
      { name: "Data-Driven Decision Making", maturity: "Consolidated", intensity: 6 },
      { name: "Artificial Intelligence", maturity: "Emerging", intensity: 4 },
      { name: "Change Management", maturity: "Consolidated", intensity: 6 },
      { name: "Business Partnering", maturity: "Consolidated", intensity: 9 },
      { name: "Negotiation", maturity: "Consolidated", intensity: 6 },
      { name: "Portfolio Governance", maturity: "Consolidated", intensity: 9 },
      { name: "Asset Lifecycle Management", maturity: "Consolidated", intensity: 5 },
      { name: "Vendor & Supplier Management", maturity: "Consolidated", intensity: 7 },
      { name: "Cost & Value Optimization", maturity: "Consolidated", intensity: 7 },
    ]
  },
  {
    id: "pmi-fleet",
    company: "Philip Morris International",
    role: "Regional Manager - Fleet Vehicles Portfolio",
    date: "Mar 2021 — Oct 2024",
    periodShort: "2021 — 2024",
    bullets: [
      "Successfully deployed the PMI Fleet Strategy, achieving harmonization across diverse countries/regions and cost containment with effective Capex Management.",
      "Introduced over 30% electrified vehicles into the total fleet, significantly reducing emissions and enhancing sustainability.",
      "Ensured the provision of safe and reliable vehicles, prioritizing driver safety and compliance.",
      "Developed and implemented a forward-looking electrification strategy for 2030, which received executive approval."
    ],
    sidebarSummary: "Driven harmonization and performance management at scale, introducing sustainability layers across global regions.",
    stack: ["Fleet Strategy", "Sustainability", "Harmonization", "Capex Mgt"],
    skills: [
      { name: "Process Excellence", maturity: "Consolidated", intensity: 6 },
      { name: "Data-Driven Decision Making", maturity: "Consolidated", intensity: 6 },
      { name: "Artificial Intelligence", maturity: "Emerging", intensity: 2 },
      { name: "Change Management", maturity: "Consolidated", intensity: 6 },
      { name: "Business Partnering", maturity: "Consolidated", intensity: 7 },
      { name: "Negotiation", maturity: "Consolidated", intensity: 6 },
      { name: "Portfolio Governance", maturity: "Consolidated", intensity: 9 },
      { name: "Asset Lifecycle Management", maturity: "Consolidated", intensity: 6 },
      { name: "Vendor & Supplier Management", maturity: "Consolidated", intensity: 9 },
      { name: "Cost & Value Optimization", maturity: "Consolidated", intensity: 7 },
    ]
  },
  {
    id: "avis",
    company: "Avis Budget Group",
    role: "Fleet Procurement & Negotiation Mgr",
    date: "Jul 2019 — Feb 2020",
    periodShort: "2019 — 2020",
    bullets: [
      "Led procurement and negotiation for the purchase of 30,000 vehicles with major OEMs in Spain and Portugal for 2020."
    ],
    sidebarSummary: "Focused on high-volume procurement, OEM relationship management, and strict delivery control.",
    stack: ["Procurement", "OEM Negotiation", "Purchasing", "Supplier Coordination"],
    skills: [
      { name: "Process Excellence", maturity: "Emerging", intensity: 5 },
      { name: "Data-Driven Decision Making", maturity: "Consolidated", intensity: 6 },
      { name: "Artificial Intelligence", maturity: "Low/Not relevant", intensity: 0 },
      { name: "Change Management", maturity: "Emerging", intensity: 3 },
      { name: "Business Partnering", maturity: "Consolidated", intensity: 7 },
      { name: "Negotiation", maturity: "Emerging", intensity: 9 },
      { name: "Portfolio Governance", maturity: "Consolidated", intensity: 5 },
      { name: "Asset Lifecycle Management", maturity: "Consolidated", intensity: 4 },
      { name: "Vendor & Supplier Management", maturity: "Consolidated", intensity: 9 },
      { name: "Cost & Value Optimization", maturity: "Consolidated", intensity: 7 },
    ]
  },
  {
    id: "northgate",
    company: "Northgate plc",
    role: "Fleet Asset Lifecycle & Optimization Mgr",
    date: "Oct 2016 — Jun 2019",
    periodShort: "2016 — 2019",
    bullets: [
      "Fleet stock management and inventory optimization across 26 branches and 15+ vehicle categories.",
      "Prevented stock-outs and overstock situations by continuously adjusting purchase and sales levels to demand.",
      "Asset management in ERP: monitored the status of 50,000 vehicles, managing lifecycle status transitions.",
      "Managed fleet logistics movements between branches, reducing logistics cost by 60% (2017).",
      "Built a predictive statistical model for asset disposals and tracked forecasting accuracy."
    ],
    sidebarSummary: "Developed a strong data foundation through forecasting, optimization work, and predictive modeling.",
    stack: ["Stock Optimization", "Predictive Modeling", "Logistics", "Lifecycle Perf"],
    skills: [
      { name: "Process Excellence", maturity: "Emerging", intensity: 5 },
      { name: "Data-Driven Decision Making", maturity: "Consolidated", intensity: 9 },
      { name: "Artificial Intelligence", maturity: "Low/Not relevant", intensity: 0 },
      { name: "Change Management", maturity: "Emerging", intensity: 3 },
      { name: "Business Partnering", maturity: "Consolidated", intensity: 6 },
      { name: "Negotiation", maturity: "Low/Not relevant", intensity: 0 },
      { name: "Portfolio Governance", maturity: "Consolidated", intensity: 7 },
      { name: "Asset Lifecycle Management", maturity: "Consolidated", intensity: 8 },
      { name: "Vendor & Supplier Management", maturity: "Consolidated", intensity: 5 },
      { name: "Cost & Value Optimization", maturity: "Consolidated", intensity: 9 },
    ]
  },
  {
    id: "avis-opt-1",
    company: "Avis Budget Group EMEA",
    role: "Fleet Portfolio Optimization Mgr - Southern Region",
    date: "Jun 2013 — Oct 2016",
    periodShort: "2013 — 2016",
    bullets: [
      "Defined and led inventory and stock optimization and car supply planning strategy for ~50,000 cars across Italy, Spain, and Portugal.",
      "Executed purchase and sales plans, coordinating purchase orders and vehicle destination with suppliers.",
      "Led monthly fleet forecast reviews; tracked forecast accuracy; analyzed variances vs. plan.",
      "Compared residual values against external benchmarks (Eurotax) and tracked sales price evolution per model."
    ],
    sidebarSummary: "Defined and led inventory and car supply planning strategy for Southern Region.",
    stack: ["Supply Planning", "Forecast Analysis", "Residual Values", "Stock Optimization"],
    skills: [
      { name: "Process Excellence", maturity: "Emerging", intensity: 4 },
      { name: "Data-Driven Decision Making", maturity: "Consolidated", intensity: 9 },
      { name: "Artificial Intelligence", maturity: "Low/Not relevant", intensity: 0 },
      { name: "Change Management", maturity: "Emerging", intensity: 4 },
      { name: "Business Partnering", maturity: "Emerging", intensity: 4 },
      { name: "Negotiation", maturity: "Low/Not relevant", intensity: 0 },
      { name: "Portfolio Governance", maturity: "Consolidated", intensity: 7 },
      { name: "Asset Lifecycle Management", maturity: "Consolidated", intensity: 6 },
      { name: "Vendor & Supplier Management", maturity: "Consolidated", intensity: 5 },
      { name: "Cost & Value Optimization", maturity: "Consolidated", intensity: 9 },
    ]
  },
  {
    id: "avis-opt-2",
    company: "Avis Budget Group EMEA",
    role: "Fleet Portfolio Planning & Optimization Lead",
    date: "Nov 2011 — May 2013",
    periodShort: "2011 — 2013",
    bullets: [
      "Defined and led inventory and stock optimization and car supply planning strategy for ~22,000 cars across ~20 car classes in Spain.",
      "Executed purchase and sales plans, coordinating purchase orders and vehicle destination with suppliers.",
      "Main projects: Mileage cost control (Spain); Optimization software implementation (Spain)."
    ],
    sidebarSummary: "Led inventory strategy for ~22,000 cars in Spain, executing purchase and sales plans.",
    stack: ["Optimization", "Supply Chain", "Sales Control", "Mileage Cost"],
    skills: [
      { name: "Process Excellence", maturity: "Emerging", intensity: 4 },
      { name: "Data-Driven Decision Making", maturity: "Consolidated", intensity: 9 },
      { name: "Artificial Intelligence", maturity: "Low/Not relevant", intensity: 0 },
      { name: "Change Management", maturity: "Low/Not relevant", intensity: 0 },
      { name: "Business Partnering", maturity: "Emerging", intensity: 4 },
      { name: "Negotiation", maturity: "Low/Not relevant", intensity: 0 },
      { name: "Portfolio Governance", maturity: "Emerging", intensity: 7 },
      { name: "Asset Lifecycle Management", maturity: "Consolidated", intensity: 6 },
      { name: "Vendor & Supplier Management", maturity: "Consolidated", intensity: 5 },
      { name: "Cost & Value Optimization", maturity: "Consolidated", intensity: 9 },
    ]
  },
  {
    id: "avis-analyst",
    company: "Avis Budget Group EMEA",
    role: "Fleet Finance & Performance Analyst",
    date: "Jul 2011 — Oct 2011",
    periodShort: "2011",
    bullets: [
      "Produced monthly closing reports covering all fleet cost lines and performed daily analysis of fleet status.",
      "Prepared reporting for the board and supported development of the 2012 financial plan."
    ],
    sidebarSummary: "Produced monthly closing reports and performed daily analysis of fleet status.",
    stack: ["Financial Reporting", "Fleet Analysis", "Cost Lines", "Board Reporting"],
    skills: [
      { name: "Process Excellence", maturity: "Emerging", intensity: 4 },
      { name: "Data-Driven Decision Making", maturity: "Consolidated", intensity: 8 },
      { name: "Artificial Intelligence", maturity: "Low/Not relevant", intensity: 0 },
      { name: "Change Management", maturity: "Low/Not relevant", intensity: 0 },
      { name: "Business Partnering", maturity: "Low/Not relevant", intensity: 0 },
      { name: "Negotiation", maturity: "Low/Not relevant", intensity: 0 },
      { name: "Portfolio Governance", maturity: "Low/Not relevant", intensity: 0 },
      { name: "Asset Lifecycle Management", maturity: "Consolidated", intensity: 6 },
      { name: "Vendor & Supplier Management", maturity: "Emerging", intensity: 5 },
      { name: "Cost & Value Optimization", maturity: "Consolidated", intensity: 6 },
    ]
  },
  {
    id: "gis",
    company: "Gestión Integral del Suelo",
    role: "Tech Assistance to Construction Site Mgt",
    date: "Oct 2008 — Sep 2009",
    periodShort: "2008 — 2009",
    bullets: [
      "Controlled monthly budget, quality and work supervision, and managed materials and equipment for the project 'Relocation of the Pumping Station (EBAR) of Collado-Villalba'.",
      "Developed multiple projects related to water supply networks and wastewater networks."
    ],
    sidebarSummary: "Controlled budget, quality and work supervision for major construction and wastewater network projects.",
    stack: ["Budget Control", "Work Supervision", "Project Mgt"],
    skills: [
      { name: "Process Excellence", maturity: "Low/Not relevant", intensity: 0 },
      { name: "Data-Driven Decision Making", maturity: "Emerging", intensity: 6 },
      { name: "Artificial Intelligence", maturity: "Low/Not relevant", intensity: 0 },
      { name: "Change Management", maturity: "Low/Not relevant", intensity: 0 },
      { name: "Business Partnering", maturity: "Low/Not relevant", intensity: 0 },
      { name: "Negotiation", maturity: "Low/Not relevant", intensity: 0 },
      { name: "Portfolio Governance", maturity: "Low/Not relevant", intensity: 0 },
      { name: "Asset Lifecycle Management", maturity: "Emerging", intensity: 4 },
      { name: "Vendor & Supplier Management", maturity: "Emerging", intensity: 5 },
      { name: "Cost & Value Optimization", maturity: "Emerging", intensity: 5 },
    ]
  }
];

const educationItems = [
  {
    id: "msc",
    title: "MSc Industrial Engineer, Industrial Organization",
    place: "Universidad Politécnica de Madrid",
    date: "2009 — 2011",
    description: "Advanced degree focusing on operations, management, and industrial systems optimization.",
  },
  {
    id: "bsc",
    title: "BSc Mechanical Engineer",
    place: "Universidad Politécnica de Madrid",
    date: "2004 — 2009",
    description: "Core engineering foundation, mechanics, and technical problem-solving methodologies.",
  },
  {
    id: "continuous",
    title: "Continuous Learning & Upskilling",
    place: "Independent study & certifications",
    date: "Ongoing",
    description: "Lean Six Sigma Yellow Belt. Currently exploring practical use cases for AI-assisted workflows and automation to enhance reporting efficiency and portfolio insights.",
  },
];

const languageItems = [
  {
    id: "es",
    name: "Spanish",
    level: "Native / Bilingual",
    note: "Lengua principal de comunicación, trabajo y escritura.",
  },
  {
    id: "en",
    name: "English",
    level: "Full Professional",
    note: "Uso habitual en documentación técnica, herramientas, producto y comunicación internacional.",
  },
  {
    id: "it",
    name: "Italian",
    level: "Full Professional",
    note: "Comunicación fluida en entornos internacionales.",
  },
];

const roleThemes = [
  {
    accent: "#97dffc",
    accentStrong: "#6d73ff",
    glow: "rgba(109,115,255,0.14)",
    soft: "rgba(151,223,252,0.12)",
    windowBg:
      "radial-gradient(circle at 18% 18%, rgba(109,115,255,0.18), transparent 28%), radial-gradient(circle at 82% 22%, rgba(151,223,252,0.14), transparent 24%), linear-gradient(180deg, rgba(12,14,22,0.72), rgba(8,10,16,0.66))",
  },
  {
    accent: "#f0c36d",
    accentStrong: "#ff7a59",
    glow: "rgba(255,122,89,0.14)",
    soft: "rgba(240,195,109,0.12)",
    windowBg:
      "radial-gradient(circle at 18% 18%, rgba(255,122,89,0.16), transparent 28%), radial-gradient(circle at 82% 22%, rgba(240,195,109,0.13), transparent 24%), linear-gradient(180deg, rgba(18,14,12,0.72), rgba(10,8,8,0.66))",
  },
  {
    accent: "#95efb8",
    accentStrong: "#46cddd",
    glow: "rgba(70,205,221,0.14)",
    soft: "rgba(149,239,184,0.12)",
    windowBg:
      "radial-gradient(circle at 18% 18%, rgba(70,205,221,0.16), transparent 28%), radial-gradient(circle at 82% 22%, rgba(149,239,184,0.13), transparent 24%), linear-gradient(180deg, rgba(10,16,14,0.72), rgba(7,10,10,0.66))",
  },
];

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function CVPage() {
  const [viewIndex, setViewIndex] = useState(0);
  const wheelLockRef = useRef(false);

  const orderedViews = useMemo<AppView[]>(
    () => [
      ...cvRoles.map((_, roleIndex) => ({ type: "work", roleIndex }) as AppView),
      { type: "education" },
      { type: "languages" },
    ],
    []
  );

  const activeView = orderedViews[viewIndex];
  const activeSection: Section =
    activeView.type === "work" ? "work" : activeView.type;
  const activeRoleIndex = activeView.type === "work" ? activeView.roleIndex : 0;

  const activeRole = useMemo<CVRole>(
    () => cvRoles[activeRoleIndex] ?? cvRoles[0],
    [activeRoleIndex]
  );

  const theme = roleThemes[activeRoleIndex % roleThemes.length];

  const { scrollY } = useScroll();
  const smoothScrollY = useSpring(scrollY, {
    stiffness: 225,
    damping: 24,
    mass: 0.48,
  });

  const bgY1 = useTransform(smoothScrollY, [0, 1200], [0, -80]);
  const bgY2 = useTransform(smoothScrollY, [0, 1200], [0, -140]);
  const bgScale = useTransform(smoothScrollY, [0, 1200], [1, 1.04]);

  const windowY = useTransform(smoothScrollY, [0, 1200], [0, -14]);
  const windowRotateX = useTransform(smoothScrollY, [0, 1200], [0, 1.6]);
  const windowScale = useTransform(smoothScrollY, [0, 1200], [1, 0.992]);

  useEffect(() => {
    let wheelAccumulator = 0;

    const onWheel = (e: WheelEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest("[data-native-scroll='true']")) return;
      if (wheelLockRef.current) return;

      wheelAccumulator += e.deltaY;

      if (Math.abs(wheelAccumulator) < 90) return;

      wheelLockRef.current = true;

      setViewIndex((prev) => {
        const next =
          wheelAccumulator > 0
            ? Math.min(prev + 1, orderedViews.length - 1)
            : Math.max(prev - 1, 0);

        return next;
      });

      wheelAccumulator = 0;

      window.setTimeout(() => {
        wheelLockRef.current = false;
      }, 300);
    };

    window.addEventListener("wheel", onWheel, { passive: true });
    return () => window.removeEventListener("wheel", onWheel);
  }, [orderedViews.length]);

  const goToView = (nextIndex: number) => {
    setViewIndex(Math.max(0, Math.min(nextIndex, orderedViews.length - 1)));
  };

  const goToSection = (section: Section) => {
    if (section === "work") {
      const firstWorkIndex = orderedViews.findIndex((v) => v.type === "work");
      goToView(firstWorkIndex >= 0 ? firstWorkIndex : 0);
    }
    if (section === "education") {
      const educationIndex = orderedViews.findIndex((v) => v.type === "education");
      if (educationIndex >= 0) goToView(educationIndex);
    }
    if (section === "languages") {
      const languagesIndex = orderedViews.findIndex((v) => v.type === "languages");
      if (languagesIndex >= 0) goToView(languagesIndex);
    }
  };

  const goToRole = (roleIndex: number) => {
    const index = orderedViews.findIndex(
      (v) => v.type === "work" && v.roleIndex === roleIndex
    );
    if (index >= 0) goToView(index);
  };

  return (
    <motion.div
      style={{
        height: "100dvh",
        width: "100vw",
        overflow: "hidden", // BLOQUEO DEL SCROLL GLOBAL
        background: "#020203",
        color: "#fff",
        position: "relative",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "8%",
            width: "26rem",
            height: "26rem",
            transform: "translateX(-50%)",
            borderRadius: "9999px",
            background: "rgba(255,255,255,0.035)",
            filter: "blur(130px)",
          }}
        />

        <motion.div
          style={{
            position: "absolute",
            left: "14%",
            top: "28%",
            width: "16rem",
            height: "16rem",
            borderRadius: "9999px",
            background: theme.soft,
            filter: "blur(120px)",
            y: bgY1,
            scale: bgScale,
          }}
        />

        <motion.div
          style={{
            position: "absolute",
            right: "11%",
            bottom: "10%",
            width: "16rem",
            height: "16rem",
            borderRadius: "9999px",
            background: theme.glow,
            filter: "blur(130px)",
            y: bgY2,
            scale: bgScale,
          }}
        />
      </div>

      <header
        style={{
          position: "relative",
          zIndex: 20,
          borderBottom: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <div
          style={{
            maxWidth: 1720,
            margin: "0 auto",
            height: 80,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 32px",
          }}
        >
          <div>
            <h1
              className="font-serif"
              style={{
                margin: 0,
                color: "#fff",
                fontSize: "1.45rem",
                lineHeight: 1,
                letterSpacing: "-0.03em",
              }}
            >
              {cvProfile.name}
            </h1>

            <p
              style={{
                margin: "10px 0 0",
                color: "rgba(255,255,255,0.42)",
                fontSize: "0.72rem",
                textTransform: "uppercase",
                letterSpacing: "0.24em",
              }}
            >
              {cvProfile.title}
            </p>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 28,
              color: "rgba(255,255,255,0.58)",
              fontSize: 14,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <MapPin size={15} />
              <span>{cvProfile.location}</span>
            </div>

            <a
              href={`mailto:${cvProfile.email}`}
              style={{ color: "rgba(255,255,255,0.58)", textDecoration: "none" }}
            >
              {cvProfile.email}
            </a>

            <a
              href={cvProfile.linkedin}
              target="_blank"
              rel="noreferrer"
              style={{
                color: "rgba(255,255,255,0.58)",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span>LinkedIn</span>
              <ExternalLink size={15} />
            </a>

            <Link
              href="/"
              onClick={() => sessionStorage.setItem('lastWorldId', 'cv')}
              style={{
                color: "rgba(255,255,255,0.74)",
                textDecoration: "none",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 9999,
                padding: "10px 16px",
              }}
            >
              Return hub
            </Link>
          </div>
        </div>
      </header>

      <main
        style={{
          position: "relative",
          zIndex: 10,
          maxWidth: 1720,
          margin: "0 auto",
          padding: "32px",
          height: "calc(100dvh - 80px)",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "260px minmax(0, 1fr) 320px",
            gap: 32,
            height: "100%",
            alignItems: "start",
          }}
        >
          <aside style={{ minWidth: 0 }}>
            <div>
              <Label>Sections</Label>

              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <LeftNavItem
                  active={activeSection === "work"}
                  label="Work"
                  indexLabel="01"
                  onClick={() => goToSection("work")}
                />
                <LeftNavItem
                  active={activeSection === "education"}
                  label="Education"
                  indexLabel="02"
                  onClick={() => goToSection("education")}
                />
                <LeftNavItem
                  active={activeSection === "languages"}
                  label="Languages"
                  indexLabel="03"
                  onClick={() => goToSection("languages")}
                />
              </div>

              <div style={{ marginTop: 44 }}>
                <Label>Timeline</Label>

                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {cvRoles.map((role, index) => (
                    <RoleListItem
                      key={role.id}
                      active={activeSection === "work" && index === activeRoleIndex}
                      label={role.company}
                      meta={role.periodShort}
                      muted={activeSection !== "work"}
                      accent={theme.accent}
                      onClick={() => goToRole(index)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </aside>

          <section style={{ minWidth: 0, height: "100%" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "flex-start",
                paddingTop: 32,
                height: "100%",
              }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${activeView.type}-${activeView.type === "work" ? activeView.roleIndex : "x"}`}
                  initial={{ opacity: 0, y: 90, scale: 0.955, rotateX: 5 }}
                  animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
                  exit={{ opacity: 0, y: -70, scale: 0.982, rotateX: -2 }}
                  transition={{
                    type: "spring",
                    stiffness: 120,
                    damping: 20,
                    mass: 0.55,
                  }}
                  style={{
                    width: "100%",
                    maxWidth: 980,
                    height: "72dvh",
                    minHeight: 660,
                    borderRadius: 22,
                    border: "1px solid rgba(255,255,255,0.14)",
                    overflow: "hidden",
                    position: "relative",
                    background:
                      activeSection === "work"
                        ? theme.windowBg
                        : "linear-gradient(180deg, rgba(13,15,22,0.72), rgba(8,10,16,0.66))",
                    backdropFilter: "blur(26px) saturate(140%)",
                    WebkitBackdropFilter: "blur(26px) saturate(140%)",
                    boxShadow: `
                      0 52px 120px rgba(0,0,0,0.56),
                      0 22px 38px rgba(0,0,0,0.34),
                      0 6px 12px rgba(0,0,0,0.20),
                      inset 0 1px 0 rgba(255,255,255,0.08),
                      inset 0 0 0 1px rgba(255,255,255,0.03),
                      0 0 64px ${theme.glow}
                    `,
                    transformPerspective: 1800,
                    y: windowY,
                    rotateX: windowRotateX,
                    scale: windowScale,
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      pointerEvents: "none",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        insetInline: 0,
                        top: 0,
                        height: 90,
                        background:
                          "linear-gradient(180deg, rgba(255,255,255,0.12), rgba(255,255,255,0.03) 38%, transparent)",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: 1,
                        background:
                          "linear-gradient(180deg, rgba(255,255,255,0.18), rgba(255,255,255,0.02), transparent)",
                        opacity: 0.7,
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        right: 0,
                        top: 0,
                        bottom: 0,
                        width: 1,
                        background:
                          "linear-gradient(180deg, rgba(255,255,255,0.1), transparent 35%, transparent)",
                        opacity: 0.35,
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        insetInline: 0,
                        bottom: 0,
                        height: 90,
                        background:
                          "linear-gradient(0deg, rgba(0,0,0,0.18), transparent)",
                      }}
                    />
                  </div>

                  <AppChrome />

                  {activeSection === "work" ? (
                    <WorkWindow
                      role={activeRole}
                      roleIndex={activeRoleIndex}
                      total={cvRoles.length}
                      accent={theme.accent}
                    />
                  ) : activeSection === "education" ? (
                    <EducationWindow />
                  ) : (
                    <LanguagesWindow />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </section>

          <aside style={{ minWidth: 0 }}>
            <div style={{ paddingTop: 4 }}>
              <Label>Skills</Label>

              {activeSection === "work" ? (
                <div>
                  <p
                    style={{
                      margin: 0,
                      color: "rgba(255,255,255,0.35)",
                      fontSize: "0.72rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.22em",
                    }}
                  >
                    {activeRole.company}
                  </p>

                  <p
                    style={{
                      margin: "10px 0 0",
                      color: theme.accent,
                      fontSize: "0.92rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.18em",
                      fontWeight: 600,
                    }}
                  >
                    {activeRole.role}
                  </p>

                  {/* LEYENDA VISUAL DE SKILLS */}
                  <div style={{ display: 'flex', gap: '16px', fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em', marginTop: '24px', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '8px', height: '8px', backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: '2px', boxShadow: '0 0 6px rgba(255,255,255,0.3)' }} />
                      <span>Consolidated</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '8px', height: '8px', backgroundColor: '#38BDF8', borderRadius: '2px', boxShadow: '0 0 6px rgba(56,189,248,0.4)' }} />
                      <span>Emerging</span>
                    </div>
                  </div>

                  {/* BARRAS PONG */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                    {activeRole.skills.map((s, i) => {
                      const isLow = s.maturity === 'Low/Not relevant';
                      const color = s.maturity === 'Consolidated' ? 'rgba(255,255,255,0.85)' : s.maturity === 'Emerging' ? '#38BDF8' : 'transparent';
                      const glowColor = s.maturity === 'Consolidated' ? '0 0 8px rgba(255,255,255,0.3)' : s.maturity === 'Emerging' ? '0 0 10px rgba(56,189,248,0.4)' : 'none';

                      return (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '16px', opacity: isLow ? 0.25 : 1 }}>
                          
                          <span style={{ 
                            flex: 1, 
                            fontSize: '0.62rem', 
                            textTransform: 'uppercase', 
                            letterSpacing: '0.08em', 
                            color: isLow ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.78)', 
                            fontWeight: 600, 
                            whiteSpace: 'normal', 
                            lineHeight: 1.3 
                          }}>
                            {s.name}
                          </span>
                          
                          <div style={{ width: '140px', height: '8px', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '2px', position: 'relative', flexShrink: 0 }}>
                            <motion.div
                              initial={false}
                              animate={{ width: isLow ? '0%' : `${(s.intensity / 9) * 100}%` }}
                              style={{ height: '100%', backgroundColor: color, boxShadow: glowColor, borderRadius: '2px' }}
                              transition={{ duration: 1.2, ease: "circOut" }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                </div>
              ) : (
                <div>
                  <p
                    style={{
                      margin: 0,
                      color: "rgba(255,255,255,0.35)",
                      fontSize: "0.72rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.22em",
                    }}
                  >
                    Context
                  </p>

                  <p
                    style={{
                      margin: "16px 0 0",
                      maxWidth: "28ch",
                      color: "rgba(255,255,255,0.56)",
                      lineHeight: 1.9,
                    }}
                  >
                    Navega a través de las pestañas para ver los detalles de experiencia, educación o los idiomas fluidos.
                  </p>

                  <div style={{ marginTop: 32, display: "grid", gap: 12 }}>
                    <a
                      href={`mailto:${cvProfile.email}`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 12,
                        borderRadius: 9999,
                        border: "1px solid rgba(255,255,255,0.10)",
                        padding: "12px 16px",
                        color: "rgba(255,255,255,0.76)",
                        textDecoration: "none",
                      }}
                    >
                      <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <Mail size={15} />
                        Contact
                      </span>
                      <ArrowUpRight size={15} />
                    </a>

                    <a
                      href={cvProfile.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 12,
                        borderRadius: 9999,
                        border: "1px solid rgba(255,255,255,0.10)",
                        padding: "12px 16px",
                        color: "rgba(255,255,255,0.76)",
                        textDecoration: "none",
                      }}
                    >
                      <span>LinkedIn</span>
                      <ArrowUpRight size={15} />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </main>
    </motion.div>
  );
}

function AppChrome() {
  return (
    <div
      style={{
        position: "relative",
        zIndex: 2,
        height: 48,
        display: "flex",
        alignItems: "center",
        padding: "0 16px",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(0,0,0,0.12)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span
          style={{
            width: 11,
            height: 11,
            borderRadius: "50%",
            background: "#ff5f57",
          }}
        />
        <span
          style={{
            width: 11,
            height: 11,
            borderRadius: "50%",
            background: "#febc2e",
          }}
        />
        <span
          style={{
            width: 11,
            height: 11,
            borderRadius: "50%",
            background: "#28c840",
          }}
        />
      </div>

      <div style={{ flex: 1, textAlign: "center" }}>
        <span
          style={{
            color: "rgba(255,255,255,0.36)",
            fontSize: "0.65rem",
            textTransform: "uppercase",
            letterSpacing: "0.26em",
          }}
        >
          Experience.app
        </span>
      </div>
    </div>
  );
}

function WorkWindow({
  role,
  roleIndex,
  total,
  accent,
}: {
  role: CVRole;
  roleIndex: number;
  total: number;
  accent: string;
}) {
  return (
    <div
      style={{
        position: "relative",
        zIndex: 2,
        height: "calc(100% - 48px)",
        display: "grid",
        gridTemplateRows: "auto 1fr auto",
        padding: "40px 48px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        <p
          style={{
            margin: 0,
            color: "rgba(255,255,255,0.46)",
            fontSize: "0.72rem",
            textTransform: "uppercase",
            letterSpacing: "0.22em",
          }}
        >
          {role.date}
        </p>

        <div
          style={{
            color: "rgba(255,255,255,0.46)",
            fontSize: "0.62rem",
            textTransform: "uppercase",
            letterSpacing: "0.22em",
            padding: "5px 10px",
            borderRadius: 9999,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(255,255,255,0.04)",
          }}
        >
          {String(roleIndex + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </div>
      </div>

      <div style={{ display: "grid", alignItems: "center", maxHeight: "100%", overflowY: "auto" }}>
        <div style={{ maxWidth: 760, paddingRight: "16px" }}>
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="font-serif"
            style={{
              margin: 0,
              color: "#fff",
              fontSize: "clamp(2.8rem, 5vw, 4rem)",
              lineHeight: 0.95,
              letterSpacing: "-0.04em",
            }}
          >
            {role.company}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
            style={{
              margin: "24px 0 0",
              color: accent,
              fontSize: "1.08rem",
              fontWeight: 600,
            }}
          >
            {role.role}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            style={{ margin: "24px 0 0" }}
          >
            <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {role.bullets.map((bullet, idx) => (
                <li key={idx} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <span style={{ color: accent, fontSize: '0.65rem', marginTop: '6px' }}>■</span>
                  <span style={{ color: "rgba(255,255,255,0.7)", lineHeight: 1.6, fontSize: '0.95rem', fontWeight: 300 }}>
                    {bullet}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 20,
          paddingTop: 24,
          borderTop: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            maxWidth: 720,
          }}
        >
          {role.stack.map((item) => (
            <span
              key={item}
              style={{
                borderRadius: 9999,
                border: "1px solid rgba(255,255,255,0.10)",
                background: "rgba(255,255,255,0.05)",
                color: "rgba(255,255,255,0.66)",
                padding: "7px 12px",
                fontSize: "0.68rem",
                textTransform: "uppercase",
                letterSpacing: "0.14em",
              }}
            >
              {item}
            </span>
          ))}
        </div>

        <div
          style={{
            width: 96,
            height: 1,
            opacity: 0.8,
            background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
          }}
        />
      </div>
    </div>
  );
}

function EducationWindow() {
  return (
    <div
      data-native-scroll="true"
      style={{
        position: "relative",
        zIndex: 2,
        height: "calc(100% - 48px)",
        overflowY: "auto",
        padding: "40px 48px",
      }}
    >
      <p
        style={{
          margin: 0,
          color: "rgba(255,255,255,0.35)",
          fontSize: "0.72rem",
          textTransform: "uppercase",
          letterSpacing: "0.24em",
        }}
      >
        Formation
      </p>

      <h2
        className="font-serif"
        style={{
          margin: "12px 0 0",
          color: "#fff",
          fontSize: "3.2rem",
          lineHeight: 1,
          letterSpacing: "-0.04em",
        }}
      >
        Education
      </h2>

      <div style={{ marginTop: 40, display: "grid", gap: 24 }}>
        {educationItems.map((item) => (
          <div
            key={item.id}
            style={{
              paddingBottom: 24,
              borderBottom: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "space-between",
                gap: 24,
              }}
            >
              <div>
                <h3 style={{ margin: 0, color: "#fff", fontSize: "1.25rem" }}>
                  {item.title}
                </h3>
                <p style={{ margin: "8px 0 0", color: "rgba(255,255,255,0.55)" }}>
                  {item.place}
                </p>
              </div>

              <p
                style={{
                  margin: 0,
                  color: "rgba(255,255,255,0.35)",
                  fontSize: "0.85rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.18em",
                }}
              >
                {item.date}
              </p>
            </div>

            <p
              style={{
                margin: "16px 0 0",
                maxWidth: "62ch",
                color: "rgba(255,255,255,0.58)",
                lineHeight: 1.9,
              }}
            >
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function LanguagesWindow() {
  return (
    <div
      data-native-scroll="true"
      style={{
        position: "relative",
        zIndex: 2,
        height: "calc(100% - 48px)",
        overflowY: "auto",
        padding: "40px 48px",
      }}
    >
      <p
        style={{
          margin: 0,
          color: "rgba(255,255,255,0.35)",
          fontSize: "0.72rem",
          textTransform: "uppercase",
          letterSpacing: "0.24em",
        }}
      >
        Communication
      </p>

      <h2
        className="font-serif"
        style={{
          margin: "12px 0 0",
          color: "#fff",
          fontSize: "3.2rem",
          lineHeight: 1,
          letterSpacing: "-0.04em",
        }}
      >
        Languages
      </h2>

      <div
        style={{
          marginTop: 40,
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: 16,
        }}
      >
        {languageItems.map((item) => (
          <div
            key={item.id}
            style={{
              borderRadius: 18,
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.03)",
              padding: 20,
            }}
          >
            <p style={{ margin: 0, color: "#fff", fontSize: "1.125rem" }}>
              {item.name}
            </p>

            <p
              style={{
                margin: "10px 0 0",
                color: "rgba(255,255,255,0.35)",
                fontSize: "0.72rem",
                textTransform: "uppercase",
                letterSpacing: "0.22em",
              }}
            >
              {item.level}
            </p>

            <p
              style={{
                margin: "16px 0 0",
                color: "rgba(255,255,255,0.58)",
                lineHeight: 1.8,
              }}
            >
              {item.note}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        margin: "0 0 16px",
        color: "rgba(255,255,255,0.28)",
        fontSize: "0.68rem",
        textTransform: "uppercase",
        letterSpacing: "0.28em",
      }}
    >
      {children}
    </p>
  );
}

function LeftNavItem({
  active,
  label,
  indexLabel,
  onClick,
}: {
  active: boolean;
  label: string;
  indexLabel: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        position: "relative",
        display: "flex",
        alignItems: "center",
        background: "transparent",
        border: "none",
        padding: "10px 0",
        textAlign: "left",
        cursor: "pointer",
      }}
    >
      <motion.span
        animate={{ opacity: active ? 1 : 0, scaleY: active ? 1 : 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: "absolute",
          left: 0,
          top: 8,
          bottom: 8,
          width: 1,
          borderRadius: 9999,
          background: "#ffffff",
          transformOrigin: "center",
        }}
      />

      <motion.div
        animate={{ x: active ? 12 : 0, y: active ? -2 : 0 }}
        whileHover={{ x: 10, y: -2 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        style={{
          paddingLeft: 16,
          display: "flex",
          alignItems: "baseline",
          gap: 12,
        }}
      >
        <span
          style={{
            color: "rgba(255,255,255,0.28)",
            fontSize: "0.68rem",
            textTransform: "uppercase",
            letterSpacing: "0.16em",
          }}
        >
          {indexLabel}
        </span>

        <span
          style={{
            color: active ? "#ffffff" : "rgba(255,255,255,0.70)",
            fontSize: "0.96rem",
          }}
        >
          {label}
        </span>
      </motion.div>
    </button>
  );
}

function RoleListItem({
  active,
  label,
  meta,
  muted,
  accent,
  onClick,
}: {
  active: boolean;
  label: string;
  meta: string;
  muted?: boolean;
  accent: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        position: "relative",
        display: "flex",
        alignItems: "center",
        background: "transparent",
        border: "none",
        padding: "10px 0",
        textAlign: "left",
        cursor: "pointer",
      }}
    >
      <motion.span
        animate={{ opacity: active ? 1 : 0, scaleY: active ? 1 : 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: "absolute",
          left: 0,
          top: 8,
          bottom: 8,
          width: 1,
          borderRadius: 9999,
          background: accent,
          transformOrigin: "center",
        }}
      />

      <motion.div
        animate={{
          x: active ? 12 : 0,
          y: active ? -2 : 0,
          opacity: muted ? 0.58 : active ? 1 : 0.88,
        }}
        whileHover={{ x: 10, y: -2, opacity: muted ? 0.75 : 1 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        style={{ paddingLeft: 16 }}
      >
        <div
          style={{
            color: active ? "#ffffff" : "rgba(255,255,255,0.72)",
            fontSize: "0.92rem",
          }}
        >
          {label}
        </div>

        <div
          style={{
            marginTop: 4,
            color: "rgba(255,255,255,0.34)",
            fontSize: "0.68rem",
            textTransform: "uppercase",
            letterSpacing: "0.18em",
          }}
        >
          {meta}
        </div>
      </motion.div>
    </button>
  );
}