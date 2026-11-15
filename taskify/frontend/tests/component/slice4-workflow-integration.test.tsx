import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { App } from "../../src/app/App";
import { clearCanvasForTests } from "../../src/providers/storage/canvasStorage";
import { clearDecisionCasesForTests } from "../../src/providers/storage/casesStorage";
import { clearWorkspaceStorage } from "../setup/test-helpers";

const TITLE = "Contrato Dynamics 365";
const NARRATIVE =
  "El contrato con el proveedor venció el 31/10/2026. Actualmente continúa trabajando hasta finalizar el proyecto en curso, pero no podemos iniciar nuevos proyectos ni tareas.";

function openCaseDetail() {
  render(<App />);

  fireEvent.click(screen.getByRole("button", { name: "Nuevo caso" }));
  fireEvent.change(screen.getByLabelText("Título"), { target: { value: TITLE } });
  fireEvent.change(screen.getByLabelText("¿Qué está pasando?"), { target: { value: NARRATIVE } });
  fireEvent.click(screen.getByRole("button", { name: "Crear caso" }));
  fireEvent.click(screen.getByRole("button", { name: "Abrir" }));
}

function addByDimension(index: number, content: string, epistemicType?: string) {
  fireEvent.click(screen.getAllByRole("button", { name: "+ Agregar" })[index]);

  const contentInputs = screen.getAllByLabelText("Contenido");
  fireEvent.change(contentInputs[contentInputs.length - 1], {
    target: { value: content }
  });

  if (epistemicType) {
    const selectors = screen.getAllByLabelText("Tipo epistemológico");
    fireEvent.change(selectors[selectors.length - 1], { target: { value: epistemicType } });
  }

  const addButtons = screen.getAllByRole("button", { name: "Agregar" });
  fireEvent.click(addButtons[addButtons.length - 1]);
}

function addCoverageSixOfSix() {
  addByDimension(0, "El contrato con el proveedor venció el 31/10/2026.");
  addByDimension(1, "Actualmente no pueden iniciarse nuevos proyectos ni tareas.");
  addByDimension(
    2,
    "El proceso de Compras puede demorar aproximadamente entre 1 y 6 meses según conocimiento aportado por el usuario."
  );
  addByDimension(3, "Nuevas necesidades sobre las soluciones podrían quedar sin capacidad de atención externa.", "INFERENCE");
  addByDimension(4, "No conocemos cuándo termina exactamente el proyecto actual.", "MISSING_INFORMATION");
  addByDimension(
    7,
    "Necesito que mi superior consulte con Compras qué alternativas contractuales son viables y cuáles son sus plazos.",
    "HUMAN_EVALUATION"
  );
}

describe("Slice4 workflow integration", () => {
  beforeEach(() => {
    clearWorkspaceStorage();
    clearDecisionCasesForTests();
    clearCanvasForTests();
  });

  it("coverage incomplete does not show Iniciar revisión", () => {
    openCaseDetail();

    addByDimension(0, "El contrato con el proveedor venció el 31/10/2026.");

    expect(screen.getByText("Faltan dimensiones para cobertura mínima.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Iniciar revisión" })).not.toBeInTheDocument();
  });

  it("coverage 6/6 shows single minimum coverage message and Iniciar revisión", () => {
    openCaseDetail();
    addCoverageSixOfSix();

    expect(screen.getAllByText("Cobertura mínima alcanzada.")).toHaveLength(1);
    expect(screen.getByRole("button", { name: "Iniciar revisión" })).toBeInTheDocument();
  });

  it("click transitions to CRITICAL_REVIEW and shows pending", () => {
    openCaseDetail();
    addCoverageSixOfSix();

    fireEvent.click(screen.getByRole("button", { name: "Iniciar revisión" }));

    expect(screen.getByText("Revisión crítica pendiente.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Iniciar revisión" })).not.toBeInTheDocument();
  });
});
