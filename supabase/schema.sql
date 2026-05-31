-- ============================================================
-- SENTINEL - Cyber Security Operations Dashboard
-- Supabase PostgreSQL Schema
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE user_role AS ENUM ('admin', 'analyst', 'viewer');
CREATE TYPE alert_severity AS ENUM ('critical', 'high', 'medium', 'low', 'info');
CREATE TYPE alert_status AS ENUM ('open', 'investigating', 'resolved', 'false_positive');
CREATE TYPE incident_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');
CREATE TYPE incident_priority AS ENUM ('critical', 'high', 'medium', 'low');
CREATE TYPE scan_status AS ENUM ('queued', 'running', 'completed', 'failed');
CREATE TYPE vuln_severity AS ENUM ('critical', 'high', 'medium', 'low', 'info');

-- ============================================================
-- USER PROFILES & ROLES
-- ============================================================

-- User profiles (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role user_role NOT NULL DEFAULT 'viewer',
  department TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- API Keys table
CREATE TABLE public.api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key_prefix TEXT NOT NULL, -- First 8 chars for display
  key_hash TEXT NOT NULL,   -- Hashed full key
  permissions TEXT[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_used TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ALERTS & THREATS
-- ============================================================

-- Security alerts
CREATE TABLE public.alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  severity alert_severity NOT NULL DEFAULT 'medium',
  status alert_status NOT NULL DEFAULT 'open',
  source TEXT,           -- e.g., 'IDS', 'Firewall', 'SIEM'
  source_ip INET,
  destination_ip INET,
  affected_asset TEXT,
  category TEXT,         -- e.g., 'Malware', 'Intrusion', 'DDoS'
  tags TEXT[] DEFAULT '{}',
  assigned_to UUID REFERENCES public.profiles(id),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES public.profiles(id),
  raw_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Threat intelligence feed
CREATE TABLE public.threat_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL,
  severity alert_severity NOT NULL DEFAULT 'medium',
  country_code TEXT,
  country_name TEXT,
  source_ip INET,
  target_asset TEXT,
  attack_vector TEXT,
  blocked BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INCIDENTS
-- ============================================================

CREATE TABLE public.incidents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  status incident_status NOT NULL DEFAULT 'open',
  priority incident_priority NOT NULL DEFAULT 'medium',
  category TEXT,
  affected_systems TEXT[] DEFAULT '{}',
  assigned_to UUID REFERENCES public.profiles(id),
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  alert_ids UUID[] DEFAULT '{}',
  timeline JSONB DEFAULT '[]', -- Array of {timestamp, action, user, notes}
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- VULNERABILITY SCANNER
-- ============================================================

CREATE TABLE public.scan_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  target TEXT NOT NULL,       -- Domain, IP, or URL
  target_type TEXT NOT NULL,  -- 'domain', 'ip', 'url'
  status scan_status NOT NULL DEFAULT 'queued',
  progress INTEGER DEFAULT 0,
  findings JSONB DEFAULT '[]', -- Array of vulnerability findings
  summary JSONB DEFAULT '{}',  -- {critical, high, medium, low, info, total}
  risk_score INTEGER DEFAULT 0, -- 0-100
  scan_duration INTEGER,        -- in seconds
  scanner_version TEXT DEFAULT '1.0.0',
  error_message TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PASSWORD ANALYZER
-- ============================================================

CREATE TABLE public.password_checks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  password_hash TEXT NOT NULL, -- SHA-1 prefix for HIBP check (NEVER store plain)
  strength_score INTEGER,       -- 0-4 (zxcvbn score)
  entropy_bits FLOAT,
  breach_count INTEGER DEFAULT 0,
  was_pwned BOOLEAN DEFAULT false,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ACTIVITY LOGS
-- ============================================================

CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- REPORTS
-- ============================================================

CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  report_type TEXT NOT NULL, -- 'vulnerability', 'incident', 'threat', 'compliance', 'executive'
  date_range_start TIMESTAMPTZ,
  date_range_end TIMESTAMPTZ,
  filters JSONB DEFAULT '{}',
  data JSONB DEFAULT '{}',
  is_scheduled BOOLEAN DEFAULT false,
  schedule_cron TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================

CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT,
  type TEXT DEFAULT 'info', -- 'info', 'warning', 'error', 'success'
  is_read BOOLEAN DEFAULT false,
  action_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INFRASTRUCTURE HEALTH
-- ============================================================

CREATE TABLE public.infrastructure_nodes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,     -- 'server', 'firewall', 'router', 'database', 'endpoint'
  ip_address INET,
  status TEXT DEFAULT 'online', -- 'online', 'degraded', 'offline', 'maintenance'
  cpu_usage FLOAT,
  memory_usage FLOAT,
  disk_usage FLOAT,
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_alerts_severity ON public.alerts(severity);
CREATE INDEX idx_alerts_status ON public.alerts(status);
CREATE INDEX idx_alerts_created_at ON public.alerts(created_at DESC);
CREATE INDEX idx_threat_events_created_at ON public.threat_events(created_at DESC);
CREATE INDEX idx_scan_reports_user_id ON public.scan_reports(user_id);
CREATE INDEX idx_scan_reports_created_at ON public.scan_reports(created_at DESC);
CREATE INDEX idx_incidents_status ON public.incidents(status);
CREATE INDEX idx_incidents_priority ON public.incidents(priority);
CREATE INDEX idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON public.activity_logs(created_at DESC);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.threat_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scan_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.infrastructure_nodes ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID DEFAULT auth.uid())
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE id = user_id;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Profiles RLS
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (id = auth.uid());
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (get_user_role() = 'admin');
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Admins can update any profile" ON public.profiles
  FOR UPDATE USING (get_user_role() = 'admin');

-- Alerts RLS (Analysts and Admins can see all, viewers read-only)
CREATE POLICY "Authenticated users can view alerts" ON public.alerts
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Analysts and Admins can insert alerts" ON public.alerts
  FOR INSERT WITH CHECK (get_user_role() IN ('admin', 'analyst'));
CREATE POLICY "Analysts and Admins can update alerts" ON public.alerts
  FOR UPDATE USING (get_user_role() IN ('admin', 'analyst'));
CREATE POLICY "Admins can delete alerts" ON public.alerts
  FOR DELETE USING (get_user_role() = 'admin');

-- Threat Events RLS
CREATE POLICY "Authenticated users can view threat events" ON public.threat_events
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins and analysts can insert threat events" ON public.threat_events
  FOR INSERT WITH CHECK (get_user_role() IN ('admin', 'analyst'));

-- Incidents RLS
CREATE POLICY "Authenticated users can view incidents" ON public.incidents
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Analysts and Admins can manage incidents" ON public.incidents
  FOR ALL USING (get_user_role() IN ('admin', 'analyst'));

-- Scan Reports RLS (users see only their own)
CREATE POLICY "Users can view own scan reports" ON public.scan_reports
  FOR SELECT USING (user_id = auth.uid() OR get_user_role() = 'admin');
CREATE POLICY "Analysts and Admins can create scans" ON public.scan_reports
  FOR INSERT WITH CHECK (user_id = auth.uid() AND get_user_role() IN ('admin', 'analyst'));
CREATE POLICY "Users can update own scans" ON public.scan_reports
  FOR UPDATE USING (user_id = auth.uid() OR get_user_role() = 'admin');

-- Password Checks RLS
CREATE POLICY "Users can view own password checks" ON public.password_checks
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own password checks" ON public.password_checks
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Activity Logs RLS
CREATE POLICY "Users can view own activity logs" ON public.activity_logs
  FOR SELECT USING (user_id = auth.uid() OR get_user_role() = 'admin');
CREATE POLICY "System can insert activity logs" ON public.activity_logs
  FOR INSERT WITH CHECK (true);

-- Notifications RLS
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "System can insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);

-- Infrastructure Nodes RLS
CREATE POLICY "Authenticated users can view nodes" ON public.infrastructure_nodes
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage nodes" ON public.infrastructure_nodes
  FOR ALL USING (get_user_role() = 'admin');

-- API Keys RLS
CREATE POLICY "Users can view own api keys" ON public.api_keys
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can manage own api keys" ON public.api_keys
  FOR ALL USING (user_id = auth.uid());

-- Reports RLS
CREATE POLICY "Users can view own reports" ON public.reports
  FOR SELECT USING (user_id = auth.uid() OR get_user_role() = 'admin');
CREATE POLICY "Users can manage own reports" ON public.reports
  FOR ALL USING (user_id = auth.uid());

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'viewer'::user_role
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_alerts_updated_at BEFORE UPDATE ON public.alerts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_incidents_updated_at BEFORE UPDATE ON public.incidents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_nodes_updated_at BEFORE UPDATE ON public.infrastructure_nodes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- SEED DATA (Demo)
-- ============================================================

-- Infrastructure nodes
INSERT INTO public.infrastructure_nodes (name, type, ip_address, status, cpu_usage, memory_usage, disk_usage) VALUES
  ('PROD-WEB-01', 'server', '10.0.1.10', 'online', 45.2, 62.8, 71.3),
  ('PROD-DB-01', 'database', '10.0.1.20', 'online', 28.9, 78.4, 55.6),
  ('PROD-FW-01', 'firewall', '10.0.0.1', 'online', 12.1, 34.2, 22.1),
  ('PROD-LB-01', 'router', '10.0.0.5', 'degraded', 89.3, 91.2, 44.8),
  ('PROD-CACHE-01', 'server', '10.0.1.30', 'online', 33.7, 48.9, 38.2),
  ('CORP-VPN-01', 'server', '10.0.2.10', 'offline', 0.0, 0.0, 0.0),
  ('MONITORING-01', 'server', '10.0.3.10', 'online', 22.4, 56.1, 29.7),
  ('BACKUP-01', 'server', '10.0.4.10', 'maintenance', 5.2, 18.3, 92.4);

-- Sample alerts
INSERT INTO public.alerts (title, description, severity, status, source, source_ip, category, tags) VALUES
  ('Brute Force Attack Detected', 'Multiple failed login attempts from 203.0.113.45', 'critical', 'open', 'IDS', '203.0.113.45', 'Intrusion', ARRAY['brute-force', 'authentication']),
  ('Suspicious Outbound Traffic', 'Unusual data exfiltration pattern detected on port 4444', 'high', 'investigating', 'Firewall', '10.0.1.25', 'Data Exfiltration', ARRAY['exfiltration', 'c2']),
  ('SQL Injection Attempt', 'Web application firewall blocked SQL injection attempt', 'high', 'resolved', 'WAF', '198.51.100.23', 'Web Attack', ARRAY['sqli', 'web']),
  ('Ransomware Signature Detected', 'File encryption behavior consistent with ransomware on WORKSTATION-07', 'critical', 'open', 'EDR', '10.0.5.45', 'Malware', ARRAY['ransomware', 'malware']),
  ('Port Scan Detected', 'Systematic port scanning from external IP', 'medium', 'open', 'IDS', '45.33.32.156', 'Reconnaissance', ARRAY['scan', 'recon']),
  ('Privilege Escalation Attempt', 'User account attempted to elevate privileges', 'high', 'open', 'SIEM', '10.0.1.15', 'Privilege Abuse', ARRAY['privilege-escalation']),
  ('DDoS Attack Mitigated', 'Volumetric DDoS attack mitigated by upstream provider', 'high', 'resolved', 'Firewall', '0.0.0.0', 'DDoS', ARRAY['ddos', 'availability']),
  ('Phishing Email Detected', 'Phishing email with malicious attachment blocked', 'medium', 'resolved', 'Email Gateway', NULL, 'Phishing', ARRAY['phishing', 'email']),
  ('Outdated SSL Certificate', 'SSL certificate on api.internal expires in 7 days', 'low', 'open', 'Certificate Monitor', NULL, 'Configuration', ARRAY['ssl', 'certificate']),
  ('Anomalous Login Location', 'User admin@corp.com logged in from unexpected location: North Korea', 'critical', 'investigating', 'UEBA', '175.45.176.0', 'Identity', ARRAY['anomaly', 'identity']);

-- Sample threat events
INSERT INTO public.threat_events (event_type, severity, country_code, country_name, source_ip, target_asset, attack_vector, blocked) VALUES
  ('Brute Force', 'high', 'CN', 'China', '118.25.6.39', 'SSH:22', 'Network', true),
  ('SQL Injection', 'critical', 'RU', 'Russia', '95.213.121.200', 'web-app/api', 'Application', true),
  ('Port Scan', 'medium', 'US', 'United States', '104.21.45.87', 'All Ports', 'Network', false),
  ('Malware Download', 'critical', 'KP', 'North Korea', '175.45.176.4', 'endpoint-07', 'Email', false),
  ('DDoS', 'high', 'BR', 'Brazil', '189.1.1.50', 'web-frontend', 'Network', true),
  ('Phishing', 'medium', 'NG', 'Nigeria', '41.58.68.99', 'email-gateway', 'Email', true),
  ('XSS Attack', 'medium', 'IN', 'India', '49.207.48.75', 'customer-portal', 'Application', true),
  ('Credential Stuffing', 'high', 'UA', 'Ukraine', '91.134.188.129', 'auth-service', 'Application', false),
  ('Zero-day Exploit', 'critical', 'IR', 'Iran', '185.220.101.46', 'vpn-gateway', 'Network', false),
  ('Ransomware C2', 'critical', 'CN', 'China', '36.110.171.58', 'workstation-07', 'Network', false);

-- Sample incidents  
-- (Will be inserted after profile exists in real app)
