const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { body, validationResult } = require('express-validator');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

/**
 * Calcula el valor máximo de una matriz
 * @param {number[][]} matrix - Matriz de números
 * @returns {number} Valor máximo
 */
const calculateMax = (matrix) => {
  let max = -Infinity;
  for (const row of matrix) {
    for (const value of row) {
      if (value > max) max = value;
    }
  }
  return max;
};

/**
 * Calcula el valor mínimo de una matriz
 * @param {number[][]} matrix - Matriz de números
 * @returns {number} Valor mínimo
 */
const calculateMin = (matrix) => {
  let min = Infinity;
  for (const row of matrix) {
    for (const value of row) {
      if (value < min) min = value;
    }
  }
  return min;
};

/**
 * Calcula el promedio de todos los valores de una matriz
 * @param {number[][]} matrix - Matriz de números
 * @returns {number} Promedio
 */
const calculateAverage = (matrix) => {
  let sum = 0;
  let count = 0;
  
  for (const row of matrix) {
    for (const value of row) {
      sum += value;
      count++;
    }
  }
  
  return count > 0 ? sum / count : 0;
};

/**
 * Calcula la suma total de todos los valores de una matriz
 * @param {number[][]} matrix - Matriz de números
 * @returns {number} Suma total
 */
const calculateSum = (matrix) => {
  let sum = 0;
  
  for (const row of matrix) {
    for (const value of row) {
      sum += value;
    }
  }
  
  return sum;
};

/**
 * Verifica si una matriz es diagonal
 * Una matriz es diagonal si todos los elementos fuera de la diagonal principal son cero
 * @param {number[][]} matrix - Matriz de números
 * @returns {boolean} true si es diagonal, false en caso contrario
 */
const isDiagonal = (matrix) => {
  if (!matrix || matrix.length === 0) return false;
  
  const rows = matrix.length;
  const cols = matrix[0].length;
  
  // Una matriz diagonal debe ser cuadrada
  if (rows !== cols) return false;
  
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      // Si no está en la diagonal principal y no es cero, no es diagonal
      if (i !== j && Math.abs(matrix[i][j]) > 1e-10) {
        return false;
      }
    }
  }
  
  return true;
};

/**
 * Calcula estadísticas combinadas de múltiples matrices
 * @param {number[][][]} matrices - Array de matrices
 * @returns {Object} Objeto con todas las estadísticas
 */
const calculateStatistics = (matrices) => {
  // Combinar todas las matrices en una sola para cálculos globales
  const allValues = [];
  
  for (const matrix of matrices) {
    for (const row of matrix) {
      allValues.push(...row);
    }
  }
  
  // Crear una matriz temporal con todos los valores para cálculos
  const combinedMatrix = [allValues];
  
  // Calcular estadísticas
  const max = calculateMax(combinedMatrix);
  const min = calculateMin(combinedMatrix);
  const average = calculateAverage(combinedMatrix);
  const sum = calculateSum(combinedMatrix);
  
  // Verificar si alguna de las matrices es diagonal
  const diagonalCheck = matrices.map((matrix, index) => ({
    [`matrix_${index}`]: isDiagonal(matrix)
  }));
  
  const hasDiagonal = matrices.some(matrix => isDiagonal(matrix));
  
  return {
    max,
    min,
    average,
    sum,
    isDiagonal: hasDiagonal,
    diagonalDetails: diagonalCheck
  };
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'node-statistics-api'
  });
});

// Endpoint principal para calcular estadísticas
app.post('/api/statistics', [
  body('q').isArray().withMessage('Q debe ser un array'),
  body('r').isArray().withMessage('R debe ser un array')
], (req, res) => {
  try {
    // Validar errores de entrada
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: true,
        message: 'Datos de entrada inválidos',
        details: errors.array()
      });
    }

    const { q, r } = req.body;

    // Validar que las matrices no estén vacías
    if (!q || !r || q.length === 0 || r.length === 0) {
      return res.status(400).json({
        error: true,
        message: 'Las matrices Q y R no pueden estar vacías'
      });
    }

    // Validar estructura de matrices
    if (!Array.isArray(q[0]) || !Array.isArray(r[0])) {
      return res.status(400).json({
        error: true,
        message: 'Las matrices deben ser arrays bidimensionales'
      });
    }

    // Calcular estadísticas para ambas matrices
    const statistics = calculateStatistics([q, r]);

    // Estadísticas individuales por matriz
    const qStats = {
      max: calculateMax(q),
      min: calculateMin(q),
      average: calculateAverage(q),
      sum: calculateSum(q),
      isDiagonal: isDiagonal(q),
      dimensions: {
        rows: q.length,
        cols: q[0].length
      }
    };

    const rStats = {
      max: calculateMax(r),
      min: calculateMin(r),
      average: calculateAverage(r),
      sum: calculateSum(r),
      isDiagonal: isDiagonal(r),
      dimensions: {
        rows: r.length,
        cols: r[0].length
      }
    };

    res.json({
      success: true,
      data: {
        combined: statistics,
        q: qStats,
        r: rStats
      }
    });

  } catch (error) {
    console.error('Error al calcular estadísticas:', error);
    res.status(500).json({
      error: true,
      message: 'Error interno al calcular estadísticas',
      details: error.message
    });
  }
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    error: true,
    message: 'Ruta no encontrada'
  });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: true,
    message: 'Error interno del servidor',
    details: err.message
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor Node.js API iniciado en puerto ${PORT}`);
});

module.exports = app;
