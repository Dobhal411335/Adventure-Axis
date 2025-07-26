"use client"
import React from 'react';
import Image from 'next/image';

const CheckOutOverview = ({ checkoutData, paymentMethod, onEdit, onConfirm, loading, error, showConfirmationModal, orderId, onGoToDashboard }) => {
  // Debug: Log modal props
  // console.log('[CheckOutOverview] showConfirmationModal:', showConfirmationModal, 'orderId:', orderId);
  if (!checkoutData) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center text-gray-500">Loading order summary...</div>
      </div>
    );
  }

  // Dummy/fallbacks for demonstration; replace with real data as needed
  const {
    cart: items = [],
    subTotal = 0,
    totalDiscount = 0,
    promo,
    finalShipping = 0,
    taxTotal = 0,
    cartTotal = 0,
    firstName = '',
    lastName = '',
    email = '',
    phone = '',
    altPhone = '',
    street = '',
    city = '',
    district = '',
    state = '',
    pincode = '',
    address = '',
  } = checkoutData;

  // Calculate total quantity
  const totalQty = items.reduce((sum, item) => sum + (item.qty || 0), 0);

  // Confirmation Modal (shown after successful payment/order)


  return (
    <div className="min-h-screen bg-[#fcf7f2] flex items-start justify-center py-10 px-2 md:px-10">
      {showConfirmationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl w-full relative flex flex-col items-center" id="invoice-print-section">
            {/* Rest of the modal content */}
            <h2 className="text-xl font-bold mb-2 text-center">Thank You for Confirming Your Order</h2>
            <p className="mb-4 text-center text-gray-700">
              Thank you for confirming your order with us! We've received your details and your order is now being processed. Our team is preparing your package with care to ensure it reaches you in perfect condition and on time. You’ll receive updates on your order status and tracking information shortly.
            </p>
            <p className="mb-4 text-center text-gray-700">
              If you have any questions or need assistance, our support team is here to help. We truly appreciate your trust in us and look forward to serving you again!
            </p>
            {/* <div className="mb-2 font-semibold">Order ID & Date:</div> */}
            {/* <div className="mb-4 text-center text-base text-black">{orderId} &nbsp;|&nbsp; {new Date().toLocaleDateString()}</div> */}
            <div className="flex flex-col md:flex-row gap-4 w-full justify-center">
              <button
                className="bg-black text-white px-6 py-3 rounded-lg font-semibold text-lg w-full md:w-auto mb-2 md:mb-0"
                onClick={() => {
                  // Build address HTML
                  const addressHtml = `
    <div class=\"mb-4 w-full text-sm text-gray-700 bg-[#fcf7f2] rounded-lg px-4 py-3\">
      <div class=\"font-semibold text-base mb-2\">Shipping/Billing Info</div>
      <div class=\"grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1\">
        <div><span class=\"font-medium\">Name:</span> ${checkoutData.firstName || ''} ${checkoutData.lastName || ''}</div>
        <div><span class=\"font-medium\">Email:</span> ${checkoutData.email || ''}</div>
        <div><span class=\"font-medium\">Phone:</span> ${checkoutData.phone || ''}</div>
        <div><span class=\"font-medium\">Address:</span> ${checkoutData.address || `${checkoutData.street || ''}, ${checkoutData.city || ''}, ${checkoutData.state || ''}, ${checkoutData.pincode || ''}`}</div>
        <div><span class=\"font-medium\">City:</span> ${checkoutData.city || ''}</div>
        <div><span class=\"font-medium\">State:</span> ${checkoutData.state || ''}</div>
        <div><span class=\"font-medium\">Pincode:</span> ${checkoutData.pincode || ''}</div>
      </div>
    </div>
  `;
                  // Build product table HTML
                  const productTableHtml = `
    <div class=\"mb-6 w-full overflow-x-auto\">
      <div class=\"font-semibold text-base mb-2\">Order Details</div>
      <table class=\"w-full text-xs md:text-sm border border-gray-200 rounded-lg\">
        <thead>
          <tr class=\"bg-gray-100\">
            <th class=\"p-2 border\">Image</th>
            <th class=\"p-2 border\">Name</th>
            <th class=\"p-2 border\">Qty</th>
            <th class=\"p-2 border\">Size</th>
            <th class=\"p-2 border\">Weight</th>
            <th class=\"p-2 border\">Shipping</th>
            <th class=\"p-2 border\">Price</th>
          </tr>
        </thead>
        <tbody>
          ${Array.isArray(checkoutData.cart) ? checkoutData.cart.map(item => `
            <tr>
              <td class=\"border p-1\"><img src=\"${item.image?.url || item.image || ''}\" alt=\"${item.name || ''}\" class=\"h-10 w-10 object-cover rounded\" /></td>
              <td class=\"border p-1\">${item.name || ''}</td>
              <td class=\"border p-1\">${item.qty || 1}</td>
              <td class=\"border p-1\">${item.size || '-'}</td>
              <td class=\"border p-1\">${typeof item.weight !== 'undefined' && item.weight !== null ? item.weight + 'g' : '-'}</td>
              <td class=\"border p-1\">${typeof item.shipping !== 'undefined' && item.shipping !== null ? item.shipping + 'g' : '-'}</td>
              <td class=\"border p-1\">₹${typeof item.price !== 'undefined' && item.price !== null ? Number(item.price).toFixed(2) : '-'}</td>
            </tr>
          `).join('') : ''}
        </tbody>
      </table>
      <div class=\"text-right text-base mt-2 font-semibold\">Total: ₹${checkoutData.cartTotal ? Number(checkoutData.cartTotal).toFixed(2) : '-'}</div>
    </div>
  `;
                  // Order info
                  const orderInfoHtml = `
    <div class=\"mb-2 font-semibold\">Order ID & Date:</div>
    <div class=\"mb-4 text-center text-base text-black\">${orderId || ''} &nbsp;|&nbsp; ${new Date().toLocaleDateString()}</div>
  `;
                  // Modal content (thank you message)
                  const content = document.getElementById('invoice-print-section');
                  let thankYouHtml = '';
                  if (content) {
                    // Only extract the thank you and info portion, not the commented-out address/table
                    // We'll grab the innerHTML and remove the outer div if needed
                    thankYouHtml = content.innerHTML;
                  }
                  const printWindow = window.open('', '', 'width=900,height=900');
             printWindow.document.write(`
    <html>
      <head>
        <title>Order Invoice</title>
        <style>
          body { background: #fff; font-family: Arial, sans-serif; color: #222; }
          .invoice-section { max-width: 800px; margin: 0 auto; padding: 24px; background: #fff; border-radius: 10px; }
          .invoice-section img { max-height: 56px; margin-bottom: 12px; }
          .invoice-section .info, .invoice-section .summary { margin-bottom: 18px; }
          .invoice-section table { width: 100%; border-collapse: collapse; margin: 18px 0; }
          .invoice-section th, .invoice-section td { border: 1px solid #e5e7eb; padding: 6px 8px; font-size: 14px; }
          .invoice-section th { background: #f3f4f6; }
          .invoice-section .summary { text-align: right; font-size: 16px; }
          @media print {
            body { background: #fff; }
            .invoice-section { box-shadow: none; border: none; }
          }
        </style>
      </head>
      <body>
        <div class=\"invoice-section\">
          <img src='/logo.png' alt='Rishikesh Handmade Logo' style='height:56px;object-fit:contain;margin-bottom:12px;display:flex;align-items:center;width:100%;' />
          ${addressHtml}

          ${productTableHtml}
          ${orderInfoHtml}
          ${thankYouHtml}
        </div>
      </body>
    </html>
  `);
                  printWindow.document.close();
                  printWindow.focus();
                  setTimeout(() => {
                    // printWindow.print();
                    // printWindow.close();
                  }, 500);
                }}
              >
                Get receipt (Invoice)
              </button>
              <button
                className="text-red-600 font-bold underline text-lg w-full md:w-auto"
                onClick={onGoToDashboard}
              >
                Or Go To Dashboard &gt;&gt;
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="w-full max-w-6xl flex flex-col md:flex-row gap-8">
        {/* LEFT: Billing/Shipping Summary */}
        <div className="flex-1 bg-[#fcf7f2] p-0">
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-2">Checkout: <span className="font-normal">Quick Overview</span></h2>
            <hr className="my-4 border-gray-300" />
          </div>

          {/* Basic Billing Information */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-base text-[#8b6f63]">Basic Billing Information</span>
              <span className="text-teal-600 flex items-center gap-1 text-sm">✓</span>
              <button className="ml-1 text-sm text-black underline hover:text-orange-500" onClick={onEdit}>Edit</button>
            </div>
            <table className="w-full text-sm">
              <tbody>
                <tr><td className="py-1 w-32 text-gray-700">Name</td><td>{firstName} {lastName}</td></tr>
                <tr><td className="py-1 text-gray-700">Email</td><td>{email}</td></tr>
                <tr><td className="py-1 text-gray-700">Call No.</td><td>{phone}</td></tr>
                <tr><td className="py-1 text-gray-700">Alt. Call No.</td><td>{altPhone}</td></tr>
              </tbody>
            </table>
          </div>

          {/* Shipping Address */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-base text-[#8b6f63]">Shipping Address</span>
              <span className="text-teal-600 flex items-center gap-1 text-sm">✓</span>
              <button className="ml-1 text-sm text-black underline hover:text-orange-500" onClick={onEdit}>Edit</button>
            </div>
            <div className="pl-1 text-gray-800 text-sm">{address || `${street}, ${city}, ${district}, ${state} ${pincode}`}</div>
          </div>

          {/* Shipping Availability */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-base text-[#8b6f63]">Shipping Availability</span>
              <span className="text-teal-600 flex items-center gap-1 text-sm">✓</span>
              <button className="ml-1 text-sm text-black underline hover:text-orange-500" onClick={onEdit}>Edit</button>
            </div>
            <table className="w-full text-sm">
              <tbody>
                <tr><td className="py-1 w-32 text-gray-700">State</td><td>{state}</td></tr>
                <tr><td className="py-1 text-gray-700">Dist.</td><td>{district}</td></tr>
                <tr><td className="py-1 text-gray-700">Available Pin Code</td><td>{pincode}</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT: Order Summary Card */}
        <div className="w-full md:w-[390px] flex-shrink-0">
          <div className="bg-white rounded-lg shadow-lg p-6 sticky top-10">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-lg">Order Summary</h3>
              <span className="text-sm text-gray-600">{items.length} Item{items.length !== 1 ? 's' : ''}</span>
              <span className="text-sm text-gray-600">Qty {totalQty}</span>
              <button className="text-black underline text-sm ml-2" onClick={onEdit}>Edit Order</button>
            </div>
            <hr className="mb-4" />
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>₹{subTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="underline cursor-pointer">GST and Fees</span>
                <span>₹{taxTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-semibold mt-3">
                <span>Total (INR)</span>
                <span className="text-green-700 text-lg">₹{cartTotal.toFixed(2)}</span>
              </div>
              {totalDiscount > 0 && (
                <div className="text-green-700 text-xs mt-2">Nice! You saved ₹{totalDiscount.toFixed(2)} on your order.</div>
              )}
            </div>
            <button
              className="w-full py-3 bg-black text-white rounded font-semibold text-base mt-2 mb-4 flex items-center justify-center gap-2 hover:bg-gray-900 transition-colors"
              
              onClick={()=>{
                // console.log('Overview confirm button clicked');
                onConfirm();
              }}
              disabled={loading}
            >
              {loading ? 'Processing...' : (
                <>
                  Make Confirm Order
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </>
              )}
            </button>
            {error && <div className="text-red-600 text-xs text-center mb-2">{error}</div>}
            <div className="text-xs text-gray-600 mt-2">
              Thank you for choosing to shop with us!<br />
              To complete your purchase, please confirm your order by selecting a payment method below. You can choose <span className="underline">Cash on Delivery (COD)</span> for a safe and convenient payment at your doorstep, or opt for <span className="underline">Online Payment</span> for faster processing and instant confirmation.<br /><br />
              Once your payment option is selected, we will begin preparing your order for dispatch. Your satisfaction is our priority – shop confidently with us!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckOutOverview;
