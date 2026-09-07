import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { initialProducts, initialAnnouncements, initialMedia, initialMessages, initialSettings } from './src/data/initialData';
import { Product, Announcement, MediaItem, CustomerMessage, CompanySettings } from './src/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Database storage file path
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

interface AdminCredentials {
  username: string;
  email: string;
  password: string;
  isDefault: boolean;
  updatedAt: string;
}

interface DBStructure {
  products: Product[];
  announcements: Announcement[];
  media: MediaItem[];
  messages: CustomerMessage[];
  settings: CompanySettings;
  adminCredentials?: AdminCredentials;
}

const defaultAdminCreds: AdminCredentials = {
  username: 'admin',
  email: 'admin@horonmousso.com',
  password: 'admin',
  isDefault: true,
  updatedAt: new Date().toISOString()
};

function loadDB(): DBStructure {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed: DBStructure = JSON.parse(data);
      // Migrate company name if previous placeholder
      if (parsed.settings && (parsed.settings.companyName.includes('AgroTerroir') || !parsed.settings.companyName)) {
        parsed.settings = { ...initialSettings, ...parsed.settings, companyName: 'Horon Mousso' };
      }
      // Ensure Soumbala product exists
      if (parsed.products && !parsed.products.some(p => p.id === 'prod_soumbala')) {
        parsed.products.unshift(initialProducts[0]);
      }
      if (!parsed.adminCredentials) {
        parsed.adminCredentials = defaultAdminCreds;
      }
      return parsed;
    }
  } catch (error) {
    console.error('Error loading DB from file, using initial data:', error);
  }
  const defaultDB: DBStructure = {
    products: initialProducts,
    announcements: initialAnnouncements,
    media: initialMedia,
    messages: initialMessages,
    settings: initialSettings,
    adminCredentials: defaultAdminCreds
  };
  saveDB(defaultDB);
  return defaultDB;
}

function saveDB(data: DBStructure) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving DB to file:', error);
  }
}

let db = loadDB();

/* ===========================
   API ROUTES
=========================== */

// Auth status endpoint
app.get('/api/auth/status', (_req, res) => {
  const creds = db.adminCredentials || defaultAdminCreds;
  res.json({
    isDefault: !!creds.isDefault,
    username: creds.username,
    email: creds.email,
    updatedAt: creds.updatedAt
  });
});

// Change admin credentials endpoint
app.post('/api/auth/change-credentials', (req, res) => {
  const { currentPassword, newUsername, newEmail, newPassword } = req.body;
  const creds = db.adminCredentials || defaultAdminCreds;

  if (currentPassword !== creds.password) {
    return res.status(400).json({ success: false, message: 'Le mot de passe actuel est incorrect.' });
  }

  if (newPassword && newPassword.length < 4) {
    return res.status(400).json({ success: false, message: 'Le nouveau mot de passe doit comporter au moins 4 caractères.' });
  }

  db.adminCredentials = {
    username: (newUsername && newUsername.trim()) || creds.username,
    email: (newEmail && newEmail.trim()) || creds.email,
    password: newPassword || creds.password,
    isDefault: false,
    updatedAt: new Date().toISOString()
  };

  saveDB(db);

  res.json({
    success: true,
    message: 'Identifiants administrateur mis à jour avec succès.',
    username: db.adminCredentials.username,
    email: db.adminCredentials.email
  });
});

// Auth endpoint
app.post('/api/auth/login', (req, res) => {
  const { identifier, password } = req.body;
  const creds = db.adminCredentials || defaultAdminCreds;

  const validIdentifier = 
    identifier === creds.username || 
    identifier === creds.email || 
    (creds.isDefault && (identifier === 'admin@agroterroir.com' || identifier === 'admin'));

  const validPassword = password === creds.password || (creds.isDefault && (password === 'admin123' || password === 'agro2025'));

  if (validIdentifier && validPassword) {
    return res.json({
      success: true,
      token: 'session_horon_admin_' + Date.now(),
      user: {
        id: 'usr_admin_1',
        name: 'Administrateur Horon Mousso',
        email: creds.email,
        role: 'admin',
        createdAt: creds.updatedAt
      }
    });
  }

  return res.status(401).json({
    success: false,
    message: creds.isDefault 
      ? 'Identifiant ou mot de passe incorrect. (Par défaut : identifiant "admin", mot de passe "admin")'
      : 'Identifiant ou mot de passe incorrect.'
  });
});

// Stats endpoint
app.get('/api/stats', (_req, res) => {
  const photosCount = db.media.filter(m => m.type === 'image').length;
  const videosCount = db.media.filter(m => m.type === 'video').length;
  const unreadMessagesCount = db.messages.filter(m => m.status === 'nouveau').length;

  res.json({
    productsCount: db.products.length,
    announcementsCount: db.announcements.length,
    photosCount,
    videosCount,
    messagesCount: db.messages.length,
    unreadMessagesCount
  });
});

// Products CRUD
app.get('/api/products', (_req, res) => {
  res.json(db.products);
});

app.post('/api/products', (req, res) => {
  const newProduct: Product = {
    ...req.body,
    id: 'prod_' + Date.now(),
    createdAt: new Date().toISOString()
  };
  db.products.unshift(newProduct);
  saveDB(db);
  res.status(201).json(newProduct);
});

app.put('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const index = db.products.findIndex(p => p.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Produit non trouvé' });
  }
  db.products[index] = {
    ...db.products[index],
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  saveDB(db);
  res.json(db.products[index]);
});

app.delete('/api/products/:id', (req, res) => {
  const { id } = req.params;
  db.products = db.products.filter(p => p.id !== id);
  saveDB(db);
  res.json({ success: true, id });
});

// Announcements CRUD
app.get('/api/announcements', (_req, res) => {
  res.json(db.announcements);
});

app.post('/api/announcements', (req, res) => {
  const newAnnouncement: Announcement = {
    ...req.body,
    id: 'ann_' + Date.now(),
    createdAt: new Date().toISOString()
  };
  db.announcements.unshift(newAnnouncement);
  saveDB(db);
  res.status(201).json(newAnnouncement);
});

app.put('/api/announcements/:id', (req, res) => {
  const { id } = req.params;
  const index = db.announcements.findIndex(a => a.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Annonce non trouvée' });
  }
  db.announcements[index] = {
    ...db.announcements[index],
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  saveDB(db);
  res.json(db.announcements[index]);
});

app.delete('/api/announcements/:id', (req, res) => {
  const { id } = req.params;
  db.announcements = db.announcements.filter(a => a.id !== id);
  saveDB(db);
  res.json({ success: true, id });
});

// Media CRUD
app.get('/api/media', (_req, res) => {
  res.json(db.media);
});

app.post('/api/media', (req, res) => {
  const newMedia: MediaItem = {
    ...req.body,
    id: 'med_' + Date.now(),
    createdAt: new Date().toISOString()
  };
  db.media.unshift(newMedia);
  saveDB(db);
  res.status(201).json(newMedia);
});

app.delete('/api/media/:id', (req, res) => {
  const { id } = req.params;
  db.media = db.media.filter(m => m.id !== id);
  saveDB(db);
  res.json({ success: true, id });
});

// Messages CRUD
app.get('/api/messages', (_req, res) => {
  res.json(db.messages);
});

app.post('/api/messages', (req, res) => {
  const { name, contact, message, productReference } = req.body;
  if (!name || !contact || !message) {
    return res.status(400).json({ error: 'Champs obligatoires manquants (nom, contact, message).' });
  }
  const newMessage: CustomerMessage = {
    id: 'msg_' + Date.now(),
    name,
    contact,
    message,
    productReference: productReference || '',
    status: 'nouveau',
    createdAt: new Date().toISOString()
  };
  db.messages.unshift(newMessage);
  saveDB(db);
  res.status(201).json(newMessage);
});

app.patch('/api/messages/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const msg = db.messages.find(m => m.id === id);
  if (!msg) {
    return res.status(404).json({ error: 'Message non trouvé' });
  }
  msg.status = status || (msg.status === 'nouveau' ? 'lu' : 'nouveau');
  saveDB(db);
  res.json(msg);
});

app.delete('/api/messages/:id', (req, res) => {
  const { id } = req.params;
  db.messages = db.messages.filter(m => m.id !== id);
  saveDB(db);
  res.json({ success: true, id });
});

// Company Settings
app.get('/api/settings', (_req, res) => {
  res.json(db.settings);
});

app.put('/api/settings', (req, res) => {
  db.settings = {
    ...db.settings,
    ...req.body
  };
  saveDB(db);
  res.json(db.settings);
});

// Reset demo data helper
app.post('/api/reset-demo', (_req, res) => {
  db = {
    products: initialProducts,
    announcements: initialAnnouncements,
    media: initialMedia,
    messages: initialMessages,
    settings: initialSettings,
    adminCredentials: defaultAdminCreds
  };
  saveDB(db);
  res.json({ success: true, message: 'Données de démonstration réinitialisées avec succès.' });
});

/* ===========================
   Vite & Static Assets Integration
=========================== */

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Horon Mousso Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
