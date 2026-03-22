import { Router } from "express";
import { body, param, validationResult } from "express-validator";
import { Course, Enrollment, Student } from "../models/index.js";

const router = Router();

const enrollmentValidators = [
  body("studentId")
    .notEmpty()
    .withMessage("Aluno é obrigatório.")
    .isInt()
    .withMessage("ID do aluno inválido."),
  body("courseId")
    .notEmpty()
    .withMessage("Curso é obrigatório.")
    .isInt()
    .withMessage("ID do curso inválido."),
  body("nota")
    .optional({ nullable: true, checkFalsy: true })
    .isFloat({ min: 0, max: 10 })
    .withMessage("Nota deve ser entre 0 e 10."),
];

function handleValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return true;
  }
  return false;
}

router.get("/", async (_req, res) => {
  const rows = await Enrollment.findAll({
    include: [
      { model: Student, attributes: ["id", "nome", "email"] },
      { model: Course, attributes: ["id", "nome", "codigo"] },
    ],
    order: [["id", "ASC"]],
  });
  res.json(rows);
});

router.get("/:id", param("id").isInt(), async (req, res) => {
  if (handleValidation(req, res)) return;
  const row = await Enrollment.findByPk(req.params.id, {
    include: [
      { model: Student, attributes: ["id", "nome", "email"] },
      { model: Course, attributes: ["id", "nome", "codigo"] },
    ],
  });
  if (!row) return res.status(404).json({ message: "Matrícula não encontrada." });
  res.json(row);
});

router.post("/", enrollmentValidators, async (req, res) => {
  if (handleValidation(req, res)) return;
  const student = await Student.findByPk(req.body.studentId);
  if (!student) return res.status(400).json({ message: "Aluno não existe." });
  const course = await Course.findByPk(req.body.courseId);
  if (!course) return res.status(400).json({ message: "Curso não existe." });
  try {
    const nota =
      req.body.nota === "" || req.body.nota === undefined || req.body.nota === null
        ? null
        : Number(req.body.nota);
    const created = await Enrollment.create({
      studentId: Number(req.body.studentId),
      courseId: Number(req.body.courseId),
      nota,
    });
    const full = await Enrollment.findByPk(created.id, {
      include: [
        { model: Student, attributes: ["id", "nome", "email"] },
        { model: Course, attributes: ["id", "nome", "codigo"] },
      ],
    });
    res.status(201).json(full);
  } catch (e) {
    if (e.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({ message: "Este aluno já está matriculado neste curso." });
    }
    throw e;
  }
});

router.put("/:id", param("id").isInt(), ...enrollmentValidators, async (req, res) => {
  if (handleValidation(req, res)) return;
  const row = await Enrollment.findByPk(req.params.id);
  if (!row) return res.status(404).json({ message: "Matrícula não encontrada." });
  const student = await Student.findByPk(req.body.studentId);
  if (!student) return res.status(400).json({ message: "Aluno não existe." });
  const course = await Course.findByPk(req.body.courseId);
  if (!course) return res.status(400).json({ message: "Curso não existe." });
  try {
    const nota =
      req.body.nota === "" || req.body.nota === undefined || req.body.nota === null
        ? null
        : Number(req.body.nota);
    await row.update({
      studentId: Number(req.body.studentId),
      courseId: Number(req.body.courseId),
      nota,
    });
    const full = await Enrollment.findByPk(row.id, {
      include: [
        { model: Student, attributes: ["id", "nome", "email"] },
        { model: Course, attributes: ["id", "nome", "codigo"] },
      ],
    });
    res.json(full);
  } catch (e) {
    if (e.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({ message: "Este aluno já está matriculado neste curso." });
    }
    throw e;
  }
});

router.delete("/:id", param("id").isInt(), async (req, res) => {
  if (handleValidation(req, res)) return;
  const row = await Enrollment.findByPk(req.params.id);
  if (!row) return res.status(404).json({ message: "Matrícula não encontrada." });
  await row.destroy();
  res.status(204).send();
});

export default router;
