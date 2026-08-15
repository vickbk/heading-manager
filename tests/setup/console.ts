import { MockInstance, vi } from "vitest";

const CONSOLES = ["log", "warn", "error"] as const;

let activeSpies: MockInstance[] = [];

export function shutConsole() {
  resetConsole();

  activeSpies = CONSOLES.map((cons) =>
    vi.spyOn(console, cons).mockImplementation(() => {}),
  );
}

export function resetConsole() {
  for (const spy of activeSpies) {
    spy.mockRestore(); // Restores native console behavior
  }
  activeSpies = [];
}
