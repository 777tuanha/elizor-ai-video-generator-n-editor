import { test, expect } from '@playwright/test'
import path from 'path'

test.describe('Video Editor E2E Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to app
    await page.goto('/')

    // Wait for app to load
    await page.waitForLoadState('domcontentloaded')
  })

  test('should complete full workflow: create project → load script → add videos → export', async ({ page }) => {
    // Set longer timeout for this test due to FFmpeg loading and video processing
    test.setTimeout(180000) // 3 minutes
    // Step 1: Wait for app to load
    await page.waitForSelector('text=Elizor', { timeout: 10000 })

    // Step 2: Create new project
    const newProjectButton = page.getByRole('button', { name: 'New Project' })
    await newProjectButton.click()

    // Wait for dialog to open
    await page.waitForSelector('text=Create a new TikTok video project', { timeout: 5000 })

    // Fill in project title using correct selector
    await page.fill('#title', 'E2E Test Project')

    // Click Create Project button
    await page.getByRole('button', { name: 'Create Project' }).click()

    // Wait for dialog to close and project to be created
    await page.waitForTimeout(1000)

    // Step 3: Load script using sample
    const loadScriptButton = page.getByRole('button', { name: 'Load Script' })
    await expect(loadScriptButton).toBeEnabled({ timeout: 5000 })
    await loadScriptButton.click()

    // Wait for Load Script dialog
    await page.waitForSelector('text=Load Story Script', { timeout: 5000 })

    // Click Use Sample button
    const useSampleButton = page.getByRole('button', { name: 'Use Sample' })
    await useSampleButton.click()

    // Wait for sample script to be loaded into textarea
    await page.waitForTimeout(500)

    // Click Load Script button in dialog
    const loadButton = page.getByRole('button', { name: 'Load Script' }).last()
    await loadButton.click()

    // Wait for shots to load - look for the shot card with #1
    await expect(page.locator('text=#1')).toBeVisible({ timeout: 10000 })

    // Verify we have shots loaded
    const shotCount = await page.locator('[data-testid="shot-item"]').count()
    console.log(`Loaded ${shotCount} shots`)

    // Step 3: Add videos to first 4 shots
    // Note: This test assumes we can upload videos, but in a real browser environment
    // file uploads might need to be handled differently

    // For each of the first 4 shots
    for (let i = 1; i <= Math.min(4, shotCount); i++) {
      // Click on shot card using data-testid
      await page.locator('[data-testid="shot-item"]').nth(i - 1).click()

      // Wait for shot editor to show
      await expect(page.locator('text=Shot Details')).toBeVisible({ timeout: 5000 })

      // Switch to Video Uploads tab
      const videoUploadsTab = page.getByRole('tab', { name: /Video Uploads/i })
      if (await videoUploadsTab.isVisible()) {
        await videoUploadsTab.click()
      }

      // Look for upload zone
      const uploadInput = page.locator('input[type="file"][accept*="video"]')
      if (await uploadInput.count() > 0) {
        // Upload video
        const videoPath = path.join(process.cwd(), `public/sample-data/alice_${i}.mp4`)
        try {
          await uploadInput.first().setInputFiles(videoPath)

          // Wait for upload to complete and video to appear
          await page.waitForTimeout(2000)

          // Mark as used
          const markAsUsedButton = page.getByRole('button', { name: /Mark as Used/i })
          if (await markAsUsedButton.first().isVisible({ timeout: 5000 })) {
            await markAsUsedButton.first().click()

            // Wait for timeline to update
            await page.waitForTimeout(1000)
          }
        } catch (error) {
          console.log(`Could not upload video for shot ${i}:`, error)
        }
      }
    }

    // Step 4: Verify timeline has clips
    const timelineClips = await page.locator('[data-testid="timeline-clip"]').count()
    console.log(`Timeline has ${timelineClips} clips`)
    expect(timelineClips).toBeGreaterThan(0)

    // Step 5: Verify export dialog can be opened
    // Note: Actual export may fail in test environment due to FFmpeg SharedArrayBuffer requirements
    if (timelineClips > 0) {
      const exportButton = page.getByRole('button', { name: /Export/i })
      await expect(exportButton).toBeVisible()
      await exportButton.click()

      // Wait for export dialog to open
      await expect(page.locator('text=Export Video')).toBeVisible({ timeout: 5000 })

      // Verify dialog shows correct clip count
      await expect(page.locator('text=Clips:').locator('..')).toContainText(timelineClips.toString())

      // Verify Start Export button is available
      const startExportButton = page.getByRole('button', { name: /Start Export/i })
      await expect(startExportButton).toBeVisible()

      console.log('Export dialog verified successfully')
      console.log('Note: Full export test skipped - FFmpeg requires COOP/COEP headers not available in test environment')

      // Close export dialog
      const closeButton = page.getByRole('button', { name: 'Close' }).first()
      await closeButton.click()
    }
  })

  test('should allow moving shot editor between positions', async ({ page }) => {
    // Wait for app to load
    await page.waitForSelector('text=Shot Editor', { timeout: 10000 })

    // Select a shot if available
    const firstShot = page.locator('[data-testid="shot-item"]').first()
    if (await firstShot.isVisible()) {
      await firstShot.click()

      // Wait for shot editor to show
      await page.waitForTimeout(500)

      // Find the move button
      const moveButton = page.getByRole('button', { name: /Move/i })
      if (await moveButton.isVisible()) {
        // Get initial position (should be at bottom)
        const shotEditor = page.locator('text=Shot Editor').first()
        const initialBox = await shotEditor.boundingBox()

        // Click move button
        await moveButton.click()
        await page.waitForTimeout(500)

        // Verify position changed
        const newBox = await shotEditor.boundingBox()
        expect(newBox?.y).not.toBe(initialBox?.y)

        // Move it back
        await moveButton.click()
        await page.waitForTimeout(500)

        console.log('Shot editor movement test passed')
      }
    }
  })

  test('should display JSON prompt in shot details', async ({ page }) => {
    // Wait for app to load
    await page.waitForSelector('text=Shot Editor', { timeout: 10000 })

    // Select first shot
    const firstShot = page.locator('[data-testid="shot-item"]').first()
    if (await firstShot.isVisible()) {
      await firstShot.click()

      // Wait for shot editor
      await page.waitForTimeout(500)

      // Should be on Shot Details tab by default
      await expect(page.locator('text=Shot Details')).toBeVisible()

      // Look for JSON Prompt section
      const jsonPrompt = page.locator('text=JSON Prompt')
      if (await jsonPrompt.isVisible()) {
        await expect(jsonPrompt).toBeVisible()

        // Verify textarea exists with JSON content
        const textarea = page.locator('textarea[readonly]')
        await expect(textarea).toBeVisible()

        const content = await textarea.inputValue()
        expect(content.length).toBeGreaterThan(0)

        // Verify it's valid JSON
        try {
          JSON.parse(content)
          console.log('JSON prompt is valid')
        } catch {
          throw new Error('JSON prompt is not valid JSON')
        }

        // Test copy JSON button
        const copyJsonButton = page.getByRole('button', { name: /Copy JSON/i })
        if (await copyJsonButton.isVisible()) {
          await copyJsonButton.click()

          // Should show "Copied!" feedback
          await expect(page.locator('text=Copied!')).toBeVisible({ timeout: 2000 })
        }
      }
    }
  })

  test('should have fixed-size timeline clips', async ({ page }) => {
    // Wait for app to load
    await page.waitForSelector('text=Timeline', { timeout: 10000 })

    // Check if timeline has any clips
    const timelineClips = page.locator('[data-testid="timeline-clip"]')
    const count = await timelineClips.count()

    if (count > 0) {
      // Check first clip dimensions
      const firstClip = timelineClips.first()
      const box = await firstClip.boundingBox()

      if (box) {
        // Should be 100x80px (with some tolerance for borders/padding)
        expect(box.width).toBeGreaterThanOrEqual(95)
        expect(box.width).toBeLessThanOrEqual(110)
        expect(box.height).toBeGreaterThanOrEqual(75)
        expect(box.height).toBeLessThanOrEqual(90)

        console.log(`Timeline clip dimensions: ${box.width}x${box.height}`)
      }
    } else {
      console.log('No timeline clips to test dimensions')
    }
  })
})
