
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
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: '#FFFFFF',
        primary: {
          DEFAULT: '#FFFFFF',
          foreground: '#FFFFFF'
        },
        secondary: {
          DEFAULT: '#22232A',
          foreground: '#FFFFFF'
        },
        destructive: {
          DEFAULT: '#FFFFFF',
          foreground: '#FFFFFF'
        },
        muted: {
          DEFAULT: '#22232A',
          foreground: '#FFFFFF'
        },
        accent: {
          DEFAULT: '#FFFFFF',
          foreground: '#FFFFFF'
        },
        popover: {
          DEFAULT: '#22232A',
          foreground: '#FFFFFF'
        },
        card: {
          DEFAULT: '#26272b',
          foreground: '#FFFFFF'
        },
        upvote: '#27D471',        // green (used for upvote, trending icon, etc)
        downvote: '#27D471',      // green for thumbs-down as well
        green: {
          DEFAULT: '#27D471',
        },
        neutral: {
          DEFAULT: '#18181b',
          foreground: '#FFFFFF'
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['DM Serif Display', 'serif']
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

