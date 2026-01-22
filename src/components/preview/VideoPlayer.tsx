import { useEffect, useRef, useState } from 'react'
import { useProjectStore } from '@/stores/projectStore'
import { VideoClip } from '@/types/video'
import { Shot } from '@/types/shot'
import { PlaybackControls } from './PlaybackControls'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'

interface VideoSegment {
  shot: Shot
  video: VideoClip
  startTime: number // Cumulative start time in the full preview
  endTime: number // Cumulative end time in the full preview
}

export function VideoPlayer() {
  const project = useProjectStore(state => state.project)
  const getShotVideos = useProjectStore(state => state.getShotVideos)
  const selectedShotId = useProjectStore(state => state.selectedShotId)

  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0)
  const [segments, setSegments] = useState<VideoSegment[]>([])

  // Build video segments from shots with used videos
  useEffect(() => {
    if (!project) {
      setSegments([])
      return
    }

    const newSegments: VideoSegment[] = []
    let cumulativeTime = 0

    // Get shots in timeline order
    const orderedShots = project.timelineOrder
      .map(shotId => project.shots.find(s => s.id === shotId))
      .filter((shot): shot is Shot => shot !== undefined && shot.status === 'used')

    for (const shot of orderedShots) {
      const videos = getShotVideos(shot.id)
      const usedVideo = videos.find(v => v.isUsed)

      if (usedVideo) {
        newSegments.push({
          shot,
          video: usedVideo,
          startTime: cumulativeTime,
          endTime: cumulativeTime + usedVideo.duration,
        })
        cumulativeTime += usedVideo.duration
      }
    }

    setSegments(newSegments)
    setDuration(cumulativeTime)
    setCurrentSegmentIndex(0)
    setCurrentTime(0)
  }, [project, getShotVideos])

  // Load current segment video
  useEffect(() => {
    if (!videoRef.current || segments.length === 0) return

    const currentSegment = segments[currentSegmentIndex]
    if (!currentSegment) return

    videoRef.current.src = currentSegment.video.blobUrl
    videoRef.current.currentTime = 0
    videoRef.current.load()

    if (isPlaying) {
      videoRef.current.play().catch(err => {
        console.error('Failed to play video:', err)
        setIsPlaying(false)
      })
    }
  }, [currentSegmentIndex, segments])

  // Handle video ended - move to next segment
  const handleVideoEnded = () => {
    if (currentSegmentIndex < segments.length - 1) {
      setCurrentSegmentIndex(prev => prev + 1)
    } else {
      setIsPlaying(false)
      setCurrentSegmentIndex(0)
      setCurrentTime(0)
    }
  }

  // Update current time during playback
  const handleTimeUpdate = () => {
    if (!videoRef.current || segments.length === 0) return

    const currentSegment = segments[currentSegmentIndex]
    if (!currentSegment) return

    const segmentCurrentTime = videoRef.current.currentTime
    const globalCurrentTime = currentSegment.startTime + segmentCurrentTime

    setCurrentTime(globalCurrentTime)
  }

  // Play/Pause toggle
  const handlePlayPause = () => {
    if (!videoRef.current) return

    if (isPlaying) {
      videoRef.current.pause()
      setIsPlaying(false)
    } else {
      videoRef.current.play().catch(err => {
        console.error('Failed to play video:', err)
      })
      setIsPlaying(true)
    }
  }

  // Seek to specific time in the full preview
  const handleSeek = (time: number) => {
    if (segments.length === 0) return

    // Find which segment contains this time
    const segmentIndex = segments.findIndex(
      seg => time >= seg.startTime && time < seg.endTime
    )

    if (segmentIndex === -1) return

    const segment = segments[segmentIndex]
    const segmentTime = time - segment.startTime

    setCurrentSegmentIndex(segmentIndex)
    setCurrentTime(time)

    // Set video time after segment loads
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.currentTime = segmentTime
        if (isPlaying) {
          videoRef.current.play().catch(err => {
            console.error('Failed to play video:', err)
            setIsPlaying(false)
          })
        }
      }
    }, 100)
  }

  // Play from selected shot
  const handlePlayFromShot = () => {
    if (!selectedShotId || segments.length === 0) return

    const segmentIndex = segments.findIndex(seg => seg.shot.id === selectedShotId)
    if (segmentIndex === -1) return

    setCurrentSegmentIndex(segmentIndex)
    setCurrentTime(segments[segmentIndex].startTime)
    setIsPlaying(true)
  }

  // Get current playing shot
  const getCurrentShot = (): Shot | null => {
    if (segments.length === 0) return null
    return segments[currentSegmentIndex]?.shot || null
  }

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: ' ',
      callback: handlePlayPause,
      description: 'Play/Pause',
    },
  ])

  if (!project) {
    return (
      <div className="flex h-full items-center justify-center bg-muted/50">
        <p className="text-sm text-muted-foreground">No project loaded</p>
      </div>
    )
  }

  if (segments.length === 0) {
    return (
      <div className="flex h-full items-center justify-center bg-muted/50">
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">No videos to preview</p>
          <p className="text-xs text-muted-foreground">
            Mark videos as Used to add them to the timeline
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Video Display */}
      <div className="flex-1 flex items-center justify-center bg-black">
        <div className="relative w-full max-w-[360px] aspect-[9/16]">
          <video
            ref={videoRef}
            className="w-full h-full object-contain"
            onEnded={handleVideoEnded}
            onTimeUpdate={handleTimeUpdate}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />

          {/* Current Shot Indicator */}
          {getCurrentShot() && (
            <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded text-sm">
              Shot {getCurrentShot()!.index + 1}
            </div>
          )}
        </div>
      </div>

      {/* Playback Controls */}
      <PlaybackControls
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        onPlayPause={handlePlayPause}
        onSeek={handleSeek}
        onPlayFromShot={handlePlayFromShot}
        canPlayFromShot={!!selectedShotId && segments.some(seg => seg.shot.id === selectedShotId)}
        segments={segments}
      />
    </div>
  )
}
