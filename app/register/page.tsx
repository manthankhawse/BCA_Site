"use client";

import React, { useState } from "react";

type FormData = {
  name: string;
  dob: string;
  email: string;
  ratingClassical: string;
  ratingRapid: string;
  ratingBlitz: string;
  address: string;
  phone: string;
  level: string;
};

type InputProps = {
  label: string;
  name: keyof FormData;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function RegisterForm() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    dob: "",
    email: "",
    ratingClassical: "",
    ratingRapid: "",
    ratingBlitz: "",
    address: "",
    phone: "",
    level: "Beginner",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Submitted Data:", formData);
    // TODO: Send to backend
  };

  return (
    <div className="relative min-h-screen bg-black">
      {/* Blurred background */}
      <div
        className="absolute inset-0 bg-cover bg-center blur-sm"
        style={{
          backgroundImage: `url("https://wallpapercave.com/wp/aniTxU8.jpg")`,
        }}
      ></div>

      {/* Form card */}
      <div className="relative z-10 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-xl bg-black/80 text-white rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-bold text-center mb-8">Contact Us</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input label="Name" name="name" type="text" value={formData.name} onChange={handleChange} />

            <Input label="Date of Birth" name="dob" type="date" value={formData.dob} onChange={handleChange} />

            <Input label="Email" name="email" type="email" value={formData.email} onChange={handleChange} />

            <div>
              <label className="block font-semibold mb-2">FIDE Ratings</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <input
                  name="ratingClassical"
                  type="text"
                  placeholder="Classical"
                  value={formData.ratingClassical}
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg bg-white bg-opacity-80 text-black outline-none"
                />
                <input
                  name="ratingRapid"
                  type="text"
                  placeholder="Rapid"
                  value={formData.ratingRapid}
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg bg-white bg-opacity-80 text-black outline-none"
                />
                <input
                  name="ratingBlitz"
                  type="text"
                  placeholder="Blitz"
                  value={formData.ratingBlitz}
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg bg-white bg-opacity-80 text-black outline-none"
                />
              </div>
            </div>

            <Input label="Address" name="address" type="text" value={formData.address} onChange={handleChange} />
            <Input label="Phone Number" name="phone" type="text" value={formData.phone} onChange={handleChange} />

            <div>
              <label className="block font-semibold mb-1">Level</label>
              <select
                name="level"
                value={formData.level}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-gray-700 text-white outline-none"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <div className="text-center">
              <button
                type="submit"
                className="px-6 py-3 rounded-full bg-yellow-400 text-black font-semibold hover:bg-yellow-300 transition-all"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function Input({ label, name, type, value, onChange }:InputProps) {
  return (
    <div>
      <label htmlFor={name} className="block font-semibold mb-1">
        {label}
      </label>
      <input
        name={name}
        type={type}
        id={name}
        value={value}
        onChange={onChange}
        required
        className="w-full p-3 rounded-lg bg-white bg-opacity-80 text-black outline-none"
      />
    </div>
  );
}
