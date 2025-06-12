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
        luxury: ['Playfair Display', 'Georgia', 'serif'],
        body: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        accent: ['Dancing Script', 'cursive'],
        sans: [
          'Inter',
          'SF Pro Display',
          'SF Pro Icons',
          'Helvetica Neue',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
      },
      colors: {
        // Ultra-Premium Luxury Color Palette
        navy: {
          50: "hsl(222, 84%, 98%)",
          100: "hsl(222, 84%, 95%)",
          200: "hsl(222, 84%, 88%)",
          300: "hsl(222, 84%, 77%)",
          400: "hsl(222, 84%, 65%)",
          500: "hsl(222, 84%, 54%)",
          600: "hsl(222, 84%, 43%)",
          700: "hsl(222, 84%, 32%)",
          800: "hsl(222, 84%, 21%)",
          900: "hsl(222, 84%, 10%)",
        },
        gold: {
          50: "hsl(45, 75%, 95%)",
          100: "hsl(45, 75%, 88%)",
          200: "hsl(45, 75%, 78%)",
          300: "hsl(45, 75%, 68%)",
          400: "hsl(45, 75%, 58%)",
          500: "hsl(45, 75%, 48%)",
          600: "hsl(45, 75%, 43%)",
          700: "hsl(45, 75%, 38%)",
          800: "hsl(45, 75%, 33%)",
          900: "hsl(45, 75%, 28%)",
        },
        charcoal: {
          50: "hsl(214, 22%, 95%)",
          100: "hsl(214, 22%, 88%)",
          200: "hsl(214, 22%, 78%)",
          300: "hsl(214, 22%, 68%)",
          400: "hsl(214, 22%, 58%)",
          500: "hsl(214, 22%, 48%)",
          600: "hsl(214, 22%, 38%)",
          700: "hsl(214, 22%, 28%)",
          800: "hsl(214, 22%, 18%)",
          900: "hsl(214, 22%, 8%)",
        },
        platinum: {
          50: "hsl(214, 32%, 98%)",
          100: "hsl(214, 32%, 95%)",
          200: "hsl(214, 32%, 91%)",
          300: "hsl(214, 32%, 85%)",
          400: "hsl(214, 32%, 78%)",
          500: "hsl(214, 32%, 70%)",
          600: "hsl(214, 32%, 62%)",
          700: "hsl(214, 32%, 54%)",
          800: "hsl(214, 32%, 46%)",
          900: "hsl(214, 32%, 38%)",
        },
        cream: {
          50: "hsl(30, 67%, 99%)",
          100: "hsl(30, 67%, 98%)",
          200: "hsl(30, 67%, 96%)",
          300: "hsl(30, 67%, 94%)",
          400: "hsl(30, 67%, 91%)",
          500: "hsl(30, 67%, 88%)",
          600: "hsl(30, 67%, 85%)",
          700: "hsl(30, 67%, 82%)",
          800: "hsl(30, 67%, 79%)",
          900: "hsl(30, 67%, 76%)",
        },
        emerald: {
          50: "hsl(162, 88%, 95%)",
          100: "hsl(162, 88%, 88%)",
          200: "hsl(162, 88%, 78%)",
          300: "hsl(162, 88%, 68%)",
          400: "hsl(162, 88%, 58%)",
          500: "hsl(162, 88%, 48%)",
          600: "hsl(162, 88%, 38%)",
          700: "hsl(162, 88%, 28%)",
          800: "hsl(162, 88%, 18%)",
          900: "hsl(162, 88%, 8%)",
        },
        rosegold: {
          50: "hsl(351, 50%, 95%)",
          100: "hsl(351, 50%, 88%)",
          200: "hsl(351, 50%, 78%)",
          300: "hsl(351, 50%, 68%)",
          400: "hsl(351, 50%, 58%)",
          500: "hsl(351, 50%, 48%)",
          600: "hsl(351, 50%, 38%)",
          700: "hsl(351, 50%, 28%)",
          800: "hsl(351, 50%, 18%)",
          900: "hsl(351, 50%, 8%)",
        },
        // Original colors for compatibility
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
      backgroundImage: {
        'luxury-gradient': 'linear-gradient(135deg, hsl(222, 84%, 10%), hsl(222, 84%, 21%), hsl(214, 22%, 18%))',
        'gold-gradient': 'linear-gradient(135deg, hsl(45, 75%, 48%), hsl(45, 75%, 43%), hsl(45, 75%, 38%))',
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
        'hero-overlay': 'linear-gradient(135deg, hsla(222, 84%, 10%, 0.95) 0%, hsla(214, 22%, 18%, 0.9) 50%, hsla(222, 84%, 21%, 0.85) 100%)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-luxury': 'pulse-luxury 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'gradient-shift': 'gradient-shift 3s ease infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'pulse-luxury': {
          '0%': { 
            boxShadow: '0 0 0 0 rgba(212, 175, 55, 0.7)',
            transform: 'scale(1)',
          },
          '70%': { 
            boxShadow: '0 0 0 10px rgba(212, 175, 55, 0)',
            transform: 'scale(1.05)',
          },
          '100%': { 
            boxShadow: '0 0 0 0 rgba(212, 175, 55, 0)',
            transform: 'scale(1)',
          },
        },
        'gradient-shift': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      boxShadow: {
        'luxury': '0 10px 15px -3px rgba(10, 22, 40, 0.3), 0 4px 6px -2px rgba(10, 22, 40, 0.1), 0 0 0 1px rgba(212, 175, 55, 0.1)',
        'luxury-hover': '0 25px 50px -12px rgba(10, 22, 40, 0.5), 0 0 0 1px rgba(212, 175, 55, 0.2)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.3)',
        'glass-hover': '0 16px 64px rgba(0, 0, 0, 0.4)',
      },
      backdropBlur: {
        xs: '2px',
        luxury: '20px',
        subtle: '8px',
      },
      letterSpacing: {
        'luxury': '0.025em',
        'luxury-wide': '0.05em',
        'luxury-widest': '0.1em',
      },
      textShadow: {
        sm: '0 1px 2px var(--tw-shadow-color)',
        DEFAULT: '0 2px 4px var(--tw-shadow-color)',
        lg: '0 8px 16px var(--tw-shadow-color)',
      },
    },
  },
  darkMode: "class",
  plugins: [
    heroui(),
    function({ addUtilities }) {
    const newUtilities = {
        // Text gradients
      '.text-gradient': {
        'background-clip': 'text',
        '-webkit-background-clip': 'text',
        'color': 'transparent',
      },
        '.text-gradient-gold': {
          'background': 'linear-gradient(135deg, hsl(45, 75%, 48%), hsl(45, 75%, 43%), hsl(45, 75%, 38%))',
          'background-clip': 'text',
          '-webkit-background-clip': 'text',
          'color': 'transparent',
          'background-size': '200% 200%',
          'animation': 'gradient-shift 3s ease infinite',
        },
        '.text-gradient-luxury': {
          'background': 'linear-gradient(135deg, hsl(45, 75%, 58%), hsl(351, 50%, 58%), hsl(214, 32%, 85%))',
          'background-clip': 'text',
          '-webkit-background-clip': 'text',
          'color': 'transparent',
          'background-size': '200% 200%',
          'animation': 'gradient-shift 4s ease infinite',
        },
        // Glass effects
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
        '.glass-card': {
          'background': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
          'backdrop-filter': 'blur(20px)',
          'border': '1px solid rgba(255, 255, 255, 0.15)',
          'border-radius': '1rem',
          'box-shadow': '0 8px 32px rgba(0, 0, 0, 0.3)',
          'transition': 'all 0.3s ease',
        },
        // Premium cards
        '.card-premium': {
          'background': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
          'backdrop-filter': 'blur(20px)',
          'border': '1px solid rgba(212, 175, 55, 0.2)',
          'border-radius': '1.5rem',
          'padding': '2rem',
          'box-shadow': '0 10px 15px -3px rgba(10, 22, 40, 0.3), 0 4px 6px -2px rgba(10, 22, 40, 0.1), 0 0 0 1px rgba(212, 175, 55, 0.1)',
          'transition': 'all 0.3s ease',
        },
        // Buttons
        '.btn-luxury': {
          'background': 'linear-gradient(135deg, hsl(45, 75%, 48%), hsl(45, 75%, 43%), hsl(45, 75%, 38%))',
          'color': 'hsl(222, 84%, 10%)',
          'font-weight': '600',
          'padding': '0.75rem 2rem',
          'border-radius': '0.5rem',
          'border': 'none',
          'letter-spacing': '0.025em',
          'text-transform': 'uppercase',
          'font-size': '0.875rem',
          'transition': 'all 0.3s ease',
          'box-shadow': '0 10px 15px -3px rgba(10, 22, 40, 0.3), 0 4px 6px -2px rgba(10, 22, 40, 0.1), 0 0 0 1px rgba(212, 175, 55, 0.1)',
          'position': 'relative',
          'overflow': 'hidden',
        },
        // Input styles
        '.input-luxury': {
          'background': 'rgba(255, 255, 255, 0.05)',
          'border': '1px solid rgba(255, 255, 255, 0.1)',
          'border-radius': '0.75rem',
          'padding': '1rem 1.5rem',
          'color': 'hsl(214, 32%, 95%)',
          'font-size': '1rem',
          'backdrop-filter': 'blur(10px)',
          'transition': 'all 0.3s ease',
          'width': '100%',
        },
        // Interactive elements
        '.interactive-hover': {
          'transition': 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        },
        // Neumorphism
      '.neumorphism': {
        'box-shadow': '10px 10px 20px rgba(0, 0, 0, 0.1), -10px -10px 20px rgba(255, 255, 255, 0.5)',
      },
      '.neumorphism-dark': {
        'box-shadow': '10px 10px 20px rgba(0, 0, 0, 0.3), -10px -10px 20px rgba(255, 255, 255, 0.05)',
      },
        // Spacing utilities
        '.space-luxury': {
          'margin-bottom': '4rem',
        },
        '.space-luxury-lg': {
          'margin-bottom': '6rem',
        },
        '.space-luxury-xl': {
          'margin-bottom': '8rem',
        },
    };
    addUtilities(newUtilities);
    }
  ],
};
