import { useParams } from 'react-router-dom';
import { useState } from 'react';

export default function Survey() {
  const { token } = useParams<{ token: string }>();
  const [submitted, setSubmitted] = useState(false);
  const [npsScore, setNpsScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Submit to backend API
    console.log('Survey submitted:', { token, npsScore, feedback });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-teal-50 to-cyan-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
          <p className="text-gray-600 mb-6">
            Your feedback has been submitted successfully. We appreciate your time!
          </p>
          <p className="text-sm text-gray-500">
            This survey link is now closed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white p-6 text-center">
          <h1 className="text-2xl font-bold mb-2">Candidate Feedback Survey</h1>
          <p className="text-teal-100">Your opinion matters to us</p>
        </div>

        {/* Survey Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* NPS Score */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              How likely are you to recommend our interview process to a friend or colleague?
            </label>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500">Not likely</span>
              <span className="text-xs text-gray-500">Very likely</span>
            </div>
            <div className="grid grid-cols-11 gap-1">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                <button
                  key={score}
                  type="button"
                  onClick={() => setNpsScore(score)}
                  className={`h-12 rounded-lg font-semibold transition-all ${
                    npsScore === score
                      ? 'bg-teal-500 text-white scale-110 shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {score}
                </button>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>0-6: Detractor</span>
              <span>7-8: Passive</span>
              <span>9-10: Promoter</span>
            </div>
          </div>

          {/* Feedback */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              What could we improve about our interview process?
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
              rows={5}
              placeholder="Share your thoughts, suggestions, or concerns..."
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={npsScore === null}
            className={`w-full py-3 rounded-lg font-semibold text-white transition-all ${
              npsScore === null
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-teal-500 hover:bg-teal-600 shadow-lg hover:shadow-xl'
            }`}
          >
            Submit Feedback
          </button>

          <p className="text-xs text-center text-gray-500">
            Survey Token: <code className="bg-gray-100 px-2 py-1 rounded">{token}</code>
          </p>
        </form>
      </div>
    </div>
  );
}

