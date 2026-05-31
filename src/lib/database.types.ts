/**
 * Supabase Database Type Definitions
 * Generated types for all tables, views, and functions
 */

export type UserRole = 'admin' | 'analyst' | 'viewer';
export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type AlertStatus = 'open' | 'investigating' | 'resolved' | 'false_positive';
export type IncidentStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type IncidentPriority = 'critical' | 'high' | 'medium' | 'low';
export type ScanStatus = 'queued' | 'running' | 'completed' | 'failed';
export type VulnSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  department: string | null;
  is_active: boolean;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

export interface Alert {
  id: string;
  title: string;
  description: string | null;
  severity: AlertSeverity;
  status: AlertStatus;
  source: string | null;
  source_ip: string | null;
  destination_ip: string | null;
  affected_asset: string | null;
  category: string | null;
  tags: string[];
  assigned_to: string | null;
  resolved_at: string | null;
  resolved_by: string | null;
  raw_data: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ThreatEvent {
  id: string;
  event_type: string;
  severity: AlertSeverity;
  country_code: string | null;
  country_name: string | null;
  source_ip: string | null;
  target_asset: string | null;
  attack_vector: string | null;
  blocked: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface Incident {
  id: string;
  title: string;
  description: string | null;
  status: IncidentStatus;
  priority: IncidentPriority;
  category: string | null;
  affected_systems: string[];
  assigned_to: string | null;
  created_by: string;
  resolved_at: string | null;
  resolution_notes: string | null;
  alert_ids: string[];
  timeline: TimelineEntry[];
  created_at: string;
  updated_at: string;
}

export interface TimelineEntry {
  timestamp: string;
  action: string;
  user: string;
  notes: string;
}

export interface ScanReport {
  id: string;
  user_id: string;
  target: string;
  target_type: string;
  status: ScanStatus;
  progress: number;
  findings: VulnerabilityFinding[];
  summary: ScanSummary;
  risk_score: number;
  scan_duration: number | null;
  scanner_version: string;
  error_message: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface VulnerabilityFinding {
  id: string;
  title: string;
  description: string;
  severity: VulnSeverity;
  cvss_score: number;
  cvss_vector: string;
  cve_ids: string[];
  affected_component: string;
  remediation: string;
  references: string[];
  proof_of_concept: string;
}

export interface ScanSummary {
  critical: number;
  high: number;
  medium: number;
  low: number;
  info: number;
  total: number;
}

export interface PasswordCheck {
  id: string;
  user_id: string;
  password_hash: string;
  strength_score: number | null;
  entropy_bits: number | null;
  breach_count: number;
  was_pwned: boolean;
  checked_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string | null;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  details: Record<string, unknown>;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface Report {
  id: string;
  user_id: string;
  title: string;
  report_type: string;
  date_range_start: string | null;
  date_range_end: string | null;
  filters: Record<string, unknown>;
  data: Record<string, unknown>;
  is_scheduled: boolean;
  schedule_cron: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string | null;
  type: 'info' | 'warning' | 'error' | 'success';
  is_read: boolean;
  action_url: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface InfrastructureNode {
  id: string;
  name: string;
  type: string;
  ip_address: string | null;
  status: string;
  cpu_usage: number | null;
  memory_usage: number | null;
  disk_usage: number | null;
  last_seen: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ApiKey {
  id: string;
  user_id: string;
  name: string;
  key_prefix: string;
  key_hash: string;
  permissions: string[];
  is_active: boolean;
  last_used: string | null;
  expires_at: string | null;
  created_at: string;
}

// Database interface for typed Supabase client
export type Database = {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile> };
      alerts: { Row: Alert; Insert: Partial<Alert>; Update: Partial<Alert> };
      threat_events: { Row: ThreatEvent; Insert: Partial<ThreatEvent>; Update: Partial<ThreatEvent> };
      incidents: { Row: Incident; Insert: Partial<Incident>; Update: Partial<Incident> };
      scan_reports: { Row: ScanReport; Insert: Partial<ScanReport>; Update: Partial<ScanReport> };
      password_checks: { Row: PasswordCheck; Insert: Partial<PasswordCheck>; Update: Partial<PasswordCheck> };
      activity_logs: { Row: ActivityLog; Insert: Partial<ActivityLog>; Update: Partial<ActivityLog> };
      reports: { Row: Report; Insert: Partial<Report>; Update: Partial<Report> };
      notifications: { Row: Notification; Insert: Partial<Notification>; Update: Partial<Notification> };
      infrastructure_nodes: { Row: InfrastructureNode; Insert: Partial<InfrastructureNode>; Update: Partial<InfrastructureNode> };
      api_keys: { Row: ApiKey; Insert: Partial<ApiKey>; Update: Partial<ApiKey> };
    };
  };
};
