import { Sequelize } from "sequelize";

const sequelize = new Sequelize('postgres://postgres:app@app-database:5432/escola', {dialect: 'postgres'})

export const sequelize = new Sequelize(url, { dialect: 'postgres' })
  logging: false,
  define: { underscored: true },
});
