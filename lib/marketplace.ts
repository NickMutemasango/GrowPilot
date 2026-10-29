export type ServiceProvider = {
  name: string;
  /** Path under /public. */
  avatar: string;
  /** Optional rectangular profile photo under /public; cards fall back to the avatar. */
  photo?: string;
  role: string;
  /** Short introduction shown on the service page. */
  bio: string;
};

export type Service = {
  slug: string;
  title: string;
  description: string;
  provider: ServiceProvider;
  /** Skills or category tags, also matched by search. */
  tags: string[];
  /** Starting price in USD. */
  startingPrice: number;
  rating: number;
  reviews: number;
  /** Typical turnaround for the starting package, in days. */
  deliveryDays: number;
  /** What the starting package includes. */
  included: string[];
};

// Placeholder content — replace with real data once the marketplace has providers.
export const services: Service[] = [
  {
    slug: "react-nextjs-website-development",
    title: "React & Next.js Website Development",
    description:
      "Fast, accessible and SEO-friendly websites built with React, Next.js and Tailwind CSS — from landing pages to full web apps.",
    provider: {
      name: "Daniel Mensah",
      avatar: "/providers/daniel-mensah.svg",
      role: "Full-stack developer",
      bio: "Full-stack developer with six years of experience building fast, accessible web apps for startups and small businesses.",
    },
    tags: ["Web development", "React", "Next.js", "Tailwind CSS", "TypeScript"],
    startingPrice: 450,
    rating: 4.9,
    reviews: 128,
    deliveryDays: 7,
    included: [
      "Responsive design for mobile, tablet and desktop",
      "Up to 5 pages built with Next.js",
      "Basic SEO setup and metadata",
      "Accessibility checks against WCAG 2.2 AA",
      "Deployment to Vercel",
      "Two rounds of revisions",
    ],
  },
  {
    slug: "mobile-web-app-ui-ux-design",
    title: "Mobile & Web App UI/UX Design",
    description:
      "User-centred interfaces designed in Figma — from research and wireframes to polished, developer-ready screens and clickable prototypes.",
    provider: {
      name: "Amara Okafor",
      avatar: "/providers/amara-okafor.svg",
      role: "Product designer",
      bio: "Product designer who has shipped apps for fintech and education startups, with a focus on clear flows and accessible design.",
    },
    tags: ["UI/UX design", "Figma", "Prototyping", "Design systems", "Mobile apps"],
    startingPrice: 350,
    rating: 4.9,
    reviews: 96,
    deliveryDays: 5,
    included: [
      "User flow and wireframes for up to 5 screens",
      "High-fidelity designs in Figma",
      "Clickable prototype",
      "Reusable components and style guide",
      "Developer handoff notes",
      "Two rounds of revisions",
    ],
  },
  {
    slug: "react-native-mobile-app-development",
    title: "Cross-platform Mobile App with React Native",
    description:
      "One codebase for iOS and Android — native-feeling apps built with React Native and Expo, from MVP to app store release.",
    provider: {
      name: "Lucas Ferreira",
      avatar: "/providers/lucas-ferreira.svg",
      role: "Mobile developer",
      bio: "Mobile developer with more than 20 published apps, specialising in React Native, offline-first data and smooth animations.",
    },
    tags: ["Mobile apps", "React Native", "React", "TypeScript", "iOS", "Android"],
    startingPrice: 800,
    rating: 4.8,
    reviews: 64,
    deliveryDays: 14,
    included: [
      "iOS and Android app from one codebase",
      "Up to 6 screens built from your designs",
      "API or Firebase integration",
      "Push notifications setup",
      "App Store and Google Play submission",
      "30 days of bug-fix support",
    ],
  },
  {
    slug: "python-data-analysis-dashboards",
    title: "Data Analysis & Dashboards in Python",
    description:
      "Turn spreadsheets and databases into clear insights — cleaned data, statistical analysis and interactive dashboards you can share.",
    provider: {
      name: "Priya Sharma",
      avatar: "/providers/priya-sharma.svg",
      role: "Data analyst",
      bio: "Data analyst with a background in statistics, helping researchers and small businesses make decisions from their data.",
    },
    tags: ["Data analysis", "Python", "Pandas", "Data visualization", "Power BI"],
    startingPrice: 250,
    rating: 4.9,
    reviews: 142,
    deliveryDays: 5,
    included: [
      "Data cleaning and preparation",
      "Exploratory analysis with key findings",
      "Up to 8 charts or visualizations",
      "Interactive dashboard in Power BI or Streamlit",
      "Documented Jupyter notebook",
      "One round of revisions",
    ],
  },
  {
    slug: "logo-brand-identity-design",
    title: "Logo & Brand Identity Design",
    description:
      "A memorable logo and a consistent visual identity — colours, typography and brand guidelines that work everywhere your brand appears.",
    provider: {
      name: "Sofia Rossi",
      avatar: "/providers/sofia-rossi.svg",
      role: "Brand designer",
      bio: "Brand designer who has created identities for over 150 small businesses, creators and community projects.",
    },
    tags: ["Brand identity", "Logo design", "Illustrator", "Figma"],
    startingPrice: 200,
    rating: 4.7,
    reviews: 211,
    deliveryDays: 4,
    included: [
      "Three initial logo concepts",
      "Colour palette and typography",
      "Logo files in SVG, PNG and PDF",
      "Social media profile kit",
      "One-page brand guidelines",
      "Three rounds of revisions",
    ],
  },
  {
    slug: "seo-audit-on-page-optimization",
    title: "SEO Audit & On-page Optimization",
    description:
      "Find out why your site isn't ranking and fix it — a technical SEO audit, keyword research and on-page improvements with a clear action plan.",
    provider: {
      name: "James Whitfield",
      avatar: "/providers/james-whitfield.svg",
      role: "SEO specialist",
      bio: "SEO specialist who has grown organic traffic for online stores, course creators and local businesses for eight years.",
    },
    tags: ["SEO", "Web development", "Google Analytics", "Content strategy"],
    startingPrice: 180,
    rating: 4.8,
    reviews: 87,
    deliveryDays: 3,
    included: [
      "Full technical SEO audit",
      "Keyword research for up to 20 terms",
      "On-page fixes for up to 10 pages",
      "Page speed recommendations",
      "Google Search Console setup",
      "Prioritised action plan",
    ],
  },
  {
    slug: "youtube-course-video-editing",
    title: "YouTube & Course Video Editing",
    description:
      "Engaging, professionally edited videos for YouTube and online courses — clean cuts, captions, graphics and sound that keep viewers watching.",
    provider: {
      name: "Hana Kim",
      avatar: "/providers/hana-kim.svg",
      role: "Video editor",
      bio: "Video editor for educators and YouTube creators, known for tight pacing and clear on-screen explanations.",
    },
    tags: ["Video editing", "Premiere Pro", "After Effects", "Motion graphics"],
    startingPrice: 120,
    rating: 4.9,
    reviews: 173,
    deliveryDays: 3,
    included: [
      "Edit of up to 15 minutes of final video",
      "Colour correction and audio cleanup",
      "Captions and on-screen text",
      "Intro, outro and lower thirds",
      "Royalty-free background music",
      "Two rounds of revisions",
    ],
  },
  {
    slug: "website-copywriting-proofreading",
    title: "Website Copywriting & Proofreading",
    description:
      "Clear, persuasive copy for your website, landing pages or course descriptions — written for your audience and proofread to perfection.",
    provider: {
      name: "Kwame Asante",
      avatar: "/providers/kwame-asante.svg",
      role: "Copywriter & editor",
      bio: "Copywriter and editor who writes for education, tech and non-profit brands, with a former career in journalism.",
    },
    tags: ["Copywriting", "Editing", "Content strategy", "SEO"],
    startingPrice: 90,
    rating: 4.8,
    reviews: 58,
    deliveryDays: 3,
    included: [
      "Copy for up to 3 pages",
      "Short brand voice questionnaire",
      "SEO-friendly headings and meta descriptions",
      "Full proofread and edit",
      "Two rounds of revisions",
    ],
  },
  {
    slug: "wordpress-website-setup-customization",
    title: "WordPress Website Setup & Customization",
    description:
      "A professional WordPress site that you can update yourself — theme setup, custom styling, essential plugins and a quick training session.",
    provider: {
      name: "Elena Petrova",
      avatar: "/providers/elena-petrova.svg",
      role: "WordPress developer",
      bio: "WordPress developer who builds easy-to-manage sites for schools, tutors and small businesses.",
    },
    tags: ["Web development", "WordPress", "PHP", "SEO"],
    startingPrice: 300,
    rating: 4.6,
    reviews: 49,
    deliveryDays: 6,
    included: [
      "Theme installation and custom styling",
      "Up to 6 pages",
      "Contact form and essential plugins",
      "Basic SEO and security setup",
      "30-minute training session",
      "One round of revisions",
    ],
  },
];

export function getService(slug: string) {
  return services.find((service) => service.slug === slug);
}

/** Services sharing the most tags with this one, excluding the service itself. */
export function getRelatedServices(service: Service, limit = 3) {
  return services
    .filter((s) => s.slug !== service.slug)
    .map((s) => ({ s, shared: s.tags.filter((tag) => service.tags.includes(tag)).length }))
    .filter(({ shared }) => shared > 0)
    .sort((a, b) => b.shared - a.shared)
    .slice(0, limit)
    .map(({ s }) => s);
}
