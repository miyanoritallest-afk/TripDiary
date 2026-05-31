import { expect, test } from '@playwright/test';
import path from 'path';
import { loginAs } from './helpers/auth';

test.describe('投稿作成', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page);
  });

  test('URLパラメータで投稿作成モーダルが開く', async ({ page }) => {
    await page.goto('/timeline?post=1');
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 10_000 });
  });

  test('写真をアップロードして投稿を作成できる', async ({ page }) => {
    await page.goto('/timeline?post=1');
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 10_000 });

    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(path.resolve('e2e/fixtures/test-image.png'));

    // アップロード完了（プレビュー表示）を待つ
    await expect(
      page.locator('[data-testid="photo-preview"], img[alt*="photo"], img[alt*="写真"]').first(),
    ).toBeVisible({ timeout: 20_000 });

    // 本文を入力して投稿
    const textarea = page.locator('textarea').first();
    await textarea.fill('Playwright E2E テスト投稿');

    await page.getByRole('button', { name: /投稿する|シェアする|投稿/ }).click();

    // モーダルが閉じる
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 15_000 });
  });

  test('モーダルのキャンセルボタンでモーダルが閉じる', async ({ page }) => {
    await page.goto('/timeline?post=1');
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 10_000 });

    const cancelBtn = page.getByRole('button', { name: /キャンセル|閉じる/ });
    if (await cancelBtn.isVisible()) {
      await cancelBtn.click();
      await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 5_000 });
    }
  });
});
