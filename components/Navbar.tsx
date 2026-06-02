'use client'
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import logo from '../assets/BCA Logo (Transparent).png'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-[#232323] text-white border-b border-gray-700 w-full sticky top-0 z-50">
      <div className="h-24 flex items-center justify-between px-6 max-w-7xl mx-auto w-full">
        {/* Left Logo */}
        <Link href="/" className="h-full py-4 flex items-center shrink-0">
          <Image
            src={logo}
            alt="Logo"
            width={80}
            height={80}
            className="h-full w-auto object-contain"
          />
        </Link>

        {/* Centered Links (Desktop) */}
        <div className="hidden lg:flex items-center justify-center space-x-10 text-base font-light flex-1">
          <Link href="/" className="hover:text-amber-400 transition-colors">Home</Link>
          <Link href="/#courses" className="hover:text-amber-400 transition-colors">Programs</Link>
          <Link href="/#about" className="hover:text-amber-400 transition-colors">About us</Link>
          <Link href="/#gallery" className="hover:text-amber-400 transition-colors">Gallery</Link>
          <Link href="/#contact" className="hover:text-amber-400 transition-colors">Contact</Link>
        </div>

        {/* Login Button (Desktop) */}
        <div className="hidden md:flex items-center shrink-0 ml-auto lg:ml-0">
          <Link
            href="/auth/login"
            className="bg-amber-500 hover:bg-amber-400 text-black font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors flex items-center gap-2 shadow-lg"
          >
            ♟ Portal Login
          </Link>
        </div>

        {/* Hamburger (Mobile/Tablet) */}
        <div className="lg:hidden ml-auto md:ml-6 flex items-center">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="focus:outline-none"
            aria-label="Toggle Menu"
          >
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div className="md:hidden px-6 pb-4 space-y-2 text-base font-light">
          <Link href="/" className="block hover:text-gray-300">Home</Link>
          <Link href="#courses" className="block hover:text-gray-300">Programs</Link>
          <Link href="#about" className="block hover:text-gray-300">About us</Link>
          <Link href="#" className="block hover:text-gray-300">News</Link>
          <Link href="#contact" className="block hover:text-gray-300">Contact</Link>
        </div>
      )}
    </nav>
  );
}
