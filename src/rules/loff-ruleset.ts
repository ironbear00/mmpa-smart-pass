import type { LoffRule } from "./schema";

/**
 * 국내산 LOFF 룰셋 — 어법 × 어종 × 해역 조합 등재 목록.
 *
 * 해역 구분: 연근해(east-sea/west-sea/south-sea), 원양 RFMO(WCPFC/IOTC/IATTC/ICCAT)
 * fisheryCd: 연근해 01~03, 원양 11~14 (실제 코드값 확인 필요)
 * equalLoffIds: 동일 구역 내 복수 LOFF 허용 케이스 (현재 샘플 데이터 없음)
 */
export const LOFF_RULESET = [

  // ── 나잠 (NJ) — 전복(남해·동해), 대합(서해) ─────────────
  {
    id: "R-LOFF-0001", loffNo: 1, fisheryCd: "03",
    method: "naejam", species: "haliotis", region: "south-sea",
    loffId: "LOFF-NJ-HAL-SS", equalLoffIds: [],
    effectiveFrom: "2024-01-01", effectiveTo: null,
  },
  {
    id: "R-LOFF-0002", loffNo: 1, fisheryCd: "01",
    method: "naejam", species: "haliotis", region: "east-sea",
    loffId: "LOFF-NJ-HAL-ES", equalLoffIds: [],
    effectiveFrom: "2024-01-01", effectiveTo: null,
  },
  {
    id: "R-LOFF-0003", loffNo: 1, fisheryCd: "02",
    method: "naejam", species: "clam", region: "west-sea",
    loffId: "LOFF-NJ-CLM-WS", equalLoffIds: [],
    effectiveFrom: "2024-01-01", effectiveTo: null,
  },

  // ── 연승 (YS) — 참치(WCPFC·IOTC·IATTC·ICCAT) ───────────
  {
    id: "R-LOFF-0004", loffNo: 1, fisheryCd: "11",
    method: "yeonseung", species: "tuna", region: "WCPFC",
    loffId: "LOFF-YS-TUN-WC", equalLoffIds: [],
    effectiveFrom: "2024-01-01", effectiveTo: null,
  },
  {
    id: "R-LOFF-0005", loffNo: 1, fisheryCd: "12",
    method: "yeonseung", species: "tuna", region: "IOTC",
    loffId: "LOFF-YS-TUN-IO", equalLoffIds: [],
    effectiveFrom: "2024-01-01", effectiveTo: null,
  },
  {
    id: "R-LOFF-0006", loffNo: 1, fisheryCd: "13",
    method: "yeonseung", species: "tuna", region: "IATTC",
    loffId: "LOFF-YS-TUN-IA", equalLoffIds: [],
    effectiveFrom: "2024-01-01", effectiveTo: null,
  },
  {
    id: "R-LOFF-0007", loffNo: 1, fisheryCd: "14",
    method: "yeonseung", species: "tuna", region: "ICCAT",
    loffId: "LOFF-YS-TUN-IC", equalLoffIds: [],
    effectiveFrom: "2024-01-01", effectiveTo: null,
  },

  // ── 자망 (JM) — 가자미(동해·서해), 조피볼락(동해·남해) ───
  {
    id: "R-LOFF-0008", loffNo: 1, fisheryCd: "01",
    method: "jamang", species: "flatfish", region: "east-sea",
    loffId: "LOFF-JM-FLT-ES", equalLoffIds: [],
    effectiveFrom: "2024-01-01", effectiveTo: null,
  },
  {
    id: "R-LOFF-0009", loffNo: 1, fisheryCd: "02",
    method: "jamang", species: "flatfish", region: "west-sea",
    loffId: "LOFF-JM-FLT-WS", equalLoffIds: [],
    effectiveFrom: "2024-01-01", effectiveTo: null,
  },
  {
    id: "R-LOFF-0010", loffNo: 1, fisheryCd: "01",
    method: "jamang", species: "rockfish", region: "east-sea",
    loffId: "LOFF-JM-ROC-ES", equalLoffIds: [],
    effectiveFrom: "2024-01-01", effectiveTo: null,
  },
  {
    id: "R-LOFF-0011", loffNo: 1, fisheryCd: "03",
    method: "jamang", species: "rockfish", region: "south-sea",
    loffId: "LOFF-JM-ROC-SS", equalLoffIds: [],
    effectiveFrom: "2024-01-01", effectiveTo: null,
  },

  // ── 트롤 (TR) — 명태(동해), 고등어(남해) ────────────────
  {
    id: "R-LOFF-0012", loffNo: 1, fisheryCd: "01",
    method: "troll", species: "pollock", region: "east-sea",
    loffId: "LOFF-TR-PLK-ES", equalLoffIds: [],
    effectiveFrom: "2024-01-01", effectiveTo: null,
  },
  {
    id: "R-LOFF-0013", loffNo: 1, fisheryCd: "03",
    method: "troll", species: "mackerel", region: "south-sea",
    loffId: "LOFF-TR-MCK-SS", equalLoffIds: [],
    effectiveFrom: "2024-01-01", effectiveTo: null,
  },

  // ── 정치망 (JC) — 고등어(남해·동해), 조피볼락(남해) ─────
  {
    id: "R-LOFF-0014", loffNo: 1, fisheryCd: "03",
    method: "jeongchimang", species: "mackerel", region: "south-sea",
    loffId: "LOFF-JC-MCK-SS", equalLoffIds: [],
    effectiveFrom: "2024-01-01", effectiveTo: null,
  },
  {
    id: "R-LOFF-0015", loffNo: 1, fisheryCd: "01",
    method: "jeongchimang", species: "mackerel", region: "east-sea",
    loffId: "LOFF-JC-MCK-ES", equalLoffIds: [],
    effectiveFrom: "2024-01-01", effectiveTo: null,
  },
  {
    id: "R-LOFF-0016", loffNo: 1, fisheryCd: "03",
    method: "jeongchimang", species: "rockfish", region: "south-sea",
    loffId: "LOFF-JC-ROC-SS", equalLoffIds: [],
    effectiveFrom: "2024-01-01", effectiveTo: null,
  },

  // ── 양식 (YK) — 전복(남해·동해), 참돔(남해), 조피볼락(남해) ──
  {
    id: "R-LOFF-0017", loffNo: 1, fisheryCd: "03",
    method: "yangshik", species: "haliotis", region: "south-sea",
    loffId: "LOFF-YK-HAL-SS", equalLoffIds: [],
    effectiveFrom: "2024-01-01", effectiveTo: null,
  },
  // effectiveTo 만료 → asOf=2026 기준 unknown (시간의존성 테스트)
  {
    id: "R-LOFF-0018", loffNo: 1, fisheryCd: "01",
    method: "yangshik", species: "haliotis", region: "east-sea",
    loffId: "LOFF-YK-HAL-ES", equalLoffIds: [],
    effectiveFrom: "2024-01-01", effectiveTo: "2025-12-31",
  },
  // effectiveFrom 미도래 → asOf=2024-12 기준 unknown (시간의존성 테스트)
  {
    id: "R-LOFF-0019", loffNo: 1, fisheryCd: "03",
    method: "yangshik", species: "seabream", region: "south-sea",
    loffId: "LOFF-YK-SBR-SS", equalLoffIds: [],
    effectiveFrom: "2025-06-01", effectiveTo: null,
  },
  // effectiveTo 만료 → asOf=2026 기준 unknown (시간의존성 테스트)
  {
    id: "R-LOFF-0020", loffNo: 1, fisheryCd: "03",
    method: "yangshik", species: "rockfish", region: "south-sea",
    loffId: "LOFF-YK-ROC-SS", equalLoffIds: [],
    effectiveFrom: "2024-01-01", effectiveTo: "2025-12-31",
  },

] as const satisfies readonly LoffRule[];
