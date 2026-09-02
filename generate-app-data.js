import fs from 'fs';

const rawPlants = JSON.parse(fs.readFileSync('plants-with-images.json', 'utf8'));

// Metadata enrichment mapping based on category or name
function enrichPlant(p, index) {
  const id = p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const cost = `$${p.price}`;
  
  let sunlight = "Bright Indirect Sunlight";
  let water = "Once every 1-2 weeks";
  let difficulty = "Easy";
  let size = "12-18 inches";
  let benefit = p.description;
  let rating = (4.4 + (index % 7) * 0.1).toFixed(1);
  if (parseFloat(rating) > 5.0) rating = "5.0";

  switch (p.category) {
    case 'Indoor Plants':
      sunlight = "Low to Bright Indirect Light";
      water = "When top inch dries";
      difficulty = "Beginner";
      size = "14-24 inches tall";
      benefit = "Purifies indoor toxins and boosts ambient humidity.";
      break;
    case 'Outdoor Plants':
      sunlight = "Full Sun (6+ hours daily)";
      water = "Regular garden watering";
      difficulty = "Easy";
      size = "2-4 feet spread";
      benefit = "Attracts butterflies and beautifies landscape gardens.";
      break;
    case 'Flowering Plants':
      sunlight = "Bright Indirect to Partial Sun";
      water = "Keep soil lightly moist";
      difficulty = "Intermediate";
      size = "12-20 inches tall";
      benefit = "Prolific vibrant blooms with enchanting natural fragrance.";
      break;
    case 'Succulents and Cacti':
      sunlight = "Bright Direct Sunlight";
      water = "Once every 2-3 weeks (drought tolerant)";
      difficulty = "Beginner";
      size = "4-10 inches tall";
      benefit = "Requires minimal water; perfect for bright sunny desks.";
      break;
    case 'Herbs and Medicinal Plants':
      sunlight = "Direct Sunlight / Sunny Windowsill";
      water = "Keep evenly moist";
      difficulty = "Easy";
      size = "8-16 inches tall";
      benefit = "Fresh aromatic kitchen culinary & therapeutic herbal benefits.";
      break;
    case 'Bonsai':
      sunlight = "Bright Filtered Sunlight";
      water = "Water when surface moss slightly dries";
      difficulty = "Intermediate";
      size = "8-15 inches dwarf specimen";
      benefit = "Ancient living art form promoting mindfulness and tranquility.";
      break;
    case 'Hanging Plants':
      sunlight = "Bright Indirect Light";
      water = "Weekly soaking or misting";
      difficulty = "Easy";
      size = "Trailing 2-4 feet";
      benefit = "Graceful cascading vines that maximize vertical room space.";
      break;
    case 'Gardening Accessories':
      sunlight = "N/A (Essential Garden Tool)";
      water = "N/A";
      difficulty = "Easy to Use";
      size = "Standard Ergonomic Size";
      benefit = "Durable premium tool essential for happy, thriving houseplants.";
      break;
  }

  return {
    id,
    name: p.name,
    image: p.image,
    description: p.description,
    cost,
    category: p.category,
    sunlight,
    water,
    difficulty,
    size,
    benefit,
    rating: parseFloat(rating)
  };
}

const enrichedPlants = rawPlants.map((p, i) => enrichPlant(p, i));

// 1. Write src/plantsData.js
const plantsDataContent = `export const DEFAULT_PLANTS = ${JSON.stringify(enrichedPlants, null, 2)};\n`;
fs.writeFileSync('src/plantsData.js', plantsDataContent, 'utf8');
console.log(`Generated src/plantsData.js with ${enrichedPlants.length} plants across 8 categories.`);

// 2. Write server/db.js
const dbJsContent = `import path from 'path';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, 'database.sqlite');

let dbConnection = null;

export const DEFAULT_PLANTS = ${JSON.stringify(enrichedPlants, null, 2)};

export async function getDb() {
  if (dbConnection) return dbConnection;

  dbConnection = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  // Create tables if they do not exist
  await dbConnection.exec(\`
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
  \`);

  // Update plants in database
  for (const plant of DEFAULT_PLANTS) {
    await dbConnection.run(
      \`INSERT OR REPLACE INTO plants (id, name, image, description, cost, category, sunlight, water, difficulty, size, benefit, rating)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)\`,
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
      \`INSERT INTO users (name, email, password_hash, shippingAddress, savedCard, wishlist, role, auth_provider)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)\`,
      ['Guest Customer', 'customer@nursery.com', customerPasswordHash, defaultAddress, defaultCard, '[]', 'customer', 'local']
    );

    // Seed guest admin
    await dbConnection.run(
      \`INSERT INTO users (name, email, password_hash, shippingAddress, savedCard, wishlist, role, auth_provider)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)\`,
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
      \`INSERT INTO plants (id, name, image, description, cost, category, sunlight, water, difficulty, size, benefit, rating)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)\`,
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
`;

fs.writeFileSync('server/db.js', dbJsContent, 'utf8');
console.log('Updated server/db.js with Wikipedia-backed plants dataset.');
