import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { axiosInstance } from '../axiosCalls/axios'
import { useAuth } from '../context/AuthContext'

function Home() {
  const navigate = useNavigate()
  const { user: authUser, logout } = useAuth()
  const [customer, setCustomer] = useState(authUser || null)
  const [loading, setLoading] = useState(!authUser)

  useEffect(() => {
    const fetchCustomerProfile = async () => {
      try {
        const response = await axiosInstance.get('api/customers/me')
        setCustomer(response.data)
      } catch (err) {
        navigate('/login')
      } finally {
        setLoading(false)
      }
    }

    fetchCustomerProfile()
  }, [navigate])

  const handleLogout = async () => {
    try {
      await logout()
    } catch (err) {
      console.error(err)
    } finally {
      navigate('/login')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-500">Loading your profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 flex flex-col antialiased">
      
      {/* Navigation Header */}
      <header className="w-full bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 h-20 flex items-center justify-between">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold tracking-tight text-gray-900 font-serif">
              ShopLogo
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-gray-600">
            <a href="#shop" className="text-gray-900 font-semibold hover:text-black transition">
              Shop
            </a>
            <a href="#profile" className="hover:text-black transition">
              Profile
            </a>
            <a href="#new-arrivals" className="hover:text-black transition">
              New Arrivals
            </a>
            <a href="#best-sellers" className="hover:text-black transition">
              Best Sellers
            </a>
          </nav>

          {/* Right Controls */}
          <div className="flex items-center space-x-4">
            
            {/* Logged in User Pill + Logout Button */}
            {customer && (
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 pl-3 pr-1 py-1 rounded-full text-xs font-medium text-gray-700 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="font-semibold text-gray-800">{customer.fullName}</span>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white font-semibold px-2.5 py-1 rounded-full transition text-[11px] shadow-sm hover:shadow active:scale-95 cursor-pointer ml-1"
                  title="Logout"
                >
                  Logout
                </button>
              </div>
            )}

            {/* Profile Icon */}
            <a href="#profile" className="p-2 hover:bg-gray-100 rounded-full transition text-gray-700 cursor-pointer" title="Profile">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </a>

            {/* Shopping Cart */}
            <button className="p-2 hover:bg-gray-100 rounded-full transition text-gray-700 cursor-pointer relative" title="Cart">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full ring-2 ring-white" />
            </button>

          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-10">
        
        {/* User Profile Block & Welcome Section */}
        {customer && (
          <section id="profile" className="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-8 shadow-sm relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              
              {/* Left Side: Avatar & Details */}
              <div className="flex items-start sm:items-center gap-5">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white text-2xl sm:text-3xl font-bold shadow-md shadow-indigo-500/20 shrink-0">
                  {customer.fullName ? customer.fullName.charAt(0).toUpperCase() : 'U'}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                      Active Member
                    </span>
                    <span className="text-xs text-gray-400">Verified Customer</span>
                  </div>

                  {/* Welcome Message */}
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                    Welcome back, {customer.fullName}!
                  </h1>
                  <p className="text-sm text-gray-500">
                    Manage your account details and view your orders from your dashboard.
                  </p>
                </div>
              </div>

              {/* Right Side: Quick Action Button */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleLogout}
                  className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold rounded-xl border border-red-200/80 transition cursor-pointer flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Sign Out</span>
                </button>
              </div>

            </div>

            {/* Customer Information Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
              
              {/* Full Name */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-gray-100 flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-500">Customer Name</p>
                  <p className="text-sm font-semibold text-gray-900 truncate">{customer.fullName}</p>
                </div>
              </div>

              {/* Email */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-gray-100 flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-500">Email Address</p>
                  <p className="text-sm font-semibold text-gray-900 truncate">{customer.email}</p>
                </div>
              </div>

              {/* Phone */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-gray-100 flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-500">Phone Number</p>
                  <p className="text-sm font-semibold text-gray-900 truncate">{customer.phone || 'N/A'}</p>
                </div>
              </div>

            </div>
          </section>
        )}

        {/* Hero Section */}
        <section id="shop" className="bg-[#ededed] rounded-3xl overflow-hidden grid grid-cols-1 md:grid-cols-2 items-center min-h-[420px] shadow-sm">
          
          {/* Left Text Column */}
          <div className="p-8 sm:p-12 md:p-16 space-y-5">
            <h2 className="text-4xl sm:text-5xl lg:text-[52px] font-serif font-medium text-gray-900 leading-[1.15] tracking-tight">
              Discover Your Style
            </h2>
            <p className="text-gray-600 text-base sm:text-lg font-light">
              Shop the latest trends & exclusive offers
            </p>
            <div className="pt-2">
              <button className="px-9 py-3.5 bg-[#e86638] hover:bg-[#d6572a] text-white font-semibold rounded-lg shadow-sm hover:shadow transition active:scale-95 cursor-pointer text-sm sm:text-base">
                Shop Now
              </button>
            </div>
          </div>

          {/* Right Hero Image Column */}
          <div className="h-full w-full flex items-center justify-center p-6 md:p-8">
            <div className="relative w-full h-[320px] sm:h-[380px] rounded-2xl overflow-hidden shadow-sm">
              <img
                src="https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1000&auto=format&fit=crop"
                alt="Discover Your Style"
                className="w-full h-full object-cover object-top hover:scale-105 transition duration-500 ease-out"
              />
            </div>
          </div>

        </section>

        {/* Features 3-Pillar Bar */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6 border-y border-gray-200">
          
          {/* Free Shipping */}
          <div className="flex items-center justify-center gap-3.5 text-gray-800 py-2">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M8 17a2 2 0 100-4 2 2 0 000 4zm8 0a2 2 0 100-4 2 2 0 000 4zM3 9h11v8H3V9zm11 3h4l3 3v2h-7v-5z" />
              </svg>
            </div>
            <span className="font-semibold text-sm">Free Shipping</span>
          </div>

          {/* Secure Checkout */}
          <div className="flex items-center justify-center gap-3.5 text-gray-800 py-2 md:border-x border-gray-200">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <span className="font-semibold text-sm">Secure Checkout</span>
          </div>

          {/* 24/7 Support */}
          <div className="flex items-center justify-center gap-3.5 text-gray-800 py-2">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="font-semibold text-sm">24/7 Support</span>
          </div>

        </section>

        {/* Featured Collections */}
        <section id="new-arrivals" className="space-y-6 text-center pt-2">
          <h3 className="text-3xl font-serif font-medium text-gray-900 tracking-tight">
            Featured Collections
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            
            {/* Card 1: Spring Fashion */}
            <div className="group cursor-pointer">
              <div className="overflow-hidden rounded-xl bg-gray-100 h-80 mb-3 shadow-sm border border-gray-100">
                <img
                  src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop"
                  alt="Spring Fashion"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500 ease-out"
                />
              </div>
              <h4 className="font-semibold text-gray-900 text-base group-hover:text-orange-600 transition">
                Spring Fashion
              </h4>
            </div>

            {/* Card 2: Luxury Watches */}
            <div className="group cursor-pointer">
              <div className="overflow-hidden rounded-xl bg-gray-100 h-80 mb-3 shadow-sm border border-gray-100">
                <img
                  src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=800&auto=format&fit=crop"
                  alt="Luxury Watches"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500 ease-out"
                />
              </div>
              <h4 className="font-semibold text-gray-900 text-base group-hover:text-orange-600 transition">
                Luxury Watches
              </h4>
            </div>

            {/* Card 3: Home Essentials */}
            <div className="group cursor-pointer">
              <div className="overflow-hidden rounded-xl bg-gray-100 h-80 mb-3 shadow-sm border border-gray-100">
                <img
                  src="https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=800&auto=format&fit=crop"
                  alt="Home Essentials"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500 ease-out"
                />
              </div>
              <h4 className="font-semibold text-gray-900 text-base group-hover:text-orange-600 transition">
                Home Essentials
              </h4>
            </div>

          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-gray-200 mt-16 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <p className="font-serif text-sm font-semibold text-gray-800">
            ShopLogo
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

export default Home