import connectDB from "@/lib/connectDB";
import FeaturedPackageCard from "@/models/FeaturedPackageCard";

export const GET = async (req) => {
    try {
        await connectDB();
        const packages = await FeaturedPackageCard.find({});
        return new Response(JSON.stringify(packages), { status: 200 });
    } catch (error) {
        return new Response("Failed to fetch featured packages", { status: 500 });
    }
};

export const POST = async (req) => {
    try {
        await connectDB();

        const totalPackages = await FeaturedPackageCard.countDocuments();
        if (totalPackages >= 12) {
            return new Response(JSON.stringify({ message: "Maximum limit of 12 featured packages reached" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        const body = await req.json();

        const { title, image, link } = body;

        if (!title || !image?.url || !image?.key || !link) {
            return new Response(JSON.stringify({ message: "Missing required fields" }), { status: 400 });
        }

        const newPackage = new FeaturedPackageCard({
            title,
            image,
            link,
        });
        await newPackage.save();

        return new Response(JSON.stringify(newPackage), { status: 201, headers: { "Content-Type": "application/json" } });
    } catch (error) {
        console.error("POST Error:", error);
        return new Response(JSON.stringify({ message: "Failed to create featured package", error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
};
