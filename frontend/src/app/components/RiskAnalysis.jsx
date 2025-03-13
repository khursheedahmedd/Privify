import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const RiskLevelBadge = ({ level }) => (
  <span className={`px-2 py-1 rounded-full text-sm ${
    level === 'high' ? 'bg-red-100 text-red-800' :
    level === 'moderate' ? 'bg-orange-100 text-orange-800' :
    'bg-yellow-100 text-yellow-800'
  }`}>
    {level}
  </span>
);

export default function RiskAnalysis({ metadata }) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('http://localhost:5000/metadata/analyze', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(metadata)  // Send metadata as top-level object
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Analysis failed');
        }
        
        const data = await response.json();
        setAnalysis(data.risk_analysis);
      } catch (err) {
        console.error('Risk analysis failed:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (metadata) fetchAnalysis();
  }, [metadata]);

  if (!metadata) return null;

  return (
    <motion.div 
      className="mt-6 bg-white rounded-lg shadow p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h3 className="text-xl font-bold mb-4">Security Analysis</h3>
      
      {loading && (
        <div className="text-center py-4">
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="text-red-500 p-4 bg-red-50 rounded-lg">
          Error: {error}
        </div>
      )}

      {analysis && (
        <div className="space-y-4">
          <div className="mb-4">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              Overall Risk: 
              <RiskLevelBadge level={analysis.overall_risk} />
            </h4>
            <p className="text-sm text-gray-600">
              {analysis.overall_description}
            </p>
          </div>
          
          <div className="space-y-3">
            {analysis.risks.map((risk, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-4 border rounded-lg bg-white shadow-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium capitalize">{risk.type}</span>
                  <RiskLevelBadge level={risk.severity} />
                </div>
                <p className="text-gray-600 text-sm mb-2">{risk.description}</p>
                <div className="mt-2">
                  <p className="text-blue-600 text-sm font-medium">
                    Recommendation:
                  </p>
                  <p className="text-blue-600 text-sm">{risk.recommendation}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}