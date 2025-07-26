import { NextResponse } from "next/server";
import connectDB from "@/lib/connectDB";
import FeaturedBanner from "@/models/FeaturedBanner";
import { deleteFileFromCloudinary } from "@/utils/cloudinary";
connectDB();

export async function GET() {
    try {
        const banners = await FeaturedBanner.find().sort({ order: 1 });
        return NextResponse.json(banners, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch banners" }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const { title, coupon, buttonLink, image, couponAmount, couponPercent, order } = await req.json();

        // Find the highest order number
        const lastBanner = await FeaturedBanner.findOne().sort({ order: -1 });
        const nextOrder = lastBanner ? lastBanner.order + 1 : 1; // Auto-increment order

        const newBanner = new FeaturedBanner({ title, coupon, buttonLink, order: nextOrder, image, couponAmount, couponPercent });
        await newBanner.save();
        return NextResponse.json(newBanner, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: `Failed to create banner: ${error.message}` }, { status: 500 });
    }
}

export async function PATCH(req) {
    try {
        const { id, title, coupon, buttonLink, image, order, couponAmount, couponPercent } = await req.json();
        const updatedBanner = await FeaturedBanner.findByIdAndUpdate(id, { title, coupon, buttonLink, order, image, couponAmount, couponPercent }, { new: true });
        return NextResponse.json(updatedBanner, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to update banner" }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        const { id } = await req.json();

        // Find the banner first
        const banner = await FeaturedBanner.findById(id);
        if (!banner) {
            return NextResponse.json({ error: "Banner not found" }, { status: 404 });
        }

        // Delete the image from Uploadthing (if key exists)
        if (banner.image?.key) {
            await deleteFileFromCloudinary(banner.image.key);
        }

        // Delete banner from database
        await FeaturedBanner.findByIdAndDelete(id);

        return NextResponse.json({ message: "Banner deleted successfully" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: `Failed to delete banner: ${error.message}` }, { status: 500 });
    }
}
