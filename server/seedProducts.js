import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Product from './models/product.model.js'

dotenv.config()

const products = [
  // Electronics
  {
    name: 'Sony WH-1000XM5 Wireless Headphones',
    description: 'Industry-leading noise canceling headphones with 30-hour battery life, crystal clear hands-free calling, and multipoint connection.',
    price: 29990,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop',
    stock: 25
  },
  {
    name: 'Apple MacBook Air M2',
    description: '13.6-inch Liquid Retina display, 8GB unified memory, 256GB SSD storage, backlit keyboard, and all-day battery life.',
    price: 94900,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=800&auto=format&fit=crop',
    stock: 12
  },
  {
    name: 'Logitech MX Master 3S Wireless Mouse',
    description: 'Performance wireless mouse with 8K DPI tracking on glass, quiet clicks, and ultra-fast MagSpeed scrolling.',
    price: 8995,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?q=80&w=800&auto=format&fit=crop',
    stock: 40
  },
  {
    name: 'Samsung 4K UHD Smart Curved Monitor 32"',
    description: 'Immersive curved 4K UHD monitor with HDR10, slim bezels, and built-in streaming TV apps with remote control.',
    price: 34500,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=800&auto=format&fit=crop',
    stock: 15
  },
  {
    name: 'Keychron K2 Wireless Mechanical Keyboard',
    description: '75% compact wireless mechanical keyboard with RGB backlighting, Mac/Windows layout compatibility, and Gateron switches.',
    price: 7499,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?q=80&w=800&auto=format&fit=crop',
    stock: 30
  },

  // Fashion
  {
    name: 'Classic Genuine Leather Jacket',
    description: 'Handcrafted premium full-grain lambskin leather jacket with quilted lining and durable YKK metallic zippers.',
    price: 12499,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=800&auto=format&fit=crop',
    stock: 18
  },
  {
    name: 'Nike Air Max 270 Sneakers',
    description: 'Iconic lifestyle sneakers featuring Nike largest Max Air unit for ultra-responsive cushioning and all-day casual comfort.',
    price: 11995,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop',
    stock: 22
  },
  {
    name: 'Men Slim Fit Oxford Cotton Shirt',
    description: 'Tailored 100% breathable Egyptian combed cotton casual shirt with button-down collar and mother-of-pearl buttons.',
    price: 2499,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=800&auto=format&fit=crop',
    stock: 50
  },
  {
    name: 'Fossil Minimalist Chronograph Watch',
    description: 'Sleek stainless steel quartz chronograph watch with genuine black leather strap and water resistance up to 50m.',
    price: 9495,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=800&auto=format&fit=crop',
    stock: 28
  },
  {
    name: 'Ray-Ban Classic Polarized Aviator Sunglasses',
    description: 'Timeless teardrop frame with UV400 polarized crystal green lenses and lightweight gold-toned metal frame.',
    price: 8590,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=800&auto=format&fit=crop',
    stock: 35
  },

  // Books
  {
    name: 'Atomic Habits by James Clear',
    description: 'An easy and proven way to build good habits and break bad ones. Transform your daily routines and achieve remarkable results.',
    price: 549,
    category: 'Books',
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800&auto=format&fit=crop',
    stock: 100
  },
  {
    name: 'The Psychology of Money by Morgan Housel',
    description: 'Timeless lessons on wealth, greed, and happiness doing well with money has a little to do with how smart you are and a lot to do with how you behave.',
    price: 399,
    category: 'Books',
    image: 'https://images.unsplash.com/photo-1592496431122-2349e0fbc666?q=80&w=800&auto=format&fit=crop',
    stock: 85
  },
  {
    name: 'Deep Work by Cal Newport',
    description: 'Rules for focused success in a distracted world. Master the superpower of intense concentration to produce world-class output.',
    price: 499,
    category: 'Books',
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=800&auto=format&fit=crop',
    stock: 60
  },
  {
    name: 'Designing Data-Intensive Applications',
    description: 'The definitive guide to the architecture of data systems, scalability, consistency, reliability, and maintainability by Martin Kleppmann.',
    price: 1899,
    category: 'Books',
    image: 'https://images.unsplash.com/photo-1532012164546-f432f2e37271?q=80&w=800&auto=format&fit=crop',
    stock: 25
  },

  // Home
  {
    name: 'Minimalist Ceramic Pour-Over Coffee Set',
    description: 'Artisan handcrafted matte ceramic dripper, heat-resistant glass carafe, and reusable stainless steel mesh filter.',
    price: 2899,
    category: 'Home',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format&fit=crop',
    stock: 30
  },
  {
    name: 'Ergonomic Memory Foam Lumbar Support Cushion',
    description: 'High-density contoured memory foam back support with breathable 3D mesh cover for office chairs and car seats.',
    price: 1799,
    category: 'Home',
    image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?q=80&w=800&auto=format&fit=crop',
    stock: 45
  },
  {
    name: 'Ultrasonic Aromatherapy Essential Oil Diffuser',
    description: '500ml wood grain quiet mist humidifier with 7 ambient LED light modes and auto shut-off safety protection.',
    price: 1999,
    category: 'Home',
    image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=800&auto=format&fit=crop',
    stock: 55
  },
  {
    name: 'Scandinavian Solid Oak Bedside Table Lamp',
    description: 'Modern dimmable warm ambient table lamp featuring a solid oak wood base and textured beige linen fabric shade.',
    price: 3499,
    category: 'Home',
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=800&auto=format&fit=crop',
    stock: 20
  }
]

async function seed() {
  try {
    await mongoose.connect(process.env.dbUrl)
    console.log('Connected to MongoDB')

    const created = await Product.insertMany(products)
    console.log(`Successfully added ${created.length} products to the database!`)

    process.exit(0)
  } catch (error) {
    console.error('Error seeding products:', error)
    process.exit(1)
  }
}

seed()
