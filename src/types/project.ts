import { Shot } from './shot'

export interface ProjectSettings {
  platform: 'tiktok'
  aspectRatio: '9:16'
  targetDuration: number // Seconds
  resolution: { width: 1080; height: 1920 }
}

export interface Project {
  id: string // UUID
  title: string
  settings: ProjectSettings
  shots: Shot[]
  timelineOrder: string[] // Shot IDs in timeline order
  createdAt: number
  updatedAt: number
}
