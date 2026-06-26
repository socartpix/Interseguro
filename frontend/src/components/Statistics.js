import React from 'react';
import '../styles/Statistics.css';

/**
 * Componente para mostrar estadísticas de matrices
 */
const Statistics = ({ statistics }) => {
  if (!statistics) {
    return null;
  }

  const { combined, q, r } = statistics.data || statistics;

  /**
   * Formatea un número para visualización
   */
  const formatNumber = (num) => {
    if (typeof num !== 'number') return num;
    return Math.abs(num) < 0.0001 ? '0.0000' : num.toFixed(4);
  };

  /**
   * Renderiza una tarjeta de estadística individual
   */
  const StatCard = ({ title, value, icon, highlight = false }) => (
    <div className={`stat-card ${highlight ? 'highlight' : ''}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-content">
        <div className="stat-label">{title}</div>
        <div className="stat-value">{value}</div>
      </div>
    </div>
  );

  return (
    <div className="statistics-container">
      <h2>📈 Estadísticas</h2>

      {/* Estadísticas Combinadas */}
      {combined && (
        <div className="stats-section">
          <h3>📊 Estadísticas Globales (Q + R)</h3>
          <div className="stats-grid">
            <StatCard 
              title="Máximo" 
              value={formatNumber(combined.max)} 
              icon="📈"
            />
            <StatCard 
              title="Mínimo" 
              value={formatNumber(combined.min)} 
              icon="📉"
            />
            <StatCard 
              title="Promedio" 
              value={formatNumber(combined.average)} 
              icon="➗"
            />
            <StatCard 
              title="Suma Total" 
              value={formatNumber(combined.sum)} 
              icon="➕"
            />
            <StatCard 
              title="¿Es Diagonal?" 
              value={combined.isDiagonal ? '✅ Sí' : '❌ No'} 
              icon="🔲"
              highlight={combined.isDiagonal}
            />
          </div>
        </div>
      )}

      {/* Estadísticas de Matriz Q */}
      {q && (
        <div className="stats-section">
          <h3>🔵 Matriz Q</h3>
          <div className="stats-grid">
            <StatCard 
              title="Máximo" 
              value={formatNumber(q.max)} 
              icon="📈"
            />
            <StatCard 
              title="Mínimo" 
              value={formatNumber(q.min)} 
              icon="📉"
            />
            <StatCard 
              title="Promedio" 
              value={formatNumber(q.average)} 
              icon="➗"
            />
            <StatCard 
              title="Suma Total" 
              value={formatNumber(q.sum)} 
              icon="➕"
            />
            <StatCard 
              title="¿Es Diagonal?" 
              value={q.isDiagonal ? '✅ Sí' : '❌ No'} 
              icon="🔲"
              highlight={q.isDiagonal}
            />
          </div>
          {q.dimensions && (
            <div className="dimension-info">
              Dimensión: {q.dimensions.rows} × {q.dimensions.cols}
            </div>
          )}
        </div>
      )}

      {/* Estadísticas de Matriz R */}
      {r && (
        <div className="stats-section">
          <h3>🔴 Matriz R</h3>
          <div className="stats-grid">
            <StatCard 
              title="Máximo" 
              value={formatNumber(r.max)} 
              icon="📈"
            />
            <StatCard 
              title="Mínimo" 
              value={formatNumber(r.min)} 
              icon="📉"
            />
            <StatCard 
              title="Promedio" 
              value={formatNumber(r.average)} 
              icon="➗"
            />
            <StatCard 
              title="Suma Total" 
              value={formatNumber(r.sum)} 
              icon="➕"
            />
            <StatCard 
              title="¿Es Diagonal?" 
              value={r.isDiagonal ? '✅ Sí' : '❌ No'} 
              icon="🔲"
              highlight={r.isDiagonal}
            />
          </div>
          {r.dimensions && (
            <div className="dimension-info">
              Dimensión: {r.dimensions.rows} × {r.dimensions.cols}
            </div>
          )}
        </div>
      )}

      {/* Información sobre matrices diagonales */}
      {combined?.diagonalDetails && (
        <div className="info-box">
          <h4>ℹ️ Detalle de Matrices Diagonales</h4>
          {combined.diagonalDetails.map((detail, index) => {
            const key = Object.keys(detail)[0];
            const isDiag = detail[key];
            return (
              <div key={index} className="diagonal-detail">
                <span className={isDiag ? 'success' : 'error'}>
                  {key}: {isDiag ? '✅ Es diagonal' : '❌ No es diagonal'}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Statistics;
