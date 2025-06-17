import { heroui } from "@heroui/react";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'SF Pro Display',
          'SF Pro Icons',
          'Helvetica Neue',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
      },
      colors: {
        primary: {
          50: "#f0f7ff",
          100: "#e0eefe",
          200: "#bae0fd",
          300: "#7cc8fb",
          400: "#36aaf5",
          500: "#0d8de3",
          600: "#006fc1",
          700: "#015a9d",
          800: "#064b81",
          900: "#0a406b",
          950: "#072a4a",
        },
        secondary: {
          50: "#f5f7ff",
          100: "#ebf0ff",
          200: "#d6e0ff",
          300: "#b3c6ff",
          400: "#89a1ff",
          500: "#6172ff",
          600: "#4047f5",
          700: "#3333e1",
          800: "#2b2bb8",
          900: "#292994",
          950: "#18186b",
        },
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },
      textShadow: {
        sm: '0 1px 2px var(--tw-shadow-color)',
        DEFAULT: '0 2px 4px var(--tw-shadow-color)',
        lg: '0 8px 16px var(--tw-shadow-color)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  darkMode: "class",
  plugins: [heroui(), function({ addUtilities }) {
    const newUtilities = {
      '.text-gradient': {
        'background-clip': 'text',
        '-webkit-background-clip': 'text',
        'color': 'transparent',
      },
      '.glass-effect': {
        'background': 'rgba(255, 255, 255, 0.1)',
        'backdrop-filter': 'blur(10px)',
        'border': '1px solid rgba(255, 255, 255, 0.18)',
        'box-shadow': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
      },
      '.glass-effect-dark': {
        'background': 'rgba(17, 25, 40, 0.75)',
        'backdrop-filter': 'blur(10px)',
        'border': '1px solid rgba(255, 255, 255, 0.08)',
        'box-shadow': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      '.neumorphism': {
        'box-shadow': '10px 10px 20px rgba(0, 0, 0, 0.1), -10px -10px 20px rgba(255, 255, 255, 0.5)',
      },
      '.neumorphism-dark': {
        'box-shadow': '10px 10px 20px rgba(0, 0, 0, 0.3), -10px -10px 20px rgba(255, 255, 255, 0.05)',
      },
    };
    addUtilities(newUtilities);
  }],
};
