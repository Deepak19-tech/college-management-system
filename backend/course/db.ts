import { SQLDatabase } from "encore.dev/storage/sqldb";

export const courseDB = new SQLDatabase("course", {
  migrations: "./migrations",
});
