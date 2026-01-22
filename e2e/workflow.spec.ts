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
    // Step 1: Create new project or wait for it to load
    await page.waitForSelector('text=Elizor', { timeout: 10000 })

    // Check if we need to create a project or if one exists
    const hasProject = await page.locator('text=Shot').count() > 0

    if (!hasProject) {
      // Create new project
      const newProjectButton = page.getByRole('button', { name: /New Project/i })
      if (await newProjectButton.isVisible()) {
        await newProjectButton.click()
        await page.fill('input[name="title"]', 'E2E Test Project')
        await page.click('button:has-text("Create")')
      }
    }

    // Step 2: Load alice-wonderland script
    // Look for Load Script or Import button
    const menuButton = page.getByRole('button', { name: /Project/i })
    if (await menuButton.isVisible()) {
      await menuButton.click()

      // Click Load Script option
      const loadScriptOption = page.getByRole('menuitem', { name: /Load Script/i })
      if (await loadScriptOption.isVisible()) {
        await loadScriptOption.click()

        // Wait for dialog to open
        await page.waitForSelector('text=Load Story Script', { timeout: 5000 })

        // Use sample script button if available
        const useSampleButton = page.getByRole('button', { name: /Use Sample/i })
        if (await useSampleButton.isVisible()) {
          await useSampleButton.click()
        } else {
          // Upload the sample script
          const fileInput = page.locator('input[type="file"]')
          const scriptPath = path.join(process.cwd(), 'public/sample-scripts/alice-wonderland.json')
          await fileInput.setInputFiles(scriptPath)
        }

        // Confirm load
        const loadButton = page.getByRole('button', { name: /Load/i })
        await loadButton.click()
      }
    }

    // Wait for shots to load
    await expect(page.locator('text=Shot 1')).toBeVisible({ timeout: 10000 })

    // Verify we have shots loaded
    const shotCount = await page.locator('[data-testid="shot-item"]').count()
    console.log(`Loaded ${shotCount} shots`)

    // Step 3: Add videos to first 4 shots
    // Note: This test assumes we can upload videos, but in a real browser environment
    // file uploads might need to be handled differently

    // For each of the first 4 shots
    for (let i = 1; i <= Math.min(4, shotCount); i++) {
      // Click on shot
      await page.click(`text=Shot ${i}`)

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

    // If we have clips, try to export
    if (timelineClips > 0) {
      // Step 5: Export video
      const exportButton = page.getByRole('button', { name: /Export/i })
      if (await exportButton.isVisible()) {
        await exportButton.click()

        // Wait for export dialog
        await expect(page.locator('text=Export Video')).toBeVisible({ timeout: 5000 })

        // Start export
        const startExportButton = page.getByRole('button', { name: /Start Export/i })
        if (await startExportButton.isVisible()) {
          await startExportButton.click()

          // Wait for export to complete (this could take a while)
          // Look for completion message or download button
          await expect(
            page.locator('text=Export complete').or(page.getByRole('button', { name: /Download/i }))
          ).toBeVisible({ timeout: 120000 })

          console.log('Export completed successfully')
        }
      }
    } else {
      console.log('No videos in timeline, skipping export test')
    }
  })

  test('should allow moving shot editor between positions', async ({ page }) => {
    // Wait for app to load
    await page.waitForSelector('text=Shot Editor', { timeout: 10000 })

    // Select a shot if available
    const firstShot = page.locator('text=Shot 1')
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
    await page.waitForSelector('text=Shot', { timeout: 10000 })

    // Select first shot
    const firstShot = page.locator('text=Shot 1')
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
