import Image from "next/image";
import main from '../assets/bg updated.jpg'

export default function Hero() {
  return (
    <section className="bg-[#232323] text-white min-h-[70vh] flex flex-col md:flex-row items-center justify-around px-6 md:px-12 py-10">
      {/* Left Section */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-start gap-6 text-left">
        <h1 className="text-4xl font-serif tracking-wide">
          Brilliant Chess Academy
        </h1>
        <p className="text-lg md:text-xl font-serif tracking-wide leading-relaxed">
          Welcome to Brilliant Chess Academy, where strategic brilliance begins. Join our community and elevate your chess skills with expert guidance. Whether you're a novice or a seasoned player, our academy is the perfect place to embark on your chess journey. Let every move be a step toward unlocking your full potential.
        </p>
      </div>

      {/* Right Section */}
      <div className="w-full md:w-1/2 flex justify-center items-center p-4 mt-8 md:mt-0">
        <Image
          src={main}
          alt="Chess background"
          width={400}
          height={300}
          className="h-[33vh] w-[55vh] object-cover rounded-md shadow-lg"
        />
      </div>
    </section>
  );
}
