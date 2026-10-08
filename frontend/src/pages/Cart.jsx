import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { axiosInstance } from '../axiosCalls/axios'
import { useAuth } from '../context/AuthContext'
import { useWishlist } from '../context/WishlistContext'
import { useCart } from '../context/CartContext'
import Navbar from '../components/Navbar'

function Cart() {
  const navigate = useNavigate()
  const { user: authUser, logout } = useAuth()
  const { wishlistCount } = useWishlist()
  const {
    cartItems,
    cartLoading,
    cartError,
    removeFromCart,
    updateQuantity,
    refreshCart
  } = useCart()

  const [customer, setCustomer] = useState(authUser || null)
  const [actionLoadingId, setActionLoadingId] = useState(null)
  const [actionError, setActionError] = useState('')

  // Derived Values: Dynamically calculated on each render from cartItems
  const totalUnits = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0)
  const subtotal = cartItems.reduce((acc, item) => {
    const price = Number(item.product?.price) || 0
    const qty = item.quantity || 1
    return acc + price * qty
  }, 0)

  // Fetch logged in customer profile if not in context
  useEffect(() => {
    if (!customer) {
      const fetchCustomerProfile = async () => {
        try {
          const response = await axiosInstance.get('api/customers/me')
          setCustomer(response.data)
        } catch (err) {
          // Handled by route guard
        }
      }
      fetchCustomerProfile()
    }
  }, [customer])

  const handleLogout = async () => {
    try {
      await logout()
    } catch (err) {
      console.error(err)
    } finally {
      navigate('/login')
    }
  }

  // Handle quantity decrement / increment
  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) return

    setActionLoadingId(productId)
    setActionError('')

    try {
      await updateQuantity(productId, newQuantity)
    } catch (err) {
      console.error('Update quantity error:', err)
      const message =
        err.response?.data?.message || err.message || 'Failed to update item quantity.'
      setActionError(message)
    } finally {
      setActionLoadingId(null)
    }
  }

  // Handle item removal
  const handleRemoveItem = async (productId) => {
    setActionLoadingId(productId)
    setActionError('')

    try {
      await removeFromCart(productId)
    } catch (err) {
      console.error('Remove item error:', err)
      const message =
        err.response?.data?.message || err.message || 'Failed to remove item from cart.'
      setActionError(message)
    } finally {
      setActionLoadingId(null)
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
              <span>Shopping Cart</span>
              <span>•</span>
              <span>{totalUnits} {totalUnits === 1 ? 'Item' : 'Items'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              Your Shopping Cart
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Review your selected items before proceeding to checkout.
            </p>
          </div>

          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2.5 rounded-xl transition self-start sm:self-auto"
          >
            <span>&larr; Continue Shopping</span>
          </Link>
        </div>

        {/* Global Action Error Alert if any */}
        {actionError && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-2xl text-xs font-medium flex items-center justify-between shadow-sm">
            <span>⚠️ {actionError}</span>
            <button
              onClick={() => setActionError('')}
              className="text-rose-500 hover:text-rose-700 font-bold ml-3"
            >
              ✕
            </button>
          </div>
        )}

        {/* UI STATE 1: LOADING */}
        {cartLoading && cartItems.length === 0 && (
          <div className="min-h-[350px] flex items-center justify-center bg-white rounded-3xl border border-gray-200/80 p-12 shadow-sm">
            <div className="text-center">
              <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-base font-semibold text-gray-800">Loading your cart...</p>
              <p className="text-xs text-gray-500 mt-1">Fetching your saved items...</p>
            </div>
          </div>
        )}

        {/* UI STATE 2: ERROR */}
        {!cartLoading && cartError && cartItems.length === 0 && (
          <div className="bg-rose-50 border border-rose-200 rounded-3xl p-10 text-center shadow-sm space-y-4">
            <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-rose-900">Unable to load your cart.</h2>
              <p className="text-xs text-rose-600 max-w-md mx-auto mt-1">{cartError}</p>
            </div>
            <button
              onClick={() => refreshCart()}
              className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl transition shadow-sm cursor-pointer active:scale-95"
            >
              Try Again
            </button>
          </div>
        )}

        {/* UI STATE 3: EMPTY */}
        {!cartLoading && !cartError && cartItems.length === 0 && (
          <div className="bg-white rounded-3xl border border-gray-200/80 p-12 sm:p-16 text-center shadow-sm space-y-4">
            <div className="w-20 h-20 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mx-auto text-3xl shadow-inner">
              🛒
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Your cart is empty 🛒</h2>
              <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
                Looks like you haven't added anything yet.
              </p>
            </div>
            <Link
              to="/products"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl transition shadow-md shadow-blue-500/20 active:scale-95 cursor-pointer"
            >
              <span>Browse Products</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        )}

        {/* UI STATE 4: SUCCESS (Cart Items + Order Summary) */}
        {cartItems.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Cart Items List */}
            <div className="lg:col-span-8 space-y-4">
              <div className="bg-white rounded-3xl border border-gray-200/80 shadow-sm overflow-hidden divide-y divide-gray-100">
                {cartItems.map((item) => {
                  const product = item.product || {}
                  const productId = product._id || item.product
                  const itemPrice = Number(product.price) || 0
                  const itemQuantity = item.quantity || 1
                  const itemSubtotal = itemPrice * itemQuantity
                  const isItemBusy = actionLoadingId === productId

                  return (
                    <div
                      key={item._id || productId}
                      className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition"
                    >
                      {/* Product Image & Meta */}
                      <div className="flex items-center gap-4 w-full sm:w-auto">
                        <Link
                          to={`/products/${productId}`}
                          className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gray-100 overflow-hidden shrink-0 border border-gray-200/60 group block"
                        >
                          <img
                            src={product.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop'}
                            alt={product.name || 'Product'}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                            onError={(e) => {
                              e.target.onerror = null
                              e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop'
                            }}
                          />
                        </Link>

                        <div className="space-y-1 flex-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md inline-block">
                            {product.category || 'Product'}
                          </span>
                          <Link
                            to={`/products/${productId}`}
                            className="text-sm sm:text-base font-bold text-gray-900 hover:text-blue-600 transition line-clamp-1 block"
                            title={product.name}
                          >
                            {product.name || 'Product'}
                          </Link>
                          <div className="flex items-baseline gap-2">
                            <span className="text-xs text-gray-400">Unit Price:</span>
                            <span className="text-xs font-semibold text-gray-700">
                              ₹{itemPrice.toLocaleString()}
                            </span>
                          </div>
                          {typeof product.stock === 'number' && (
                            <p className="text-[11px] text-gray-400">
                              Available stock: <span className="font-semibold text-gray-600">{product.stock}</span>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Quantity Controls, Item Subtotal & Remove Button */}
                      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                        
                        {/* Quantity Controls [-] Qty [+] */}
                        <div className="flex items-center border border-gray-200 rounded-xl bg-white shadow-sm p-1">
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(productId, itemQuantity - 1)}
                            disabled={isItemBusy || itemQuantity <= 1}
                            className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold transition ${
                              itemQuantity <= 1 || isItemBusy
                                ? 'text-gray-300 cursor-not-allowed bg-gray-50'
                                : 'text-gray-700 hover:bg-slate-100 cursor-pointer active:scale-90'
                            }`}
                            title={itemQuantity <= 1 ? 'Minimum quantity is 1' : 'Decrease quantity'}
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>
                          
                          <span className="w-8 text-center text-xs font-bold text-gray-900">
                            {isItemBusy ? (
                              <span className="inline-block animate-pulse">…</span>
                            ) : (
                              itemQuantity
                            )}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleQuantityChange(productId, itemQuantity + 1)}
                            disabled={isItemBusy || (typeof product.stock === 'number' && itemQuantity >= product.stock)}
                            className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold transition ${
                              isItemBusy || (typeof product.stock === 'number' && itemQuantity >= product.stock)
                                ? 'text-gray-300 cursor-not-allowed bg-gray-50'
                                : 'text-gray-700 hover:bg-slate-100 cursor-pointer active:scale-90'
                            }`}
                            title={
                              typeof product.stock === 'number' && itemQuantity >= product.stock
                                ? 'Maximum available stock reached'
                                : 'Increase quantity'
                            }
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>

                        {/* Item Subtotal Calculation */}
                        <div className="text-right min-w-[90px]">
                          <span className="text-[10px] text-gray-400 block uppercase font-medium">Subtotal</span>
                          <span className="text-sm font-extrabold text-gray-900">
                            ₹{itemSubtotal.toLocaleString()}
                          </span>
                        </div>

                        {/* Remove Action Button */}
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(productId)}
                          disabled={isItemBusy}
                          className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer active:scale-95"
                          title="Remove item from cart"
                          aria-label="Remove item"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>

                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Right Column: Order Summary */}
            <div className="lg:col-span-4 sticky top-28 space-y-4">
              <div className="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-7 shadow-sm space-y-5">
                <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">
                  Order Summary
                </h2>

                <div className="space-y-3 text-xs text-gray-600">
                  <div className="flex items-center justify-between">
                    <span>Items:</span>
                    <span className="font-bold text-gray-900">{totalUnits}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Subtotal:</span>
                    <span className="font-bold text-gray-900">₹{subtotal.toLocaleString()}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Shipping:</span>
                    <span className="font-semibold text-emerald-600">FREE</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Taxes:</span>
                    <span className="font-semibold text-gray-500">Calculated at checkout</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-baseline justify-between">
                  <div>
                    <span className="text-xs font-semibold text-gray-500">Total Amount</span>
                    <p className="text-2xl font-extrabold text-gray-900">
                      ₹{subtotal.toLocaleString()}
                    </p>
                  </div>
                  <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                    Free Delivery
                  </span>
                </div>

                {/* Proceed to Checkout Button */}
                <button
                  type="button"
                  onClick={() => navigate('/checkout')}
                  className="w-full py-3.5 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-xs rounded-xl transition duration-150 shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                >
                  <span>Proceed to Checkout</span>
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

          </div>
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

export default Cart
