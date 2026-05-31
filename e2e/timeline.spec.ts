import { expect, test } from '@playwright/test';
import { loginAs } from './helpers/auth';

test.describe('タイムライン', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page);
  });

  test('タイムラインページが表示される', async ({ page }) => {
    await expect(page).toHaveURL(/\/timeline/);
    await expect(page.locator('body')).not.toContainText('読み込み中...', { timeout: 10_000 });
  });

  test('投稿カードが表示される（投稿が存在する場合）', async ({ page }) => {
    const cards = page.locator('[data-testid="post-card"]');
    const count = await cards.count();

    if (count > 0) {
      await expect(cards.first()).toBeVisible();
      await expect(cards.first().locator('[data-testid="like-button"]')).toBeVisible();
      await expect(cards.first().locator('[data-testid="want-to-go-button"]')).toBeVisible();
    }
  });

  test('いいねボタンをクリックするとカウントが変化する', async ({ page }) => {
    const cards = page.locator('[data-testid="post-card"]');
    const count = await cards.count();
    if (count === 0) {
      test.skip();
      return;
    }

    const likeBtn = cards.first().locator('[data-testid="like-button"]');
    const countBefore = (await likeBtn.textContent()) ?? '';
    await likeBtn.click();
    await expect(likeBtn).not.toHaveText(countBefore, { timeout: 5_000 });
  });
});
