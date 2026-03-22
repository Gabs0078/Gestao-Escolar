import { Router } from "express";
import { body, param, validationResult } from "express-validator";
import { Student } from "../models/index.js";
import { isValidCpf, normalizeCpf } from "../utils/cpf.js";

const router = Router();

const studentValidators = [
  body("nome")
    .trim()
    .notEmpty()
    .withMessage("Nome é obrigatório.")
    .isLength({ max: 120 })
    .withMessage("Nome muito longo."),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("E-mail é obrigatório.")
    .isEmail()
    .withMessage("E-mail inválido.")
    .normalizeEmail(),
  body("cpf")
    .trim()
    .notEmpty()
    .withMessage("CPF é obrigatório.")
    .custom((v) => isValidCpf(v))
    .withMessage("CPF inválido."),
  body("telefone")
    .trim()
    .notEmpty()
    .withMessage("Telefone é obrigatório.")
    .isLength({ max: 20 })
    .withMessage("Telefone muito longo."),
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
  const rows = await Student.findAll({ order: [["id", "ASC"]] });
  res.json(rows);
});

router.get("/:id", param("id").isInt(), async (req, res) => {
  if (handleValidation(req, res)) return;
  const row = await Student.findByPk(req.params.id);
  if (!row) return res.status(404).json({ message: "Aluno não encontrado." });
  res.json(row);
});

router.post("/", studentValidators, async (req, res) => {
  if (handleValidation(req, res)) return;
  try {
    const cpf = normalizeCpf(req.body.cpf);
    const created = await Student.create({
      nome: req.body.nome,
      email: req.body.email,
      cpf,
      telefone: req.body.telefone,
    });
    res.status(201).json(created);
  } catch (e) {
    if (e.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({ message: "E-mail ou CPF já cadastrado." });
    }
    throw e;
  }
});

router.put("/:id", param("id").isInt(), ...studentValidators, async (req, res) => {
  if (handleValidation(req, res)) return;
  const row = await Student.findByPk(req.params.id);
  if (!row) return res.status(404).json({ message: "Aluno não encontrado." });
  try {
    const cpf = normalizeCpf(req.body.cpf);
    await row.update({
      nome: req.body.nome,
      email: req.body.email,
      cpf,
      telefone: req.body.telefone,
    });
    res.json(row);
  } catch (e) {
    if (e.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({ message: "E-mail ou CPF já cadastrado." });
    }
    throw e;
  }
});

router.delete("/:id", param("id").isInt(), async (req, res) => {
  if (handleValidation(req, res)) return;
  const row = await Student.findByPk(req.params.id);
  if (!row) return res.status(404).json({ message: "Aluno não encontrado." });
  await row.destroy();
  res.status(204).send();
});

export default router;
