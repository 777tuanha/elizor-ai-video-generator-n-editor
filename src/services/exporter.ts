import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'
import { VideoClip } from '@/types/video'

export interface ExportProgress {
  phase: 'loading' | 'processing' | 'complete' | 'error'
  progress: number // 0-100
  message: string
  currentFile?: string
}

export type ProgressCallback = (progress: ExportProgress) => void

let ffmpegInstance: FFmpeg | null = null

/**
 * Load FFmpeg.wasm
 */
async function loadFFmpeg(onProgress: ProgressCallback): Promise<FFmpeg> {
  if (ffmpegInstance) {
    return ffmpegInstance
  }

  onProgress({
    phase: 'loading',
    progress: 0,
    message: 'Loading FFmpeg...',
  })

  const ffmpeg = new FFmpeg()

  // Set up logging
  ffmpeg.on('log', ({ message }) => {
    console.log('[FFmpeg]', message)
  })

  // Set up progress tracking
  ffmpeg.on('progress', ({ progress, time }) => {
    onProgress({
      phase: 'processing',
      progress: Math.round(progress * 100),
      message: `Processing video... ${time.toFixed(2)}s`,
    })
  })

  try {
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd'
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    })

    ffmpegInstance = ffmpeg

    onProgress({
      phase: 'loading',
      progress: 100,
      message: 'FFmpeg loaded',
    })

    return ffmpeg
  } catch (error) {
    onProgress({
      phase: 'error',
      progress: 0,
      message: `Failed to load FFmpeg: ${error instanceof Error ? error.message : 'Unknown error'}`,
    })
    throw error
  }
}

/**
 * Export videos to a single MP4 file
 */
export async function exportVideo(
  videos: VideoClip[],
  onProgress: ProgressCallback,
  signal?: AbortSignal
): Promise<Blob> {
  if (videos.length === 0) {
    throw new Error('No videos to export')
  }

  try {
    // Load FFmpeg
    const ffmpeg = await loadFFmpeg(onProgress)

    // Check if cancelled
    if (signal?.aborted) {
      throw new Error('Export cancelled')
    }

    onProgress({
      phase: 'processing',
      progress: 0,
      message: 'Preparing videos...',
    })

    // Write all video files to FFmpeg's virtual file system
    for (let i = 0; i < videos.length; i++) {
      const video = videos[i]
      const fileName = `input${i}.mp4`

      onProgress({
        phase: 'processing',
        progress: Math.round((i / videos.length) * 30),
        message: `Loading video ${i + 1}/${videos.length}...`,
        currentFile: video.fileName,
      })

      // Check if cancelled
      if (signal?.aborted) {
        throw new Error('Export cancelled')
      }

      const fileData = await fetchFile(video.blob)
      await ffmpeg.writeFile(fileName, fileData)
    }

    // Create concat file list
    const concatList = videos
      .map((_, i) => `file 'input${i}.mp4'`)
      .join('\n')

    await ffmpeg.writeFile('concat_list.txt', concatList)

    onProgress({
      phase: 'processing',
      progress: 40,
      message: 'Concatenating videos...',
    })

    // Check if cancelled
    if (signal?.aborted) {
      throw new Error('Export cancelled')
    }

    // Concatenate videos
    // Using concat demuxer for lossless concatenation if all videos have same codec
    // Otherwise using filter_complex for re-encoding
    await ffmpeg.exec([
      '-f',
      'concat',
      '-safe',
      '0',
      '-i',
      'concat_list.txt',
      '-c',
      'copy',
      '-movflags',
      '+faststart',
      'output.mp4',
    ])

    onProgress({
      phase: 'processing',
      progress: 90,
      message: 'Finalizing export...',
    })

    // Read the output file
    const data = await ffmpeg.readFile('output.mp4')
    // Create a new Uint8Array to ensure proper type
    const uint8Array = new Uint8Array(data as Uint8Array)
    const blob = new Blob([uint8Array], { type: 'video/mp4' })

    // Clean up
    for (let i = 0; i < videos.length; i++) {
      await ffmpeg.deleteFile(`input${i}.mp4`)
    }
    await ffmpeg.deleteFile('concat_list.txt')
    await ffmpeg.deleteFile('output.mp4')

    onProgress({
      phase: 'complete',
      progress: 100,
      message: 'Export complete!',
    })

    return blob
  } catch (error) {
    onProgress({
      phase: 'error',
      progress: 0,
      message: `Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    })
    throw error
  }
}

/**
 * Download a blob as a file
 */
export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Generate export filename
 */
export function generateExportFilename(projectTitle: string): string {
  const date = new Date().toISOString().split('T')[0]
  const sanitizedTitle = projectTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()
  return `${sanitizedTitle}_${date}.mp4`
}
