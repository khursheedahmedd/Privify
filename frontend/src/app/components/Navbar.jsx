"use client";
import { useState } from "react";
import Link from "next/link";
import { FiMenu, FiX } from "react-icons/fi";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-black text-white py-4 px-6 flex justify-between items-center shadow-lg">
      {/* Logo */}
      <div className="text-2xl font-bold tracking-wide hover:text-green-400 transition duration-300">
        <Link href="/" className="inline-block">Overshare 2.0</Link>
      </div>

      {/* Centered Navbar Items */}
      <ul className="hidden md:flex flex-1 justify-center space-x-16 text-lg">
        <li>
          <Link
            href="/"
            className="inline-block transform transition duration-300 hover:text-green-400 hover:scale-110"
          >
            Home
          </Link>
        </li>
        <li>
          <Link
            href="/scan"
            className="inline-block transform transition duration-300 hover:text-green-400 hover:scale-110"
          >
            Scan
          </Link>
        </li>
        <li>
          <Link
            href="/results"
            className="inline-block transform transition duration-300 hover:text-green-400 hover:scale-110"
          >
            Results
          </Link>
        </li>
      </ul>

      {/* Mobile Menu Button */}
      <button
        className="md:hidden text-3xl focus:outline-none transition duration-300"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <FiX /> : <FiMenu />}
      </button>

      {/* Mobile Dropdown Menu */}
      <div
        className={`fixed top-0 left-0 w-full h-screen bg-black transition-transform duration-500 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:hidden`}
      >
        <button
          className="absolute top-6 right-6 text-3xl text-white focus:outline-none"
          onClick={() => setIsOpen(false)}
        >
          <FiX />
        </button>

        <ul className="flex flex-col items-center justify-center h-full space-y-8 text-2xl">
          <li>
            <Link
              href="/"
              className="inline-block transform transition duration-300 hover:text-green-400 hover:scale-110"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              href="/scan"
              className="inline-block transform transition duration-300 hover:text-green-400 hover:scale-110"
              onClick={() => setIsOpen(false)}
            >
              Scan
            </Link>
          </li>
          <li>
            <Link
              href="/results"
              className="inline-block transform transition duration-300 hover:text-green-400 hover:scale-110"
              onClick={() => setIsOpen(false)}
            >
              Results
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
