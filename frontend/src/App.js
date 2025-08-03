import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle, AlertCircle, Download, Mail, Sparkles, Globe, Cog, Play, FileJson, FileText, Info } from 'lucide-react';

const API_URL = '/api';

const SEOGenerator = () => {
  const [formData, setFormData] = useState({
    companyName: '',
    websiteUrl: '',
    companyKeywords: '',
    services: '',
    specificities: '',
    companyZones: '',
    keywords: '',
    geographicZone: '',
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

  useEffect(() => {
    if (!document.getElementById('seo-styles')) {
      const style = document.createElement('style');
      style.id = 'seo-styles';
      style.textContent = `
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
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(0, 230, 118, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(0, 230, 118, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(0, 230, 118, 0); }
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
        
        .select-dropdown {
          background: rgba(30, 30, 40, 0.9);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .select-dropdown option {
          background: #1a1a2e;
          color: white;
          padding: 8px;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

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
      const dataToSend = {
        companyName: formData.companyName,
        websiteUrl: formData.websiteUrl,
        services: formData.services || formData.specificities,
        geographicZone: formData.companyZones || formData.geographicZone,
        keywords: formData.keywords,
        tone: formData.tone,
        objectives: formData.objectives,
        email: formData.email,
        emailNotification: formData.emailNotification,
        companyContext: {
          companyKeywords: formData.companyKeywords,
          services: formData.services,
          specificities: formData.specificities,
          zones: formData.companyZones
        }
      };

      const response = await fetch(`${API_URL}/generate-seo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
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

  const resetForm = () => {
    setSession(null);
    setStatus(null);
    setError(null);
    setFormData({
      companyName: '',
      websiteUrl: '',
      companyKeywords: '',
      services: '',
      specificities: '',
      companyZones: '',
      keywords: '',
      geographicZone: '',
      tone: 'professionnel',
      objectives: 'both',
      email: '',
      emailNotification: false
    });
  };

  const inputStyle = {
    width: '100%',
    padding: '16px 24px',
    borderRadius: '16px',
    color: 'white',
    fontSize: '16px',
    outline: 'none',
    transition: 'all 0.3s ease'
  };

  const textareaStyle = {
    ...inputStyle,
    minHeight: '80px',
    resize: 'vertical'
  };

  return (
    <div style={{
      minHeight: '100vh',
      padding: '16px',
      background: 'linear-gradient(-45deg, #667eea, #4b4fa2, #6c5ce7, #fd79a8)',
      backgroundSize: '400% 400%',
      animation: 'gradientBG 15s ease infinite',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute',
          width: '8px',
          height: '8px',
          background: 'white',
          opacity: 0.2,
          borderRadius: '50%',
          top: '10%',
          left: '10%',
          animation: 'floating 3s ease-in-out infinite'
        }}></div>
        <div style={{
          position: 'absolute',
          width: '12px',
          height: '12px',
          background: 'rgba(216, 180, 254, 0.3)',
          borderRadius: '50%',
          top: '20%',
          left: '80%',
          animation: 'floating 3s ease-in-out infinite',
          animationDelay: '1s'
        }}></div>
      </div>

      <div style={{ width: '100%', maxWidth: '1024px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px', paddingTop: '32px', animation: 'slideIn 0.5s ease-out' }}>
          <div className="glass" style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '80px',
            height: '80px',
            borderRadius: '16px',
            marginBottom: '24px',
            animation: 'floating 3s ease-in-out infinite'
          }}>
            <Sparkles size={40} color="white" />
          </div>
          <h1 style={{ fontSize: '48px', fontWeight: 'bold', color: 'white', marginBottom: '16px' }}>
            SEO Content Generator
          </h1>
          <p style={{ fontSize: '20px', color: 'rgba(255, 255, 255, 0.9)' }}>
            Générez 15 articles SEO optimisés. Simple, rapide, efficace
          </p>
        </div>

        <div className="glass" style={{
          borderRadius: '24px',
          padding: '32px',
          animation: 'slideIn 0.5s ease-out 0.2s both'
        }}>
          {!session ? (
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '32px' }}>
                <label style={{ display: 'block', color: 'white', fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
                  <Globe size={20} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
                  Informations de l'entreprise
                </label>
                <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Info size={16} />
                  Ces informations permettent à l'IA de mieux connaître votre entreprise pour personnaliser le contenu
                </p>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                  <input
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                    className="glass-dark"
                    style={inputStyle}
                    placeholder="Nom de l'entreprise"
                  />
                  
                  <input
                    type="url"
                    required
                    value={formData.websiteUrl}
                    onChange={(e) => setFormData({...formData, websiteUrl: e.target.value})}
                    className="glass-dark"
                    style={inputStyle}
                    placeholder="https://exemple.com"
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <textarea
                    value={formData.companyKeywords}
                    onChange={(e) => setFormData({...formData, companyKeywords: e.target.value})}
                    className="glass-dark"
                    style={textareaStyle}
                    placeholder="Mots-clés décrivant votre entreprise (collez votre liste ici)"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                  <textarea
                    value={formData.services}
                    onChange={(e) => setFormData({...formData, services: e.target.value})}
                    className="glass-dark"
                    style={textareaStyle}
                    placeholder="Services proposés (optionnel)"
                  />
                  
                  <textarea
                    value={formData.specificities}
                    onChange={(e) => setFormData({...formData, specificities: e.target.value})}
                    className="glass-dark"
                    style={textareaStyle}
                    placeholder="Spécificités de vos services (optionnel)"
                  />
                </div>

                <textarea
                  value={formData.companyZones}
                  onChange={(e) => setFormData({...formData, companyZones: e.target.value})}
                  className="glass-dark"
                  style={textareaStyle}
                  placeholder="Zones géographiques d'intervention (collez votre liste de villes/régions)"
                />
              </div>

              <div style={{ marginBottom: '32px' }}>
                <label style={{ display: 'block', color: 'white', fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
                  <Cog size={20} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
                  Paramètres SEO des articles
                </label>
                <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Info size={16} />
                  Définissez les mots-clés et zones géographiques à cibler dans vos articles SEO
                </p>

                <div style={{ marginBottom: '16px' }}>
                  <textarea
                    value={formData.keywords}
                    onChange={(e) => setFormData({...formData, keywords: e.target.value})}
                    className="glass-dark"
                    style={textareaStyle}
                    placeholder="Mots-clés SEO à cibler dans les articles"
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <textarea
                    value={formData.geographicZone}
                    onChange={(e) => setFormData({...formData, geographicZone: e.target.value})}
                    className="glass-dark"
                    style={textareaStyle}
                    placeholder="Zones géographiques à cibler dans les articles"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                  <select
                    value={formData.tone}
                    onChange={(e) => setFormData({...formData, tone: e.target.value})}
                    className="select-dropdown"
                    style={inputStyle}
                  >
                    <option value="professionnel">Ton professionnel</option>
                    <option value="amical">Ton amical</option>
                    <option value="expert">Ton expert</option>
                  </select>

                  <select
                    value={formData.objectives}
                    onChange={(e) => setFormData({...formData, objectives: e.target.value})}
                    className="select-dropdown"
                    style={inputStyle}
                  >
                    <option value="traffic">Objectif : Trafic</option>
                    <option value="conversion">Objectif : Conversion</option>
                    <option value="both">Objectif : Les deux</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '32px' }}>
                <label style={{ display: 'block', color: 'white', fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
                  <Mail size={20} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
                  Notification par email (optionnel)
                </label>
                
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="glass-dark"
                    style={{ ...inputStyle, flex: 1 }}
                    placeholder="contact@exemple.com"
                  />
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.emailNotification}
                      onChange={(e) => setFormData({...formData, emailNotification: e.target.checked})}
                      style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                    />
                    <span>Recevoir par email</span>
                  </label>
                </div>
              </div>

              {error && (
                <div style={{
                  marginBottom: '24px',
                  padding: '16px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #ff5252, #f44336)',
                  display: 'flex',
                  alignItems: 'center',
                  color: 'white',
                  gap: '8px'
                }}>
                  <AlertCircle size={20} />
                  <span>{error}</span>
                </div>
              )}

              <div style={{ textAlign: 'center' }}>
                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    fontWeight: 'bold',
                    padding: '16px 48px',
                    borderRadius: '16px',
                    fontSize: '18px',
                    border: 'none',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '12px',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                    opacity: isLoading ? 0.5 : 1
                  }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
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
            <>
              {status?.status !== 'completed' ? (
                <div className="glass-dark" style={{ padding: '24px', borderRadius: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <span style={{ color: 'white', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Loader2 size={20} style={{ animation: 'spin 1s linear infinite', color: '#667eea' }} />
                      <span>{status?.currentStep || 'Génération en cours...'}</span>
                    </span>
                    <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>{status?.progress || 0}%</span>
                  </div>
                  
                  <div style={{ width: '100%', height: '12px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '6px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      background: 'linear-gradient(90deg, #667eea, #764ba2, #6c5ce7)',
                      transition: 'width 0.3s ease',
                      width: `${status?.progress || 0}%`
                    }}></div>
                  </div>
                  
                  <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)' }}>
                    <div>⏱️ Temps écoulé: {getElapsedTime()}</div>
                    <div style={{ color: '#fff' }}>🔍 Session: {session.sessionId.substring(0, 8)}...</div>
                    <div style={{ color: '#fff' }}>📊 {status?.status || 'En cours'}</div>
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                    <h3 style={{ color: 'white', fontSize: '20px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle size={24} style={{ color: '#00e676' }} />
                      Génération terminée !
                    </h3>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#00e676', animation: 'pulse 2s infinite' }}></div>
                  </div>

                  {status.results && (
                    <>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                        <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px' }}>
                          <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'white', marginBottom: '4px' }}>
                            {status.results.summary.articlesGenerated}
                          </div>
                          <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px' }}>Articles générés</div>
                        </div>
                        <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px' }}>
                          <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'white', marginBottom: '4px' }}>
                            {status.results.summary.totalWords.toLocaleString()}
                          </div>
                          <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px' }}>Mots écrits</div>
                        </div>
                        <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px' }}>
                          <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'white', marginBottom: '4px' }}>
                            {status.results.summary.averageQuality}%
                          </div>
                          <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px' }}>Score qualité</div>
                        </div>
                        <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px' }}>
                          <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'white', marginBottom: '4px' }}>
                            {status.duration || getElapsedTime()}
                          </div>
                          <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px' }}>Durée totale</div>
                        </div>
                      </div>

                      {status.results.preview?.topArticles && (
                        <div style={{ marginBottom: '24px' }}>
                          <h4 style={{ color: 'white', fontWeight: '600', marginBottom: '12px' }}>Aperçu des articles générés :</h4>
                          {status.results.preview.topArticles.map((article, idx) => (
                            <div key={idx} className="glass-dark" style={{ padding: '16px', borderRadius: '12px', marginBottom: '12px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                <h5 style={{ color: 'white', fontWeight: '500', flex: 1 }}>{article.title}</h5>
                                <span style={{ color: '#4caf50', fontSize: '14px', marginLeft: '8px' }}>{article.quality}%</span>
                              </div>
                              <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px' }}>{article.excerpt}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                        <button
                          onClick={() => handleDownload('articles.json')}
                          style={{
                            padding: '16px 24px',
                            borderRadius: '16px',
                            fontSize: '18px',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '12px',
                            transition: 'all 0.3s ease',
                            color: 'white',
                            fontWeight: '600',
                            background: 'linear-gradient(135deg, #00e676 0%, #00c853 100%)'
                          }}
                        >
                          <FileJson size={20} />
                          <span>Télécharger Articles (JSON)</span>
                          <Download size={20} />
                        </button>

                        <button
                          onClick={() => handleDownload('strategy.md')}
                          style={{
                            padding: '16px 24px',
                            borderRadius: '16px',
                            fontSize: '18px',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '12px',
                            transition: 'all 0.3s ease',
                            color: 'white',
                            fontWeight: '600',
                            background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)'
                          }}
                        >
                          <FileText size={20} />
                          <span>Télécharger Stratégie (MD)</span>
                          <Download size={20} />
                        </button>
                      </div>

                      {status.results.emailSent && (
                        <div style={{
                          padding: '16px',
                          borderRadius: '16px',
                          background: 'linear-gradient(135deg, #4caf50, #388e3c)',
                          display: 'flex',
                          alignItems: 'center',
                          color: 'white',
                          gap: '8px',
                          marginBottom: '24px'
                        }}>
                          <Mail size={20} />
                          <span>Les fichiers ont été envoyés par email</span>
                        </div>
                      )}

                      <div style={{ textAlign: 'center' }}>
                        <button
                          onClick={resetForm}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'rgba(255, 255, 255, 0.7)',
                            cursor: 'pointer',
                            textDecoration: 'underline',
                            fontSize: '16px',
                            padding: '8px 16px',
                            transition: 'color 0.2s ease'
                          }}
                          onMouseOver={(e) => e.target.style.color = 'white'}
                          onMouseOut={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.7)'}
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

        <div style={{ textAlign: 'center', marginTop: '32px', color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px' }}>
          <p>© 2025 - SEO Content Generator</p>
        </div>
      </div>
    </div>
  );
};

export default SEOGenerator;
