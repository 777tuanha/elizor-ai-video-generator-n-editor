import { Button } from '@/components/ui/button'
import { Play, Pause, SkipForward } from 'lucide-react'
import { Slider } from '@/components/ui/slider'

interface VideoSegment {
  shot: { id: string; index: number }
  startTime: number
  endTime: number
}

interface PlaybackControlsProps {
  isPlaying: boolean
  currentTime: number
  duration: number
  onPlayPause: () => void
  onSeek: (time: number) => void
  onPlayFromShot: () => void
  canPlayFromShot: boolean
  segments: VideoSegment[]
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function PlaybackControls({
  isPlaying,
  currentTime,
  duration,
  onPlayPause,
  onSeek,
  onPlayFromShot,
  canPlayFromShot,
  segments,
}: PlaybackControlsProps) {
  const handleSliderChange = (value: number[]) => {
    onSeek(value[0])
  }

  return (
    <div className="border-t bg-background p-4 space-y-3">
      {/* Progress Bar with Segment Markers */}
      <div className="space-y-1">
        <Slider
          value={[currentTime]}
          max={duration}
          step={0.1}
          onValueChange={handleSliderChange}
          className="cursor-pointer"
        />

        {/* Segment Markers */}
        <div className="relative h-4">
          {segments.map(segment => {
            const leftPercent = (segment.startTime / duration) * 100
            const widthPercent =
              ((segment.endTime - segment.startTime) / duration) * 100

            const isActive =
              currentTime >= segment.startTime && currentTime < segment.endTime

            return (
              <div
                key={segment.shot.id}
                className="absolute h-2 flex items-center"
                style={{
                  left: `${leftPercent}%`,
                  width: `${widthPercent}%`,
                }}
              >
                <div
                  className={`w-full h-1 rounded-full transition-all ${
                    isActive
                      ? 'bg-primary h-2'
                      : 'bg-muted-foreground/30'
                  }`}
                />
                <span
                  className={`absolute -top-1 left-0 text-[10px] transition-all ${
                    isActive
                      ? 'text-primary font-medium'
                      : 'text-muted-foreground'
                  }`}
                >
                  {segment.shot.index + 1}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={onPlayPause}
            disabled={duration === 0}
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onPlayFromShot}
            disabled={!canPlayFromShot}
          >
            <SkipForward className="h-4 w-4 mr-2" />
            Play from Shot
          </Button>
        </div>

        <div className="text-sm text-muted-foreground">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>
    </div>
  )
}
