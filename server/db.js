import path from 'path';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, 'database.sqlite');

let dbConnection = null;

const DEFAULT_PLANTS = [
  {
    id: 'snake-plant',
    name: "Snake Plant",
    image: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?q=80&w=600&auto=format&fit=crop",
    description: "Produces oxygen at night, perfect for your bedroom.",
    cost: "$15",
    category: "Air Purifying",
    sunlight: "Indirect Light / Partial Shade",
    water: "Once every 2-3 weeks",
    difficulty: "Beginner",
    size: "12-18 inches tall",
    benefit: "Cleans benzene, formaldehyde, trichloroethylene, xylene, and toluene from the air.",
    rating: 4.8
  },
  {
    id: 'spider-plant',
    name: "Spider Plant",
    image: "https://images.unsplash.com/photo-1572656631137-7935297eff55?q=80&w=600&auto=format&fit=crop",
    description: "Highly effective at filtering indoor air toxins.",
    cost: "$12",
    category: "Air Purifying",
    sunlight: "Bright Indirect Light",
    water: "Once a week",
    difficulty: "Easy",
    size: "8-12 inches tall",
    benefit: "Thrives in humid conditions; safely non-toxic for cats and dogs.",
    rating: 4.5
  },
  {
    id: 'peace-lily',
    name: "Peace Lily",
    image: "https://images.unsplash.com/photo-1593696140826-c58b021acf8b?q=80&w=600&auto=format&fit=crop",
    description: "Stunning white blooms that filter harmful chemicals.",
    cost: "$18",
    category: "Air Purifying",
    sunlight: "Low to Medium Light",
    water: "Keep soil damp, mist leaves weekly",
    difficulty: "Medium",
    size: "18-24 inches tall",
    benefit: "Produces beautiful white spathes that signal hydration status clearly.",
    rating: 4.6
  },
  {
    id: 'lavender',
    name: "Lavender",
    image: "https://images.unsplash.com/photo-1564834724105-918b73d1b9e0?q=80&w=600&auto=format&fit=crop",
    description: "Calming scent that reduces stress and improves sleep.",
    cost: "$20",
    category: "Aromatic Fragrant",
    sunlight: "Full Sun (6+ hours daily)",
    water: "Only when soil is completely dry",
    difficulty: "Medium",
    size: "12-16 inches tall",
    benefit: "Releases therapeutic essential oils that naturally induce relaxation.",
    rating: 4.9
  },
  {
    id: 'jasmine',
    name: "Jasmine",
    image: "https://images.unsplash.com/photo-1595165651634-b3b4826f4f6e?q=80&w=600&auto=format&fit=crop",
    description: "Sweet fragrance that uplifts mood and relieves anxiety.",
    cost: "$22",
    category: "Aromatic Fragrant",
    sunlight: "Bright Light, Direct Morning Sun",
    water: "Keep evenly moist but not waterlogged",
    difficulty: "Intermediate",
    size: "24-36 inches (climbing vine)",
    benefit: "Intensely fragrant star-shaped white blossoms that bloom cyclically.",
    rating: 4.7
  },
  {
    id: 'rosemary',
    name: "Rosemary",
    image: "https://images.unsplash.com/photo-1594313080370-fd83905a0d02?q=80&w=600&auto=format&fit=crop",
    description: "Delicious culinary herb with a fresh, piney aroma.",
    cost: "$10",
    category: "Aromatic Fragrant",
    sunlight: "Full, Direct Sun",
    water: "Low water requirements; drought-tolerant",
    difficulty: "Easy",
    size: "10-15 inches tall",
    benefit: "Double-duty garden herb: perfect for roast recipes and repelling insects.",
    rating: 4.4
  },
  {
    id: 'aloe-vera',
    name: "Aloe Vera",
    image: "https://images.unsplash.com/photo-1598880940080-ff9a29891b85?q=80&w=600&auto=format&fit=crop",
    description: "Requires very little watering; contains soothing gel.",
    cost: "$14",
    category: "Low Maintenance",
    sunlight: "Bright Indirect Sunlight",
    water: "Once every 3 weeks",
    difficulty: "Beginner",
    size: "10-14 inches tall",
    benefit: "Gel can be harvested to naturally treat minor kitchen burns and skin dryness.",
    rating: 4.8
  },
  {
    id: 'cast-iron-plant',
    name: "Cast Iron Plant",
    image: "https://images.unsplash.com/photo-1597055181300-e3633a207518?q=80&w=600&auto=format&fit=crop",
    description: "Extremely hardy, thrives in low light and neglect.",
    cost: "$25",
    category: "Low Maintenance",
    sunlight: "Low light to Deep Shade",
    water: "Allow soil to dry fully between waterings",
    difficulty: "Beginner",
    size: "20-28 inches tall",
    benefit: "Famous for survival in extreme drafts, poor soil quality, and low light.",
    rating: 4.3
  },
  {
    id: 'zz-plant',
    name: "ZZ Plant",
    image: "https://images.unsplash.com/photo-1632207691143-643c2a9a9361?q=80&w=600&auto=format&fit=crop",
    description: "Waxy, shiny leaves that store water for dry periods.",
    cost: "$19",
    category: "Low Maintenance",
    sunlight: "Low to Bright Indirect Light",
    water: "Once a month (highly drought-tolerant)",
    difficulty: "Beginner",
    size: "18-24 inches tall",
    benefit: "Stores moisture in underground rhizomes, making it perfect for travelers.",
    rating: 4.7
  }
];

const DEFAULT_USER = {
  name: 'Jane Doe',
  email: 'jane.doe@example.com',
  shippingAddress: JSON.stringify({
    street: '123 Forest Avenue',
    city: 'Greenwood',
    state: 'CO',
    zip: '80111'
  }),
  savedCard: JSON.stringify({
    number: '•••• •••• •••• 4242',
    expiry: '12/28',
    cvv: '•••'
  }),
  wishlist: JSON.stringify([]),
  role: 'customer'
};

export async function getDb() {
  if (dbConnection) return dbConnection;

  dbConnection = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  // Create tables if they do not exist
  await dbConnection.exec(`
    CREATE TABLE IF NOT EXISTS plants (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      image TEXT NOT NULL,
      description TEXT,
      cost TEXT,
      category TEXT,
      sunlight TEXT,
      water TEXT,
      difficulty TEXT,
      size TEXT,
      benefit TEXT,
      rating REAL
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      status TEXT NOT NULL,
      customerName TEXT NOT NULL,
      customerEmail TEXT NOT NULL,
      customerPhone TEXT NOT NULL,
      shippingAddress TEXT NOT NULL,
      items TEXT NOT NULL,
      totalCost REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT,
      shippingAddress TEXT,
      savedCard TEXT,
      wishlist TEXT NOT NULL DEFAULT '[]',
      role TEXT NOT NULL DEFAULT 'customer',
      auth_provider TEXT NOT NULL DEFAULT 'local'
    );
  `);

  // Seed plants table if empty
  const plantCount = await dbConnection.get('SELECT COUNT(*) as count FROM plants');
  if (plantCount.count === 0) {
    console.log('Seeding default plants into the database...');
    for (const plant of DEFAULT_PLANTS) {
      await dbConnection.run(
        `INSERT INTO plants (id, name, image, description, cost, category, sunlight, water, difficulty, size, benefit, rating)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          plant.id,
          plant.name,
          plant.image,
          plant.description,
          plant.cost,
          plant.category,
          plant.sunlight,
          plant.water,
          plant.difficulty,
          plant.size,
          plant.benefit,
          plant.rating
        ]
      );
    }
  }

  // Seed users table with Guest Customer and Guest Admin if empty
  const userCount = await dbConnection.get('SELECT COUNT(*) as count FROM users');
  if (userCount.count === 0) {
    console.log('Seeding default guest accounts...');
    
    const customerPasswordHash = await bcrypt.hash('customer123', 10);
    const adminPasswordHash = await bcrypt.hash('admin123', 10);

    const defaultAddress = JSON.stringify({
      street: '123 Forest Avenue',
      city: 'Greenwood',
      state: 'CO',
      zip: '80111'
    });

    const defaultCard = JSON.stringify({
      number: '•••• •••• •••• 4242',
      expiry: '12/28',
      cvv: '•••'
    });

    // Seed guest customer
    await dbConnection.run(
      `INSERT INTO users (name, email, password_hash, shippingAddress, savedCard, wishlist, role, auth_provider)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      ['Guest Customer', 'customer@nursery.com', customerPasswordHash, defaultAddress, defaultCard, '[]', 'customer', 'local']
    );

    // Seed guest admin
    await dbConnection.run(
      `INSERT INTO users (name, email, password_hash, shippingAddress, savedCard, wishlist, role, auth_provider)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      ['Guest Admin', 'admin@nursery.com', adminPasswordHash, defaultAddress, defaultCard, '[]', 'admin', 'local']
    );
  }

  return dbConnection;
}

export async function resetPlantsDb() {
  const db = await getDb();
  await db.run('DELETE FROM plants');
  console.log('Resetting default plants in database...');
  for (const plant of DEFAULT_PLANTS) {
    await db.run(
      `INSERT INTO plants (id, name, image, description, cost, category, sunlight, water, difficulty, size, benefit, rating)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        plant.id,
        plant.name,
        plant.image,
        plant.description,
        plant.cost,
        plant.category,
        plant.sunlight,
        plant.water,
        plant.difficulty,
        plant.size,
        plant.benefit,
        plant.rating
      ]
    );
  }
  return await db.all('SELECT * FROM plants');
}
