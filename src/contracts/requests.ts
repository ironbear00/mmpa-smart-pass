export interface VerifyDomesticRequest {
  method?: string;
  species?: string;
  region?: string;
  asOf?: string; // YYYY-MM-DD. 없으면 오늘
}

export interface VerifyCoaRequest {
  countryCode?: string;
  itemCd?: string;
  fisheryExemption?: boolean;
  asOf?: string;
}
