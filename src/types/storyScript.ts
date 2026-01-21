export interface StoryScriptShot {
  duration: number
  visual: string
  camera: string
  transition: string
}

export interface StoryScript {
  title: string
  shots: StoryScriptShot[]
}
