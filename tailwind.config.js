/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eff6ff",
          100: "#dbeafe",
          500: "#0F4C81",
          600: "#0c3f6b",
          700: "#0a3358",
          900: "#062041",
        },
        status: {
          compliant: "#16a34a",
          partial: "#eab308",
          violation: "#dc2626",
          missing: "#64748b",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
