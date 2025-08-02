// app/api/brand-categories/[id]/route.js
import { NextResponse } from 'next/server';
import connectDB from "@/lib/connectDB";
import BrandCategory from '@/models/BrandCategory';
import { deleteFileFromCloudinary } from '@/utils/cloudinary';
export async function PATCH(req, { params }) {
    await connectDB();
    try {
        const { id } = await params;
        const updateData = await req.json();
        // Check if the document exists
        let existingCategory = await BrandCategory.findById(id).lean();

        if (!existingCategory) {
            // Create a new brand category
            const newBrandCategory = new BrandCategory({
                _id: id,
                ...updateData
            });

            const savedCategory = await newBrandCategory.save();
            return NextResponse.json(savedCategory, { status: 201 });
        }

        // Prepare update operation
        const updateOperation = {
            ...updateData,
            updatedAt: new Date()
        };

        if (updateData.products) {
            updateOperation.products = updateData.products.map(p => ({
                product: p.product,
                productName: p.productName
            }));
        }

        // Perform the update
        const updatedCategory = await BrandCategory.findByIdAndUpdate(
            id,
            { $set: updateOperation },
            { new: true, runValidators: true }
        );

        if (!updatedCategory) {
            throw new Error('Failed to update brand category');
        }

        return NextResponse.json(updatedCategory);
    } catch (error) {
        // console.error('Update error:', error);
        return NextResponse.json(
            { error: `Failed to update brand category: ${error.message}` },
            { status: 500 }
        );
    }
}

export async function DELETE(request, { params }) {
    try {
        const { id } =await params;
        if (!id) {
            return NextResponse.json({ error: 'Brand category ID is required' }, { status: 400 });
        }

        await connectDB();

        // Find the category first to get image keys
        const category = await BrandCategory.findById(id);
        if (!category) {
            return NextResponse.json({ error: 'Brand category not found' }, { status: 404 });
        }

        // Delete images from Cloudinary if they exist
        try {
            if (category.banner?.key) {
                await deleteFileFromCloudinary(category.banner.key);
            }
            if (category.profileImage?.key) {
                await deleteFileFromCloudinary(category.profileImage.key);
            }
        } catch (error) {
            // console.error('Error deleting images from Cloudinary:', error);
            // Continue with deletion even if image deletion fails
        }

        // Delete the category
        await BrandCategory.findByIdAndDelete(id);

        return NextResponse.json({ success: true, message: 'Brand category deleted successfully' });
    } catch (error) {
        // console.error('Error deleting brand category:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to delete brand category' },
            { status: 500 }
        );
    }
}