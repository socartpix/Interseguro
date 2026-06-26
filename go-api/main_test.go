package main

import (
	"bytes"
	"encoding/json"
	"net/http/httptest"
	"testing"

	"github.com/gofiber/fiber/v2"
	"github.com/stretchr/testify/assert"
)

// TestConvertToMatrix prueba la conversión de [][]float64 a *mat.Dense
func TestConvertToMatrix(t *testing.T) {
	tests := []struct {
		name    string
		input   [][]float64
		wantErr bool
	}{
		{
			name:    "Matriz válida 2x2",
			input:   [][]float64{{1, 2}, {3, 4}},
			wantErr: false,
		},
		{
			name:    "Matriz vacía",
			input:   [][]float64{},
			wantErr: true,
		},
		{
			name:    "Matriz con filas de diferente longitud",
			input:   [][]float64{{1, 2}, {3, 4, 5}},
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result, err := convertToMatrix(tt.input)
			if tt.wantErr {
				assert.Error(t, err)
				assert.Nil(t, result)
			} else {
				assert.NoError(t, err)
				assert.NotNil(t, result)
			}
		})
	}
}

// TestPerformQRFactorization prueba la factorización QR
func TestPerformQRFactorization(t *testing.T) {
	tests := []struct {
		name    string
		matrix  [][]float64
		wantErr bool
	}{
		{
			name:    "Matriz 3x3 válida",
			matrix:  [][]float64{{1, 2, 3}, {4, 5, 6}, {7, 8, 9}},
			wantErr: false,
		},
	{
		name:    "Matriz 3x2 válida (más filas que columnas)",
		matrix:  [][]float64{{1, 2}, {3, 4}, {5, 6}},
		wantErr: false,
	},
		{
			name:    "Matriz con más columnas que filas (inválida)",
			matrix:  [][]float64{{1, 2, 3}},
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result, err := performQRFactorization(tt.matrix)
			if tt.wantErr {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
				assert.NotNil(t, result)
				assert.NotNil(t, result.Q)
				assert.NotNil(t, result.R)
			}
		})
	}
}

// TestHealthEndpoint prueba el endpoint /health
func TestHealthEndpoint(t *testing.T) {
	app := fiber.New()
	
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status":  "healthy",
			"service": "go-qr-api",
		})
	})

	req := httptest.NewRequest("GET", "/health", nil)
	resp, err := app.Test(req)

	assert.NoError(t, err)
	assert.Equal(t, 200, resp.StatusCode)

	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)
	
	assert.Equal(t, "healthy", result["status"])
	assert.Equal(t, "go-qr-api", result["service"])
}

// TestQROnlyEndpoint prueba el endpoint /api/qr-only
func TestQROnlyEndpoint(t *testing.T) {
	app := fiber.New()
	
	app.Post("/api/qr-only", func(c *fiber.Ctx) error {
		var req MatrixRequest
		if err := c.BodyParser(&req); err != nil {
			return fiber.NewError(fiber.StatusBadRequest, "Formato JSON inválido")
		}

		qr, err := performQRFactorization(req.Matrix)
		if err != nil {
			return err
		}

		return c.JSON(fiber.Map{
			"success": true,
			"data":    qr,
		})
	})

	tests := []struct {
		name           string
		payload        MatrixRequest
		expectedStatus int
	}{
		{
			name: "Matriz válida 2x2",
			payload: MatrixRequest{
				Matrix: [][]float64{{1, 2}, {3, 4}},
			},
			expectedStatus: 200,
		},
		{
			name: "Matriz vacía",
			payload: MatrixRequest{
				Matrix: [][]float64{},
			},
			expectedStatus: 400,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			body, _ := json.Marshal(tt.payload)
			req := httptest.NewRequest("POST", "/api/qr-only", bytes.NewReader(body))
			req.Header.Set("Content-Type", "application/json")

			resp, err := app.Test(req)
			assert.NoError(t, err)
			assert.Equal(t, tt.expectedStatus, resp.StatusCode)
		})
	}
}

// TestConvertFromMatrix prueba la conversión de *mat.Dense a [][]float64
func TestConvertFromMatrix(t *testing.T) {
	input := [][]float64{{1, 2}, {3, 4}}
	matrix, err := convertToMatrix(input)
	assert.NoError(t, err)

	result := convertFromMatrix(matrix)
	
	assert.Equal(t, len(input), len(result))
	assert.Equal(t, len(input[0]), len(result[0]))
	
	// Verificar valores
	for i := range input {
		for j := range input[i] {
			assert.Equal(t, input[i][j], result[i][j])
		}
	}
}
