import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { App } from "../../src/app/App";

describe("App foundation smoke", () => {
  it("renders foundation shell", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: "Decision Workspace" })).toBeInTheDocument();
    expect(screen.getByText("Foundation ready.")).toBeInTheDocument();
  });
});
