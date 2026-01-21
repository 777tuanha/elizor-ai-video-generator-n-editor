export type ShotStatus = 'empty' | 'has-video' | 'used'

export interface Shot {
  id: string // UUID
  index: number // Order in story
  duration: number // Target duration in seconds
  visual: string // Visual description
  camera: string // Camera instruction
  transition: string // Transition rule
  status: ShotStatus
  usedVideoId?: string // Reference to selected video
  lastFrameUrl?: string // Extracted frame for continuity
}
