import React, { useState, useEffect } from 'react';
import MatrixInput from './components/MatrixInput';
import MatrixDisplay from './components/MatrixDisplay';
import Statistics from './components/Statistics';
import { goApiService } from './services/api';
import './styles/App.css';

/**
 * Componente principal de la aplicación
 */
function App() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [apiStatus, setApiStatus] = useState({ go: 'checking', node: 'checking' });

  /**
   * Verifica el estado de las APIs al montar el componente
   */
  useEffect(() => {
    checkAPIsHealth();
  }, []);

  /**
   * Verifica que ambas APIs estén activas
   */
  const checkAPIsHealth = async () => {
    try {
      const goHealth = await goApiService.checkHealth();
      setApiStatus(prev => ({
        ...prev,
        go: goHealth.success ? 'online' : 'offline'
      }));
    } catch (error) {
      setApiStatus(prev => ({ ...prev, go: 'offline' }));
    }
  };

  /**
   * Maneja el envío de la matriz y obtiene resultados
   */
  const handleMatrixSubmit = async (matrix) => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      // Llamar a la API Go para factorización QR y estadísticas
      const response = await goApiService.performQRFactorization(matrix);

      if (response.success) {
        setResult(response.data);
        setApiStatus(prev => ({ ...prev, go: 'online', node: 'online' }));
      } else {
        setError(response.error || 'Error al procesar la matriz');
      }
    } catch (err) {
      setError('Error de conexión con las APIs. Verifica que estén activas.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Limpia los resultados y permite nueva entrada
   */
  const handleReset = () => {
    setResult(null);
    setError('');
  };

  return (
    <div className="App">
      {/* Header */}
      <header className="app-header">
        <h1>QR Factorization Calculator</h1>
        <p className="subtitle">Sistema de Factorización QR y Análisis Estadístico</p>
        
        {/* Indicadores de estado de las APIs */}
        <div className="api-status">
          <div className={`status-indicator ${apiStatus.go}`}>
            <span className="status-dot"></span>
            Go API: {apiStatus.go}
          </div>
          <div className={`status-indicator ${apiStatus.node}`}>
            <span className="status-dot"></span>
            Node.js API: {apiStatus.node}
          </div>
        </div>
      </header>

      <main className="app-main">
        {/* Entrada de Matriz */}
        <section className="input-section">
          <MatrixInput onSubmit={handleMatrixSubmit} loading={loading} />
        </section>

        {/* Mensajes de Error */}
        {error && (
          <section className="error-section">
            <div className="error-alert">
              <span className="error-icon">⚠️</span>
              <div>
                <strong>Error:</strong> {error}
              </div>
            </div>
          </section>
        )}

        {/* Resultados */}
        {result && result.data && (
          <>
            <section className="results-section">
              <div className="section-header">
                <h2>Resultados de la Factorización QR</h2>
                <button onClick={handleReset} className="reset-btn">
                  🔄 Nueva Matriz
                </button>
              </div>

              {/* Explicación de QR */}
              <div className="info-card">
                <h3>¿Qué es la Factorización QR?</h3>
                <p>
                  La factorización QR descompone una matriz <strong>A</strong> en el producto de dos matrices:
                </p>
                <ul>
                  <li><strong>Q</strong>: Matriz ortogonal (Q<sup>T</sup>Q = I)</li>
                  <li><strong>R</strong>: Matriz triangular superior</li>
                </ul>
                <p className="formula">A = Q × R</p>
              </div>

              {/* Matrices Q y R */}
              <div className="matrices-container">
                {result.data.qr && (
                  <>
                    <MatrixDisplay 
                      matrix={result.data.qr.q} 
                      title="Matriz Q (Ortogonal)" 
                      highlight={true}
                    />
                    <MatrixDisplay 
                      matrix={result.data.qr.r} 
                      title="Matriz R (Triangular Superior)" 
                      highlight={true}
                    />
                  </>
                )}
              </div>
            </section>

            {/* Estadísticas */}
            {result.data.statistics && (
              <section className="statistics-section">
                <Statistics statistics={result.data.statistics} />
              </section>
            )}


 
          </>
        )}

        {/* Información cuando no hay resultados */}
        {!result && !error && !loading && (
          <section className="welcome-section">
            <div className="welcome-card">
              
              <p>
                Esta aplicación realiza la <strong>factorización QR</strong> de matrices 
                y calcula estadísticas detalladas sobre los resultados.
              </p>
              <h3>¿Cómo usar?</h3>
              <ol>
                <li>Define las dimensiones de tu matriz (filas × columnas)</li>
                <li>Ingresa los valores en cada celda</li>
                <li>Opcionalmente, usa los ejemplos predefinidos</li>
                <li>Presiona "Calcular Factorización QR"</li>
                <li>Visualiza las matrices Q, R y sus estadísticas</li>
              </ol>
              <div className="tech-stack">
                <h4>🛠️ Tecnologías</h4>
                <div className="tech-badges">
                  <span className="badge">React</span>
                  <span className="badge">Go (Fiber)</span>
                  <span className="badge">Node.js (Express)</span>
                  <span className="badge">Docker</span>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>
          Desarrollado para <strong>Interseguro Challenge</strong> | 
          Factorización QR con Go & Node.js
        </p>
        <p className="footer-links">
          <a href="https://github.com/socartpix/interseguro_challenge" target="_blank" rel="noopener noreferrer">
            📦 GitHub Repository
          </a>
        </p>
      </footer>
    </div>
  );
}

export default App;
