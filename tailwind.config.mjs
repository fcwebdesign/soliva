// tailwind.config.mjs
import { join } from 'path'

export default {
  content: [
    join(__dirname, 'app/**/*.{js,ts,jsx,tsx}'),
    join(__dirname, 'components/**/*.{js,ts,jsx,tsx}'),
    join(__dirname, 'src/**/*.{js,ts,jsx,tsx}'),
  ],
  theme: {
    container: {
      center: true,
      padding: "1rem", // ou "2rem" si tu veux plus d'air
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // ===== COULEURS ADMIN =====
        admin: {
          bg: "var(--admin-bg)",
          "bg-hover": "var(--admin-bg-hover)",
          "bg-active": "var(--admin-bg-active)",
          border: "var(--admin-border)",
          "border-light": "var(--admin-border-light)",
          text: "var(--admin-text)",
          "text-secondary": "var(--admin-text-secondary)",
          "text-muted": "var(--admin-text-muted)",
          success: "var(--admin-success)",
          warning: "var(--admin-warning)",
          error: "var(--admin-error)",
          info: "var(--admin-info)",
          button: {
            bg: "var(--admin-button-bg)",
            hover: "var(--admin-button-hover)",
          },
          input: {
            bg: "var(--admin-input-bg)",
            border: "var(--admin-input-border)",
          },
          card: {
            bg: "var(--admin-card-bg)",
          },
          sidebar: {
            bg: "var(--admin-sidebar-bg)",
          },
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
}
