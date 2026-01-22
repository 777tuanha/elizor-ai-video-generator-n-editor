import { useEffect } from 'react'
import { MenuBar } from './MenuBar'
import { Section } from './Section'
import { ShotList } from '@/components/shots/ShotList'
import { ShotEditor } from '@/components/shots/ShotEditor'
import { VideoPlayer } from '@/components/preview/VideoPlayer'
import { Timeline } from '@/components/timeline/Timeline'
import { KeyboardShortcutsHelp } from '@/components/common/KeyboardShortcutsHelp'
import { useProjectStore } from '@/stores/projectStore'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { db } from '@/services/db'

export function MainLayout() {
  const project = useProjectStore(state => state.project)
  const selectedShotId = useProjectStore(state => state.selectedShotId)
  const selectShot = useProjectStore(state => state.selectShot)
  const deleteShot = useProjectStore(state => state.deleteShot)
  const loadProject = useProjectStore(state => state.loadProject)
  const saveProject = useProjectStore(state => state.saveProject)

  // Navigate to previous/next shot
  const navigateShot = (direction: 'prev' | 'next') => {
    if (!project || !selectedShotId) {
      // If no selection, select first shot
      if (project && project.shots.length > 0) {
        selectShot(project.shots[0].id)
      }
      return
    }

    const currentIndex = project.shots.findIndex(s => s.id === selectedShotId)
    if (currentIndex === -1) return

    if (direction === 'prev' && currentIndex > 0) {
      selectShot(project.shots[currentIndex - 1].id)
    } else if (direction === 'next' && currentIndex < project.shots.length - 1) {
      selectShot(project.shots[currentIndex + 1].id)
    }
  }

  // Delete selected shot
  const handleDeleteShot = () => {
    if (selectedShotId && project) {
      const shot = project.shots.find(s => s.id === selectedShotId)
      if (shot && window.confirm(`Delete Shot ${shot.index + 1}?`)) {
        deleteShot(selectedShotId)
      }
    }
  }

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: 'ArrowLeft',
      callback: () => navigateShot('prev'),
      description: 'Previous shot',
    },
    {
      key: 'ArrowRight',
      callback: () => navigateShot('next'),
      description: 'Next shot',
    },
    {
      key: 'Delete',
      callback: handleDeleteShot,
      description: 'Delete selected shot',
    },
    {
      key: 's',
      ctrlKey: true,
      callback: () => {
        saveProject()
      },
      description: 'Save project',
    },
  ])

  // Auto-load most recent project on mount
  useEffect(() => {
    const loadRecentProject = async () => {
      const projects = await db.projects
        .orderBy('updatedAt')
        .reverse()
        .limit(1)
        .toArray()

      if (projects.length > 0) {
        await loadProject(projects[0].id)
      }
    }

    loadRecentProject()
  }, [loadProject])

  return (
    <div className="h-screen flex flex-col bg-background">
      <MenuBar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Section 1: Video Preview + Shot List */}
        <div className="flex-1 flex border-b min-h-0">
          {/* Video Preview */}
          <Section title="Preview" className="flex-1 border-r">
            <VideoPlayer />
          </Section>

          {/* Shot List */}
          <Section title="Shots" className="w-80">
            <ShotList />
          </Section>
        </div>

        {/* Section 2: Timeline */}
        <Section title="Timeline" className="h-32 border-b flex-shrink-0">
          <Timeline />
        </Section>

        {/* Section 3: Shot Editor */}
        <Section title="Shot Editor" className="h-64 flex-shrink-0">
          <ShotEditor />
        </Section>
      </div>

      {/* Keyboard Shortcuts Help */}
      <KeyboardShortcutsHelp />
    </div>
  )
}
