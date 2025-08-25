import { SQLDatabase } from "encore.dev/storage/sqldb";

export const libraryDB = new SQLDatabase("library", {
  migrations: "./migrations",
});
