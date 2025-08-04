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

// Routes API

// Lance la génération SEO
app.post('/api/generate-seo', async (req, res) => {
  try {
    console.log('Received request:', req.body);
    
    const {
      companyName,
      websiteUrl,
      services,
      geographicZone,
      keywords,
      tone,
      objectives,
      email,
      emailNotification,
      companyContext
    } = req.body;

    // Validation des données requises (ajustée pour les nouveaux champs)
    if (!companyName || !websiteUrl) {
      return res.status(400).json({
        error: 'Données manquantes',
        required: ['companyName', 'websiteUrl']
      });
    }

    // Construire les données pour n8n avec gestion des nouveaux champs
    const n8nData = {
      companyName,
      websiteUrl,
      services: services || companyContext?.services || '',
      geographicZone: geographicZone || companyContext?.zones || '',
      keywords: keywords || '',
      tone: tone || 'professionnel',
      objectives: objectives || 'both',
      email: email || '',
      emailNotification: emailNotification || false
    };

    // Si on a des données de contexte, les inclure
    if (companyContext) {
      n8nData.companyKeywords = companyContext.companyKeywords || '';
      n8nData.specificities = companyContext.specificities || '';
    }

    console.log('Sending to n8n:', n8nData);
    console.log('n8n URL:', `${N8N_BASE_URL}${N8N_WEBHOOK_PATH}/seo-generation`);

    // Appel au webhook n8n avec timeout augmenté
    const response = await axios.post(
      `${N8N_BASE_URL}${N8N_WEBHOOK_PATH}/seo-generation`,
      n8nData,
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 300000 // 5 minutes
      }
    );

    console.log('n8n response:', response.data);
    res.json(response.data);
  } catch (error) {
    console.error('Erreur lors de la génération:', error.message);
    
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      res.status(error.response.status).json({
        error: error.response.data?.message || error.message || 'Erreur du webhook n8n',
        details: error.response.data
      });
    } else if (error.code === 'ECONNABORTED') {
      res.status(504).json({
        error: 'Timeout - La requête a pris trop de temps'
      });
    } else if (error.code === 'ECONNREFUSED') {
      res.status(503).json({
        error: 'Impossible de se connecter à n8n. Vérifiez que n8n est bien démarré.'
      });
    } else {
      res.status(500).json({
        error: 'Erreur serveur lors de la génération',
        message: error.message
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
        timeout: 10000 // 10 secondes pour le status
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
        timeout: 60000 // 1 minute pour le téléchargement
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

// IMPORTANT: Servir les fichiers statiques du frontend APRÈS les routes API
app.use(express.static(path.join(__dirname, 'public')));

// Route catch-all pour React (doit être après les routes API et le static)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Gestion globale des erreurs
app.use((err, req, res, next) => {
  console.error('Erreur globale:', err);
  res.status(500).json({
    error: 'Erreur serveur interne',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
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
