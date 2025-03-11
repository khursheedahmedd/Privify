'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  return (
    <nav className="w-full shadow p-4 flex items-center justify-between">
      <div className="text-xl font-bold">
        <Link href="/">Privify</Link>
      </div>
      {/* Hamburger Menu (Mobile) */}
      <div className="md:hidden">
        <button onClick={toggleMenu}>
          <span className="material-icons">menu</span>
        </button>
      </div>

      {/* Desktop Menu */}
      <div className="hidden md:flex space-x-6">
        <Link href="/">Home</Link>
        <Link href="/contact">Contact</Link>
      </div>

      {/* Mobile Menu (Framer Motion) */}
      {isOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ duration: 0.3 }}
          className="fixed top-0 right-0 w-2/3 h-full bg-white shadow-md p-4 md:hidden"
        >
          <button onClick={toggleMenu} className="mb-4">
            <span className="material-icons">close</span>
          </button>
          <div className="flex flex-col space-y-4">
            <Link href="/" onClick={toggleMenu}>Home</Link>
            <Link href="/contact" onClick={toggleMenu}>Contact</Link>
          </div>
        </motion.div>
      )}
    </nav>
  )
}

export default Navbar
