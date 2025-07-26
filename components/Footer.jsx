'use client'

import { Handshake, Phone, Send, MapPin } from "lucide-react"
import Link from "next/link"
import { usePathname } from 'next/navigation'
import { useEffect, useState } from "react"
import { Card, CardContent, CardFooter } from "./ui/card"
import Image from "next/image"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import toast from "react-hot-toast"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "./ui/accordion"
import CurrentYear from './CurrentYear';
const Footer = () => {
    const pathName = usePathname()
    const [pages, setPages] = useState([])

    useEffect(() => {
        const fetchPages = async () => {
            try {
                const response = await fetch("/api/getAllPages")
                const data = await response.json()
                setPages(data.pages)
            } catch (error) {
                // console.error("Error fetching pages:", error)
            }
        }
        fetchPages()
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault();
        const email = e.target.elements.email.value.trim();
        if (!email) {
            return toast.error("Please Enter Your Email", { style: { borderRadius: "10px", border: "2px solid red" } });
        }
        try {
            const res = await fetch('/api/newsLetter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (res.ok) {
                toast.success("Thank you for Subscribing!", { style: { borderRadius: "10px", border: "2px solid green" } });
                e.target.reset();
            } else {
                toast.error(data.message || "Subscription failed.", { style: { borderRadius: "10px", border: "2px solid red" } });
            }
        } catch {
            toast.error("An error occurred.", { style: { borderRadius: "10px", border: "2px solid red" } });
        }
    };

    return (
        <footer className={`print:hidden ${pathName.includes('admin') && 'hidden'}
         ${pathName.includes('artisan') && 'block'} ${pathName.includes('product') && 'block'} ${pathName.includes('customEnquiry') && 'hidden'} ${pathName.includes('checkout') && 'hidden'}  ${pathName.includes('category') && 'block'} bg-[#ededed] py-4 text-black`}>
            {/* <div className="w-full flex justify-center pb-8">
                <div className="h-[3px] bg-black w-full mx-auto px-4" />
            </div> */}
            <div className="hidden md:flex flex-wrap lg:justify-between px-10 justify-start md:gap-20 lg:gap-0 gap-12 max-w-[22rem] md:maxw-[45rem] lg:max-w-[60rem] xl:max-w-6xl mx-auto">
                <div className="flex flex-col gap-2 px-5">
                    <h1 className="font-semibold text-xl my-4">Main Menu</h1>
                    {pages.filter(page => !page?.link?.includes('policy')).map(page => (
                        <Link key={page._id} href={page.url} className="block text-black font-barlow ">
                            {page.title}
                        </Link>
                    ))}
                    <Link href={'/contact'} className="block text-black font-barlow ">Contact</Link>
                </div>

                <div className="flex flex-col gap-2 px-6">
                    <h1 className="font-semibold text-xl my-4">Our Policy</h1>
                    {pages.filter(page => page?.link?.includes('policy')).map(page => (
                        <Link key={page._id} href={page.url} className="block text-black font-barlow">
                            {page.title}
                        </Link>
                    ))}
                    <Link href={'/faq'} className="block text-black font-barlow ">FAQ</Link>
                </div>

                <div className="flex flex-col gap-1">
                    <h1 className="font-semibold text-xl flex items-center gap-2"> More Inquiry</h1>
                    <div className="flex items-center md:flex-row flex-col gap-2">

                        <Link href={'tel:+9107669280002'} className="my-2 text-sm block rounded-full py-1 font-barlow text-black flex items-center gap-2">
                            <Phone size={20} className="text-blue-600" />
                            +91 07669280002
                        </Link>
                        <Link href={'tel:+919897468886'} className="my-2 text-sm block rounded-full py-1 font-barlow text-black flex items-center gap-2">
                            +91 9897468886
                        </Link>
                    </div>
                    <Link href={'mailto:info@adventureaxis.in'} className="gap-2 my-2 block rounded-full font-barlow text-black flex items-center">
                        <Send className="text-blue-600" size={20} />
                        info@adventureaxis.in
                    </Link>
                    <Link href={'mailto:Accounts@adventureaxis.in'} className="gap-2 my-2 block rounded-full font-barlow text-black flex items-center">
                        <Send className="text-blue-600" size={20} />
                        Accounts@adventureaxis.in
                    </Link>
                    <Link href={'mailto:Sales@adventureaxis.in'} className="gap-2 my-2 block rounded-full font-barlow text-black flex items-center">
                        <Send className="text-blue-600" size={20} />
                        Sales@adventureaxis.in
                    </Link>
                    <p className="gap-2 my-2 font-barlow text-black mb-5 flex items-center">
                        <MapPin className="text-blue-600" size={20} />
                        Regd. Or Branch Office: Badrinath Road,
                        <br />
                        Tapovan, Laxmanjhula, Uttarakhand
                    </p>
                </div>
            </div>
            <div className="md:hidden flex items-center gap-2 lg:justify-between justify-start px-5">
                <div className="flex flex-col gap-2 px-2">
                    <h1 className="font-semibold text-xl my-4">Main Menu</h1>
                    {pages.filter(page => !page?.link?.includes('policy')).map(page => (
                        <Link key={page._id} href={page.url} className="text-sm block text-black font-barlow ">
                            {page.title}
                        </Link>
                    ))}
                    <Link href={'/contact'} className="text-sm block text-black font-barlow ">Contact</Link>
                </div>

                <div className="flex flex-col gap-2 px-2">
                    <h1 className="font-semibold text-xl my-4">Our Policy</h1>
                    {pages.filter(page => page?.link?.includes('policy')).map(page => (
                        <Link key={page._id} href={page.url} className="text-sm block text-black font-barlow">
                            {page.title}
                        </Link>
                    ))}
                    <Link href={'/faq'} className="text-sm block text-black font-barlow ">FAQ</Link>
                </div>
            </div>
            <div className="md:hidden flex flex-col gap-1 p-5">
                <h1 className="font-semibold text-xl flex items-center gap-2"> More Inquiry</h1>
                <div className="flex items-center md:flex-row flex-col gap-2">
                    <Link href={'tel:+9107669280002'} className="my-2 text-sm block rounded-full py-1 font-barlow text-black flex items-center gap-2">
                        <Phone size={20} className="text-blue-600" />
                        +91 07669280002
                    </Link>
                    <Link href={'tel:+919897468886'} className="my-2 text-sm block rounded-full py-1 font-barlow text-black flex items-center gap-2">
                        +91 9897468886
                    </Link>
                </div>
                <Link href={'mailto:support@adventureaxis.in'} className="my-2 text-sm block rounded-full font-barlow text-black flex items-center gap-2">
                    <Send className="text-blue-600" size={20} />
                    support@adventureaxis.in
                </Link>
                <Link href={'mailto:Accounts@adventureaxis.in'} className="my-2 text-sm block rounded-full font-barlow text-black flex items-center gap-2">
                    <Send className="text-blue-600" size={20} />
                    Accounts@adventureaxis.in
                </Link>
                <Link href={'mailto:Sales@adventureaxis.in'} className="my-2 text-sm block rounded-full font-barlow text-black flex items-center gap-2">
                    <Send className="text-blue-600" size={20} />
                    Sales@adventureaxis.in
                </Link>
                <p className="my-2 text-sm font-barlow text-black mb-5 flex items-center gap-2">
                    <MapPin className="text-blue-600" size={20} />
                    Regd. Or Branch Office: Badrinath Road,
                    <br />
                    Tapovan, Laxmanjhula, Uttarakhand
                </p>
            </div>

            {/* Accordance Section */}
            <div className="w-full flex justify-center my-4">
                <div className="w-[85%]">
                    <Accordion type="single" collapsible className="bg-[#fff] rounded-md  mb-8">
                        <AccordionItem value="item-1">
                            <AccordionTrigger className="text-black px-6 py-4 text-base ">IMPORTANT NOTICE</AccordionTrigger>
                            <AccordionContent className="text-gray-900 px-6 pb-6 pt-1 text-sm">
                                All our handicraft products are handcrafted by skilled artisans, which means each item is unique and may have slight variations in color, texture, or finish. These differences are a mark of authenticity and not defects. We ensure quality checks before dispatch, but due to the delicate nature of handmade goods, please handle them with care. Product images may slightly differ from actual items due to lighting or screen settings. Kindly review our return, shipping, and customization policies before placing an order. For any queries or special requests, feel free to contact our support team.</AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>
            </div>

            <Card className="my-2 px-2 py-8 max-w-xl lg:max-w-4xl xl:max-w-7xl mx-auto">
                <CardContent className="flex flex-col lg:flex-row items-start justify-between">
                    <div className="text-justify">
                        <Image src="/HeaderLogo.png" width={200} height={100} alt="footer" />
                        <p className="text-black text-sm lg:w-[40vw] xl:w-[35vw] font-barlow mt-6">Adventure Axis offers a comprehensive range of adventure sports equipment under one roof. Our categories include Water Sports Equipment such as rafts, kayaks, dry bags, paddles, life jackets, helmets, and repair kits. In Safety & Rescue, we provide harnesses, carabiners, ropes, pulleys, fall arresters, rescue devices, and helmets. Our Clothing & Footwear range features tactical eyewear, base layers, fleece, insulated wear, and high-performance outdoor footwear. We also specialize in Camping & Outdoor gear and Expedition Equipment, ensuring you're fully equipped for any terrain or challenge.</p>
                        <p className="text-black text-sm lg:w-[40vw] xl:w-[35vw] font-barlow mt-6">Our website is your gateway to the heart of Rishikesh, offering rich and soulful handmade creations crafted by local artisans.</p>
                    </div>
                    <div className="font-barlow mt-10 lg:mt-0">
                        <h1 className="font-semibold text-xl ">Subscribe to our newsletter</h1>
                        <form onSubmit={handleSubmit} className="mt-4 flex overflow-hidden rounded-lg bg-gray-200">
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="Enter your email"
                                className="border-0 rounded-none focus:ring-0 focus-visible:ring-0 focus:outline-none bg-gray-200"
                            />
                            <button
                                type="submit"
                                className="bg-red-600 text-white text-sm p-2 h-full"
                            >
                                Subscribe
                            </button>
                        </form>


                        <p className="text-black text-sm lg:w-[30vw] xl:w-[20vw]  mt-6">Stay Informed. Stay Ahead.</p>
                        <p className="text-black text-sm lg:w-[30vw] xl:w-[23vw]">Subscribe to our newsletter to get the latest updates.</p>
                    </div>
                </CardContent>
                <CardFooter className="mt-8 flex flex-col items-start md:w-fit">
                    <div className="w-full h-[1px] bg-gray-400" />
                    <div className="flex items-center justify-between font-barlow">
                        <div className="flex flex-col md:flex-row items-start  md:items-center gap-2">
                            <Link href={'/terms-condition'} className="0 !text-sm font-semibold">Terms of Use</Link>
                            <p className="text-gray-900 md:block hidden">|</p>
                            <Link href={'/privacy-policy'} className="0 !text-sm font-semibold">Privacy and Cookies Policy</Link>
                        </div>
                    </div>
                </CardFooter>
            </Card>
            <div className="flex flex-col lg:flex-row items-center justify-center max-w-[25rem] md:max-w-[60rem] xl:max-w-6xl mx-auto font-barlow">
                <p className="text-black font-bold text-center my-4">
                    &copy; <CurrentYear /> <Link href={'/'} className="font-bold text-black">Adventure Axis</Link>. All rights reserved
                </p>
            </div>
        </footer >
    )
}

export default Footer
