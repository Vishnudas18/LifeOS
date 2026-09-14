import { defineConfig } from "vitest/config";
import dotenv from "dotenv";

dotenv.config();

const baseUri = process.env.MONGODB_URI || "";
const testUri = baseUri.includes("/lifedb")
  ? baseUri.replace(/\/lifedb(\?|$)/, "/lifedb_test$1")
  : baseUri;

export default defineConfig({
  test: {
    include: ["src/tests/**/*.test.ts"],
    exclude: ["dist/**", "node_modules/**"],
    fileParallelism: false,
    hookTimeout: 30000,
    testTimeout: 30000,
    env: {
      NODE_ENV: "test",
      MONGODB_URI: testUri,
    },
  },
});
