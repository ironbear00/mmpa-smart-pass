import type { LoffRule } from "./schema";

/**
 * 국내산 LOFF 룰셋 — 어법 × 어종 × 해역 조합 등재 목록.
 *
 * 해역 구분: 연근해(east-sea/west-sea/south-sea), 원양 RFMO(WCPFC/IOTC/IATTC/ICCAT)
 * - 등재된 조합: eligible
 * - 미등재 조합: ineligible
 * - effectiveTo 경과 / effectiveFrom 미도래: unknown
 */
export const LOFF_RULESET = [

  // ── 나잠 (NJ) — 전복(남해·동해), 대합(서해) ─────────────
  {
    id: "R-LOFF-0001",
    method: "naejam", species: "haliotis", region: "south-sea",
    loffId: "LOFF-NJ-HAL-SS",
    effectiveFrom: "2024-01-01", effectiveTo: null,
  },
  {
    id: "R-LOFF-0002",
    method: "naejam", species: "haliotis", region: "east-sea",
    loffId: "LOFF-NJ-HAL-ES",
    effectiveFrom: "2024-01-01", effectiveTo: null,
  },
  {
    id: "R-LOFF-0003",
    method: "naejam", species: "clam", region: "west-sea",
    loffId: "LOFF-NJ-CLM-WS",
    effectiveFrom: "2024-01-01", effectiveTo: null,
  },

  // ── 연승 (YS) — 참치(WCPFC·IOTC·IATTC·ICCAT) ───────────
  {
    id: "R-LOFF-0004",
    method: "yeonseung", species: "tuna", region: "WCPFC",
    loffId: "LOFF-YS-TUN-WC",
    effectiveFrom: "2024-01-01", effectiveTo: null,
  },
  {
    id: "R-LOFF-0005",
    method: "yeonseung", species: "tuna", region: "IOTC",
    loffId: "LOFF-YS-TUN-IO",
    effectiveFrom: "2024-01-01", effectiveTo: null,
  },
  {
    id: "R-LOFF-0006",
    method: "yeonseung", species: "tuna", region: "IATTC",
    loffId: "LOFF-YS-TUN-IA",
    effectiveFrom: "2024-01-01", effectiveTo: null,
  },
  {
    id: "R-LOFF-0007",
    method: "yeonseung", species: "tuna", region: "ICCAT",
    loffId: "LOFF-YS-TUN-IC",
    effectiveFrom: "2024-01-01", effectiveTo: null,
  },

  // ── 자망 (JM) — 가자미(동해·서해), 조피볼락(동해·남해) ───
  {
    id: "R-LOFF-0008",
    method: "jamang", species: "flatfish", region: "east-sea",
    loffId: "LOFF-JM-FLT-ES",
    effectiveFrom: "2024-01-01", effectiveTo: null,
  },
  {
    id: "R-LOFF-0009",
    method: "jamang", species: "flatfish", region: "west-sea",
    loffId: "LOFF-JM-FLT-WS",
    effectiveFrom: "2024-01-01", effectiveTo: null,
  },
  {
    id: "R-LOFF-0010",
    method: "jamang", species: "rockfish", region: "east-sea",
    loffId: "LOFF-JM-ROC-ES",
    effectiveFrom: "2024-01-01", effectiveTo: null,
  },
  {
    id: "R-LOFF-0011",
    method: "jamang", species: "rockfish", region: "south-sea",
    loffId: "LOFF-JM-ROC-SS",
    effectiveFrom: "2024-01-01", effectiveTo: null,
  },

  // ── 트롤 (TR) — 명태(동해), 고등어(남해) ────────────────
  {
    id: "R-LOFF-0012",
    method: "troll", species: "pollock", region: "east-sea",
    loffId: "LOFF-TR-PLK-ES",
    effectiveFrom: "2024-01-01", effectiveTo: null,
  },
  {
    id: "R-LOFF-0013",
    method: "troll", species: "mackerel", region: "south-sea",
    loffId: "LOFF-TR-MCK-SS",
    effectiveFrom: "2024-01-01", effectiveTo: null,
  },

  // ── 정치망 (JC) — 고등어(남해·동해), 조피볼락(남해) ─────
  {
    id: "R-LOFF-0014",
    method: "jeongchimang", species: "mackerel", region: "south-sea",
    loffId: "LOFF-JC-MCK-SS",
    effectiveFrom: "2024-01-01", effectiveTo: null,
  },
  {
    id: "R-LOFF-0015",
    method: "jeongchimang", species: "mackerel", region: "east-sea",
    loffId: "LOFF-JC-MCK-ES",
    effectiveFrom: "2024-01-01", effectiveTo: null,
  },
  {
    id: "R-LOFF-0016",
    method: "jeongchimang", species: "rockfish", region: "south-sea",
    loffId: "LOFF-JC-ROC-SS",
    effectiveFrom: "2024-01-01", effectiveTo: null,
  },

  // ── 양식 (YK) — 전복(남해·동해), 참돔(남해), 조피볼락(남해) ──
  {
    id: "R-LOFF-0017",
    method: "yangshik", species: "haliotis", region: "south-sea",
    loffId: "LOFF-YK-HAL-SS",
    effectiveFrom: "2024-01-01", effectiveTo: null,
  },
  // effectiveTo 만료 → asOf=2026 기준 unknown (시간의존성 테스트)
  {
    id: "R-LOFF-0018",
    method: "yangshik", species: "haliotis", region: "east-sea",
    loffId: "LOFF-YK-HAL-ES",
    effectiveFrom: "2024-01-01", effectiveTo: "2025-12-31",
  },
  // effectiveFrom 미도래 → asOf=2024-12 기준 unknown (시간의존성 테스트)
  {
    id: "R-LOFF-0019",
    method: "yangshik", species: "seabream", region: "south-sea",
    loffId: "LOFF-YK-SBR-SS",
    effectiveFrom: "2025-06-01", effectiveTo: null,
  },
  // effectiveTo 만료 → asOf=2026 기준 unknown (시간의존성 테스트)
  {
    id: "R-LOFF-0020",
    method: "yangshik", species: "rockfish", region: "south-sea",
    loffId: "LOFF-YK-ROC-SS",
    effectiveFrom: "2024-01-01", effectiveTo: "2025-12-31",
  },

] as const satisfies readonly LoffRule[];
