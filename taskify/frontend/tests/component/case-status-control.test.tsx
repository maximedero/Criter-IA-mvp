import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { CanvasItem } from "../../src/domain/models/CanvasItem";
import { CaseStatusControl } from "../../src/features/inbox/CaseStatusControl";

function item(partial: Partial<CanvasItem>): CanvasItem {
  return {
    id: partial.id ?? "item",
    caseId: partial.caseId ?? "case",
    dimension: partial.dimension ?? "CONTEXT",
    content: partial.content ?? "contenido",
    epistemicType: partial.epistemicType ?? "FACT",
    origin: partial.origin ?? "USER",
    validationStatus: partial.validationStatus ?? "VALIDATED",
    createdAt: partial.createdAt ?? new Date().toISOString(),
    updatedAt: partial.updatedAt ?? new Date().toISOString()
  };
}

describe("CaseStatusControl", () => {
  it("shows visible status", () => {
    render(<CaseStatusControl status="DRAFT" items={[]} onStatusChange={vi.fn()} />);

    expect(screen.getByText("Estado:")).toBeInTheDocument();
    expect(screen.getByText("Borrador")).toBeInTheDocument();
  });

  it("IN_ANALYSIS with incomplete coverage does not show Iniciar revisión", () => {
    render(
      <CaseStatusControl
        status="IN_ANALYSIS"
        items={[item({ dimension: "CONTEXT", validationStatus: "VALIDATED" })]}
        onStatusChange={vi.fn()}
      />
    );

    expect(screen.queryByRole("button", { name: "Iniciar revisión" })).not.toBeInTheDocument();
    expect(screen.getByText("Faltan dimensiones para cobertura mínima.")).toBeInTheDocument();
  });

  it("IN_ANALYSIS with 6/6 shows Iniciar revisión", () => {
    render(
      <CaseStatusControl
        status="IN_ANALYSIS"
        items={[
          item({ id: "1", dimension: "CONTEXT", validationStatus: "VALIDATED" }),
          item({ id: "2", dimension: "EXPOSURE", validationStatus: "VALIDATED" }),
          item({ id: "3", dimension: "IMPACT", validationStatus: "VALIDATED" }),
          item({ id: "4", dimension: "EVIDENCE", validationStatus: "VALIDATED" }),
          item({ id: "5", dimension: "UNCERTAINTY", validationStatus: "VALIDATED" }),
          item({ id: "6", dimension: "INTERVENTION", validationStatus: "VALIDATED" })
        ]}
        onStatusChange={vi.fn()}
      />
    );

    expect(screen.queryByText("Cobertura mínima alcanzada.")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Iniciar revisión" })).toBeInTheDocument();
  });

  it("click on Iniciar revisión moves to CRITICAL_REVIEW", () => {
    const onStatusChange = vi.fn();

    render(
      <CaseStatusControl
        status="IN_ANALYSIS"
        items={[
          item({ id: "1", dimension: "CONTEXT", validationStatus: "VALIDATED" }),
          item({ id: "2", dimension: "EXPOSURE", validationStatus: "VALIDATED" }),
          item({ id: "3", dimension: "IMPACT", validationStatus: "VALIDATED" }),
          item({ id: "4", dimension: "EVIDENCE", validationStatus: "VALIDATED" }),
          item({ id: "5", dimension: "UNCERTAINTY", validationStatus: "VALIDATED" }),
          item({ id: "6", dimension: "INTERVENTION", validationStatus: "VALIDATED" })
        ]}
        onStatusChange={onStatusChange}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Iniciar revisión" }));

    expect(onStatusChange).toHaveBeenCalledWith("CRITICAL_REVIEW");
  });

  it("CRITICAL_REVIEW shows pending message", () => {
    render(<CaseStatusControl status="CRITICAL_REVIEW" items={[]} onStatusChange={vi.fn()} />);

    expect(screen.getByText("Revisión crítica pendiente.")).toBeInTheDocument();
  });
});
