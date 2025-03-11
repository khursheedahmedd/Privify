'use client'

import React, { useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { motion } from 'framer-motion'

export default function Home() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [metadata, setMetadata] = useState(null)
  const [processedImage, setProcessedImage] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0])
    setMetadata(null)
    setProcessedImage(null)
  }

  const handleMetadataScan = async () => {
    if (!selectedFile) return
    setLoading(true)
    setMetadata(null)
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      const response = await fetch('http://127.0.0.1:5000/metadata/scan', {
        method: 'POST',
        body: formData,
      })
      if (!response.ok) {
        throw new Error('Failed to scan metadata')
      }
      const data = await response.json()
      setMetadata(data)
    } catch (error) {
      console.error(error)
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handlePrivacyFilter = async () => {
    if (!selectedFile) return
    setLoading(true)
    setProcessedImage(null)
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      const response = await fetch(' http://127.0.0.1:5000/privacy/filter', {
        method: 'POST',
        body: formData,
      })
      if (!response.ok) {
        throw new Error('Failed to apply privacy filter')
      }
      // We expect an image; let's convert response to a Blob
      const blob = await response.blob()
      const objectURL = URL.createObjectURL(blob)
      setProcessedImage(objectURL)
    } catch (error) {
      console.error(error)
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Smooth-scrolling example: We wrap a section in a motion.div */}
      <motion.section
        className="flex-1 container mx-auto px-4 py-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-4">Welcome to Privify</h1>
        <p className="mb-6 text-gray-600">
          Upload an image to scan its metadata or blur sensitive details.
        </p>

        <div className="mb-4">
          <input type="file" onChange={handleFileChange} />
        </div>

        <div className="flex space-x-4 mb-6">
          <button
            onClick={handleMetadataScan}
            className="px-4 py-2 bg-blue-500 text-white rounded"
            disabled={!selectedFile || loading}
          >
            {loading ? 'Processing...' : 'Scan Metadata'}
          </button>

          <button
            onClick={handlePrivacyFilter}
            className="px-4 py-2 bg-green-500 text-white rounded"
            disabled={!selectedFile || loading}
          >
            {loading ? 'Processing...' : 'Blur Faces'}
          </button>
        </div>

        {/* Display metadata results */}
        {metadata && (
          <div className="border p-4 mb-4">
            <h2 className="text-xl font-semibold mb-2">Metadata</h2>
            <pre className="text-sm whitespace-pre-wrap">
              {JSON.stringify(metadata, null, 2)}
            </pre>
          </div>
        )}

        {/* Display processed image (blurred) */}
        {processedImage && (
          <div className="border p-4">
            <h2 className="text-xl font-semibold mb-2">Blurred Image</h2>
            <img
              src={processedImage}
              alt="Blurred result"
              className="max-w-full h-auto"
            />
          </div>
        )}
      </motion.section>

      <Footer />
    </div>
  )
}
