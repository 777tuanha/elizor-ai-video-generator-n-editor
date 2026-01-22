export type ShotStatus = 'empty' | 'has-video' | 'used'

export interface Shot {
  // System fields (generated/managed by app)
  id: string // UUID
  index: number // Order in story
  status: ShotStatus
  usedVideoId?: string // Reference to selected video
  lastFrameUrl?: string // Extracted frame for continuity

  // Required shot fields (from script)
  duration: number // Target duration in seconds
  visual: string // Visual description
  camera: string // Camera instruction
  transition: string // Transition rule

  // Optional field
  dialogue?: string

  // Allow any additional optional fields
  [key: string]: any
}
