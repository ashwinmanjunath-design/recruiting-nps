// client/src/components/surveys/CreateSurveyModal.tsx
import React, { useState, useMemo, useEffect } from "react";
import { surveyTemplates, getTemplatesByAudience, SURVEY_AUDIENCE_OPTIONS, type SurveyTemplate } from "../../mocks/surveyTemplates";
import type { SurveyRecipient, CreateSurveyPayload, CohortFilter } from "../../../../shared/types/models/survey.types";
import { SurveyAudience, SurveyAudienceLabels, SurveyAudienceColors } from "../../../../shared/types/enums";
import { sendSurveyEmails } from "../../api/client";

type CreateSurveyModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (payload: CreateSurveyPayload) => void;
};

// Mock candidate list for recipient selection
const MOCK_CANDIDATES = [
  { id: 'cand_101', name: 'John Doe', email: 'john.doe@example.com', role: 'Backend Engineer' },
  { id: 'cand_102', name: 'Jane Smith', email: 'jane.smith@example.com', role: 'Frontend Engineer' },
  { id: 'cand_103', name: 'Mike Johnson', email: 'mike.johnson@example.com', role: 'Product Designer' },
  { id: 'cand_104', name: 'Sarah Williams', email: 'sarah.williams@example.com', role: 'Data Scientist' },
  { id: 'cand_105', name: 'David Brown', email: 'david.brown@example.com', role: 'Backend Engineer' },
  { id: 'cand_106', name: 'Prapti Shah', email: 'prapti.shah@omio.com', role: 'Product Manager' },
  { id: 'cand_107', name: 'Ashwin Manjunath', email: 'ashwin.manjunath@omio.com', role: 'Engineering Manager' },
];

// Default from email address
const DEFAULT_FROM_EMAIL = "ashwin.manjunath@omio.com";

export const CreateSurveyModal: React.FC<CreateSurveyModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  // ✅ 1) All hooks at the top, in a fixed order
  const [name, setName] = useState("");
  const [targetCohort, setTargetCohort] = useState("");
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [audience, setAudience] = useState<SurveyAudience>(SurveyAudience.CANDIDATE);
  
  // Email sending configuration
  const [emailSubject, setEmailSubject] = useState("");
  const [fromEmail, setFromEmail] = useState(DEFAULT_FROM_EMAIL);
  const [sendMode, setSendMode] = useState<'cohort' | 'individual' | 'bulk'>('cohort');
  const [selectedRecipients, setSelectedRecipients] = useState<SurveyRecipient[]>([]);
  const [showEmailConfig, setShowEmailConfig] = useState(true);
  const [isSending, setIsSending] = useState(false); // Prevent duplicate sends
  
  // Cohort filter (for cohort mode)
  const [cohortRole, setCohortRole] = useState("");
  const [cohortStage, setCohortStage] = useState("");
  const [cohortRegion, setCohortRegion] = useState("Global");
  
  // Manual email entry (for bulk/individual mode)
  const [manualEmail, setManualEmail] = useState("");
  const [manualName, setManualName] = useState("");
  
  // Search/filter for candidate selection
  const [candidateSearch, setCandidateSearch] = useState("");
  
  // Bulk upload (placeholder for future CSV upload)
  const [bulkEmails, setBulkEmails] = useState<string>("");

  // ✅ always call useMemo, even if templateId is null
  const selectedTemplate: SurveyTemplate | undefined = useMemo(
    () => surveyTemplates.find((t) => t.id === (templateId ?? "")),
    [templateId]
  );

  // Filter templates by selected audience
  const filteredTemplates = useMemo(
    () => getTemplatesByAudience(audience),
    [audience]
  );

  // Filter candidates based on search
  const filteredCandidates = useMemo(() => {
    if (!candidateSearch.trim()) {
      return MOCK_CANDIDATES;
    }
    const searchLower = candidateSearch.toLowerCase();
    return MOCK_CANDIDATES.filter(
      (candidate) =>
        candidate.name.toLowerCase().includes(searchLower) ||
        candidate.email.toLowerCase().includes(searchLower) ||
        candidate.role.toLowerCase().includes(searchLower)
    );
  }, [candidateSearch]);

  // ✅ useEffect is ALWAYS called; do checks inside
  useEffect(() => {
    if (!isOpen) {
      // reset when modal closes
      setName("");
      setTargetCohort("");
      setTemplateId(null);
      setAudience(SurveyAudience.CANDIDATE);
      setEmailSubject("");
      setFromEmail(DEFAULT_FROM_EMAIL);
      setSelectedRecipients([]);
      setShowEmailConfig(true);
      setSendMode('cohort');
      setCohortRole("");
      setCohortStage("");
      setCohortRegion("Global");
      setManualEmail("");
      setManualName("");
      setCandidateSearch("");
      setBulkEmails("");
      setIsSending(false); // Reset sending state
    }
  }, [isOpen]);

  // Reset template when audience changes (template may not be valid for new audience)
  useEffect(() => {
    if (templateId) {
      const currentTemplate = surveyTemplates.find(t => t.id === templateId);
      if (currentTemplate && currentTemplate.audience !== audience) {
        setTemplateId(null); // Clear template if it doesn't match the new audience
      }
    }
  }, [audience, templateId]);

  // Auto-generate email subject when name changes (only if subject is empty)
  useEffect(() => {
    if (isOpen && name && emailSubject === "") {
      setEmailSubject(`Share your feedback: ${name}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, name]);

  // REMOVED: Auto-population of test email - users should manually select recipients
  // This was causing confusion and potential recipient override issues

  // ✅ only now we can early-return JSX; no hooks below this
  if (!isOpen) return null;

  const handleAddManualEmail = () => {
    if (manualEmail.trim()) {
      const newRecipient: SurveyRecipient = {
        type: 'manual',
        email: manualEmail.trim(),
        name: manualName.trim() || undefined,
      };
      setSelectedRecipients([...selectedRecipients, newRecipient]);
      setManualEmail("");
      setManualName("");
    }
  };

  const handleRemoveRecipient = (index: number) => {
    setSelectedRecipients(selectedRecipients.filter((_, i) => i !== index));
  };

  const handleToggleCandidate = (candidate: typeof MOCK_CANDIDATES[0]) => {
    const existingIndex = selectedRecipients.findIndex(
      (r) => r.type === 'candidate' && r.candidateId === candidate.id
    );

    if (existingIndex >= 0) {
      handleRemoveRecipient(existingIndex);
    } else {
      const newRecipient: SurveyRecipient = {
        type: 'candidate',
        candidateId: candidate.id,
        email: candidate.email,
        name: candidate.name,
        role: candidate.role,
      };
      setSelectedRecipients([...selectedRecipients, newRecipient]);
    }
  };

  const handleBulkEmailsParse = () => {
    // Simple CSV parsing: email,name format or just emails
    const lines = bulkEmails.split('\n').filter(line => line.trim());
    const parsed: SurveyRecipient[] = [];

    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed) return;

      // Try to parse "email,name" or "email, name" format
      const parts = trimmed.split(',').map(p => p.trim());
      const email = parts[0];
      const name = parts[1] || undefined;

      if (email && email.includes('@')) {
        parsed.push({
          type: 'manual',
          email,
          name,
        });
      }
    });

    if (parsed.length > 0) {
      setSelectedRecipients([...selectedRecipients, ...parsed]);
      setBulkEmails("");
    }
  };

  const buildPayload = (shouldSend: boolean): CreateSurveyPayload => {
    // Build cohort filter if in cohort mode
    const cohortFilter: CohortFilter | null = sendMode === 'cohort' ? {
      role: cohortRole || undefined,
      stage: cohortStage || undefined,
      region: cohortRegion || undefined,
    } : null;

    return {
      survey: {
        name: name || selectedTemplate?.name || "Untitled survey",
        targetCohort: targetCohort || "All candidates",
        templateId: selectedTemplate?.id || null,
        audience, // Include selected audience
        questionSetVersion: "v1.0",
      },
      email: {
        subject: emailSubject.trim() || `Share your feedback: ${name || selectedTemplate?.name || "Untitled survey"}`,
        fromEmail: fromEmail.trim(),
        sendMode,
        recipients: selectedRecipients,
        cohortFilter,
        sendImmediately: shouldSend,
        scheduledAt: shouldSend ? null : null, // No scheduling for now
      },
    };
  };

  const handleSaveSurvey = () => {
    // Basic validation
    if (!name.trim()) {
      alert("Please enter a survey name");
      return;
    }

    const payload = buildPayload(false);
    onCreated(payload);
    onClose();
  };

  const handleSendNow = async () => {
    // Prevent duplicate sends
    if (isSending) {
      console.log('[CreateSurveyModal] Already sending, ignoring duplicate request');
      return;
    }

    // Full validation including recipients
    if (!name.trim()) {
      alert("Please enter a survey name");
      return;
    }

    // Validate recipients based on send mode
    if (sendMode === 'individual' && selectedRecipients.length === 0) {
      alert("Please select at least one recipient for Individual mode");
      return;
    }

    if (sendMode === 'bulk' && selectedRecipients.length === 0) {
      alert("Please add at least one recipient for Bulk mode");
      return;
    }

    // Set loading state
    setIsSending(true);

    // Extract recipient emails - with validation
    const recipientEmails = selectedRecipients
      .map(r => r.email)
      .filter(email => email && email.includes('@')); // Filter out invalid emails
    
    // CRITICAL: Validate recipients before sending
    if (recipientEmails.length === 0) {
      alert("Error: No valid recipients selected. Please add at least one recipient.");
      setIsSending(false);
      return;
    }
    
    // Debug logging - CRITICAL for debugging
    console.log('[CreateSurveyModal] ⚠️  ===== RECIPIENT DEBUG =====');
    console.log('[CreateSurveyModal] ⚠️  SELECTED RECIPIENTS (raw):', JSON.stringify(selectedRecipients, null, 2));
    console.log('[CreateSurveyModal] ⚠️  RECIPIENT EMAILS TO SEND:', JSON.stringify(recipientEmails, null, 2));
    console.log('[CreateSurveyModal] ⚠️  Send Mode:', sendMode);
    console.log('[CreateSurveyModal] ⚠️  Recipient Count:', recipientEmails.length);
    console.log('[CreateSurveyModal] ⚠️  ============================');
    
    // Build payload for send endpoint
    const sendPayload = {
      surveyName: name.trim(),
      recipients: recipientEmails, // This should be the exact array of emails
      fromEmail: fromEmail.trim(),
      targetCohort: targetCohort.trim() || null,
      sendImmediately: true,
    };

    console.log('[CreateSurveyModal] ⚠️  CALLING POST /api/surveys/send');
    console.log('[CreateSurveyModal] ⚠️  PAYLOAD recipients array:', JSON.stringify(sendPayload.recipients, null, 2));
    console.log('[CreateSurveyModal] ⚠️  FULL PAYLOAD:', JSON.stringify(sendPayload, null, 2));
    
    // CRITICAL: Show confirmation with exact recipients
    const recipientList = recipientEmails.join(', ');
    const confirmMessage = `Send survey to these ${recipientEmails.length} recipient(s)?\n\n${recipientList}\n\nClick OK to send, Cancel to review.`;
    
    if (!window.confirm(confirmMessage)) {
      setIsSending(false);
      return; // User cancelled
    }
    
    try {
      const response = await sendSurveyEmails(sendPayload);
      console.log('[CreateSurveyModal] Send response:', response.data);
      
      // Show success message with actual recipient count
      const sentCount = response.data.sentTo || recipientEmails.length;
      alert(`✅ Survey email sent to ${sentCount} recipient(s).`);
      
      // Close modal on success
      onClose();
    } catch (error: any) {
      console.error('[CreateSurveyModal] Error sending survey:', error);
      
      // Handle new error format: { success: false, message: "..." }
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to send survey';
      alert(`❌ Failed to send survey: ${errorMessage}`);
      
      // Keep modal open on error so user can retry
    } finally {
      // Reset loading state
      setIsSending(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            Create New Survey
          </h2>
          <button
            type="button"
            className="text-sm text-slate-500 hover:text-slate-700"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
          {/* Survey name */}
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Survey name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              placeholder="Post-interview – Engineering"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Survey Audience */}
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Survey Audience <span className="text-red-500">*</span>
            </label>
            <select
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              value={audience}
              onChange={(e) => setAudience(e.target.value as SurveyAudience)}
            >
              {SURVEY_AUDIENCE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-slate-500">
              {audience === SurveyAudience.CANDIDATE && "Surveys for job candidates (interview feedback, offer experience)"}
              {audience === SurveyAudience.HIRING_MANAGER && "Surveys for hiring managers (recruiting process, candidate quality)"}
              {audience === SurveyAudience.WORKPLACE && "Surveys for employees (workplace environment, HR responsiveness)"}
              {audience === SurveyAudience.IT_SUPPORT && "Surveys for IT feedback (system access, onboarding, tools)"}
            </p>
          </div>

          {/* Cohort */}
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Target cohort
            </label>
            <input
              type="text"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              placeholder="e.g. Senior Backend – Final Round (Q4)"
              value={targetCohort}
              onChange={(e) => setTargetCohort(e.target.value)}
            />
          </div>

          {/* Template selector - filtered by audience */}
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Start from template (optional)
            </label>
            <select
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              value={templateId ?? ""}
              onChange={(e) =>
                setTemplateId(e.target.value ? e.target.value : null)
              }
            >
              <option value="">Blank survey</option>
              {filteredTemplates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            {filteredTemplates.length === 0 && (
              <p className="mt-1 text-xs text-amber-600">
                No templates available for {SurveyAudienceLabels[audience]}. You can create a blank survey.
              </p>
            )}
            {selectedTemplate && (
              <div className="mt-2 text-xs text-slate-600">
                <p>{selectedTemplate.description}</p>
                <p className="mt-1">Recommended: {selectedTemplate.recommendedUse}</p>
                <p className="mt-1 font-medium">{selectedTemplate.questions.length} questions included</p>
              </div>
            )}
          </div>

          {/* Email Sending Configuration */}
          <div className="border-t-2 border-teal-200 pt-4 bg-teal-50/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                Send Survey to Candidates
              </label>
              <button
                type="button"
                onClick={() => setShowEmailConfig(!showEmailConfig)}
                className="text-xs text-teal-600 hover:text-teal-700 font-medium"
              >
                {showEmailConfig ? 'Hide Options' : 'Show Options'}
              </button>
            </div>

            {showEmailConfig && (
              <div className="space-y-4">
                {/* Email Subject */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    Email Subject
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="Share your feedback: [Survey Name]"
                  />
                </div>

                {/* From Email */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    From Email Address
                  </label>
                  <input
                    type="email"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                    value={fromEmail}
                    onChange={(e) => setFromEmail(e.target.value)}
                    placeholder="ashwin.manjunath@omio.com"
                  />
                </div>

                {/* Send Mode */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    Send To
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setSendMode('cohort')}
                      className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                        sendMode === 'cohort'
                          ? 'bg-teal-500 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      Cohort
                    </button>
                    <button
                      type="button"
                      onClick={() => setSendMode('individual')}
                      className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                        sendMode === 'individual'
                          ? 'bg-teal-500 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      Individual
                    </button>
                    <button
                      type="button"
                      onClick={() => setSendMode('bulk')}
                      className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                        sendMode === 'bulk'
                          ? 'bg-teal-500 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      Bulk Upload
                    </button>
                  </div>
                </div>

                {/* Cohort Filter (for cohort mode) */}
                {sendMode === 'cohort' && (
                  <div className="space-y-2 p-3 bg-white rounded-lg border border-slate-200">
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">
                      Cohort Filter
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="text"
                        className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs outline-none focus:border-teal-500"
                        placeholder="Role (e.g. Backend Engineer)"
                        value={cohortRole}
                        onChange={(e) => setCohortRole(e.target.value)}
                      />
                      <input
                        type="text"
                        className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs outline-none focus:border-teal-500"
                        placeholder="Stage (e.g. Final Round)"
                        value={cohortStage}
                        onChange={(e) => setCohortStage(e.target.value)}
                      />
                      <input
                        type="text"
                        className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs outline-none focus:border-teal-500"
                        placeholder="Region"
                        value={cohortRegion}
                        onChange={(e) => setCohortRegion(e.target.value)}
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Leave empty to match all candidates in the target cohort
                    </p>
                  </div>
                )}

                {/* Individual Recipients */}
                {sendMode === 'individual' && (
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">
                      Select Candidates
                    </label>
                    {/* Search box for filtering candidates */}
                    <input
                      type="text"
                      className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                      placeholder="Search by name, email, or role..."
                      value={candidateSearch}
                      onChange={(e) => setCandidateSearch(e.target.value)}
                    />
                    <div className="max-h-32 overflow-y-auto border border-slate-200 rounded-lg p-2 space-y-1">
                      {filteredCandidates.length > 0 ? (
                        filteredCandidates.map((candidate) => {
                        const isSelected = selectedRecipients.some(
                          (r) => r.type === 'candidate' && r.candidateId === candidate.id
                        );
                        return (
                          <label
                            key={candidate.id}
                            className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleCandidate(candidate)}
                              className="rounded border-slate-300"
                            />
                            <span className="text-xs text-slate-700">
                              {candidate.name} ({candidate.email}) - {candidate.role}
                            </span>
                          </label>
                        );
                        })
                      ) : (
                        <div className="text-center py-4 text-xs text-slate-500">
                          No candidates found matching "{candidateSearch}"
                        </div>
                      )}
                    </div>
                    
                    {/* Manual email entry for individual mode */}
                    <div className="flex gap-2">
                      <input
                        type="email"
                        className="flex-1 rounded-lg border border-slate-200 px-2 py-1.5 text-xs outline-none focus:border-teal-500"
                        placeholder="Add manual email"
                        value={manualEmail}
                        onChange={(e) => setManualEmail(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddManualEmail();
                          }
                        }}
                      />
                      <input
                        type="text"
                        className="w-32 rounded-lg border border-slate-200 px-2 py-1.5 text-xs outline-none focus:border-teal-500"
                        placeholder="Name (optional)"
                        value={manualName}
                        onChange={(e) => setManualName(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddManualEmail();
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleAddManualEmail}
                        className="px-3 py-1.5 text-xs font-medium bg-teal-500 text-white rounded-lg hover:bg-teal-600"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                )}

                {/* Bulk Upload */}
                {sendMode === 'bulk' && (
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">
                      Bulk Email Entry (CSV format: email,name or just emails)
                    </label>
                    <textarea
                      className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs outline-none focus:border-teal-500 font-mono"
                      rows={6}
                      placeholder="john@example.com, John Doe&#10;jane@example.com, Jane Smith&#10;mike@example.com"
                      value={bulkEmails}
                      onChange={(e) => setBulkEmails(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={handleBulkEmailsParse}
                      className="px-3 py-1.5 text-xs font-medium bg-teal-500 text-white rounded-lg hover:bg-teal-600"
                    >
                      Parse & Add Emails
                    </button>
                  </div>
                )}

                {/* Selected Recipients List */}
                {selectedRecipients.length > 0 && (
                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <label className="block text-xs font-medium text-slate-600 mb-2">
                      Selected Recipients ({selectedRecipients.length})
                    </label>
                    <div className="max-h-24 overflow-y-auto space-y-1">
                      {selectedRecipients.map((recipient, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-1.5 bg-slate-50 rounded text-xs"
                        >
                          <span className="text-slate-700">
                            {recipient.name || recipient.email} ({recipient.email})
                            {recipient.type === 'candidate' && recipient.role && ` - ${recipient.role}`}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveRecipient(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className="rounded-full border border-slate-200 px-5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              onClick={handleSaveSurvey}
            >
              Save Survey
            </button>
            <button
              type="button"
              disabled={isSending}
              className={`rounded-full px-5 py-2 text-sm font-medium text-white ${
                isSending
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-teal-500 hover:bg-teal-600'
              }`}
              onClick={handleSendNow}
            >
              {isSending ? 'Sending...' : 'Send Now'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
