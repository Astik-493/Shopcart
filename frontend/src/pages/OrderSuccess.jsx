import React, { useEffect, useState } from 'react'
import { useParams, Link, useLocation } from 'react-router-dom'
import { axiosInstance } from '../axiosCalls/axios'
import Navbar from '../components/Navbar'

const getOrderStatusInfo = (status) => {
  if (!status) return { label: 'Pending', className: 'bg-amber-50 text-amber-700 border-amber-200' }
  const upper = String(status).toUpperCase()
  switch (upper) {
    case 'PLACED':
      return { label: 'Placed', className: 'bg-blue-50 text-blue-700 border-blue-200' }
    case 'CONFIRMED':
      return { label: 'Confirmed', className: 'bg-indigo-50 text-indigo-700 border-indigo-200' }
    case 'SHIPPED':
      return { label: 'Shipped', className: 'bg-purple-50 text-purple-700 border-purple-200' }
    case 'DELIVERED':
      return { label: 'Delivered', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
    case 'PENDING_PAYMENT':
    case 'PENDING':
      return { label: 'Pending Payment', className: 'bg-amber-50 text-amber-700 border-amber-200' }
    case 'CANCELLED':
      return { label: 'Cancelled', className: 'bg-rose-50 text-rose-700 border-rose-200' }
    default:
      return { label: status, className: 'bg-gray-50 text-gray-700 border-gray-200' }
  }
}

const getPaymentStatusInfo = (paymentStatus) => {
  if (!paymentStatus) return null
  const upper = String(paymentStatus).toUpperCase()
  switch (upper) {
    case 'PAID':
      return { label: 'Paid', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
    case 'PENDING':
      return { label: 'Pending', className: 'bg-amber-50 text-amber-700 border-amber-200' }
    case 'FAILED':
      return { label: 'Failed', className: 'bg-rose-50 text-rose-700 border-rose-200' }
    default:
      return { label: paymentStatus, className: 'bg-gray-50 text-gray-700 border-gray-200' }
  }
}

function OrderSuccess() {
  const { id } = useParams()
  const location = useLocation()

  // Use passed order from navigation state if available, otherwise fetch from API
  const [order, setOrder] = useState(location.state?.order || null)
  const [loading, setLoading] = useState(!location.state?.order)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!order && id) {
      const fetchOrder = async () => {
        setLoading(true)
        setError('')
        try {
          const response = await axiosInstance.get(`orders/${id}`)
          if (response.data?.order) {
            setOrder(response.data.order)
          } else {
            setError('Order details not found')
          }
        } catch (err) {
          setError(
            err.response?.data?.message || 'Failed to fetch order details. Please check the order ID.'
          )
        } finally {
          setLoading(false)
        }
      }

      fetchOrder()
    }
  }, [id, order])

  const orderStatusInfo = getOrderStatusInfo(order?.status || order?.orderStatus)
  const paymentStatusInfo = getPaymentStatusInfo(order?.paymentStatus)

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 flex flex-col antialiased font-sans">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8">
        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-3xl border border-gray-200/80 p-12 text-center shadow-sm min-h-[350px] flex items-center justify-center">
            <div>
              <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-base font-semibold text-gray-800">Fetching order confirmation...</p>
              <p className="text-xs text-gray-500 mt-1">Please wait while we verify your order.</p>
            </div>
          </div>
        )}

        {/* Error / Invalid Order ID State */}
        {!loading && error && (
          <div className="bg-white rounded-3xl border border-rose-200 p-10 sm:p-12 text-center shadow-sm space-y-4">
            <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto text-2xl">
              ⚠️
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Order Not Found</h1>
              <p className="text-sm text-rose-600 mt-1 max-w-md mx-auto">{error}</p>
            </div>
            <div className="pt-2 flex justify-center gap-3">
              <Link
                to="/products"
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl transition shadow-sm active:scale-95 cursor-pointer"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        )}

        {/* Success Confirmation State */}
        {!loading && !error && order && (
          <div className="space-y-6">
            
            {/* Celebration Header Card */}
            <div className="bg-white rounded-3xl border border-gray-200/80 p-8 sm:p-10 text-center shadow-sm space-y-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm animate-in zoom-in-50 duration-300">
                <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mb-1">
                  <span>●</span>
                  <span>Order Placed Successfully</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                  Thank You for Your Order!
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto">
                  Your order has been saved successfully in our system and is now being processed.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  to="/orders"
                  className="w-full sm:w-auto px-6 py-3 bg-slate-900 hover:bg-black text-white font-semibold text-xs rounded-xl transition shadow-sm flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <span>View My Orders</span>
                </Link>

                <Link
                  to="/products"
                  className="w-full sm:w-auto px-6 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs rounded-xl transition shadow-2xs flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                >
                  <span>Continue Shopping</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Order Meta & Breakdown Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Order Key Details */}
              <div className="bg-white rounded-3xl border border-gray-200/80 p-6 shadow-sm space-y-4">
                <h2 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-3">
                  Order Details
                </h2>
                
                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-gray-400 block text-[11px] font-medium uppercase">Order ID</span>
                    <span className="font-mono font-bold text-gray-800 break-all text-xs">
                      #{order._id}
                    </span>
                  </div>

                  <div>
                    <span className="text-gray-400 block text-[11px] font-medium uppercase">Order Status</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border mt-1 ${orderStatusInfo.className}`}>
                      {orderStatusInfo.label}
                    </span>
                  </div>

                  {paymentStatusInfo && (
                    <div>
                      <span className="text-gray-400 block text-[11px] font-medium uppercase">Payment Status</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border mt-1 ${paymentStatusInfo.className}`}>
                        {paymentStatusInfo.label}
                      </span>
                    </div>
                  )}

                  <div>
                    <span className="text-gray-400 block text-[11px] font-medium uppercase">Date Placed</span>
                    <span className="font-semibold text-gray-700">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : 'Just now'}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-gray-100">
                    <span className="text-gray-400 block text-[11px] font-medium uppercase">Total Amount</span>
                    <span className="text-xl font-extrabold text-gray-900">
                      ₹{Number(order.totalAmount || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Shipping Address Summary */}
              <div className="bg-white rounded-3xl border border-gray-200/80 p-6 shadow-sm space-y-4">
                <h2 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Shipping Address</span>
                </h2>

                <div className="text-xs text-gray-600 space-y-1.5">
                  <p className="font-bold text-gray-900 text-sm">
                    {order.shippingAddress?.fullName || 'Customer'}
                  </p>
                  <p className="text-gray-500">
                    📱 {order.shippingAddress?.phone}
                  </p>
                  <p className="pt-1 leading-relaxed">
                    {order.shippingAddress?.address || order.shippingAddress?.addressLine1}
                  </p>
                  <p className="text-gray-700 font-medium">
                    {order.shippingAddress?.city}, {order.shippingAddress?.state} — {order.shippingAddress?.pincode}
                  </p>
                </div>
              </div>

              {/* Ordered Items List */}
              <div className="bg-white rounded-3xl border border-gray-200/80 p-6 shadow-sm space-y-4">
                <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
                  <h2 className="text-sm font-bold text-gray-900">
                    Items ({order.items?.length || 0})
                  </h2>
                </div>

                <div className="space-y-3 max-h-56 overflow-y-auto pr-1 divide-y divide-gray-50 text-xs">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="pt-2.5 first:pt-0 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-9 h-9 rounded-lg object-cover bg-gray-100 shrink-0 border border-gray-100"
                            onError={(e) => {
                              e.target.onerror = null
                              e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop'
                            }}
                          />
                        )}
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-800 truncate" title={item.name}>
                            {item.name}
                          </p>
                          <p className="text-gray-400 text-[11px]">
                            Qty: {item.quantity} × ₹{Number(item.price).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-gray-900 shrink-0">
                        ₹{(Number(item.price) * Number(item.quantity)).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-gray-200 mt-16 py-8">
        <div className="max-w-4xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
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

export default OrderSuccess
