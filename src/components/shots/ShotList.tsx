import { useState } from 'react'
import { useProjectStore } from '@/stores/projectStore'
import { ShotCard } from './ShotCard'
import { Card } from '@/components/ui/card'

export function ShotList() {
  const project = useProjectStore(state => state.project)
  const selectedShotId = useProjectStore(state => state.selectedShotId)
  const selectShot = useProjectStore(state => state.selectShot)
  const reorderShots = useProjectStore(state => state.reorderShots)

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  if (!project) {
    return (
      <div className="p-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">
            No project loaded. Create a new project to begin.
          </p>
        </Card>
      </div>
    )
  }

  if (project.shots.length === 0) {
    return (
      <div className="p-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">
            No shots yet. Load a story script to add shots.
          </p>
        </Card>
      </div>
    )
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index)
    }
  }

  const handleDragEnd = () => {
    if (draggedIndex !== null && dragOverIndex !== null) {
      reorderShots(draggedIndex, dragOverIndex)
    }
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const handleDragLeave = () => {
    setDragOverIndex(null)
  }

  return (
    <div className="p-4 space-y-2">
      {project.shots.map((shot, index) => (
        <div
          key={shot.id}
          data-testid="shot-item"
          draggable
          onDragStart={() => handleDragStart(index)}
          onDragOver={e => handleDragOver(e, index)}
          onDragEnd={handleDragEnd}
          onDragLeave={handleDragLeave}
          className={
            dragOverIndex === index && draggedIndex !== index
              ? 'border-2 border-primary border-dashed rounded-lg'
              : ''
          }
        >
          <ShotCard
            shot={shot}
            isSelected={selectedShotId === shot.id}
            onSelect={() => selectShot(shot.id)}
          />
        </div>
      ))}
    </div>
  )
}
