import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import { Project, ProjectSettings } from '@/types/project'
import { Shot } from '@/types/shot'
import { VideoClip } from '@/types/video'
import { StoryScript } from '@/types/storyScript'
import { db } from '@/services/db'
import { extractLastFrame } from '@/services/videoProcessor'

interface ProjectState {
  // Data
  project: Project | null
  videos: Map<string, VideoClip[]> // shotId -> videos
  selectedShotId: string | null

  // Actions
  createProject: (title: string, settings: ProjectSettings) => Promise<void>
  loadProject: (id: string) => Promise<void>
  saveProject: () => Promise<void>
  loadStoryScript: (script: StoryScript) => void

  // Shot actions
  updateShot: (shotId: string, updates: Partial<Shot>) => void
  reorderShots: (fromIndex: number, toIndex: number) => void
  deleteShot: (shotId: string) => void
  duplicateShot: (shotId: string) => void
  selectShot: (shotId: string | null) => void

  // Video actions
  addVideo: (shotId: string, video: VideoClip) => Promise<void>
  markVideoAsUsed: (shotId: string, videoId: string) => Promise<void>
  deleteVideo: (videoId: string) => Promise<void>

  // Timeline actions
  updateTimelineOrder: (order: string[]) => void

  // Utility
  getSelectedShot: () => Shot | null
  getShotVideos: (shotId: string) => VideoClip[]
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  project: null,
  videos: new Map(),
  selectedShotId: null,

  createProject: async (title: string, settings: ProjectSettings) => {
    const now = Date.now()
    const project: Project = {
      id: uuidv4(),
      title,
      settings,
      shots: [],
      timelineOrder: [],
      createdAt: now,
      updatedAt: now,
    }

    await db.projects.add(project)
    set({ project, videos: new Map(), selectedShotId: null })
  },

  loadProject: async (id: string) => {
    const project = await db.projects.get(id)
    if (!project) throw new Error('Project not found')

    // Load videos for all shots
    const videos = new Map<string, VideoClip[]>()
    for (const shot of project.shots) {
      const shotVideos = await db.videos.where('shotId').equals(shot.id).toArray()
      if (shotVideos.length > 0) {
        videos.set(shot.id, shotVideos)
      }
    }

    set({ project, videos, selectedShotId: null })
  },

  saveProject: async () => {
    const { project } = get()
    if (!project) return

    const updatedProject = {
      ...project,
      updatedAt: Date.now(),
    }

    await db.projects.put(updatedProject)
    set({ project: updatedProject })
  },

  loadStoryScript: (script: StoryScript) => {
    const { project } = get()
    if (!project) return

    const shots: Shot[] = script.shots.map((scriptShot, index) => ({
      // System fields
      id: uuidv4(),
      index,
      status: 'empty' as const,

      // Required fields
      duration: scriptShot.duration,
      visual: scriptShot.visual,
      camera: scriptShot.camera,
      transition: scriptShot.transition,

      // Pass through all other fields (dialogue and any custom optional fields)
      ...Object.fromEntries(
        Object.entries(scriptShot).filter(
          ([key]) => !['duration', 'visual', 'camera', 'transition'].includes(key)
        )
      ),
    }))

    const updatedProject = {
      ...project,
      title: script.title,
      shots,
      timelineOrder: [],
      updatedAt: Date.now(),
    }

    set({ project: updatedProject })
    get().saveProject()
  },

  updateShot: (shotId: string, updates: Partial<Shot>) => {
    const { project } = get()
    if (!project) return

    const updatedProject = {
      ...project,
      shots: project.shots.map(shot =>
        shot.id === shotId ? { ...shot, ...updates } : shot
      ),
      updatedAt: Date.now(),
    }

    set({ project: updatedProject })
    get().saveProject()
  },

  reorderShots: (fromIndex: number, toIndex: number) => {
    const { project } = get()
    if (!project) return

    const shots = [...project.shots]
    const [removed] = shots.splice(fromIndex, 1)
    shots.splice(toIndex, 0, removed)

    // Update indices
    const updatedShots = shots.map((shot, index) => ({ ...shot, index }))

    set({
      project: {
        ...project,
        shots: updatedShots,
        updatedAt: Date.now(),
      },
    })
    get().saveProject()
  },

  deleteShot: (shotId: string) => {
    const { project, videos } = get()
    if (!project) return

    const updatedProject = {
      ...project,
      shots: project.shots.filter(shot => shot.id !== shotId),
      timelineOrder: project.timelineOrder.filter(id => id !== shotId),
      updatedAt: Date.now(),
    }

    // Remove videos from map
    const newVideos = new Map(videos)
    newVideos.delete(shotId)

    // Delete videos from database
    db.videos.where('shotId').equals(shotId).delete()

    set({ project: updatedProject, videos: newVideos })
    get().saveProject()
  },

  duplicateShot: (shotId: string) => {
    const { project } = get()
    if (!project) return

    const shot = project.shots.find(s => s.id === shotId)
    if (!shot) return

    const newShot: Shot = {
      ...shot,
      id: uuidv4(),
      index: shot.index + 1,
      status: 'empty',
      usedVideoId: undefined,
      lastFrameUrl: undefined,
    }

    const updatedShots = [
      ...project.shots.slice(0, shot.index + 1),
      newShot,
      ...project.shots.slice(shot.index + 1),
    ].map((s, index) => ({ ...s, index }))

    set({
      project: {
        ...project,
        shots: updatedShots,
        updatedAt: Date.now(),
      },
    })
    get().saveProject()
  },

  selectShot: (shotId: string | null) => {
    set({ selectedShotId: shotId })
  },

  addVideo: async (shotId: string, video: VideoClip) => {
    const { videos } = get()

    await db.videos.add(video)

    const newVideos = new Map(videos)
    const shotVideos = newVideos.get(shotId) || []
    newVideos.set(shotId, [...shotVideos, video])

    // Update shot status
    get().updateShot(shotId, { status: 'has-video' })
    set({ videos: newVideos })
  },

  markVideoAsUsed: async (shotId: string, videoId: string) => {
    const { videos, project } = get()
    if (!project) return

    const shotVideos = videos.get(shotId) || []
    const updatedVideos = shotVideos.map(v => ({
      ...v,
      isUsed: v.id === videoId,
    }))

    const newVideos = new Map(videos)
    newVideos.set(shotId, updatedVideos)

    // Update videos in database
    updatedVideos.forEach(v => {
      db.videos.update(v.id, { isUsed: v.isUsed })
    })

    // Extract last frame from the used video
    const usedVideo = updatedVideos.find(v => v.isUsed)
    let lastFrameUrl: string | undefined

    if (usedVideo) {
      try {
        lastFrameUrl = await extractLastFrame(usedVideo.blob)
      } catch (error) {
        console.error('Failed to extract last frame:', error)
        // Continue without frame - it's not critical
      }
    }

    // Update shot status and reference
    get().updateShot(shotId, {
      status: 'used',
      usedVideoId: videoId,
      lastFrameUrl,
    })

    // Update timeline order if not already in timeline
    if (usedVideo && !project.timelineOrder.includes(shotId)) {
      const shot = project.shots.find(s => s.id === shotId)
      if (shot) {
        const newTimelineOrder = [...project.timelineOrder, shotId].sort(
          (a, b) => {
            const shotA = project.shots.find(s => s.id === a)
            const shotB = project.shots.find(s => s.id === b)
            return (shotA?.index ?? 0) - (shotB?.index ?? 0)
          }
        )
        get().updateTimelineOrder(newTimelineOrder)
      }
    }

    set({ videos: newVideos })
  },

  deleteVideo: async (videoId: string) => {
    const { videos } = get()

    await db.videos.delete(videoId)

    const newVideos = new Map(videos)
    for (const [shotId, shotVideos] of newVideos.entries()) {
      const filtered = shotVideos.filter(v => v.id !== videoId)
      if (filtered.length === 0) {
        newVideos.delete(shotId)
        // Update shot status if no videos left
        get().updateShot(shotId, { status: 'empty', usedVideoId: undefined })
      } else {
        newVideos.set(shotId, filtered)
        // If deleted video was used, update status
        const hadUsedVideo = shotVideos.find(v => v.id === videoId)?.isUsed
        if (hadUsedVideo) {
          get().updateShot(shotId, { status: 'has-video', usedVideoId: undefined })
        }
      }
    }

    set({ videos: newVideos })
  },

  updateTimelineOrder: (order: string[]) => {
    const { project } = get()
    if (!project) return

    set({
      project: {
        ...project,
        timelineOrder: order,
        updatedAt: Date.now(),
      },
    })
    get().saveProject()
  },

  getSelectedShot: () => {
    const { project, selectedShotId } = get()
    if (!project || !selectedShotId) return null
    return project.shots.find(s => s.id === selectedShotId) || null
  },

  getShotVideos: (shotId: string) => {
    const { videos } = get()
    return videos.get(shotId) || []
  },
}))
