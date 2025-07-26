"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

const accordionData = [
  {
    title: "What Makes Us Unique?",
    content: `Authentic Handcrafted Products. Every item featured on our platform is 100% handmade, ensuring uniqueness and individuality. No two pieces are exactly the same, making your purchase truly special.`
  },
  {
    title: "Sustainable & Eco-Friendly",
    content: `We prioritize natural, locally sourced materials and environmentally conscious production techniques that minimize waste and reduce our carbon footprint.`
  },
  {
    title: "Empowering Local Artisans",
    content: `By eliminating middlemen, we ensure fair compensation to our artisans, helping them build sustainable livelihoods and encouraging the younger generation to continue their cultural legacy.`
  },
  {
    title: "Cultural Preservation",
    content: `Each product is a piece of Rishikesh’s heritage — infused with spiritual symbolism, traditional techniques, and cultural stories. We aim to keep these traditions alive by providing a platform where they are celebrated and valued.`
  },
  {
    title: "Global Accessibility with Local Roots",
    content: `Whether you’re shopping from India or abroad, our platform brings the soul of Rishikesh to your doorstep with a seamless online shopping experience and reliable worldwide shipping.\n\nAt Rishikesh Handmade Craft, we envision a world where conscious consumerism supports tradition, where handmade replaces mass-produced, and where every purchase carries purpose. When you choose us, you don’t just buy a product — you become a part of a larger story: one of culture, compassion, and community.\n\nThank you for supporting our mission to preserve heritage and empower artisans, one handmade piece at a time.`
  }
];
const teamMembers = [
  { name: "John Doe", role: "CEO & Founder" },
  { name: "Ivan Mathews", role: "iOS Developer" },
  { name: "Macauley Herring", role: "Customer Success" },
  { name: "Alya Levine", role: "CTO" },
  { name: "Rose Hernandez", role: "Backend Developer" },
  { name: "Elen Benitez", role: "Designer" },
];
const AboutMe = () => {
  const [openIndex, setOpenIndex] = useState(0);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const res = await fetch("/api/team");
        if (!res.ok) throw new Error("Failed to fetch team data");
        const data = await res.json();
        setTeamMembers(data);
      } catch (err) {
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
  }, []);
  return (
    <div className="w-full min-h-screen bg-[#fcf7f1]">
      {/* Banner */}
      <div className="relative w-full h-[150px] md:h-[250px] flex items-center justify-center bg-secondary overlay-black-light">
        <Image
          src="/bg1.jpg"
          alt="About Banner"
          layout="fill"
          objectFit="cover"
          className="z-0 opacity-80"
          priority
        />
        <div className="relative z-10 text-center text-white">
          <h1 className="text-xl md:text-5xl font-bold mb-2 drop-shadow-lg">About Rishikesh Handmade</h1>
        </div>
      </div>

      {/* Main Content */}
      <section className="content-inner py-16 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-10 items-stretch">
            {/* Left: Text and Accordion */}
            <div className="lg:w-1/2 flex flex-col justify-center overflow-y-auto">
              <div className="mb-8">
                <h2 className="text-xl md:text-5xl font-bold mb-6 text-gray-800">“Rooted in Nature, Crafted by Tradition.”</h2>
                <p className="text-md text-gray-700 leading-relaxed mb-6">
                  Welcome to Rishikesh Handmade Craft — your gateway to the timeless art and culture of Rishikesh. Our platform is dedicated to preserving and promoting the rich heritage of this sacred region by showcasing an exclusive collection of eco-friendly, handcrafted items. From intricate wooden carvings and traditional paintings to artisanal jewelry and elegant home décor, each piece is thoughtfully created by skilled local artisans who carry forward generations of craftsmanship.<br /><br />
                  At Rishikesh Handmade Craft, we believe in more than just selling products — we believe in telling stories. Every item on our platform embodies the soul of Rishikesh, blending natural materials with artistic traditions to create something truly unique and meaningful. By supporting our initiative, you contribute to the empowerment of local communities, the preservation of ancient skills, and the promotion of sustainable living.<br /><br />
                  At Rishikesh Handmade Craft, we are more than just an e-commerce platform — we are a movement to revive, support, and celebrate the timeless heritage of Rishikesh through handcrafted art. Nestled in the foothills of the Himalayas, Rishikesh is a land known not only for its spiritual aura but also for its deeply rooted artistic traditions. Our mission is to bring these soulful creations to a global audience while uplifting the lives of the skilled artisans behind them.<br /><br />
                  We partner directly with local craftsmen and women from Rishikesh and nearby villages who specialize in traditional art forms passed down through generations. These artisans pour their heart and soul into every product — whether it's an intricately carved wooden artifact, a hand-painted canvas, ethically made jewelry, or eco-friendly home décor. Each piece reflects the essence of Indian culture, spirituality, and sustainability.
                </p>
              </div>

              {/* Accordion */}
              <div className="w-full max-w-2xl mx-auto mb-8">
                {accordionData.map((item, idx) => {
                  // Create a ref for each accordion item
                  const contentRef = React.useRef(null);
                  // Calculate maxHeight for transition
                  const isOpen = openIndex === idx;
                  const [height, setHeight] = React.useState(0);

                  React.useEffect(() => {
                    if (isOpen && contentRef.current) {
                      setHeight(contentRef.current.scrollHeight);
                    } else {
                      setHeight(0);
                    }
                  }, [isOpen]);

                  return (
                    <div key={idx} className="mb-2 border border-gray-200 rounded-lg bg-white shadow-sm">
                      <button
                        className={`w-full flex justify-between items-center px-6 py-4 text-left font-semibold text-lg transition focus:outline-none ${isOpen ? 'text-amber-700' : 'text-gray-800'}`}
                        onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                        aria-expanded={isOpen}
                      >
                        <span className="text-sm md:text-xl">{item.title}</span>
                        <span className="text-3xl">{isOpen ? '-' : '+'}</span>
                      </button>
                      <div
                        ref={contentRef}
                        style={{
                          maxHeight: isOpen ? height : 0,
                          opacity: isOpen ? 1 : 0,
                          overflow: 'hidden',
                          transition: 'max-height 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.3s',
                        }}
                        className="px-6 py-2"
                      >
                        <p className="text-gray-700 text-base whitespace-pre-line">{item.content}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Images Grid */}
            <div className="lg:w-1/2 min-h-[600px] h-full flex">
              <div className="grid grid-cols-5 gap-4 w-full ">
                <div className="col-span-3">
                  <Image src="/A1.jpg" alt="A1" width={900} height={400} className="rounded-lg shadow-lg object-cover w-full h-full" />
                </div>
                <div className="col-span-2">
                  <Image src="/A2.jpg" alt="A2" width={300} height={400} className="rounded-lg shadow-lg object-cover w-full h-full" />
                </div>

                <div className="col-span-5 row-span-2">
                  <Image src="/A3.jpg" alt="A3" width={800} height={300} className="rounded-lg shadow-lg object-cover w-full h-auto" />
                </div>
                <div className="col-span-5 row-span-2">
                  <Image src="/A4.jpg" alt="A4" width={400} height={300} className="rounded-lg shadow-lg object-cover w-full h-auto" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

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

      <section className="content-inner py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8 mb-10 items-center">
            {/* Left: Heading and Paragraph */}
            <div className="w-full lg:w-[57%]">
              <h2 className="text-3xl md:text-5xl font-bold mb-4 text-black leading-tight">Our Team of Experts</h2>
              <p className="text-md text-gray-700 mb-4">
                Behind Rishikesh Handmade Craft is a dedicated team of experienced professionals and industry veterans who share a deep passion for traditional Indian craftsmanship. Our core team includes expert artisans, designers, curators, and community leaders — many of whom have over 20 years of hands-on experience in the handicraft and cottage industry.
                <br />
                <br />
                These individuals have not only mastered their craft but have also played a pivotal role in shaping the future of local artisans. Through years of dedication, they have created opportunities, launched training initiatives, and set new benchmarks in quality and innovation. Their deep understanding of cultural artistry, sustainable practices, and market trends ensures that every product we offer meets the highest standards while staying true to its roots.
              </p>
            </div>
            {/* Right: Two Images in a row (first two team members) */}
            <div className=" hidden md:flex w-full lg:w-[43%] flex-row gap-8 items-start justify-center">
              {loading ? (
                <div>Loading Team Member...</div>
              ) : teamMembers.length > 0 ? (
                teamMembers.slice(0, 2).map((member, idx) => (
                  <div key={member._id || idx} className="flex flex-col items-center">
                    <div className={`relative w-72 h-72 rounded-2xl overflow-hidden shadow-lg ${idx === 0 ? "bg-[#f6e9da]" : "bg-[#d6f0fa]"} flex items-center justify-center`}>
                      <Image src={member.image?.url || "/placeholder.jpeg"} alt={member.title} width={224} height={224} className="object-cover w-full h-full" />
                    </div>
                    <div className="mt-3 text-center">
                      <div className="font-bold text-lg">{member.title}</div>
                      <div className="text-xs text-gray-600">{member.designation}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div>No team members found.</div>
              )}
            </div>
          </div>

          {/* Team Grid (remaining team members) */}
          <div className="hidden md:flex grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-8 mb-10">
            {loading ? (
              <div>Loading...</div>
            ) : teamMembers.length > 2 ? (
              teamMembers.slice(2).map((member, idx) => (
                <div key={member._id || idx} className="flex flex-col items-center">
                  <div className="w-72 h-72 rounded-2xl overflow-hidden shadow-lg bg-[#d6f0fa] flex items-center justify-center">
                    <Image src={member.image?.url || "/placeholder.jpeg"} alt={member.title} width={224} height={224} className="object-cover w-full h-full" />
                  </div>
                  <div className="mt-3 text-center">
                    <div className="font-bold text-lg">{member.title}</div>
                    <div className="text-xs text-gray-600">{member.designation}</div>
                  </div>
                </div>
              ))
            ) : null}
          </div>

          {/* Team Grid (remaining team members for mobile) */}
          <div className="md:hidden grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 md:gap-8 gap-4 mb-10">
            {loading ? (
              <div>Loading Team Members...</div>
            ) : teamMembers.length > 0 ? (
              teamMembers.map((member, idx) => (
                <div key={member._id || idx} className="flex flex-col items-center">
                  <div className="md:w-72 w-full h-full md:h-72 rounded-2xl overflow-hidden shadow-lg bg-[#d6f0fa] flex items-center justify-center">
                    <Image src={member.image?.url || "/placeholder.jpeg"} alt={member.title} width={224} height={224} className="object-cover w-full h-full" />
                  </div>
                  <div className="mt-3 text-center">
                    <div className="font-bold text-md">{member.title}</div>
                    <div className="text-xs text-gray-600">{member.designation}</div>
                  </div>
                </div>
              ))
            ) : null}
          </div>

          <div className="mb-10 text-base text-gray-700">
            These individuals have not only mastered their craft but have also played a pivotal role in shaping the future of local artisans. Through years of dedication, they have created opportunities, launched training initiatives, and set new benchmarks in quality and innovation. Their deep understanding of cultural artistry, sustainable practices, and market trends ensures that every product we offer meets the highest standards while staying true to its roots.
          </div>


          {/* Testimonial Section Start */}
          {/* <section className="w-full py-16 flex flex-col md:flex-row items-center justify-center gap-8 relative overflow-hidden">
  
            <div className="relative flex-1 flex items-center justify-center min-h-[400px]">
              <img
                src="/pic1_1.jpg" // Place your image in public folder or update the path
                alt="Happy Client"
                className="object-contain h-[420px] z-10 relative"
              />
     
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-lg flex items-center gap-3 px-4 py-2 z-20">
                <div className="flex -space-x-2">
                  <img src="/pic1_1.jpg" alt="user1" className="w-8 h-8 rounded-full border-2 border-white" />
                  <img src="/pic1_1.jpg" alt="user2" className="w-8 h-8 rounded-full border-2 border-white" />
                </div>
                <div className="flex flex-col text-xs">
                  <span className="font-semibold">Our Satisfied User</span>
                  <span className="text-gray-500">+12K</span>
                </div>
              </div>
             
            </div>

        
            <div className="flex-1 flex items-center justify-center">
              <div className="bg-white rounded-2xl shadow-lg p-8 max-w-xl w-full relative">
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
                  What Our Clients Say<br />About Us
                </h2>
                <p className="text-gray-600 mb-8">
                  It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English.
                </p>
                <div className="flex items-center gap-4">
                  <img src="/pic1_1.jpg" alt="Kenneth Fong" className="w-12 h-12 rounded-full object-cover" />
                  <div>
                    <div className="font-semibold text-gray-800">Kenneth Fong</div>
                    <div className="text-xs text-gray-500">Postgraduate Student</div>
                  </div>
                  <div className="ml-auto flex gap-2">
                    <button className="w-8 h-8 rounded-full bg-[#FEEAD3] flex items-center justify-center text-gray-700 hover:bg-[#FDD7A2]">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                      </svg>
                    </button>
                    <button className="w-8 h-8 rounded-full bg-[#FEEAD3] flex items-center justify-center text-gray-700 hover:bg-[#FDD7A2]">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section> */}
  
        </div>
      </section>
    </div>
  );
};

export default AboutMe;