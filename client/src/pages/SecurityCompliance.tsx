import { useState } from 'react';
import { 
  Shield, 
  Lock, 
  FileCheck, 
  Users, 
  Key, 
  Globe, 
  Server,
  Database,
  CheckCircle,
  ExternalLink,
  Download,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

// Security documentation content for download
const SECURITY_DOC_CONTENT = `
C360 EXPERIENCE SUITE — SECURITY & COMPLIANCE DOCUMENTATION
============================================================
Version: 1.0 | Last Updated: December 2024

1. CERTIFICATIONS & STANDARDS
-----------------------------
✓ ISO/IEC 27001 — Information Security Management System (Compliant)
✓ SOC 2 Type II — Security, Availability, Confidentiality (Compliant)
✓ GDPR — EU General Data Protection Regulation (Compliant)
✓ CCPA — California Consumer Privacy Act (Compliant)

2. DATA ENCRYPTION
------------------
• Data at Rest: AES-256-GCM (256-bit)
• Data in Transit: TLS 1.3 (256-bit)
• Database Fields: AES-256-CBC (256-bit)
• Passwords: bcrypt with cost factor 12

Key Management:
• HSM-backed key storage (AWS KMS / GCP Cloud KMS)
• Automatic key rotation every 90 days

3. SYSTEM ARCHITECTURE
----------------------
• Cloud Providers: AWS / GCP (SOC 2 Compliant)
• Regions: US, EU, APAC
• Load Balancing: TLS 1.3 termination
• DDoS Protection: Enabled
• Web Application Firewall: Enabled
• Network Isolation: Production/Staging/Development separated

4. GDPR & DATA PROTECTION
-------------------------
GDPR Roles:
• Data Controller: Your Organization
• Data Processor: C360 (Us)
• Sub-Processors: AWS, GCP (under DPA)

Data Subject Rights Supported:
✓ Right of Access
✓ Right to Rectification
✓ Right to Erasure
✓ Right to Portability
✓ Right to Object
✓ Right to Restrict Processing

Data Retention:
• Survey responses: 3 years (configurable)
• User accounts: Duration of contract + 90 days
• Audit logs: 7 years
• Backups: 90 days

International Data Transfers:
✓ EU-US Data Privacy Framework certified
✓ Standard Contractual Clauses (SCCs) implemented

5. ADMINISTRATION FEATURES
--------------------------
Single Sign-On (SSO):
✓ Google SSO (OAuth 2.0 / OpenID Connect)
✓ Microsoft Azure AD (SAML 2.0 / OAuth 2.0)
✓ Okta (SAML 2.0)
✓ Generic SAML 2.0 support

Role-Based Access Control (RBAC):
• Super Admin: Full system access
• Admin: Dashboard, surveys, reporting
• Manager: Team analytics, export
• Analyst: Read-only analytics
• Viewer: Limited dashboard access

Custom roles with granular permissions available for Enterprise.

Audit Logging:
• All login/logout events with IP and user agent
• Data access and export actions
• Configuration and role changes
• Logs retained for 7 years, immutable

6. API & INTEGRATIONS
---------------------
RESTful API:
• Authentication: OAuth 2.0 Bearer tokens
• Rate Limiting: 1000 requests/minute
• Documentation: OpenAPI 3.0 specification

Native Integrations:
• ATS: SmartRecruiters, Greenhouse
• HRIS: Workday, SAP SuccessFactors
• Notifications: Slack, Microsoft Teams
• Automation: Zapier, Webhooks

7. INCIDENT RESPONSE
--------------------
Response Times:
• Critical (P1): 15 minutes response, 4 hours resolution
• High (P2): 1 hour response, 8 hours resolution
• Medium (P3): 4 hours response, 24 hours resolution

Data Breach Notification:
• Customer notification: Within 24 hours
• Supervisory authority: Within 72 hours (if required)

Business Continuity:
• Uptime SLA: 99.9%
• Recovery Point Objective (RPO): 1 hour
• Recovery Time Objective (RTO): 4 hours
• Backup Frequency: Every 6 hours

8. CONTACT
----------
Security Team: security@c360.io
Data Protection Officer: dpo@c360.io
Compliance Requests: compliance@c360.io

============================================================
This document is proprietary and confidential.
© 2024 C360 Experience Suite. All rights reserved.
`;

// Function to download the security documentation
const downloadSecurityDoc = () => {
  const blob = new Blob([SECURITY_DOC_CONTENT], { type: 'text/plain' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'C360_Security_Compliance_Documentation.txt';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

// ============================================
// SECURITY & COMPLIANCE PAGE
// Enterprise-grade security documentation
// ============================================

interface AccordionItemProps {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function AccordionItem({ title, icon: Icon, children, defaultOpen = false }: AccordionItemProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 bg-white hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center">
            <Icon className="w-5 h-5 text-teal-600" />
          </div>
          <span className="text-base font-semibold text-gray-900">{title}</span>
        </div>
        {isOpen ? (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-400" />
        )}
      </button>
      {isOpen && (
        <div className="p-5 pt-0 bg-white">
          <div className="pt-4 border-t border-gray-100">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

function CertificationBadge({ name, status }: { name: string; status: 'compliant' | 'pending' }) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-3">
        <CheckCircle className={`w-5 h-5 ${status === 'compliant' ? 'text-green-500' : 'text-amber-500'}`} />
        <span className="text-sm font-medium text-gray-900">{name}</span>
      </div>
      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
        status === 'compliant' 
          ? 'bg-green-100 text-green-700' 
          : 'bg-amber-100 text-amber-700'
      }`}>
        {status === 'compliant' ? 'Compliant' : 'In Progress'}
      </span>
    </div>
  );
}

export default function SecurityCompliance() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900" style={{ letterSpacing: '-0.02em' }}>
              Security & Compliance
            </h1>
            <p className="text-sm text-gray-500">Enterprise-grade security for your organization</p>
          </div>
        </div>
      </div>

      {/* Quick Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Lock className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm font-medium text-gray-700">Data Encryption</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">AES-256</p>
          <p className="text-xs text-gray-500">At rest & in transit</p>
        </div>
        
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Server className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-gray-700">Uptime SLA</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">99.9%</p>
          <p className="text-xs text-gray-500">Guaranteed availability</p>
        </div>
        
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <FileCheck className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-gray-700">Certifications</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">4</p>
          <p className="text-xs text-gray-500">Active compliance standards</p>
        </div>
      </div>

      {/* Certifications & Standards */}
      <AccordionItem title="Certifications & Standards" icon={FileCheck} defaultOpen={true}>
        <div className="space-y-3">
          <CertificationBadge name="ISO/IEC 27001 — Information Security Management" status="compliant" />
          <CertificationBadge name="SOC 2 Type II — Security, Availability, Confidentiality" status="compliant" />
          <CertificationBadge name="GDPR — EU General Data Protection Regulation" status="compliant" />
          <CertificationBadge name="CCPA — California Consumer Privacy Act" status="compliant" />
        </div>
        <p className="text-xs text-gray-500 mt-4">
          Audit reports and certifications available upon request under NDA. 
          <a href="mailto:compliance@c360.io" className="text-teal-600 hover:underline ml-1">
            Contact compliance team →
          </a>
        </p>
      </AccordionItem>

      {/* System Architecture */}
      <AccordionItem title="System Architecture" icon={Server}>
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Infrastructure</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Cloud Provider</span>
                <span className="font-medium text-gray-900">AWS / GCP</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Regions</span>
                <span className="font-medium text-gray-900">US, EU, APAC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Load Balancing</span>
                <span className="font-medium text-gray-900">TLS 1.3</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">DDoS Protection</span>
                <span className="font-medium text-gray-900">Enabled</span>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Network Security</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Web Application Firewall (WAF) enabled
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                HTTPS-only with HSTS headers
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Network isolation between environments
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Regular penetration testing
              </li>
            </ul>
          </div>
        </div>
      </AccordionItem>

      {/* Data Encryption */}
      <AccordionItem title="Encryption & Key Management" icon={Key}>
        <div className="space-y-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 text-gray-500 font-medium">Data State</th>
                <th className="text-left py-2 text-gray-500 font-medium">Algorithm</th>
                <th className="text-left py-2 text-gray-500 font-medium">Key Length</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-3 text-gray-900">Data at Rest</td>
                <td className="py-3 text-gray-700">AES-256-GCM</td>
                <td className="py-3 text-gray-700">256-bit</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 text-gray-900">Data in Transit</td>
                <td className="py-3 text-gray-700">TLS 1.3</td>
                <td className="py-3 text-gray-700">256-bit</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 text-gray-900">Database Fields</td>
                <td className="py-3 text-gray-700">AES-256-CBC</td>
                <td className="py-3 text-gray-700">256-bit</td>
              </tr>
              <tr>
                <td className="py-3 text-gray-900">Passwords</td>
                <td className="py-3 text-gray-700">bcrypt</td>
                <td className="py-3 text-gray-700">Cost factor 12</td>
              </tr>
            </tbody>
          </table>
          
          <div className="bg-teal-50 rounded-lg p-4">
            <p className="text-sm text-teal-800">
              <strong>Key Management:</strong> All encryption keys are stored in HSM-backed key management (AWS KMS / GCP Cloud KMS) with automatic 90-day rotation.
            </p>
          </div>
        </div>
      </AccordionItem>

      {/* GDPR & Data Protection */}
      <AccordionItem title="GDPR & Data Protection" icon={Globe}>
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">GDPR Roles</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Data Controller</span>
                <span className="font-medium text-gray-900">Your Organization</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Data Processor</span>
                <span className="font-medium text-gray-900">C360 (Us)</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Sub-Processors</span>
                <span className="font-medium text-gray-900">AWS, GCP (under DPA)</span>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Data Subject Rights</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {[
                'Right of Access',
                'Right to Rectification',
                'Right to Erasure',
                'Right to Portability',
                'Right to Object',
                'Right to Restrict'
              ].map((right) => (
                <div key={right} className="flex items-center gap-2 text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  {right}
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">International Data Transfers</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                EU-US Data Privacy Framework certified
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Standard Contractual Clauses (SCCs) implemented
              </li>
            </ul>
          </div>
        </div>
      </AccordionItem>

      {/* Administration Features */}
      <AccordionItem title="Administration Features" icon={Users}>
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Single Sign-On (SSO)</h4>
            <div className="flex flex-wrap gap-2">
              {['Google SSO', 'Microsoft Azure AD', 'Okta', 'SAML 2.0', 'OpenID Connect'].map((sso) => (
                <span key={sso} className="inline-flex items-center gap-1 px-3 py-1.5 bg-white rounded-lg text-sm text-gray-700 border border-gray-200">
                  <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                  {sso}
                </span>
              ))}
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Role-Based Access Control (RBAC)</h4>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 text-gray-500 font-medium">Role</th>
                  <th className="text-left py-2 text-gray-500 font-medium">Permissions</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-2 font-medium text-gray-900">Super Admin</td>
                  <td className="py-2 text-gray-700">Full system access</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2 font-medium text-gray-900">Admin</td>
                  <td className="py-2 text-gray-700">Dashboard, surveys, reporting</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2 font-medium text-gray-900">Manager</td>
                  <td className="py-2 text-gray-700">Team analytics, export</td>
                </tr>
                <tr>
                  <td className="py-2 font-medium text-gray-900">Viewer</td>
                  <td className="py-2 text-gray-700">Read-only dashboard</td>
                </tr>
              </tbody>
            </table>
            <p className="text-xs text-gray-500 mt-3">Custom roles with granular permissions available for Enterprise.</p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Audit Logging</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• All login/logout events with IP and user agent</li>
              <li>• Data access and export actions</li>
              <li>• Configuration and role changes</li>
              <li>• Logs retained for 7 years</li>
            </ul>
          </div>
        </div>
      </AccordionItem>

      {/* API & Integrations */}
      <AccordionItem title="API & Integrations" icon={Database}>
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">RESTful API</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-500" />
                OAuth 2.0 authentication
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-500" />
                OpenAPI 3.0 documentation
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Rate limiting (1000 req/min)
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Webhook support
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Native Integrations</h4>
            <div className="flex flex-wrap gap-2">
              {['SmartRecruiters', 'Greenhouse', 'Workday', 'SAP SuccessFactors', 'Slack', 'Microsoft Teams', 'Zapier'].map((integration) => (
                <span key={integration} className="px-3 py-1.5 bg-white rounded-lg text-sm text-gray-700 border border-gray-200">
                  {integration}
                </span>
              ))}
            </div>
          </div>
        </div>
      </AccordionItem>

      {/* Download & Contact Section */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold mb-1">Need More Details?</h3>
            <p className="text-sm text-slate-300">Download our full security documentation or contact our compliance team.</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={downloadSecurityDoc}
              className="flex items-center gap-2 px-4 py-2.5 bg-white text-slate-900 rounded-lg text-sm font-medium hover:bg-slate-100 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download Doc
            </button>
            <a 
              href="mailto:security@c360.io"
              className="flex items-center gap-2 px-4 py-2.5 bg-teal-500 text-white rounded-lg text-sm font-medium hover:bg-teal-600 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Contact Security
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <p className="text-center text-xs text-gray-400 pt-4">
        Last updated: December 2024 • Version 1.0
      </p>
    </div>
  );
}

