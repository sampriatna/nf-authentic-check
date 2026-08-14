export type Product = {
  id: string;
  serial_number: string;
  pin_code: string;
  product_name: string;
  batch_code: string;
  production_date: string | null;
  expired_date: string | null;
  status: string;
  scan_count: number;
  first_scan_at: string | null;
  last_scan_at: string | null;
  first_scan_ip: string | null;
  last_scan_ip: string | null;
  note: string | null;
};

export type VerificationLog = {
  id: string;
  serial_number: string;
  pin_input: string;
  result: string;
  scanned_at: string;
  ip_address: string | null;
  user_agent: string | null;
};

export type CheckResult =
  | {
      result: "first_scan" | "repeat_scan";
      message: string;
      product: Product;
    }
  | {
      result: "invalid";
      message: string;
      product: null;
    };

export type ProductInput = {
  serial_number: string;
  pin_code: string;
  product_name: string;
  batch_code: string;
  production_date?: string | null;
  expired_date?: string | null;
  status?: string;
  note?: string | null;
};

export type AuthenticatorCode = {
  id: string;
  product_name: string;
  variant: string;
  batch: string;
  unique_code: string;
  qr_url: string;
  status: string;
  scan_count: number;
  first_scanned_at: string | null;
  last_scanned_at: string | null;
  production_date: string | null;
  note: string | null;
  created_at: string;
};

export type AuthenticatorGenerateInput = {
  product_name: string;
  variant: string;
  batch: string;
  quantity: number;
  prefix: string;
  production_date?: string | null;
  note?: string | null;
};

export type AuthenticatorCheckResult =
  | {
      result: "valid_first" | "valid_repeat";
      message: string;
      code: AuthenticatorCode;
    }
  | {
      result: "invalid";
      message: string;
      code: null;
    };

export type CustomerLead = {
  id: string;
  product_code: string;
  product_name: string;
  batch_code: string;
  customer_name: string;
  whatsapp: string;
  city: string;
  target_fish: string;
  scanned_at: string;
  created_at: string;
};

export type CustomerLeadInput = {
  product_code: string;
  product_name: string;
  batch_code: string;
  customer_name: string;
  whatsapp: string;
  city: string;
  target_fish: string;
};

export type LeadsDashboardStats = {
  scansToday: number;
  scansThisMonth: number;
  topProduct: string | null;
  topCity: string | null;
  resellerCount: number;
  tokoPancingCount: number;
  pemancingMasCount: number;
  pemancingLeleCount: number;
};
