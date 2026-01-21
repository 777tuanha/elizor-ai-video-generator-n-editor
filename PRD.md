# PRD — Elizor (MVP)
AI Video Generator & Editor (Hybrid, Human-in-the-Loop)

---

## 1. Product Overview

### Product Name
**Elizor – AI Video Generator & Editor**

### One-line Description
Elizor is a hybrid, AI-assisted video generator and editor that helps creators turn ideas into structured, continuous TikTok videos by guiding story breakdown, shot continuity, and manual video stitching — without forcing fully automated video generation.

### Target Users
- TikTok video editors
- Solo content creators
- Short-form video agencies

### Core Philosophy
- Human-in-the-loop
- Creator keeps creative control
- AI assists **thinking, structure, and continuity**, not replacement

---

## 2. Problem Statement

Creators and editors struggle with:
1. Turning raw ideas into structured short-form stories
2. Maintaining visual continuity across AI-generated clips
3. Iterating shots efficiently without breaking narrative flow

Existing tools (CapCut, Premiere, VN):
- Focus on mechanical editing
- Do not assist with storytelling or shot-to-shot continuity

---

## 3. MVP Goals & Success Criteria

### Primary Goal
Enable users to:
- Import an AI-generated story script
- Manually generate clips externally (Sora / Veo / Runway / Kling / Grok)
- Assemble them into a coherent, continuous TikTok-ready video inside Elizor

### Success Metrics
- User completes a full video using only Elizor
- Editors report 30–50% reduction in planning time
- Willingness to pay 300k–500k VND/month (validation phase)

---

## 4. Non-Goals (Out of Scope)

The MVP will NOT:
- Fully auto-generate AI videos
- Auto-edit or auto-select shots
- Add music, captions, or effects
- Support collaboration or cloud rendering

---

## 5. End-to-End User Workflow

### Phase 0 — Project Setup
1. User creates a new project in Elizor
2. Selects:
   - Platform: TikTok
   - Aspect ratio: 9:16
   - Target duration (e.g. 60s)

---

### Phase 1 — Idea → Story Script (External AI)
1. User opens an AI chatbot (ChatGPT or similar)
2. Pastes Elizor’s provided instruction template
3. Enters idea in natural language
4. AI outputs **JSON-only** story script with shot breakdown

---

### Phase 2 — Load Story Script
1. User loads JSON into Elizor
2. Elizor validates schema
3. Elizor generates:
   - Shot list
   - Timeline placeholders

---

### Phase 3 — Shot Planning (Before Video Creation)
- User reviews all shots
- Can:
  - Edit text instructions
  - Reorder shots
  - Delete or merge shots
- No video is generated yet

---

### Phase 4 — Shot Creation Loop

#### Shot 1 (Hook)
1. User selects Shot 1
2. Copies shot prompt from Elizor
3. Generates video externally
4. Uploads video to Elizor
5. Marks one video as **Used**

#### Shot 2+
1. Elizor extracts last frame from previous used shot
2. Elizor shows:
   - Previous shot last frame
   - Suggested start frame
   - Continuity instruction
3. User generates multiple video versions externally
4. Uploads versions
5. Marks one as **Used**
6. Timeline updates automatically

This loop repeats for all shots.

---

### Phase 5 — Timeline Assembly
- User drags and reorders shots
- Timeline only includes shots with **Used** videos
- Preview updates in real time

---

### Phase 6 — Final Review & Export
- User previews full video
- Exports MP4:
  - 9:16
  - 1080×1920
- Ready for TikTok upload

---

## 6. UI Layout Specification

### Overall Structure (Top → Bottom)

1. Menu Bar
2. Section 1: Video Preview + Shot List
3. Section 2: Timeline
4. Section 3: Shot Editor

---

### Section 1 — Video Preview + Shot List

#### Video Preview
- Main video player
- Modes:
  - Play full video
  - Play from selected shot

#### Shot List
- List of shots
- Shot states:
  - `empty`
  - `has-video`
  - `used`
- Actions:
  - Select
  - Delete
  - Duplicate

---

### Section 2 — Timeline
- Horizontal scroll
- Drag & drop shot order
- Only includes shots with **Used** videos
- Updates preview instantly

---

### Section 3 — Shot Editor

#### Left Panel — Shot Material
- Shot metadata:
  - Visual description
  - Camera instruction
  - Transition rule
- Reference images:
  - Previous shot last frame
  - Suggested start frame
- Action:
  - Copy prompt

#### Right Panel — Generated Videos
- Upload multiple videos per shot
- Preview each video
- Mark one video as **Used**
- Used video:
  - Appears first
  - Binds to timeline

---

## 7. Functional Requirements

### Project Management
- Create project
- Load / replace story script
- Persist project state

---

### Story Script Loader
- Accept pasted or uploaded JSON
- Validate required schema
- Block load if invalid

---

### Frame Extraction (Core Feature)
- When a video is marked **Used**:
  - Extract last frame
  - Store as image
  - Provide as reference for next shot

---

### Export
- Stitch used videos in timeline order
- Export MP4 (9:16, 1080×1920)

---

## 8. Data Models

### Shot
type Shot = {
  id: number
  duration: number
  visual: string
  camera: string
  transition: string
  usedVideoId?: string
}
### VideoClip
type VideoClip = {
  id: string
  shotId: number
  filePath: string
  isUsed: boolean
}
### Project
type Project = {
  title: string
  shots: Shot[]
  timelineOrder: number[]
}
## 9. Technical Specifications
Frontend
React
TypeScript
HTML5 Video API
CSS Grid / Flexbox
Backend (MVP Recommendation)
Local-first
IndexedDB or browser storage
Optional Node.js backend for file handling
Video Processing
HTML5 <video>
Canvas API for frame extraction
Optional FFmpeg.wasm
## 10. AI Usage (MVP)
Included
External AI for story & shot generation
Prompt formatting inside Elizor
Excluded
In-app LLM
Automatic AI video generation
## 11. UX Principles
No forced automation
No irreversible actions
Creator always in control
Iteration-friendly workflow
## 12. MVP Development Phases
Phase 1 — Core
Script loader
Shot list
Video upload
Timeline
Export
Phase 2 — Continuity
Frame extraction
Reference images
Prompt helper
Phase 3 — Polish
Keyboard shortcuts
Performance optimization
UX cleanup
## 13. Instruction for AI Coding Assistant
Build Elizor strictly according to this PRD.
Do not add features outside scope.
Prioritize correctness, clarity, and local-first architecture.
