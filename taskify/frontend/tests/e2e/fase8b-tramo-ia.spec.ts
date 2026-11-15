import { expect, test, type Page } from "@playwright/test";
import {
  type Fase8bCaseMetrics,
  contarDatosFaltantes,
  coberturaNumerica,
  crearCasoVacio,
  guardarResultadoFase8b,
  obtenerCoberturaActual,
  obtenerContadoresIA,
  obtenerEstadoCanvas,
  obtenerSesionPreguntas,
  validarSinInvenciones
} from "./fase8b-utils";

type CaseDefinition = {
  nombre: "dynamics" | "sharepoint" | "produccion";
  titulo: string;
  relato: string;
  requiereNoLoSe: boolean;
};

const DYNAMICS: CaseDefinition = {
  nombre: "dynamics",
  titulo: "Fase8B Dynamics",
  relato:
    "El contrato con el proveedor de Dynamics 365 venció el 31/10/2026. Actualmente el proveedor continúa trabajando únicamente hasta finalizar el proyecto en curso, pero no podemos iniciar nuevos proyectos ni tareas. El proceso de Compras puede demorar aproximadamente entre 1 y 6 meses. La situación podría afectar la capacidad futura para atender mantenimiento correctivo y evolutivo de distintas soluciones.",
  requiereNoLoSe: false
};

const SHAREPOINT: CaseDefinition = {
  nombre: "sharepoint",
  titulo: "Fase8B SharePoint Nintex",
  relato:
    "Microsoft informó que en julio de 2026 dejaría de dar soporte a los workflows de SharePoint sobre los que tenemos montadas distintas soluciones que utilizan Nintex Workflow. En 2023 advertimos esta situación y comenzamos una modernización de las soluciones, primero hacia SharePoint Subscription Edition y luego hacia SharePoint Online, porque inicialmente no estaba claro cuál sería el destino tecnológico definitivo. El proyecto de migración hacia SharePoint Subscription Edition se demoró y actualmente todavía existen soluciones en SharePoint 2016 sobre un motor de workflow sin soporte. Sabemos que estamos expuestos, pero no resulta sencillo dimensionar el impacto si alguno de esos workflows deja de funcionar.",
  requiereNoLoSe: true
};

const PRODUCCION: CaseDefinition = {
  nombre: "produccion",
  titulo: "Fase8B Producción",
  relato:
    "Para producir un bien necesitamos comprometer una fecha de entrega. En la fabricación intervienen distintas áreas y actualmente no conocemos con suficiente precisión la probabilidad de cumplimiento de esa fecha. Como consecuencia, las fechas comprometidas se incumplen con frecuencia. Queremos poder comunicar un intervalo de fecha de entrega acompañado por un nivel de confianza defendible, pero resulta difícil dimensionarlo.",
  requiereNoLoSe: true
};

async function leerEstadoCaso(page: Page): Promise<string> {
  return page.evaluate(() => {
    const cases = JSON.parse(localStorage.getItem("dw.cases") ?? "[]") as Array<{ status: string }>;
    return cases[0]?.status ?? "UNKNOWN";
  });
}

async function clickSiguientePregunta(page: Page): Promise<boolean> {
  const boton = page
    .getByRole("button", { name: "Obtener siguiente pregunta", exact: true })
    .or(page.getByRole("button", { name: "Siguiente pregunta", exact: true }));

  if ((await boton.count()) === 0) {
    return false;
  }

  await boton.first().click();
  return true;
}

async function responderPregunta(page: Page, caso: CaseDefinition, yaUsoNoLoSe: boolean): Promise<{ usadaNoLoSe: boolean; detalle: string | null; detencion: boolean }> {
  const mensajesDetencion = [
    "investigación o consulta externa",
    "No se identificó otra pregunta material",
    "Ya existe cobertura mínima"
  ];

  for (const mensaje of mensajesDetencion) {
    if ((await page.getByText(mensaje).count()) > 0) {
      return { usadaNoLoSe: false, detalle: null, detencion: true };
    }
  }

  const candidatos = [
    "¿Qué sistemas, procesos, proyectos, áreas, personas o resultados podrían verse afectados?",
    "¿Qué trabajos concretos quedarían sin capacidad de ejecución si finaliza el proyecto actual?",
    "¿Qué información respalda actualmente que la continuidad del proveedor es necesaria para atender esas soluciones?",
    "¿Qué información relevante todavía no conocés para evaluar este riesgo?",
    "¿Qué necesitás concretamente que tu superior comprenda, consulte, priorice, autorice, decida o escale?",
    "¿Qué soluciones continúan dependiendo de workflows de SharePoint con Nintex?",
    "¿Qué procesos de negocio podrían interrumpirse si un workflow deja de funcionar?",
    "¿Qué evidencia disponible respalda el estado actual de migración y las dependencias remanentes?",
    "¿Qué información clave todavía falta para estimar la exposición de continuidad?",
    "¿Qué intervención concreta necesitás del nivel superior para reducir este riesgo?",
    "¿Qué compromisos o áreas quedan más expuestos cuando se incumple una fecha comprometida?",
    "¿Qué consecuencias operativas concretas se observan cuando no se cumple la fecha comprometida?",
    "¿Qué información histórica o registros internos hoy existen sobre cumplimiento de fechas?",
    "¿Qué datos cuantitativos faltan para estimar un nivel de confianza de entrega?",
    "¿Qué decisión o priorización necesitás del nivel superior para encarar este análisis de cumplimiento?"
  ];

  let preguntaDetectada: string | null = null;
  for (const candidato of candidatos) {
    if ((await page.getByText(candidato).count()) > 0) {
      preguntaDetectada = candidato;
      break;
    }
  }

  if (!preguntaDetectada) {
    return { usadaNoLoSe: false, detalle: null, detencion: false };
  }

  const convieneNoLoSe =
    caso.requiereNoLoSe &&
    !yaUsoNoLoSe &&
    /evidencia|información histórica|datos cuantitativos|soluciones continúan/i.test(preguntaDetectada);

  if (convieneNoLoSe && (await page.getByRole("button", { name: "No lo sé" }).count()) > 0) {
    await page.getByRole("button", { name: "No lo sé" }).click();
    return { usadaNoLoSe: true, detalle: preguntaDetectada, detencion: false };
  }

  if ((await page.getByLabel("Respuesta").count()) > 0) {
    const respuesta = /datos cuantitativos/i.test(preguntaDetectada)
      ? "Se requiere análisis cuantitativo externo para estimar confianza defendible."
      : "Respuesta registrada por el usuario para completar la dimensión faltante del análisis.";
    await page.getByLabel("Respuesta").fill(respuesta);
    await page.getByRole("button", { name: "Agregar respuesta al Canvas" }).click();
    return { usadaNoLoSe: false, detalle: preguntaDetectada, detencion: false };
  }

  return { usadaNoLoSe: false, detalle: preguntaDetectada, detencion: false };
}

async function ejecutarTramoAumentado(page: Page, caso: CaseDefinition): Promise<Fase8bCaseMetrics> {
  await crearCasoVacio(page, caso.titulo, caso.relato);

  const canvasInicial = await obtenerEstadoCanvas(page);
  expect(canvasInicial.length).toBe(0);

  const coberturaInicial = await obtenerCoberturaActual(page);
  expect(coberturaInicial).toBe("0/6");

  await page.evaluate(() => {
    localStorage.setItem(
      "dw.ai.observation",
      JSON.stringify({
        analyzeNarrative: 0,
        suggestNextQuestion: 0,
        reviewCase: 0,
        generateBrief: 0
      })
    );
  });

  await page.getByRole("button", { name: "Analizar relato" }).click();

  const canvasConSugerencias = await obtenerEstadoCanvas(page);
  const sugerenciasPendientes = canvasConSugerencias.filter((item) => item.validationStatus === "PENDING");
  expect(sugerenciasPendientes.length).toBeGreaterThan(0);

  const detalleSugerencias = sugerenciasPendientes.map((item) => ({
    dimension: item.dimension,
    tipoEpistemologico: item.epistemicType,
    contenido: item.content
  }));

  let aceptadas = 0;
  let editadas = 0;
  let rechazadas = 0;

  if (sugerenciasPendientes[0]) {
    await page.locator("article", { hasText: sugerenciasPendientes[0].content }).getByRole("button", { name: "Aceptar" }).click();
    aceptadas += 1;
  }

  if (sugerenciasPendientes[1]) {
    const articulo = page.locator("article", { hasText: sugerenciasPendientes[1].content });
    await articulo.getByRole("button", { name: "Editar" }).click();
    await page.getByLabel("Editar sugerencia").fill(`${sugerenciasPendientes[1].content} (aclarado por el usuario)`);
    await page.getByRole("button", { name: "Guardar edición" }).click();
    editadas += 1;
  }

  if (sugerenciasPendientes[2]) {
    await page.locator("article", { hasText: sugerenciasPendientes[2].content }).getByRole("button", { name: "Rechazar" }).click();
    rechazadas += 1;
  }

  const coberturaDespuesSugerencias = await obtenerCoberturaActual(page);
  expect(coberturaNumerica(coberturaDespuesSugerencias)).toBeGreaterThan(0);
  expect(coberturaNumerica(coberturaDespuesSugerencias)).toBeLessThan(6);

  const preguntasDetalle: string[] = [];
  let respuestasNormales = 0;
  let noLoSe = 0;
  let detenciones = 0;
  let usoNoLoSe = false;

  for (let i = 0; i < 10; i += 1) {
    const cobertura = await obtenerCoberturaActual(page);
    if (cobertura === "6/6") {
      break;
    }

    const pudoPedir = await clickSiguientePregunta(page);
    if (!pudoPedir) {
      break;
    }

    const respuesta = await responderPregunta(page, caso, usoNoLoSe);

    if (respuesta.detalle) {
      preguntasDetalle.push(respuesta.detalle);
    }

    if (respuesta.detencion) {
      detenciones += 1;
      break;
    }

    if (respuesta.usadaNoLoSe) {
      noLoSe += 1;
      usoNoLoSe = true;
    } else if (respuesta.detalle) {
      respuestasNormales += 1;
    }
  }

  const coberturaFinal = await obtenerCoberturaActual(page);
  const sesion = await obtenerSesionPreguntas(page);
  const canvasFinal = await obtenerEstadoCanvas(page);

  expect(sesion.questionCount).toBeGreaterThan(0);

  if (caso.requiereNoLoSe) {
    expect(noLoSe + detenciones).toBeGreaterThan(0);
  }

  const estadoCaso = await leerEstadoCaso(page);
  expect(estadoCaso === "DRAFT" || estadoCaso === "IN_ANALYSIS").toBe(true);

  const invenciones = validarSinInvenciones(canvasFinal);

  const metricas: Fase8bCaseMetrics = {
    caso: caso.nombre,
    relato: caso.relato,
    sugerencias: {
      totales: sugerenciasPendientes.length,
      aceptadas,
      editadas,
      rechazadas,
      detalle: detalleSugerencias
    },
    coberturaInicial,
    coberturaDespuesSugerencias,
    preguntas: {
      totales: sesion.questionCount,
      respuestasNormales,
      noLoSe,
      omitidas: 0,
      detenciones,
      detalle: preguntasDetalle
    },
    coberturaFinal,
    datosFaltantesDescubiertos: contarDatosFaltantes(canvasFinal),
    guardrails: {
      hechosInventados: 0,
      cifrasInventadas: invenciones.cifras,
      fechasInventadas: invenciones.fechas,
      fuentesInventadas: invenciones.fuentes
    },
    sinTransicionAutomatica: estadoCaso !== "CRITICAL_REVIEW" && estadoCaso !== "HUMAN_EVALUATION" && estadoCaso !== "BRIEF_DRAFT" && estadoCaso !== "READY_TO_ESCALATE"
  };

  const contadores = await obtenerContadoresIA(page);
  expect(contadores.analyzeNarrative).toBeGreaterThan(0);
  expect(contadores.suggestNextQuestion).toBeGreaterThan(0);

  return metricas;
}

test("fase8b dynamics tramo aumentado con IA", async ({ page }) => {
  const metricas = await ejecutarTramoAumentado(page, DYNAMICS);
  guardarResultadoFase8b("dynamics.json", metricas);

  expect(metricas.sugerencias.totales).toBeGreaterThan(0);
  expect(metricas.preguntas.totales).toBeGreaterThan(0);
});

test("fase8b sharepoint tramo aumentado con IA", async ({ page }) => {
  const metricas = await ejecutarTramoAumentado(page, SHAREPOINT);
  guardarResultadoFase8b("sharepoint.json", metricas);

  expect(metricas.sugerencias.totales).toBeGreaterThan(0);
  expect(metricas.preguntas.totales).toBeGreaterThan(0);
});

test("fase8b produccion tramo aumentado con IA", async ({ page }) => {
  const metricas = await ejecutarTramoAumentado(page, PRODUCCION);
  guardarResultadoFase8b("produccion.json", metricas);

  expect(metricas.sugerencias.totales).toBeGreaterThan(0);
  expect(metricas.preguntas.totales).toBeGreaterThan(0);
});
