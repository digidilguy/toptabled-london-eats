
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
        // Deep, rich neutral blacks for background/card/border.
        border: '#23232a',           // softer dark grey for borders
        input: '#23232a',
        ring: '#23232a',
        background: '#181820',       // nearly black, slight blue influence
        foreground: '#FFFFFF',

        primary: {
          DEFAULT: '#FFFFFF',
          foreground: '#FFFFFF'
        },
        secondary: {
          DEFAULT: '#222229',        // slightly lighter than bg (for subtle blocks)
          foreground: '#FFFFFF'
        },
        destructive: {
          DEFAULT: '#ea384c',
          foreground: '#FFFFFF'
        },
        muted: {
          DEFAULT: '#222229',
          foreground: '#FFFFFF'
        },
        accent: {
          DEFAULT: '#23232a',
          foreground: '#FFFFFF'
        },
        popover: {
          DEFAULT: '#23232a',
          foreground: '#FFFFFF'
        },
        card: {
          DEFAULT: '#23232a',        // distinct deep card panel
          foreground: '#FFFFFF'
        },
        upvote: '#27D471',           // green, keep as in your design
        downvote: '#ea384c',         // red, keep as in your design

        neutral: {
          DEFAULT: '#18181b',
          foreground: '#FFFFFF'
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      borderRadius: {
        lg: '1.2rem',
        md: '1rem',
        sm: '0.75rem'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['DM Serif Display', 'serif']
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

