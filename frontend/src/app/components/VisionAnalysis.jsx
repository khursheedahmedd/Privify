"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

const VisionAnalysis = ({ selectedFile, onAnalysisComplete }) => {
  const [loading, setLoading] = useState(false);
  const [analysisType, setAnalysisType] = useState("comprehensive");
  const [visionResults, setVisionResults] = useState(null);
  const [error, setError] = useState(null);

  const handleVisionAnalysis = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setError(null);
    setVisionResults(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      let endpoint = "";
      switch (analysisType) {
        case "description":
          endpoint = "http://localhost:5000/vision/description";
          break;
        case "objects":
          endpoint = "http://localhost:5000/vision/objects";
          break;
        case "comprehensive":
        default:
          endpoint = "http://localhost:5000/vision/comprehensive";
          break;
      }

      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Vision analysis failed");
      }

      const data = await response.json();
      setVisionResults(data);

      if (onAnalysisComplete) {
        onAnalysisComplete(data);
      }
    } catch (error) {
      console.error("Vision analysis failed:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceColor = (confidence) => {
    switch (confidence?.toLowerCase()) {
      case "high":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <motion.div
      className="mt-8 bg-white rounded-xl shadow-lg p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">Vision Analysis</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            AI-powered image understanding
          </span>
        </div>
      </div>

      {/* Analysis Type Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Analysis Type
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              key: "comprehensive",
              label: "Comprehensive",
              description: "Description + Objects",
            },
            {
              key: "description",
              label: "Description Only",
              description: "Image description",
            },
            {
              key: "objects",
              label: "Objects Only",
              description: "Detected objects",
            },
          ].map((type) => (
            <label
              key={type.key}
              className={`flex flex-col p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                analysisType === type.key
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <input
                type="radio"
                name="analysisType"
                value={type.key}
                checked={analysisType === type.key}
                onChange={(e) => setAnalysisType(e.target.value)}
                className="sr-only"
              />
              <div className="font-medium text-sm">{type.label}</div>
              <div className="text-xs text-gray-500">{type.description}</div>
            </label>
          ))}
        </div>
      </div>

      {/* Analysis Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleVisionAnalysis}
        disabled={loading || !selectedFile}
        className="px-8 py-3 bg-purple-600 cursor-pointer text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-700 transition-colors"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            Analyzing...
          </span>
        ) : (
          `Analyze Image (${analysisType})`
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
      {visionResults && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 space-y-6"
        >
          {/* Image Description */}
          {(visionResults.description ||
            analysisType === "description" ||
            analysisType === "comprehensive") &&
            visionResults.description && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">
                  Image Description
                </h4>
                <p className="text-gray-700 leading-relaxed">
                  {visionResults.description}
                </p>
              </div>
            )}

          {/* Detected Objects */}
          {(visionResults.objects ||
            analysisType === "objects" ||
            analysisType === "comprehensive") &&
            visionResults.objects && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">
                    Detected Objects
                  </h4>
                  <span className="text-sm text-gray-500">
                    {visionResults.object_count || visionResults.objects.length}{" "}
                    objects found
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {visionResults.objects.map((obj, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 bg-white rounded-lg border"
                    >
                      <div>
                        <div className="font-medium text-gray-900 capitalize">
                          {obj.object}
                        </div>
                        {obj.confidence && (
                          <div className="text-xs text-gray-500">
                            Confidence: {obj.confidence}
                          </div>
                        )}
                      </div>
                      {obj.confidence && (
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(
                            obj.confidence
                          )}`}
                        >
                          {obj.confidence}
                        </span>
                      )}
                    </motion.div>
                  ))}
                </div>

                {visionResults.note && (
                  <div className="mt-3 text-xs text-gray-500 italic">
                    Note: {visionResults.note}
                  </div>
                )}
              </div>
            )}

          {/* Analysis Summary */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Analysis Summary</h4>
            <div className="text-sm text-blue-800">
              <p>
                • Analysis Type:{" "}
                {analysisType.charAt(0).toUpperCase() + analysisType.slice(1)}
              </p>
              {visionResults.description && <p>• Description Generated: ✓</p>}
              {visionResults.objects && (
                <p>
                  • Objects Detected:{" "}
                  {visionResults.object_count || visionResults.objects.length}
                </p>
              )}
              <p>• Analysis completed successfully</p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default VisionAnalysis;
