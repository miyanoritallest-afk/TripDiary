---
name: quality-check
description: Run all quality checks for TripDiary — TypeScript type check, ESLint, and Vitest unit tests. Use before creating a PR or when asked to run tests/quality checks.
---

# quality-check

TypeScript の型チェック・ESLint・Vitest ユニットテストを順番に実行し、結果を報告する。

## 実行ステップ

### Step 1: TypeScript 型チェック

```bash
npx tsc --noEmit
```

- エラーがなければ ✅
- エラーがあれば、ファイル名・行番号・エラー内容を列挙する

### Step 2: ESLint

```bash
npm run lint
```

- 警告・エラーがなければ ✅
- 問題があれば、ファイル名・ルール名・内容を列挙する

### Step 3: Vitest ユニットテスト

```bash
npm run test
```

> ⚠️ テストファイルがまだない場合はスキップして「テスト未作成」と報告する。

- テスト結果（PASS/FAIL 件数）を報告する
- 失敗したテストがあれば、テスト名とエラー内容を列挙する

## 結果の報告

以下の形式で報告する：

```
## 品質チェック結果

### TypeScript 型チェック
- ✅ 型エラーなし  /  ❌ N件のエラー: <ファイル名・内容>

### ESLint
- ✅ 問題なし  /  ⚠️ N件の警告  /  ❌ N件のエラー: <内容>

### Vitest
- ✅ 全N件 PASS  /  ❌ N件 FAIL: <テスト名・エラー内容>
- （テスト未作成の場合）⚠️ テストファイルがまだありません
```

すべてパスした場合：「型チェック・Lint・テストがすべてパスしました。PR を作成できる状態です。」と報告する。

失敗があった場合：「N件の問題があります。PR を作成する前に修正してください。」と報告し、修正を提案する。
