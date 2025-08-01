// server.js
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Configuration
const N8N_BASE_URL = process.env.N8N_BASE_URL || 'http://localhost:5678';
const N8N_WEBHOOK_PATH = '/webhook';

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Routes

// Lance la génération SEO
app.post('/api/generate-seo', async (req, res) => {
  try {
    const {
      companyName,
      websiteUrl,
      services,
      geographicZone,
      keywords,
      tone,
      objectives,
      email,
      emailNotification
    } = req.body;

    // Validation des données requises
    if (!companyName || !websiteUrl || !services || !geographicZone) {
      return res.status(400).json({
        error: 'Données manquantes',
        required: ['companyName', 'websiteUrl', 'services', 'geographicZone']
      });
    }

    // Appel au webhook n8n
    const response = await axios.post(
      `${N8N_BASE_URL}${N8N_WEBHOOK_PATH}/seo-generation`,
      {
        companyName,
        websiteUrl,
        services,
        geographicZone,
        keywords: keywords || '',
        tone: tone || 'professionnel',
        objectives: objectives || 'both',
        email: email || '',
        emailNotification: emailNotification || false
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Erreur lors de la génération:', error.message);
    
    if (error.response) {
      res.status(error.response.status).json({
        error: error.response.data.message || 'Erreur du webhook n8n'
      });
    } else if (error.code === 'ECONNABORTED') {
      res.status(504).json({
        error: 'Timeout - La requête a pris trop de temps'
      });
    } else {
      res.status(500).json({
        error: 'Erreur serveur lors de la génération'
      });
    }
  }
});

// Vérifie le statut d'une session
app.get('/api/status/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID manquant' });
    }

    const response = await axios.get(
      `${N8N_BASE_URL}${N8N_WEBHOOK_PATH}/status/${sessionId}`,
      {
        timeout: 5000
      }
    );

    // Si pas de données, la session n'existe pas
    if (!response.data || response.data === '') {
      return res.status(404).json({
        error: 'Session non trouvée',
        sessionId
      });
    }

    // Parser les données si c'est une string JSON
    let statusData = response.data;
    if (typeof statusData === 'string') {
      try {
        statusData = JSON.parse(statusData);
      } catch (e) {
        console.error('Erreur parsing status:', e);
      }
    }

    res.json(statusData);
  } catch (error) {
    console.error('Erreur status:', error.message);
    
    if (error.response?.status === 404) {
      res.status(404).json({
        error: 'Session non trouvée',
        sessionId: req.params.sessionId
      });
    } else {
      res.status(500).json({
        error: 'Erreur lors de la récupération du statut'
      });
    }
  }
});

// Télécharge un fichier
app.get('/api/download/:sessionId/:fileType', async (req, res) => {
  try {
    const { sessionId, fileType } = req.params;

    if (!sessionId || !fileType) {
      return res.status(400).json({ error: 'Paramètres manquants' });
    }

    // Vérifier que le type de fichier est valide
    const validFileTypes = ['articles.json', 'strategy.md'];
    if (!validFileTypes.includes(fileType)) {
      return res.status(400).json({ 
        error: 'Type de fichier invalide',
        validTypes: validFileTypes
      });
    }

    // Récupérer le fichier depuis n8n
    const response = await axios.get(
      `${N8N_BASE_URL}${N8N_WEBHOOK_PATH}/download/${sessionId}/${fileType}`,
      {
        responseType: 'stream',
        timeout: 30000
      }
    );

    // Transférer les headers
    if (response.headers['content-type']) {
      res.setHeader('Content-Type', response.headers['content-type']);
    }
    if (response.headers['content-disposition']) {
      res.setHeader('Content-Disposition', response.headers['content-disposition']);
    }

    // Pipe la réponse
    response.data.pipe(res);
  } catch (error) {
    console.error('Erreur download:', error.message);
    
    if (error.response?.status === 404) {
      res.status(404).json({
        error: 'Fichier non trouvé',
        sessionId: req.params.sessionId,
        fileType: req.params.fileType
      });
    } else {
      res.status(500).json({
        error: 'Erreur lors du téléchargement'
      });
    }
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    n8nUrl: N8N_BASE_URL
  });
});

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).json({
    error: 'Route non trouvée',
    path: req.path
  });
});

// Gestion globale des erreurs
app.use((err, req, res, next) => {
  console.error('Erreur globale:', err);
  res.status(500).json({
    error: 'Erreur serveur interne',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Servir les fichiers statiques du frontend
app.use(express.static('public'));

// Route catch-all pour React
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📡 n8n URL: ${N8N_BASE_URL}`);
  console.log(`🌍 CORS autorisé pour: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
});

// Gestion propre de l'arrêt
process.on('SIGTERM', () => {
  console.log('SIGTERM reçu, arrêt en cours...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT reçu, arrêt en cours...');
  process.exit(0);
});