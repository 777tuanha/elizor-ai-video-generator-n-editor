/**
 * Video processing utilities for frame extraction
 */

/**
 * Extract the last frame from a video file as a data URL
 * @param videoBlob - The video file as a Blob
 * @returns Promise that resolves to a data URL of the last frame
 */
export function extractLastFrame(videoBlob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')

    if (!context) {
      reject(new Error('Could not get canvas context'))
      return
    }

    // Create object URL from blob
    const videoUrl = URL.createObjectURL(videoBlob)
    video.src = videoUrl

    video.addEventListener('loadedmetadata', () => {
      // Set video to last frame (duration - 0.1 seconds to avoid black frame)
      video.currentTime = Math.max(0, video.duration - 0.1)
    })

    video.addEventListener('seeked', () => {
      try {
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight

        // Draw the current frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height)

        // Convert canvas to data URL
        const frameDataUrl = canvas.toDataURL('image/jpeg', 0.8)

        // Clean up
        URL.revokeObjectURL(videoUrl)
        video.remove()
        canvas.remove()

        resolve(frameDataUrl)
      } catch (error) {
        URL.revokeObjectURL(videoUrl)
        video.remove()
        canvas.remove()
        reject(error)
      }
    })

    video.addEventListener('error', error => {
      URL.revokeObjectURL(videoUrl)
      video.remove()
      canvas.remove()
      reject(new Error(`Failed to load video: ${error}`))
    })

    // Load the video
    video.load()
  })
}

/**
 * Extract a frame from a video at a specific time
 * @param videoBlob - The video file as a Blob
 * @param timeInSeconds - The time in seconds to extract the frame from
 * @returns Promise that resolves to a data URL of the frame
 */
export function extractFrameAtTime(
  videoBlob: Blob,
  timeInSeconds: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')

    if (!context) {
      reject(new Error('Could not get canvas context'))
      return
    }

    const videoUrl = URL.createObjectURL(videoBlob)
    video.src = videoUrl

    video.addEventListener('loadedmetadata', () => {
      // Clamp time to valid range
      const clampedTime = Math.max(0, Math.min(timeInSeconds, video.duration))
      video.currentTime = clampedTime
    })

    video.addEventListener('seeked', () => {
      try {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        context.drawImage(video, 0, 0, canvas.width, canvas.height)
        const frameDataUrl = canvas.toDataURL('image/jpeg', 0.8)

        URL.revokeObjectURL(videoUrl)
        video.remove()
        canvas.remove()

        resolve(frameDataUrl)
      } catch (error) {
        URL.revokeObjectURL(videoUrl)
        video.remove()
        canvas.remove()
        reject(error)
      }
    })

    video.addEventListener('error', error => {
      URL.revokeObjectURL(videoUrl)
      video.remove()
      canvas.remove()
      reject(new Error(`Failed to load video: ${error}`))
    })

    video.load()
  })
}
