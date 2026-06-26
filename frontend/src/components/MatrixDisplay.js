import React from 'react';
import '../styles/MatrixDisplay.css';

/**
 * Componente para mostrar matrices de forma visual
 */
const MatrixDisplay = ({ matrix, title, highlight = false }) => {
  if (!matrix || matrix.length === 0) {
    return null;
  }

  /**
   * Formatea un número para mostrar con 4 decimales
   */
  const formatNumber = (num) => {
    if (typeof num !== 'number') return num;
    return Math.abs(num) < 0.0001 ? '0.0000' : num.toFixed(4);
  };

  return (
    <div className={`matrix-display ${highlight ? 'highlight' : ''}`}>
      <h3>{title}</h3>
      <div className="matrix-wrapper">
        <div className="matrix-bracket left">[</div>
        <div className="matrix-content">
          {matrix.map((row, i) => (
            <div key={i} className="matrix-row">
              {row.map((cell, j) => (
                <div key={j} className="matrix-cell">
                  {formatNumber(cell)}
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="matrix-bracket right">]</div>
      </div>
      <div className="matrix-info">
        Dimensión: {matrix.length} × {matrix[0].length}
      </div>
    </div>
  );
};

export default MatrixDisplay;
