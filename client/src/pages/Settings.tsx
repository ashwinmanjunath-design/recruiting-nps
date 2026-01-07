import { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Users, 
  Shield, 
  Database, 
  Upload, 
  Mail, 
  Key, 
  Globe,
  Plus,
  Edit2,
  Trash2,
  Download,
  RefreshCw,
  CheckCircle,
  X
} from 'lucide-react';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('general');
  const [recruiters, setRecruiters] = useState([
    { id: '1', name: 'Sarah K.', email: 'sarah.k@company.com', role: 'Senior Recruiter', active: true },
    { id: '2', name: 'John Doe', email: 'john.doe@company.com', role: 'Recruiter', active: true },
    { id: '3', name: 'Emily Chen', email: 'emily.chen@company.com', role: 'Recruiting Manager', active: false }
  ]);
  const [showAddRecruiterModal, setShowAddRecruiterModal] = useState(false);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // SmartRecruiters settings
  const [srSettings, setSrSettings] = useState({
    apiKey: '••••••••••••••••••••••••sk_live_123',
    apiUrl: 'https://api.smartrecruiters.com',
    webhookUrl: 'https://your-app.com/api/webhooks/smartrecruiters',
    autoSync: true,
    syncInterval: '15', // minutes
    lastSync: '2 minutes ago',
    connected: true
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleProcessBulkUpload = () => {
    if (uploadedFile) {
      console.log('Processing file:', uploadedFile.name);
      // Process CSV/Excel file
      setShowBulkUploadModal(false);
      setUploadedFile(null);
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'users', label: 'Users & Recruiters', icon: Users },
    { id: 'roles', label: 'Roles & Permissions', icon: Shield },
    { id: 'smartrecruiters', label: 'SmartRecruiters', icon: Database },
    { id: 'bulk-upload', label: 'Bulk Upload', icon: Upload },
    { id: 'notifications', label: 'Email & SMS', icon: Mail },
    { id: 'api', label: 'API Keys', icon: Key }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Settings & Administration</h2>
          <p className="text-gray-600 mt-1">Manage system configuration, users, and integrations</p>
        </div>
        <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center space-x-2">
          <RefreshCw className="w-4 h-4" />
          <span>Sync Now</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {/* General Settings */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">General Configuration</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                    <input type="text" defaultValue="Your Company" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Time Zone</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                      <option>UTC-8 (PST)</option>
                      <option>UTC-5 (EST)</option>
                      <option>UTC+0 (GMT)</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Default Survey Expiry (Days)</label>
                  <input type="number" defaultValue="30" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-primary rounded" />
                    <span className="text-sm text-gray-700">Enable automatic survey reminders</span>
                  </label>
                </div>
              </div>
              <button className="mt-6 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark">
                Save Changes
              </button>
            </div>
          </div>
        )}

        {/* Users & Recruiters */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Recruiters & Users</h3>
                <button 
                  onClick={() => setShowAddRecruiterModal(true)}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Recruiter</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Name</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Email</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Role</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recruiters.map((recruiter) => (
                      <tr key={recruiter.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm text-gray-900">{recruiter.name}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{recruiter.email}</td>
                        <td className="py-3 px-4 text-sm text-gray-900">{recruiter.role}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                            recruiter.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {recruiter.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <button className="text-blue-600 hover:text-blue-800">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button className="text-red-600 hover:text-red-800">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Roles & Permissions */}
        {activeTab === 'roles' && (
          <div className="space-y-6">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Role Management</h3>
              <div className="space-y-4">
                {['Admin', 'Recruiting Manager', 'Senior Recruiter', 'Recruiter', 'Viewer'].map((role) => (
                  <div key={role} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900">{role}</h4>
                      <button className="text-sm text-blue-600 hover:text-blue-800">Edit</button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <label className="flex items-center space-x-2 text-sm">
                        <input type="checkbox" defaultChecked={role === 'Admin'} className="w-4 h-4 text-primary rounded" />
                        <span>View Dashboard</span>
                      </label>
                      <label className="flex items-center space-x-2 text-sm">
                        <input type="checkbox" defaultChecked={role === 'Admin' || role === 'Recruiting Manager'} className="w-4 h-4 text-primary rounded" />
                        <span>Manage Surveys</span>
                      </label>
                      <label className="flex items-center space-x-2 text-sm">
                        <input type="checkbox" defaultChecked={role === 'Admin'} className="w-4 h-4 text-primary rounded" />
                        <span>Edit Settings</span>
                      </label>
                      <label className="flex items-center space-x-2 text-sm">
                        <input type="checkbox" defaultChecked={role === 'Admin'} className="w-4 h-4 text-primary rounded" />
                        <span>Manage Users</span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SmartRecruiters Integration */}
        {activeTab === 'smartrecruiters' && (
          <div className="space-y-6">
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">SmartRecruiters Integration</h3>
                  <p className="text-sm text-gray-600 mt-1">Connect and sync with your SmartRecruiters account</p>
                </div>
                <div className="flex items-center space-x-2">
                  {srSettings.connected ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-sm font-medium text-green-700">Connected</span>
                    </>
                  ) : (
                    <>
                      <X className="w-5 h-5 text-red-500" />
                      <span className="text-sm font-medium text-red-700">Disconnected</span>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
                  <div className="flex space-x-2">
                    <input 
                      type="password" 
                      value={srSettings.apiKey} 
                      onChange={(e) => setSrSettings({...srSettings, apiKey: e.target.value})}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg" 
                    />
                    <button className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg">Show</button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">API URL</label>
                  <input 
                    type="text" 
                    value={srSettings.apiUrl}
                    onChange={(e) => setSrSettings({...srSettings, apiUrl: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Webhook URL</label>
                  <div className="flex space-x-2">
                    <input 
                      type="text" 
                      value={srSettings.webhookUrl}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50" 
                    />
                    <button className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center space-x-2">
                      <Download className="w-4 h-4" />
                      <span>Copy</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sync Interval (minutes)</label>
                    <select 
                      value={srSettings.syncInterval}
                      onChange={(e) => setSrSettings({...srSettings, syncInterval: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="5">5 minutes</option>
                      <option value="15">15 minutes</option>
                      <option value="30">30 minutes</option>
                      <option value="60">1 hour</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Sync</label>
                    <input 
                      type="text" 
                      value={srSettings.lastSync}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50" 
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      checked={srSettings.autoSync}
                      onChange={(e) => setSrSettings({...srSettings, autoSync: e.target.checked})}
                      className="w-4 h-4 text-primary rounded" 
                    />
                    <span className="text-sm text-gray-700">Enable automatic sync</span>
                  </label>
                </div>

                <div className="flex space-x-4 pt-4">
                  <button className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>Save Configuration</span>
                  </button>
                  <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                    <RefreshCw className="w-4 h-4" />
                    <span>Test Connection</span>
                  </button>
                  {srSettings.connected && (
                    <button className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                      Disconnect
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Sync Status */}
            <div className="card bg-blue-50 border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-3">Recent Sync Activity</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-blue-800">Candidates synced</span>
                  <span className="font-semibold text-blue-900">763 candidates</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-blue-800">Jobs synced</span>
                  <span className="font-semibold text-blue-900">45 jobs</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-blue-800">Surveys created</span>
                  <span className="font-semibold text-blue-900">89 surveys</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Upload */}
        {activeTab === 'bulk-upload' && (
          <div className="space-y-6">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Bulk Upload Candidates</h3>
              <p className="text-sm text-gray-600 mb-6">Upload CSV, XLS, or XLSX files to import candidates and send surveys in bulk</p>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-primary transition-colors">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">Drop your file here or click to browse</h4>
                <p className="text-sm text-gray-600 mb-4">Supported formats: CSV, XLS, XLSX (Max 10MB)</p>
                <input
                  type="file"
                  accept=".csv,.xls,.xlsx"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark cursor-pointer"
                >
                  <Upload className="w-5 h-5 mr-2" />
                  Select File
                </label>
              </div>

              {uploadedFile && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium text-green-900">{uploadedFile.name}</p>
                        <p className="text-sm text-green-700">{(uploadedFile.size / 1024).toFixed(2)} KB</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setUploadedFile(null)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <button
                    onClick={() => setShowBulkUploadModal(true)}
                    className="mt-4 w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark"
                  >
                    Process & Send Surveys
                  </button>
                </div>
              )}

              <div className="mt-6">
                <h4 className="font-semibold text-gray-900 mb-3">CSV Template</h4>
                <p className="text-sm text-gray-600 mb-3">Download our template to ensure your file is formatted correctly</p>
                <button className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center space-x-2">
                  <Download className="w-4 h-4" />
                  <span>Download CSV Template</span>
                </button>
              </div>

              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-semibold text-yellow-900 mb-2">Required Columns</h4>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• <strong>name</strong> - Candidate full name</li>
                  <li>• <strong>email</strong> - Candidate email address</li>
                  <li>• <strong>role</strong> - Job role/position</li>
                  <li>• <strong>country</strong> (optional) - Country/Location</li>
                  <li>• <strong>phone</strong> (optional) - Phone number for SMS</li>
                  <li>• <strong>stage</strong> (optional) - Interview stage</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Email & SMS Settings */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Configuration</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Host</label>
                    <input type="text" defaultValue="smtp.gmail.com" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Port</label>
                    <input type="number" defaultValue="587" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">From Email</label>
                  <input type="email" defaultValue="noreply@company.com" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">From Name</label>
                  <input type="text" defaultValue="Recruiting Team" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">SMS Configuration</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SMS Provider</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option>Twilio</option>
                    <option>AWS SNS</option>
                    <option>MessageBird</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Account SID</label>
                  <input type="text" placeholder="Enter Twilio Account SID" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Auth Token</label>
                  <input type="password" placeholder="Enter Auth Token" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* API Keys */}
        {activeTab === 'api' && (
          <div className="space-y-6">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">API Keys & Webhooks</h3>
              <p className="text-sm text-gray-600 mb-6">Manage API keys for external integrations</p>

              <div className="space-y-4">
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">Production API Key</span>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Active</span>
                  </div>
                  <code className="text-sm text-gray-600">sk_live_••••••••••••••••••••1234</code>
                  <div className="flex space-x-2 mt-3">
                    <button className="text-sm text-blue-600 hover:text-blue-800">Copy</button>
                    <button className="text-sm text-red-600 hover:text-red-800">Revoke</button>
                  </div>
                </div>

                <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Generate New API Key</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Recruiter Modal */}
      {showAddRecruiterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Add New Recruiter</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input type="email" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option>Recruiter</option>
                  <option>Senior Recruiter</option>
                  <option>Recruiting Manager</option>
                  <option>Admin</option>
                </select>
              </div>
              <div className="flex space-x-3 pt-4">
                <button className="flex-1 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark">
                  Add Recruiter
                </button>
                <button 
                  onClick={() => setShowAddRecruiterModal(false)}
                  className="flex-1 px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      {showBulkUploadModal && uploadedFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Process Bulk Upload</h3>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900"><strong>File:</strong> {uploadedFile.name}</p>
                <p className="text-sm text-blue-900 mt-1"><strong>Size:</strong> {(uploadedFile.size / 1024).toFixed(2)} KB</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Survey Template</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option>Post-interview - General</option>
                  <option>Final Round Experience</option>
                  <option>New Hire Onboarding</option>
                </select>
              </div>

              <div>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-primary rounded" />
                  <span className="text-sm text-gray-700">Send surveys immediately</span>
                </label>
              </div>

              <div>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="w-4 h-4 text-primary rounded" />
                  <span className="text-sm text-gray-700">Send via SMS (if phone number provided)</span>
                </label>
              </div>

              <div className="flex space-x-3 pt-4">
                <button 
                  onClick={handleProcessBulkUpload}
                  className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark font-semibold"
                >
                  Process & Send
                </button>
                <button 
                  onClick={() => setShowBulkUploadModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

