import About from "@/components/About";
import Courses from "@/components/Courses";
import Footer from "@/components/Footer";
import Gallery from "@/components/Gallery";
import Hero from "@/components/Hero";
import Reviews from "@/components/Reviews";
import Tournaments from "@/components/Tournaments";

export default function Home() {
  return (
    <>
      {/* <h1 className="text-green-500">Hello</h1> */}
      {/* <Navbar/> */}
      <Hero/>
      <Tournaments/>
      <Courses/>
      <About/>
      <Gallery/>
      <Reviews/>
      <Footer/>
    </>
  );
}
