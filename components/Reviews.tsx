"use client";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

const reviews = [
  {
    name: "Krupal Wanjari",
    comment: "My son joined this Academy in 2014 and has achieved a lot—from Unrated to Rated and many tournament wins. He is a champion in Under 07, 09, and 11 age groups and won an Asian Gold medal in Under-09.",
  },
  {
    name: "Rudraksh Borkar",
    comment: "The best academy to learn chess. BCA helps students improve step by step from beginner to advanced level.",
  },
  {
    name: "Hiranmay Ingale",
    comment: "One of the best coaching centers for chess in Nagpur. Supportive coaches and a disciplined, friendly environment.",
  },
  {
    name: "Bhakti Titarmare",
    comment: "From a beginner to a 1558-rated player, Nilesh Sir's mentorship helped me win many championships. Eternally grateful!",
  },
  {
    name: "Shruti Nakhate",
    comment: "The academy is excellent. Very good environment—safe, friendly, and highly effective coaching. Highly recommend a visit!",
  },
];

export default function Reviews() {
  const [index, setIndex] = useState(0);

  const nextSlide = () => setIndex((index + 1) % reviews.length);
  const prevSlide = () => setIndex((index - 1 + reviews.length) % reviews.length);

  return (
    <section className="py-16 bg-white px-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
          What Our Students Say
        </h2>
        
        <div className="relative">
          {/* Main review card */}
          <div className="bg-gray-50 rounded-2xl p-8 md:p-12 shadow-sm border border-gray-100 min-h-[280px] flex flex-col justify-center">
            {/* Stars */}
            {/* <div className="flex justify-center mb-6">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
              ))}
            </div> */}
            
            {/* Review text */}
            <p className="text-lg text-gray-700 text-center leading-relaxed mb-8 italic">
              "{reviews[index].comment}"
            </p>
            
            {/* Reviewer name */}
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900">
                {reviews[index].name}
              </h3>
            </div>
          </div>

          {/* Navigation buttons */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-900 p-3 rounded-full shadow-md border border-gray-200 transition-all duration-200"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-900 p-3 rounded-full shadow-md border border-gray-200 transition-all duration-200"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Dots indicator */}
        <div className="flex justify-center mt-8 space-x-2">
          {reviews.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                i === index ? 'bg-gray-900 w-8' : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}