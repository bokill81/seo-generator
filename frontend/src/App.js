import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle, AlertCircle, Download, Mail, Sparkles, Globe, Search, Target, FileJson, FileText, Play, Cog, Clock, TrendingUp } from 'lucide-react';

const API_URL = 'http://localhost:3001/api';

const SEOGenerator = () => {
  const [formData, setFormData] = useState({
    companyName: '',
    websiteUrl: '',
    services: '',
    geographicZone: '',
    keywords: '',
    tone: 'professionnel',
    objectives: 'both',
    email: '',
    emailNotification: false
  });

  const [session, setSession] = useState(null);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [startTime, setStartTime] = useState(null);

  // Polling du statut
  useEffect(() => {
    if (!session?.sessionId || !isPolling) return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`${API_URL}/status/${session.sessionId}`);
        if (response.ok) {
          const data = await response.json();
          setStatus(data);
          
          if (data.status === 'completed' || data.status === 'failed') {
            setIsPolling(false);
          }
        }
      } catch (err) {
        console.error('Erreur polling:', err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [session, isPolling]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    setStartTime(Date.now());

    try {
      const response = await fetch(`${API_URL}/generate-seo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la génération');
      }

      const data = await response.json();
      setSession(data);
      setIsPolling(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (fileType) => {
    if (!session?.sessionId) return;

    try {
      const response = await fetch(`${API_URL}/download/${session.sessionId}/${fileType}`);
      if (!response.ok) throw new Error('Erreur téléchargement');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileType === 'articles.json' ? 'articles_seo.json' : 'strategie_seo.md';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError('Erreur lors du téléchargement');
    }
  };

  const getElapsedTime = () => {
    if (!startTime) return '0m 0s';
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    return `${minutes}m ${seconds}s`;
  };

  return (
    <div className="min-h-screen p-4" style={{
      background: 'linear-gradient(-45deg, #667eea, #4b4fa2, #6c5ce7, #fd79a8)',
      backgroundSize: '400% 400%',
      animation: 'gradientBG 15s ease infinite'
    }}>
      <style jsx>{`
        @keyframes gradientBG {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes floating {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes progressShine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes pulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(0, 230, 118, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(0, 230, 118, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(0, 230, 118, 0); }
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .glass {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
        }
        
        .glass-dark {
          background: rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .floating {
          animation: floating 3s ease-in-out infinite;
        }
        
        .slide-in {
          animation: slideIn 0.5s ease-out;
        }
        
        .btn-gradient {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          transition: all 0.3s ease;
        }
        
        .btn-gradient:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
        }
        
        .progress-bar {
          background: linear-gradient(90deg, #667eea, #764ba2, #6c5ce7);
          transition: width 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        
        .progress-bar::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          animation: progressShine 2s ease-in-out infinite;
        }
        
        .loading-spinner {
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top: 3px solid #667eea;
          width: 24px;
          height: 24px;
          animation: spin 1s linear infinite;
          display: inline-block;
        }
        
        .pulse-dot {
          animation: pulse 2s infinite;
        }
        
        .download-btn {
          background: linear-gradient(135deg, #00e676 0%, #00c853 100%);
          transition: all 0.3s ease;
        }
        
        .download-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(0, 230, 118, 0.4);
        }
      `}</style>

      {/* Background particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-2 h-2 bg-white opacity-20 rounded-full floating" style={{ top: '10%', left: '10%' }}></div>
        <div className="absolute w-3 h-3 bg-purple-200 opacity-15 rounded-full floating" style={{ top: '20%', left: '80%', animationDelay: '1s' }}></div>
        <div className="absolute w-1 h-1 bg-pink-200 opacity-30 rounded-full floating" style={{ top: '80%', left: '20%', animationDelay: '2s' }}></div>
        <div className="absolute w-2 h-2 bg-blue-200 opacity-25 rounded-full floating" style={{ top: '60%', left: '70%', animationDelay: '1.5s' }}></div>
      </div>

      <div className="w-full max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 slide-in">
          <div className="inline-flex items-center justify-center w-20 h-20 glass rounded-2xl mb-6 floating">
            <Sparkles size={40} className="text-white" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">SEO Content Generator</h1>
          <p className="text-xl text-gray-200 opacity-90">Générez 15 articles SEO optimisés. Simple, rapide, efficace</p>
        </div>

        {/* Main Card */}
        <div className="glass rounded-3xl p-8 slide-in" style={{ animationDelay: '0.2s' }}>
          {!session ? (
            // Formulaire
            <form onSubmit={handleSubmit}>
              {/* Company Info Section */}
              <div className="mb-8">
                <label className="block text-white text-lg font-semibold mb-4">
                  <Globe className="inline mr-2" size={20} />
                  Informations de l'entreprise
                </label>
                
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={formData.companyName}
                      onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                      className="w-full px-6 py-4 glass-dark rounded-2xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="Nom de l'entreprise"
                    />
                  </div>
                  
                  <div className="relative">
                    <input
                      type="url"
                      required
                      value={formData.websiteUrl}
                      onChange={(e) => setFormData({...formData, websiteUrl: e.target.value})}
                      className="w-full px-6 py-4 glass-dark rounded-2xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="https://exemple.com"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={formData.services}
                      onChange={(e) => setFormData({...formData, services: e.target.value})}
                      className="w-full px-6 py-4 glass-dark rounded-2xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="Services (ex: Plomberie, Chauffage)"
                    />
                  </div>
                  
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={formData.geographicZone}
                      onChange={(e) => setFormData({...formData, geographicZone: e.target.value})}
                      className="w-full px-6 py-4 glass-dark rounded-2xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="Zone géographique (ex: Paris)"
                    />
                  </div>
                </div>
              </div>

              {/* SEO Settings Section */}
              <div className="mb-8">
                <label className="block text-white text-lg font-semibold mb-4">
                  <Cog className="inline mr-2" size={20} />
                  Paramètres SEO
                </label>

                <div className="mb-4">
                  <input
                    type="text"
                    value={formData.keywords}
                    onChange={(e) => setFormData({...formData, keywords: e.target.value})}
                    className="w-full px-6 py-4 glass-dark rounded-2xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                    placeholder="Mots-clés (optionnel, séparés par des virgules)"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <select
                      value={formData.tone}
                      onChange={(e) => setFormData({...formData, tone: e.target.value})}
                      className="w-full px-6 py-4 glass-dark rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    >
                      <option value="professionnel" className="bg-gray-800">Ton professionnel</option>
                      <option value="amical" className="bg-gray-800">Ton amical</option>
                      <option value="expert" className="bg-gray-800">Ton expert</option>
                    </select>
                  </div>

                  <div>
                    <select
                      value={formData.objectives}
                      onChange={(e) => setFormData({...formData, objectives: e.target.value})}
                      className="w-full px-6 py-4 glass-dark rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    >
                      <option value="traffic" className="bg-gray-800">Objectif : Trafic</option>
                      <option value="conversion" className="bg-gray-800">Objectif : Conversion</option>
                      <option value="both" className="bg-gray-800">Objectif : Les deux</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Email Notification Section */}
              <div className="mb-8">
                <label className="block text-white text-lg font-semibold mb-4">
                  <Mail className="inline mr-2" size={20} />
                  Notification par email (optionnel)
                </label>
                
                <div className="flex gap-4">
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="flex-1 px-6 py-4 glass-dark rounded-2xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="contact@exemple.com"
                  />
                  <label className="flex items-center gap-2 text-white cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.emailNotification}
                      onChange={(e) => setFormData({...formData, emailNotification: e.target.checked})}
                      className="w-5 h-5 rounded border-white/20 bg-white/10 text-purple-500 focus:ring-purple-500"
                    />
                    <span>Recevoir par email</span>
                  </label>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 rounded-2xl" style={{ background: 'linear-gradient(135deg, #ff5252, #f44336)' }}>
                  <div className="flex items-center text-white">
                    <AlertCircle className="mr-2" size={20} />
                    <span>{error}</span>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="text-center">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-gradient text-white font-bold py-4 px-12 rounded-2xl text-lg inline-flex items-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <div className="loading-spinner"></div>
                      <span>Génération en cours...</span>
                    </>
                  ) : (
                    <>
                      <Play size={20} />
                      <span>Démarrer la Génération</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            // Progress & Results
            <>
              {status?.status !== 'completed' ? (
                // Progress Section
                <div className="glass-dark rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-white font-semibold">
                      <Loader2 className="inline mr-2 animate-spin" size={20} style={{ color: '#667eea' }} />
                      <span>{status?.currentStep || 'Génération en cours...'}</span>
                    </span>
                    <span className="text-gray-300">{status?.progress || 0}%</span>
                  </div>
                  
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div 
                      className="progress-bar h-3 rounded-full"
                      style={{ width: `${status?.progress || 0}%` }}
                    ></div>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-3 gap-4 text-sm text-gray-300">
                    <div>⏱️ Temps écoulé: {getElapsedTime()}</div>
                    <div style={{ color: '#fff' }}>🔍 Session: {session.sessionId.substring(0, 8)}...</div>
                    <div style={{ color: '#fff' }}>📊 {status?.status || 'En cours'}</div>
                  </div>
                </div>
              ) : (
                // Results Section
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-white text-xl font-semibold">
                      <CheckCircle className="inline mr-2" size={24} style={{ color: '#00e676' }} />
                      Génération terminée !
                    </h3>
                    <div className="pulse-dot w-3 h-3 rounded-full" style={{ backgroundColor: '#00e676' }}></div>
                  </div>

                  {status.results && (
                    <>
                      {/* Stats Grid */}
                      <div className="grid md:grid-cols-4 gap-4 mb-6">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-white">{status.results.summary.articlesGenerated}</div>
                          <div className="text-gray-300 text-sm">Articles générés</div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-white">{status.results.summary.totalWords.toLocaleString()}</div>
                          <div className="text-gray-300 text-sm">Mots écrits</div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-white">{status.results.summary.averageQuality}%</div>
                          <div className="text-gray-300 text-sm">Score qualité</div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-white">{status.duration || getElapsedTime()}</div>
                          <div className="text-gray-300 text-sm">Durée totale</div>
                        </div>
                      </div>

                      {/* Preview */}
                      {status.results.preview?.topArticles && (
                        <div className="mb-6 space-y-3">
                          <h4 className="text-white font-semibold mb-3">Aperçu des articles :</h4>
                          {status.results.preview.topArticles.map((article, idx) => (
                            <div key={idx} className="glass-dark rounded-xl p-4">
                              <div className="flex justify-between items-start mb-2">
                                <h5 className="text-white font-medium flex-1">{article.title}</h5>
                                <span className="text-green-400 text-sm ml-2">{article.quality}%</span>
                              </div>
                              <p className="text-gray-300 text-sm">{article.excerpt}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Download Buttons */}
                      <div className="grid md:grid-cols-2 gap-4 mb-6">
                        <button
                          onClick={() => handleDownload('articles.json')}
                          className="download-btn text-white font-bold py-4 px-6 rounded-2xl text-lg inline-flex items-center justify-center space-x-3"
                        >
                          <FileJson size={20} />
                          <span>Télécharger Articles (JSON)</span>
                          <Download size={20} />
                        </button>

                        <button
                          onClick={() => handleDownload('strategy.md')}
                          className="text-white font-bold py-4 px-6 rounded-2xl text-lg inline-flex items-center justify-center space-x-3"
                          style={{ background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)' }}
                        >
                          <FileText size={20} />
                          <span>Télécharger Stratégie (MD)</span>
                          <Download size={20} />
                        </button>
                      </div>

                      {status.results.emailSent && (
                        <div className="p-4 rounded-2xl mb-6" style={{ background: 'linear-gradient(135deg, #4caf50, #388e3c)' }}>
                          <div className="flex items-center text-white">
                            <Mail className="mr-2" size={20} />
                            <span>Les fichiers ont été envoyés par email</span>
                          </div>
                        </div>
                      )}

                      {/* New Generation Button */}
                      <div className="text-center">
                        <button
                          onClick={() => {
                            setSession(null);
                            setStatus(null);
                            setError(null);
                            setFormData({
                              companyName: '',
                              websiteUrl: '',
                              services: '',
                              geographicZone: '',
                              keywords: '',
                              tone: 'professionnel',
                              objectives: 'both',
                              email: '',
                              emailNotification: false
                            });
                          }}
                          className="text-purple-300 hover:text-white transition-colors duration-200 underline"
                        >
                          Nouvelle génération
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-300 opacity-70">
          <p>© 2025 - SEO Content Generator</p>
        </div>
      </div>
    </div>
  );
};

export default SEOGenerator;