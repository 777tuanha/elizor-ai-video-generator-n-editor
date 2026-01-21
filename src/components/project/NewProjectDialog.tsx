import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useProjectStore } from '@/stores/projectStore'

interface NewProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NewProjectDialog({ open, onOpenChange }: NewProjectDialogProps) {
  const [title, setTitle] = useState('')
  const [targetDuration, setTargetDuration] = useState('60')
  const createProject = useProjectStore(state => state.createProject)

  const handleCreate = async () => {
    if (!title.trim()) return

    await createProject(title, {
      platform: 'tiktok',
      aspectRatio: '9:16',
      targetDuration: parseInt(targetDuration) || 60,
      resolution: { width: 1080, height: 1920 },
    })

    setTitle('')
    setTargetDuration('60')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Project</DialogTitle>
          <DialogDescription>
            Create a new TikTok video project. Default settings: 9:16 aspect
            ratio, 1080x1920 resolution.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Project Title</Label>
            <Input
              id="title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="My TikTok Video"
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="duration">Target Duration (seconds)</Label>
            <Input
              id="duration"
              type="number"
              value={targetDuration}
              onChange={e => setTargetDuration(e.target.value)}
              placeholder="60"
              min="1"
              max="180"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!title.trim()}>
            Create Project
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
