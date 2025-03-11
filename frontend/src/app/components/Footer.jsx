import React from 'react'

const Footer = () => {
  return (
    <footer className="w-full py-4 bg-gray-100 mt-auto text-center">
      <p className="text-sm text-gray-500">
        &copy; {new Date().getFullYear()} PrivacyTool. All rights reserved.
      </p>
    </footer>
  )
}

export default Footer
