"use client"
import React from "react";
import Image from "next/image";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "./ui/carousel";
import { useState } from "react"
import { Heart, Share2, Ruler, Mail, Star } from "lucide-react"
import { useCart } from "../context/CartContext";
import Autoplay from "embla-carousel-autoplay";
import toast from "react-hot-toast"
export default function QuickViewProductCard({ product, onClose }) {
  // ...existing hooks
  // console.log(product)
  if (!product) return null;
  const { addToCart, addToWishlist, removeFromWishlist, wishlist } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [showFullDesc, setShowFullDesc] = React.useState(false);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedWeight, setSelectedWeight] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const desc = product.description?.overview || "No Description";
  const words = desc.split(' ');

  const [carouselApi, setCarouselApi] = React.useState(null);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  // Prepare images array for gallery, using mainImage and subImages
  // Sync carousel index with activeImageIdx and thumbnail highlight
  React.useEffect(() => {
    if (!carouselApi) return;
    const onSelect = () => {
      const idx = carouselApi.selectedScrollSnap();
      setActiveImageIdx(idx);
    };
    carouselApi.on('select', onSelect);
    // Set initial
    setActiveImageIdx(carouselApi.selectedScrollSnap());
    return () => carouselApi.off('select', onSelect);
  }, [carouselApi]);
  const images = [
    product?.gallery?.mainImage?.url || "/placeholder.png",
    ...(Array.isArray(product?.gallery?.subImages) ? product.gallery.subImages.map(img => img.url) : [])
  ];
  // Extract variants
  const variants = Array.isArray(product?.quantity?.variants) ? product.quantity.variants : [];
  // console.log(product?.quantity?.variants);

  // Get all unique sizes and colors from variants
  const availableSizes = [...new Set(variants.map(v => v.size))];
  const allColors = [...new Set(variants.map(v => v.color))];

  // Find the selected variant
  const selectedVariant = variants.find(v => {
    return (
      (selectedSize ? v.size === selectedSize : true) &&
      (selectedWeight ? v.weight === selectedWeight : true) &&
      (selectedColor ? v.color === selectedColor : true)
    );
  });
  // console.log(selectedVariant?.price);

  // Set default selection on mount or when variants change
  React.useEffect(() => {
    if (variants.length && !selectedSize && !selectedColor) {
      setSelectedSize(variants[0].size);
      setSelectedWeight(variants[0].weight);
      setSelectedColor(variants[0].color);
    }
  }, [variants]);

  // Cap quantity to available stock
  React.useEffect(() => {
    if (selectedVariant && quantity > selectedVariant.qty) {
      setQuantity(selectedVariant.qty);
    }
  }, [selectedVariant, quantity]);


  const formatNumeric = (num) => {
    return new Intl.NumberFormat("en-IN").format(num);
  };
  return (
    <div className="flex flex-col md:flex-row bg-white shadow-lg w-full md:max-w-4xl min-h-[400px]">
      {/* Left: Image Gallery */}
      <div className="flex flex-col items-center w-full md:w-1/2 relative h-full flex-1 pr-2 md:pr-0">
        {/* Main Image Gallery - full height, animated swipe */}
        <div className="relative w-full h-full min-h-[400px] overflow-hidden flex items-center justify-center">
          <Carousel
            className="w-full h-full"
            opts={{ loop: true }}
            plugins={[Autoplay({ delay: 4000 })]}
            setApi={setCarouselApi}
            onScroll={(api) => {
              const idx = api.selectedScrollSnap();
              setActiveImageIdx(idx);
            }}
          >
            <CarouselContent className="h-[420px] w-full mx-auto md:h-[500px]">
              {images.map((img, idx) => (
                <CarouselItem key={idx} className="flex items-center justify-center h-full">
                  <div className="relative w-full h-[420px] md:h-[500px] flex items-center justify-center">
                    <Image
                      src={img}
                      alt={`Product image ${idx}`}
                      layout="fill"
                      objectFit="contain"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="!left-1 !top-1/2 !-translate-y-1/2 z-50" />
            <CarouselNext className="!right-1 !top-1/2 !-translate-y-1/2 z-50" />
          </Carousel>

          {/* Thumbnails overlayed in top-left, flex-col, z-10 */}
          <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 max-h-[380px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent p-2">
            {images.map((img, idx) => (
              <button
                key={idx}
                className={`relative w-14 h-14 border rounded-lg overflow-hidden focus:outline-none bg-white/80 ${activeImageIdx === idx ? 'ring-2 ring-black' : ''}`}
                onClick={() => {
                  if (carouselApi && idx !== activeImageIdx) {
                    carouselApi.scrollTo(idx);
                  }
                }}
                aria-label={`Show image ${idx + 1}`}
                style={{ boxShadow: activeImageIdx === idx ? '0 0 0 2px #000' : undefined }}
              >
                <Image src={img} alt={`thumb-${idx}`} layout="fill" objectFit="cover" />
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* Right: Product Details */}
      <div className="flex-1 flex flex-col py-4 px-6">
        {/* SALE badge */}
        {/* <span className="bg-black text-white text-xs font-bold px-3 py-1 rounded-full w-max mb-2">SALE 20% OFF</span> */}
        {/* Title & Rating */}
        <div className="flex items-center gap-4 justify-start">
        <h2 className="text-xl md:text-2xl font-bold mb-1">
          {/* Defensive: if title is object, stringify for debug */}
          {typeof product?.title === 'object' ? JSON.stringify(product.title) : (product?.title || "N/A")}
        </h2>
        <h2 className="text-md font-medium px-2 rounded bg-gray-200">
          #{product?.code}
        </h2>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-yellow-500 text-lg">★</span>
          <span className="font-semibold">
            {/* Show average rating from reviews, fallback to 0 */}
            {(() => {
              if (Array.isArray(product?.reviews) && product.reviews.length > 0) {
                const avg = product.reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / product.reviews.length;
                return avg.toFixed(1);
              }
              return "0";
            })()} Rating
          </span>
          <span className="text-sm text-gray-500">
            {/* Show number of reviews */}
            ({Array.isArray(product?.reviews) ? product.reviews.length : 0} customer reviews)
          </span>
        </div>
        {/* Description */}
        {(() => {

          if (desc === "No Description") {
            return <p className="text-gray-700 mb-6 max-w-lg">No Description</p>;
          }
          if (showFullDesc || words.length <= 20) {
            return (
              <div className="text-gray-700 mb-6 max-w-lg">
                <div dangerouslySetInnerHTML={{ __html: desc }} />
                {words.length > 20 && (
                  <>
                    {' '}<button className="text-blue-600 underline ml-2" onClick={() => setShowFullDesc(false)}>Close</button>
                  </>
                )}
              </div>
            );
          }
          return (
            <div className="text-gray-700 mb-6 max-w-lg">
              <div dangerouslySetInnerHTML={{ __html: words.slice(0, 20).join(' ') + '...' }} />
              <button className="text-blue-600 underline" onClick={() => setShowFullDesc(true)}>Read more</button>
            </div>
          );
        })()}
        {/* Size & Color Selection Section (ported from ProductDetailView) */}
        <div className="flex flex-col gap-4 mb-5">
          {/* Size */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-md">Size:</span>
            {availableSizes.map((size, idx) => {
              const variant = variants.find(v => v.size === size);
              const weight = variant?.weight || "N/A";
              return (
                <button
                  key={size || idx}
                  className={`relative min-w-24 px-3 py-2 border rounded-xl bg-white text-sm font-medium transition-all duration-150
            ${selectedSize === size ? 'border-black ring-2 ring-black' : 'border-gray-300'}
            hover:bg-gray-100`}
                  onClick={() => {
                    setSelectedSize(size);
                    setQuantity(1);
                    // Get all colors for this size
                    const colorsForSize = variants.filter(v => v.size === size).map(v => v.color);
                    const newColor = colorsForSize.includes(selectedColor) ? selectedColor : colorsForSize[0];
                    setSelectedColor(newColor);
                    // Get weight for size+color
                    const weightForSize = variants.find(v => v.size === size && v.color === newColor)?.weight;
                    setSelectedWeight(weightForSize);
                  }}
                  aria-pressed={selectedSize === size}
                  tabIndex={0}
                >
                  <div className="flex justify-between items-center w-full gap-2">
                    <span>{size}</span>
                    <div className="h-4 w-px bg-gray-300" />
                    <span className="text-gray-600 text-md">{weight}g</span>
                  </div>
                </button>
              );
            })}
          </div>
          {/* Color */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-md">Color:</span>
            {allColors.map((color, idx) => {
              // Only enable colors that are available for the selected size
              const enabled = selectedSize ? variants.some(v => v.color === color && v.size === selectedSize) : false;
              return (
                <button
                  key={color || idx}
                  className={`relative w-8 h-8 rounded-full border-2 transition-all duration-150
            ${selectedColor === color ? 'border-black ring-2 ring-black' : ''}
            ${!enabled ? 'border-gray-300 opacity-40 cursor-not-allowed' : 'hover:ring-2 hover:ring-black'}`}
                  style={{ background: color, position: 'relative' }}
                  title={color}
                  onClick={() => {
                    if (!enabled) return;
                    setSelectedColor(color);
                    setQuantity(1);
                  }}
                  aria-disabled={!enabled}
                  tabIndex={enabled ? 0 : -1}
                >
                  {(!enabled) && (
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 40 40">
                      <line x1="5" y1="35" x2="35" y2="5" stroke="#e57373" strokeWidth="2" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>
        {/* Price & Quantity */}
        <div className="flex flex-row items-end justify-start gap-8 mb-5">
          {/* Price section */}
          <div className="flex flex-col items-start">
            <span className="font-bold text-md md:text-lg text-black mb-1">Price</span>
            <div className="flex items-baseline gap-3">
              {(() => {
                const coupon = product.coupon || product.coupons?.coupon;
                const originalPrice = product?.quantity?.variants[0].price;
                let discountedPrice = originalPrice;
                let couponApplied = false;
                if (coupon && typeof coupon.percent === 'number' && coupon.percent > 0) {
                  discountedPrice = originalPrice - (originalPrice * coupon.percent) / 100;
                  couponApplied = true;
                } else if (coupon && typeof coupon.amount === 'number' && coupon.amount > 0) {
                  discountedPrice = originalPrice - coupon.amount;
                  couponApplied = true;
                }
                return (
                  <>
                    <span className="text-2xl font-extrabold text-black">₹{formatNumeric(Math.round(discountedPrice))}</span>
                    {couponApplied && (
                      <span className="text-gray-400 line-through text-xl ml-1">₹{formatNumeric(originalPrice)}</span>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
          {/* Quantity section */}
          <div className="flex flex-col items-start">
            <span className="font-bold text-md md:text-lg text-black">Quantity</span>
            <div className="flex gap-3 items-center">
              <button
                className="w-10 h-10 rounded-full bg-black text-white text-2xl flex items-center justify-center transition hover:bg-gray-800"
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
              >-</button>
              <span className="w-10 h-10 rounded-full border-2 border-black flex items-center justify-center text-lg font-semibold">
                {quantity}
              </span>
              <button
                className="w-10 h-10 rounded-full bg-black text-white text-2xl flex items-center justify-center transition hover:bg-gray-800"
                onClick={() => setQuantity(q => q + 1)}
              >+</button>
            </div>
          </div>
        </div>
        {/* Buttons */}
        <div className="flex gap-2 mb-4 w-full">
          <button
            className="bg-black text-white px-4 py-2 font-semibold hover:bg-gray-800 w-1/2"
            onClick={() => {
              const price = product?.quantity?.variants[0].price;
              const coupon = product.coupon || product.coupons?.coupon;
              let discountedPrice = price;
              let couponApplied = false;
              let couponCode = "";

              if (coupon && typeof coupon.percent === 'number' && coupon.percent > 0) {
                discountedPrice = price - (price * coupon.percent) / 100;
                couponApplied = true;
                couponCode = coupon.couponCode;
              } else if (coupon && typeof coupon.amount === 'number' && coupon.amount > 0) {
                discountedPrice = price - coupon.amount;
                couponApplied = true;
                couponCode = coupon.couponCode;
              }
              addToCart({
                id: product._id,
                name: product.title,
                image: product?.gallery?.mainImage || "/placeholder.jpeg",
                price: Math.round(discountedPrice),
                originalPrice: price,
                qty: 1,
                couponApplied,
                couponCode: couponApplied ? couponCode : undefined,
                productCode: product.code || product.productCode || '',
                discountPercent: coupon && typeof coupon.percent === 'number' ? coupon.percent : undefined,
                discountAmount: coupon && typeof coupon.amount === 'number' ? coupon.amount : undefined,
                cgst: (product.taxes && product.taxes.cgst) || product.cgst || (product.tax && product.tax.cgst) || 0,
                sgst: (product.taxes && product.taxes.sgst) || product.sgst || (product.tax && product.tax.sgst) || 0,
                quantity: product.quantity || {},
              }, quantity);
              toast.success("Added to cart!");
            }}

          >ADD TO CART</button>
          <button
            className="border border-black py-1 font-semibold hover:bg-gray-100 w-1/2 flex items-center justify-center gap-2 bg-white hover:bg-[#b3a7a3]"
            onClick={() => {
              if (wishlist.some(i => i.id === product._id)) {
                removeFromWishlist(product._id);
                toast.success("Removed from wishlist!");
                return;
              } else {
                const coupon = product.coupon || product.coupons?.coupon;
                const originalPrice = product?.quantity?.variants[0].price;
                let discountedPrice = originalPrice;
                let couponApplied = false;
                let couponCode = '';
                if (coupon && typeof coupon.percent === 'number' && coupon.percent > 0) {
                  discountedPrice = originalPrice - (originalPrice * coupon.percent) / 100;
                  couponApplied = true;
                  couponCode = coupon.couponCode;
                } else if (coupon && typeof coupon.amount === 'number' && coupon.amount > 0) {
                  discountedPrice = originalPrice - coupon.amount;
                  couponApplied = true;
                  couponCode = coupon.couponCode;
                }
                addToWishlist({
                  id: product._id,
                  name: product.title,
                  image: product?.gallery?.mainImage || "/placeholder.png",
                  price: couponApplied ? Math.round(discountedPrice) : couponApplied,
                  couponCode,
                  qty: quantity
                });
                toast.success("Added to wishlist!");
              }
            }}
          >
            <div
              className={`p-2 rounded-full ${wishlist.some(i => i.id === product._id)
                ? "bg-pink-600"
                : "bg-gray-900 text-white"
                }`}
            >
              <Heart
                size={20}
                className="text-white"
              />
            </div>
            {wishlist.some(i => i.id === product._id) ? "Remove From Wishlist" : "Add To Wishlist"}
          </button>


        </div>
        {/* Divider */}
        <hr className="my-1" />
        {/* Info Rows */}
        <div className="text-sm mb-1">
          <div className="flex flex-row items-start flex-wrap gap-2 mt-1 max-h-28 overflow-y-auto">
            <span className="font-semibold text-base flex-shrink-0 mr-2 mt-1">Category:</span>
            {Array.isArray(product.categoryTag?.tags) && product.categoryTag.tags.length > 0 ? (
              product.categoryTag.tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-gray-200 text-black font-semibold px-2 py-1 rounded-full text-sm shadow-sm whitespace-nowrap border border-gray-300"
                  style={{ marginBottom: '1px' }}
                >
                  {tag}
                </span>
              ))
            ) : (
              <span className="bg-gray-200 text-black font-semibold px-4 py-2 rounded-full text-sm shadow-sm border border-gray-300 whitespace-nowrap">
                {"No Category"}
              </span>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
