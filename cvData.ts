export type CVMetric = {
    value: string;
    label: string;
  };
  
  export type SkillBar = {
    name: string;
    value: number;
    level: string;
  };
  
  export type CVRole = {
    id: string;
    company: string;
    role: string;
    date: string;
    periodShort: string;
    description: string;
    sidebarSummary: string;
    highlights: string[];
    stack: string[];
    metrics: CVMetric[];
    skillBars: SkillBar[];
  };
  
  export const cvProfile = {
    name: "Daniel Rubio Paniagua",
    title: "Full-stack developer · 3D web · AI interfaces",
    location: "Madrid, Spain",
    email: "d.rubio.paniagua@gmail.com",
    linkedin: "https://www.linkedin.com/in/danielrubiopaniagua",
  };
  
  export const cvRoles: CVRole[] = [
    {
      id: "independent",
      company: "Independent",
      role: "Full-stack & Creative Developer",
      date: "2023 — Present",
      periodShort: "2023 — now",
      description:
        "Diseño y desarrollo experiencias web con una mezcla de producto, dirección visual e interacción avanzada. Mi foco está en construir interfaces con carácter, motion cuidado, integración de IA y escenas 3D que sigan siendo ligeras, legibles y útiles.",
      sidebarSummary:
        "Trabajo en la intersección entre frontend de precisión, narrativa visual y producto digital. Me interesa que la pieza tenga presencia, no solo que funcione.",
      highlights: [
        "Experiencias web con Three.js y capas narrativas más editoriales.",
        "Integración de agentes, asistentes y automatizaciones basadas en LLM.",
        "Prototipado rápido de conceptos premium para portfolio, landing y producto.",
      ],
      stack: ["Next.js", "React", "TypeScript", "Three.js", "Framer Motion", "OpenAI"],
      metrics: [
        { value: "60fps", label: "Objetivo habitual en escenas e interfaces ricas" },
        { value: "3D", label: "Interacción espacial aplicada a producto y branding" },
        { value: "AI", label: "Sistemas conversacionales y automatización integrada" },
      ],
      skillBars: [
        { name: "Creative development", value: 96, level: "Expert" },
        { name: "Frontend architecture", value: 92, level: "Expert" },
        { name: "Three.js / WebGL", value: 88, level: "Advanced" },
        { name: "Motion systems", value: 90, level: "Advanced" },
        { name: "AI integration", value: 84, level: "Advanced" },
        { name: "Product thinking", value: 80, level: "Strong" },
      ],
    },
    {
      id: "studio-work",
      company: "Studio Work",
      role: "Frontend / Interactive Developer",
      date: "2021 — 2023",
      periodShort: "2021 — 2023",
      description:
        "Construcción de interfaces y websites premium con especial atención a layout, microinteracción, ritmo de scroll y consistencia visual. En esta etapa consolidé una forma de trabajar muy enfocada en el detalle y en cómo se siente la interfaz cuando todo está afinado.",
      sidebarSummary:
        "Etapa clave para fijar criterio visual, calidad de ejecución frontend y sensibilidad hacia el movimiento como parte de la interfaz.",
      highlights: [
        "Sistemas UI reutilizables con una dirección visual clara.",
        "Animaciones suaves integradas sin romper accesibilidad ni rendimiento.",
        "Trabajo fino de responsive, composición y timing visual.",
      ],
      stack: ["Next.js", "Tailwind", "Framer Motion", "CSS", "Figma"],
      metrics: [
        { value: "UI", label: "Sistemas visuales coherentes y escalables" },
        { value: "Motion", label: "Animación como lenguaje de interfaz" },
        { value: "Perf", label: "Optimización de carga, layout y render" },
      ],
      skillBars: [
        { name: "UI systems", value: 91, level: "Expert" },
        { name: "Motion direction", value: 89, level: "Advanced" },
        { name: "Responsive layout", value: 94, level: "Expert" },
        { name: "Tailwind / CSS", value: 90, level: "Advanced" },
        { name: "Design implementation", value: 86, level: "Advanced" },
        { name: "Collaboration with design", value: 81, level: "Strong" },
      ],
    },
    {
      id: "product-builds",
      company: "Product Builds",
      role: "Frontend Engineer",
      date: "2019 — 2021",
      periodShort: "2019 — 2021",
      description:
        "Desarrollo de producto digital con enfoque práctico en componentes, flujos, estados, integraciones y mantenimiento. Esta etapa me dio una base de ingeniería frontend más sólida, sobre la que luego pude construir una capa visual mucho más refinada.",
      sidebarSummary:
        "Base técnica de producto real: arquitectura, integración, claridad de código y ciclos constantes de iteración y entrega.",
      highlights: [
        "Componentes mantenibles y sistemas más claros de escalar.",
        "Integración con APIs y servicios externos.",
        "Trabajo orientado a producto, shipping y mejora continua.",
      ],
      stack: ["React", "JavaScript", "Node", "REST", "Git"],
      metrics: [
        { value: "Prod", label: "Mentalidad de shipping y evolución continua" },
        { value: "API", label: "Integración fiable con servicios externos" },
        { value: "DX", label: "Código orientado a claridad y mantenimiento" },
      ],
      skillBars: [
        { name: "React development", value: 90, level: "Advanced" },
        { name: "Component architecture", value: 87, level: "Advanced" },
        { name: "API integration", value: 85, level: "Advanced" },
        { name: "Code quality", value: 82, level: "Strong" },
        { name: "Delivery rhythm", value: 84, level: "Strong" },
        { name: "Product maintenance", value: 80, level: "Strong" },
      ],
    },
  ];
  
  export const educationItems = [
    {
      id: "continuous-learning",
      title: "Continuous learning in frontend, 3D and AI",
      place: "Independent study · shipped work · online programs",
      date: "Ongoing",
      description:
        "Formación continua centrada en desarrollo web moderno, diseño de interacción, gráficos 3D en navegador y uso de modelos de lenguaje dentro de productos digitales.",
    },
    {
      id: "web-graphics",
      title: "Advanced web graphics practice",
      place: "Three.js · shaders · realtime rendering",
      date: "Focused track",
      description:
        "Práctica avanzada orientada a escenas interactivas, materiales, cámaras, performance y narrativa espacial aplicada a interfaces, presentaciones y portfolio work.",
    },
  ];
  
  export const languageItems = [
    {
      id: "es",
      name: "Spanish",
      level: "Native",
      note: "Lengua principal de comunicación, trabajo y escritura.",
    },
    {
      id: "en",
      name: "English",
      level: "Professional working proficiency",
      note: "Uso habitual en documentación técnica, herramientas, producto y comunicación internacional.",
    },
  ];