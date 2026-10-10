import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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

function Orders() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchOrders = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await axiosInstance.get('api/orders')
      if (response.data && Array.isArray(response.data.orders)) {
        setOrders(response.data.orders)
      } else {
        setOrders([])
      }
    } catch (err) {
      console.error('Fetch orders error:', err)
      setError(
        err.response?.data?.message || 'Failed to load your orders. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 flex flex-col antialiased font-sans">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full min-w-0 space-y-6">
        
        {/* Page Heading Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2">
              <span>Order History</span>
              <span>•</span>
              <span>{orders.length} {orders.length === 1 ? 'Order' : 'Orders'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              My Orders
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Track, review, and view details for all your placed orders.
            </p>
          </div>

          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2.5 rounded-xl transition self-start sm:self-auto cursor-pointer"
          >
            <span>&larr; Continue Shopping</span>
          </Link>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="min-h-[350px] flex items-center justify-center bg-white rounded-3xl border border-gray-200/80 p-12 shadow-sm">
            <div className="text-center">
              <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-base font-semibold text-gray-800">Loading your orders...</p>
              <p className="text-xs text-gray-500 mt-1">Retrieving your order history...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="bg-rose-50 border border-rose-200 rounded-3xl p-10 text-center shadow-sm space-y-4">
            <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-rose-900">Unable to load orders</h2>
              <p className="text-xs text-rose-600 max-w-md mx-auto mt-1">{error}</p>
            </div>
            <button
              type="button"
              onClick={fetchOrders}
              className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl transition shadow-sm cursor-pointer active:scale-95"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && orders.length === 0 && (
          <div className="bg-white rounded-3xl border border-gray-200/80 p-12 sm:p-16 text-center shadow-sm space-y-4">
            <div className="w-20 h-20 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mx-auto text-3xl shadow-inner">
              📦
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                You have not placed any orders yet.
              </h2>
              <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
                Explore our catalog and find something you love.
              </p>
            </div>
            <Link
              to="/products"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl transition shadow-md shadow-blue-500/20 active:scale-95 cursor-pointer"
            >
              <span>Start Shopping</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        )}

        {/* Populated Orders List */}
        {!loading && !error && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order) => {
              const orderDate = order.createdAt
                ? new Date(order.createdAt).toLocaleDateString(undefined, {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })
                : 'Recent'

              const orderStatusInfo = getOrderStatusInfo(order.status || order.orderStatus)
              const paymentStatusInfo = getPaymentStatusInfo(order.paymentStatus)

              return (
                <div
                  key={order._id}
                  className="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-7 shadow-sm hover:shadow-md transition duration-200 space-y-4"
                >
                  {/* Order Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-sm sm:text-base font-extrabold text-gray-900">
                          Order #{order._id}
                        </span>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${orderStatusInfo.className}`}
                        >
                          {orderStatusInfo.label}
                        </span>
                        {paymentStatusInfo && (
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${paymentStatusInfo.className}`}
                          >
                            Payment: {paymentStatusInfo.label}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400">
                        Placed on {orderDate}
                      </p>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className="text-[11px] text-gray-400 block uppercase font-medium">Total Amount</span>
                      <span className="text-lg sm:text-xl font-extrabold text-gray-900">
                        ₹{Number(order.totalAmount || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Order Items Snapshot Preview */}
                  <div className="divide-y divide-gray-50">
                    {order.items?.map((item, idx) => (
                      <div
                        key={idx}
                        className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4 text-xs"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-12 h-12 rounded-xl object-cover bg-gray-100 shrink-0 border border-gray-100"
                              onError={(e) => {
                                e.target.onerror = null
                                e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop'
                              }}
                            />
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-800 truncate text-sm" title={item.name}>
                              {item.name}
                            </p>
                            <p className="text-gray-400 text-xs mt-0.5">
                              {item.name} × {item.quantity}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="font-bold text-gray-900 text-xs sm:text-sm">
                            ₹{(Number(item.price) * Number(item.quantity)).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Card Footer: Shipping Details & View Confirmation Button */}
                  <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    {order.shippingAddress ? (
                      <p className="text-xs text-gray-500">
                        Delivering to: <span className="font-semibold text-gray-700">{order.shippingAddress.fullName || 'Customer'}</span>
                        {order.shippingAddress.address ? `, ${order.shippingAddress.address}` : ''}
                        {order.shippingAddress.city ? `, ${order.shippingAddress.city}` : ''}
                        {order.shippingAddress.pincode ? ` (${order.shippingAddress.pincode})` : ''}
                      </p>
                    ) : (
                      <p className="text-xs text-gray-400">Shipping address not specified</p>
                    )}

                    <button
                      type="button"
                      onClick={() => navigate(`/order-success/${order._id}`, { state: { order } })}
                      className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-semibold rounded-xl transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shrink-0"
                    >
                      <span>View Details</span>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>

                </div>
              )
            })}
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-gray-200 mt-16 py-8">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
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

export default Orders
