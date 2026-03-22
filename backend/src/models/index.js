import { DataTypes } from "sequelize";
import { sequelize } from "../db.js";

export const Student = sequelize.define(
  "Student",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nome: { type: DataTypes.STRING(120), allowNull: false },
    email: { type: DataTypes.STRING(180), allowNull: false, unique: true },
    cpf: { type: DataTypes.STRING(11), allowNull: false, unique: true },
    telefone: { type: DataTypes.STRING(20), allowNull: false },
  },
  { tableName: "students" }
);

export const Course = sequelize.define(
  "Course",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nome: { type: DataTypes.STRING(120), allowNull: false },
    codigo: { type: DataTypes.STRING(20), allowNull: false, unique: true },
    cargaHoraria: { type: DataTypes.INTEGER, allowNull: false, field: "carga_horaria" },
  },
  { tableName: "courses" }
);

// Colunas student_id / course_id vêm só das associações (evita duplicar FK no sync).
// Índice único é criado em index.js após sync (evita erro de validação no define).
export const Enrollment = sequelize.define(
  "Enrollment",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nota: { type: DataTypes.FLOAT, allowNull: true },
  },
  { tableName: "enrollments" }
);

Student.hasMany(Enrollment, { foreignKey: "studentId" });
Enrollment.belongsTo(Student, { foreignKey: "studentId" });

Course.hasMany(Enrollment, { foreignKey: "courseId" });
Enrollment.belongsTo(Course, { foreignKey: "courseId" });
