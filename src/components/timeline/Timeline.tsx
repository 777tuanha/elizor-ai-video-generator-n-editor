import { useState } from 'react'
import { useProjectStore } from '@/stores/projectStore'
import { TimelineClip } from './TimelineClip'
import { ScrollArea } from '@/components/ui/scroll-area'

export function Timeline() {
  const project = useProjectStore(state => state.project)
  const getShotVideos = useProjectStore(state => state.getShotVideos)
  const updateTimelineOrder = useProjectStore(state => state.updateTimelineOrder)
  const selectShot = useProjectStore(state => state.selectShot)
  const selectedShotId = useProjectStore(state => state.selectedShotId)

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  if (!project) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground">No project loaded</p>
      </div>
    )
  }

  // Get shots with used videos in timeline order
  const timelineClips = project.timelineOrder
    .map(shotId => {
      const shot = project.shots.find(s => s.id === shotId)
      if (!shot || shot.status !== 'used') return null

      const videos = getShotVideos(shot.id)
      const usedVideo = videos.find(v => v.isUsed)
      if (!usedVideo) return null

      return { shot, video: usedVideo }
    })
    .filter((clip): clip is { shot: typeof project.shots[0]; video: NonNullable<ReturnType<typeof getShotVideos>[0]> } => clip !== null)

  if (timelineClips.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">Timeline is empty</p>
          <p className="text-xs text-muted-foreground">
            Mark videos as Used to add them to the timeline
          </p>
        </div>
      </div>
    )
  }

  const handleDragStart = (index: number) => (e: React.DragEvent) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', '')
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (dropIndex: number) => (e: React.DragEvent) => {
    e.preventDefault()

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null)
      return
    }

    // Reorder timeline
    const newOrder = [...project.timelineOrder]
    const [removed] = newOrder.splice(draggedIndex, 1)
    newOrder.splice(dropIndex, 0, removed)

    updateTimelineOrder(newOrder)
    setDraggedIndex(null)
  }

  const handleClipSelect = (shotId: string) => {
    selectShot(shotId)
  }

  // Calculate total duration
  const totalDuration = timelineClips.reduce(
    (sum, clip) => sum + clip.video.duration,
    0
  )

  return (
    <div className="flex flex-col h-full">
      {/* Timeline Stats */}
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>{timelineClips.length} clips</span>
          <span>•</span>
          <span>{totalDuration.toFixed(1)}s total</span>
        </div>
      </div>

      {/* Timeline Clips */}
      <ScrollArea className="flex-1">
        <div className="flex gap-2 p-4 h-full items-center">
          {timelineClips.map((clip, index) => (
            <TimelineClip
              key={clip.shot.id}
              shot={clip.shot}
              video={clip.video}
              isSelected={selectedShotId === clip.shot.id}
              onSelect={() => handleClipSelect(clip.shot.id)}
              onDragStart={handleDragStart(index)}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              onDrop={handleDrop(index)}
              index={index}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
