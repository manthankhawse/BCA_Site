'use client'
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import logo from '../assets/BCA Logo (Transparent).png'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-[#232323] text-white border-b border-gray-700 w-full">
      <div className="relative h-24 flex items-center px-6">
        {/* Left Logo */}
        <div className="absolute left-6 top-1/2 -translate-y-1/2 h-full flex items-center">
          <Image
            src={logo}
            alt="Logo"
            width={80}
            height={80}
            className="h-full w-auto object-contain"
          />
        </div>

        {/* Centered Links (Desktop) */}
        <div className="hidden md:flex mx-auto space-x-12 text-lg font-light">
          <Link href="/" className="hover:text-gray-300">Home</Link>
          <Link href="/#courses" className="hover:text-gray-300">Programs</Link>
          <Link href="/#about" className="hover:text-gray-300">About us</Link>
          <Link href="/#" className="hover:text-gray-300">Gallery</Link>
          <Link href="/#contact" className="hover:text-gray-300">Contact</Link>
        </div>

        {/* Hamburger (Mobile) */}
        <div className="ml-auto md:hidden">
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
