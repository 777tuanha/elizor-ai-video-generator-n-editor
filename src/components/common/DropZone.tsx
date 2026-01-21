import { useCallback } from 'react'
import { Upload } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DropZoneProps {
  onFilesSelected: (files: File[]) => void
  accept?: string
  maxSize?: number // in MB
  disabled?: boolean
  className?: string
}

export function DropZone({
  onFilesSelected,
  accept = 'video/mp4,video/webm,video/quicktime',
  maxSize = 100,
  disabled = false,
  className,
}: DropZoneProps) {
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()

      if (disabled) return

      const files = Array.from(e.dataTransfer.files)
      onFilesSelected(files)
    },
    [disabled, onFilesSelected]
  )

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled) return

      const files = e.target.files ? Array.from(e.target.files) : []
      onFilesSelected(files)
      // Reset input so same file can be selected again
      e.target.value = ''
    },
    [disabled, onFilesSelected]
  )

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className={cn(
        'relative border-2 border-dashed rounded-lg p-8 text-center transition-colors',
        disabled
          ? 'border-muted bg-muted/20 cursor-not-allowed'
          : 'border-border hover:border-primary cursor-pointer',
        className
      )}
    >
      <input
        type="file"
        accept={accept}
        multiple
        disabled={disabled}
        onChange={handleFileInput}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
      />

      <div className="flex flex-col items-center gap-2">
        <Upload
          className={cn(
            'h-10 w-10',
            disabled ? 'text-muted-foreground' : 'text-primary'
          )}
        />
        <div className="space-y-1">
          <p className="text-sm font-medium">
            {disabled ? 'Upload disabled' : 'Drop videos here or click to browse'}
          </p>
          <p className="text-xs text-muted-foreground">
            MP4, WebM, MOV • Max {maxSize}MB per file
          </p>
        </div>
      </div>
    </div>
  )
}
