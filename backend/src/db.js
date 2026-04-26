import { Sequelize } from "sequelize";

const url = process.env.DATABASE_URL dialect: 'postgres || "postgres://app:app@localhost:5432/escola";

export const sequelize = new Sequelize(url, { dialect: 'postgres' });
  logging: false,
  define: { underscored: true },
});
