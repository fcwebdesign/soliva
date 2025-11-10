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
      // Typographie fluide avec clamp() - s'adapte automatiquement au viewport
      fontSize: {
        // Petites tailles
        'fluid-xs': 'clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)',      // 12px → 14px
        'fluid-sm': 'clamp(0.875rem, 0.8rem + 0.375vw, 1rem)',      // 14px → 16px
        'fluid-base': 'clamp(1rem, 0.95rem + 0.25vw, 1.125rem)',     // 16px → 18px
        
        // Tailles moyennes
        'fluid-lg': 'clamp(1.125rem, 1rem + 0.625vw, 1.5rem)',       // 18px → 24px
        'fluid-xl': 'clamp(1.25rem, 1.1rem + 0.75vw, 1.875rem)',     // 20px → 30px
        'fluid-2xl': 'clamp(1.5rem, 1.3rem + 1vw, 2.25rem)',         // 24px → 36px
        
        // Grandes tailles (titres)
        'fluid-3xl': 'clamp(1.875rem, 1.5rem + 1.875vw, 3rem)',      // 30px → 48px
        'fluid-4xl': 'clamp(2rem, 1.5rem + 2.5vw, 3.75rem)',        // 32px → 60px (ajusté mobile)
        'fluid-5xl': 'clamp(2.25rem, 1.8rem + 3vw, 4.5rem)',        // 36px → 72px (ajusté mobile)
        'fluid-6xl': 'clamp(2.5rem, 2rem + 3.5vw, 6rem)',           // 40px → 96px (ajusté mobile)
        
        // Tailles hero (très grandes)
        'fluid-7xl': 'clamp(2.75rem, 2.2rem + 4vw, 7.5rem)',       // 44px → 120px (ajusté mobile)
        'fluid-8xl': 'clamp(3rem, 2.5rem + 4.5vw, 9rem)',            // 48px → 144px (ajusté mobile)
        'fluid-9xl': 'clamp(3.5rem, 3rem + 5vw, 11rem)',            // 56px → 176px (ajusté mobile)
        'fluid-10xl': 'clamp(3.5rem, 3rem + 5.5vw, 12.5rem)',       // 56px → 200px (ajusté mobile)
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
