import { expect, test } from '@playwright/test';
import { loginAs } from './helpers/auth';

test.describe('ナビちゃん', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page);
  });

  test('ナビページが表示される', async ({ page }) => {
    await page.goto('/navi');
    await expect(page.getByText('ナビちゃん')).toBeVisible({ timeout: 10_000 });
  });

  test('新しいスレッドを作成できる', async ({ page }) => {
    await page.goto('/navi');

    // 新規スレッド作成ボタン（＋アイコン）をクリック
    await page.getByRole('button', { name: '新しい旅の相談を作成' }).click();
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5_000 });

    // タイトルを入力
    await page.getByRole('dialog').locator('input[type="text"]').fill('京都の秋旅 E2Eテスト');

    // 作成ボタンをクリック
    await page.getByRole('button', { name: /相談を始める|作成/ }).click();

    // スレッド詳細ページへ遷移
    await page.waitForURL(/\/navi\/.+/, { timeout: 20_000 });
    await expect(page).toHaveURL(/\/navi\/.+/);
  });

  test('スレッド詳細ページでナビちゃんのメッセージが表示される', async ({ page }) => {
    await page.goto('/navi');

    // 既存スレッドがあればクリック、なければスキップ
    const threadLink = page.locator('a[href*="/navi/"]').first();
    const count = await threadLink.count();
    if (count === 0) {
      test.skip();
      return;
    }

    await threadLink.click();
    await page.waitForURL(/\/navi\/.+/, { timeout: 10_000 });

    // ナビちゃんのメッセージバブル（🦜 アイコンの隣のメッセージ）
    await expect(page.getByText('🦜').first()).toBeVisible({ timeout: 15_000 });
  });
});
