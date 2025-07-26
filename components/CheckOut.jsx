"use client"
import React, { useState } from 'react';
import { useCart } from "../context/CartContext";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "./ui/dialog";
const shippingOptions = [
  { label: 'Free shipping', value: 'free', cost: 0 },
  { label: 'Flat Rate', value: 'flat', cost: 25.75 },
];
// Function to load Razorpay script on client
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (document.getElementById('razorpay-sdk')) {
      return resolve(true);
    }
    const script = document.createElement('script');
    script.id = 'razorpay-sdk';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};


// Function to handle online payment with explicit backend order creation
import axios from 'axios';
import { toast } from 'react-hot-toast';

// --- Centralized Order/Transaction ID Generators ---
function generateOrderId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `ORD-${result}`;
}
function generateTransactionId() {
  return `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
}
// --- Centralized Order Payload Builder ---
function buildOrderPayload({
  cart,
  checkoutData,
  street, city, district, state, pincode,
  firstName, lastName, email, phone, altPhone,
  payment, transactionId, orderId, agree, paymentMethodValue, statusValue
}) {
  const fullAddress = [street, city, district, state, pincode].filter(Boolean).join(', ');
  return {
    products: cart,
    cartTotal: checkoutData?.cartTotal,
    subTotal: checkoutData?.subTotal,
    totalDiscount: checkoutData?.totalDiscount,
    totalTax: checkoutData?.totalTax,
    shippingCost: checkoutData?.shippingCost,
    promoCode: checkoutData?.promoCode,
    promoDiscount: checkoutData?.promoDiscount,
    // Billing/shipping info
    firstName,
    lastName,
    email,
    phone,
    altPhone,
    street,
    city,
    district,
    state,
    pincode,
    address: fullAddress,
    // Payment/order info
    orderId,
    transactionId,
    payment: paymentMethodValue, // 'cod', 'online', 'direct'
    paymentMethod: paymentMethodValue,
    status: statusValue || 'Pending',
    agree,
    datePurchased: new Date(),
  };
}
import CheckOutOverview from './CheckOutOverview';
import { usePathname, useRouter } from "next/navigation"


// Debug: Log modal state changes
const CheckOut = () => {
  // --- Buy Now Mode Detection ---
  const [buyNowMode, setBuyNowMode] = useState(false);

  // State for address fields
  const [pincode, setPincode] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderData, setOrderData] = useState(null);

  useEffect(() => {
    // console.log('[CheckOut] showConfirmationModal:', showConfirmationModal, 'orderId:', orderId);
  }, [showConfirmationModal, orderId]);

  useEffect(() => {
    // Load checkout data from localStorage
    const data = localStorage.getItem("checkoutCart");
    if (data) {
      try {
        const parsed = JSON.parse(data);
        // console.log(city)
        setPincode(parsed.pincode || "");
        setCity(parsed.city || "");
        setState(parsed.state || "");
        setDistrict(parsed.district || "");
      } catch (e) {
        // Optionally handle error
      }
    }
  }, []);

  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const { cart: contextCart, setCart, removeFromCart, clearCart } = useCart();
  const [checkoutData, setCheckoutData] = useState(null);

  // Redirect to home if no cart items or checkout data
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false); // Prevents double payment attempts
  const [error, setError] = useState(null);
  useEffect(() => {
    if (!isLoading && (!checkoutData || !checkoutData.cart || checkoutData.cart.length === 0)) {
      router.push('/');
    }
  }, [checkoutData, isLoading, router]);
  // Coupon state
  // console.log(checkoutData)
  const [couponInput, setCouponInput] = useState("");
  const [loadingCoupon, setLoadingCoupon] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [appliedPromo, setAppliedPromo] = useState("");
  const [appliedPromoDetails, setAppliedPromoDetails] = useState(null);
  const [showOverview, setShowOverview] = useState(false);
  const [confirmedPaymentMethod, setConfirmedPaymentMethod] = useState(null);
  const [shipping, setShipping] = useState('free');
  // Load cart data from localStorage and handle authentication state
  const handleOnlinePaymentWithOrder = async (finalAmount, cart, customer, setLoading, setError, routerInstance, checkoutData, formFields, user) => {
    setLoading(true);
    setError(null);
    
    try {
      // 1. Validate input
      if (!cart || !Array.isArray(cart) || cart.length === 0) {
        // If cart is empty but we're in buy now mode, try to get the product from localStorage
        if (formFields?.isBuyNow || checkoutData?.isBuyNow) {
          const buyNowProductRaw = typeof window !== 'undefined' ? localStorage.getItem('buyNowProduct') : null;
          if (buyNowProductRaw) {
            const buyNowProduct = JSON.parse(buyNowProductRaw);
            cart = [{
              ...buyNowProduct,
              qty: Number(buyNowProduct.qty) || 1,
              price: Number(buyNowProduct.price) || 0,
              originalPrice: Number(buyNowProduct.originalPrice) || Number(buyNowProduct.price) || 0,
              color: buyNowProduct.color || '',
              size: buyNowProduct.size || '',
              weight: Number(buyNowProduct.weight) || 0,
              cgst: Number(buyNowProduct.cgst) || 0,
              sgst: Number(buyNowProduct.sgst) || 0,
              image: typeof buyNowProduct.image === 'string' 
                ? buyNowProduct.image 
                : buyNowProduct.image?.url || ''
            }];
          }
        }
        
        // If cart is still empty after checking for buy now product, throw error
        if (!cart || cart.length === 0) {
          throw new Error('Cart is empty or invalid');
        }
      }
  
      // 2. Prepare products array with validation
      const products = cart.map(item => {
        const productId = item._id || item.productId || item.id;
        if (!productId) {
          // console.error('Invalid product in cart:', item);
          throw new Error('One or more products in cart are invalid');
        }
  
        // Handle image URL - ensure it's always a string
        let imageUrl = '';
        if (typeof item.image === 'string') {
          imageUrl = item.image;
        } else if (item.image?.url) {
          imageUrl = item.image.url;
        }
  
        return {
          _id: productId,
          productId,
          name: item.name || 'Product',
          price: Number(item.price) || 0,
          qty: Number(item.qty) || 1,
          image: imageUrl,
          color: String(item.color || ''),
          size: String(item.size || ''),
          weight: Number(item.weight) || 0,
          cgst: Number(item.cgst) || 0,
          sgst: Number(item.sgst) || 0,
          originalPrice: Number(item.originalPrice) || Number(item.price) || 0,
          discountAmount: Number(item.discountAmount) || 0,
          discountPercent: Number(item.discountPercent) || 0
        };
      });
  
      // 3. Prepare customer data
      const customerName = formFields.firstName 
        ? `${formFields.firstName} ${formFields.lastName || ''}`.trim() 
        : customer.name || '';
  
      const customerData = {
        name: customerName,
        email: formFields.email || customer.email || '',
        phone: formFields.phone || customer.phone || '',
        address: [
          formFields.street,
          formFields.city,
          formFields.district,
          formFields.state,
          formFields.pincode
        ].filter(Boolean).join(', ')
      };
  
      // 4. Create order in backend and get Razorpay order
      const response = await fetch('/api/razorpay', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          amount: Number(finalAmount),
          currency: 'INR',
          receipt: generateOrderId(),
          products,
          customer: customerData
        })
      });
  
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to create Razorpay order');
      }
  
      const orderData = await response.json();
      const { id: razorpayOrderId, orderId } = orderData;
  
      if (!razorpayOrderId) {
        throw new Error('Order creation failed. No order ID returned from server.');
      }
  
      // 5. Load Razorpay script
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        throw new Error('Failed to load Razorpay SDK. Please try again.');
      }
  
      // 6. Open Razorpay payment modal
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: Math.round(Number(finalAmount) * 100), // Convert to paise
        currency: "INR",
        name: "Rishikesh Handmade",
        description: "Order Payment",
        order_id: razorpayOrderId,
        handler: createPaymentHandler(cart, checkoutData, formFields, user, orderId, setError, setShowConfirmationModal, setOrderId, routerInstance),
        prefill: {
          name: customerData.name,
          email: customerData.email,
          contact: customerData.phone,
        },
        theme: { 
          color: "#3399cc" 
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          }
        }
      };
  
      const rzp = new window.Razorpay(options);
      rzp.open();
  
    } catch (error) {
      // console.error('Payment error:', error);
      setError(error.message || 'Payment processing failed. Please try again.');
      setLoading(false);
    }
  };
  
  // Separate handler function for better organization
  const createPaymentHandler = (cart, checkoutData, formFields, user, orderId, setError, setShowConfirmationModal, setOrderId, routerInstance) => {
    return async (response) => {
      try {
        // 1. Verify payment with backend
        const verificationResponse = await fetch("/api/razorpay", {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
            cart,
            checkoutData,
            formFields,
            user,
            agree: true
          })
        });
  
        if (!verificationResponse.ok) {
          const errorData = await verificationResponse.json().catch(() => ({}));
          throw new Error(errorData.error || 'Payment verification failed');
        }
  
        const verificationData = await verificationResponse.json();
        
        if (!verificationData.success) {
          throw new Error(verificationData.error || 'Payment verification failed');
        }
  
        // 2. Handle successful payment
        setError(null);
        setShowConfirmationModal(true);
        setOrderId(orderId);
  
        // 3. Clear cart and local storage
        const isBuyNow = typeof window !== "undefined" && 
          new URLSearchParams(window.location.search).get('mode') === 'buy-now';
  
        if (isBuyNow) {
          localStorage.removeItem("buyNowItem");
        } else {
          localStorage.removeItem("checkoutCart");
          localStorage.removeItem("cart");
        }
  
        // 4. Show order overview instead of redirecting
        setShowOverview(true);
  
      } catch (error) {
        // console.error('Payment verification error:', error);
        setError(error.message || 'Payment verification failed');
      }
    };
  };
  useEffect(() => {
    // Detect buy-now mode from URL
    let isBuyNow = false;
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      isBuyNow = params.get('mode') === 'buy-now';
      setBuyNowMode(isBuyNow);
    }
    const loadCartData = async () => {
      // Check for buy-now mode in URL
      let isBuyNow = false;
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        isBuyNow = params.get('mode') === 'buy-now';
      }
      if (isBuyNow) {
        // Load buyNowProduct from localStorage
        const buyNowRaw = typeof window !== "undefined" ? localStorage.getItem('buyNowProduct') : null;
        if (buyNowRaw) {
          try {
            const buyNowProduct = JSON.parse(buyNowRaw);
            const qty = Number(buyNowProduct.qty) || 1;
            const discountedUnitPrice = Number(buyNowProduct.price) || 0;
            const cgstRate = Number(buyNowProduct.cgst) || 0;
            const sgstRate = Number(buyNowProduct.sgst) || 0;

            // Calculate shipping based on quantity (or weight if available)
            let shippingCost = 0;
            let shippingTierLabel = '';
            let shippingPerUnit = null;
            let totalWeight = 0;
            if (buyNowProduct.weight) {
              totalWeight = Number(buyNowProduct.weight) * qty;
            }
            // Prefer weight-based shipping if weight exists, else per-qty
            if (totalWeight > 0) {
              try {
                const res = await fetch('/api/checkShipping', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ weight: totalWeight }),
                });
                const data = await res.json();
                if (data && data.available && data.shippingCharge != null && !isNaN(Number(data.shippingCharge))) {
                  shippingCost = Number(data.shippingCharge);
                  shippingTierLabel = data.tierLabel || '';
                  shippingPerUnit = data.perUnitCharge || null;
                } else {
                  shippingCost = 0;
                }
              } catch (e) {
                shippingCost = 0;
              }
            } else {
              // fallback: simple per-qty flat rate (e.g., 200 per item)
              shippingCost = qty * 200;
              if (isNaN(shippingCost)) shippingCost = 0;
              shippingTierLabel = `Flat Rate x${qty}`;
            }

            const totalDiscount = buyNowProduct.originalPrice && buyNowProduct.price
              ? (Number(buyNowProduct.originalPrice) - discountedUnitPrice) * qty
              : 0;

            const promoCode = buyNowProduct.couponApplied ? buyNowProduct.couponCode : '';
            const promoDiscount = buyNowProduct.couponApplied ? totalDiscount : 0;

            const subTotal = discountedUnitPrice * qty;
            const cgstTotal = (discountedUnitPrice * cgstRate / 100) * qty;
            const sgstTotal = (discountedUnitPrice * sgstRate / 100) * qty;
            const totalTax = cgstTotal + sgstTotal;
            const cartTotal = subTotal + totalTax + shippingCost;

            setCheckoutData({
              cart: [{ ...buyNowProduct, cgstTotal, sgstTotal }],
              subTotal,
              cartTotal: Number(subTotal) + Number(totalTax) + Number(shippingCost),
              shippingCost: Number(shippingCost),
              shippingTierLabel,
              shippingPerUnit,
              totalTax: Number(totalTax),
              totalDiscount: Number(totalDiscount),
              promoCode,
              promoDiscount: Number(promoDiscount),
            });
            // Set address fields from buyNowProduct if present
            if (buyNowProduct.pincode) setPincode(buyNowProduct.pincode);
            if (buyNowProduct.state) setState(buyNowProduct.state);
            if (buyNowProduct.district) setDistrict(buyNowProduct.district);
          } catch (err) {
            // fallback: shippingCost = 0
            // Recalculate all values safely for fallback
            const qty = Number(buyNowProduct?.qty) || 1;
            const discountedUnitPrice = Number(buyNowProduct?.price) || 0;
            const cgstRate = Number(buyNowProduct?.cgst) || 0;
            const sgstRate = Number(buyNowProduct?.sgst) || 0;
            const subTotal = discountedUnitPrice * qty;
            const cgstTotal = (discountedUnitPrice * cgstRate / 100) * qty;
            const sgstTotal = (discountedUnitPrice * sgstRate / 100) * qty;
            const totalTax = cgstTotal + sgstTotal;
            const totalDiscount = buyNowProduct?.originalPrice && buyNowProduct?.price
              ? (Number(buyNowProduct.originalPrice) - discountedUnitPrice) * qty
              : 0;
            const promoCode = buyNowProduct?.couponApplied ? buyNowProduct.couponCode : '';
            const promoDiscount = buyNowProduct?.couponApplied ? totalDiscount : 0;
            const shippingCost = 0;
            const cartTotal = subTotal + totalTax + shippingCost;
            setCheckoutData({
              cart: [buyNowProduct],
              subTotal,
              cartTotal,
              shippingCost,
              shippingTierLabel: '',
              shippingPerUnit: null,
              totalTax,
              totalDiscount,
              promoCode,
              promoDiscount,
            });
          }
        } else {
          setCheckoutData(null);
        }
        setIsLoading(false);
        return;
      }
      // Fallback to normal cart flow
      const stored = typeof window !== "undefined" ? localStorage.getItem("checkoutCart") : null;
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setCheckoutData(parsed);
          setCart(parsed.cart); // Update cart context
        } catch (error) {
          // console.error("Error parsing cart data:", error);
          setCheckoutData(null);
        }
      } else if (contextCart?.length > 0) {
        // If no localStorage but we have cart in context, use that
        // --- Improved Cart Calculation Logic ---
        const updatedCart = contextCart.map(item => {
          // Calculate discounted price per item
          let discountedUnitPrice = Number(item.price) || 0;
          if (item.discountPercent) {
            discountedUnitPrice = discountedUnitPrice * (1 - Number(item.discountPercent) / 100);
          } else if (item.discountAmount) {
            discountedUnitPrice = discountedUnitPrice - Number(item.discountAmount);
          }
          // If coupon applied, override with coupon price/discount
          if (item.couponApplied && item.couponDiscount) {
            discountedUnitPrice = discountedUnitPrice - Number(item.couponDiscount);
          }
          // Clamp to >= 0
          discountedUnitPrice = Math.max(0, discountedUnitPrice);

          const qty = Number(item.qty) || 1;
          const cgstRate = Number(item.cgst) || 0;
          const sgstRate = Number(item.sgst) || 0;
          const cgstTotal = (discountedUnitPrice * cgstRate / 100) * qty;
          const sgstTotal = (discountedUnitPrice * sgstRate / 100) * qty;

          return { ...item, discountedUnitPrice, cgstTotal, sgstTotal };
        });

        // Calculate original MRP subtotal (before any discount)
        const mrpSubTotal = updatedCart.reduce((sum, i) => sum + (Number(i.price) || 0) * (Number(i.qty) || 1), 0);
        const subTotal = updatedCart.reduce((sum, i) => sum + i.discountedUnitPrice * (Number(i.qty) || 1), 0);
        const totalCGST = updatedCart.reduce((sum, i) => sum + (i.cgstTotal || 0), 0);
        const totalSGST = updatedCart.reduce((sum, i) => sum + (i.sgstTotal || 0), 0);
        const totalTax = totalCGST + totalSGST;
        const totalDiscount = contextCart.reduce((sum, i) => {
          let discount = 0;
          if (i.discountPercent) {
            discount = Number(i.price) * (Number(i.discountPercent) / 100) * (Number(i.qty) || 1);
          } else if (i.discountAmount) {
            discount = Number(i.discountAmount) * (Number(i.qty) || 1);
          }
          if (i.couponApplied && i.couponDiscount) {
            discount += Number(i.couponDiscount) * (Number(i.qty) || 1);
          }
          return sum + discount;
        }, 0);
        // Only allow promo if no item-level coupon/discount
        const hasProductDiscount = updatedCart.some(i => i.discountPercent || i.discountAmount || i.couponApplied);
        const promoCode = !hasProductDiscount && appliedPromo ? appliedPromo : '';
        const promoDiscount = !hasProductDiscount && appliedPromoDetails?.discount ? appliedPromoDetails.discount : 0;

        // Shipping cost logic (reuse your existing/fallback logic)
        const shippingCost = checkoutData?.shippingCost || 0;
        // Final amount: subtotal after discount + taxes + shipping - promo discount
        const cartTotal = subTotal + totalTax + shippingCost - promoDiscount;

        setCheckoutData({
          cart: updatedCart,
          mrpSubTotal, // original MRP subtotal
          subTotal,    // subtotal after discount
          cartTotal,   // final amount
          shippingCost,
          shipping,
          totalTax,
          totalDiscount,
          promoCode,
          promoDiscount,
          totalCGST,
          totalSGST,
          // ...other fields as needed
        });
      }
      setIsLoading(false);
    };

    // Load cart/buy-now data when component mounts or when auth status changes
    loadCartData();
  }, [status]); // Re-run when auth status changes
  // --- PINCODE CHECK STATE ---
  const [isPincodeConfirmModalOpen, setIsPincodeConfirmModalOpen] = useState(false);
  const [statesList, setStatesList] = useState([]);
  const [pincodeChecked, setPincodeChecked] = useState(false);

  // Fetch states/districts for dropdowns on mount
  useEffect(() => {
    fetch('/api/zipcode')
      .then(res => res.json())
      .then(data => setStatesList(Array.isArray(data) ? data : []));
  }, []);

  const handleApplyPincode = () => {
    setPincodeChecked(true);
    setIsPincodeConfirmModalOpen(false);
  };

  // Promo code apply handler (modeled after CartDetails)
  const handleApplyPromo = async () => {
    if (!Array.isArray(checkoutData.cart)) {
      setCouponError("Cart is not loaded. Please refresh the page.");
      return;
    }
    setCouponError("");
    // Block if any product-level discount/coupon
    const hasDiscountedItem = checkoutData.cart.some(
      item => item.discountPercent || item.discountAmount || item.couponApplied
    );
    if (hasDiscountedItem) {
      setCouponError("A product-level discount or coupon is already applied. Promo code cannot be used.");
      return;
    }
    if (!couponInput.trim()) {
      setCouponError("Please enter a promo code.");
      return;
    }
    if (appliedPromo) {
      setCouponError(`Promo code "${appliedPromo}" is already applied.`);
      return;
    }
    setLoadingCoupon(true);
    // Calculate total before promo
    const totalAfterDiscount = checkoutData.cart.reduce(
      (sum, item) => sum + (item.price * item.qty),
      0
    );
    const cartTotalBeforePromo = totalAfterDiscount + (checkoutData.totalTax || 0) + (checkoutData.shippingCost || 0);

    try {
      const res = await fetch("/api/validatePromo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promoCode: couponInput.trim(), cartTotal: cartTotalBeforePromo }),
      });
      const data = await res.json();
      if (!data.valid) {
        setCouponError(data.error || "Invalid promo code.");
        setLoadingCoupon(false);
        return;
      }
      if (data.discount >= cartTotalBeforePromo) {
        setCouponError("Discount cannot exceed or equal cart total.");
        setLoadingCoupon(false);
        return;
      }
      setAppliedPromo(couponInput.trim());
      setAppliedPromoDetails(data.coupon);
      setCheckoutData(prev => ({
        ...prev,
        cartTotal: prev.cartTotal - data.discount,
        promoCode: couponInput.trim(),
        promoDiscount: data.discount,
      }));
      setCouponInput("");
      setCouponError("");
    } catch (err) {
      setCouponError("Failed to validate promo code. Please try again.");
    } finally {
      setLoadingCoupon(false);
    }
  };

  // Handle coupon application
  const cart = React.useMemo(() => {
    // First try checkoutData, then contextCart, then empty array
    const items = (checkoutData?.cart || contextCart || []).filter(Boolean);

    // If we have items but no checkoutData, update it
    if (items.length > 0 && !checkoutData) {
      setCheckoutData({
        cart: items,
        subTotal: items.reduce((sum, item) => sum + item.price * item.qty, 0),
      });
    }

    return items;
  }, [checkoutData, contextCart]);
  const handleApplyCoupon = async () => {
    setLoadingCoupon(true);
    setCouponError("");
    try {
      const res = await fetch('/api/discountCoupon/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponInput.trim(), cart }),
      });
      const data = await res.json();
      if (!data.success || !data.coupon) {
        setCouponError(data.message || 'Invalid coupon code');
      } else {
        // Update cart with discounted prices
        const updatedCart = cart.map(item => ({
          ...item,
          couponApplied: true,
          couponCode: data.coupon.couponCode,
          price: Math.round(item.price - (data.coupon.percent ? (item.price * data.coupon.percent) / 100 : data.coupon.amount || 0)),
          originalPrice: item.originalPrice || item.price,
        }));
        setLocalCart(updatedCart);
        setCart(updatedCart); // keep context in sync
        localStorage.setItem("checkoutCart", JSON.stringify(updatedCart));
        setCouponInput("");
        setCouponError("");
        toast.success('Coupon applied successfully!', { style: { borderRadius: '10px', border: '2px solid green' } });
      }
    } catch (error) {
      // console.error('Error applying coupon:', error);
      setCouponError('Failed to apply coupon');
    } finally {
      setLoadingCoupon(false);
    }
  };
  // const [error, setError] = useState(null);


  const paymentOptions = [
    { value: 'online', label: 'Online Payment' },
    { value: 'cod', label: 'Cash on Delivery (COD)' }
  ];
  const [payment, setPayment] = useState('cod');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [agree, setAgree] = useState(false);
  const [saveAddress, setSaveAddress] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [mounted, setMounted] = React.useState(false);
  // Billing form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [street, setStreet] = useState("");

  // const [state, setState] = useState("");
  // const [pincode, setpincode] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  // const [district, setDistrict] = useState("");
  const [altPhone, setAltPhone] = useState("");

  React.useEffect(() => { setMounted(true); }, []);
  const isLoadingOrUnauth = status === 'loading' || !session;

  React.useEffect(() => {
    if (!mounted) return;
    if (status === 'loading') return;
    if (!session) {
      router.replace(`/sign-in?callbackUrl=${encodeURIComponent(pathname)}`);
    }
    // Set email from session when component mounts
    if (session?.user?.email) {
      setEmail(session.user.email);
    }
  }, [session, status, router, pathname, mounted]);

  if (!mounted || isLoadingOrUnauth) {
    // Optionally render a spinner or nothing while redirecting
    return null;
  }
  // Collect customer info for Razorpay
  const getCustomerInfo = () => ({
    name: `${firstName} ${lastName}`.trim(),
    email,
    phone,
    altPhone,
    address: `${street}, ${city}, ${state}, ${pincode}`,
    district,
  });
  // Handle COD order creation
  // Prepare order data without submitting
  const prepareOrderData = (paymentMethod) => {
    // Check for buy-now mode
    let isBuyNow = false;
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      isBuyNow = params.get('mode') === 'buy-now';
      // console.log('📦 Order mode:', isBuyNow ? 'Buy Now' : 'Regular Cart');
    }

    // Calculate totals
    const subTotal = cart.reduce((sum, item) => sum + (item.price || 0) * (item.qty || 1), 0);
    const totalTax = cart.reduce(
      (sum, item) => sum + (((item.cgst || 0) + (item.sgst || 0)) / 100) * (item.price || 0) * (item.qty || 1),
      0
    );
    const shippingCost = subTotal >= 500 ? 0 : 50; // Example shipping logic
    const totalAmount = subTotal + totalTax + shippingCost;

    // Generate a unique order ID
    const orderId = generateOrderId();
    const transactionId = orderId;

    // Prepare products array
    const productsPayload = cart.map(item => {
      const productId = item._id || item.id || (item.product ? (item.product._id || item.product.id) : null);
      if (!productId) {
        // console.error('Could not determine product ID for item:', item);
        throw new Error('Invalid product: missing ID');
      }

      let variant = null;
      let variantId = item.variantId ?? item.variantIndex ?? 0;

      if (item.quantity?.variants?.length > 0) {
        variant = item.quantity.variants.find(v =>
          v._id === variantId || v.size === variantId || v.size === item.size
        ) || item.quantity.variants[0];
      }

      return {
        ...item,
        // Core product info
        id: productId,
        productId: productId,
        _id: productId,
        variantId: variantId,
        name: item.name || 'Product',
        qty: item.qty || 1,
        price: item.price || 0,
        originalPrice: item.originalPrice || item.price || 0,

        // Product details
        image: item.image || { url: '', key: '' },
        color: item.color || '',
        size: item.size || '',
        productCode: item.productCode || '',
        weight: item.weight || 0,
        totalQuantity: item.totalQuantity || 0,

        // Tax and pricing
        cgst: item.cgst || 0,
        sgst: item.sgst || 0,
        discountAmount: item.discountAmount || 0,
        discountPercent: item.discountPercent || 0,

        // Coupon info
        couponApplied: item.couponApplied || false,
        couponCode: item.couponCode || '',

        // Additional fields
        shipping: item.shipping || {},
        quantity: item.qty || 1 // Keep for backward compatibility
      };
    });

    // Build the order data
    return {
      // Order details
      products: productsPayload,
      cartTotal: totalAmount,
      subTotal: subTotal,
      totalTax: totalTax,
      shippingCost: shippingCost,
      payment: paymentMethod,
      paymentMethod: paymentMethod,
      orderId: orderId,
      transactionId: transactionId,
      status: 'Processing',
      agree: true,

      // Customer details
      firstName: firstName,
      lastName: lastName,
      email: session?.user?.email || email,
      phone: phone,

      // Address details
      street: street,
      city: city,
      district: district || '',
      state: state,
      pincode: pincode,

      // Items for quantity updates
      items: productsPayload.map(item => {
        let variant = null;
        let variantIndex = 0;

        if (item.quantity?.variants?.length > 0) {
          variant = item.quantity.variants.find(v => v.size === item.size) || item.quantity.variants[0];
          variantIndex = item.quantity.variants.findIndex(v => v._id === variant._id);
          if (variantIndex === -1) variantIndex = 0;
        }

        return {
          _id: item._id || item.id,
          productId: item._id || item.id,
          variantId: variantIndex,
          quantity: item.quantity,
          qty: item.qty || 1,
          size: item.size,
          variant: variant || {
            size: item.size,
            qty: item.qty || 1
          }
        };
      })
    };
  };

  const handleCreateOrder = async (paymentMethod, orderData = null) => {
    setLoading(true);
    setError(null);
    let createdOrder = null;

    try {
      // If orderData is provided (from overview), use it
      if (orderData) {
        // Use the provided order data
      } else {
        // Create order data from current state (for backward compatibility)

        // Check for buy-now mode
        let isBuyNow = false;
        if (typeof window !== "undefined") {
          const params = new URLSearchParams(window.location.search);
          isBuyNow = params.get('mode') === 'buy-now';
        }

        // Create order data from current state
        orderData = await prepareOrderData(paymentMethod);
      }
      let response;
      let data;

      try {
        response = await fetch('/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(orderData),
        });

        data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data.message || `HTTP error! status: ${response.status}`);
        }
      } catch (error) {
        throw error;
      }

      if (!response.ok) {
        throw new Error(data.message || `Failed to create order: ${response.status} ${response.statusText}`);
      }
      // Store order data to return
      createdOrder = response.data;

      // --- Clear cart and checkout-related data based on order type ---
      const isBuyNow = typeof window !== "undefined" &&
        new URLSearchParams(window.location.search).get('mode') === 'buy-now';

      try {
        if (isBuyNow) {
          // Only clear buy-now specific data
          localStorage.removeItem("buyNowItem");
          // Clear cart context but keep the actual cart items
          if (setCart) setCart(contextCart.filter(item => !item.isBuyNow));
        } else {
          // For regular cart checkout, clear everything
          localStorage.removeItem("cart");
          localStorage.removeItem("checkoutCart");
          localStorage.removeItem("checkoutData");
          Object.keys(localStorage).forEach(key => {
            if (key.startsWith('cart_')) {
              localStorage.removeItem(key);
            }
          });
          // Clear cart context
          if (setCart) setCart([]);
        }
      } catch (e) {
        // console.warn('Could not clear localStorage after order:', e);
      }

      setCheckoutData(null);

      // Show confirmation and set order ID
      setShowConfirmationModal(true);
      setOrderId(data.order?._id);

      // Show success message to session?.user
      toast.success('Order placed successfully!', {
        position: 'top-center',
        style: {
          borderRadius: '10px',
          background: '#4CAF50',
          color: 'white',
          padding: '16px',
          fontSize: '16px',
          fontWeight: 'bold'
        }
      });

      return data.order;
    } catch (error) {
      setError(error.message || 'Failed to create order');
      toast.error(error.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Validate all required form fields
  const validateForm = () => {
    const errors = {};
    if (!firstName.trim()) errors.firstName = 'First name is required';
    if (!lastName.trim()) errors.lastName = 'Last name is required';
    if (!email.trim()) errors.email = 'Email is required';
    if (!phone.trim()) errors.phone = 'Phone number is required';
    if (!street.trim()) errors.street = 'Address is required';
    if (!city.trim()) errors.city = 'City is required';
    if (!state.trim()) errors.state = 'State is required';
    if (!pincode.trim()) {
      errors.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(pincode)) {
      errors.pincode = 'Pincode must be 6 digits';
    }
    if (!payment) errors.payment = 'Please select a payment method';
    if (!agree) errors.agree = 'You must agree to the terms and conditions';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Place Order handler
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Scroll to first error
      const firstError = Object.keys(formErrors)[0];
      if (firstError) {
        const element = document.querySelector(`[name="${firstError}"]`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
      return;
    }
    
    setLoading(true);
    setError("");
    let addressSaved = false;

    // Save address if requested
    // if (saveAddress) {
    //   const shippingData = {
    //     firstName,
    //     lastName,
    //     address: street,
    //     city,
    //     state,
    //     postalCode: pincode,
    //     phone,
    //     email,
    //     district,
    //     altPhone,
    //   };

    //   try {
    //     const res = await fetch('/api/shippingAddress', {
    //       method: 'POST',
    //       headers: { 'Content-Type': 'application/json' },
    //       body: JSON.stringify(shippingData)
    //     });
    //     const result = await res.json();
    //     if (!res.ok) {
    //       setError(result.message || "Failed to save shipping address");
    //       return;
    //     }
    //     addressSaved = true;
    //   } catch (err) {
    //     setError("Failed to save shipping address");
    //     return;
    //   }
    // }

    // Handle payment based on selected method
    // Check for buy-now mode from URL
    let isBuyNow = false;
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      isBuyNow = params.get('mode') === 'buy-now';
    }

    if (payment === "online") {
      if (!checkoutData) {
        setError("Checkout data not found. Please refresh the page.");
        return;
      }
      const customer = getCustomerInfo();
      const finalAmount = checkoutData.cartTotal;
      await handleOnlinePaymentWithOrder(finalAmount, checkoutData.cart, customer, setLoading, setError, router, checkoutData);
    }
    else if (payment === "cod") {
      // Handle Cash on Delivery
      setLoading(true);
      try {
        // Prepare and create COD order
        setPaymentMethod('cod');
        const orderData = prepareOrderData('cod');
        const result = await handleCreateOrder('cod', orderData);
        if (result) {
          // Clear the form
          setFirstName('');
          setLastName('');
          setPhone('');
          setAltPhone('');
          setStreet('');
          setCity('');
          setDistrict('');
          setState('');
          setPincode('');
          // Show confirmation modal
          setShowConfirmationModal(true);
          setOrderId(result._id || result.orderId);

          // Force a page reload to ensure all state is reset
          setTimeout(() => {
            // Clear everything again before redirecting
            window.location.href = `/order-confirmation?orderId=${result._id || result.orderId}`;
          }, 1000);
        }
      }

      catch (error) {
        setError(error.message || 'Failed to create order');
        toast.error(error.message || 'Failed to place order. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  // Handler for confirming payment on overview (step 2 → step 3)
  const handleConfirmAndPay = async () => {
    if (!confirmedPaymentMethod) {
      setError('Please select a payment method.');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Build form fields from state for payload
      const formFields = {
        street, city, district, state, pincode, firstName, lastName, email, phone, altPhone
      };
      let orderId = checkoutData?.orderId;
      let transactionId = checkoutData?.transactionId;

      // Check for buy now product in localStorage
      const buyNowProductRaw = typeof window !== 'undefined' ? localStorage.getItem('buyNowProduct') : null;
      const isBuyNow = buyNowProductRaw !== null;
      
      // Get products based on mode (buy now or regular cart)
      let productsToProcess = [];
      
      if (isBuyNow) {
        // Parse buy now product and add to products array
        const buyNowProduct = JSON.parse(buyNowProductRaw);
        if (buyNowProduct) {
          productsToProcess = [{
            ...buyNowProduct,
            // Ensure required fields
            qty: Number(buyNowProduct.qty) || 1,
            price: Number(buyNowProduct.price) || 0,
            originalPrice: Number(buyNowProduct.originalPrice) || Number(buyNowProduct.price) || 0,
            color: buyNowProduct.color || '',
            size: buyNowProduct.size || '',
            weight: Number(buyNowProduct.weight) || 0,
            cgst: Number(buyNowProduct.cgst) || 0,
            sgst: Number(buyNowProduct.sgst) || 0,
            // Handle image URL
            image: typeof buyNowProduct.image === 'string' 
              ? buyNowProduct.image 
              : buyNowProduct.image?.url || ''
          }];
        }
      } else {
        // Use regular cart items
        productsToProcess = [...contextCart];
      }

      if (confirmedPaymentMethod === 'cod') {
        // Always generate unique orderId for COD using shared generator
        orderId = generateOrderId();
        transactionId = orderId; // For COD, transactionId is same as orderId
        setPaymentMethod('cod');
        // Prepare products with proper image URL handling
        const preparedProducts = productsToProcess.map(item => ({
          ...item,
          // Ensure image is a string URL
          image: typeof item.image === 'string'
            ? item.image
            : item.image?.url || '',
          // Ensure required fields have defaults
          qty: item.qty || 1,
          price: item.price || 0,
          color: item.color || '',
          size: item.size || ''
        }));

        // Calculate shipping cost - use the most reliable source
        const shippingCost = Number(
          checkoutData?.shippingCost || 
          checkoutData?.shipping || 
          checkoutData?.finalShipping || 
          0
        );

        // Prepare complete order data
        const orderData = {
          ...buildOrderPayload({
            cart: preparedProducts,
            checkoutData: {
              ...checkoutData,
              // Ensure these fields exist with proper fallbacks
              cartTotal: checkoutData?.cartTotal || 0,
              subTotal: checkoutData?.subTotal || 0,
              totalDiscount: checkoutData?.totalDiscount || 0,
              totalTax: checkoutData?.totalTax || checkoutData?.taxTotal || 0,
              // Ensure promo code data is included from the root of checkoutData
              promoCode: checkoutData?.promoCode || checkoutData?.appliedCoupon?.code || null,
              promoDiscount: checkoutData?.promoDiscount || checkoutData?.appliedCoupon?.discount || 0,
              // Include the appliedCoupon object if it exists
              ...(checkoutData?.appliedCoupon && {
                appliedCoupon: {
                  code: checkoutData.appliedCoupon.code,
                  discount: checkoutData.appliedCoupon.discount || 0,
                  type: checkoutData.appliedCoupon.type || 'fixed',
                  minPurchase: checkoutData.appliedCoupon.minPurchase,
                  maxDiscount: checkoutData.appliedCoupon.maxDiscount
                }
              }),
              // Use the calculated shipping cost
              shippingCost: shippingCost,
              // Include coupon data from products if available
              ...(preparedProducts.some(p => p.couponCode) && {
                products: preparedProducts.map(p => ({
                  ...p,
                  // Ensure coupon data is included in each product
                  couponApplied: p.couponApplied || false,
                  couponCode: p.couponCode || ''
                }))
              })
            },
            ...formFields,
            payment: 'cod',
            paymentMethod: 'cod',
            paymentMethodValue: 'cod',
            transactionId,
            orderId,
            agree: true,
            statusValue: 'Pending'
          }),
          // Include additional required fields
          items: preparedProducts.map(item => ({
            ...item,
            productId: item._id || item.productId,
            variantId: item.variantId || 0,
            quantity: item.qty || 1,
            price: item.price || 0,
            total: (item.price || 0) * (item.qty || 1),
            // Include additional product details
            originalPrice: item.originalPrice || item.price || 0,
            color: item.color || '',
            size: item.size || '',
            weight: item.weight || 0,
            cgst: item.cgst || 0,
            sgst: item.sgst || 0,
            discountAmount: item.discountAmount || 0,
            discountPercent: item.discountPercent || 0,
            // Ensure tax and discount info is included
            tax: item.tax || 0,
            taxPercentage: item.taxPercentage || 0,
            taxType: item.taxType || 'inclusive',
            discountType: item.discountType || 'amount'
          })),
          // Ensure order-level tax and promo data is included
          tax: checkoutData?.totalTax || 0,
          taxPercentage: checkoutData?.taxPercentage || 0,
          // Get promo code from multiple possible locations in checkoutData
          promoCode: checkoutData?.promoCode || checkoutData?.appliedCoupon?.code || null,
          promoDiscount: checkoutData?.promoDiscount || checkoutData?.appliedCoupon?.discount || 0,
          // Include applied coupon details if available
          ...(checkoutData?.appliedCoupon ? {
            appliedCoupon: {
              code: checkoutData.appliedCoupon.code,
              discount: checkoutData.appliedCoupon.discount || 0,
              type: checkoutData.appliedCoupon.type || 'fixed',
              minPurchase: checkoutData.appliedCoupon.minPurchase,
              maxDiscount: checkoutData.appliedCoupon.maxDiscount
            }
          } : {}),
          // Ensure coupon data is included in the root of the order
          couponApplied: preparedProducts.some(p => p.couponApplied) || false,
          couponCode: preparedProducts.find(p => p.couponCode)?.couponCode || null,
          // Ensure these fields are included
          status: 'Pending',
          paymentStatus: 'Pending',
          paymentMethod: 'cod',
          isBuyNow: isBuyNow,
          datePurchased: new Date().toISOString()
        };
        // console.log('Sending order data:', JSON.stringify(orderData, null, 2));
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderData)
        });
        const data = await res.json();
        if (!data.orderId) {
          setError('Order creation failed.');
          setLoading(false);
          return;
        }
        
        // Clear buy now product from localStorage if this was a buy now order
        if (isBuyNow && typeof window !== 'undefined') {
          localStorage.removeItem('buyNowProduct');
        }
        // Optionally send confirmation email here
        try {
          await fetch('/api/brevo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: email,
              subject: 'Order Confirmation',
              htmlContent: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Confirmation</title>
    <style type="text/css">
      body { font-family: Arial, sans-serif; background: #f8f9fa; }
      .container { background: #fff; border-radius: 8px; margin: 32px auto; max-width: 600px; padding: 32px 24px; }
      .header { text-align: center; }
      .summary-table { width: 100%; border-collapse: collapse; margin: 24px 0; }
      .summary-table th, .summary-table td { border: 1px solid #e5e7eb; padding: 8px; text-align: left; font-size: 14px; }
      .summary-table th { background: #f3f4f6; }
      .product-img { width: 48px; height: 48px; object-fit: cover; border-radius: 6px; border: 1px solid #e5e7eb; }
      .dashboard-btn { display: block; width: 100%; margin: 32px 0 0 0; text-align: center; background: #f97316; color: #fff; padding: 12px 0; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 16px; }
    </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>Thank you for your order!</h2>
      <p>Hello, ${firstName} ${lastName}</p>
    </div>
    <div class="footer">
      <p>Order ID: ${orderId}</p>
      <p>Order Date: ${new Date().toLocaleDateString()}</p>
    </div>
    <h3 style="margin-top:32px; font-size:18px;">Order Summary</h3>
    <table class="summary-table">
      <thead>
        <tr>
          <th>Image</th>
          <th>Name</th>
          <th>Qty</th>
          <th>Size</th>
          <th>Weight</th>
          <th>Shipping Charge</th>
          <th>Price</th>
        </tr>
      </thead>
      <tbody>
        ${Array.isArray(checkoutData?.cart) ? checkoutData.cart.map(item => `
          <tr>
            <td><img src="${item.image?.url || item.image || ''}" class="product-img" alt="${item.name || ''}" /></td>
            <td>${item.name || ''}</td>
            <td>${item.qty || 1}</td>
            <td>${item.size || '-'}</td>
            <td>${typeof item.weight !== 'undefined' && item.weight !== null ? item.weight + 'g' : '-'}</td>
<td>${typeof item.shipping !== 'undefined' && item.shipping !== null ? item.shipping + 'g' : '-'}</td>
<td>₹${typeof item.price !== 'undefined' && item.price !== null ? Number(item.price).toFixed(2) : '-'}</td>
          </tr>
        `).join('') : ''}
      </tbody>
    </table>
    </table>
    
    <!-- Order Summary -->
    <div style="margin-top: 24px; padding: 16px; background: #f9fafb; border-radius: 6px;">
      <h3 style="margin-top: 0; margin-bottom: 12px; font-size: 16px; font-weight: 600;">Order Summary</h3>
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
        <span>Subtotal:</span>
        <span>₹${checkoutData?.subTotal ? Number(checkoutData.subTotal).toFixed(2) : '0.00'}</span>
      </div>
      ${checkoutData?.totalDiscount > 0 ? `
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: #10b981;">
          <span>Discount:</span>
          <span>-₹${Number(checkoutData.totalDiscount).toFixed(2)}</span>
        </div>
      ` : ''}
      ${checkoutData?.promoCode ? `
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span>Promo Code (${checkoutData.promoCode}):</span>
          <span>-₹${checkoutData.promoDiscount ? Number(checkoutData.promoDiscount).toFixed(2) : '0.00'}</span>
        </div>
      ` : ''}
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
        <span>Tax (GST):</span>
        <span>₹${checkoutData?.totalTax ? Number(checkoutData.totalTax).toFixed(2) : '0.00'}</span>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #e5e7eb;">
        <span>Shipping:</span>
        <span>${checkoutData?.shippingCost ? `₹${Number(checkoutData.shippingCost).toFixed(2)}` : 'Free'}</span>
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: 600; margin-top: 12px;">
        <span>Total Amount:</span>
        <span>₹${checkoutData?.cartTotal ? Number(checkoutData.cartTotal).toFixed(2) : '0.00'}</span>
      </div>
    </div>

    <!-- Order Status -->
    <div style="margin: 24px 0; padding: 16px; background: #fff7ed; border-radius: 6px; border-left: 4px solid #f97316;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <h3 style="margin: 0 0 4px 0; font-size: 16px; font-weight: 600;">Order Status: ${order.status || 'Pending'}</h3>
          <p style="margin: 0; font-size: 14px; color: #4b5563;">
            Payment Method: ${order.payment === 'online' ? 'Online Payment' : 'Cash on Delivery'}
          </p>
        </div>
      </div>
    </div>

    <p style="margin: 24px 0; font-size: 14px; color: #6b7280;">
      Thank you for shopping with us! You can check your order status anytime in your dashboard.
    </p>

    <a href="https://rishikeshhandmade.com/dashboard?section=orders" class="dashboard-btn">View Order in Dashboard</a>
  </div>
</body>
</html>`
            })
          });
        } catch (e) { /* handle email error */ }
        setOrderId(orderId); // orderId should be the Razorpay/order DB ID you get back
        setShowConfirmationModal(true);
        toast.success('Order placed successfully!');
        toast.success('Invoice Sent to Email');
        // router.push(`/dashboard?orderId=${data.orderId}`);
        await clearCart();
        if (buyNowMode) {
          localStorage.removeItem('buyNowProduct');
        }
        else {
          if (typeof window !== 'undefined') {
            localStorage.removeItem("cart");
            localStorage.removeItem("checkoutCart");
            localStorage.removeItem("checkoutData");
            Object.keys(localStorage).forEach(key => {
              if (key.startsWith('cart_')) {
                localStorage.removeItem(key);
              }
            });
          }
        }
        setLoading(false);
        return;
      }
      // For online, always go through Razorpay handler
      if (confirmedPaymentMethod === 'online') {
        setPaymentMethod('online');
        const customer = {
          name: `${firstName} ${lastName}`.trim(),
          email,
          phone
        };
        
        // Use the prepared products array that includes buy now product if in buy now mode
        const paymentProducts = productsToProcess.map(item => ({
          ...item,
          // Ensure all required fields are included
          _id: item._id || item.productId,
          productId: item._id || item.productId,
          name: item.name || 'Product',
          price: Number(item.price) || 0,
          qty: Number(item.qty) || 1,
          image: typeof item.image === 'string' ? item.image : item.image?.url || '',
          color: item.color || '',
          size: item.size || '',
          weight: Number(item.weight) || 0,
          cgst: Number(item.cgst) || 0,
          sgst: Number(item.sgst) || 0,
          originalPrice: Number(item.originalPrice) || Number(item.price) || 0
        }));
        
        await handleOnlinePaymentWithOrder(
          checkoutData?.cartTotal,
          paymentProducts, // Use the prepared products array
          customer,
          setLoading,
          setError,
          router,
          { 
            ...checkoutData, 
            orderId: generateOrderId(), 
            transactionId: generateTransactionId(),
            isBuyNow // Pass buy now flag to the payment handler
          },
          { 
            ...formFields, 
            paymentMethod: 'online',
            isBuyNow // Include in form fields as well
          },
          session?.user
        );
        return;
      }
      setLoading(false);
    } catch (error) {
      setError(error.message || 'Order creation failed.');
      setLoading(false);
    }
  }
  // Show order overview after successful payment or when navigating back
  if (showOverview || showConfirmationModal) {
    return (
      <CheckOutOverview
        checkoutData={{
          ...checkoutData,
          firstName,
          lastName,
          email,
          phone,
          altPhone,
          street,
          city,
          district,
          state,
          pincode,
          address: [street, city, district, state, pincode].filter(Boolean).join(', '),
        }}
        paymentMethod={confirmedPaymentMethod}
        onEdit={() => setShowOverview(false)}
        onConfirm={handleConfirmAndPay}
        loading={loading}
        error={error}
        showConfirmationModal={showConfirmationModal}
        orderId={orderId}
        onGoToDashboard={() => { window.location.href = `/dashboard?orderId=${orderId}`; }}
      />
    );
  }
  return (
    <div className="flex flex-col md:flex-row gap-10 w-full min-h-screen bg-[#fcf7f2] p-2 md:p-10">
      {/* Billing Details Form */}
      <div className="flex-1 bg-white rounded-lg shadow p-4 md:p-8">
        <div className="border-b border-gray-200 pb-4 mb-6">
          <h2 className="text-xl py-5 md:text-2xl font-bold">Thanks for being a loyal customer,</h2>
          <p className="text-md md:text-xl font-semibold"> Your cart is ready. Rishkish Handmade is a trusted growth partner to millions of everyday entrepreneurs.</p>
          <br />
          <p className="text-sm md:text-lg font-semibold">Dear Customer,To proceed with your order and ensure smooth delivery, we kindly request you to provide the following basic information:</p>
        </div>

        <form className="space-y-6" onSubmit={(e) => {
          e.preventDefault();
          handlePlaceOrder(e);
        }}>
          <div>
            <h3 className="text-md font-semibold mb-4">Basic Profile</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm mb-1 text-gray-600">First Name</label>
                <input
                  className={`w-full py-2 px-3 bg-gray-100 rounded-md ${formErrors.firstName ? 'border-2 border-red-500' : 'border-0'}`}
                  required
                  type="text"
                  name="firstName"
                  placeholder="Enter First Name"
                  value={firstName}
                  onChange={e => {
                    setFirstName(e.target.value);
                    if (formErrors.firstName) {
                      setFormErrors(prev => ({ ...prev, firstName: '' }));
                    }
                  }}
                />
                {formErrors.firstName && <p className="text-red-500 text-xs mt-1">{formErrors.firstName}</p>}
              </div>
              <div>
                <label className="block text-sm mb-1 text-gray-600">Last Name</label>
                <input
                  className={`w-full py-2 px-3 bg-gray-100 rounded-md ${formErrors.lastName ? 'border-2 border-red-500' : 'border-0'}`}
                  required
                  type="text"
                  name="lastName"
                  placeholder="Enter Last Name"
                  value={lastName}
                  onChange={e => {
                    setLastName(e.target.value);
                    if (formErrors.lastName) {
                      setFormErrors(prev => ({ ...prev, lastName: '' }));
                    }
                  }}
                />
                {formErrors.lastName && <p className="text-red-500 text-xs mt-1">{formErrors.lastName}</p>}
              </div>
              <div>
                <label className="block text-sm mb-1 text-gray-600">Email</label>
                <input
                  className={`w-full py-2 px-3 bg-gray-100 rounded-md border-0 cursor-not-allowed ${formErrors.email ? 'border-2 border-red-500' : ''}`}
                  type="email"
                  name="email"
                  placeholder="example@gmail.com"
                  required
                  value={checkoutData?.email || email}
                  onChange={e => setEmail(e.target.value)}
                  disabled
                />
                {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1 text-gray-600">Call No.</label>
                  <input
                    className={`w-full py-2 px-3 bg-gray-100 rounded-md ${formErrors.phone ? 'border-2 border-red-500' : 'border-0'}`}
                    type="tel"
                    name="phone"
                    placeholder="Type Number"
                    required
                    maxLength={10}
                    pattern="[0-9]{10}"
                    value={phone}
                    onChange={e => {
                      setPhone(e.target.value);
                      if (formErrors.phone) {
                        setFormErrors(prev => ({ ...prev, phone: '' }));
                      }
                    }}
                  />
                  {formErrors.phone && <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>}
                </div>
                <div>
                  <label className="block text-sm mb-1 text-gray-600">Alt. Call No.</label>
                  <input
                    className={`w-full py-2 px-3 bg-gray-100 rounded-md`}
                    type="tel"
                    maxLength={10}
                    placeholder="Type Number"
                    pattern="[0-9]{10}"
                    value={altPhone}
                    onChange={e => {
                      setAltPhone(e.target.value);
                    }}
                  />
                
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-md font-semibold mb-4">Shipping Address</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-1 text-gray-600">Address</label>
                <input
                  className={`w-full py-2 px-3 bg-gray-100 rounded-md ${formErrors.street ? 'border-2 border-red-500' : 'border-0'}`}
                  required
                  type="text"
                  name="street"
                  placeholder="Enter Address"
                  value={street}
                  onChange={e => {
                    setStreet(e.target.value);
                    if (formErrors.street) {
                      setFormErrors(prev => ({ ...prev, street: '' }));
                    }
                  }}
                />
                {formErrors.street && <p className="text-red-500 text-xs mt-1">{formErrors.street}</p>}
              </div>
              <div>
                <label className="block text-sm mb-1 text-gray-600">Pincode</label>
                <div>
                  <input
                    className={`w-fit py-2 px-3 bg-gray-100 rounded-md ${formErrors.pincode ? 'border-2 border-red-500' : 'border-0'}`}
                    required
                    type="number"
                    name="pincode"
                    maxLength={6}
                    pattern="[0-9]{6}"
                    placeholder='Enter Pincode'
                    value={pincode}
                    onChange={e => {
                      setPincode(e.target.value);
                      if (formErrors.pincode) {
                        setFormErrors(prev => ({ ...prev, pincode: '' }));
                      }
                    }}
                  />
                  {formErrors.pincode && <p className="text-red-500 text-xs mt-1">{formErrors.pincode}</p>}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm mb-1 text-gray-600">City</label>
                  <input
                    className={`w-full py-2 px-3 bg-gray-100 rounded-md ${formErrors.city ? 'border-2 border-red-500' : 'border-0'}`}
                    required
                    type="text"
                    name="city"
                    placeholder="Enter City"
                    value={city}
                    onChange={e => {
                      setCity(e.target.value);
                      if (formErrors.city) {
                        setFormErrors(prev => ({ ...prev, city: '' }));
                      }
                    }}
                  />
                  {formErrors.city && <p className="text-red-500 text-xs mt-1">{formErrors.city}</p>}
                </div>
                <div>
                  <label className="block text-sm mb-1 text-gray-600">Distt.</label>
                  <input
                    className="w-full py-2 px-3 bg-gray-100 rounded-md border-0"
                    type="text"
                    placeholder="Enter District"
                    value={district}
                    onChange={e => setDistrict(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1 text-gray-600">State</label>
                  <input
                    className={`w-full py-2 px-3 bg-gray-100 rounded-md ${formErrors.state ? 'border-2 border-red-500' : 'border-0'}`}
                    required
                    type="text"
                    name="state"
                    placeholder="Enter State"
                    value={state}
                    onChange={e => {
                      setState(e.target.value);
                      if (formErrors.state) {
                        setFormErrors(prev => ({ ...prev, state: '' }));
                      }
                    }}
                  />
                  {formErrors.state && <p className="text-red-500 text-xs mt-1">{formErrors.state}</p>}
                </div>
              </div>
            </div>
          </div>
          <div className="text-center text-gray-700 text-sm">
            This helps us serve you better and keep you updated on your order status.
          </div>
        </form>

        {/* <div className="flex items-center gap-2 mt-4">
          <input
            type="checkbox"
            id="saveAddress"
            checked={saveAddress}
            onChange={e => setSaveAddress(e.target.checked)}
            className="accent-pink-600 w-4 h-4"
          />
           <label htmlFor="saveAddress" className="text-sm select-none">Save this address to my account</label> 
        </div> */}
      </div>
      {/* Order Summary Card */}
      <div className="w-full md:w-[420px] bg-white rounded-lg shadow p-6 self-start">
        {/* Coupon Input - show only if cart has products and no coupon is applied */}
        {checkoutData ? (
          <>
            <div className="divide-y divide-neutral-200 mb-4">
              {checkoutData.cart.map(item => (
                <div key={item.id} className="flex items-center gap-3 py-3 relative">
                  <img src={item.image?.url || item.image} alt={item.name} className="w-16 h-16 rounded object-cover border" />
                  <div className="flex-1">
                    <div className="font-medium text-sm leading-tight mb-1">{item.name}</div>
                    <div className="flex items-center justify-between">
                    
                      <div className="flex items-center border rounded-md bg-gray-100 px-2">
                      Qty: 
                        <span className="px-3 py-1 text-base font-semibold">{item.qty}</span>

                      </div>
                      <div className="text-md text-black font-semibold whitespace-nowrap">₹{(item.originalPrice).toFixed(2)}</div>
                    </div>
                    <div className="flex justify-between items-center text-sm mb-2">
                      <span className="text-gray-600">CGST ({item.cgst}%)</span>
                      <span>₹{((item.price * item.cgst / 100) * item.qty).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm mb-2">
                      <span className="text-gray-600">SGST ({item.sgst}%)</span>
                      <span>₹{((item.price * item.sgst / 100) * item.qty).toFixed(2)}</span>
                    </div>
                    {item.couponApplied && (
                      <div className="mt-2">
                        <span className="bg-cyan-500 text-white text-xs rounded px-2 py-1 font-semibold">
                          Applied Coupon{" "}
                          {item.discountPercent
                            ? `${item.discountPercent}% off`
                            : `₹${item.discountAmount} off`}
                        </span>
                      </div>
                    )}
                  </div>
                  <button
                    className="absolute top-3 right-0 text-gray-400 hover:text-red-500"
                    type="button"
                    onClick={() => removeFromCart(item.id)}
                    aria-label="Remove"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            <div className="bg-gray-50 p-3 rounded-md mb-4">
              <div className="flex justify-between items-center text-sm mb-2">
                <span className="text-gray-600">Subtotal <span className="text-xs text-gray-400">(MRP)</span></span>
                <span>₹{checkoutData.subTotal?.toFixed(2)}</span>
              </div>
              <div className="text-xs text-red-500 mb-1">Subtotal does not include applicable taxes</div>
              <div className="flex justify-between items-center text-sm mb-2">
                <span className="text-gray-600">Discount Amount</span>
                <span className="text-green-600">-₹{checkoutData.totalDiscount?.toFixed(2)}</span>
              </div>
              {checkoutData.couponApplied && (
                <div className="flex justify-between items-center text-sm mb-2">
                  <span className="text-gray-600">Coupon <span className="text-xs text-green-600">({checkoutData.coupon.code})</span></span>
                  <span className="text-green-600">-₹{checkoutData.coupon.discount?.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t border-gray-200 my-2"></div>
              {(checkoutData.totalDiscount > 0 || (checkoutData.promo && checkoutData.promo.discount > 0)) && (
                <div className="flex items-center text-green-700 font-semibold text-base mb-2">
                  Nice! You saved <span className="mx-1">₹ {checkoutData.totalDiscount?.toFixed(2)}</span> on your order.
                </div>
              )}
              <div className="text-xs text-gray-500 mb-2">Note : If discount promo code already applied extra additional coupon not applicable</div>
            </div>
            {checkoutData?.shippingCost !== undefined && (
              <div className="flex justify-between items-center mt-2">
                <span className="font-semibold">
                  Shipping Charges{checkoutData.shippingTierLabel ? ` (${checkoutData.shippingTierLabel})` : ''}
                </span>
                <span className="font-semibold">
                  ₹{Number(checkoutData.shippingCost).toFixed(2)}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center text-sm mb-2">
              <span className="text-gray-600">Shipping Charges</span>
              <span>₹{Number(checkoutData?.shipping || 0).toFixed(2)}</span>
            </div>
            {(() => {
              const totalCGST = checkoutData.cart.reduce(
                (sum, item) => sum + ((item.price * item.cgst / 100) * item.qty),
                0
              );
              const totalSGST = checkoutData.cart.reduce(
                (sum, item) => sum + ((item.price * item.sgst / 100) * item.qty),
                0
              );
              return (
                <>
                  <div className="flex justify-between items-center text-sm mb-2">
                    <span className="text-gray-600">Total CGST</span>
                    <span>₹{totalCGST.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm mb-2">
                    <span className="text-gray-600">Total SGST</span>
                    <span>₹{totalSGST.toFixed(2)}</span>
                  </div>
                </>
              );
            })()}

            <div className="border-t border-gray-200 pt-3 mb-4">
              <div className="flex justify-between items-center font-bold text-lg">
                <span>Final Amount</span>
                <span>₹{checkoutData.cartTotal?.toFixed(2)}</span>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Have a promo code?</label>
              {appliedPromo && (
                <div className="text-green-700 text-xs mt-1">
                  Promo code "{appliedPromo}" applied successfully!
                </div>
              )}
              <div className="flex gap-2">
                <input
                  className="border rounded px-3 py-2 flex-1 text-sm bg-blue-50"
                  placeholder="Apply Promo Code"
                  value={couponInput}
                  onChange={e => {
                    setCouponInput(e.target.value);
                    setCouponError("");
                  }}
                  disabled={loadingCoupon || !!appliedPromo}
                />
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded font-semibold text-sm disabled:opacity-60"
                  onClick={handleApplyPromo}
                  disabled={loadingCoupon || !couponInput.trim() || !!appliedPromo}
                  type="button"
                >
                  {loadingCoupon ? "Applying..." : "Apply"}
                </button>
              </div>
              {couponError && <div className="text-red-600 text-xs mt-1">{couponError}</div>}
            </div>

            <div className="mb-6">
              <h3 className="font-medium mb-3">Payment Method</h3>
              <div className="space-y-3 mb-4">
                {paymentOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center p-3 border rounded-md cursor-pointer ${payment === option.value ? 'border-black' : 'border-gray-200'}`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={option.value}
                      checked={payment === option.value}
                      onChange={(e) => {
                        const method = e.target.value;
                        setPayment(method);
                        setPaymentMethod(method);
                      }}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 mr-3"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{option.label}</div>
                      {option.value === 'cod' && (
                        <p className="text-sm text-gray-500 mt-1">Pay when you receive your order</p>
                      )}
                    </div>
                  </label>
                ))}
              </div>

              <div className="flex items-center gap-2 mt-4">
                {/* <img src="/images/razorpay.svg" alt="Razorpay" className="h-6" /> */}
                <span className="text-sm text-gray-600">100% Secure Payment</span>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <img src="/visa-img.png" alt="Visa" className="h-4" />
                <img src="/master-card.png" alt="Mastercard" className="h-4" />
                <img src="/rupay.png" alt="Rupay" className="h-4" />
                <img src="/upi.png" alt="UPI" className="h-4" />
              </div>
              <p className="text-xs text-gray-500 mt-2">We accept all major credit/debit cards, UPI, and Netbanking.</p>
            </div>
          </>
        ) : (
          <div className="text-red-600">No checkout data found.</div>
        )}

        <div className="flex items-start gap-2 mt-6 mb-4">
          <div className="flex items-start">
            <input
              type="checkbox"
              id="terms"
              name="agree"
              checked={agree}
              onChange={e => {
                setAgree(e.target.checked);
                if (formErrors.agree) {
                  setFormErrors(prev => ({ ...prev, agree: '' }));
                }
              }}
              className={`accent-pink-600 w-4 h-4 mt-1 ${formErrors.agree ? 'ring-2 ring-red-500' : ''}`}
            />
            <label htmlFor="terms" className="text-xs text-gray-600 ml-2">
              I have read and agree to the website terms and conditions
            </label>
          </div>
          {formErrors.agree && <p className="text-red-500 text-xs mt-1 ml-6">{formErrors.agree}</p>}
        </div>
        {formErrors.payment && (
          <div className="mb-4 p-2 bg-red-50 border-l-4 border-red-500">
            <p className="text-red-700 text-sm">{formErrors.payment}</p>
          </div>
        )}
        <div className="mt-4 mb-4">
          {/* <pre className="bg-gray-100 p-4 rounded overflow-auto">
           {JSON.stringify({
              firstName,
              lastName,
              email,
              phone,
              altPhone,
              street,
              city,
              district,
              state,
              pincode,
              payment,
              paymentMethod,
              checkoutData: {
                cart: checkoutData?.cart?.map(item => ({
                  id: item.id,  
                  name: item.name,
                  price: item.price,
                  qty: item.qty,
                  cgst: item.cgst,
                  sgst: item.sgst
                })) || [],
                subTotal: checkoutData?.subTotal,
                totalTax: checkoutData?.totalTax,
                cartTotal: checkoutData?.cartTotal,
                shippingCost: checkoutData?.shippingCost
              }
            }, null, 2)} 
          </pre> */}
        </div>
        <button
          className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded font-semibold text-sm transition-colors"
          disabled={loading || isProcessingPayment}
          type="button"
          onClick={async () => {
            if (!validateForm()) {
              // Scroll to first error
              const firstError = Object.keys(formErrors)[0];
              if (firstError) {
                const element = document.querySelector(`[name="${firstError}"]`);
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              }
              return;
            }
            
            if (!payment) {
              setFormErrors(prev => ({ ...prev, payment: 'Please select a payment method' }));
              return;
            }
            
            if (!agree) {
              setFormErrors(prev => ({ ...prev, agree: 'You must agree to the terms and conditions' }));
              return;
            }
            
            setConfirmedPaymentMethod(payment); // payment = 'cod' or 'online'
            setShowOverview(true);
          }}
        >
          {loading ? (
            <>
              <span className="animate-spin inline-block mr-2">🔄</span> Processing...
            </>
          ) : payment === 'cod' ? (
            `Place Order (₹${checkoutData?.cartTotal?.toFixed(2) || '0.00'})`
          ) : (
            `Pay ₹${checkoutData?.cartTotal?.toFixed(2) || '0.00'}`
          )}
        </button>

      </div>
    </div>

  );
}

export default CheckOut;