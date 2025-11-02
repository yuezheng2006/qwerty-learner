# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Qwerty Learner is a typing practice application designed for keyboard workers to improve English typing muscle memory while memorizing vocabulary. It combines English word memorization with keyboard input training through various dictionaries and practice modes.

## Common Development Commands

### Development
- `yarn dev` or `yarn start` - Start development server on http://localhost:5173
- `yarn build` - Build for production with base path `./`
- `yarn lint` - Run ESLint on the codebase
- `yarn prettier` - Format code with Prettier

### Testing
- `yarn test` - Currently no tests configured
- `yarn test:e2e` - Run Playwright end-to-end tests

### Setup
- `yarn install` - Install dependencies
- `yarn prepare` - Install husky git hooks

## Architecture & Technology Stack

### Core Technologies
- **React 18** with TypeScript
- **Vite** as build tool
- **Jotai** for state management (atomic state management)
- **Dexie** for IndexedDB database operations
- **Tailwind CSS** for styling
- **React Router** for navigation

### State Management
The application uses Jotai for atomic state management with `atomWithStorage` for persistence:
- `currentDictIdAtom` - Current selected dictionary
- `currentChapterAtom` - Current chapter index
- Configuration atoms for sounds, pronunciation, display settings
- All configurations use custom `atomForConfig` utility for persistence

### Database Architecture
Uses Dexie (IndexedDB wrapper) with multiple record types:
- `wordRecords` - Individual word typing records
- `chapterRecords` - Chapter completion records
- `reviewRecords` - Review session records
- Each record stores timing data, error counts, and user performance metrics

### Key Directories Structure

#### `/src/pages/`
- `Typing/` - Main typing practice interface with components for word display, input handling, and results
- `Gallery/` & `Gallery-N/` - Dictionary selection and chapter management (Gallery is legacy, Gallery-N is current)
- `Analysis/` - Performance analytics with charts and statistics
- `ErrorBook/` - Review of incorrectly typed words

#### `/src/components/`
- Reusable UI components including custom `ui/` components built with Radix UI
- Feature-specific components for donation, navigation, and settings

#### `/src/utils/db/`
- Database operations using Dexie
- Record management and data export/import functionality

#### `/src/resources/`
- Dictionary data and metadata
- Sound resources for typing feedback
- Language-specific configurations

#### `/src/hooks/`
- Custom React hooks for pronunciation, speech synthesis, and UI interactions

## Key Features Implementation

### Typing Engine
- Real-time input validation with visual feedback
- Character-by-character error tracking
- Speed and accuracy calculations
- Sound effects for correct/incorrect input

### Dictionary System
- Multiple language dictionaries (CET-4/6, TOEFL, GRE, etc.)
- Chapter-based organization
- Programmer-specific API dictionaries
- Dynamic dictionary loading

### Performance Analytics
- Heatmaps for keyboard usage patterns
- Speed tracking over time
- Error frequency analysis
- Export functionality for data

### Audio Features
- Word pronunciation using Web Speech API
- Configurable typing sounds
- Multiple pronunciation accents (US/UK)

## Development Guidelines

### State Management
- Use Jotai atoms for global state
- Prefer `atomWithStorage` for persistent configurations
- Keep atoms focused and composable

### Database Operations
- Use the provided custom hooks (`useSaveWordRecord`, `useSaveChapterRecord`)
- Follow the existing record structure for consistency
- Handle database errors gracefully

### Component Structure
- Components in `/src/components/ui/` use Radix UI primitives
- Use Tailwind CSS for styling with `cn()` utility for conditional classes
- Follow the existing component naming conventions

### TypeScript Configuration
- Strict TypeScript enabled
- Path aliases configured: `@/*` maps to `src/*`
- CSS modules with camelCase class naming

## Deployment

The application is configured for deployment to:
- **GitHub Pages** - Default static hosting
- **Vercel** - Preferred deployment platform
- Build output directory: `build/`
- Base path configured as `./` for relative asset loading

## Browser Compatibility

Supports modern browsers with:
- ES5 target for broad compatibility
- React 18 features
- IndexedDB for local storage
- Web Speech API for pronunciation
- CSS Modules and modern CSS features