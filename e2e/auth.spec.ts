import { expect, test } from '@playwright/test';

test.describe('認証', () => {
  test('新規ユーザー登録 → タイムラインへリダイレクト', async ({ page }) => {
    const uniqueEmail = `e2e-reg-${Date.now()}@example.com`;

    await page.goto('/register');
    await page.locator('input[placeholder="旅人たろう"]').fill('e2eテストユーザー');
    await page.locator('input[placeholder="example@email.com"]').fill(uniqueEmail);
    await page.locator('input[placeholder="8文字以上"]').fill('e2ePassword123');
    await page.locator('input[placeholder="もう一度入力"]').fill('e2ePassword123');
    await page.getByRole('button', { name: 'アカウントを作成' }).click();

    await page.waitForURL('**/timeline', { timeout: 15_000 });
    await expect(page).toHaveURL(/\/timeline/);
  });

  test('正しい資格情報でログインできる', async ({ page }) => {
    await page.goto('/login');
    await page.locator('input[placeholder="example@email.com"]').fill('e2e-test@example.com');
    await page.locator('input[placeholder="8文字以上"]').fill('e2ePassword123');
    await page.getByRole('button', { name: 'ログイン' }).click();

    await page.waitForURL('**/timeline', { timeout: 15_000 });
    await expect(page).toHaveURL(/\/timeline/);
  });

  test('誤ったパスワードでエラーメッセージが表示される', async ({ page }) => {
    await page.goto('/login');
    await page.locator('input[placeholder="example@email.com"]').fill('e2e-test@example.com');
    await page.locator('input[placeholder="8文字以上"]').fill('wrongpassword');
    await page.getByRole('button', { name: 'ログイン' }).click();

    await expect(
      page.getByText(/メールアドレスまたはパスワードが正しくありません|ログインに失敗/),
    ).toBeVisible({ timeout: 10_000 });
  });

  test('未ログイン状態でタイムラインへアクセスするとログインページへリダイレクト', async ({ page }) => {
    await page.goto('/timeline');
    await expect(page).toHaveURL(/\/login/);
  });
});
