import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "../../src/app/App";
import { clearWorkspaceStorage } from "../setup/test-helpers";

describe("InboxPage", () => {
  beforeEach(() => {
    clearWorkspaceStorage();
  });

  it("shows empty inbox", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: "Decision Workspace" })).toBeInTheDocument();
    expect(screen.getByText("No hay casos cargados.")).toBeInTheDocument();
  });

  it("shows inbox with case", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "Nuevo caso" }));
    fireEvent.change(screen.getByLabelText("Título"), { target: { value: "Contrato Dynamics 365" } });
    fireEvent.change(screen.getByLabelText("¿Qué está pasando?"), {
      target: {
        value:
          "El contrato con el proveedor venció el 31/10/2026. Actualmente continúa trabajando hasta finalizar el proyecto en curso, pero no podemos iniciar nuevos proyectos ni tareas."
      }
    });
    fireEvent.click(screen.getByRole("button", { name: "Crear caso" }));

    expect(screen.getByText("Contrato Dynamics 365")).toBeInTheDocument();
    expect(screen.getByText("Borrador")).toBeInTheDocument();
  });

  it("validates form", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "Nuevo caso" }));
    fireEvent.click(screen.getByRole("button", { name: "Crear caso" }));

    expect(screen.getByText("Título es obligatorio")).toBeInTheDocument();
    expect(screen.getByText("¿Qué está pasando? es obligatorio")).toBeInTheDocument();
  });

  it("creates case and opens detail", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "Nuevo caso" }));
    fireEvent.change(screen.getByLabelText("Título"), { target: { value: "Contrato Dynamics 365" } });
    fireEvent.change(screen.getByLabelText("¿Qué está pasando?"), {
      target: {
        value:
          "El contrato con el proveedor venció el 31/10/2026. Actualmente continúa trabajando hasta finalizar el proyecto en curso, pero no podemos iniciar nuevos proyectos ni tareas."
      }
    });
    fireEvent.click(screen.getByRole("button", { name: "Crear caso" }));

    fireEvent.click(screen.getByRole("button", { name: "Abrir" }));

    expect(screen.getByText("Detalle de caso")).toBeInTheDocument();
    expect(screen.getByText("Contrato Dynamics 365")).toBeInTheDocument();
    expect(
      screen.getByText(
        "El contrato con el proveedor venció el 31/10/2026. Actualmente continúa trabajando hasta finalizar el proyecto en curso, pero no podemos iniciar nuevos proyectos ni tareas."
      )
    ).toBeInTheDocument();
  });

  it("deletes case from inbox", () => {
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);

    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "Nuevo caso" }));
    fireEvent.change(screen.getByLabelText("Título"), { target: { value: "Contrato Dynamics 365" } });
    fireEvent.change(screen.getByLabelText("¿Qué está pasando?"), {
      target: {
        value:
          "El contrato con el proveedor venció el 31/10/2026. Actualmente continúa trabajando hasta finalizar el proyecto en curso, pero no podemos iniciar nuevos proyectos ni tareas."
      }
    });
    fireEvent.click(screen.getByRole("button", { name: "Crear caso" }));

    fireEvent.click(screen.getByRole("button", { name: "Eliminar" }));

    expect(confirmSpy).toHaveBeenCalledWith('¿Eliminar el caso "Contrato Dynamics 365"?');
    expect(screen.queryByText("Contrato Dynamics 365")).not.toBeInTheDocument();
    expect(screen.getByText("No hay casos cargados.")).toBeInTheDocument();

    confirmSpy.mockRestore();
  });
});
