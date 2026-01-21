import { useEffect } from 'react'
import { MenuBar } from './MenuBar'
import { Section } from './Section'
import { Card } from '@/components/ui/card'
import { ShotList } from '@/components/shots/ShotList'
import { ShotEditor } from '@/components/shots/ShotEditor'
import { useProjectStore } from '@/stores/projectStore'
import { db } from '@/services/db'

export function MainLayout() {
  const loadProject = useProjectStore(state => state.loadProject)

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
        <div className="flex-1 flex border-b">
          {/* Video Preview */}
          <Section title="Preview" className="flex-1 border-r">
            <div className="flex items-center justify-center h-full bg-muted/20">
              <Card className="w-64 aspect-[9/16] bg-muted flex items-center justify-center">
                <p className="text-sm text-muted-foreground">9:16 Preview</p>
              </Card>
            </div>
          </Section>

          {/* Shot List */}
          <Section title="Shots" className="w-80">
            <ShotList />
          </Section>
        </div>

        {/* Section 2: Timeline */}
        <Section title="Timeline" className="h-32 border-b">
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-muted-foreground">
              Timeline will appear here
            </p>
          </div>
        </Section>

        {/* Section 3: Shot Editor */}
        <Section title="Shot Editor" className="h-64">
          <ShotEditor />
        </Section>
      </div>
    </div>
  )
}
