import {drizzle} from "drizzle-orm/neon-serverless";
import * as schema from "./schemas";

const loadEnv = () => {
  if (typeof window === "undefined") {
    try {
      // Try to load .env.local first, then fallback to .env
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require("dotenv").config({path: ".env.local"});
      if (!process.env.DATABASE_URL) {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        require("dotenv").config();
      }
    } catch {
      // dotenv not available
    }
  }
};

loadEnv();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not defined");
}

const db = drizzle(process.env.DATABASE_URL, {schema});

export default db;
