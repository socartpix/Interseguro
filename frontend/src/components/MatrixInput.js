import React, { useState } from 'react';
import '../styles/MatrixInput.css';

/**
 * Componente para entrada de matrices
 * Permite al usuario ingresar una matriz de forma manual o usar ejemplos predefinidos
 */
const MatrixInput = ({ onSubmit, loading }) => {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [matrix, setMatrix] = useState(
    Array(3).fill(null).map(() => Array(3).fill(''))
  );
  const [error, setError] = useState('');

  /**
   * Ajusta el tamaño de la matriz
   */
  const handleDimensionChange = (newRows, newCols) => {
    setRows(newRows);
    setCols(newCols);
    
    const newMatrix = Array(newRows).fill(null).map((_, i) =>
      Array(newCols).fill(null).map((_, j) => 
        matrix[i]?.[j] || ''
      )
    );
    setMatrix(newMatrix);
    setError('');
  };

  /**
   * Actualiza un valor de la matriz
   */
  const handleCellChange = (rowIndex, colIndex, value) => {
    const newMatrix = matrix.map((row, i) =>
      row.map((cell, j) => 
        i === rowIndex && j === colIndex ? value : cell
      )
    );
    setMatrix(newMatrix);
    setError('');
  };

  /**
   * Valida y envía la matriz
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Convertir a números y validar
    try {
      const numericMatrix = matrix.map((row, i) =>
        row.map((cell, j) => {
          if (cell === '' || cell === null) {
            throw new Error(`Celda vacía en posición [${i}][${j}]`);
          }
          const num = parseFloat(cell);
          if (isNaN(num)) {
            throw new Error(`Valor inválido en posición [${i}][${j}]`);
          }
          return num;
        })
      );

      // Validar que tenga al menos tantas filas como columnas para QR
      if (rows < cols) {
        throw new Error('La matriz debe tener al menos tantas filas como columnas para la factorización QR');
      }

      onSubmit(numericMatrix);
    } catch (err) {
      setError(err.message);
    }
  };

  /**
   * Carga un ejemplo predefinido
   */
  const loadExample = (exampleType) => {
    let exampleMatrix;
    let exampleRows, exampleCols;

    switch (exampleType) {
      case 'simple':
        exampleRows = 2;
        exampleCols = 2;
        exampleMatrix = [
          ['1', '2'],
          ['3', '4']
        ];
        break;
      case 'rectangular':
        exampleRows = 4;
        exampleCols = 3;
        exampleMatrix = [
          ['1', '2', '3'],
          ['4', '5', '6'],
          ['7', '8', '9'],
          ['10', '11', '12']
        ];
        break;
      case 'diagonal':
        exampleRows = 3;
        exampleCols = 3;
        exampleMatrix = [
          ['5', '0', '0'],
          ['0', '3', '0'],
          ['0', '0', '7']
        ];
        break;
      case 'identity':
        exampleRows = 3;
        exampleCols = 3;
        exampleMatrix = [
          ['1', '0', '0'],
          ['0', '1', '0'],
          ['0', '0', '1']
        ];
        break;
      default:
        return;
    }

    setRows(exampleRows);
    setCols(exampleCols);
    setMatrix(exampleMatrix);
    setError('');
  };

  /**
   * Limpia la matriz
   */
  const clearMatrix = () => {
    setMatrix(Array(rows).fill(null).map(() => Array(cols).fill('')));
    setError('');
  };

  return (
    <div className="matrix-input-container">
      <h2>📊 Entrada de Matriz</h2>
      
      {/* Controles de dimensión */}
      <div className="dimension-controls">
        <label>
          Filas:
          <input
            type="number"
            min="1"
            max="10"
            value={rows}
            onChange={(e) => handleDimensionChange(parseInt(e.target.value) || 1, cols)}
            disabled={loading}
          />
        </label>
        <label>
          Columnas:
          <input
            type="number"
            min="1"
            max="10"
            value={cols}
            onChange={(e) => handleDimensionChange(rows, parseInt(e.target.value) || 1)}
            disabled={loading}
          />
        </label>
      </div>

      {/* Ejemplos predefinidos */}
      <div className="examples">
        <p>Ejemplos rápidos:</p>
        <button onClick={() => loadExample('simple')} disabled={loading}>
          2×2 Simple
        </button>
        <button onClick={() => loadExample('rectangular')} disabled={loading}>
          4×3 Rectangular
        </button>
        <button onClick={() => loadExample('diagonal')} disabled={loading}>
          3×3 Diagonal
        </button>
        <button onClick={() => loadExample('identity')} disabled={loading}>
          3×3 Identidad
        </button>
        <button onClick={clearMatrix} disabled={loading} className="clear-btn">
          Limpiar
        </button>
      </div>

      {/* Grid de la matriz */}
      <form onSubmit={handleSubmit}>
        <div className="matrix-grid" style={{
          gridTemplateColumns: `repeat(${cols}, 1fr)`
        }}>
          {matrix.map((row, i) =>
            row.map((cell, j) => (
              <input
                key={`${i}-${j}`}
                type="text"
                value={cell}
                onChange={(e) => handleCellChange(i, j, e.target.value)}
                placeholder="0"
                disabled={loading}
                className="matrix-cell"
              />
            ))
          )}
        </div>

        {error && <div className="error-message">{error}</div>}

        <button 
          type="submit" 
          className="submit-btn"
          disabled={loading}
        >
          {loading ? '⏳ Calculando...' : '🚀 Calcular Factorización QR'}
        </button>
      </form>

      <div className="info-box">
        <p>ℹ️ <strong>Nota:</strong> La matriz debe tener al menos tantas filas como columnas (m ≥ n) para la factorización QR.</p>
      </div>
    </div>
  );
};

export default MatrixInput;
