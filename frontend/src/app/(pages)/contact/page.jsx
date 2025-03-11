'use client'

import React from 'react'
import Navbar from '@/app/components/Navbar'
import Footer from '@/app/components/Footer'
import { motion } from 'framer-motion'

export default function Contact() {
  const handleSubmit = (e) => {
    e.preventDefault()
    // Implement your actual contact form submission logic
    alert('Form submitted!')
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <motion.main
        className="flex-1 container mx-auto p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold mb-6">Contact Us</h1>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
          <div>
            <label className="block font-semibold mb-1">Name</label>
            <input
              type="text"
              className="border rounded w-full px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Email</label>
            <input
              type="email"
              className="border rounded w-full px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Message</label>
            <textarea
              className="border rounded w-full px-3 py-2"
              rows="4"
              required
            ></textarea>
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Submit
          </button>
        </form>
      </motion.main>
      <Footer />
    </div>
  )
}
