import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("checklist dashboard source is not the starter shell", async () => {
  const [page, layout, packageJson, checklistData] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readFile(new URL("../lib/checklist-data.ts", import.meta.url), "utf8"),
  ]);

  assert.match(layout, /Checklist HITO 6 - Barrido predial/);
  assert.match(page, /Avance general/);
  assert.match(page, /Avance por operador/);
  assert.match(page, /Reporte Excel/);
  assert.match(page, /status-option/);
  assert.match(checklistData, /Interlocuciones/);
  assert.match(checklistData, /Documento Diagnostico/);
  assert.match(checklistData, /Cronograma Otrosí/);
  assert.match(checklistData, /Acta de reunión/);
  assert.match(checklistData, /Saldos de Mutación/);
  assert.doesNotMatch(page + layout + packageJson + checklistData, /codex-preview|react-loading-skeleton|Your site is taking shape|Starter Project|En proceso/i);
});
