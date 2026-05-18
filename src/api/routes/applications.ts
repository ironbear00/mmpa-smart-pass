import { Hono } from "hono";
import { z } from "zod";
import { repo } from "../db";

const app = new Hono();

const verdictSchema = z.object({
  kind: z.string(),
  loffId: z.string().optional(),
  listGrade: z.string().optional(),
  message: z.string(),
  missing: z.array(z.string()).optional(),
  requiredDocs: z.array(z.string()).optional(),
  matchedRuleId: z.string().optional(),
  nextStepEnabled: z.boolean(),
});

const itemSchema = z.object({
  id: z.string(),
  input: z.record(z.string()),
  verdict: verdictSchema,
});

const submitSchema = z.object({
  branch: z.enum(["domestic", "import"]),
  applicantNm: z.string().min(1, "신청인 이름 필수"),
  items: z.array(itemSchema).min(1, "최소 1건 이상"),
});

function genDocNo(): string {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const rand = String(Math.floor(Math.random() * 9000) + 1000);
  return `MMPA-${datePart}-${rand}`;
}

// GET /api/applications
app.get("/", async (c) => {
  const rows = await repo.listApplications();
  return c.json(rows);
});

// POST /api/applications/submit
app.post("/submit", async (c) => {
  let body: unknown;
  try { body = await c.req.json(); }
  catch { return c.json({ error: "요청 본문 파싱 오류" }, 400); }

  const parsed = submitSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten().fieldErrors }, 400);
  }

  const { branch, applicantNm, items } = parsed.data;
  const docNo = genDocNo();
  const today = new Date().toISOString().slice(0, 10);
  const first = items[0];

  const { id } = await repo.insertApplication({
    doc_no: docNo,
    origin_type: branch === "domestic" ? "domestic" : "import",
    applicant_nm: applicantNm,
    applicant_dt: today,
    verdict_snapshot: JSON.stringify(items),
    species: {
      loff_id: first.verdict.loffId ?? null,
      item_cd: first.input.itemCd ?? null,
      country_origin: first.input.countryCode ?? null,
      country_process: first.input.processingCountry ?? null,
      fishing_gear: first.input.method ?? null,
    },
  });

  return c.json({ docNo, id }, 201);
});

export default app;
