"use client";
import Image from "next/image";
import Link from "next/link";

const VisionMission = () => {
  return (
    <section className="w-full bg-[#fcf7f1] min-h-screen">
      <div className="w-full">
        <div className="relative w-full h-[100px] md:h-[250px] flex items-center justify-center bg-[#fcf7f1] overlay-black-light">
          <Image
            src="/bg1.jpg"
            alt="About Banner"
            layout="fill"
            objectFit="cover"
            className="z-0 opacity-80"
            priority
          />
          <div className="relative z-10 text-center text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-2 drop-shadow-lg">Our Vision & Mission</h1>
            </div>
        </div>
        <div className="w-full px-2 container mx-auto flex gap-10 items-center mt-10">
          {/* Left: Intro & Image */}
          <div className="w-full flex flex-col items-start">
            <h2 className="text-xl md:text-4xl font-bold mb-6 text-gray-800 text-start lg:text-start">“Rooted in Nature, Crafted by Tradition.”</h2>
            <p className="text-md md:text-lg text-gray-700 leading-relaxed mb-6 text-start lg:text-justify">
              At Rishikesh Handmade Craft, we are more than just an e-commerce platform — we are a movement to revive, support, and celebrate the timeless heritage of Rishikesh through handcrafted art. Nestled in the foothills of the Himalayas, Rishikesh is a land known not only for its spiritual aura but also for its deeply rooted artistic traditions. Our mission is to bring these soulful creations to a global audience while uplifting the lives of the skilled artisans behind them.<br /><br />
              We partner directly with local craftsmen and women from Rishikesh and nearby villages who specialize in traditional art forms passed down through generations. These artisans pour their heart and soul into every product — whether it's an intricately carved wooden artifact, a hand-painted canvas, ethically made jewelry, or eco-friendly home décor. Each piece reflects the essence of Indian culture, spirituality, and sustainability.
            </p>
          </div>

        </div> {/* Right: Vision & Mission */}
        <div className="container mx-auto w-full flex flex-col md:flex-row gap-8 px-2">
          <div className="w-full md:w-2/3 flex justify-center mb-6 ">
            <Image src="/Vision.jpg" alt="Vision" width={300} height={300} className="rounded-xl shadow-lg object-cover w-fit h-auto " />
          </div>
          {/* Vision */}
          <div className="w-full md:w-1/2 flex-col mb-4">
            <div className="rounded-xl  p-6 mb-4 border border-gray-400">
              <h3 className="text-2xl font-bold mb-2 text-amber-700">Our Vision</h3>
              <p className="text-gray-700 text-base">
                To become a globally recognized platform that celebrates and sustains the timeless art of Rishikesh by empowering local artisans, promoting eco-conscious living, and connecting the world to the soul of Indian craftsmanship through natural, handmade creations.
              </p>
            </div>
            {/* Mission */}
            <div className=" rounded-xl  p-6 border border-gray-400">
              <h3 className="text-2xl font-bold mb-2 text-amber-700">Our Mission</h3>
              <ul className="list-disc pl-6 text-gray-700 text-base space-y-2">
                <li>To preserve and promote traditional handicrafts of Rishikesh and nearby regions by supporting skilled artisans and their generational knowledge.</li>
                <li>To create a sustainable ecosystem for handmade goods, with a special focus on natural fiber products such as jute, hemp, cotton, bamboo, and banana fiber.</li>
                <li>To provide fair trade opportunities, ensuring artisans receive the respect, recognition, and remuneration they deserve.</li>
                <li>To deliver authentic, eco-friendly, and ethically made products that align with conscious consumer values.</li>
                <li>To bridge the gap between local craft communities and global markets, making handcrafted products accessible to people who value culture, sustainability, and craftsmanship.</li>
                <li>To inspire a movement of responsible shopping, where every purchase supports a story of heritage, nature, and human connection.</li>
              </ul>
            </div>
          </div>

        </div>
      </div>
   {/* Get In Touch Section */}
   <section className="w-full bg-black py-5 text-white flex flex-col md:flex-row items-center justify-between  md:px-24 gap-6 ">
        <div className="md:mb-6 md:mb-0 md:px-3">
          <h3 className="text-xl md:text-3xl font-bold gap-2 text-center md:text-start">Questions?
            <br className="md:hidden" />
            <span className="text-sm md:text-lg font-normal px-2">Our experts will help find the gear that’s right for you</span>
          </h3>
        </div>
        <Link href="/contact" className="btn bg-white text-black font-bold px-8 py-3 rounded-lg shadow transition">Get In Touch</Link>
      </section>
    </section>

  );
};

export default VisionMission;