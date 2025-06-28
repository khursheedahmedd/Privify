'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  // Close menu on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setIsOpen(false)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const menuVariants = {
    open: { x: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
    closed: { x: '100%', transition: { duration: 0.2 } }
  }

  const linkVariants = {
    open: { opacity: 1, y: 0 },
    closed: { opacity: 0, y: 20 }
  }

  return (
    <nav className={`fixed w-full z-50 ${isScrolled ? 'bg-white/95 backdrop-blur-md' : 'bg-transparent'} transition-all duration-300 shadow-sm`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo with subtle animation */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="text-xl font-bold"
          >
            <Link href="/" className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 transition-colors">
              <ShieldIcon className="h-6 w-6" />
              Privify
            </Link>
          </motion.div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link 
              href="/" 
              className="text-gray-600 hover:text-indigo-600 transition-colors font-medium relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-indigo-600 hover:after:w-full after:transition-all"
            >
              Home
            </Link>
            <Link 
              href="/contact" 
              className="text-gray-600 hover:text-indigo-600 transition-colors font-medium relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-indigo-600 hover:after:w-full after:transition-all"
            >
              Contact
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle navigation menu"
          >
            <motion.span
              animate={isOpen ? 'open' : 'closed'}
              className="material-icons text-2xl text-gray-700"
            >
              {isOpen ? 'close' : 'menu'}
            </motion.span>
          </button>
        </div>
      </div>

      {/* Mobile Menu with Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm md:hidden"
              onClick={() => setIsOpen(false)}
            />
            
            <motion.div
              variants={menuVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="fixed top-0 right-0 w-64 h-full bg-white shadow-xl z-50 md:hidden p-6"
            >
              <div className="flex flex-col h-full">
                <div className="flex justify-end mb-8">
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <span className="material-icons text-2xl">close</span>
                  </button>
                </div>

                <motion.div 
                  className="flex flex-col gap-6"
                  initial="closed"
                  animate="open"
                  variants={{
                    open: {
                      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
                    },
                    closed: { transition: { staggerChildren: 0.05, staggerDirection: -1 } }
                  }}
                >
                  <motion.div variants={linkVariants}>
                    <Link
                      href="/"
                      onClick={() => setIsOpen(false)}
                      className="text-lg font-medium text-gray-800 hover:text-indigo-600 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Home
                    </Link>
                  </motion.div>
                  
                  <motion.div variants={linkVariants}>
                    <Link
                      href="/contact"
                      onClick={() => setIsOpen(false)}
                      className="text-lg font-medium text-gray-800 hover:text-indigo-600 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Contact
                    </Link>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  )
}

// Custom shield icon component
const ShieldIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
  </svg>
)

export default Navbar