
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
        border: '#E5E7EB',           // light gray border
        input: '#F3F4F6',            // even lighter input background
        ring: '#E5E7EB',
        background: '#FFFFFF',        // pure white background
        foreground: '#111827',        // dark text for contrast

        primary: {
          DEFAULT: '#7E69AB',        // purple primary
          foreground: '#FFFFFF'       // white text on primary
        },
        secondary: {
          DEFAULT: '#F9FAFB',        // very light gray
          foreground: '#4B5563'      // darker gray text
        },
        destructive: {
          DEFAULT: '#ea384c',
          foreground: '#FFFFFF'
        },
        muted: {
          DEFAULT: '#F3F4F6',
          foreground: '#6B7280'      // medium gray text
        },
        accent: {
          DEFAULT: '#F3F4F6',        // light accent background
          foreground: '#111827'
        },
        popover: {
          DEFAULT: '#FFFFFF',
          foreground: '#111827'
        },
        card: {
          DEFAULT: '#FFFFFF',        // white card background
          foreground: '#111827'
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
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

