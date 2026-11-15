import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { App } from "../../src/app/App";
import { clearAiQuestionSessionsForTests } from "../../src/providers/storage/aiSessionStorage";
import { clearCanvasForTests } from "../../src/providers/storage/canvasStorage";
import { clearDecisionCasesForTests } from "../../src/providers/storage/casesStorage";
import { clearCriticalReviewsForTests } from "../../src/providers/storage/criticalReviewStorage";
import { clearWorkspaceStorage } from "../setup/test-helpers";

const NARRATIVE =
  "El contrato con el proveedor venció el 31/10/2026. Actualmente continúa trabajando hasta finalizar el proyecto en curso, pero no podemos iniciar nuevos proyectos ni tareas.";

function openCaseDetail(title = `Caso ${Date.now()}`) {
  render(<App />);
  fireEvent.click(screen.getByRole("button", { name: "Nuevo caso" }));
  fireEvent.change(screen.getByLabelText("Título"), { target: { value: title } });
  fireEvent.change(screen.getByLabelText("¿Qué está pasando?"), { target: { value: NARRATIVE } });
  fireEvent.click(screen.getByRole("button", { name: "Crear caso" }));
  fireEvent.click(screen.getAllByRole("button", { name: "Abrir" })[0]);
}

function addByDimension(index: number, content: string, epistemicType = "FACT") {
  fireEvent.click(screen.getAllByRole("button", { name: "+ Agregar" })[index]);
  const contentBoxes = screen.getAllByLabelText("Contenido");
  fireEvent.change(contentBoxes[contentBoxes.length - 1], { target: { value: content } });

  const typeSelectors = screen.getAllByLabelText("Tipo epistemológico");
  fireEvent.change(typeSelectors[typeSelectors.length - 1], { target: { value: epistemicType } });

  fireEvent.click(screen.getAllByRole("button", { name: "Agregar" }).at(-1)!);
}

async function addCoverageSixAndMoveToCriticalReview() {
  addByDimension(0, "El contrato con el proveedor venció el 31/10/2026.", "FACT");
  addByDimension(0, "El proveedor continúa trabajando hasta finalizar el proyecto actualmente en curso.", "FACT");
  addByDimension(1, "Actualmente no pueden iniciarse nuevos proyectos ni tareas.", "FACT");
  addByDimension(2, "Existe respaldo documental interno sobre necesidad de continuidad.", "FACT");
  addByDimension(3, "200 usuarios quedarán sin servicio.", "FACT");
  addByDimension(4, "No conocemos el plazo definitivo de contratación.", "MISSING_INFORMATION");
  addByDimension(6, "Una prórroga contractual podría ser una alternativa.", "ASSUMPTION");
  addByDimension(7, "Que mi jefe vea el tema.", "HUMAN_EVALUATION");

  await waitFor(() => expect(screen.getByText("6 de 6 dimensiones mínimas cubiertas.")).toBeInTheDocument());
  await waitFor(() => expect(screen.getByRole("button", { name: "Iniciar revisión" })).toBeInTheDocument());

  fireEvent.click(screen.getByRole("button", { name: "Iniciar revisión" }));

  await waitFor(() => expect(screen.getByText("Revisión crítica pendiente.")).toBeInTheDocument());
  await waitFor(() => expect(screen.getByText("REVISIÓN CRÍTICA")).toBeInTheDocument());
}

describe.sequential("Slice7 critical review", () => {
  beforeEach(() => {
    cleanup();
    clearWorkspaceStorage();
    clearDecisionCasesForTests();
    clearCanvasForTests();
    clearAiQuestionSessionsForTests();
    clearCriticalReviewsForTests();
  });

  it("shows review panel only in CRITICAL_REVIEW", async () => {
    openCaseDetail();
    expect(screen.queryByText("REVISIÓN CRÍTICA")).not.toBeInTheDocument();

    await addCoverageSixAndMoveToCriticalReview();
    expect(screen.getByText("REVISIÓN CRÍTICA")).toBeInTheDocument();
  });

  it("executes review and displays blockers/warnings with summary", async () => {
    openCaseDetail();
    await addCoverageSixAndMoveToCriticalReview();

    fireEvent.click(screen.getByRole("button", { name: "Ejecutar revisión crítica" }));

    await waitFor(() => expect(screen.getByText("Revisión crítica generada.")).toBeInTheDocument());
    expect(screen.getAllByText("BLOQUEO CRÍTICO").length).toBeGreaterThan(0);
    expect(screen.getAllByText("ADVERTENCIA").length).toBeGreaterThan(0);
    expect(screen.getByText("2 bloqueos abiertos")).toBeInTheDocument();
    expect(screen.getByText("2 advertencias abiertas")).toBeInTheDocument();
  });

  it("editing does not auto resolve and manual mark resolves by edit", async () => {
    openCaseDetail();
    await addCoverageSixAndMoveToCriticalReview();
    fireEvent.click(screen.getByRole("button", { name: "Ejecutar revisión crítica" }));

    await waitFor(() => expect(screen.getAllByText("Estado:").length).toBeGreaterThan(0));

    const cards = screen.getAllByRole("article");
    const unsupportedCard = cards.find((card) => within(card).queryByText("Impacto cuantitativo sin sustento suficiente"));
    expect(unsupportedCard).toBeTruthy();

    fireEvent.click(within(unsupportedCard!).getByRole("button", { name: "Editar item" }));
    expect(within(unsupportedCard!).getByText("Estado:")).toBeInTheDocument();
    expect(within(unsupportedCard!).getByText("Abierto")).toBeInTheDocument();

    fireEvent.click(within(unsupportedCard!).getByRole("button", { name: "Marcar como resuelto por edición" }));

    await waitFor(() => expect(within(unsupportedCard!).getByText("Resuelto por edición")).toBeInTheDocument());
  });

  it("clarify requires text and persists resolution", async () => {
    openCaseDetail();
    await addCoverageSixAndMoveToCriticalReview();
    fireEvent.click(screen.getByRole("button", { name: "Ejecutar revisión crítica" }));

    await waitFor(() => expect(screen.getByText("Vencimiento y continuidad requieren aclaración")).toBeInTheDocument());
    const contradictionCard = screen
      .getAllByRole("article")
      .find((card) => within(card).queryByText("Vencimiento y continuidad requieren aclaración"));

    expect(contradictionCard).toBeTruthy();
    fireEvent.click(within(contradictionCard!).getByRole("button", { name: "Aclarar" }));
    expect(screen.getByText("La aclaración es obligatoria.")).toBeInTheDocument();

    fireEvent.change(within(contradictionCard!).getByLabelText("Aclaración"), {
      target: {
        value:
          "El contrato venció formalmente, pero existe una continuidad transitoria autorizada únicamente para finalizar el proyecto en curso."
      }
    });
    fireEvent.click(within(contradictionCard!).getByRole("button", { name: "Aclarar" }));

    await waitFor(() => expect(within(contradictionCard!).getByText("Resuelto por aclaración")).toBeInTheDocument());
  });

  it("dismiss requires reason and persists reason", async () => {
    openCaseDetail();
    await addCoverageSixAndMoveToCriticalReview();
    fireEvent.click(screen.getByRole("button", { name: "Ejecutar revisión crítica" }));

    await waitFor(() => expect(screen.getByText("Alternativa todavía no confirmada")).toBeInTheDocument());
    const warningCard = screen
      .getAllByRole("article")
      .find((card) => within(card).queryByText("Alternativa todavía no confirmada"));

    expect(warningCard).toBeTruthy();

    fireEvent.click(within(warningCard!).getByRole("button", { name: "Descartar hallazgo" }));
    expect(screen.getByText("La razón de descarte es obligatoria.")).toBeInTheDocument();

    fireEvent.change(within(warningCard!).getByLabelText("Razón de descarte"), {
      target: { value: "La advertencia no aplica en este entorno de prueba." }
    });
    fireEvent.click(within(warningCard!).getByRole("button", { name: "Descartar hallazgo" }));

    await waitFor(() => expect(within(warningCard!).getByText("Descartado por la persona usuaria")).toBeInTheDocument());
  });

  it("blocks completion with open blocker and enables completion after resolutions", async () => {
    openCaseDetail();
    await addCoverageSixAndMoveToCriticalReview();
    fireEvent.click(screen.getByRole("button", { name: "Ejecutar revisión crítica" }));

    await waitFor(() => expect(screen.getByText("No podés completar la revisión mientras existan bloqueos críticos abiertos.")).toBeInTheDocument());

    const cards = screen.getAllByRole("article");
    const unsupportedCard = cards.find((card) => within(card).queryByText("Impacto cuantitativo sin sustento suficiente"));
    const interventionCard = cards.find((card) => within(card).queryByText("Intervención requerida poco accionable"));

    fireEvent.click(within(unsupportedCard!).getByRole("button", { name: "Editar item" }));
    fireEvent.click(within(unsupportedCard!).getByRole("button", { name: "Marcar como resuelto por edición" }));

    fireEvent.click(within(interventionCard!).getByRole("button", { name: "Editar item" }));
    fireEvent.click(within(interventionCard!).getByRole("button", { name: "Marcar como resuelto por edición" }));

    await waitFor(() => expect(screen.getByText("Los bloqueos críticos están resueltos. Podés completar la revisión.")).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: "Completar revisión" }));
    await waitFor(() =>
      expect(screen.getAllByText("Revisión completada. El caso puede avanzar a evaluación humana.").length).toBeGreaterThan(0)
    );
  });
});
