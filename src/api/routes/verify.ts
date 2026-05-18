import { Hono } from "hono";
import { z } from "zod";
import { verifyDomestic } from "../../engine/domestic";
import { verifyCoa } from "../../engine/coa";
import type { DomesticInput } from "../../engine/domestic";
import type { CoaInput } from "../../engine/coa";
import { LoffMethodEnum, LoffSpeciesEnum, LoffRegionEnum } from "../../rules/schema";

const app = new Hono();

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD 형식");

const domesticBodySchema = z.object({
  method:  LoffMethodEnum.optional(),
  species: LoffSpeciesEnum.optional(),
  region:  LoffRegionEnum.optional(),
  asOf:    isoDate.optional(),
});

const coaBodySchema = z.object({
  countryCode:      z.string().length(3).optional(),
  itemCd:           z.string().optional(),
  fisheryExemption: z.boolean().optional(),
  asOf:             isoDate.optional(),
});

// POST /api/verify/domestic
app.post("/domestic", async (c) => {
  let body: unknown;
  try { body = await c.req.json(); }
  catch { return c.json({ error: "요청 본문을 파싱할 수 없습니다." }, 400); }

  const parsed = domesticBodySchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten().fieldErrors }, 400);
  }

  const { method, species, region, asOf: asOfStr } = parsed.data;
  const asOf = asOfStr ? new Date(asOfStr) : new Date();

  const verdict = verifyDomestic(
    { method, species, region } as Partial<DomesticInput>,
    asOf
  );
  return c.json(verdict);
});

// POST /api/verify/coa
app.post("/coa", async (c) => {
  let body: unknown;
  try { body = await c.req.json(); }
  catch { return c.json({ error: "요청 본문을 파싱할 수 없습니다." }, 400); }

  const parsed = coaBodySchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten().fieldErrors }, 400);
  }

  const { countryCode, itemCd, fisheryExemption, asOf: asOfStr } = parsed.data;
  const asOf = asOfStr ? new Date(asOfStr) : new Date();

  const verdict = verifyCoa(
    { countryCode, itemCd, fisheryExemption } as Partial<CoaInput>,
    asOf
  );
  return c.json(verdict);
});

export default app;
