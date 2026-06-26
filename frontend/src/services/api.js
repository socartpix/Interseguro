import axios from 'axios';

// Configuración de URLs de las APIs
const GO_API_URL = process.env.REACT_APP_GO_API_URL || 'http://localhost:8080';
const NODE_API_URL = process.env.REACT_APP_NODE_API_URL || 'http://localhost:3001';

/**
 * Servicio para comunicación con la API Go
 */
export const goApiService = {
  /**
   * Verifica el estado de salud de la API Go
   * @returns {Promise} Estado de salud
   */
  checkHealth: async () => {
    try {
      const response = await axios.get(`${GO_API_URL}/health`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    }
  },

  /**
   * Realiza la factorización QR de una matriz
   * @param {Array<Array<number>>} matrix - Matriz de entrada
   * @returns {Promise} Resultado de la factorización QR y estadísticas
   */
  performQRFactorization: async (matrix) => {
    try {
      const response = await axios.post(`${GO_API_URL}/api/qr-factorization`, {
        matrix
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    }
  },

  /**
   * Realiza solo la factorización QR (sin estadísticas)
   * @param {Array<Array<number>>} matrix - Matriz de entrada
   * @returns {Promise} Resultado de la factorización QR
   */
  performQROnly: async (matrix) => {
    try {
      const response = await axios.post(`${GO_API_URL}/api/qr-only`, {
        matrix
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    }
  }
};

/**
 * Servicio para comunicación con la API Node.js
 */
export const nodeApiService = {
  /**
   * Verifica el estado de salud de la API Node.js
   * @returns {Promise} Estado de salud
   */
  checkHealth: async () => {
    try {
      const response = await axios.get(`${NODE_API_URL}/health`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    }
  },

  /**
   * Calcula estadísticas de matrices Q y R
   * @param {Object} qrData - Objeto con matrices Q y R
   * @returns {Promise} Estadísticas calculadas
   */
  calculateStatistics: async (qrData) => {
    try {
      const response = await axios.post(`${NODE_API_URL}/api/statistics`, qrData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    }
  }
};
