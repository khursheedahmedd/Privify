"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

const PrivacyContentDetection = ({ selectedFile, onDetectionComplete }) => {
  const [loading, setLoading] = useState(false);
  const [privacyResults, setPrivacyResults] = useState(null);
  const [error, setError] = useState(null);

  const handlePrivacyDetection = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setError(null);
    setPrivacyResults(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch(
        "http://localhost:5000/privacy-content/detect",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Privacy content detection failed");
      }

      const data = await response.json();
      setPrivacyResults(data.privacy_analysis);

      if (onDetectionComplete) {
        onDetectionComplete(data.privacy_analysis);
      }
    } catch (error) {
      console.error("Privacy content detection failed:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel?.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "low":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getContentTypeIcon = (type) => {
    const icons = {
      license_plate: "🚗",
      credit_card: "💳",
      id_document: "🆔",
      phone_number: "📞",
      address: "📍",
      name: "👤",
      medical: "🏥",
      business_card: "📇",
      screenshot: "📱",
      other: "⚠️",
    };
    return icons[type] || "⚠️";
  };

  const getContentTypeLabel = (type) => {
    const labels = {
      license_plate: "License Plate",
      credit_card: "Credit Card",
      id_document: "ID Document",
      phone_number: "Phone Number",
      address: "Address",
      name: "Personal Name",
      medical: "Medical Information",
      business_card: "Business Card",
      screenshot: "Screenshot",
      other: "Other Sensitive Content",
    };
    return labels[type] || "Sensitive Content";
  };

  return (
    <motion.div
      className="mt-8 bg-white rounded-xl shadow-lg p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">
          Privacy Content Detection
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            Detect sensitive content
          </span>
        </div>
      </div>

      {/* Detection Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handlePrivacyDetection}
        disabled={loading || !selectedFile}
        className="w-full px-6 py-3 bg-red-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-700 transition-colors"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            Scanning for sensitive content...
          </span>
        ) : (
          "🔍 Scan for Privacy Risks"
        )}
      </motion.button>

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg"
        >
          <div className="flex items-center gap-2 text-red-700">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <span className="font-medium">Error: {error}</span>
          </div>
        </motion.div>
      )}

      {/* Results Display */}
      {privacyResults && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 space-y-6"
        >
          {/* Overall Risk Alert */}
          {privacyResults.sensitive_content_found && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`p-6 rounded-lg border-2 ${getRiskColor(
                privacyResults.overall_risk
              )}`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="text-2xl">🚨</div>
                <div>
                  <h4 className="font-bold text-lg">Privacy Risk Detected!</h4>
                  <p className="text-sm opacity-90">{privacyResults.summary}</p>
                </div>
              </div>
              <div className="text-sm">
                <strong>Risk Level:</strong>{" "}
                {privacyResults.overall_risk?.toUpperCase()}
              </div>
            </motion.div>
          )}

          {/* Safe Content Message */}
          {!privacyResults.sensitive_content_found && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-6 bg-green-50 border-2 border-green-200 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="text-2xl">✅</div>
                <div>
                  <h4 className="font-bold text-lg text-green-800">
                    No Privacy Risks Found
                  </h4>
                  <p className="text-green-700">
                    Your image appears to be safe to share!
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Detected Items */}
          {privacyResults.detected_items &&
            privacyResults.detected_items.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">
                  Detected Sensitive Content:
                </h4>
                <div className="space-y-3">
                  {privacyResults.detected_items.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 rounded-lg border ${getRiskColor(
                        item.risk_level
                      )}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-xl">
                          {getContentTypeIcon(item.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-semibold">
                              {getContentTypeLabel(item.type)}
                            </h5>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(
                                item.risk_level
                              )}`}
                            >
                              {item.risk_level?.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm mb-2">{item.description}</p>
                          <div className="text-sm">
                            <strong>Recommendation:</strong>{" "}
                            {item.recommendation}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

          {/* General Recommendations */}
          {privacyResults.recommendations &&
            privacyResults.recommendations.length > 0 && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-3">
                  General Recommendations:
                </h4>
                <ul className="space-y-2">
                  {privacyResults.recommendations.map((rec, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-blue-800"
                    >
                      <span className="text-blue-600 mt-1">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

          {/* Warning Message */}
          {privacyResults.sensitive_content_found && (
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="flex items-center gap-2 text-red-800">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-medium">⚠️ Privacy Warning</span>
              </div>
              <p className="text-red-700 mt-2 text-sm">
                This image contains sensitive content that could be misused if
                shared publicly. Consider removing or blurring the detected
                content before sharing.
              </p>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

export default PrivacyContentDetection;
