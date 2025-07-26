"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

const Team = () => {
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
      <div className="relative w-full h-[100px] md:h-[250px] flex items-center justify-center">
        <Image
          src="/bg1.jpg"
          alt="Team Banner"
          layout="fill"
          objectFit="cover"
          className="z-0 opacity-80"
          priority
        />
        <div className="relative z-10 text-center text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 drop-shadow-lg">Team of Experts</h1>
          {/* <nav aria-label="breadcrumb" className="flex justify-center">
            <ul className="flex gap-2 text-lg">
              <li>
                <Link href="/" className="hover:underline">Home</Link>
              </li>
              <li>/</li>
              <li className="text-amber-300">Our Team</li>
            </ul>
          </nav> */}
        </div>
      </div>

      {/* Main Content */}
      <section className="content-inner py-10 md:py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8 mb-10 items-start">
            {/* Left: Heading and Paragraph */}
            <div className="w-full lg:w-[57%]">
              <h2 className="text-xl md:text-5xl font-semibold mb-4 text-gray-800 leading-tight">Behind Rishikesh Handmade Craft is a dedicated team of experienced professionals and industry veterans who share a deep passion for traditional Indian craftsmanship.</h2>
              <p className="text-md md:text-xl text-gray-700 mb-4">
                Our core team includes expert artisans, designers, curators, and community leaders — many of whom have over 20 years of hands-on experience in the handicraft and cottage industry.
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

          {/* Contributions Section */}
          <div className="rounded-xl p-4 md:p-8 border border-gray-400">
            <h2 className="text-xl md:text-3xl font-bold mb-4 text-gray-800">Our Team’s Contributions Include:</h2>
            <ul className="list-decimal pl-6 text-sm md:text-lg text-gray-700 space-y-2">
              <li><span className="font-bold">Mentoring and Training:</span> Providing skill development and mentorship to hundreds of young and emerging artisans in and around Rishikesh.</li>
              <li><span className="font-bold">Empowering Communities:</span> Helping local craftspeople access fair markets, increase income, and gain financial independence.</li>
              <li><span className="font-bold">Innovation with Tradition:</span> Blending ancient techniques with contemporary design to make traditional products appealing to modern audiences.</li>
              <li><span className="font-bold">Creating Global Milestones:</span> Leading successful exhibitions, collaborations, and export initiatives that brought Rishikesh’s art to global recognition.</li>
              <li><span className="font-bold">Sustainable Future:</span> Our team is committed to continuing this journey — one that not only preserves heritage but also builds a sustainable future for the artisan community. With their guidance and expertise, Rishikesh Handmade Craft continues to be a trusted bridge between tradition and the global marketplace.</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Team;