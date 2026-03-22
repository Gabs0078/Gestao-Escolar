import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "./api.js";
import { isValidCpf } from "./validate.js";

const initialStudent = { nome: "", email: "", cpf: "", telefone: "" };
const initialCourse = { nome: "", codigo: "", cargaHoraria: "" };
const initialEnrollment = { studentId: "", courseId: "", nota: "" };

function formatErrors(err) {
  if (err.body?.errors?.length) {
    return err.body.errors.map((e) => e.msg || e.message).join(" ");
  }
  return err.message || "Erro desconhecido.";
}

export default function App() {
  const [tab, setTab] = useState("alunos");

  return (
    <div className="app">
      <h1>Gestão escolar (CRUD)</h1>
      <nav className="tabs" aria-label="Seções">
        <button type="button" className={tab === "alunos" ? "active" : ""} onClick={() => setTab("alunos")}>
          Alunos
        </button>
        <button type="button" className={tab === "cursos" ? "active" : ""} onClick={() => setTab("cursos")}>
          Cursos
        </button>
        <button
          type="button"
          className={tab === "matriculas" ? "active" : ""}
          onClick={() => setTab("matriculas")}
        >
          Matrículas
        </button>
      </nav>

      {tab === "alunos" && <StudentsCrud />}
      {tab === "cursos" && <CoursesCrud />}
      {tab === "matriculas" && <EnrollmentsCrud />}
    </div>
  );
}

function StudentsCrud() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(initialStudent);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [clientError, setClientError] = useState("");

  const load = useCallback(async () => {
    const data = await apiFetch("/api/students");
    setItems(data);
  }, []);

  useEffect(() => {
    load().catch((e) => setError(formatErrors(e)));
  }, [load]);

  function validateClient() {
    if (!form.nome.trim()) return "Nome é obrigatório.";
    if (!form.email.trim()) return "E-mail é obrigatório.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return "E-mail inválido.";
    if (!form.cpf.trim()) return "CPF é obrigatório.";
    if (!isValidCpf(form.cpf)) return "CPF inválido.";
    if (!form.telefone.trim()) return "Telefone é obrigatório.";
    return "";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const v = validateClient();
    if (v) {
      setClientError(v);
      return;
    }
    setClientError("");
    try {
      const body = JSON.stringify(form);
      if (editingId) {
        await apiFetch(`/api/students/${editingId}`, { method: "PUT", body });
      } else {
        await apiFetch("/api/students", { method: "POST", body });
      }
      setForm(initialStudent);
      setEditingId(null);
      await load();
    } catch (err) {
      setError(formatErrors(err));
    }
  }

  function startEdit(row) {
    setEditingId(row.id);
    setForm({
      nome: row.nome,
      email: row.email,
      cpf: row.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4"),
      telefone: row.telefone,
    });
    setError("");
    setClientError("");
  }

  async function remove(id) {
    if (!confirm("Excluir este aluno?")) return;
    setError("");
    try {
      await apiFetch(`/api/students/${id}`, { method: "DELETE" });
      await load();
    } catch (err) {
      setError(formatErrors(err));
    }
  }

  return (
    <section className="card">
      <h2>Alunos</h2>
      <p style={{ color: "#6b7280", fontSize: "0.9rem", marginTop: 0 }}>
        Validação: campos obrigatórios, e-mail e CPF.
      </p>
      {error && <div className="error">{error}</div>}
      {clientError && <div className="error">{clientError}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <label>
            Nome
            <input
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              required
            />
          </label>
          <label>
            E-mail
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </label>
        </div>
        <div className="form-row">
          <label>
            CPF
            <input
              value={form.cpf}
              placeholder="000.000.000-00"
              onChange={(e) => setForm({ ...form, cpf: e.target.value })}
              required
            />
          </label>
          <label>
            Telefone
            <input value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} required />
          </label>
        </div>
        <div className="actions">
          <button type="submit" className="primary">
            {editingId ? "Salvar" : "Cadastrar"}
          </button>
          {editingId && (
            <button
              type="button"
              className="secondary"
              onClick={() => {
                setEditingId(null);
                setForm(initialStudent);
              }}
            >
              Cancelar edição
            </button>
          )}
        </div>
      </form>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>E-mail</th>
            <th>CPF</th>
            <th>Telefone</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {items.map((r) => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{r.nome}</td>
              <td>{r.email}</td>
              <td>{r.cpf}</td>
              <td>{r.telefone}</td>
              <td className="actions">
                <button type="button" className="secondary" onClick={() => startEdit(r)}>
                  Editar
                </button>
                <button type="button" className="danger" onClick={() => remove(r.id)}>
                  Excluir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function CoursesCrud() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(initialCourse);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const data = await apiFetch("/api/courses");
    setItems(data);
  }, []);

  useEffect(() => {
    load().catch((e) => setError(formatErrors(e)));
  }, [load]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!form.nome.trim() || !form.codigo.trim() || form.cargaHoraria === "") {
      setError("Preencha todos os campos.");
      return;
    }
    const ch = Number(form.cargaHoraria);
    if (!Number.isInteger(ch) || ch < 1) {
      setError("Carga horária deve ser um inteiro positivo.");
      return;
    }
    try {
      const body = JSON.stringify({
        nome: form.nome,
        codigo: form.codigo,
        cargaHoraria: ch,
      });
      if (editingId) {
        await apiFetch(`/api/courses/${editingId}`, { method: "PUT", body });
      } else {
        await apiFetch("/api/courses", { method: "POST", body });
      }
      setForm(initialCourse);
      setEditingId(null);
      await load();
    } catch (err) {
      setError(formatErrors(err));
    }
  }

  function startEdit(row) {
    setEditingId(row.id);
    setForm({ nome: row.nome, codigo: row.codigo, cargaHoraria: String(row.cargaHoraria) });
    setError("");
  }

  async function remove(id) {
    if (!confirm("Excluir este curso?")) return;
    setError("");
    try {
      await apiFetch(`/api/courses/${id}`, { method: "DELETE" });
      await load();
    } catch (err) {
      setError(formatErrors(err));
    }
  }

  return (
    <section className="card">
      <h2>Cursos</h2>
      <p style={{ color: "#6b7280", fontSize: "0.9rem", marginTop: 0 }}>Validação: campos obrigatórios e carga horária numérica.</p>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <label>
            Nome
            <input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required />
          </label>
          <label>
            Código
            <input value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} required />
          </label>
          <label>
            Carga horária (h)
            <input
              type="number"
              min={1}
              value={form.cargaHoraria}
              onChange={(e) => setForm({ ...form, cargaHoraria: e.target.value })}
              required
            />
          </label>
        </div>
        <div className="actions">
          <button type="submit" className="primary">
            {editingId ? "Salvar" : "Cadastrar"}
          </button>
          {editingId && (
            <button
              type="button"
              className="secondary"
              onClick={() => {
                setEditingId(null);
                setForm(initialCourse);
              }}
            >
              Cancelar edição
            </button>
          )}
        </div>
      </form>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Código</th>
            <th>Carga horária</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {items.map((r) => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{r.nome}</td>
              <td>{r.codigo}</td>
              <td>{r.cargaHoraria}</td>
              <td className="actions">
                <button type="button" className="secondary" onClick={() => startEdit(r)}>
                  Editar
                </button>
                <button type="button" className="danger" onClick={() => remove(r.id)}>
                  Excluir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function EnrollmentsCrud() {
  const [items, setItems] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState(initialEnrollment);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const [enr, st, co] = await Promise.all([
      apiFetch("/api/enrollments"),
      apiFetch("/api/students"),
      apiFetch("/api/courses"),
    ]);
    setItems(enr);
    setStudents(st);
    setCourses(co);
  }, []);

  useEffect(() => {
    load().catch((e) => setError(formatErrors(e)));
  }, [load]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (form.studentId === "" || form.courseId === "") {
      setError("Selecione aluno e curso.");
      return;
    }
    const payload = {
      studentId: Number(form.studentId),
      courseId: Number(form.courseId),
      nota: form.nota === "" ? null : Number(form.nota),
    };
    if (payload.nota != null && (payload.nota < 0 || payload.nota > 10)) {
      setError("Nota deve estar entre 0 e 10.");
      return;
    }
    try {
      const body = JSON.stringify(payload);
      if (editingId) {
        await apiFetch(`/api/enrollments/${editingId}`, { method: "PUT", body });
      } else {
        await apiFetch("/api/enrollments", { method: "POST", body });
      }
      setForm(initialEnrollment);
      setEditingId(null);
      await load();
    } catch (err) {
      setError(formatErrors(err));
    }
  }

  function startEdit(row) {
    setEditingId(row.id);
    setForm({
      studentId: String(row.studentId),
      courseId: String(row.courseId),
      nota: row.nota != null ? String(row.nota) : "",
    });
    setError("");
  }

  async function remove(id) {
    if (!confirm("Excluir esta matrícula?")) return;
    setError("");
    try {
      await apiFetch(`/api/enrollments/${id}`, { method: "DELETE" });
      await load();
    } catch (err) {
      setError(formatErrors(err));
    }
  }

  return (
    <section className="card">
      <h2>Matrículas</h2>
      <p style={{ color: "#6b7280", fontSize: "0.9rem", marginTop: 0 }}>
        Liga aluno a curso; nota opcional (0–10).
      </p>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <label>
            Aluno
            <select
              value={form.studentId}
              onChange={(e) => setForm({ ...form, studentId: e.target.value })}
              required
            >
              <option value="">Selecione…</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nome} ({s.email})
                </option>
              ))}
            </select>
          </label>
          <label>
            Curso
            <select
              value={form.courseId}
              onChange={(e) => setForm({ ...form, courseId: e.target.value })}
              required
            >
              <option value="">Selecione…</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome} — {c.codigo}
                </option>
              ))}
            </select>
          </label>
          <label>
            Nota (opcional)
            <input
              type="number"
              step="0.1"
              min={0}
              max={10}
              value={form.nota}
              onChange={(e) => setForm({ ...form, nota: e.target.value })}
            />
          </label>
        </div>
        <div className="actions">
          <button type="submit" className="primary">
            {editingId ? "Salvar" : "Cadastrar"}
          </button>
          {editingId && (
            <button
              type="button"
              className="secondary"
              onClick={() => {
                setEditingId(null);
                setForm(initialEnrollment);
              }}
            >
              Cancelar edição
            </button>
          )}
        </div>
      </form>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Aluno</th>
            <th>Curso</th>
            <th>Nota</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {items.map((r) => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{(r.Student || r.student)?.nome ?? r.studentId}</td>
              <td>{(r.Course || r.course)?.nome ?? r.courseId}</td>
              <td>{r.nota ?? "—"}</td>
              <td className="actions">
                <button type="button" className="secondary" onClick={() => startEdit(r)}>
                  Editar
                </button>
                <button type="button" className="danger" onClick={() => remove(r.id)}>
                  Excluir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
