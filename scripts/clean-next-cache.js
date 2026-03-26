import { rmSync } from "node:fs";
import { resolve } from "node:path";

const nextDir = resolve(process.cwd(), ".next");

try {
  rmSync(nextDir, { recursive: true, force: true });
  console.log("Cleared .next cache");
} catch (error) {
  console.error("Failed to clear .next cache:", error);
  process.exit(1);
}
