import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { App } from "../../src/app/App";
import { clearAiQuestionSessionsForTests } from "../../src/providers/storage/aiSessionStorage";
import { clearCanvasForTests } from "../../src/providers/storage/canvasStorage";
import { clearDecisionCasesForTests } from "../../src/providers/storage/casesStorage";
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

async function acceptDynamicsContextAndExposure() {
  fireEvent.click(screen.getByRole("button", { name: "Analizar relato" }));
  await waitFor(() => expect(screen.getAllByRole("button", { name: "Aceptar" })).toHaveLength(3));

  const contextCard = screen.getByText("El contrato con el proveedor venció el 31/10/2026.").closest("article");
  const exposureCard = screen.getByText("Actualmente no pueden iniciarse nuevos proyectos ni tareas.").closest("article");

  if (!contextCard || !exposureCard) {
    throw new Error("expected dynamics suggestion cards were not found");
  }

  fireEvent.click(within(contextCard).getByRole("button", { name: "Aceptar" }));
  fireEvent.click(within(exposureCard).getByRole("button", { name: "Aceptar" }));
}

describe.sequential("Slice6 contextual assistance", () => {
  beforeEach(() => {
    cleanup();
    clearWorkspaceStorage();
    clearDecisionCasesForTests();
    clearCanvasForTests();
    clearAiQuestionSessionsForTests();
  });

  it("shows Obtener siguiente pregunta in DRAFT/IN_ANALYSIS", () => {
    openCaseDetail();
    expect(screen.getByRole("button", { name: "Obtener siguiente pregunta" })).toBeInTheDocument();
  });

  it("does not show contextual assistance in CRITICAL_REVIEW", () => {
    openCaseDetail();

    const requiredIndexes = [0, 1, 2, 3, 4, 7];

    for (const index of requiredIndexes) {
      fireEvent.click(screen.getAllByRole("button", { name: "+ Agregar" })[index]);
      fireEvent.change(screen.getByLabelText("Contenido"), { target: { value: `contenido ${index}` } });
      fireEvent.click(screen.getByRole("button", { name: "Agregar" }));
    }

    fireEvent.click(screen.getByRole("button", { name: "Iniciar revisión" }));

    expect(screen.queryByRole("button", { name: "Obtener siguiente pregunta" })).not.toBeInTheDocument();
  });

  it("shows one question with dimension and reason and response field", async () => {
    openCaseDetail();
    await acceptDynamicsContextAndExposure();

    fireEvent.click(screen.getByRole("button", { name: "Obtener siguiente pregunta" }));

    await waitFor(() => expect(screen.getByText("Pregunta activa")).toBeInTheDocument());
    expect(screen.getByText("Dimensión:")).toBeInTheDocument();
    expect(screen.getByText("Por qué importa:")).toBeInTheDocument();
    expect(screen.getByLabelText("Respuesta")).toBeInTheDocument();
  });

  it("normal answer creates visible canvas item", async () => {
    openCaseDetail();
    await acceptDynamicsContextAndExposure();

    fireEvent.click(screen.getByRole("button", { name: "Obtener siguiente pregunta" }));
    await waitFor(() => expect(screen.getByLabelText("Respuesta")).toBeInTheDocument());

    fireEvent.change(screen.getByLabelText("Respuesta"), {
      target: {
        value: "Nuevas necesidades de mantenimiento correctivo y evolutivo podrían quedar sin capacidad externa."
      }
    });
    fireEvent.click(screen.getByRole("button", { name: "Agregar respuesta al Canvas" }));

    await waitFor(() => {
      expect(screen.getByText("Nuevas necesidades de mantenimiento correctivo y evolutivo podrían quedar sin capacidad externa.")).toBeInTheDocument();
    });

    expect(screen.getByRole("button", { name: "Siguiente pregunta" })).toBeInTheDocument();
  });

  it("dont know creates uncertainty missing information and not target coverage", async () => {
    openCaseDetail();
    await acceptDynamicsContextAndExposure();

    fireEvent.click(screen.getByRole("button", { name: "Obtener siguiente pregunta" }));
    await waitFor(() => expect(screen.getByLabelText("Respuesta")).toBeInTheDocument());

    fireEvent.change(screen.getByLabelText("Respuesta"), {
      target: {
        value: "Nuevas necesidades de mantenimiento correctivo y evolutivo podrían quedar sin capacidad externa."
      }
    });
    fireEvent.click(screen.getByRole("button", { name: "Agregar respuesta al Canvas" }));

    await waitFor(() => expect(screen.getByRole("button", { name: "Siguiente pregunta" })).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: "Siguiente pregunta" }));
    await waitFor(() => expect(screen.getByText(/Qué información respalda actualmente/)).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: "No lo sé" }));

    await waitFor(() => {
      expect(screen.getByText("No contamos con información suficiente que respalde la necesidad de continuidad del proveedor para atender esas soluciones.")).toBeInTheDocument();
    });

    expect(screen.getByText("4 de 6 dimensiones mínimas cubiertas.")).toBeInTheDocument();
  });

  it("skip does not create card", async () => {
    openCaseDetail();
    await acceptDynamicsContextAndExposure();

    fireEvent.click(screen.getByRole("button", { name: "Obtener siguiente pregunta" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Omitir por ahora" })).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: "Omitir por ahora" }));

    expect(screen.queryByText("Nuevas necesidades de mantenimiento correctivo y evolutivo podrían quedar sin capacidad externa.")).not.toBeInTheDocument();
  });

  it("active question prevents creating another", async () => {
    openCaseDetail();
    await acceptDynamicsContextAndExposure();

    fireEvent.click(screen.getByRole("button", { name: "Obtener siguiente pregunta" }));
    await waitFor(() => expect(screen.getByText("Pregunta activa")).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: "Obtener siguiente pregunta" }));
    expect(screen.getByText("Ya existe una pregunta activa.")).toBeInTheDocument();
  });

  it("reload keeps question state and response history", async () => {
    openCaseDetail();
    await acceptDynamicsContextAndExposure();

    fireEvent.click(screen.getByRole("button", { name: "Obtener siguiente pregunta" }));
    await waitFor(() => expect(screen.getByLabelText("Respuesta")).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText("Respuesta"), {
      target: {
        value: "Nuevas necesidades de mantenimiento correctivo y evolutivo podrían quedar sin capacidad externa."
      }
    });
    fireEvent.click(screen.getByRole("button", { name: "Agregar respuesta al Canvas" }));

    await waitFor(() => expect(screen.getByRole("button", { name: "Siguiente pregunta" })).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: "Siguiente pregunta" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "No lo sé" })).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: "No lo sé" }));

    fireEvent.click(screen.getByRole("button", { name: "Volver al Inbox" }));
    fireEvent.click(screen.getAllByRole("button", { name: "Abrir" })[0]);

    expect(screen.getByText("No contamos con información suficiente que respalde la necesidad de continuidad del proveedor para atender esas soluciones.")).toBeInTheDocument();
  });

  it("no chatbot UI appears", () => {
    openCaseDetail();

    expect(screen.queryByText(/Hola, soy tu asistente/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("textbox", { name: /chat/i })).not.toBeInTheDocument();
  });
});
