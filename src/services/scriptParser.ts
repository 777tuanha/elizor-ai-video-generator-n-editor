import { StoryScript } from '@/types/storyScript'
import {
  ValidationError,
  ValidationResult,
  isValidJSON,
  isNonEmptyString,
  isPositiveNumber,
  isArray,
  isObject,
} from '@/utils/validators'

export interface ParseResult {
  success: boolean
  script?: StoryScript
  errors: ValidationError[]
}

export function parseStoryScript(jsonText: string): ParseResult {
  // First, validate JSON syntax
  const jsonValidation = isValidJSON(jsonText)
  if (!jsonValidation.valid) {
    return {
      success: false,
      errors: [
        {
          field: 'json',
          message: `Invalid JSON: ${jsonValidation.error}`,
        },
      ],
    }
  }

  // Parse JSON
  const data = JSON.parse(jsonText)

  // Validate structure
  const validation = validateStoryScript(data)
  if (!validation.valid) {
    return {
      success: false,
      errors: validation.errors,
    }
  }

  return {
    success: true,
    script: data as StoryScript,
    errors: [],
  }
}

function validateStoryScript(data: unknown): ValidationResult {
  const errors: ValidationError[] = []

  // Check if data is an object
  if (!isObject(data)) {
    return {
      valid: false,
      errors: [{ field: 'root', message: 'Script must be a JSON object' }],
    }
  }

  // Validate title
  if (!('title' in data)) {
    errors.push({ field: 'title', message: 'Title is required' })
  } else if (!isNonEmptyString(data.title)) {
    errors.push({
      field: 'title',
      message: 'Title must be a non-empty string',
    })
  }

  // Validate shots array
  if (!('shots' in data)) {
    errors.push({ field: 'shots', message: 'Shots array is required' })
  } else if (!isArray(data.shots)) {
    errors.push({ field: 'shots', message: 'Shots must be an array' })
  } else if (data.shots.length === 0) {
    errors.push({
      field: 'shots',
      message: 'Shots array must contain at least one shot',
    })
  } else {
    // Validate each shot
    data.shots.forEach((shot, index) => {
      const shotErrors = validateShot(shot, index)
      errors.push(...shotErrors)
    })
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

function validateShot(shot: unknown, index: number): ValidationError[] {
  const errors: ValidationError[] = []
  const prefix = `shots[${index}]`

  if (!isObject(shot)) {
    return [
      {
        field: prefix,
        message: `Shot ${index + 1} must be an object`,
      },
    ]
  }

  // Validate duration
  if (!('duration' in shot)) {
    errors.push({
      field: `${prefix}.duration`,
      message: `Shot ${index + 1}: duration is required`,
    })
  } else if (!isPositiveNumber(shot.duration)) {
    errors.push({
      field: `${prefix}.duration`,
      message: `Shot ${index + 1}: duration must be a positive number`,
    })
  }

  // Validate visual
  if (!('visual' in shot)) {
    errors.push({
      field: `${prefix}.visual`,
      message: `Shot ${index + 1}: visual description is required`,
    })
  } else if (!isNonEmptyString(shot.visual)) {
    errors.push({
      field: `${prefix}.visual`,
      message: `Shot ${index + 1}: visual must be a non-empty string`,
    })
  }

  // Validate camera
  if (!('camera' in shot)) {
    errors.push({
      field: `${prefix}.camera`,
      message: `Shot ${index + 1}: camera instruction is required`,
    })
  } else if (!isNonEmptyString(shot.camera)) {
    errors.push({
      field: `${prefix}.camera`,
      message: `Shot ${index + 1}: camera must be a non-empty string`,
    })
  }

  // Validate transition
  if (!('transition' in shot)) {
    errors.push({
      field: `${prefix}.transition`,
      message: `Shot ${index + 1}: transition is required`,
    })
  } else if (!isNonEmptyString(shot.transition)) {
    errors.push({
      field: `${prefix}.transition`,
      message: `Shot ${index + 1}: transition must be a non-empty string`,
    })
  }

  return errors
}

export function formatValidationErrors(errors: ValidationError[]): string {
  if (errors.length === 0) return ''

  return errors
    .map(error => `• ${error.message}`)
    .join('\n')
}
