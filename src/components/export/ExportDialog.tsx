import { useState, useRef } from 'react'
import { useProjectStore } from '@/stores/projectStore'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Download, AlertCircle, CheckCircle2, X } from 'lucide-react'
import {
  exportVideo,
  downloadBlob,
  generateExportFilename,
  ExportProgress,
} from '@/services/exporter'

interface ExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ExportDialog({ open, onOpenChange }: ExportDialogProps) {
  const project = useProjectStore(state => state.project)
  const getShotVideos = useProjectStore(state => state.getShotVideos)

  const [isExporting, setIsExporting] = useState(false)
  const [progress, setProgress] = useState<ExportProgress | null>(null)
  const [exportedBlob, setExportedBlob] = useState<Blob | null>(null)

  const abortControllerRef = useRef<AbortController | null>(null)

  const handleExport = async () => {
    if (!project) return

    // Get videos in timeline order
    const videos = project.timelineOrder
      .map(shotId => {
        const shot = project.shots.find(s => s.id === shotId)
        if (!shot || shot.status !== 'used') return null

        const shotVideos = getShotVideos(shot.id)
        const usedVideo = shotVideos.find(v => v.isUsed)
        return usedVideo || null
      })
      .filter((v): v is NonNullable<typeof v> => v !== null)

    if (videos.length === 0) {
      setProgress({
        phase: 'error',
        progress: 0,
        message: 'No videos to export. Mark at least one video as "Used" in the timeline.',
      })
      return
    }

    setIsExporting(true)
    setProgress(null)
    setExportedBlob(null)

    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController()

    try {
      const blob = await exportVideo(
        videos,
        setProgress,
        abortControllerRef.current.signal
      )

      setExportedBlob(blob)
      setIsExporting(false)
    } catch (error) {
      console.error('Export failed:', error)
      setProgress({
        phase: 'error',
        progress: 0,
        message:
          error instanceof Error ? error.message : 'Export failed. Please try again.',
      })
      setIsExporting(false)
    }
  }

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    setIsExporting(false)
    setProgress({
      phase: 'error',
      progress: 0,
      message: 'Export cancelled',
    })
  }

  const handleDownload = () => {
    if (!exportedBlob || !project) return

    const fileName = generateExportFilename(project.title)
    downloadBlob(exportedBlob, fileName)
  }

  const handleClose = () => {
    if (isExporting) {
      handleCancel()
    }
    onOpenChange(false)
    // Reset state after a short delay
    setTimeout(() => {
      setProgress(null)
      setExportedBlob(null)
    }, 300)
  }

  if (!project) return null

  const hasUsedVideos = project.shots.some(shot => shot.status === 'used')

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Video</DialogTitle>
          <DialogDescription>
            Export your video as MP4 (1080x1920, 9:16 aspect ratio)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Project Info */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Project:</span>
              <span className="font-medium">{project.title}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Clips:</span>
              <span className="font-medium">{project.timelineOrder.length}</span>
            </div>
          </div>

          {/* Progress */}
          {progress && (
            <div className="space-y-2">
              <Progress value={progress.progress} />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{progress.message}</span>
                {progress.currentFile && (
                  <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                    {progress.currentFile}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Status Alerts */}
          {progress?.phase === 'complete' && (
            <Alert className="border-green-500/50 bg-green-500/10">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <AlertDescription>
                Export complete! Click Download to save your video.
              </AlertDescription>
            </Alert>
          )}

          {progress?.phase === 'error' && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{progress.message}</AlertDescription>
            </Alert>
          )}

          {!hasUsedVideos && !isExporting && !progress && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No videos to export. Mark at least one video as "Used" in the timeline.
              </AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            {!isExporting && !exportedBlob && (
              <>
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleExport}
                  disabled={!hasUsedVideos}
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Start Export
                </Button>
              </>
            )}

            {isExporting && (
              <>
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1"
                >
                  Close
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleCancel}
                  className="flex-1"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel Export
                </Button>
              </>
            )}

            {exportedBlob && (
              <>
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1"
                >
                  Close
                </Button>
                <Button onClick={handleDownload} className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
