import { useState } from 'react';
import { FileText, Download, Plus, X, BarChart2, Shield, Siren, Globe, FileCheck } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { mockAlerts, mockIncidents, mockScanReports, STATS, geoThreatData, weeklyThreatData } from '@/lib/mockData';
import { formatDate, timeAgo } from '@/lib/utils';
import { toast } from 'sonner';

const REPORT_TYPES = [
  { id: 'executive', label: 'Executive Summary', icon: <BarChart2 size={16} />, color: 'text-cyan-400', desc: 'High-level security posture overview for leadership' },
  { id: 'vulnerability', label: 'Vulnerability Report', icon: <Shield size={16} />, color: 'text-orange-400', desc: 'Detailed vulnerability findings with CVSS scores' },
  { id: 'incident', label: 'Incident Report', icon: <Siren size={16} />, color: 'text-red-400', desc: 'Incident timeline, impact and resolution details' },
  { id: 'threat', label: 'Threat Intelligence', icon: <Globe size={16} />, color: 'text-purple-400', desc: 'Geo-threat analysis and attack pattern report' },
  { id: 'compliance', label: 'Compliance Report', icon: <FileCheck size={16} />, color: 'text-green-400', desc: 'SOC2, NIST, ISO 27001 compliance status' },
];

interface SavedReport {
  id: string;
  title: string;
  type: string;
  created_at: string;
  size: string;
}

const SAVED_REPORTS: SavedReport[] = [
  { id: 'r-001', title: 'Executive Summary — May 2025', type: 'executive', created_at: new Date(Date.now() - 86400000 * 3).toISOString(), size: '2.4 MB' },
  { id: 'r-002', title: 'Q2 Vulnerability Assessment', type: 'vulnerability', created_at: new Date(Date.now() - 86400000 * 7).toISOString(), size: '5.8 MB' },
  { id: 'r-003', title: 'DDoS Incident Post-Mortem', type: 'incident', created_at: new Date(Date.now() - 86400000 * 2).toISOString(), size: '1.2 MB' },
  { id: 'r-004', title: 'Monthly Threat Intelligence', type: 'threat', created_at: new Date(Date.now() - 86400000 * 10).toISOString(), size: '3.7 MB' },
];

function generateReportContent(type: string, title: string) {
  const now = new Date();
  const criticalAlerts = mockAlerts.filter((a) => a.severity === 'critical').length;
  const openIncidents = mockIncidents.filter((i) => i.status !== 'resolved' && i.status !== 'closed').length;

  let content = `SENTINEL Security Operations Center\n`;
  content += `${'═'.repeat(50)}\n`;
  content += `${title}\n`;
  content += `Generated: ${now.toISOString()}\n`;
  content += `Classification: CONFIDENTIAL\n`;
  content += `${'═'.repeat(50)}\n\n`;

  if (type === 'executive') {
    content += `EXECUTIVE SUMMARY\n${'─'.repeat(40)}\n\n`;
    content += `Security Posture: ELEVATED RISK (Score: ${STATS.riskScore}/100)\n\n`;
    content += `KEY METRICS (Last 24 Hours)\n`;
    content += `• Total Threats Detected: ${STATS.totalThreats.toLocaleString()}\n`;
    content += `• Threats Blocked: ${STATS.blockedAttacks.toLocaleString()} (${((STATS.blockedAttacks/STATS.totalThreats)*100).toFixed(1)}%)\n`;
    content += `• Active Alerts: ${STATS.activeAlerts} (${STATS.criticalAlerts} Critical)\n`;
    content += `• Open Incidents: ${openIncidents}\n`;
    content += `• Assets Monitored: ${STATS.assetsMonitored}\n\n`;
    content += `TOP THREATS\n`;
    mockAlerts.filter((a) => a.severity === 'critical').forEach((a) => {
      content += `• [CRITICAL] ${a.title} — ${a.source} → ${a.affected_asset ?? 'N/A'}\n`;
    });
    content += `\nGEO THREAT ORIGINS (Top 5)\n`;
    geoThreatData.slice(0, 5).forEach((g, i) => {
      content += `${i + 1}. ${g.country}: ${g.attacks.toLocaleString()} attacks\n`;
    });
    content += `\nWEEKLY TREND SUMMARY\n`;
    weeklyThreatData.forEach((d) => {
      content += `${d.day}: ${d.threats} threats, ${d.blocked} blocked, ${d.incidents} incidents\n`;
    });
  } else if (type === 'vulnerability') {
    content += `VULNERABILITY ASSESSMENT REPORT\n${'─'.repeat(40)}\n\n`;
    mockScanReports.forEach((scan) => {
      content += `Target: ${scan.target} (${scan.target_type})\n`;
      content += `Risk Score: ${scan.risk_score}/100\n`;
      content += `Scanned: ${formatDate(scan.created_at)}\n`;
      content += `Summary: ${scan.summary.critical}C ${scan.summary.high}H ${scan.summary.medium}M ${scan.summary.low}L\n\n`;
      scan.findings.forEach((f) => {
        content += `  ▸ [${f.severity.toUpperCase()}] CVSS ${f.cvss_score} — ${f.title}\n`;
        content += `    CVEs: ${f.cve_ids.join(', ') || 'N/A'}\n`;
        content += `    Component: ${f.affected_component}\n`;
        content += `    Remediation: ${f.remediation}\n\n`;
      });
    });
  } else if (type === 'incident') {
    content += `INCIDENT MANAGEMENT REPORT\n${'─'.repeat(40)}\n\n`;
    mockIncidents.forEach((inc) => {
      content += `Incident: ${inc.title}\n`;
      content += `Priority: ${inc.priority.toUpperCase()} | Status: ${inc.status}\n`;
      content += `Category: ${inc.category ?? 'N/A'}\n`;
      content += `Affected Systems: ${inc.affected_systems.join(', ')}\n`;
      content += `Created: ${formatDate(inc.created_at)}\n`;
      if (inc.resolution_notes) content += `Resolution: ${inc.resolution_notes}\n`;
      content += `Timeline (${inc.timeline.length} entries)\n`;
      inc.timeline.forEach((t) => {
        content += `  [${new Date(t.timestamp).toLocaleString()}] ${t.action} — ${t.notes}\n`;
      });
      content += '\n';
    });
  } else if (type === 'threat') {
    content += `THREAT INTELLIGENCE REPORT\n${'─'.repeat(40)}\n\n`;
    content += `ATTACK ORIGIN ANALYSIS\n`;
    geoThreatData.forEach((g, i) => {
      const pct = ((g.attacks / geoThreatData[0].attacks) * 100).toFixed(1);
      content += `${String(i + 1).padStart(2)} ${g.flag} ${g.country.padEnd(20)} ${String(g.attacks).padStart(6)} attacks (${pct}% of max)\n`;
    });
    content += `\nALERT SEVERITY BREAKDOWN\n`;
    ['critical', 'high', 'medium', 'low'].forEach((sev) => {
      const count = mockAlerts.filter((a) => a.severity === sev).length;
      content += `${sev.toUpperCase().padEnd(10)}: ${count} alerts\n`;
    });
  } else if (type === 'compliance') {
    content += `COMPLIANCE STATUS REPORT\n${'─'.repeat(40)}\n\n`;
    const frameworks = [
      { name: 'SOC2 Type II', score: 82, status: 'COMPLIANT' },
      { name: 'NIST CSF', score: 74, status: 'PARTIAL' },
      { name: 'ISO 27001', score: 79, status: 'PARTIAL' },
      { name: 'PCI DSS v4', score: 91, status: 'COMPLIANT' },
      { name: 'HIPAA', score: 68, status: 'PARTIAL' },
    ];
    frameworks.forEach((f) => {
      content += `${f.name.padEnd(20)} Score: ${f.score}/100  Status: ${f.status}\n`;
    });
    content += `\nKEY FINDINGS\n`;
    content += `• ${criticalAlerts} critical vulnerabilities require immediate remediation\n`;
    content += `• ${openIncidents} open incidents affecting compliance posture\n`;
    content += `• Password policy does not meet NIST SP 800-63B requirements\n`;
    content += `• Multi-factor authentication not enforced on all admin accounts\n`;
    content += `• Vulnerability scanning frequency below quarterly requirement\n`;
  }

  content += `\n${'═'.repeat(50)}\n`;
  content += `Report generated by SENTINEL v1.0.0\n`;
  content += `Classification: CONFIDENTIAL — Do not distribute\n`;

  return content;
}

function GenerateModal({ onClose, onGenerate }: { onClose: () => void; onGenerate: (type: string, title: string) => void }) {
  const [selectedType, setSelectedType] = useState('executive');
  const [title, setTitle] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const selectedTypeInfo = REPORT_TYPES.find((t) => t.id === selectedType);

  const handleGenerate = () => {
    const reportTitle = title || `${selectedTypeInfo?.label} — ${new Date().toLocaleDateString()}`;
    onGenerate(selectedType, reportTitle);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="cyber-card w-full max-w-lg border border-cyan-500/20">
        <div className="flex items-center justify-between p-4 border-b border-cyan-500/10">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <FileText size={14} className="text-cyan-400" />
            Generate Report
          </h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300"><X size={16} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs text-slate-400 uppercase font-mono mb-2">Report Type</label>
            <div className="grid grid-cols-1 gap-2">
              {REPORT_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`flex items-center gap-3 p-2.5 rounded border text-left transition-all ${
                    selectedType === type.id
                      ? 'border-cyan-500/40 bg-cyan-500/8'
                      : 'border-cyan-500/10 hover:border-cyan-500/25'
                  }`}
                >
                  <span className={type.color}>{type.icon}</span>
                  <div>
                    <p className="text-xs font-medium text-slate-200">{type.label}</p>
                    <p className="text-[10px] text-slate-500">{type.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-400 uppercase font-mono mb-1.5">Report Title (optional)</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="cyber-input text-sm"
              placeholder={`${selectedTypeInfo?.label} — ${new Date().toLocaleDateString()}`}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 uppercase font-mono mb-1.5">Date From</label>
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="cyber-input text-sm" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 uppercase font-mono mb-1.5">Date To</label>
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="cyber-input text-sm" />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="primary" onClick={handleGenerate} icon={<FileText size={13} />}>Generate Report</Button>
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Reports() {
  const [showModal, setShowModal] = useState(false);
  const [savedReports, setSavedReports] = useState(SAVED_REPORTS);
  const [generating, setGenerating] = useState<string | null>(null);

  const handleGenerate = async (type: string, title: string) => {
    setGenerating(type);
    await new Promise((r) => setTimeout(r, 1500));

    // Generate and download report
    const content = generateReportContent(type, title);
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sentinel_report_${type}_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);

    const newReport: SavedReport = {
      id: `r-${Date.now()}`,
      title,
      type,
      created_at: new Date().toISOString(),
      size: `${(content.length / 1024).toFixed(1)} KB`,
    };
    setSavedReports((prev) => [newReport, ...prev]);
    setGenerating(null);
    toast.success('Report generated and downloaded');
  };

  const handleDownload = (report: SavedReport) => {
    const content = generateReportContent(report.type, report.title);
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${report.title.replace(/\s+/g, '_')}.txt`;
    link.click();
    toast.success('Report downloaded');
  };

  const typeInfo = (type: string) => REPORT_TYPES.find((t) => t.id === type);

  return (
    <div className="flex flex-col">
      <Header title="Reports" subtitle="Generate and export security reports" />
      <div className="p-6 space-y-6">
        {/* Quick Generate */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus size={14} className="text-cyan-400" />
              Quick Generate
            </CardTitle>
          </CardHeader>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {REPORT_TYPES.map((type) => (
              <button
                key={type.id}
                onClick={async () => {
                  setGenerating(type.id);
                  await handleGenerate(type.id, `${type.label} — ${new Date().toLocaleDateString()}`);
                }}
                disabled={!!generating}
                className="flex flex-col items-center gap-2 p-4 rounded-lg border border-cyan-500/10 hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all group disabled:opacity-50"
              >
                {generating === type.id ? (
                  <span className="w-5 h-5 border-2 border-current/30 border-t-current rounded-full animate-spin" style={{ color: type.color.replace('text-', '').replace('-400', '') }} />
                ) : (
                  <span className={type.color}>{type.icon}</span>
                )}
                <span className="text-xs text-slate-400 group-hover:text-slate-200 text-center transition-colors">
                  {type.label}
                </span>
              </button>
            ))}
          </div>
        </Card>

        {/* Custom Report Generator */}
        <div className="flex justify-between items-center">
          <div />
          <Button variant="primary" icon={<Plus size={13} />} onClick={() => setShowModal(true)}>
            Custom Report
          </Button>
        </div>

        {/* Saved Reports */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText size={14} className="text-cyan-400" />
              Generated Reports
            </CardTitle>
            <span className="text-xs text-slate-500 font-mono">{savedReports.length} reports</span>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="cyber-table">
              <thead>
                <tr>
                  <th>Report Title</th>
                  <th>Type</th>
                  <th>Size</th>
                  <th>Generated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {savedReports.map((report) => {
                  const info = typeInfo(report.type);
                  return (
                    <tr key={report.id}>
                      <td>
                        <div className="flex items-center gap-2">
                          <span className={info?.color}>{info?.icon}</span>
                          <span className="text-xs text-slate-200">{report.title}</span>
                        </div>
                      </td>
                      <td>
                        <Badge variant="info">{info?.label ?? report.type}</Badge>
                      </td>
                      <td><span className="text-xs font-mono text-slate-400">{report.size}</span></td>
                      <td><span className="text-xs text-slate-400">{timeAgo(report.created_at)}</span></td>
                      <td>
                        <Button variant="ghost" size="sm" icon={<Download size={12} />} onClick={() => handleDownload(report)}>
                          Download
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
      {showModal && (
        <GenerateModal onClose={() => setShowModal(false)} onGenerate={handleGenerate} />
      )}
    </div>
  );
}
