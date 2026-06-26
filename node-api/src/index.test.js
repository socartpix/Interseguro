const request = require('supertest');
const express = require('express');

// Importar funciones para testear
// (En un proyecto real, estas estarían en módulos separados)

/**
 * Configuración de la app para testing
 */
const createTestApp = () => {
  const app = express();
  app.use(express.json());

  // Funciones de utilidad
  const calculateMax = (matrix) => {
    let max = -Infinity;
    for (const row of matrix) {
      for (const value of row) {
        if (value > max) max = value;
      }
    }
    return max;
  };

  const calculateMin = (matrix) => {
    let min = Infinity;
    for (const row of matrix) {
      for (const value of row) {
        if (value < min) min = value;
      }
    }
    return min;
  };

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

  const calculateSum = (matrix) => {
    let sum = 0;
    for (const row of matrix) {
      for (const value of row) {
        sum += value;
      }
    }
    return sum;
  };

  const isDiagonal = (matrix) => {
    if (!matrix || matrix.length === 0) return false;
    const rows = matrix.length;
    const cols = matrix[0].length;
    if (rows !== cols) return false;
    
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (i !== j && Math.abs(matrix[i][j]) > 1e-10) {
          return false;
        }
      }
    }
    return true;
  };

  // Endpoints
  app.get('/health', (req, res) => {
    res.json({
      status: 'healthy',
      service: 'node-statistics-api'
    });
  });

  app.post('/api/statistics', (req, res) => {
    const { q, r } = req.body;

    if (!q || !r || q.length === 0 || r.length === 0) {
      return res.status(400).json({
        error: true,
        message: 'Las matrices Q y R no pueden estar vacías'
      });
    }

    const qStats = {
      max: calculateMax(q),
      min: calculateMin(q),
      average: calculateAverage(q),
      sum: calculateSum(q),
      isDiagonal: isDiagonal(q)
    };

    const rStats = {
      max: calculateMax(r),
      min: calculateMin(r),
      average: calculateAverage(r),
      sum: calculateSum(r),
      isDiagonal: isDiagonal(r)
    };

    res.json({
      success: true,
      data: {
        q: qStats,
        r: rStats
      }
    });
  });

  return app;
};

// ==================== TESTS ====================

describe('Node.js Statistics API', () => {
  let app;

  beforeEach(() => {
    app = createTestApp();
  });

  // ===== Tests de Health Check =====
  describe('GET /health', () => {
    it('debería retornar status healthy', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('service', 'node-statistics-api');
    });
  });

  // ===== Tests de Estadísticas =====
  describe('POST /api/statistics', () => {
    it('debería calcular estadísticas para matrices válidas', async () => {
      const payload = {
        q: [[1, 2], [3, 4]],
        r: [[5, 6], [7, 8]]
      };

      const response = await request(app)
        .post('/api/statistics')
        .send(payload)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('q');
      expect(response.body.data).toHaveProperty('r');
    });

    it('debería calcular el máximo correctamente', async () => {
      const payload = {
        q: [[1, 2], [3, 4]],
        r: [[5, 6], [7, 8]]
      };

      const response = await request(app)
        .post('/api/statistics')
        .send(payload)
        .expect(200);

      expect(response.body.data.q.max).toBe(4);
      expect(response.body.data.r.max).toBe(8);
    });

    it('debería calcular el mínimo correctamente', async () => {
      const payload = {
        q: [[1, 2], [3, 4]],
        r: [[5, 6], [7, 8]]
      };

      const response = await request(app)
        .post('/api/statistics')
        .send(payload)
        .expect(200);

      expect(response.body.data.q.min).toBe(1);
      expect(response.body.data.r.min).toBe(5);
    });

    it('debería calcular el promedio correctamente', async () => {
      const payload = {
        q: [[2, 4], [6, 8]],
        r: [[10, 20], [30, 40]]
      };

      const response = await request(app)
        .post('/api/statistics')
        .send(payload)
        .expect(200);

      expect(response.body.data.q.average).toBe(5); // (2+4+6+8)/4
      expect(response.body.data.r.average).toBe(25); // (10+20+30+40)/4
    });

    it('debería calcular la suma correctamente', async () => {
      const payload = {
        q: [[1, 2], [3, 4]],
        r: [[5, 6], [7, 8]]
      };

      const response = await request(app)
        .post('/api/statistics')
        .send(payload)
        .expect(200);

      expect(response.body.data.q.sum).toBe(10); // 1+2+3+4
      expect(response.body.data.r.sum).toBe(26); // 5+6+7+8
    });

    it('debería detectar matriz diagonal', async () => {
      const payload = {
        q: [[5, 0], [0, 3]],
        r: [[1, 2], [3, 4]]
      };

      const response = await request(app)
        .post('/api/statistics')
        .send(payload)
        .expect(200);

      expect(response.body.data.q.isDiagonal).toBe(true);
      expect(response.body.data.r.isDiagonal).toBe(false);
    });

    it('debería rechazar matrices vacías', async () => {
      const payload = {
        q: [],
        r: [[1, 2]]
      };

      const response = await request(app)
        .post('/api/statistics')
        .send(payload)
        .expect(400);

      expect(response.body.error).toBe(true);
      expect(response.body.message).toContain('vacías');
    });

    it('debería manejar matrices con valores negativos', async () => {
      const payload = {
        q: [[-1, -2], [-3, -4]],
        r: [[5, 6], [7, 8]]
      };

      const response = await request(app)
        .post('/api/statistics')
        .send(payload)
        .expect(200);

      expect(response.body.data.q.max).toBe(-1);
      expect(response.body.data.q.min).toBe(-4);
      expect(response.body.data.q.sum).toBe(-10);
    });

    it('debería manejar matrices con decimales', async () => {
      const payload = {
        q: [[1.5, 2.5], [3.5, 4.5]],
        r: [[5.1, 6.2], [7.3, 8.4]]
      };

      const response = await request(app)
        .post('/api/statistics')
        .send(payload)
        .expect(200);

      expect(response.body.data.q.sum).toBeCloseTo(12, 1);
      expect(response.body.data.r.sum).toBeCloseTo(27, 1);
    });
  });

  // ===== Tests de Funciones de Utilidad =====
  describe('Utility Functions', () => {
    const calculateMax = (matrix) => {
      let max = -Infinity;
      for (const row of matrix) {
        for (const value of row) {
          if (value > max) max = value;
        }
      }
      return max;
    };

    const isDiagonal = (matrix) => {
      if (!matrix || matrix.length === 0) return false;
      const rows = matrix.length;
      const cols = matrix[0].length;
      if (rows !== cols) return false;
      
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          if (i !== j && Math.abs(matrix[i][j]) > 1e-10) {
            return false;
          }
        }
      }
      return true;
    };

    it('calculateMax debería encontrar el máximo', () => {
      expect(calculateMax([[1, 5], [3, 2]])).toBe(5);
      expect(calculateMax([[-5, -1], [-10, -2]])).toBe(-1);
    });

    it('isDiagonal debería detectar matrices diagonales', () => {
      expect(isDiagonal([[1, 0], [0, 1]])).toBe(true);
      expect(isDiagonal([[5, 0, 0], [0, 3, 0], [0, 0, 7]])).toBe(true);
      expect(isDiagonal([[1, 2], [0, 1]])).toBe(false);
    });

    it('isDiagonal debería rechazar matrices no cuadradas', () => {
      expect(isDiagonal([[1, 0, 0], [0, 1, 0]])).toBe(false);
    });
  });
});
