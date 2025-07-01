'use client';
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

const courses = [
  {
    title: "Beginner Training",
    image: "/assets/beginner_training.jpg",
    description:
      "Beginners level is a certified chess course where one can learn chess at any age. This course includes laws of chess and basic knowledge of opening, middlegame and endgame techniques. Join an interactive online chess class and learn with fun.",
  },
  {
    title: "Intermediate Training",
    image: "/assets/intermediate_training.jpg",
    description:
      "Structured course to train students in chess strategy and tournament readiness. Aim: high-level FIDE ratings.",
  },
  {
    title: "Advanced Training",
    image: "/assets/advanced_training.jpg",
    description:
      "Professional-level training under IMs/GMs. Focus: deep openings, endgames, psychology, competitive prep.",
  },
  {
    title: "Online Training",
    image: "/assets/online-learning.png",
    description:
      "Expert tutorials, interactive lessons, and tools to master chess. For all levels. Join online and improve fast.",
  },
];

export default function Courses() {
  const [flippedCards, setFlippedCards] = useState(Array(courses.length).fill(false));

  const handleFlip = (index) => {
    const newFlipped = [...flippedCards];
    newFlipped[index] = !newFlipped[index];
    setFlippedCards(newFlipped);
  };

  return (
    <section id="courses" className="relative py-16 px-4 bg-[#232323] text-white overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 z-0 bg-center bg-cover blur-sm opacity-30"
        style={{
          backgroundImage:
            "url('https://images.chesscomfiles.com/uploads/v1/article/17832.ef7f22ca.668x375o.7c3c4a5ed823@2x.jpeg')",
        }}
      ></div>

      {/* Foreground */}
      <div className="relative z-10 max-w-7xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-2">BCA Courses</h2>
        <div className="h-1 w-16 bg-gray-500 mx-auto mb-12"></div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {courses.map((course, idx) => (
            <div
              key={idx}
              className="group [perspective:1000px] w-full h-80 mx-auto cursor-pointer"
              onClick={() => handleFlip(idx)}
            >
              <div
                className={`relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] ${
                  flippedCards[idx] ? "[transform:rotateY(180deg)]" : "group-hover:[transform:rotateY(180deg)]"
                }`}
              >
                {/* Front */}
                <div className="absolute inset-0 bg-gray-700 rounded-xl backface-hidden flex flex-col items-center justify-center p-4">
                  <Image
                    src={course.image}
                    alt={course.title}
                    width={260}
                    height={160}
                    className="w-full h-40 object-cover rounded-md"
                  />
                  <h3 className="text-white text-lg font-semibold mt-3">{course.title}</h3>
                </div>

                {/* Back */}
                <div className="absolute inset-0 bg-cyan-400 text-black rounded-xl backface-hidden [transform:rotateY(180deg)] flex flex-col justify-between p-4 text-left">
                  <div>
                    <h3 className="text-lg font-bold mb-2">{course.title}</h3>
                    <p className="text-sm">{course.description}</p>
                  </div>
                  <Link href="/register" className="mt-4">
                    <button className="bg-white text-black px-4 py-2 rounded-full text-sm font-semibold hover:bg-gray-100">
                      Join Now
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
