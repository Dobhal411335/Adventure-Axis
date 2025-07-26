import { NextResponse } from "next/server";
import connectDB from "@/lib/connectDB";
import HeroBanner from "@/models/HeroBanner";
import { deleteFileFromCloudinary } from "@/utils/cloudinary";
connectDB();

export async function GET() {
    try {
        const banners = await HeroBanner.find().sort({ order: 1 });
        return NextResponse.json(banners, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch banners" }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const { title, price, coupon, couponCode, couponAmount, couponPercent, addtoCartLink, viewDetailLink, subtitle, subDescription, frontImg, backImg, order } = await req.json();

        // Find the highest order number
        const lastBanner = await HeroBanner.findOne().sort({ order: -1 });
        const nextOrder = lastBanner ? lastBanner.order + 1 : 1; // Auto-increment order

        const newBanner = new HeroBanner({
            title,
            price,
            coupon: couponCode || coupon || '',
            couponAmount,
            couponPercent,
            addtoCartLink,
            viewDetailLink,
            subtitle,
            subDescription,
            order: nextOrder,
            frontImg,
            backImg
        });
        await newBanner.save();
        return NextResponse.json(newBanner, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: `Failed to create banner: ${error.message}` }, { status: 500 });
    }
}

export async function PATCH(req) {
    try {
        const { id, title, price, coupon, couponCode, couponAmount, couponPercent, addtoCartLink, viewDetailLink, subtitle, subDescription, frontImg, backImg, order } = await req.json();
        const updatedBanner = await HeroBanner.findByIdAndUpdate(
            id,
            {
                title,
                price,
                coupon: couponCode || coupon || '',
                couponAmount,
                couponPercent,
                addtoCartLink,
                viewDetailLink,
                subtitle,
                subDescription,
                order,
                frontImg,
                backImg
            },
            { new: true }
        );
        return NextResponse.json(updatedBanner, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to update banner" }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        const { id } = await req.json();

        // Find the banner first
        const banner = await HeroBanner.findById(id);
        if (!banner) {
            return NextResponse.json({ error: "Banner not found" }, { status: 404 });
        }

        // Delete the image from Uploadthing (if key exists)
        if (banner.frontImg?.key) {
            await deleteFileFromCloudinary(banner.frontImg.key);
        }

        if (banner.backImg?.key) {
            await deleteFileFromCloudinary(banner.backImg.key);
        }

        // Delete banner from database
        await HeroBanner.findByIdAndDelete(id);

        return NextResponse.json({ message: "Banner deleted successfully" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: `Failed to delete banner: ${error.message}` }, { status: 500 });
    }
}
