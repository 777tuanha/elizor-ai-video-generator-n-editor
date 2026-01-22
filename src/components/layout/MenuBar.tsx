import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { NewProjectDialog } from '@/components/project/NewProjectDialog'
import { LoadScriptDialog } from '@/components/project/LoadScriptDialog'
import { ExportDialog } from '@/components/export/ExportDialog'
import { useProjectStore } from '@/stores/projectStore'

export function MenuBar() {
  const [showNewProject, setShowNewProject] = useState(false)
  const [showLoadScript, setShowLoadScript] = useState(false)
  const [showExport, setShowExport] = useState(false)
  const project = useProjectStore(state => state.project)

  return (
    <header className="border-b bg-background">
      <div className="flex h-14 items-center px-4 gap-4">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold">Elizor</h1>
          <span className="text-xs text-muted-foreground">
            AI Video Editor
          </span>
        </div>

        {project && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Project:</span>
            <span className="font-medium">{project.title}</span>
            {project.shots.length > 0 && (
              <span className="text-xs text-muted-foreground">
                ({project.shots.length} shots)
              </span>
            )}
          </div>
        )}

        <div className="flex-1" />

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowNewProject(true)}
          >
            New Project
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!project}
            onClick={() => setShowLoadScript(true)}
          >
            Load Script
          </Button>
          <Button
            size="sm"
            disabled={!project}
            onClick={() => setShowExport(true)}
          >
            Export
          </Button>
        </div>
      </div>

      <NewProjectDialog
        open={showNewProject}
        onOpenChange={setShowNewProject}
      />
      <LoadScriptDialog
        open={showLoadScript}
        onOpenChange={setShowLoadScript}
      />
      <ExportDialog open={showExport} onOpenChange={setShowExport} />
    </header>
  )
}
