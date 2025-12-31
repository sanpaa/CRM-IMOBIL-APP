export interface CustomDomain {
  id: string;
  company_id: string;
  domain: string;
  subdomain?: string;
  is_primary: boolean;
  is_subdomain_auto: boolean; // True for automatic subdomains (e.g., company.yoursite.com)
  dns_configured: boolean;
  verification_token?: string;
  verified_at?: string;
  status: 'pending' | 'verified' | 'active' | 'failed' | 'disabled';
  created_at: string;
  updated_at: string;
}

export interface DomainVerification {
  domain: string;
  token: string;
  verified: boolean;
  dns_records: DnsRecord[];
}

export interface DnsRecord {
  type: 'A' | 'CNAME' | 'TXT';
  host: string;
  value: string;
  ttl: number;
}
