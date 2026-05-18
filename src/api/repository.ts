// DB 교체 시 이 인터페이스와 타입만 유지하면 됩니다.
// SQLite 구현은 db.ts, Supabase 구현은 별도 파일로 교체하세요.

export interface ApplicationRow {
  id: number;
  doc_no: string;
  origin_type: string;
  applicant_nm: string;
  applicant_dt: string;
  status: string;
  reg_dt: string;
}

export interface SpeciesData {
  loff_id: string | null;
  item_cd: string | null;
  country_origin: string | null;
  country_process: string | null;
  fishing_gear: string | null;
}

export interface InsertApplicationData {
  doc_no: string;
  origin_type: "domestic" | "import";
  applicant_nm: string;
  applicant_dt: string;
  verdict_snapshot: string;
  species: SpeciesData;
}

export interface Repository {
  listApplications(): Promise<ApplicationRow[]>;
  insertApplication(data: InsertApplicationData): Promise<{ id: number | bigint }>;
}
