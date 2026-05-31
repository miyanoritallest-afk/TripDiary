import type { Page } from '@playwright/test';

export const E2E_USER = {
  email: 'e2e-test@example.com',
  password: 'e2ePassword123',
  username: 'e2e-tester',
};

export async function loginAs(page: Page, email = E2E_USER.email, password = E2E_USER.password) {
  await page.goto('/login');
  await page.getByLabel('メールアドレス').fill(email);
  await page.getByLabel('パスワード').fill(password);
  await page.getByRole('button', { name: 'ログイン' }).click();
  await page.waitForURL('**/timeline');
}
