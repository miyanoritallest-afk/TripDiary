import { expect, test } from '@playwright/test';
import { loginAs } from './helpers/auth';

test.describe('プロフィール', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page);
  });

  test('プロフィールページが表示される', async ({ page }) => {
    await page.goto('/profile');
    // プロフィール統計のラベル（p タグで表示される）
    await expect(page.locator('p.text-sm.text-gray-500').filter({ hasText: '投稿' })).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('p.text-sm.text-gray-500').filter({ hasText: 'フォロワー' })).toBeVisible();
    await expect(page.locator('p.text-sm.text-gray-500').filter({ hasText: 'フォロー中' })).toBeVisible();
  });

  test('編集ボタンでプロフィール編集モーダルが開く', async ({ page }) => {
    await page.goto('/profile');
    await page.getByRole('button', { name: '編集' }).click();

    await expect(page.getByText('プロフィールを編集')).toBeVisible({ timeout: 5_000 });
  });

  test('プロフィール編集モーダルをキャンセルで閉じられる', async ({ page }) => {
    await page.goto('/profile');
    await page.getByRole('button', { name: '編集' }).click();
    await expect(page.getByText('プロフィールを編集')).toBeVisible({ timeout: 5_000 });

    await page.getByRole('button', { name: 'キャンセル' }).click();
    await expect(page.getByText('プロフィールを編集')).not.toBeVisible({ timeout: 5_000 });
  });

  test('自分の投稿タブが表示される', async ({ page }) => {
    await page.goto('/profile');
    await expect(page.locator('body')).not.toContainText('読み込み中...', { timeout: 10_000 });
  });
});
