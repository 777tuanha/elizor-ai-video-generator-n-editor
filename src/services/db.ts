import Dexie, { Table } from 'dexie'
import { Project } from '@/types/project'
import { VideoClip } from '@/types/video'

export class ElizorDatabase extends Dexie {
  projects!: Table<Project, string>
  videos!: Table<VideoClip, string>

  constructor() {
    super('ElizorDB')

    this.version(1).stores({
      projects: 'id, title, createdAt, updatedAt',
      videos: 'id, shotId, fileName, createdAt, isUsed',
    })
  }
}

export const db = new ElizorDatabase()
