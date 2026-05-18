import Database from "better-sqlite3";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { mkdirSync } from "fs";
import { LOFF_RULESET } from "../rules/loff-ruleset";
import { COA_COUNTRY_LIST } from "../rules/coa-country-list";
import { COA_ITEM_LIST } from "../rules/coa-item-list";
import { LoffRuleSchema, CoaCountryRuleSchema, CoaItemRuleSchema } from "../rules/schema";
import type { Repository, ApplicationRow, InsertApplicationData } from "./repository";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DB_PATH = resolve(__dirname, "../../data/app.db");

// ── 룰셋 Zod 검증 ─────────────────────────────────────────
function validateRulesets(): void {
  try {
    LOFF_RULESET.forEach((r) => LoffRuleSchema.parse(r));
    COA_COUNTRY_LIST.forEach((r) => CoaCountryRuleSchema.parse(r));
    COA_ITEM_LIST.forEach((i) => CoaItemRuleSchema.parse(i));
    console.log(
      `✓ 룰셋 검증 완료 — LOFF ${LOFF_RULESET.length}건 / COA ${COA_COUNTRY_LIST.length}건 / 품목 ${COA_ITEM_LIST.length}건`
    );
  } catch (err) {
    console.error("룰셋 Zod 검증 실패 — 서버 기동을 거부합니다.");
    console.error(err);
    process.exit(1);
  }
}

validateRulesets();

// ── SQLite 초기화 ──────────────────────────────────────────
// Supabase/PostgreSQL로 교체할 때: 이 블록을 삭제하고 repo 구현체만 바꾸면 됩니다.
mkdirSync(dirname(DB_PATH), { recursive: true });

const _db = new Database(DB_PATH);

_db.exec(`
  CREATE TABLE IF NOT EXISTS applications (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    doc_no           TEXT    UNIQUE NOT NULL,
    origin_type      TEXT    NOT NULL CHECK(origin_type IN ('domestic', 'import')),
    applicant_nm     TEXT    NOT NULL,
    applicant_dt     TEXT    NOT NULL,
    status           TEXT    NOT NULL DEFAULT 'draft'
                             CHECK(status IN ('draft', 'submitted', 'rejected')),
    rejection_reason TEXT,
    verdict_snapshot TEXT    NOT NULL,
    reg_dt           TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    upd_dt           TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
  );

  CREATE TABLE IF NOT EXISTS application_species (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    application_id  INTEGER NOT NULL REFERENCES applications(id),
    seq             INTEGER NOT NULL,
    species_kor_nm  TEXT,
    species_eng_nm  TEXT,
    species_sci_nm  TEXT,
    prdt_form       TEXT,
    prdt_weight_kg  REAL,
    hts_number      TEXT,
    loff_id         TEXT,
    item_cd         TEXT,
    country_origin  TEXT,
    country_process TEXT,
    fishing_gear    TEXT,
    vessel_flag     TEXT,
    vessel_name     TEXT,
    vessel_no       TEXT
  );

  CREATE INDEX IF NOT EXISTS idx_apps_origin  ON applications(origin_type);
  CREATE INDEX IF NOT EXISTS idx_apps_status  ON applications(status);
  CREATE INDEX IF NOT EXISTS idx_species_app  ON application_species(application_id);
  CREATE INDEX IF NOT EXISTS idx_species_loff ON application_species(loff_id);
  CREATE INDEX IF NOT EXISTS idx_species_item ON application_species(item_cd);
`);

console.log(`✓ SQLite 초기화 완료 — ${DB_PATH}`);

// ── SQLite Repository 구현 ─────────────────────────────────
// 교체 방법: 이 const 블록 전체를 Supabase 클라이언트 기반 구현으로 덮어쓰세요.
// 인터페이스(Repository)와 타입은 repository.ts에서 그대로 사용합니다.

const stmtListApps = _db.prepare<[], ApplicationRow>(`
  SELECT id, doc_no, origin_type, applicant_nm, applicant_dt, status, reg_dt
  FROM applications
  ORDER BY reg_dt DESC
  LIMIT 100
`);

const stmtInsertApp = _db.prepare(`
  INSERT INTO applications
    (doc_no, origin_type, applicant_nm, applicant_dt, status, verdict_snapshot)
  VALUES (?, ?, ?, ?, 'submitted', ?)
`);

const stmtInsertSpecies = _db.prepare(`
  INSERT INTO application_species
    (application_id, seq, loff_id, item_cd, country_origin, country_process, fishing_gear)
  VALUES (?, 1, ?, ?, ?, ?, ?)
`);

export const repo: Repository = {
  listApplications: async () => stmtListApps.all() as ApplicationRow[],

  insertApplication: async (data: InsertApplicationData) => {
    const id = _db.transaction(() => {
      const info = stmtInsertApp.run(
        data.doc_no,
        data.origin_type,
        data.applicant_nm,
        data.applicant_dt,
        data.verdict_snapshot,
      );
      stmtInsertSpecies.run(
        info.lastInsertRowid,
        data.species.loff_id,
        data.species.item_cd,
        data.species.country_origin,
        data.species.country_process,
        data.species.fishing_gear,
      );
      return info.lastInsertRowid;
    })();
    return { id };
  },
};
