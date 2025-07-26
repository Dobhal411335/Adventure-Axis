"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import React from 'react'

const accordionData = [
  {
    title: "What Sets Us Apart:",
    content: "Specialization in Natural Fiber Products: Expertly handcrafted eco-products made from jute, hemp, bamboo, and other sustainable materials. "
  },
  {
    title: "100% Handmade & Authentic:",
    content: "No factory replicas. Every item carries the uniqueness and imperfection of a true handmade creation. "
  },
  {
    title: "Eco-Friendly Commitment:",
    content: "We embrace slow fashion and sustainable living, minimizing waste and avoiding plastic in our packaging and production."
  },
  {
    title: "Fair Trade & Artisan Empowerment:",
    content: "Ethical partnerships that support and uplift local communities, not just profit from them."
  },
  {
    title: "Cultural Soul in Every Product:",
    content: "Each item tells a story — of Rishikesh, its people, and its rich cultural legacy."
  },
];


const WhatWeDo = () => {
  const [openIndex, setOpenIndex] = useState(0);
  return (
    <div className="w-full min-h-screen bg-[#fcf7f1]">
      {/* Banner */}
      <div className="relative w-full h-[100px] md:h-[320px] flex items-center justify-center">
        <Image src="/bg7.jpg" alt="Banner" layout="fill" objectFit="cover" className="z-0 opacity-80" priority />
        <div className="absolute left-[10%] top-10 z-10 container w-fit mx-auto px-4 hidden md:flex flex-col justify-center h-full bg-white rounded-xl">
          <div className=" max-w-2xl flex-col items-center justify-center px-10">
            <h1 className="text-3xl  font-semibold text-black mb-2 drop-shadow-lg">The Impact of What We Do How <br /> We Make a Difference</h1>
            <div className="w-96 rounded-lg overflow-hidden shadow-lg">
              <Image src="/pic7.jpg" alt="Intro" width={300} height={300} className="object-cover w-full h-full" />
            </div>
          </div>
        </div>
      </div>
      <div className="md:hidden py-10 flex flex-col items-center justify-center">
            <h1 className="text-xl font-semibold text-center text-black mb-2 drop-shadow-lg">The Impact of What We Do How <br /> We Make a Difference</h1>
            <div className="w-96 rounded-lg overflow-hidden shadow-lg px-2">
              <Image src="/pic7.jpg" alt="Intro" width={300} height={300} className="object-cover w-full h-full" />
            </div>
          </div>

      {/* Main Content */}
      <section className="content-inner about-style3 md:py-16 py-5">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-10">
            {/* Left Side */}
            <div className="lg:w-7/12 w-full">
              <div className="md:p-8 mb-8">
                <h4 className="text-xl md:text-2xl md:text-3xl font-bold mb-4 text-amber-700">Bringing you soulful, sustainable art — one handmade piece at a time.</h4>
                <p className="text-sm md:text-base text-gray-700 mb-4">
                  At Rishikesh Handmade Craft, we don’t just sell handmade products — we offer a piece of nature, culture, and community. While many marketplaces source mass-produced or factory-replicated goods, we stay firmly committed to authentic, eco-conscious craftsmanship, with a strong specialization in natural fiber products. <br /><br />
                  Our collections are made using locally sourced, biodegradable materials such as jute, hemp, cotton, bamboo, and banana fiber — all chosen for their minimal environmental impact and natural beauty. These fibers are not only sustainable but also deeply embedded in India’s artisanal traditions, making each product a harmonious blend of heritage and environmental responsibility.<br /><br />
                  Unlike others, we work directly with artisans, ensuring they receive fair wages and continued support. This hands-on, ethical approach allows us to maintain quality, authenticity, and transparency in every step — from sourcing raw materials to the final handcrafted piece you receive.
                </p>

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
                          className={`w-full flex justify-between items-center px-4 py-3 text-left font-semibold text-lg transition focus:outline-none ${isOpen ? 'text-amber-700' : 'text-gray-800'}`}
                          onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                          aria-expanded={isOpen}
                        >
                          <span>{item.title}</span>
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
            </div>
            {/* Right Side - keep width fixed and separated */}
            <div className="lg:w-5/12 w-full flex items-center justify-center">
              <div className="w-[100%] min-w-[260px] h-[95%] rounded-xl overflow-hidden shadow-lg bg-white flex items-center justify-center">
                <Image src="/Rishikesh.jpg" alt="Rishikesh" width={400} height={500} className="object-cover w-full h-full" />
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Get in Touch Section */}
      <section className="w-full bg-black py-5 text-white flex flex-col md:flex-row items-center justify-between  md:px-24 gap-6 ">
        <div className="md:mb-6 md:mb-0 md:px-3">
          <h3 className="text-xl md:text-3xl font-bold gap-2 text-center md:text-start">Questions?
            <br className="md:hidden" />
            <span className="text-sm md:text-lg font-normal px-2">Our experts will help find the gear that’s right for you</span>
          </h3>
        </div>
        <Link href="/contact" className="btn bg-white text-black font-bold px-8 py-3 rounded-lg shadow transition">Get In Touch</Link>
      </section>
    </div>
  );
};

export default WhatWeDo;