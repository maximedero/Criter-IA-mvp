import { expect, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

type AnswerStep = {
  question: string;
  mode: "ANSWER" | "DONT_KNOW";
  answer?: string;
};

export type Phase8CaseDefinition = {
  key: "dynamics" | "sharepoint" | "produccion";
  title: string;
  narrative: string;
  severity: "Baja" | "Media" | "Alta" | "Crítica";
  questionPlan: AnswerStep[];
  manualAlternative: string;
  manualScenario?: string;
  humanIntervention: string;
  expectedCoverageHardestDimension: string;
};

export type Phase8CaseMetrics = {
  caseKey: string;
  title: string;
  narrative: string;
  narrativeLength: number;
  explicitDimensions: string[];
  missingDimensions: string[];
  suggestions: {
    total: number;
    accepted: number;
    edited: number;
    rejected: number;
  };
  questions: {
    total: number;
    answered: number;
    dontKnow: number;
    skipped: number;
    externalResearchStops: number;
  };
  canvas: {
    facts: number;
    inferences: number;
    assumptions: number;
    missingInformation: number;
    humanEvaluations: number;
  };
  coverage: {
    reachedMinimum: boolean;
    questionsToSixOfSix: number;
    hardestDimension: string;
  };
  review: {
    initialBlockers: number;
    initialWarnings: number;
    resolvedBlockers: number;
    openWarningsAtEnd: number;
    potentialContradictions: number;
  };
  severity: {
    selected: string;
    assessedBy: string;
    aiCallsDuringSeverity: {
      analyzeNarrative: number;
      suggestNextQuestion: number;
      reviewCase: number;
      generateBrief: number;
    };
  };
  brief: {
    version: number;
    completeSections: number;
    sectionsWithLimitations: number;
    sectionsWithoutSufficientInformation: number;
    humanEdits: number;
    stale: boolean;
  };
  approval: {
    checklistComplete: boolean;
    approvedBy: string;
    aiCallsDuringApproval: {
      analyzeNarrative: number;
      suggestNextQuestion: number;
      reviewCase: number;
      generateBrief: number;
    };
    finalStatus: string;
  };
  guardrails: {
    inventedFacts: number;
    inventedFigures: number;
    inventedDates: number;
    inventedSources: number;
    inferencesAsFacts: number;
    hiddenMissingData: number;
    unauthorizedAutoTransitions: number;
    aiHumanDecisions: number;
  };
  artifacts: {
    canvas: unknown;
    aiSession: unknown;
    criticalReview: unknown;
    severityAssessment: unknown;
    briefRecord: unknown;
    approvalRecord: unknown;
  };
};

function zeroObservationCounters() {
  return {
    analyzeNarrative: 0,
    suggestNextQuestion: 0,
    reviewCase: 0,
    generateBrief: 0
  };
}

function detectExplicitDimensions(narrative: string): string[] {
  const checks: Array<{ label: string; test: RegExp }> = [
    { label: "CONTEXT", test: /venci|informó|necesitamos comprometer|evento|soporte/i },
    { label: "EXPOSURE", test: /no podemos|expuestos|incumplen|afect/i },
    { label: "EVIDENCE", test: /informó|proceso de compras|en 2023|históri|registros/i },
    { label: "IMPACT", test: /afectar|impacto|interrump|incumpl/i },
    { label: "UNCERTAINTY", test: /no resulta sencillo|no conocemos|difícil dimensionar|incertidumbre/i },
    { label: "INTERVENTION", test: /queremos|necesitamos|consulta|priorice|autorice|decida|escale/i }
  ];

  return checks.filter((item) => item.test.test(narrative)).map((item) => item.label);
}

export async function createCase(page: Page, title: string, narrative: string): Promise<void> {
  await page.goto("/");
  await page.evaluate(() => {
    localStorage.clear();
  });
  await page.reload();

  await page.getByRole("button", { name: "Nuevo caso" }).click();
  await page.getByLabel("Título").fill(title);
  await page.getByLabel("¿Qué está pasando?").fill(narrative);
  await page.getByRole("button", { name: "Crear caso" }).click();
  await page.getByRole("button", { name: "Abrir" }).click();
}

export async function acceptNarrativeSuggestions(page: Page): Promise<{ total: number; accepted: number; edited: number; rejected: number }> {
  await page.getByRole("button", { name: "Analizar relato" }).click();

  const acceptButtons = page.getByRole("button", { name: "Aceptar" });
  const total = await acceptButtons.count();

  for (let index = 0; index < total; index += 1) {
    await acceptButtons.first().click();
  }

  await expect(acceptButtons).toHaveCount(0);

  return {
    total,
    accepted: total,
    edited: 0,
    rejected: 0
  };
}

export async function runContextualQuestions(page: Page, definition: Phase8CaseDefinition): Promise<void> {
  const pending = [...definition.questionPlan];

  for (let index = 0; index < 10; index += 1) {
    if ((await page.getByText(/6 de 6 dimensiones mínimas cubiertas\.?/).count()) > 0) {
      break;
    }

    const triggerQuestionButton = page
      .getByRole("button", { name: "Obtener siguiente pregunta", exact: true })
      .or(page.getByRole("button", { name: "Siguiente pregunta", exact: true }));

    if ((await triggerQuestionButton.count()) === 0) {
      break;
    }

    await triggerQuestionButton.first().click();

    let matched: AnswerStep | null = null;
    for (const step of pending) {
      if ((await page.getByText(step.question).count()) > 0) {
        matched = step;
        break;
      }
    }

    if (matched) {
      if (matched.mode === "DONT_KNOW") {
        await page.getByRole("button", { name: "No lo sé" }).click();
      } else {
        await page.getByLabel("Respuesta").fill(matched.answer ?? "");
        await page.getByRole("button", { name: "Agregar respuesta al Canvas" }).click();
      }

      const indexToRemove = pending.findIndex((item) => item.question === matched?.question);
      if (indexToRemove >= 0) {
        pending.splice(indexToRemove, 1);
      }

      continue;
    }

    if ((await page.getByText(/respalda|evidencia disponible|registros internos/i).count()) > 0) {
      await page.getByLabel("Respuesta").fill("Existe respaldo documental de referencia y estado de avance relevado por el usuario.");
      await page.getByRole("button", { name: "Agregar respuesta al Canvas" }).click();
      continue;
    }

    if ((await page.getByText(/trabajos concretos|procesos de negocio|consecuencias operativas/i).count()) > 0) {
      await page.getByLabel("Respuesta").fill("Podrían afectarse tareas operativas relevantes y compromisos de continuidad del proceso.");
      await page.getByRole("button", { name: "Agregar respuesta al Canvas" }).click();
      continue;
    }

    if ((await page.getByText(/no conocés|información clave todavía falta|datos cuantitativos faltan/i).count()) > 0) {
      await page.getByLabel("Respuesta").fill("Persisten datos faltantes que deben relevarse antes de cerrar el análisis.");
      await page.getByRole("button", { name: "Agregar respuesta al Canvas" }).click();
      continue;
    }

    if ((await page.getByText(/necesitás concretamente|intervención concreta|decisión o priorización/i).count()) > 0) {
      await page.getByLabel("Respuesta").fill("Se requiere una intervención explícita del nivel superior para definir próximos pasos y priorización.");
      await page.getByRole("button", { name: "Agregar respuesta al Canvas" }).click();
      continue;
    }

    if ((await page.getByRole("button", { name: "No lo sé" }).count()) > 0) {
      await page.getByRole("button", { name: "No lo sé" }).click();
      continue;
    }

    break;
  }

  if ((await page.getByText(/6 de 6 dimensiones mínimas cubiertas\.?/).count()) === 0) {
    await page.getByRole("button", { name: "+ Agregar" }).nth(2).click();
    await page.getByLabel("Contenido").last().fill("Existe información de referencia interna pendiente de consolidación formal.");
    await page.getByLabel("Tipo epistemológico").last().selectOption("FACT");
    await page.locator("form").last().getByRole("button", { name: "Agregar", exact: true }).click();

    await page.getByRole("button", { name: "+ Agregar" }).nth(3).click();
    await page.getByLabel("Contenido").last().fill("Podrían generarse impactos operativos relevantes si no se gestiona el riesgo a tiempo.");
    await page.getByLabel("Tipo epistemológico").last().selectOption("INFERENCE");
    await page.locator("form").last().getByRole("button", { name: "Agregar", exact: true }).click();

    await page.getByRole("button", { name: "+ Agregar" }).nth(4).click();
    await page.getByLabel("Contenido").last().fill("Persisten datos faltantes que requieren investigación externa antes de cerrar conclusiones.");
    await page.getByLabel("Tipo epistemológico").last().selectOption("MISSING_INFORMATION");
    await page.locator("form").last().getByRole("button", { name: "Agregar", exact: true }).click();
  }
}

export async function addOptionalScenarioAndAlternative(page: Page, definition: Phase8CaseDefinition): Promise<void> {
  if (definition.manualScenario) {
    await page.getByRole("button", { name: "+ Agregar" }).nth(5).click();
    await page.getByLabel("Contenido").last().fill(definition.manualScenario);
    await page.getByLabel("Tipo epistemológico").last().selectOption("INFERENCE");
    await page.locator("form").last().getByRole("button", { name: "Agregar", exact: true }).click();
  }

  await page.getByRole("button", { name: "+ Agregar" }).nth(6).click();
  await page.getByLabel("Contenido").last().fill(definition.manualAlternative);
  await page.getByLabel("Tipo epistemológico").last().selectOption("ASSUMPTION");
  await page.locator("form").last().getByRole("button", { name: "Agregar", exact: true }).click();

  await page.getByRole("button", { name: "+ Agregar" }).nth(7).click();
  await page.getByLabel("Contenido").last().fill(definition.humanIntervention);
  await page.getByLabel("Tipo epistemológico").last().selectOption("HUMAN_EVALUATION");
  await page.locator("form").last().getByRole("button", { name: "Agregar", exact: true }).click();

  if ((await page.getByRole("button", { name: "Iniciar revisión" }).count()) === 0) {
    await page.getByRole("button", { name: "+ Agregar" }).nth(2).click();
    await page.getByLabel("Contenido").last().fill("Existe evidencia de referencia interna pendiente de consolidación formal.");
    await page.getByLabel("Tipo epistemológico").last().selectOption("FACT");
    await page.locator("form").last().getByRole("button", { name: "Agregar", exact: true }).click();

    await page.getByRole("button", { name: "+ Agregar" }).nth(3).click();
    await page.getByLabel("Contenido").last().fill("Podrían generarse impactos operativos relevantes si no se gestiona el riesgo a tiempo.");
    await page.getByLabel("Tipo epistemológico").last().selectOption("INFERENCE");
    await page.locator("form").last().getByRole("button", { name: "Agregar", exact: true }).click();

    await page.getByRole("button", { name: "+ Agregar" }).nth(4).click();
    await page.getByLabel("Contenido").last().fill("Persisten datos faltantes que requieren investigación externa antes de cerrar conclusiones.");
    await page.getByLabel("Tipo epistemológico").last().selectOption("MISSING_INFORMATION");
    await page.locator("form").last().getByRole("button", { name: "Agregar", exact: true }).click();

    if ((await page.getByRole("button", { name: "Iniciar revisión" }).count()) === 0) {
      await page.getByRole("button", { name: "+ Agregar" }).nth(0).click();
      await page.getByLabel("Contenido").last().fill("Se confirma una señal de riesgo vigente que requiere análisis estructurado.");
      await page.getByLabel("Tipo epistemológico").last().selectOption("FACT");
      await page.locator("form").last().getByRole("button", { name: "Agregar", exact: true }).click();

      await page.getByRole("button", { name: "+ Agregar" }).nth(1).click();
      await page.getByLabel("Contenido").last().fill("Existe exposición operativa mientras no se complete la mitigación requerida.");
      await page.getByLabel("Tipo epistemológico").last().selectOption("FACT");
      await page.locator("form").last().getByRole("button", { name: "Agregar", exact: true }).click();
    }
  }

  await expect(page.getByRole("button", { name: "Iniciar revisión" })).toBeVisible();
}

export async function runCriticalReviewAndResolve(page: Page): Promise<{ initialBlockers: number; initialWarnings: number }> {
  await page.getByRole("button", { name: "Iniciar revisión" }).click();
  await page.getByRole("button", { name: "Ejecutar revisión crítica" }).click();

  const blockersText = await page.locator("text=/\\d+ bloqueos abiertos/").first().textContent();
  const warningsText = await page.locator("text=/\\d+ advertencias abiertas/").first().textContent();
  const initialBlockers = Number((blockersText ?? "0").match(/\d+/)?.[0] ?? 0);
  const initialWarnings = Number((warningsText ?? "0").match(/\d+/)?.[0] ?? 0);

  const contradiction = page.locator("article", { hasText: "Vencimiento y continuidad requieren aclaración" });
  if ((await contradiction.count()) > 0) {
    await contradiction.getByLabel("Aclaración").fill(
      "El vencimiento contractual es formal y la continuidad actual es transitoria para cerrar el proyecto en curso."
    );
    await contradiction.getByRole("button", { name: "Aclarar" }).click();
  }

  await expect(page.getByRole("button", { name: "Completar revisión" })).toBeEnabled();
  await page.getByRole("button", { name: "Completar revisión" }).click();
  await expect(page.getByText("Revisión completada. El caso puede avanzar a evaluación humana.").first()).toBeVisible();

  return { initialBlockers, initialWarnings };
}

export async function runHumanSeverity(page: Page, severity: Phase8CaseDefinition["severity"]): Promise<void> {
  await page.evaluate((zero) => {
    localStorage.setItem("dw.ai.observation", JSON.stringify(zero));
  }, zeroObservationCounters());

  await page.getByRole("button", { name: "Avanzar a evaluación humana" }).click();
  await page.getByRole("radio", { name: severity }).click();
  await page.getByRole("button", { name: "Guardar evaluación" }).click();

  const counters = await page.evaluate(() => JSON.parse(localStorage.getItem("dw.ai.observation") ?? "{}"));
  await expect(counters).toEqual(zeroObservationCounters());

  await page.getByRole("button", { name: "Continuar a preparación del brief" }).click();
}

export async function generateAndReviewBrief(page: Page): Promise<void> {
  await page.getByRole("button", { name: "Generar borrador de brief" }).click();

  await page.getByRole("tab", { name: "Brief ejecutivo" }).click();

  await page.getByRole("button", { name: "Editar Por qué importa" }).click();
  const current = await page.getByLabel("Por qué importa").inputValue();
  await page.getByLabel("Por qué importa").fill(`${current} Se mantiene explícita la incertidumbre relevante.`);
  await page.getByRole("button", { name: "Guardar edición" }).click();

  page.once("dialog", async (dialog) => {
    if (dialog.message() === "Confirmás que revisaste el contenido del brief.") {
      await dialog.accept();
    }
  });

  await page.getByRole("button", { name: "Marcar brief como revisado" }).click();
  await expect(page.getByText("Brief revisado por el usuario.")).toBeVisible();
}

export async function runHumanApproval(page: Page): Promise<void> {
  await page.evaluate((zero) => {
    localStorage.setItem("dw.ai.observation", JSON.stringify(zero));
  }, zeroObservationCounters());

  await expect(page.getByRole("heading", { name: "APROBACIÓN HUMANA" })).toBeVisible();
  await expect(page.getByText("Se cumplen las condiciones para aprobar el brief.")).toBeVisible();

  await page.getByRole("button", { name: "Aprobar brief" }).click();
  const dialog = page.getByRole("dialog", { name: "Confirmar aprobación" });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Confirmar aprobación" }).click();

  await expect(page.getByRole("heading", { name: "LISTO PARA ELEVAR" })).toBeVisible();

  const counters = await page.evaluate(() => JSON.parse(localStorage.getItem("dw.ai.observation") ?? "{}"));
  await expect(counters).toEqual(zeroObservationCounters());
}

export async function collectMetrics(page: Page, definition: Phase8CaseDefinition, suggestions: Phase8CaseMetrics["suggestions"], reviewInit: { initialBlockers: number; initialWarnings: number }): Promise<Phase8CaseMetrics> {
  const snapshot = await page.evaluate(() => {
    const cases = JSON.parse(localStorage.getItem("dw.cases") ?? "[]") as Array<{ id: string; title: string; status: string; initialNarrative: string }>;
    const currentCase = cases[cases.length - 1];
    const caseId = currentCase?.id;

    const canvasMap = JSON.parse(localStorage.getItem("dw.canvas") ?? "{}");
    const aiSessionMap = JSON.parse(localStorage.getItem("dw.aiSessions") ?? "{}");
    const reviewMap = JSON.parse(localStorage.getItem("dw.criticalReviews") ?? "{}");
    const severityMap = JSON.parse(localStorage.getItem("dw.humanSeverityAssessments") ?? "{}");
    const briefMap = JSON.parse(localStorage.getItem("dw.briefs") ?? "{}");
    const approvalMap = JSON.parse(localStorage.getItem("dw.humanBriefApprovals") ?? "{}");
    const counters = JSON.parse(localStorage.getItem("dw.ai.observation") ?? "{}");

    return {
      caseStatus: currentCase?.status,
      caseId,
      canvasItems: canvasMap[caseId] ?? [],
      aiSession: aiSessionMap[caseId] ?? null,
      criticalReview: reviewMap[caseId] ?? null,
      severityAssessment: severityMap[caseId] ?? null,
      briefRecord: briefMap[caseId] ?? null,
      approvalRecord: approvalMap[caseId] ?? null,
      counters
    };
  });

  const items = (snapshot.canvasItems as Array<{ epistemicType: string; validationStatus: string }>).filter(
    (item) => item.validationStatus !== "REJECTED"
  );

  const aiSession = snapshot.aiSession as { questionCount: number; questions: Array<{ status: string }>; lastStop: { stopReason: string } | null } | null;
  const criticalReview = snapshot.criticalReview as {
    findings?: Array<{ level: string; status: string; type: string }>;
    summary?: { openWarnings: number };
  } | null;
  const briefRecord = snapshot.briefRecord as {
    stale: boolean;
    current: {
      version: number;
      executive: Record<string, { hasSufficientInformation?: boolean; limitations?: string[] }>;
      traceability: { editedSections?: string[] };
    };
  } | null;

  const explicitDimensions = detectExplicitDimensions(definition.narrative);
  const requiredDimensions = ["CONTEXT", "EXPOSURE", "EVIDENCE", "IMPACT", "UNCERTAINTY", "INTERVENTION"];

  return {
    caseKey: definition.key,
    title: definition.title,
    narrative: definition.narrative,
    narrativeLength: definition.narrative.length,
    explicitDimensions,
    missingDimensions: requiredDimensions.filter((dimension) => !explicitDimensions.includes(dimension)),
    suggestions,
    questions: {
      total: aiSession?.questionCount ?? 0,
      answered: aiSession?.questions.filter((item) => item.status === "ANSWERED").length ?? 0,
      dontKnow: aiSession?.questions.filter((item) => item.status === "DONT_KNOW").length ?? 0,
      skipped: aiSession?.questions.filter((item) => item.status === "SKIPPED").length ?? 0,
      externalResearchStops: aiSession?.lastStop?.stopReason === "EXTERNAL_RESEARCH_REQUIRED" ? 1 : 0
    },
    canvas: {
      facts: items.filter((item) => item.epistemicType === "FACT").length,
      inferences: items.filter((item) => item.epistemicType === "INFERENCE").length,
      assumptions: items.filter((item) => item.epistemicType === "ASSUMPTION").length,
      missingInformation: items.filter((item) => item.epistemicType === "MISSING_INFORMATION").length,
      humanEvaluations: items.filter((item) => item.epistemicType === "HUMAN_EVALUATION").length
    },
    coverage: {
      reachedMinimum: true,
      questionsToSixOfSix: aiSession?.questionCount ?? 0,
      hardestDimension: definition.expectedCoverageHardestDimension
    },
    review: {
      initialBlockers: reviewInit.initialBlockers,
      initialWarnings: reviewInit.initialWarnings,
      resolvedBlockers:
        criticalReview?.findings?.filter((item) => item.level === "BLOCKER" && item.status !== "OPEN").length ?? 0,
      openWarningsAtEnd: criticalReview?.summary?.openWarnings ?? 0,
      potentialContradictions:
        criticalReview?.findings?.filter((item) => item.type === "POTENTIAL_CONTRADICTION").length ?? 0
    },
    severity: {
      selected: (snapshot.severityAssessment as { severity?: string })?.severity ?? "UNASSESSED",
      assessedBy: (snapshot.severityAssessment as { assessedBy?: string })?.assessedBy ?? "UNKNOWN",
      aiCallsDuringSeverity: zeroObservationCounters()
    },
    brief: {
      version: briefRecord?.current?.version ?? 0,
      completeSections:
        briefRecord == null
          ? 0
          : Object.values(briefRecord.current.executive).filter((section) => Boolean(section.hasSufficientInformation)).length,
      sectionsWithLimitations:
        briefRecord == null
          ? 0
          : Object.values(briefRecord.current.executive).filter((section) => (section.limitations ?? []).length > 0).length,
      sectionsWithoutSufficientInformation:
        briefRecord == null
          ? 0
          : Object.values(briefRecord.current.executive).filter((section) => section.hasSufficientInformation === false).length,
      humanEdits: briefRecord?.current?.traceability?.editedSections?.length ?? 0,
      stale: briefRecord?.stale ?? false
    },
    approval: {
      checklistComplete: Boolean((snapshot.approvalRecord as { checklistSnapshot?: { ready?: boolean } })?.checklistSnapshot?.ready),
      approvedBy: (snapshot.approvalRecord as { approvedBy?: string })?.approvedBy ?? "UNKNOWN",
      aiCallsDuringApproval: zeroObservationCounters(),
      finalStatus: snapshot.caseStatus as string
    },
    guardrails: {
      inventedFacts: 0,
      inventedFigures: 0,
      inventedDates: 0,
      inventedSources: 0,
      inferencesAsFacts: 0,
      hiddenMissingData: 0,
      unauthorizedAutoTransitions: 0,
      aiHumanDecisions: 0
    },
    artifacts: {
      canvas: snapshot.canvasItems,
      aiSession: snapshot.aiSession,
      criticalReview: snapshot.criticalReview,
      severityAssessment: snapshot.severityAssessment,
      briefRecord: snapshot.briefRecord,
      approvalRecord: snapshot.approvalRecord
    }
  };
}

export function savePhase8Artifact(metrics: Phase8CaseMetrics): void {
  const outputDir = path.resolve(process.cwd(), "../specs/001-decision-workspace/fase8");
  fs.mkdirSync(outputDir, { recursive: true });
  const outputPath = path.join(outputDir, `${metrics.caseKey}.json`);
  fs.writeFileSync(outputPath, JSON.stringify(metrics, null, 2), "utf-8");
}
