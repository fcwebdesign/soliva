// tailwind.config.mjs
import { join } from 'path'

export default {
  content: [
    join(__dirname, 'app/**/*.{js,ts,jsx,tsx}'),
    join(__dirname, 'components/**/*.{js,ts,jsx,tsx}'),
  ],
  theme: {
    container: {
      center: true,
      padding: "1rem", // ou "2rem" si tu veux plus d'air
    },
    extend: {},
  },
  plugins: [],
}
