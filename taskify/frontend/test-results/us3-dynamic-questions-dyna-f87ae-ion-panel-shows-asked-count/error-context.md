# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: us3-dynamic-questions.spec.ts >> dynamic question panel shows asked count
- Location: tests\e2e\us3-dynamic-questions.spec.ts:3:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Preguntas dinámicas')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByText('Preguntas dinámicas') with timeout 5000ms
  - waiting for getByText('Preguntas dinámicas')

```

```yaml
- main:
  - heading "Espacio de decisiones" [level=1]
  - heading "Bandeja" [level=2]
  - button "Nuevo caso"
  - paragraph: No hay casos cargados.
```

# Test source

```ts
  1 | import { test, expect } from "@playwright/test";
  2 | 
  3 | test("dynamic question panel shows asked count", async ({ page }) => {
  4 |   await page.goto("/canvas");
> 5 |   await expect(page.getByText("Preguntas dinámicas")).toBeVisible();
    |                                                       ^ Error: expect(locator).toBeVisible() failed
  6 | });
```