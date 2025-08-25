import { SQLDatabase } from "encore.dev/storage/sqldb";

export const communicationDB = new SQLDatabase("communication", {
  migrations: "./migrations",
});
