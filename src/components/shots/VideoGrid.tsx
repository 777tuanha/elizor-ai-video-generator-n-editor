import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { useProjectStore } from '@/stores/projectStore'
import { VideoClip } from '@/types/video'
import { DropZone } from '@/components/common/DropZone'
import { VideoThumbnail } from './VideoThumbnail'
import { VideoPreviewDialog } from './VideoPreviewDialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import {
  validateVideoFile,
  getVideoDuration,
  generateVideoThumbnail,
} from '@/utils/fileHelpers'

interface VideoGridProps {
  shotId: string
}

export function VideoGrid({ shotId }: VideoGridProps) {
  const getShotVideos = useProjectStore(state => state.getShotVideos)
  const addVideo = useProjectStore(state => state.addVideo)
  const markVideoAsUsed = useProjectStore(state => state.markVideoAsUsed)
  const deleteVideo = useProjectStore(state => state.deleteVideo)

  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewVideo, setPreviewVideo] = useState<VideoClip | null>(null)

  const videos = getShotVideos(shotId)

  const handleFilesSelected = async (files: File[]) => {
    setError(null)
    setUploading(true)

    try {
      for (const file of files) {
        // Validate file
        const validation = validateVideoFile(file)
        if (!validation.valid) {
          setError(validation.error || 'Invalid file')
          continue
        }

        // Get video duration
        const duration = await getVideoDuration(file)

        // Generate thumbnail
        let thumbnailUrl: string | undefined
        try {
          thumbnailUrl = await generateVideoThumbnail(file)
        } catch (err) {
          console.warn('Failed to generate thumbnail:', err)
          // Continue without thumbnail
        }

        // Create video clip
        const videoClip: VideoClip = {
          id: uuidv4(),
          shotId,
          fileName: file.name,
          blobUrl: URL.createObjectURL(file),
          blob: file,
          duration,
          isUsed: false,
          thumbnailUrl,
          createdAt: Date.now(),
        }

        // Add to store
        await addVideo(shotId, videoClip)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload video')
    } finally {
      setUploading(false)
    }
  }

  const handleMarkAsUsed = (videoId: string) => {
    markVideoAsUsed(shotId, videoId)
  }

  const handleDelete = async (videoId: string) => {
    await deleteVideo(videoId)
  }

  const handlePlay = (video: VideoClip) => {
    setPreviewVideo(video)
  }

  // Sort videos - used first, then by creation date
  const sortedVideos = [...videos].sort((a, b) => {
    if (a.isUsed && !b.isUsed) return -1
    if (!a.isUsed && b.isUsed) return 1
    return b.createdAt - a.createdAt
  })

  return (
    <div className="space-y-4">
      <DropZone
        onFilesSelected={handleFilesSelected}
        disabled={uploading}
      />

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {uploading && (
        <Alert>
          <AlertDescription>Uploading videos...</AlertDescription>
        </Alert>
      )}

      {sortedVideos.length > 0 && (
        <div className="grid grid-cols-1 gap-4">
          {sortedVideos.map(video => (
            <VideoThumbnail
              key={video.id}
              video={video}
              onPlay={() => handlePlay(video)}
              onMarkAsUsed={() => handleMarkAsUsed(video.id)}
              onDelete={() => handleDelete(video.id)}
            />
          ))}
        </div>
      )}

      <VideoPreviewDialog
        video={previewVideo}
        open={!!previewVideo}
        onOpenChange={open => !open && setPreviewVideo(null)}
      />
    </div>
  )
}
