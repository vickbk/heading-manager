import { afterEach, beforeEach, describe, test } from "vitest";
import { resetConsole, shutConsole } from "./console";

describe("noisy tests", () => {
  beforeEach(() => {
    shutConsole();
  });

  afterEach(() => {
    resetConsole();
  });

  test("runs silently without polluting terminal output", () => {
    console.log("This will be hidden");
  });
});
