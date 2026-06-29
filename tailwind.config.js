/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0a0a0a",
          900: "#131316",
          800: "#1c1c20",
          700: "#26262c",
          600: "#3a3a44",
        },
        amber: { glow: "#f5a623" },
        status: {
          pending: "#f5a623",
          repairing: "#3da9fc",
          quoted: "#a259ff",
          completed: "#2ecc71",
          cancelled: "#e74c3c",
        },
      },
      backgroundImage: {
        "amber-gradient": "linear-gradient(135deg, #f5a623 0%, #ff8a00 100%)",
      },
      boxShadow: {
        "glow-sm": "0 0 12px -2px rgba(245,166,35,0.4)",
        glow: "0 0 24px -4px rgba(245,166,35,0.5), 0 0 8px rgba(245,166,35,0.3)",
      },
      fontSize: {
        "2xs": ["10px", "14px"],
      },
      fontFamily: {
        sans: ['-apple-system','BlinkMacSystemFont','PingFang SC','Hiragino Sans GB','Microsoft YaHei','sans-serif'],
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "shimmer": "shimmer 1.5s infinite",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: 0 }, "100%": { opacity: 1 } },
        slideUp: { "0%": { transform: "translateY(20px)", opacity: 0 }, "100%": { transform: "translateY(0)", opacity: 1 } },
        shimmer: { "0%": { backgroundPosition: "-1000px 0" }, "100%": { backgroundPosition: "1000px 0" } },
      },
    },
  },
  plugins: [],
};
