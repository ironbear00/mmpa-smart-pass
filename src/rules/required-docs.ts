export const DOMESTIC_DOCS = [
  "어업허가증 사본",
  "출하확인서",
  "수출신고서",
] as const;

// L1 국가 및 USA: 어획증명서 트랙
export const CATCH_CERT_DOCS = [
  "어획증명서 (어법·선명·선박번호 포함)",
] as const;

// L2 국가: COA 표준 트랙
export const COA_STANDARD_DOCS = [
  "원료 생산국 발급 COA (원산지증명서)",
] as const;

// L3 + MMPA 미적용 어업 입증: COA + 추가 서류
export const COA_L3_EXEMPTION_DOCS = [
  "원료 생산국 발급 COA (원산지증명서)",
  "MMPA 미적용 어업 입증서",
  "항구 추가 심사 동의서",
] as const;
