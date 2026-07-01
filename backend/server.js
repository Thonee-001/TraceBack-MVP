require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
const allowedOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';
app.use(cors({ origin: allowedOrigin }));
app.use(express.json({ limit: '50mb' }));

const db = { 
    users: [], 
    items: [], 
    claims: [], 
    notifications: [] 
};

function init() {
  const adminHash = bcrypt.hashSync('thisIsATestPassword', 10);
  db.users = [
    { id: 'u1', name: 'Admin Tester', email: 'admintester@email.com', passwordHash: adminHash, role: 'admin', reputationScore: 100, status: 'active', createdAt: new Date().toISOString() }
  ];
  db.items = [
    { id: 'i1', title: 'Lost iPhone 14 Pro', description: 'Black iPhone', category: 'Electronics', color: 'Black', locationFound: 'Downtown', dateFounded: '2024-01-15', verified: true, status: 'verified', userId: 'u1', createdAt: new Date().toISOString() }
  ];
}
init();

const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try { req.user = jwt.verify(token, process.env.JWT_SECRET || 'secret123'); next(); }
  catch { res.status(401).json({ error: 'Invalid token' }); }
};

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.users.find(u => u.email === email);
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'secret123', { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

app.get('/api/items', (req, res) => { res.json({ items: db.items, total: db.items.length }); });
app.get('/api/admin/stats', auth, (req, res) => { res.json({ totalItems: db.items.length, pendingItems: 0, pendingClaims: 0, totalUsers: db.users.length }); });

app.get('/', (req, res) => res.send('TraceBack API is Live!'));

app.listen(PORT, () => console.log(`Server on port ${PORT}`));
