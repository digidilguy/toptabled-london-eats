import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px'
      }
    },
    extend: {
      colors: {
        border: '#2A2A2A',           // darker border
        input: '#2A2A2A',
        ring: '#2A2A2A',
        background: '#0A0A0A',       // deeper black background
        foreground: '#FFFFFF',       // white text

        primary: {
          DEFAULT: '#FFFFFF',        // white for primary elements
          foreground: '#0A0A0A'      // black text on primary elements
        },
        secondary: {
          DEFAULT: '#1A1A1A',        // slightly lighter than bg
          foreground: '#FFFFFF'
        },
        destructive: {
          DEFAULT: '#ea384c',
          foreground: '#FFFFFF'
        },
        muted: {
          DEFAULT: '#1A1A1A',
          foreground: '#999999'      // muted text
        },
        accent: {
          DEFAULT: '#2A2A2A',        // accent for cards and UI elements
          foreground: '#FFFFFF'
        },
        popover: {
          DEFAULT: '#1A1A1A',
          foreground: '#FFFFFF'
        },
        card: {
          DEFAULT: '#141414',        // dark card background
          foreground: '#FFFFFF'
        },
        upvote: '#27D471',          
        downvote: '#ea384c',
      },
      borderRadius: {
        lg: '1rem',
        md: '0.75rem',
        sm: '0.5rem'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['DM Serif Display', 'serif']
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
