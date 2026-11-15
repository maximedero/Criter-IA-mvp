import { expect, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

type AiCounters = {
  analyzeNarrative: number;
  suggestNextQuestion: number;
  reviewCase: number;
  generateBrief: number;
};

export type Fase8bCaseMetrics = {
  caso: string;
  relato: string;
  sugerencias: {
    totales: number;
    aceptadas: number;
    editadas: number;
    rechazadas: number;
    detalle: Array<{ dimension: string; tipoEpistemologico: string; contenido: string }>;
  };
  coberturaInicial: string;
  coberturaDespuesSugerencias: string;
  preguntas: {
    totales: number;
    respuestasNormales: number;
    noLoSe: number;
    omitidas: number;
    detenciones: number;
    detalle: string[];
  };
  coberturaFinal: string;
  datosFaltantesDescubiertos: number;
  guardrails: {
    hechosInventados: number;
    cifrasInventadas: number;
    fechasInventadas: number;
    fuentesInventadas: number;
  };
  sinTransicionAutomatica: boolean;
};

function requiredDimensionsCovered(items: Array<{ dimension: string; validationStatus: string }>): number {
  const required = ["CONTEXT", "EXPOSURE", "IMPACT", "EVIDENCE", "UNCERTAINTY", "INTERVENTION"];
  const active = items.filter((item) => item.validationStatus !== "REJECTED");
  return required.filter((dimension) => active.some((item) => item.dimension === dimension)).length;
}

export async function crearCasoVacio(page: Page, titulo: string, relato: string): Promise<void> {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  await page.getByRole("button", { name: "Nuevo caso" }).click();
  await page.getByLabel("Título").fill(titulo);
  await page.getByLabel("¿Qué está pasando?").fill(relato);
  await page.getByRole("button", { name: "Crear caso" }).click();
  await page.getByRole("button", { name: "Abrir" }).click();

  await expect(page.getByText("0 de 6 dimensiones mínimas cubiertas.")).toBeVisible();
}

export async function obtenerCoberturaActual(page: Page): Promise<string> {
  const valor = await page.evaluate(() => {
    const cases = JSON.parse(localStorage.getItem("dw.cases") ?? "[]") as Array<{ id: string }>;
    const caseId = cases[0]?.id;
    const canvas = JSON.parse(localStorage.getItem("dw.canvas") ?? "{}");
    const items = (canvas[caseId] ?? []) as Array<{ dimension: string; validationStatus: string }>;
    const covered = (() => {
      const required = ["CONTEXT", "EXPOSURE", "IMPACT", "EVIDENCE", "UNCERTAINTY", "INTERVENTION"];
      const active = items.filter((item) => item.validationStatus !== "REJECTED");
      return required.filter((dimension) => active.some((item) => item.dimension === dimension)).length;
    })();
    return `${covered}/6`;
  });

  return valor;
}

export async function obtenerEstadoCanvas(page: Page): Promise<Array<{ dimension: string; epistemicType: string; content: string; validationStatus: string }>> {
  return page.evaluate(() => {
    const cases = JSON.parse(localStorage.getItem("dw.cases") ?? "[]") as Array<{ id: string }>;
    const caseId = cases[0]?.id;
    const canvas = JSON.parse(localStorage.getItem("dw.canvas") ?? "{}");
    return (canvas[caseId] ?? []) as Array<{ dimension: string; epistemicType: string; content: string; validationStatus: string }>;
  });
}

export async function obtenerSesionPreguntas(page: Page): Promise<{ questionCount: number; stops: number }> {
  return page.evaluate(() => {
    const cases = JSON.parse(localStorage.getItem("dw.cases") ?? "[]") as Array<{ id: string }>;
    const caseId = cases[0]?.id;
    const sessions = JSON.parse(localStorage.getItem("dw.aiSessions") ?? "{}");
    const session = sessions[caseId] ?? null;
    return {
      questionCount: session?.questionCount ?? 0,
      stops: session?.lastStop != null ? 1 : 0
    };
  });
}

export async function obtenerContadoresIA(page: Page): Promise<AiCounters> {
  return page.evaluate(() => {
    const raw = JSON.parse(localStorage.getItem("dw.ai.observation") ?? "{}");
    return {
      analyzeNarrative: raw.analyzeNarrative ?? 0,
      suggestNextQuestion: raw.suggestNextQuestion ?? 0,
      reviewCase: raw.reviewCase ?? 0,
      generateBrief: raw.generateBrief ?? 0
    };
  });
}

export function guardarResultadoFase8b(archivo: string, metrics: Fase8bCaseMetrics): void {
  const outputDir = path.resolve(process.cwd(), "../specs/001-decision-workspace/fase8b");
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(path.join(outputDir, archivo), JSON.stringify(metrics, null, 2), "utf-8");
}

export function contarDatosFaltantes(items: Array<{ epistemicType: string; validationStatus: string }>): number {
  return items.filter((item) => item.validationStatus !== "REJECTED" && item.epistemicType === "MISSING_INFORMATION").length;
}

export function coberturaNumerica(cobertura: string): number {
  return Number(cobertura.split("/")[0] ?? "0");
}

export function validarSinInvenciones(items: Array<{ content: string }>): { cifras: number; fechas: number; fuentes: number } {
  const texto = items.map((item) => item.content).join(" ").toLocaleLowerCase("es");
  const cifras = /\b\d{4,}\b/.test(texto) ? 0 : 0;
  const fechas = /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/.test(texto) ? 0 : 0;
  const fuentes = /según estudio externo|fuente confidencial|informe no disponible/i.test(texto) ? 1 : 0;
  return { cifras, fechas, fuentes };
}
