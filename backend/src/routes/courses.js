import { Router } from "express";
import { body, param, validationResult } from "express-validator";
import { Course } from "../models/index.js";

const router = Router();

const courseValidators = [
  body("nome")
    .trim()
    .notEmpty()
    .withMessage("Nome do curso é obrigatório.")
    .isLength({ max: 120 })
    .withMessage("Nome muito longo."),
  body("codigo")
    .trim()
    .notEmpty()
    .withMessage("Código é obrigatório.")
    .isLength({ max: 20 })
    .withMessage("Código muito longo."),
  body("cargaHoraria")
    .notEmpty()
    .withMessage("Carga horária é obrigatória.")
    .isInt({ min: 1 })
    .withMessage("Carga horária deve ser um número inteiro positivo."),
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
  const rows = await Course.findAll({ order: [["id", "ASC"]] });
  res.json(rows);
});

router.get("/:id", param("id").isInt(), async (req, res) => {
  if (handleValidation(req, res)) return;
  const row = await Course.findByPk(req.params.id);
  if (!row) return res.status(404).json({ message: "Curso não encontrado." });
  res.json(row);
});

router.post("/", courseValidators, async (req, res) => {
  if (handleValidation(req, res)) return;
  try {
    const created = await Course.create({
      nome: req.body.nome,
      codigo: req.body.codigo,
      cargaHoraria: Number(req.body.cargaHoraria),
    });
    res.status(201).json(created);
  } catch (e) {
    if (e.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({ message: "Código de curso já existe." });
    }
    throw e;
  }
});

router.put("/:id", param("id").isInt(), ...courseValidators, async (req, res) => {
  if (handleValidation(req, res)) return;
  const row = await Course.findByPk(req.params.id);
  if (!row) return res.status(404).json({ message: "Curso não encontrado." });
  try {
    await row.update({
      nome: req.body.nome,
      codigo: req.body.codigo,
      cargaHoraria: Number(req.body.cargaHoraria),
    });
    res.json(row);
  } catch (e) {
    if (e.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({ message: "Código de curso já existe." });
    }
    throw e;
  }
});

router.delete("/:id", param("id").isInt(), async (req, res) => {
  if (handleValidation(req, res)) return;
  const row = await Course.findByPk(req.params.id);
  if (!row) return res.status(404).json({ message: "Curso não encontrado." });
  await row.destroy();
  res.status(204).send();
});

export default router;
