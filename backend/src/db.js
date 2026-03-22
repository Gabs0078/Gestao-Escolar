import { Sequelize } from "sequelize";

const url = process.env.DATABASE_URL || "postgres://app:app@localhost:5432/escola";

export const sequelize = new Sequelize(url, {
  logging: false,
  define: { underscored: true },
});
