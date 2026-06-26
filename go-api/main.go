package main

import (
	"bytes"
	"encoding/json"
	"log"
	"net/http"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"gonum.org/v1/gonum/mat"
)

// MatrixRequest representa la entrada de la API
type MatrixRequest struct {
	Matrix [][]float64 `json:"matrix" validate:"required"`
}

// QRResponse representa la respuesta con las matrices Q y R
type QRResponse struct {
	Q [][]float64 `json:"q"`
	R [][]float64 `json:"r"`
}

// NodeAPIRequest estructura para enviar a Node.js
type NodeAPIRequest struct {
	Q [][]float64 `json:"q"`
	R [][]float64 `json:"r"`
}

// convertToMatrix convierte [][]float64 a *mat.Dense
func convertToMatrix(data [][]float64) (*mat.Dense, error) {
	if len(data) == 0 || len(data[0]) == 0 {
		return nil, fiber.NewError(fiber.StatusBadRequest, "La matriz no puede estar vacía")
	}

	rows := len(data)
	cols := len(data[0])

	// Validar que todas las filas tengan la misma longitud
	for _, row := range data {
		if len(row) != cols {
			return nil, fiber.NewError(fiber.StatusBadRequest, "Todas las filas deben tener la misma longitud")
		}
	}

	// Aplanar la matriz para gonum
	flatData := make([]float64, 0, rows*cols)
	for _, row := range data {
		flatData = append(flatData, row...)
	}

	return mat.NewDense(rows, cols, flatData), nil
}

// convertFromMatrix convierte *mat.Dense a [][]float64
func convertFromMatrix(m *mat.Dense) [][]float64 {
	rows, cols := m.Dims()
	result := make([][]float64, rows)
	
	for i := 0; i < rows; i++ {
		result[i] = make([]float64, cols)
		for j := 0; j < cols; j++ {
			result[i][j] = m.At(i, j)
		}
	}
	
	return result
}

// performQRFactorization realiza la factorización QR de una matriz
func performQRFactorization(matrix [][]float64) (*QRResponse, error) {
	// Convertir a matriz de gonum
	matrixDense, err := convertToMatrix(matrix)
	if err != nil {
		return nil, err
	}

	rows, cols := matrixDense.Dims()
	
	// Validar que la matriz tenga al menos tantas filas como columnas
	if rows < cols {
		return nil, fiber.NewError(fiber.StatusBadRequest, "La matriz debe tener al menos tantas filas como columnas para QR")
	}

	// Realizar factorización QR
	var qr mat.QR
	qr.Factorize(matrixDense)

	// Extraer matriz Q
	var q mat.Dense
	qr.QTo(&q)

	// Extraer matriz R
	var r mat.Dense
	qr.RTo(&r)

	return &QRResponse{
		Q: convertFromMatrix(&q),
		R: convertFromMatrix(&r),
	}, nil
}

// sendToNodeAPI envía las matrices Q y R a la API de Node.js
func sendToNodeAPI(qr *QRResponse) (map[string]interface{}, error) {
	nodeAPIURL := os.Getenv("NODE_API_URL")
	if nodeAPIURL == "" {
		nodeAPIURL = "http://node-api:3000/api/statistics"
	}

	payload := NodeAPIRequest{
		Q: qr.Q,
		R: qr.R,
	}

	jsonData, err := json.Marshal(payload)
	if err != nil {
		return nil, err
	}

	resp, err := http.Post(nodeAPIURL, "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fiber.NewError(fiber.StatusInternalServerError, "Error al comunicarse con Node.js API")
	}

	var result map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, err
	}

	return result, nil
}

func main() {
	app := fiber.New(fiber.Config{
		ErrorHandler: func(c *fiber.Ctx, err error) error {
			code := fiber.StatusInternalServerError
			message := err.Error()

			if e, ok := err.(*fiber.Error); ok {
				code = e.Code
			}

			return c.Status(code).JSON(fiber.Map{
				"error":   true,
				"message": message,
			})
		},
	})

	// Middleware
	app.Use(logger.New())
	app.Use(cors.New())

	// Health check
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status": "healthy",
			"service": "go-qr-api",
		})
	})

	// Endpoint principal: Factorización QR
	app.Post("/api/qr-factorization", func(c *fiber.Ctx) error {
		var req MatrixRequest
		
		if err := c.BodyParser(&req); err != nil {
			return fiber.NewError(fiber.StatusBadRequest, "Formato JSON inválido")
		}

		if len(req.Matrix) == 0 {
			return fiber.NewError(fiber.StatusBadRequest, "La matriz no puede estar vacía")
		}

		// Realizar factorización QR
		qr, err := performQRFactorization(req.Matrix)
		if err != nil {
			return err
		}

		// Enviar a Node.js API y obtener estadísticas
		statistics, err := sendToNodeAPI(qr)
		if err != nil {
			log.Printf("Error al comunicarse con Node.js API: %v", err)
			// Retornar solo QR si falla la comunicación con Node.js
			return c.JSON(fiber.Map{
				"success": true,
				"data": fiber.Map{
					"qr": qr,
					"statistics": nil,
					"warning": "No se pudieron calcular las estadísticas",
				},
			})
		}

		return c.JSON(fiber.Map{
			"success": true,
			"data": fiber.Map{
				"qr": qr,
				"statistics": statistics,
			},
		})
	})

	// Endpoint alternativo: Solo QR sin enviar a Node.js
	app.Post("/api/qr-only", func(c *fiber.Ctx) error {
		var req MatrixRequest
		
		if err := c.BodyParser(&req); err != nil {
			return fiber.NewError(fiber.StatusBadRequest, "Formato JSON inválido")
		}

		if len(req.Matrix) == 0 {
			return fiber.NewError(fiber.StatusBadRequest, "La matriz no puede estar vacía")
		}

		qr, err := performQRFactorization(req.Matrix)
		if err != nil {
			return err
		}

		return c.JSON(fiber.Map{
			"success": true,
			"data": qr,
		})
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("🚀 Servidor Go API iniciado en puerto %s", port)
	log.Fatal(app.Listen(":" + port))
}
