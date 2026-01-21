import { describe, it, expect, beforeEach } from 'vitest'
import { useProjectStore } from './projectStore'
import { db } from '@/services/db'

describe('Project Store', () => {
  beforeEach(async () => {
    // Clear database before each test
    await db.projects.clear()
    await db.videos.clear()
    // Reset store
    useProjectStore.setState({
      project: null,
      videos: new Map(),
      selectedShotId: null,
    })
  })

  it('should create a new project', async () => {
    const { createProject } = useProjectStore.getState()

    await createProject('Test Project', {
      platform: 'tiktok',
      aspectRatio: '9:16',
      targetDuration: 60,
      resolution: { width: 1080, height: 1920 },
    })

    const { project } = useProjectStore.getState()
    expect(project).not.toBeNull()
    expect(project?.title).toBe('Test Project')
    expect(project?.settings.targetDuration).toBe(60)
    expect(project?.shots).toEqual([])

    // Verify in database
    const dbProjects = await db.projects.toArray()
    expect(dbProjects).toHaveLength(1)
    expect(dbProjects[0].title).toBe('Test Project')
  })

  it('should load a story script', async () => {
    const { createProject, loadStoryScript } = useProjectStore.getState()

    await createProject('Test Project', {
      platform: 'tiktok',
      aspectRatio: '9:16',
      targetDuration: 60,
      resolution: { width: 1080, height: 1920 },
    })

    loadStoryScript({
      title: 'Story Title',
      shots: [
        {
          duration: 3,
          visual: 'Shot 1 visual',
          camera: 'Close up',
          transition: 'Cut',
        },
        {
          duration: 5,
          visual: 'Shot 2 visual',
          camera: 'Wide',
          transition: 'Fade',
        },
      ],
    })

    const { project } = useProjectStore.getState()
    expect(project?.shots).toHaveLength(2)
    expect(project?.shots[0].visual).toBe('Shot 1 visual')
    expect(project?.shots[0].duration).toBe(3)
    expect(project?.shots[0].status).toBe('empty')
    expect(project?.shots[1].visual).toBe('Shot 2 visual')
  })

  it('should update shot', async () => {
    const { createProject, loadStoryScript, updateShot } =
      useProjectStore.getState()

    await createProject('Test Project', {
      platform: 'tiktok',
      aspectRatio: '9:16',
      targetDuration: 60,
      resolution: { width: 1080, height: 1920 },
    })

    loadStoryScript({
      title: 'Test',
      shots: [
        {
          duration: 3,
          visual: 'Original',
          camera: 'Close up',
          transition: 'Cut',
        },
      ],
    })

    const { project } = useProjectStore.getState()
    const shotId = project!.shots[0].id

    updateShot(shotId, { visual: 'Updated', duration: 5 })

    const updatedProject = useProjectStore.getState().project
    expect(updatedProject?.shots[0].visual).toBe('Updated')
    expect(updatedProject?.shots[0].duration).toBe(5)
  })

  it('should select and get selected shot', async () => {
    const { createProject, loadStoryScript, selectShot, getSelectedShot } =
      useProjectStore.getState()

    await createProject('Test Project', {
      platform: 'tiktok',
      aspectRatio: '9:16',
      targetDuration: 60,
      resolution: { width: 1080, height: 1920 },
    })

    loadStoryScript({
      title: 'Test',
      shots: [
        {
          duration: 3,
          visual: 'Shot 1',
          camera: 'Close up',
          transition: 'Cut',
        },
      ],
    })

    const { project } = useProjectStore.getState()
    const shotId = project!.shots[0].id

    selectShot(shotId)

    const selectedShot = getSelectedShot()
    expect(selectedShot).not.toBeNull()
    expect(selectedShot?.id).toBe(shotId)
    expect(selectedShot?.visual).toBe('Shot 1')
  })
})
