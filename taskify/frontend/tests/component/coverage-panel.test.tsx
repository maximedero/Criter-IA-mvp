import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { CanvasItem } from "../../src/domain/models/CanvasItem";
import { CoveragePanel } from "../../src/features/canvas/CoveragePanel";

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

describe("CoveragePanel", () => {
  it("shows 0/6 coverage", () => {
    render(<CoveragePanel items={[]} />);

    expect(screen.getByText("0 de 6 dimensiones mínimas cubiertas.")).toBeInTheDocument();
    expect(screen.getByText("Falta:")).toBeInTheDocument();
  });

  it("shows partial coverage and missing dimensions", () => {
    render(
      <CoveragePanel
        items={[
          item({ id: "1", dimension: "CONTEXT", validationStatus: "VALIDATED" }),
          item({ id: "2", dimension: "EXPOSURE", validationStatus: "EDITED" })
        ]}
      />
    );

    expect(screen.getByText("2 de 6 dimensiones mínimas cubiertas.")).toBeInTheDocument();
    expect(screen.getByText("Impacto")).toBeInTheDocument();
    expect(screen.getByText("Evidencia")).toBeInTheDocument();
    expect(screen.getByText("Incertidumbre")).toBeInTheDocument();
    expect(screen.getByText("Intervención requerida")).toBeInTheDocument();
  });

  it("shows 6/6 and minimum coverage reached message", () => {
    render(
      <CoveragePanel
        items={[
          item({ id: "1", dimension: "CONTEXT", validationStatus: "VALIDATED" }),
          item({ id: "2", dimension: "EXPOSURE", validationStatus: "VALIDATED" }),
          item({ id: "3", dimension: "IMPACT", validationStatus: "VALIDATED" }),
          item({ id: "4", dimension: "EVIDENCE", validationStatus: "VALIDATED" }),
          item({ id: "5", dimension: "UNCERTAINTY", validationStatus: "VALIDATED" }),
          item({ id: "6", dimension: "INTERVENTION", validationStatus: "VALIDATED" })
        ]}
      />
    );

    expect(screen.getByText("6 de 6 dimensiones mínimas cubiertas.")).toBeInTheDocument();
    expect(screen.getByText("Cobertura mínima alcanzada.")).toBeInTheDocument();
  });
});
