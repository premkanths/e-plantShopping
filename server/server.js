import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import { getDb, resetPlantsDb } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey12345';
const googleClient = new OAuth2Client(process.env.VITE_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID);

app.use(cors());
app.use(express.json());

// Helper function to send standard error response
const handleError = (res, err) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Internal server error' });
};

// ==========================================
// AUTHENTICATION MIDDLEWARE
// ==========================================
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = decoded; // { id, email, role }
    next();
  });
};

// ==========================================
// AUTHENTICATION ENDPOINTS
// ==========================================

// Local user registration
app.post('/api/auth/register', async (req, res) => {
  try {
    const db = await getDb();
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const existingUser = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(400).json({ error: 'A user with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const defaultAddress = JSON.stringify({ street: '', city: '', state: '', zip: '' });
    const defaultCard = JSON.stringify({ number: '', expiry: '', cvv: '' });

    await db.run(
      `INSERT INTO users (name, email, password_hash, shippingAddress, savedCard, wishlist, role, auth_provider)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, email, passwordHash, defaultAddress, defaultCard, '[]', 'customer', 'local']
    );

    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        shippingAddress: JSON.parse(user.shippingAddress || '{}'),
        savedCard: JSON.parse(user.savedCard || '{}'),
        wishlist: JSON.parse(user.wishlist || '[]'),
        auth_provider: user.auth_provider
      }
    });
  } catch (err) {
    handleError(res, err);
  }
});

// Local user login
app.post('/api/auth/login', async (req, res) => {
  try {
    const db = await getDb();
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user || user.auth_provider !== 'local') {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        shippingAddress: JSON.parse(user.shippingAddress || '{}'),
        savedCard: JSON.parse(user.savedCard || '{}'),
        wishlist: JSON.parse(user.wishlist || '[]'),
        auth_provider: user.auth_provider
      }
    });
  } catch (err) {
    handleError(res, err);
  }
});

// Google OAuth Login / Registration
app.post('/api/auth/google', async (req, res) => {
  const { credential } = req.body;

  if (!credential) {
    return res.status(400).json({ error: 'Google credential is required' });
  }

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.VITE_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID
    });
    
    const payload = ticket.getPayload();
    const { email, name } = payload;

    const db = await getDb();
    let user = await db.get('SELECT * FROM users WHERE email = ?', [email]);

    if (!user) {
      // Auto-register Google OAuth user
      const defaultAddress = JSON.stringify({ street: '', city: '', state: '', zip: '' });
      const defaultCard = JSON.stringify({ number: '', expiry: '', cvv: '' });

      await db.run(
        `INSERT INTO users (name, email, password_hash, shippingAddress, savedCard, wishlist, role, auth_provider)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [name, email, null, defaultAddress, defaultCard, '[]', 'customer', 'google']
      );
      user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        shippingAddress: JSON.parse(user.shippingAddress || '{}'),
        savedCard: JSON.parse(user.savedCard || '{}'),
        wishlist: JSON.parse(user.wishlist || '[]'),
        auth_provider: user.auth_provider
      }
    });
  } catch (err) {
    console.error('Google Auth Error:', err);
    res.status(401).json({ error: 'Invalid Google credential token' });
  }
});

// Fetch current user session
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const db = await getDb();
    const user = await db.get('SELECT * FROM users WHERE id = ?', [req.user.id]);
    if (!user) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      shippingAddress: JSON.parse(user.shippingAddress || '{}'),
      savedCard: JSON.parse(user.savedCard || '{}'),
      wishlist: JSON.parse(user.wishlist || '[]'),
      auth_provider: user.auth_provider
    });
  } catch (err) {
    handleError(res, err);
  }
});

// ==========================================
// PLANTS CATALOG ENDPOINTS
// ==========================================

// Get all plants
app.get('/api/plants', async (req, res) => {
  try {
    const db = await getDb();
    const plants = await db.all('SELECT * FROM plants');
    res.json(plants);
  } catch (err) {
    handleError(res, err);
  }
});

// Create a new plant (Admin only)
app.post('/api/plants', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }

  try {
    const db = await getDb();
    const { name, image, description, cost, category, sunlight, water, difficulty, size, benefit, rating } = req.body;
    
    if (!name || !image) {
      return res.status(400).json({ error: 'Name and Image URL are required' });
    }

    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const finalRating = rating || 5.0;

    await db.run(
      `INSERT INTO plants (id, name, image, description, cost, category, sunlight, water, difficulty, size, benefit, rating)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, name, image, description || '', cost || '$10', category || 'Low Maintenance', sunlight || '', water || '', difficulty || '', size || '', benefit || '', finalRating]
    );

    const newPlant = await db.get('SELECT * FROM plants WHERE id = ?', [id]);
    res.status(201).json(newPlant);
  } catch (err) {
    handleError(res, err);
  }
});

// Update a plant (Admin only)
app.put('/api/plants/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }

  try {
    const db = await getDb();
    const { id } = req.params;
    const { name, image, description, cost, category, sunlight, water, difficulty, size, benefit, rating } = req.body;

    const existing = await db.get('SELECT * FROM plants WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Plant not found' });
    }

    await db.run(
      `UPDATE plants 
       SET name = ?, image = ?, description = ?, cost = ?, category = ?, sunlight = ?, water = ?, difficulty = ?, size = ?, benefit = ?, rating = ?
       WHERE id = ?`,
      [
        name !== undefined ? name : existing.name,
        image !== undefined ? image : existing.image,
        description !== undefined ? description : existing.description,
        cost !== undefined ? cost : existing.cost,
        category !== undefined ? category : existing.category,
        sunlight !== undefined ? sunlight : existing.sunlight,
        water !== undefined ? water : existing.water,
        difficulty !== undefined ? difficulty : existing.difficulty,
        size !== undefined ? size : existing.size,
        benefit !== undefined ? benefit : existing.benefit,
        rating !== undefined ? rating : existing.rating,
        id
      ]
    );

    const updated = await db.get('SELECT * FROM plants WHERE id = ?', [id]);
    res.json(updated);
  } catch (err) {
    handleError(res, err);
  }
});

// Delete a plant (Admin only)
app.delete('/api/plants/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }

  try {
    const db = await getDb();
    const { id } = req.params;

    const existing = await db.get('SELECT * FROM plants WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Plant not found' });
    }

    await db.run('DELETE FROM plants WHERE id = ?', [id]);
    res.json({ message: 'Plant deleted successfully', id });
  } catch (err) {
    handleError(res, err);
  }
});

// Reset catalog to default (Admin only)
app.post('/api/plants/reset', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }

  try {
    const plants = await resetPlantsDb();
    res.json(plants);
  } catch (err) {
    handleError(res, err);
  }
});

// ==========================================
// ORDERS ENDPOINTS
// ==========================================

// Get orders (Customers see their own; Admins see all)
app.get('/api/orders', authenticateToken, async (req, res) => {
  try {
    const db = await getDb();
    let rows;
    
    if (req.user.role === 'admin') {
      rows = await db.all('SELECT * FROM orders ORDER BY date DESC');
    } else {
      rows = await db.all('SELECT * FROM orders WHERE customerEmail = ? ORDER BY date DESC', [req.user.email]);
    }
    
    const orders = rows.map(row => ({
      ...row,
      shippingAddress: JSON.parse(row.shippingAddress),
      items: JSON.parse(row.items)
    }));
    
    res.json(orders);
  } catch (err) {
    handleError(res, err);
  }
});

// Create new order
app.post('/api/orders', authenticateToken, async (req, res) => {
  try {
    const db = await getDb();
    const { customerName, customerEmail, customerPhone, shippingAddress, items, totalCost } = req.body;

    if (!customerName || !customerEmail || !items || !totalCost) {
      return res.status(400).json({ error: 'Missing required order fields' });
    }

    const orderId = `EP-ORD-${Math.floor(100000 + Math.random() * 900000)}`;
    const date = new Date().toISOString();
    const status = 'Pending';

    await db.run(
      `INSERT INTO orders (id, date, status, customerName, customerEmail, customerPhone, shippingAddress, items, totalCost)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderId,
        date,
        status,
        customerName,
        customerEmail,
        customerPhone || '',
        JSON.stringify(shippingAddress || {}),
        JSON.stringify(items),
        totalCost
      ]
    );

    const newOrder = await db.get('SELECT * FROM orders WHERE id = ?', [orderId]);
    res.status(201).json({
      ...newOrder,
      shippingAddress: JSON.parse(newOrder.shippingAddress),
      items: JSON.parse(newOrder.items)
    });
  } catch (err) {
    handleError(res, err);
  }
});

// Update order status (Admin only)
app.put('/api/orders/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }

  try {
    const db = await getDb();
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const existing = await db.get('SELECT * FROM orders WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Order not found' });
    }

    await db.run('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
    
    const updated = await db.get('SELECT * FROM orders WHERE id = ?', [id]);
    res.json({
      ...updated,
      shippingAddress: JSON.parse(updated.shippingAddress),
      items: JSON.parse(updated.items)
    });
  } catch (err) {
    handleError(res, err);
  }
});

// Delete/Cancel an order
app.delete('/api/orders/:id', authenticateToken, async (req, res) => {
  try {
    const db = await getDb();
    const { id } = req.params;

    const existing = await db.get('SELECT * FROM orders WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Only allow Admins or the owner to cancel their order
    if (req.user.role !== 'admin' && existing.customerEmail !== req.user.email) {
      return res.status(403).json({ error: 'Forbidden: Access denied' });
    }

    await db.run('DELETE FROM orders WHERE id = ?', [id]);
    res.json({ message: 'Order deleted successfully', id });
  } catch (err) {
    handleError(res, err);
  }
});

// ==========================================
// USER PROFILE ENDPOINTS (SCOPED TO CURRENT USER)
// ==========================================

// Get logged-in user profile
app.get('/api/user', authenticateToken, async (req, res) => {
  try {
    const db = await getDb();
    const user = await db.get('SELECT * FROM users WHERE id = ?', [req.user.id]);
    if (!user) {
      return res.status(404).json({ error: 'User profile not found' });
    }
    
    res.json({
      name: user.name,
      email: user.email,
      role: user.role,
      shippingAddress: JSON.parse(user.shippingAddress || '{}'),
      savedCard: JSON.parse(user.savedCard || '{}'),
      wishlist: JSON.parse(user.wishlist || '[]'),
      auth_provider: user.auth_provider
    });
  } catch (err) {
    handleError(res, err);
  }
});

// Update logged-in user profile
app.put('/api/user', authenticateToken, async (req, res) => {
  try {
    const db = await getDb();
    const { name, email, shippingAddress, savedCard, role } = req.body;
    
    const user = await db.get('SELECT * FROM users WHERE id = ?', [req.user.id]);
    if (!user) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    // Only allow updating to admin if the requester is already an admin
    let finalRole = user.role;
    if (role !== undefined) {
      if (role === 'admin' && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden: Cannot upgrade yourself to Admin' });
      }
      finalRole = role;
    }

    await db.run(
      `UPDATE users 
       SET name = ?, email = ?, shippingAddress = ?, savedCard = ?, role = ?
       WHERE id = ?`,
      [
        name !== undefined ? name : user.name,
        email !== undefined ? email : user.email,
        shippingAddress !== undefined ? JSON.stringify(shippingAddress) : user.shippingAddress,
        savedCard !== undefined ? JSON.stringify(savedCard) : user.savedCard,
        finalRole,
        user.id
      ]
    );

    const updated = await db.get('SELECT * FROM users WHERE id = ?', [user.id]);
    res.json({
      name: updated.name,
      email: updated.email,
      role: updated.role,
      shippingAddress: JSON.parse(updated.shippingAddress || '{}'),
      savedCard: JSON.parse(updated.savedCard || '{}'),
      wishlist: JSON.parse(updated.wishlist || '[]'),
      auth_provider: updated.auth_provider
    });
  } catch (err) {
    handleError(res, err);
  }
});

// Toggle wishlist item for logged-in user
app.put('/api/user/wishlist', authenticateToken, async (req, res) => {
  try {
    const db = await getDb();
    const { plantName } = req.body;

    if (!plantName) {
      return res.status(400).json({ error: 'plantName is required' });
    }

    const user = await db.get('SELECT * FROM users WHERE id = ?', [req.user.id]);
    if (!user) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    let wishlist = JSON.parse(user.wishlist || '[]');
    if (wishlist.includes(plantName)) {
      wishlist = wishlist.filter(name => name !== plantName);
    } else {
      wishlist.push(plantName);
    }

    await db.run('UPDATE users SET wishlist = ? WHERE id = ?', [JSON.stringify(wishlist), user.id]);
    res.json(wishlist);
  } catch (err) {
    handleError(res, err);
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
