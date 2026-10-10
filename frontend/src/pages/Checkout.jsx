import React, { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { axiosInstance } from '../axiosCalls/axios'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import Navbar from '../components/Navbar'

// Helper to dynamically load the Razorpay checkout script
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true)
      return
    }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

function Checkout() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { cartItems, cartLoading, refreshCart } = useCart()

  const [shippingDetails, setShippingDetails] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  })

  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')
  const verifyingRef = useRef(false)

  // Handle form field change and clear field-level error
  const handleChange = (e) => {
    const { name, value } = e.target
    setShippingDetails((prev) => ({
      ...prev,
      [name]: value
    }))
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: ''
      }))
    }
    if (serverError) setServerError('')
  }

  // Calculate cart totals dynamically from cart items
  const totalUnits = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0)
  const totalAmount = cartItems.reduce((acc, item) => {
    const price = Number(item.product?.price) || 0
    const qty = item.quantity || 1
    return acc + price * qty
  }, 0)

  // Validate form fields
  const validateForm = () => {
    const newErrors = {}

    const trimmedFullName = shippingDetails.fullName.trim()
    const trimmedPhone = shippingDetails.phone.trim()
    const trimmedAddress = shippingDetails.address.trim()
    const trimmedCity = shippingDetails.city.trim()
    const trimmedState = shippingDetails.state.trim()
    const trimmedPincode = shippingDetails.pincode.trim()

    // Full Name
    if (!trimmedFullName) {
      newErrors.fullName = 'Full Name is required.'
    }

    // Phone
    if (!trimmedPhone) {
      newErrors.phone = 'Phone Number is required.'
    } else {
      const digitsOnly = trimmedPhone.replace(/\D/g, '')
      const isValidPhoneFormat = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/.test(trimmedPhone)
      if (!isValidPhoneFormat || digitsOnly.length < 10 || digitsOnly.length > 15) {
        newErrors.phone = 'Please enter a valid phone number (at least 10 digits).'
      }
    }

    // Address
    if (!trimmedAddress) {
      newErrors.address = 'Address Line is required.'
    }

    // City
    if (!trimmedCity) {
      newErrors.city = 'City is required.'
    }

    // State
    if (!trimmedState) {
      newErrors.state = 'State is required.'
    }

    // Pincode
    if (!trimmedPincode) {
      newErrors.pincode = 'Pincode is required.'
    } else if (!/^\d{6}$/.test(trimmedPincode)) {
      newErrors.pincode = 'Pincode must contain 6 digits.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setServerError('')
    verifyingRef.current = false

    const isValid = validateForm()
    if (!isValid) {
      // Prevent submission if client-side validation fails
      return
    }

    setSubmitting(true)
    try {
      // 1. Dynamically load Razorpay SDK
      const isLoaded = await loadRazorpayScript()
      if (!isLoaded || !window.Razorpay) {
        setServerError('Unable to load Razorpay payment SDK. Please check your internet connection and try again.')
        setSubmitting(false)
        return
      }

      // 2. Call backend order creation endpoint with validated shipping address
      const response = await axiosInstance.post('orders/create-payment-order', {
        shippingAddress: {
          fullName: shippingDetails.fullName.trim(),
          phone: shippingDetails.phone.trim(),
          address: shippingDetails.address.trim(),
          city: shippingDetails.city.trim(),
          state: shippingDetails.state.trim(),
          pincode: shippingDetails.pincode.trim()
        }
      })

      const { shopKartOrderId, razorpayOrderId, amount, currency, key } = response.data || {}

      if (!key || !razorpayOrderId || !amount) {
        setServerError('Payment order creation failed. Missing payment initialization details.')
        setSubmitting(false)
        return
      }

      // 3. Configure Razorpay Standard Checkout options
      const options = {
        key: key,
        amount: amount,
        currency: currency || 'INR',
        name: 'Shopkart',
        description: `Order #${shopKartOrderId || razorpayOrderId} - Shopkart Purchase`,
        order_id: razorpayOrderId,
        prefill: {
          name: shippingDetails.fullName.trim() || user?.fullName || '',
          email: user?.email || '',
          contact: shippingDetails.phone.trim() || user?.phone || ''
        },
        theme: {
          color: '#2563eb'
        },
        handler: async function (razorpayResponse) {
          // Collect Razorpay payment identifiers
          const paymentResult = {
            shopKartOrderId: shopKartOrderId,
            razorpay_order_id: razorpayResponse.razorpay_order_id,
            razorpay_payment_id: razorpayResponse.razorpay_payment_id,
            razorpay_signature: razorpayResponse.razorpay_signature
          }

          // Prevent duplicate verification requests
          if (verifyingRef.current) return
          verifyingRef.current = true
          setSubmitting(true)
          setServerError('')

          try {
            // Send verification request to backend
            const verifyRes = await axiosInstance.post('api/orders/verify-payment', paymentResult)

            if (verifyRes.data?.success) {
              // Refresh cart from backend to sync cleared cart state
              await refreshCart()

              // Navigate to dedicated Order Success confirmation page
              navigate(`/order-success/${shopKartOrderId}`, {
                state: { order: verifyRes.data.order }
              })
            } else {
              setServerError(verifyRes.data?.message || 'Payment verification failed.')
              verifyingRef.current = false
              setSubmitting(false)
            }
          } catch (verifyErr) {
            console.error('Payment verification error:', verifyErr)
            const errorMsg =
              verifyErr.response?.data?.message ||
              verifyErr.message ||
              'Payment verification failed. Please contact support.'
            setServerError(errorMsg)
            verifyingRef.current = false
            setSubmitting(false)
          }
        },
        modal: {
          ondismiss: function () {
            if (!verifyingRef.current) {
              setSubmitting(false)
            }
          }
        }
      }

      const rzp = new window.Razorpay(options)

      rzp.on('payment.failed', function (paymentError) {
        console.error('Razorpay payment failed:', paymentError.error)
        const failureMessage =
          paymentError.error?.description || paymentError.error?.reason || 'Payment failed or was cancelled.'
        setServerError(`Payment Failed: ${failureMessage}`)
        verifyingRef.current = false
        setSubmitting(false)
      })

      rzp.open()
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || 'Failed to place order. Please try again.'
      setServerError(message)
      verifyingRef.current = false
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 flex flex-col antialiased font-sans">
      {/* Navigation Header */}
      <Navbar />

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        
        {/* Page Heading Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2">
              <span>Checkout</span>
              <span>•</span>
              <span>{totalUnits} {totalUnits === 1 ? 'Item' : 'Items'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              Checkout
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Provide your delivery address and review your order summary before placing your order.
            </p>
          </div>

          <Link
            to="/cart"
            className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2.5 rounded-xl transition self-start sm:self-auto"
          >
            <span>&larr; Back to Cart</span>
          </Link>
        </div>

        {/* Global Server Error Alert if any */}
        {serverError && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-2xl text-xs font-medium flex items-center justify-between shadow-sm animate-in fade-in duration-200">
            <span>⚠️ {serverError}</span>
            <button
              type="button"
              onClick={() => setServerError('')}
              className="text-rose-500 hover:text-rose-700 font-bold ml-3 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}
        {cartLoading && cartItems.length === 0 && (
          <div className="min-h-[350px] flex items-center justify-center bg-white rounded-3xl border border-gray-200/80 p-12 shadow-sm">
            <div className="text-center">
              <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-base font-semibold text-gray-800">Loading checkout details...</p>
            </div>
          </div>
        )}

        {/* Empty Cart State */}
        {!cartLoading && cartItems.length === 0 && (
          <div className="bg-white rounded-3xl border border-gray-200/80 p-12 sm:p-16 text-center shadow-sm space-y-4">
            <div className="w-20 h-20 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mx-auto text-3xl shadow-inner">
              🛒
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Your cart is empty</h2>
              <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
                Add items to your cart before proceeding to checkout.
              </p>
            </div>
            <Link
              to="/products"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl transition shadow-md shadow-blue-500/20 active:scale-95 cursor-pointer"
            >
              <span>Browse Products</span>
            </Link>
          </div>
        )}

        {/* Checkout Main Form & Order Summary */}
        {cartItems.length > 0 && (
          <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Shipping Details */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-8 shadow-sm space-y-6">
                <div className="border-b border-gray-100 pb-4">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Shipping Details</span>
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Where should we deliver your order?
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Full Name & Phone Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="fullName" className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Full Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        placeholder="John Doe"
                        value={shippingDetails.fullName}
                        onChange={handleChange}
                        className={`w-full px-4 py-2.5 border rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none transition ${
                          errors.fullName
                            ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500 focus:ring-4 focus:ring-rose-100'
                            : 'border-gray-200 bg-slate-50/70 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100'
                        }`}
                      />
                      {errors.fullName && (
                        <p className="text-rose-500 text-xs mt-1.5 flex items-center gap-1">
                          <span>⚠️</span> {errors.fullName}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Phone Number <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        placeholder="+91 9876543210"
                        value={shippingDetails.phone}
                        onChange={handleChange}
                        className={`w-full px-4 py-2.5 border rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none transition ${
                          errors.phone
                            ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500 focus:ring-4 focus:ring-rose-100'
                            : 'border-gray-200 bg-slate-50/70 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100'
                        }`}
                      />
                      {errors.phone && (
                        <p className="text-rose-500 text-xs mt-1.5 flex items-center gap-1">
                          <span>⚠️</span> {errors.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Address Line */}
                  <div>
                    <label htmlFor="address" className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Address Line <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      id="address"
                      name="address"
                      rows={3}
                      placeholder="Street address, Apartment, Suite, Landmark..."
                      value={shippingDetails.address}
                      onChange={handleChange}
                      className={`w-full px-4 py-2.5 border rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none transition resize-none ${
                        errors.address
                          ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500 focus:ring-4 focus:ring-rose-100'
                          : 'border-gray-200 bg-slate-50/70 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100'
                      }`}
                    />
                    {errors.address && (
                      <p className="text-rose-500 text-xs mt-1.5 flex items-center gap-1">
                        <span>⚠️</span> {errors.address}
                      </p>
                    )}
                  </div>

                  {/* City, State & Pincode Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="city" className="block text-xs font-semibold text-gray-700 mb-1.5">
                        City <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        placeholder="Mumbai"
                        value={shippingDetails.city}
                        onChange={handleChange}
                        className={`w-full px-4 py-2.5 border rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none transition ${
                          errors.city
                            ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500 focus:ring-4 focus:ring-rose-100'
                            : 'border-gray-200 bg-slate-50/70 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100'
                        }`}
                      />
                      {errors.city && (
                        <p className="text-rose-500 text-xs mt-1.5 flex items-center gap-1">
                          <span>⚠️</span> {errors.city}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="state" className="block text-xs font-semibold text-gray-700 mb-1.5">
                        State <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="state"
                        name="state"
                        placeholder="Maharashtra"
                        value={shippingDetails.state}
                        onChange={handleChange}
                        className={`w-full px-4 py-2.5 border rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none transition ${
                          errors.state
                            ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500 focus:ring-4 focus:ring-rose-100'
                            : 'border-gray-200 bg-slate-50/70 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100'
                        }`}
                      />
                      {errors.state && (
                        <p className="text-rose-500 text-xs mt-1.5 flex items-center gap-1">
                          <span>⚠️</span> {errors.state}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="pincode" className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Pincode <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="pincode"
                        name="pincode"
                        placeholder="400001"
                        value={shippingDetails.pincode}
                        onChange={handleChange}
                        className={`w-full px-4 py-2.5 border rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none transition ${
                          errors.pincode
                            ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500 focus:ring-4 focus:ring-rose-100'
                            : 'border-gray-200 bg-slate-50/70 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100'
                        }`}
                      />
                      {errors.pincode && (
                        <p className="text-rose-500 text-xs mt-1.5 flex items-center gap-1">
                          <span>⚠️</span> {errors.pincode}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary */}
            <div className="lg:col-span-5 sticky top-28 space-y-4">
              <div className="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-7 shadow-sm space-y-5">
                <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-900">
                    Order Summary
                  </h2>
                  <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                    {totalUnits} {totalUnits === 1 ? 'item' : 'items'}
                  </span>
                </div>

                {/* Dynamically list items */}
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1 divide-y divide-gray-50">
                  {cartItems.map((item) => {
                    const product = item.product || {}
                    const productId = product._id || item.product
                    const itemPrice = Number(product.price) || 0
                    const itemQty = item.quantity || 1
                    const itemSubtotal = itemPrice * itemQty

                    return (
                      <div
                        key={item._id || productId}
                        className="pt-3 first:pt-0 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {product.image && (
                            <img
                              src={product.image}
                              alt={product.name || 'Product'}
                              className="w-10 h-10 rounded-lg object-cover bg-gray-100 shrink-0 border border-gray-100"
                              onError={(e) => {
                                e.target.onerror = null
                                e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop'
                              }}
                            />
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-800 truncate" title={product.name}>
                              {product.name || 'Product'}
                            </p>
                            <p className="text-gray-400 text-[11px]">
                              Qty: {itemQty} × ₹{itemPrice.toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <p className="font-bold text-gray-900">
                            ₹{itemSubtotal.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Totals Breakdown */}
                <div className="pt-3 border-t border-gray-100 space-y-2.5 text-xs text-gray-600">
                  <div className="flex items-center justify-between">
                    <span>Items Subtotal:</span>
                    <span className="font-bold text-gray-900">₹{totalAmount.toLocaleString()}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Shipping:</span>
                    <span className="font-semibold text-emerald-600">FREE</span>
                  </div>
                </div>

                {/* Total Amount */}
                <div className="pt-4 border-t border-gray-100 flex items-baseline justify-between">
                  <div>
                    <span className="text-xs font-semibold text-gray-500">Total Amount</span>
                    <p className="text-2xl font-extrabold text-gray-900">
                      ₹{totalAmount.toLocaleString()}
                    </p>
                  </div>
                  <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                    Free Delivery
                  </span>
                </div>

                {/* Place Order Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-xs rounded-xl transition duration-150 shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer active:scale-[0.99]"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Placing Order...</span>
                    </>
                  ) : (
                    <>
                      <span>Place Order</span>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </>
                  )}
                </button>

                <p className="text-[11px] text-gray-400 text-center flex items-center justify-center gap-1.5 pt-1">
                  <svg className="w-3.5 h-3.5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Safe and Secure 256-Bit SSL Checkout</span>
                </p>
              </div>
            </div>

          </form>
        )}

      </main>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-gray-200 mt-16 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <p className="font-serif text-sm font-semibold text-gray-800">
            Shopkart
          </p>
          <p>© {new Date().getFullYear()} Shopkart Inc. All rights reserved.</p>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-gray-600">Privacy Policy</a>
            <a href="#" className="hover:text-gray-600">Terms of Service</a>
            <a href="#" className="hover:text-gray-600">Support</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Checkout
