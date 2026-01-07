import { useState } from 'react';
import { X, Calendar } from 'lucide-react';

export type TimePeriod = 'weekly' | 'monthly' | 'quarterly';
export type ComparisonBaseline = 'engineers-q1' | 'designers-q1' | 'all-roles';

interface DashboardFiltersProps {
  onPeriodChange: (period: TimePeriod) => void;
  onBaselineChange: (baseline: ComparisonBaseline) => void;
  onDateRangeChange: (from: string, to: string) => void;
}

export default function DashboardFilters({
  onPeriodChange,
  onBaselineChange,
  onDateRangeChange,
}: DashboardFiltersProps) {
  const [activePeriod, setActivePeriod] = useState<TimePeriod>('weekly');
  const [activeBaseline, setActiveBaseline] = useState<ComparisonBaseline>('engineers-q1');
  const [showModal, setShowModal] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const handlePeriodClick = (period: TimePeriod) => {
    setActivePeriod(period);
    onPeriodChange(period);
  };

  const handleBaselineClick = (baseline: ComparisonBaseline) => {
    setActiveBaseline(baseline);
    onBaselineChange(baseline);
  };

  const handleCustomRangeSubmit = () => {
    if (fromDate && toDate) {
      onDateRangeChange(fromDate, toDate);
      setShowModal(false);
    }
  };

  const baselineLabels = {
    'engineers-q1': 'vs Engineers Q1',
    'designers-q1': 'vs Designers Q1',
    'all-roles': 'vs All Roles',
  };

  return (
    <>
      <div className="flex items-center gap-3">
        {/* Time Period Chips */}
        <div className="flex gap-2">
          {(['weekly', 'monthly', 'quarterly'] as TimePeriod[]).map((period) => (
            <button
              key={period}
              onClick={() => handlePeriodClick(period)}
              className={`px-4 py-1.5 text-sm font-medium rounded-full border-2 transition-all ${
                activePeriod === period
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400 hover:bg-gray-50'
              }`}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>

        {/* Baseline Comparison Chip */}
        <div className="relative">
          <select
            value={activeBaseline}
            onChange={(e) => handleBaselineClick(e.target.value as ComparisonBaseline)}
            className="px-4 py-1.5 text-sm font-medium rounded-full border-2 border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50 cursor-pointer transition-all appearance-none pr-8"
            style={{ paddingRight: '32px' }}
          >
            {(Object.keys(baselineLabels) as ComparisonBaseline[]).map((baseline) => (
              <option key={baseline} value={baseline}>
                {baselineLabels[baseline]}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Custom Range Button */}
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-1.5 text-sm font-medium rounded-full border-2 border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-all flex items-center gap-2"
        >
          <Calendar className="w-4 h-4" />
          Custom Range
        </button>
      </div>

      {/* Custom Date Range Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Select Custom Date Range</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCustomRangeSubmit}
                  disabled={!fromDate || !toDate}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
