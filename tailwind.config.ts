import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        ember: {
          DEFAULT: "var(--journey-ember)",
          dark: "var(--journey-ember-dark)",
          glow: "var(--journey-ember-glow)",
        },
        teal: {
          DEFAULT: "var(--compass-teal)",
          light: "var(--compass-teal-light)",
          mid: "var(--compass-teal-mid)",
        },
        parchment: {
          DEFAULT: "var(--parchment)",
          dark: "var(--parchment-dark)",
        },
        sand: "var(--sand)",
        coral: "var(--heart-coral)",
        saffron: "var(--wantgo-saffron)",
        ink: {
          deep: "var(--ink-deep)",
          mid: "var(--ink-mid)",
          light: "var(--ink-light)",
        },
        nav: {
          bg: "var(--nav-bg)",
          active: "var(--nav-active)",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "sans-serif"],
      },
      borderRadius: {
        stamp: "2px",
        card: "16px",
      },
      boxShadow: {
        card: "0 2px 12px rgba(28, 24, 20, 0.10)",
        "card-hov": "0 6px 24px rgba(28, 24, 20, 0.16)",
        stamp: "2px 2px 8px rgba(28, 24, 20, 0.20)",
      },
    },
  },
  plugins: [],
};
export default config;
