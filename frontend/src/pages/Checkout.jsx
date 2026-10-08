import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import Navbar from '../components/Navbar'

function Checkout() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { cartItems, cartLoading } = useCart()

  const [shippingDetails, setShippingDetails] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  })

  const [submitted, setSubmitted] = useState(false)

  // Handle form field change
  const handleChange = (e) => {
    const { name, value } = e.target
    setShippingDetails((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  // Calculate cart totals dynamically from cart items
  const totalUnits = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0)
  const totalAmount = cartItems.reduce((acc, item) => {
    const price = Number(item.product?.price) || 0
    const qty = item.quantity || 1
    return acc + price * qty
  }, 0)

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
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

        {/* Loading State */}
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
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
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
                        required
                        placeholder="John Doe"
                        value={shippingDetails.fullName}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-slate-50/70 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition"
                      />
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Phone <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        required
                        placeholder="+91 9876543210"
                        value={shippingDetails.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-slate-50/70 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition"
                      />
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <label htmlFor="address" className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Address <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      id="address"
                      name="address"
                      required
                      rows={3}
                      placeholder="Street address, Apartment, Suite, Landmark..."
                      value={shippingDetails.address}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-slate-50/70 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition resize-none"
                    />
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
                        required
                        placeholder="Mumbai"
                        value={shippingDetails.city}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-slate-50/70 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition"
                      />
                    </div>

                    <div>
                      <label htmlFor="state" className="block text-xs font-semibold text-gray-700 mb-1.5">
                        State <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="state"
                        name="state"
                        required
                        placeholder="Maharashtra"
                        value={shippingDetails.state}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-slate-50/70 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition"
                      />
                    </div>

                    <div>
                      <label htmlFor="pincode" className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Pincode <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="pincode"
                        name="pincode"
                        required
                        placeholder="400001"
                        value={shippingDetails.pincode}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-slate-50/70 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition"
                      />
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
                  className="w-full py-3.5 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-xs rounded-xl transition duration-150 shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                >
                  <span>Place Order</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
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
