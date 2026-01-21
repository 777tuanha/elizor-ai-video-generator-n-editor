export interface VideoClip {
  id: string // UUID
  shotId: string // Parent shot reference
  fileName: string // Original filename
  blobUrl: string // Object URL for playback
  blob: Blob // Actual video data
  duration: number // Actual duration in seconds
  isUsed: boolean // Selected for timeline
  thumbnailUrl?: string // Preview thumbnail
  createdAt: number // Timestamp
}
