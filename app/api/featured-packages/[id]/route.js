import connectDB from "@/lib/connectDB";
import FeaturedPackageCard from "@/models/FeaturedPackageCard";
import cloudinary from 'cloudinary';

// Cloudinary configuration (ensure these env vars are set)
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const PUT = async (req, { params }) => {
    try {
        await connectDB();
        const { id } = params;
        const { title, image, link } = await req.json();

        let imageUrl = null;
        let imagePublicId = null;

        // If image is a base64 string, upload to Cloudinary
        if (image && image.startsWith('data:')) {
            const uploadResponse = await cloudinary.v2.uploader.upload(image, {
                folder: 'featured-packages',
            });
            imageUrl = uploadResponse.secure_url;
            imagePublicId = uploadResponse.public_id;
        } else if (image && typeof image === 'object' && image.url && image.public_id) {
            // If frontend already sent Cloudinary info
            imageUrl = image.url;
            imagePublicId = image.public_id;
        }

        const updatedPackage = await FeaturedPackageCard.findByIdAndUpdate(
            id,
            { title, image: imageUrl ? { url: imageUrl, public_id: imagePublicId } : undefined, link },
            { new: true }
        );

        if (!updatedPackage) {
            return new Response("Featured package not found", { status: 404 });
        }

        return new Response(JSON.stringify(updatedPackage), { status: 200 });
    } catch (error) {
        return new Response("Failed to update featured package", { status: 500 });
    }
};

export const DELETE = async (req, { params }) => {
    try {
        await connectDB();
        const { id } = params;

        // First get the package to access the image public_id
        const packageToDelete = await FeaturedPackageCard.findById(id);
        if (!packageToDelete) {
            return new Response("Featured package not found", { status: 404 });
        }

        // Delete the image from Cloudinary if it exists
        if (packageToDelete.image?.public_id) {
            await cloudinary.v2.uploader.destroy(packageToDelete.image.public_id);
        }

        // Delete the package from database
        await FeaturedPackageCard.findByIdAndDelete(id);

        return new Response("Featured package deleted successfully", { status: 200 });
    } catch (error) {
        return new Response("Failed to delete featured package", { status: 500 });
    }
};