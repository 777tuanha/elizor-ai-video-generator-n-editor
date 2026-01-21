import { describe, it, expect } from 'vitest'
import { parseStoryScript } from './scriptParser'

describe('Script Parser', () => {
  it('should parse valid story script', () => {
    const validScript = JSON.stringify({
      title: 'Test Story',
      shots: [
        {
          duration: 3,
          visual: 'Opening scene',
          camera: 'Wide shot',
          transition: 'Cut',
        },
        {
          duration: 5,
          visual: 'Close up',
          camera: 'Tight shot',
          transition: 'Fade',
        },
      ],
    })

    const result = parseStoryScript(validScript)

    expect(result.success).toBe(true)
    expect(result.errors).toHaveLength(0)
    expect(result.script).toBeDefined()
    expect(result.script?.title).toBe('Test Story')
    expect(result.script?.shots).toHaveLength(2)
    expect(result.script?.shots[0].duration).toBe(3)
    expect(result.script?.shots[0].visual).toBe('Opening scene')
  })

  it('should reject invalid JSON', () => {
    const invalidJSON = '{ invalid json }'

    const result = parseStoryScript(invalidJSON)

    expect(result.success).toBe(false)
    expect(result.errors).toHaveLength(1)
    expect(result.errors[0].field).toBe('json')
    expect(result.errors[0].message).toContain('Invalid JSON')
  })

  it('should reject non-object JSON', () => {
    const arrayJSON = JSON.stringify([1, 2, 3])

    const result = parseStoryScript(arrayJSON)

    expect(result.success).toBe(false)
    expect(result.errors).toHaveLength(1)
    expect(result.errors[0].message).toContain('must be a JSON object')
  })

  it('should reject script without title', () => {
    const noTitle = JSON.stringify({
      shots: [
        {
          duration: 3,
          visual: 'Test',
          camera: 'Test',
          transition: 'Cut',
        },
      ],
    })

    const result = parseStoryScript(noTitle)

    expect(result.success).toBe(false)
    expect(result.errors.some(e => e.field === 'title')).toBe(true)
  })

  it('should reject script with empty title', () => {
    const emptyTitle = JSON.stringify({
      title: '   ',
      shots: [
        {
          duration: 3,
          visual: 'Test',
          camera: 'Test',
          transition: 'Cut',
        },
      ],
    })

    const result = parseStoryScript(emptyTitle)

    expect(result.success).toBe(false)
    expect(
      result.errors.some(e => e.field === 'title' && e.message.includes('non-empty'))
    ).toBe(true)
  })

  it('should reject script without shots', () => {
    const noShots = JSON.stringify({
      title: 'Test',
    })

    const result = parseStoryScript(noShots)

    expect(result.success).toBe(false)
    expect(result.errors.some(e => e.field === 'shots')).toBe(true)
  })

  it('should reject script with empty shots array', () => {
    const emptyShots = JSON.stringify({
      title: 'Test',
      shots: [],
    })

    const result = parseStoryScript(emptyShots)

    expect(result.success).toBe(false)
    expect(
      result.errors.some(e => e.field === 'shots' && e.message.includes('at least one'))
    ).toBe(true)
  })

  it('should reject shot without duration', () => {
    const noDuration = JSON.stringify({
      title: 'Test',
      shots: [
        {
          visual: 'Test',
          camera: 'Test',
          transition: 'Cut',
        },
      ],
    })

    const result = parseStoryScript(noDuration)

    expect(result.success).toBe(false)
    expect(
      result.errors.some(e => e.field.includes('duration') && e.message.includes('required'))
    ).toBe(true)
  })

  it('should reject shot with negative duration', () => {
    const negativeDuration = JSON.stringify({
      title: 'Test',
      shots: [
        {
          duration: -1,
          visual: 'Test',
          camera: 'Test',
          transition: 'Cut',
        },
      ],
    })

    const result = parseStoryScript(negativeDuration)

    expect(result.success).toBe(false)
    expect(
      result.errors.some(e => e.field.includes('duration') && e.message.includes('positive'))
    ).toBe(true)
  })

  it('should reject shot with zero duration', () => {
    const zeroDuration = JSON.stringify({
      title: 'Test',
      shots: [
        {
          duration: 0,
          visual: 'Test',
          camera: 'Test',
          transition: 'Cut',
        },
      ],
    })

    const result = parseStoryScript(zeroDuration)

    expect(result.success).toBe(false)
    expect(
      result.errors.some(e => e.field.includes('duration') && e.message.includes('positive'))
    ).toBe(true)
  })

  it('should reject shot without visual', () => {
    const noVisual = JSON.stringify({
      title: 'Test',
      shots: [
        {
          duration: 3,
          camera: 'Test',
          transition: 'Cut',
        },
      ],
    })

    const result = parseStoryScript(noVisual)

    expect(result.success).toBe(false)
    expect(
      result.errors.some(e => e.field.includes('visual') && e.message.includes('required'))
    ).toBe(true)
  })

  it('should reject shot without camera', () => {
    const noCamera = JSON.stringify({
      title: 'Test',
      shots: [
        {
          duration: 3,
          visual: 'Test',
          transition: 'Cut',
        },
      ],
    })

    const result = parseStoryScript(noCamera)

    expect(result.success).toBe(false)
    expect(
      result.errors.some(e => e.field.includes('camera') && e.message.includes('required'))
    ).toBe(true)
  })

  it('should reject shot without transition', () => {
    const noTransition = JSON.stringify({
      title: 'Test',
      shots: [
        {
          duration: 3,
          visual: 'Test',
          camera: 'Test',
        },
      ],
    })

    const result = parseStoryScript(noTransition)

    expect(result.success).toBe(false)
    expect(
      result.errors.some(e => e.field.includes('transition') && e.message.includes('required'))
    ).toBe(true)
  })

  it('should collect multiple validation errors', () => {
    const multipleErrors = JSON.stringify({
      title: '',
      shots: [
        {
          duration: -1,
          visual: '',
          camera: '',
          transition: '',
        },
        {
          // Missing all fields
        },
      ],
    })

    const result = parseStoryScript(multipleErrors)

    expect(result.success).toBe(false)
    expect(result.errors.length).toBeGreaterThan(5)
  })

  it('should include shot index in error messages', () => {
    const multipleShots = JSON.stringify({
      title: 'Test',
      shots: [
        {
          duration: 3,
          visual: 'Valid shot',
          camera: 'Test',
          transition: 'Cut',
        },
        {
          duration: -1, // Invalid
          visual: 'Invalid shot',
          camera: 'Test',
          transition: 'Cut',
        },
      ],
    })

    const result = parseStoryScript(multipleShots)

    expect(result.success).toBe(false)
    expect(result.errors.some(e => e.message.includes('Shot 2'))).toBe(true)
  })
})
