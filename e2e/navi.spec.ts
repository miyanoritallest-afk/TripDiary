import { expect, test } from '@playwright/test';
import { loginAs } from './helpers/auth';

test.describe('ナビちゃん', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page);
  });

  test('ナビページが表示される', async ({ page }) => {
    await page.goto('/navi');
    await expect(page.getByRole('heading', { name: 'ナビちゃん' })).toBeVisible({ timeout: 10_000 });
  });

  test('新しいスレッドを作成できる', async ({ page }) => {
    await page.goto('/navi');

    // 新規スレッド作成ボタン（＋アイコン）をクリック
    await page.getByRole('button', { name: '新しい旅の相談を作成' }).click();
    await expect(page.getByRole('heading', { name: '新しい旅の相談' })).toBeVisible({ timeout: 5_000 });

    // タイトルを入力
    await page.getByRole('textbox').fill('京都の秋旅 E2Eテスト');

    // 作成ボタンをクリック
    await page.getByRole('button', { name: '相談を始める' }).click();

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
