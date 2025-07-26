import connectDB from "@/lib/connectDB";
import mongoose from 'mongoose';
import "@/models/Promotion";
import "@/models/ArtisanBlog";
import "@/models/ArtisanStory";
import "@/models/ArtisanCertificate";
import "@/models/ArtisanPlugin";
import "@/models/Product";
import "@/models/ArtisanBanner";
import "@/models/Gallery";
import "@/models/Video";
import "@/models/Description";
import "@/models/Info";
import "@/models/CategoryTag";
import "@/models/Quantity";
import "@/models/ProductCoupons";
import "@/models/ProductReview";


import Artisan from '@/models/Artisan';

export async function GET(req, { params }) {
  await connectDB();
  const id = await params.id;
  // console.log('Requested artisan id:', id);
  const artisan = await Artisan.findById(id)
    .populate('promotions')
    .populate('artisanBlogs')
    .populate('artisanStories')
    .populate('certificates')
    .populate('socialPlugin')
    .populate('artisanBanner')
    .populate({
      path: 'products',
      populate: [
        { path: 'gallery' },
        { path: 'price' },
        { path: 'video' },
        { path: 'description' },
        { path: 'info' },
        { path: 'categoryTag' },
        { path: 'reviews' },
        { path: 'quantity' },
        { path: 'coupons' }
      ]
    })
  if (!artisan || artisan.active !== true) {
    // console.log('Artisan not found for id:', id, 'Result:', artisan);
    return new Response(JSON.stringify({ message: 'Artisan not found', debug: { id, artisan } }), { status: 404 });
  }
  return new Response(JSON.stringify(artisan), { status: 200 });
}