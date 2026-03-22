import cors from "cors";
import express from "express";
import { sequelize } from "./db.js";
import "./models/index.js";
import coursesRouter from "./routes/courses.js";
import enrollmentsRouter from "./routes/enrollments.js";
import studentsRouter from "./routes/students.js";

const app = express();
const port = Number(process.env.PORT) || 3001;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/students", studentsRouter);
app.use("/api/courses", coursesRouter);
app.use("/api/enrollments", enrollmentsRouter);

async function main() {
  await sequelize.authenticate();
  await sequelize.sync();

  const qi = sequelize.getQueryInterface();
  try {
    await qi.addIndex("enrollments", ["student_id", "course_id"], {
      unique: true,
      name: "enrollments_student_course_unique",
    });
  } catch (e) {
    const msg = String(e?.message || e);
    if (!/already exists|duplicate/i.test(msg)) throw e;
  }

  app.listen(port, "0.0.0.0", () => {
    console.log(`API em http://0.0.0.0:${port}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
