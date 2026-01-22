export interface StoryScriptShot {
  // Required fields
  duration: number
  visual: string
  camera: string
  transition: string

  // Optional field
  dialogue?: string

  // Allow any additional optional fields
  [key: string]: any
}

export interface StoryScript {
  title: string
  shots: StoryScriptShot[]
}
