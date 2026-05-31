import { expect, test } from '@playwright/test';

test.describe('認証', () => {
  test('新規ユーザー登録 → タイムラインへリダイレクト', async ({ page }) => {
    const uniqueEmail = `e2e-reg-${Date.now()}@example.com`;

    await page.goto('/register');
    await page.getByLabel('ユーザー名').fill('e2eテストユーザー');
    await page.getByLabel('メールアドレス').fill(uniqueEmail);
    await page.getByLabel('パスワード', { exact: true }).fill('e2ePassword123');
    await page.getByLabel('パスワード（確認）').fill('e2ePassword123');
    await page.getByRole('button', { name: 'アカウントを作成' }).click();

    await page.waitForURL('**/timeline', { timeout: 15_000 });
    await expect(page).toHaveURL(/\/timeline/);
  });

  test('正しい資格情報でログインできる', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('メールアドレス').fill('e2e-test@example.com');
    await page.getByLabel('パスワード').fill('e2ePassword123');
    await page.getByRole('button', { name: 'ログイン' }).click();

    await page.waitForURL('**/timeline', { timeout: 15_000 });
    await expect(page).toHaveURL(/\/timeline/);
  });

  test('誤ったパスワードでエラーメッセージが表示される', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('メールアドレス').fill('e2e-test@example.com');
    await page.getByLabel('パスワード').fill('wrongpassword');
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
