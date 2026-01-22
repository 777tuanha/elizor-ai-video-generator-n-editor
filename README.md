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

**Phase 5: Video Upload & Management** ✅ COMPLETE

- ✅ DropZone component with drag & drop file upload
- ✅ Video file validation (format: MP4/WebM/MOV, size: max 100MB)
- ✅ Store videos in IndexedDB as Blobs with metadata
- ✅ Auto-generate video thumbnails using Canvas API
- ✅ VideoThumbnail component with preview
- ✅ Video preview dialog with HTML5 video player
- ✅ Mark as Used functionality with visual indicators
- ✅ Auto-update shot status (empty → has-video → used)
- ✅ Delete video with cleanup

**Phase 6: Frame Extraction & Continuity** ✅ COMPLETE

- ✅ Canvas-based frame extraction from videos
- ✅ Extract last frame when video marked as Used
- ✅ Display previous shot's last frame in editor
- ✅ FrameReference component with continuity guidance
- ✅ Enhanced Copy Prompt with continuity instructions
- ✅ Auto-store extracted frames in shot metadata
- ✅ All tests passing (22/22), production build successful

**Phase 7: Video Preview Player** ✅ COMPLETE

- ✅ VideoPlayer component with 9:16 aspect ratio display
- ✅ Play/pause/seek controls with time display
- ✅ Full preview plays all used videos in sequence
- ✅ Play from selected shot functionality
- ✅ Progress bar with segment markers for each shot
- ✅ Current shot indicator during playback
- ✅ Shot highlighting in timeline during playback
- ✅ Automatic transition between video segments
- ✅ All tests passing (22/22), production build successful

**Phase 8: Timeline Assembly** ✅ COMPLETE

- ✅ Horizontal scrolling timeline component
- ✅ Display only shots with "Used" videos
- ✅ TimelineClip component with thumbnail and metadata
- ✅ Drag & drop reordering on timeline (native HTML5)
- ✅ Clip duration visualization (120px per second)
- ✅ Timeline stats (clip count and total duration)
- ✅ Shot selection from timeline
- ✅ Timeline order syncs with preview playback
- ✅ Timeline position indicators
- ✅ All tests passing (22/22), production build successful

**Phase 9: Export Functionality** ✅ COMPLETE

- ✅ FFmpeg.wasm integration for client-side video processing
- ✅ Video concatenation in timeline order
- ✅ ExportDialog with progress UI
- ✅ Real-time export progress tracking (loading, processing, complete phases)
- ✅ Export cancellation with AbortController
- ✅ Comprehensive error handling
- ✅ MP4 export with H.264 codec (1080x1920, 9:16 aspect ratio)
- ✅ Automatic download trigger on completion
- ✅ Export button integrated in MenuBar
- ✅ All tests passing (22/22), production build successful

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
- **Video Processing**: HTML5 Video API + Canvas ✅
- **Export**: FFmpeg.wasm ✅

## Next Steps

See [docs/TECHNICAL_SPEC.md](docs/TECHNICAL_SPEC.md) for the full implementation plan.

**Phase 10**: Polish & UX (Final Phase)
- Keyboard shortcuts (Space: play/pause, ←/→: navigate shots, Delete, Cmd+Z, Cmd+S, Cmd+E)
- Undo/redo functionality
- Loading states and skeleton screens
- Error boundaries
- Performance optimization
- Responsive adjustments
- Final testing and polish

## Documentation

- [PRD.md](PRD.md) - Product Requirements Document
- [docs/TECHNICAL_SPEC.md](docs/TECHNICAL_SPEC.md) - Technical Specification & Implementation Plan

## License

Private project
