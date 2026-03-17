import { test, expect } from '@playwright/test';

test.describe('ZakatTrack Dashboard Basic Tests', () => {
  test('should load the dashboard and show the title', async ({ page }) => {
    // Navigasi ke aplikasi
    await page.goto('http://localhost:5173');

    // Periksa apakah judul "ZakatTrack" muncul di header
    const title = page.locator('header .logo span');
    await expect(title).toContainText('ZakatTrack');
  });

  test('should open survey modal when "Survey Baru" is clicked', async ({ page }) => {
    await page.goto('http://localhost:5173');

    // Klik tombol Survey Baru
    await page.getByRole('button', { name: /Survey Baru/i }).click();

    // Periksa apakah modal muncul (berdasarkan teks di dalam SurveyForm)
    // Sembari menunggu komponen SurveyForm terdeteksi
    await expect(page.getByText(/Survey Data Mustahik/i)).toBeVisible();
  });

  test('should toggle showcase mode', async ({ page }) => {
    await page.goto('http://localhost:5173');

    const showcaseBtn = page.getByText(/ENTER SHOWCASE/i);
    await showcaseBtn.click();

    // Periksa apakah teks berubah menjadi SHOWCASE MODE ON
    await expect(page.getByText(/SHOWCASE MODE ON/i)).toBeVisible();
  });
});
