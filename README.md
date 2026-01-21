# Elizor - AI Video Editor

A hybrid, AI-assisted video generator and editor that helps creators turn ideas into structured, continuous TikTok videos.

## Project Status

**Phase 1: Project Foundation** ✅ COMPLETE

- ✅ Vite + React + TypeScript setup
- ✅ Tailwind CSS configured
- ✅ shadcn/ui components integrated
- ✅ ESLint, Prettier, Vitest configured
- ✅ 3-section layout implemented
- ✅ Dev server, build, and tests verified

**Phase 2: Data Layer & Project Management** ✅ COMPLETE

- ✅ TypeScript data models (Project, Shot, VideoClip, StoryScript)
- ✅ Dexie.js database with IndexedDB
- ✅ Zustand store with full CRUD operations
- ✅ Project creation modal (Dialog + Form)
- ✅ Auto-load most recent project
- ✅ Auto-save on changes
- ✅ Unit tests for store (7/7 passing)

**Phase 3: Story Script Loader** ✅ COMPLETE

- ✅ JSON schema validator with comprehensive validation
- ✅ Script parser service with detailed error messages
- ✅ LoadScriptDialog with paste/upload UI
- ✅ Sample script button for quick testing
- ✅ Confirmation dialog for replacing existing shots
- ✅ Shot list displays loaded shots with status
- ✅ Unit tests for parser (15/15 passing)

**Phase 4: Shot List & Shot Editor** ✅ COMPLETE

- ✅ ShotCard component with visual metadata display
- ✅ ShotList with clickable shot selection
- ✅ Drag & drop shot reordering (native HTML5)
- ✅ ShotEditor panel with left/right layout
- ✅ Copy Prompt to clipboard functionality
- ✅ Delete shot with confirmation dialog
- ✅ Duplicate shot functionality
- ✅ Visual status indicators (empty/has-video/used)

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm run test

# Run linter
npm run lint
```

### Development Server

The app will be available at `http://localhost:5173/`

## Project Structure

```
elizor/
├── docs/                    # Documentation
│   └── TECHNICAL_SPEC.md   # Technical specification
├── src/
│   ├── components/
│   │   ├── ui/             # shadcn/ui components
│   │   ├── layout/         # Layout components
│   │   └── project/        # Project-related components
│   ├── stores/             # Zustand state management
│   ├── services/           # Database & business logic
│   ├── types/              # TypeScript type definitions
│   ├── lib/                # Utilities
│   └── test/               # Test setup
├── PRD.md                  # Product Requirements Document
└── package.json
```

## Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI)
- **State Management**: Zustand ✅
- **Storage**: Dexie.js / IndexedDB ✅
- **Video Processing**: HTML5 Video API + Canvas (planned)
- **Export**: FFmpeg.wasm (planned)

## Next Steps

See [docs/TECHNICAL_SPEC.md](docs/TECHNICAL_SPEC.md) for the full implementation plan.

**Phase 5**: Video Upload & Management
- Build DropZone component for file upload
- Implement video file validation (format, size)
- Store videos in IndexedDB as Blobs
- Display video thumbnails
- Implement video preview playback
- Implement "Mark as Used" functionality
- Update shot status based on videos

## Documentation

- [PRD.md](PRD.md) - Product Requirements Document
- [docs/TECHNICAL_SPEC.md](docs/TECHNICAL_SPEC.md) - Technical Specification & Implementation Plan

## License

Private project
