import { Sequelize } from "sequelize";

sequelize = new Sequelize('postgres://postgres:app@app-database:5432/escola', {dialect: 'postgres'})

export { sequelize }; = new Sequelize(url, { dialect: 'postgres' })
  logging: false,
  define: { underscored: true },
});
