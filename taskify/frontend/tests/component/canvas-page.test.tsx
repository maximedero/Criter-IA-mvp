import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { App } from "../../src/app/App";
import { clearCanvasForTests } from "../../src/providers/storage/canvasStorage";
import { clearDecisionCasesForTests } from "../../src/providers/storage/casesStorage";
import { clearWorkspaceStorage } from "../setup/test-helpers";

const TITLE = "Contrato Dynamics 365";
const NARRATIVE =
  "El contrato con el proveedor venció el 31/10/2026. Actualmente continúa trabajando hasta finalizar el proyecto en curso, pero no podemos iniciar nuevos proyectos ni tareas.";

function openCaseDetailWithCanvas() {
  render(<App />);

  fireEvent.click(screen.getByRole("button", { name: "Nuevo caso" }));
  fireEvent.change(screen.getByLabelText("Título"), { target: { value: TITLE } });
  fireEvent.change(screen.getByLabelText("¿Qué está pasando?"), { target: { value: NARRATIVE } });
  fireEvent.click(screen.getByRole("button", { name: "Crear caso" }));
  fireEvent.click(screen.getByRole("button", { name: "Abrir" }));
}

describe("CanvasPage", () => {
  beforeEach(() => {
    clearWorkspaceStorage();
    clearDecisionCasesForTests();
    clearCanvasForTests();
  });

  it("renders eight dimensions", () => {
    openCaseDetailWithCanvas();

    expect(screen.getByRole("heading", { name: "Contexto y señal" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Exposición" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Evidencia" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Impactos posibles" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Incertidumbres y datos faltantes" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Escenarios" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Alternativas" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Intervención requerida" })).toBeInTheDocument();
  });

  it("adds canvas item", () => {
    openCaseDetailWithCanvas();

    fireEvent.click(screen.getAllByRole("button", { name: "+ Agregar" })[0]);
    fireEvent.change(screen.getByLabelText("Contenido"), {
      target: { value: "El contrato con el proveedor venció el 31/10/2026." }
    });
    fireEvent.click(screen.getByRole("button", { name: "Agregar" }));

    expect(screen.getByText("El contrato con el proveedor venció el 31/10/2026.")).toBeInTheDocument();
    expect(screen.getByText("Hecho")).toBeInTheDocument();
  });

  it("edits canvas item", () => {
    openCaseDetailWithCanvas();

    fireEvent.click(screen.getAllByRole("button", { name: "+ Agregar" })[0]);
    fireEvent.change(screen.getByLabelText("Contenido"), {
      target: { value: "No conocemos cuándo termina exactamente el proyecto actual." }
    });
    fireEvent.change(screen.getByLabelText("Tipo epistemológico"), {
      target: { value: "MISSING_INFORMATION" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Agregar" }));

    fireEvent.click(screen.getByRole("button", { name: "Editar" }));
    fireEvent.change(screen.getByLabelText("Contenido"), {
      target: { value: "No conocemos la fecha exacta de finalización del proyecto actual." }
    });
    fireEvent.click(screen.getByRole("button", { name: "Guardar" }));

    expect(screen.getByText("No conocemos la fecha exacta de finalización del proyecto actual.")).toBeInTheDocument();
  });

  it("deletes canvas item", () => {
    openCaseDetailWithCanvas();

    fireEvent.click(screen.getAllByRole("button", { name: "+ Agregar" })[0]);
    fireEvent.change(screen.getByLabelText("Contenido"), {
      target: { value: "Impacto temporal" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Agregar" }));

    fireEvent.click(screen.getByRole("button", { name: "Eliminar" }));

    expect(screen.queryByText("Impacto temporal")).not.toBeInTheDocument();
  });
});
