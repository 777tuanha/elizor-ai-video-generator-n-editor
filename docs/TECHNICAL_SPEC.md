# Elizor MVP - Technical Specification & Implementation Plan

## Executive Summary

Build a local-first, React/TypeScript video editor that enables creators to assemble AI-generated video clips into coherent TikTok videos with shot continuity guidance.

---

## 1. Technology Stack

### Core Technologies
- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite (fast HMR, ESM-native)
- **Styling**: Tailwind CSS (rapid UI development)
- **UI Components**: shadcn/ui (Radix-based, accessible components)
- **State Management**: Zustand (lightweight, TypeScript-friendly)
- **Storage**: IndexedDB via Dexie.js (local-first persistence)
- **Video Processing**: HTML5 Video API + Canvas API
- **Export**: FFmpeg.wasm (client-side video stitching)
- **File Handling**: Native File System API with fallback

### Dev Dependencies
- ESLint + Prettier (code quality)
- Vitest (unit testing)
- Playwright (E2E testing)
- TypeScript strict mode

### shadcn/ui Components to Use
- Button, Dialog, Card, Tabs
- DropdownMenu, ContextMenu
- ScrollArea (timeline)
- Progress (export)
- Tooltip, Toast
- Input, Textarea

---

## 2. Project Structure

```
elizor/
├── public/
│   └── ffmpeg/              # FFmpeg.wasm files
├── src/
│   ├── components/
│   │   ├── ui/              # shadcn/ui components (auto-generated)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── scroll-area.tsx
│   │   │   ├── progress.tsx
│   │   │   └── ...
│   │   ├── layout/
│   │   │   ├── MenuBar.tsx
│   │   │   ├── MainLayout.tsx
│   │   │   └── Section.tsx
│   │   ├── preview/
│   │   │   ├── VideoPlayer.tsx
│   │   │   └── PlaybackControls.tsx
│   │   ├── shots/
│   │   │   ├── ShotList.tsx
│   │   │   ├── ShotCard.tsx
│   │   │   └── ShotEditor.tsx
│   │   ├── timeline/
│   │   │   ├── Timeline.tsx
│   │   │   ├── TimelineTrack.tsx
│   │   │   └── TimelineClip.tsx
│   │   └── common/
│   │       └── DropZone.tsx
│   ├── hooks/
│   │   ├── useProject.ts
│   │   ├── useVideoPlayer.ts
│   │   ├── useFrameExtractor.ts
│   │   └── useDragAndDrop.ts
│   ├── stores/
│   │   ├── projectStore.ts
│   │   └── uiStore.ts
│   ├── services/
│   │   ├── db.ts              # Dexie database
│   │   ├── videoProcessor.ts  # Frame extraction
│   │   ├── exporter.ts        # FFmpeg export
│   │   └── scriptParser.ts    # JSON validation
│   ├── types/
│   │   ├── project.ts
│   │   ├── shot.ts
│   │   └── video.ts
│   ├── utils/
│   │   ├── fileHelpers.ts
│   │   ├── timeFormat.ts
│   │   └── validators.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── tests/
│   ├── unit/
│   └── e2e/
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
└── README.md
```

---

## 3. Data Models (TypeScript)

```typescript
// types/shot.ts
export type ShotStatus = 'empty' | 'has-video' | 'used';

export interface Shot {
  id: string;                    // UUID
  index: number;                 // Order in story
  duration: number;              // Target duration in seconds
  visual: string;                // Visual description
  camera: string;                // Camera instruction
  transition: string;            // Transition rule
  status: ShotStatus;
  usedVideoId?: string;          // Reference to selected video
  lastFrameUrl?: string;         // Extracted frame for continuity
}

// types/video.ts
export interface VideoClip {
  id: string;                    // UUID
  shotId: string;                // Parent shot reference
  fileName: string;              // Original filename
  blobUrl: string;               // Object URL for playback
  blob: Blob;                    // Actual video data
  duration: number;              // Actual duration
  isUsed: boolean;               // Selected for timeline
  thumbnailUrl?: string;         // Preview thumbnail
  createdAt: number;             // Timestamp
}

// types/project.ts
export interface ProjectSettings {
  platform: 'tiktok';
  aspectRatio: '9:16';
  targetDuration: number;        // Seconds
  resolution: { width: 1080; height: 1920 };
}

export interface Project {
  id: string;                    // UUID
  title: string;
  settings: ProjectSettings;
  shots: Shot[];
  timelineOrder: string[];       // Shot IDs in timeline order
  createdAt: number;
  updatedAt: number;
}

// types/storyScript.ts (JSON import schema)
export interface StoryScriptShot {
  duration: number;
  visual: string;
  camera: string;
  transition: string;
}

export interface StoryScript {
  title: string;
  shots: StoryScriptShot[];
}
```

---

## 4. State Management (Zustand)

```typescript
// stores/projectStore.ts
interface ProjectState {
  // Data
  project: Project | null;
  videos: Map<string, VideoClip[]>;  // shotId -> videos

  // Actions
  createProject: (title: string, settings: ProjectSettings) => void;
  loadProject: (id: string) => Promise<void>;
  loadStoryScript: (script: StoryScript) => void;

  // Shot actions
  updateShot: (shotId: string, updates: Partial<Shot>) => void;
  reorderShots: (fromIndex: number, toIndex: number) => void;
  deleteShot: (shotId: string) => void;
  duplicateShot: (shotId: string) => void;

  // Video actions
  addVideo: (shotId: string, video: VideoClip) => void;
  markVideoAsUsed: (shotId: string, videoId: string) => void;
  deleteVideo: (videoId: string) => void;

  // Timeline actions
  updateTimelineOrder: (order: string[]) => void;
}
```

---

## 5. Implementation Phases

---

### PHASE 1: Project Foundation (Testable Checkpoint)

**Goal**: Basic project setup with working dev environment

**Tasks**:
1. Initialize Vite + React + TypeScript project
2. Configure Tailwind CSS
3. Initialize shadcn/ui with required components
4. Set up ESLint, Prettier, Vitest
5. Create base component structure
6. Implement basic layout (MenuBar, 3-section grid)
7. Create placeholder components

**Commands to Run**:
```bash
npm create vite@latest elizor -- --template react-ts
cd elizor
npm install
npx shadcn@latest init
npx shadcn@latest add button card dialog tabs scroll-area progress tooltip
```

**Files to Create**:
- `package.json`, `vite.config.ts`, `tsconfig.json`, `tailwind.config.js`
- `components.json` (shadcn config)
- `src/main.tsx`, `src/App.tsx`, `src/index.css`
- `src/lib/utils.ts` (cn helper for shadcn)
- `src/components/layout/*`

**Test Criteria**:
- [ ] `npm run dev` starts dev server without errors
- [ ] App renders with 3-section layout visible
- [ ] Tailwind styles apply correctly
- [ ] shadcn/ui Button component renders correctly
- [ ] `npm run test` passes (placeholder tests)
- [ ] `npm run build` completes without errors

---

### PHASE 2: Data Layer & Project Management (Testable Checkpoint)

**Goal**: Persistent storage and project CRUD

**Tasks**:
1. Set up Dexie.js with IndexedDB
2. Implement data models
3. Create Zustand store
4. Build project creation flow
5. Implement project save/load

**Files to Create**:
- `src/types/*.ts`
- `src/services/db.ts`
- `src/stores/projectStore.ts`
- `src/components/common/Modal.tsx`
- Project creation modal component

**Test Criteria**:
- [ ] Can create new project with title and settings
- [ ] Project persists after page refresh
- [ ] Can load existing project
- [ ] Unit tests for store actions pass
- [ ] IndexedDB contains correct data structure

---

### PHASE 3: Story Script Loader (Testable Checkpoint)

**Goal**: Import and validate JSON story scripts

**Tasks**:
1. Design JSON schema validator
2. Create script paste/upload UI
3. Parse and validate script
4. Generate shots from script
5. Display validation errors

**Files to Create**:
- `src/services/scriptParser.ts`
- `src/utils/validators.ts`
- Script loader modal component

**JSON Schema**:
```json
{
  "title": "string (required)",
  "shots": [
    {
      "duration": "number (required, > 0)",
      "visual": "string (required)",
      "camera": "string (required)",
      "transition": "string (required)"
    }
  ]
}
```

**Test Criteria**:
- [ ] Valid JSON loads successfully
- [ ] Invalid JSON shows specific error messages
- [ ] Shots appear in shot list after load
- [ ] Can replace existing script (with confirmation)
- [ ] Unit tests for parser cover edge cases

---

### PHASE 4: Shot List & Shot Editor (Testable Checkpoint)

**Goal**: View and manage shots

**Tasks**:
1. Build ShotList component with status indicators
2. Build ShotCard with metadata display
3. Build ShotEditor panel
4. Implement shot selection
5. Implement shot reorder (drag & drop)
6. Implement shot delete/duplicate
7. Create "Copy Prompt" functionality

**Files to Create**:
- `src/components/shots/*`
- `src/hooks/useDragAndDrop.ts`

**Test Criteria**:
- [ ] Shot list displays all shots with correct status
- [ ] Clicking shot selects it and shows editor
- [ ] Can drag to reorder shots
- [ ] Delete removes shot (with confirmation)
- [ ] Duplicate creates copy with "Copy" suffix
- [ ] Copy Prompt copies formatted text to clipboard

---

### PHASE 5: Video Upload & Management (Testable Checkpoint)

**Goal**: Upload and manage video clips per shot

**Tasks**:
1. Build DropZone component for file upload
2. Implement video file validation (format, size)
3. Store videos in IndexedDB as Blobs
4. Display video thumbnails
5. Implement video preview playback
6. Implement "Mark as Used" functionality
7. Update shot status based on videos

**Files to Create**:
- `src/components/common/DropZone.tsx`
- `src/components/shots/VideoGrid.tsx`
- `src/components/shots/VideoThumbnail.tsx`
- `src/hooks/useVideoPlayer.ts`

**Test Criteria**:
- [ ] Can upload MP4/WebM videos via drag & drop
- [ ] Can upload via file picker
- [ ] Invalid files show error message
- [ ] Videos display as thumbnails
- [ ] Can preview video in modal
- [ ] "Mark as Used" highlights video and updates shot
- [ ] Only one video per shot can be "Used"
- [ ] Shot status updates: empty → has-video → used

---

### PHASE 6: Frame Extraction & Continuity (Testable Checkpoint)

**Goal**: Extract last frame for shot continuity

**Tasks**:
1. Implement Canvas-based frame extraction
2. Extract last frame when video marked as Used
3. Display previous shot's last frame in editor
4. Generate continuity instruction text
5. Include frame reference in copy prompt

**Files to Create**:
- `src/services/videoProcessor.ts`
- `src/hooks/useFrameExtractor.ts`
- `src/components/shots/FrameReference.tsx`

**Test Criteria**:
- [ ] Last frame extracted as PNG when video marked Used
- [ ] Previous shot's last frame displays in Shot 2+ editor
- [ ] Continuity instruction shows in shot editor
- [ ] Copy prompt includes continuity reference
- [ ] Frame extraction works on different video formats

---

### PHASE 7: Video Preview Player (Testable Checkpoint)

**Goal**: Main video preview with playback controls

**Tasks**:
1. Build VideoPlayer component
2. Implement play/pause/seek
3. Implement play from selected shot
4. Implement full preview (all used videos)
5. Show current position indicator

**Files to Create**:
- `src/components/preview/VideoPlayer.tsx`
- `src/components/preview/PlaybackControls.tsx`
- `src/components/preview/ProgressBar.tsx`

**Test Criteria**:
- [ ] Player displays in 9:16 aspect ratio
- [ ] Play/pause works correctly
- [ ] Seeking works with progress bar
- [ ] "Play from shot" starts at selected shot
- [ ] Full preview plays all used videos in sequence
- [ ] Current shot highlights during playback

---

### PHASE 8: Timeline Assembly (Testable Checkpoint)

**Goal**: Drag & drop timeline for shot ordering

**Tasks**:
1. Build horizontal scrolling Timeline
2. Display only shots with "Used" videos
3. Implement drag & drop reordering
4. Sync timeline order with preview
5. Show clip duration on timeline

**Files to Create**:
- `src/components/timeline/*`

**Test Criteria**:
- [ ] Timeline shows only "used" shots
- [ ] Clips display with correct duration width
- [ ] Can drag to reorder clips
- [ ] Timeline order syncs with preview playback
- [ ] Timeline updates when shot marked used/unused
- [ ] Horizontal scroll works for long videos

---

### PHASE 9: Export Functionality (Testable Checkpoint)

**Goal**: Export final video as MP4

**Tasks**:
1. Integrate FFmpeg.wasm
2. Implement video concatenation
3. Build export progress UI
4. Handle export errors
5. Trigger download on completion

**Files to Create**:
- `src/services/exporter.ts`
- `src/components/common/ExportModal.tsx`

**Export Specs**:
- Format: MP4 (H.264)
- Resolution: 1080x1920
- Aspect Ratio: 9:16
- Frame Rate: 30fps (match source)

**Test Criteria**:
- [ ] Export button disabled when no used videos
- [ ] Progress bar shows during export
- [ ] Exported video plays correctly
- [ ] Exported video has correct resolution
- [ ] Clips appear in correct order
- [ ] Export can be cancelled
- [ ] Error handling for FFmpeg failures

---

### PHASE 10: Polish & UX (Final Checkpoint)

**Goal**: Production-ready MVP

**Tasks**:
1. Add keyboard shortcuts
2. Implement undo/redo
3. Add loading states and skeletons
4. Add error boundaries
5. Performance optimization
6. Responsive adjustments
7. Final testing pass

**Keyboard Shortcuts**:
- `Space`: Play/pause
- `←/→`: Previous/next shot
- `Delete`: Delete selected
- `Cmd/Ctrl + Z`: Undo
- `Cmd/Ctrl + S`: Save project
- `Cmd/Ctrl + E`: Export

**Test Criteria**:
- [ ] All keyboard shortcuts work
- [ ] Undo/redo works for major actions
- [ ] No console errors in production build
- [ ] Performance: < 100ms for most interactions
- [ ] E2E test suite passes
- [ ] Works in Chrome, Firefox, Safari

---

## 6. Testing Strategy

### Unit Tests (Vitest)
- Store actions
- Script parser
- Validators
- Utility functions
- Frame extraction logic

### Integration Tests
- Project create/load flow
- Script import flow
- Video upload flow
- Timeline operations

### E2E Tests (Playwright)
- Full workflow: Create → Import → Upload → Export
- Error handling flows
- Keyboard navigation

---

## 7. Verification Plan

After each phase, verify:

1. **Build Check**: `npm run build` succeeds
2. **Test Check**: `npm run test` passes
3. **Manual Check**: Feature works as described
4. **Regression Check**: Previous features still work

Final verification:
1. Create new project
2. Load sample story script
3. Upload videos for each shot
4. Mark videos as used
5. Verify frame extraction
6. Reorder timeline
7. Export final video
8. Play exported video - verify quality and order

---

## 8. Sample Story Script (for testing)

```json
{
  "title": "Product Launch Teaser",
  "shots": [
    {
      "duration": 3,
      "visual": "Close-up of mysterious box on table, dramatic lighting",
      "camera": "Slow push in, shallow depth of field",
      "transition": "Quick cut"
    },
    {
      "duration": 4,
      "visual": "Hands opening the box, revealing golden light",
      "camera": "Eye-level, steady shot",
      "transition": "Match cut on light"
    },
    {
      "duration": 5,
      "visual": "Product reveal with particle effects",
      "camera": "360 degree orbit shot",
      "transition": "Fade to white"
    },
    {
      "duration": 3,
      "visual": "Logo and call to action on dark background",
      "camera": "Static centered frame",
      "transition": "End"
    }
  ]
}
```

---

## 9. Risk Mitigation

| Risk | Mitigation |
|------|------------|
| FFmpeg.wasm performance | Show progress, allow cancel, suggest smaller clips |
| Large video files | Warn on upload > 100MB, compress if needed |
| IndexedDB quota | Monitor usage, warn at 80%, offer cleanup |
| Browser compatibility | Feature detection, graceful degradation |
| Video format issues | Validate on upload, whitelist formats |

---

## 10. Dependencies Summary

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "zustand": "^4.4.0",
    "dexie": "^3.2.0",
    "dexie-react-hooks": "^1.1.0",
    "@ffmpeg/ffmpeg": "^0.12.0",
    "@ffmpeg/util": "^0.12.0",
    "uuid": "^9.0.0",
    "@radix-ui/react-dialog": "^1.0.0",
    "@radix-ui/react-dropdown-menu": "^2.0.0",
    "@radix-ui/react-scroll-area": "^1.0.0",
    "@radix-ui/react-tabs": "^1.0.0",
    "@radix-ui/react-tooltip": "^1.0.0",
    "@radix-ui/react-progress": "^1.0.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0",
    "lucide-react": "^0.300.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.2.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "eslint": "^8.56.0",
    "prettier": "^3.2.0",
    "vitest": "^1.2.0",
    "@testing-library/react": "^14.1.0",
    "playwright": "^1.41.0",
    "tailwindcss-animate": "^1.0.7"
  }
}
```

---

## Ready for Implementation

This specification provides 10 testable phases. Each phase:
- Has clear deliverables
- Can be verified independently
- Builds on previous phases
- Has specific test criteria

Recommended approach: Complete each phase fully before moving to the next. This ensures a stable foundation and makes debugging easier.
