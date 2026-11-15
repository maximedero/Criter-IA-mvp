import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { App } from "../../src/app/App";

describe("App foundation smoke", () => {
  it("renders Decision Workspace shell", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: "Decision Workspace" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Inbox" })).toBeInTheDocument();
  });
});
