"use client";
import { useEffect, useState } from "react";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";

import Link from "next/link";

const Banner = () => {
    const [promotinalBanner, setPromotinalBanner] = useState([])
    const [featuredOffer, setFeaturedOffer] = useState([])
    const [isLoading, setIsLoading] = useState(true);
    // console.log(promotinalBanner)
    const fetchPromotinalBanner = async () => {
        try {
            const res = await fetch("/api/addPromotinalBanner");
            const data = await res.json();
            // console.log("Promotinal Banner API response:", data);
            if (data && data.length > 0) {
                setPromotinalBanner(data);
            } else {
                setPromotinalBanner([]);
            }
        } catch (error) {
            // console.error("Error fetching products:", error);
            setPromotinalBanner([]);
        } finally {
            setIsLoading(false);
        }
    };
    const fetchFeaturedOffer = async () => {
        try {
            const res = await fetch("/api/addFeaturedOffer");
            const data = await res.json();
            // console.log("Featured Offer API response:", data);
            if (data && data.length > 0) {
                setFeaturedOffer(data);
            } else {
                setFeaturedOffer([]);
            }
        } catch (error) {
            // console.error("Error fetching products:", error);
            setFeaturedOffer([]);
        } finally {
            setIsLoading(false);
        }
    };
    useEffect(() => {
        fetchPromotinalBanner();
        fetchFeaturedOffer();
    }, [])
    return (
        <div className="bg-[#fcf7f1] w-full overflow-hidden max-w-screen overflow-x-hidden">
            {/* Promotional Banner Section */}
            {promotinalBanner.length > 0 && (
                <div className="w-full py-10 px-2 md:py-20 bg-[#FCF7F1]">
                    <h2 className="text-2xl md:text-4xl font-bold text-center mb-5 uppercase">
                        <span className="italic">Click</span>,
                        <span >Collect</span>,
                        <span>Checkout</span>
                    </h2>
                    <p className="font-barlow text-gray-600 mb-5 md:w-[50%] w-full mx-auto text-center">From everyday essentials to the latest trends, we bring everything to your fingertips. Enjoy easy browsing, secure checkout, and doorstep delivery with exciting deals and free shipping.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {promotinalBanner.map((item, idx) => (
                            <div key={idx} className="rounded-2xl flex flex-col h-[300px] md:h-[400px] p-0 overflow-hidden relative group">
                                <img src={item?.image?.url} alt={item?.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                                <div className="absolute z-10 flex flex-col justify-between gap-5 md:px-10 px-5 p-6 h-full items-start">
                                    {(() => {
                                        const percent = item.couponPercent;
                                        const amount = item.couponAmount;
                                        const code = item.coupon;
                                        let offerText = null;
                                        if (typeof percent === 'number' && percent > 0) {
                                            offerText = <>GET {percent}% OFF</>;
                                        } else if (typeof amount === 'number' && amount > 0) {
                                            offerText = <>GET ₹{amount} OFF</>;
                                        } else if (code) {
                                            offerText = <>Use code: <b>{code}</b></>;
                                        }
                                        if (!offerText) return null;
                                        return (
                                            <div className="bg-white rounded-full px-4 py-1 text-sm font-bold shadow text-black tracking-tight mb-2" style={{ letterSpacing: 0 }}>
                                                {offerText}
                                            </div>
                                        );
                                    })()}
                                    <span className="text-xl md:text-3xl font-bold text-black mb-2 leading-tight max-w-[40%]">{item?.title}</span>
                                    <Link href={item?.buttonLink || '#'} target="_blank" rel="noopener noreferrer" className="px-10 text-md py-2 bg-black text-white hover:bg-gray-800 transition w-fit">View Now</Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Featured Offer For You Section */}
            {featuredOffer.length > 0 && (
                <div className="w-full md:py-20 py-10 px-2 md:px-10">
                    <h2 className="text-2xl md:text-3xl font-bold text-center mb-5 uppercase">Featured Offer For You</h2>
                    <Carousel className="w-full">
                        <CarouselContent>
                            {featuredOffer.map((item, idx) => (
                                <CarouselItem key={idx} className="md:basis-1/3 lg:basis-1/4">
                                    <div className="rounded-2xl flex flex-col h-[300px] p-0 overflow-hidden relative bg-white group">
                                        <img src={item.image?.url} alt={item.title} className="absolute inset-0 w-full h-full object-cover object-center opacity-80 transition-transform duration-300 group-hover:scale-105" />
                                        <div className="absolute z-10 flex flex-col justify-between gap-5 px-10 p-6 h-full items-start">
                                            {(() => {
                                                const percent = item.couponPercent;
                                                const amount = item.couponAmount;
                                                const code = item.coupon;
                                                let offerText = null;
                                                if (typeof percent === 'number' && percent > 0) {
                                                    offerText = <>GET {percent}% OFF</>;
                                                } else if (typeof amount === 'number' && amount > 0) {
                                                    offerText = <>GET ₹{amount} OFF</>;
                                                } else if (code) {
                                                    offerText = <>Use code: <b>{code}</b></>;
                                                }
                                                if (!offerText) return null;
                                                return (
                                                    <div className="bg-white rounded-full px-4 py-1 text-sm font-bold shadow text-black tracking-tight mb-2" style={{ letterSpacing: 0 }}>
                                                        {offerText}
                                                    </div>
                                                );
                                            })()}
                                            <span className="text-xl md:text-3xl font-bold text-black mb-2 leading-tight max-w-[80%]">{item?.title}</span>
                                            <Link href={item?.buttonLink || '#'} target="_blank" rel="noopener noreferrer" className="px-10 text-md py-2 bg-black text-white hover:bg-gray-800 transition w-fit">View Now</Link>
                                        </div>
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselNext className="!right-2 !top-1/2 !-translate-y-1/2 z-10 " />
                        <CarouselPrevious className="!left-1 !top-1/2 !-translate-y-1/2 z-10" />
                    </Carousel>
                </div>
            )}
        </div>
    )
}

export default Banner