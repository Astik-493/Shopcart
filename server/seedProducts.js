import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Product from './models/product.model.js'

dotenv.config()

const products = [
  // ==========================================
  // 1. ELECTRONICS (12 Products)
  // ==========================================
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
  {
    name: 'Apple AirPods Pro (2nd Gen) USB-C',
    description: 'Pro-level Active Noise Cancellation, Adaptive Audio, Transparency mode, Personalized Spatial Audio, and MagSafe Charging Case (USB-C).',
    price: 24900,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?q=80&w=800&auto=format&fit=crop',
    stock: 35
  },
  {
    name: 'Sony Alpha 7 IV Full-Frame Mirrorless Camera',
    description: '33MP full-frame Exmor R CMOS sensor, 4K 60p 10-bit recording, AI-driven real-time autofocus with human, animal, and bird eye tracking.',
    price: 189990,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=800&auto=format&fit=crop',
    stock: 8
  },
  {
    name: 'Bose SoundLink Revolve+ II Bluetooth Speaker',
    description: '360-degree portable Bluetooth speaker with deep, immersive sound, IP55 water-resistant construction, and up to 17 hours of battery life.',
    price: 24500,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?q=80&w=800&auto=format&fit=crop',
    stock: 20
  },
  {
    name: 'Apple iPad Air 11-inch M2',
    description: 'Stunning Liquid Retina display with True Tone, blazing-fast Apple M2 chip, 12MP front landscape camera with Center Stage, and Wi-Fi 6E.',
    price: 59900,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=800&auto=format&fit=crop',
    stock: 18
  },
  {
    name: 'Dell UltraSharp 27 4K USB-C Hub Monitor',
    description: '27-inch 4K IPS Black monitor with 2000:1 contrast ratio, 98% DCI-P3 color coverage, 90W Power Delivery, and ergonomic tilt/swivel stand.',
    price: 48900,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1547082299-de196ea013d6?q=80&w=800&auto=format&fit=crop',
    stock: 14
  },
  {
    name: 'Amazon Kindle Paperwhite 16GB (11th Gen)',
    description: '6.8-inch glare-free 300 ppi Paperwhite display, adjustable warm light, IPX8 waterproof rating, and up to 10 weeks of battery life.',
    price: 14999,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?q=80&w=800&auto=format&fit=crop',
    stock: 45
  },
  {
    name: 'Anker 737 Power Bank (PowerCore 24K)',
    description: '24,000mAh ultra-powerful portable battery charger with 140W two-way fast charging, smart interactive digital display, and multi-device output.',
    price: 11999,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?q=80&w=800&auto=format&fit=crop',
    stock: 30
  },

  // ==========================================
  // 2. FASHION (12 Products)
  // ==========================================
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
  {
    name: "Levi's 511 Slim Fit Stretch Denim Jeans",
    description: 'Iconic 5-pocket denim styling with a modern slim fit cut, reinforced copper rivets, and premium comfort stretch cotton blend.',
    price: 3799,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=800&auto=format&fit=crop',
    stock: 40
  },
  {
    name: 'Herschel Little America Classic Backpack 25L',
    description: 'Mountaineering-inspired everyday backpack with padded fleece-lined 15-inch laptop sleeve, magnetic strap closures, and breathable air-mesh padding.',
    price: 7999,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=800&auto=format&fit=crop',
    stock: 25
  },
  {
    name: 'Adidas Ultraboost Light Running Shoes',
    description: 'High-performance running sneakers featuring responsive Light BOOST midsole cushioning, Continental rubber outsole, and Primeknit upper.',
    price: 14999,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?q=80&w=800&auto=format&fit=crop',
    stock: 20
  },
  {
    name: 'Tommy Hilfiger Men Classic Leather Belt',
    description: '100% genuine buffalo leather dress belt with polished stainless steel buckle, feathered edges, and signature embossed logo flag.',
    price: 2999,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?q=80&w=800&auto=format&fit=crop',
    stock: 50
  },
  {
    name: 'Pure Mulberry Silk Square Scarf',
    description: 'Luxurious 100% Grade 6A natural mulberry silk scarf with hand-rolled edges and artisan botanical watercolor print.',
    price: 3299,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?q=80&w=800&auto=format&fit=crop',
    stock: 35
  },
  {
    name: 'Casio Vintage Digital Gold Dial Watch',
    description: 'Retro iconic stainless steel digital watch with gold-tone ion plating, daily alarm, 1/100-second stopwatch, and water resistance.',
    price: 4995,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=800&auto=format&fit=crop',
    stock: 30
  },
  {
    name: 'Handcrafted Full-Grain Leather Chelsea Boots',
    description: 'Goodyear-welted premium pull-up leather Chelsea boots with elastic side gussets, cushioned footbed, and anti-slip rubber lug sole.',
    price: 8999,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?q=80&w=800&auto=format&fit=crop',
    stock: 15
  },

  // ==========================================
  // 3. BOOKS (10 Products)
  // ==========================================
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
  {
    name: 'Thinking, Fast and Slow by Daniel Kahneman',
    description: 'Nobel laureate Daniel Kahneman takes us on a groundbreaking tour of the mind, exploring the two systems that drive how we make judgments and decisions.',
    price: 599,
    category: 'Books',
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop',
    stock: 70
  },
  {
    name: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    description: 'Robert C. Martin revolutionary guide to writing clean, readable, robust, and maintainable software code in professional projects.',
    price: 1499,
    category: 'Books',
    image: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=800&auto=format&fit=crop',
    stock: 40
  },
  {
    name: 'Sapiens: A Brief History of Humankind by Yuval Noah Harari',
    description: 'From the Stone Age to the Silicon Age, a thrilling narrative of human evolution, cognition, cultures, and global civilizations.',
    price: 499,
    category: 'Books',
    image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=800&auto=format&fit=crop',
    stock: 90
  },
  {
    name: 'The Pragmatic Programmer: 20th Anniversary Edition',
    description: 'David Thomas and Andrew Hunt explore core principles and best practices for becoming a better developer, architect, and pragmatic engineer.',
    price: 1699,
    category: 'Books',
    image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=800&auto=format&fit=crop',
    stock: 35
  },
  {
    name: 'Rework by Jason Fried & David Heinemeier Hansson',
    description: 'A fresh, straightforward, and unconventional playbook for building, growing, and managing a lean, highly successful modern business.',
    price: 450,
    category: 'Books',
    image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?q=80&w=800&auto=format&fit=crop',
    stock: 65
  },
  {
    name: 'Zero to One: Notes on Startups by Peter Thiel',
    description: 'Secrets about how to build companies that create entirely new things, escape cutthroat competition, and build the future of technology.',
    price: 425,
    category: 'Books',
    image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=800&auto=format&fit=crop',
    stock: 80
  },

  // ==========================================
  // 4. HOME (11 Products)
  // ==========================================
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
  },
  {
    name: 'Cast Iron Dutch Oven 5.5 Quart with Enamel Coating',
    description: 'Heavy-duty enameled cast iron Dutch oven with self-basting lid for slow cooking, braising, roasting, and sourdough bread baking.',
    price: 4599,
    category: 'Home',
    image: 'https://images.unsplash.com/photo-1585515320310-259814833e62?q=80&w=800&auto=format&fit=crop',
    stock: 25
  },
  {
    name: 'Smart LED Ambient RGB Corner Floor Lamp',
    description: 'Minimalist Nordic corner light bar with 16 million colors, music sync modes, smart app control, and wireless remote.',
    price: 3999,
    category: 'Home',
    image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?q=80&w=800&auto=format&fit=crop',
    stock: 30
  },
  {
    name: 'Electric Gooseneck Temperature Control Kettle 0.8L',
    description: 'Precision flow pour-over kettle with 1200W rapid boil, 1-degree temperature adjustment, LCD display, and 60-minute keep-warm function.',
    price: 4299,
    category: 'Home',
    image: 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?q=80&w=800&auto=format&fit=crop',
    stock: 22
  },
  {
    name: 'Natural Soy Wax Scented Candle Gift Set',
    description: 'Set of 4 aromatherapy candles made from 100% natural soy wax and pure essential oils (Lavender, Vanilla, Eucalyptus, and Sandalwood).',
    price: 1499,
    category: 'Home',
    image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?q=80&w=800&auto=format&fit=crop',
    stock: 60
  },
  {
    name: 'Handmade Natural Jute Round Area Rug (4ft)',
    description: 'Eco-friendly hand-braided 100% organic natural jute rug with rustic farmhouse texture, reversible and durable for living areas.',
    price: 2799,
    category: 'Home',
    image: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?q=80&w=800&auto=format&fit=crop',
    stock: 18
  },
  {
    name: 'Bamboo Knife Block Set with 6 German Steel Knives',
    description: 'Professional high-carbon stainless steel chef knife set with magnetic bamboo storage block and built-in diamond sharpener.',
    price: 5499,
    category: 'Home',
    image: 'https://images.unsplash.com/photo-1593618998160-e34014e67546?q=80&w=800&auto=format&fit=crop',
    stock: 16
  },
  {
    name: 'Stainless Steel Insulated French Press Coffee Maker 1L',
    description: 'Double-wall vacuum insulated stainless steel coffee press with 4-level filtration system, heat-resistant stay-cool handle.',
    price: 2199,
    category: 'Home',
    image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?q=80&w=800&auto=format&fit=crop',
    stock: 35
  }
]

async function seed() {
  try {
    await mongoose.connect(process.env.dbUrl)
    console.log('Connected to MongoDB')

    let insertedCount = 0
    let updatedCount = 0

    for (const item of products) {
      // Upsert by product name to preserve existing IDs, orders, carts, and wishlists
      const result = await Product.updateOne(
        { name: item.name },
        { $set: item },
        { upsert: true }
      )

      if (result.upsertedCount > 0) {
        insertedCount++
      } else if (result.modifiedCount > 0) {
        updatedCount++
      }
    }

    const totalInDb = await Product.countDocuments()
    console.log(`Seed complete! Newly inserted: ${insertedCount}, Updated: ${updatedCount}, Total in DB: ${totalInDb}`)

    process.exit(0)
  } catch (error) {
    console.error('Error seeding products:', error)
    process.exit(1)
  }
}

seed()
