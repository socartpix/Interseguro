# Interseguro Challenge - Sistema QR Factorization

Sistema completo de factorización QR con tres servicios: Frontend React, API Go (Fiber) y API Node.js (Express), completamente dockerizado.

---

##  Contenido

1. [Arquitectura](#arquitectura)
2. [Instalación](#instalación)
3. [Endpoints](#endpoints)
4. [Testing](#testing)
5. [Estructura del Proyecto](#estructura-del-proyecto)
6. [Ejemplos de Uso](#ejemplos-de-uso)

---

##  Arquitectura

### Componentes

```
┌────────────────────────────────────┐
│    Frontend React (Port 3002)      │
│    - Entrada de matrices           │
│    - Visualización de resultados   │
└─────────────┬──────────────────────┘
              │
    ┌─────────┴──────────┐
    │                    │
┌───▼─────────┐  ┌───────▼──────────┐
│  Go API     │  │  Node.js API     │
│  (Port 8080)│──▶  (Port 3001)     │
│             │  │                  │
│  - QR       │  │  - Estadísticas  │
│  - Fiber    │  │  - Express       │
└─────────────┘  └──────────────────┘
       │                  │
       └────────┬─────────┘
                │
    ┌───────────▼────────────┐
    │  interseguro-network   │
    │    Docker Bridge       │
    └────────────────────────┘
```

### Flujo de Datos

1. **Usuario** → Ingresa matriz en Frontend
2. **Frontend** → POST a Go API (`/api/qr-factorization`)
3. **Go API** → Calcula QR y envía a Node.js API
4. **Node.js API** → Calcula estadísticas (max, min, avg, sum, diagonal)
5. **Go API** → Devuelve QR + estadísticas al Frontend
6. **Frontend** → Muestra resultados visuales

### Tecnologías

| Capa | Tecnología | Puerto |
|------|-----------|--------|
| Frontend | React 18 + Nginx | 3002 |
| Backend 1 | Go 1.21 + Fiber | 8080 |
| Backend 2 | Node.js 18 + Express | 3001 |
| Contenedor | Docker + Docker Compose | - |
| Network | Bridge Network | - |

---

##  Instalación

### Requisitos

- Docker
- Docker Compose

### Iniciar Servicios

```bash
# Clonar repositorio
git clone <repository-url>
cd interseguro_challenge

# Levantar servicios
docker-compose up -d --build

# Verificar estado
docker-compose ps
```

### Verificar Health

```bash
curl http://localhost:8080/health  # Go API
curl http://localhost:3001/health  # Node.js API
curl http://localhost:3002         # Frontend
```

### Acceder

- **Frontend**: http://localhost:3002
- **Go API**: http://localhost:8080
- **Node.js API**: http://localhost:3001

---

##  Endpoints

### Go API

#### 1. POST `/api/qr-factorization`
Factorización QR completa con estadísticas.

**Request:**
```json
{
  "matrix": [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "qr": {
      "q": [[...]],
      "r": [[...]]
    },
    "statistics": {
      "combined": {
        "max": 9,
        "min": 1,
        "average": 5,
        "sum": 45,
        "isDiagonal": false
      },
      "q": {...},
      "r": {...}
    }
  }
}
```

#### 2. POST `/api/qr-only`
Solo factorización QR (sin estadísticas).

#### 3. GET `/health`
Health check.

### Node.js API

#### 1. POST `/api/statistics`
Calcula estadísticas de matrices Q y R.

**Request:**
```json
{
  "q": [[1, 2], [3, 4]],
  "r": [[5, 6], [7, 8]]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "combined": {
      "max": 8,
      "min": 1,
      "average": 4.5,
      "sum": 36,
      "isDiagonal": false,
      "diagonalDetails": [...]
    },
    "q": {...},
    "r": {...}
  }
}
```

#### 2. GET `/health`
Health check.

---

##  Testing

### Go API Tests

```bash
# Con Docker Compose
docker-compose --profile test run --rm go-api-test

# Alternativa con Docker
cd go-api
docker run --rm -v "$(pwd):/app" -w /app golang:1.21-alpine sh -c "go mod tidy && go test -v -cover"
```

**Casos de prueba:**
- ✅ Conversión de matrices (válidas, vacías, irregulares)
- ✅ Factorización QR (3x3, 2x3, casos inválidos)
- ✅ Endpoints HTTP (health, qr-only)
- ✅ Conversión mat.Dense a [][]float64

**Cobertura**: 35.6%

### Node.js API Tests

```bash
# Con Docker Compose
docker-compose --profile test run --rm node-api-test

# Alternativa con Docker
cd node-api
docker run --rm -v "$(pwd):/app" -w /app node:18-alpine sh -c "npm install && npm test"
```

**Casos de prueba:**
- ✅ Health check
- ✅ Estadísticas (max, min, avg, sum, diagonal)
- ✅ Validación de entrada (vacías, negativas, decimales)
- ✅ Funciones de utilidad

**Tests**: 13 passing

---

##  Estructura del Proyecto

```
interseguro_challenge/
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── MatrixInput.js       # Entrada de matrices
│   │   │   ├── MatrixDisplay.js     # Visualización
│   │   │   └── Statistics.js        # Stats visuales
│   │   ├── services/
│   │   │   └── api.js               # Servicios HTTP
│   │   ├── styles/                  # CSS modules
│   │   ├── App.js
│   │   └── index.js
│   ├── Dockerfile                   # Multi-stage con Nginx
│   ├── nginx.conf
│   └── package.json
├── go-api/
│   ├── main.go                      # API Fiber + QR
│   ├── main_test.go                 # Tests con testify
│   ├── go.mod
│   └── Dockerfile                   # Alpine multi-stage
├── node-api/
│   ├── src/
│   │   ├── index.js                 # API Express + Stats
│   │   └── index.test.js            # Tests con Jest
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml               # Orquestación + tests
├── DOCUMENTATION.md                 # Este archivo
└── Test.http                        # Ejemplos HTTP
```

---

##  Ejemplos de Uso

### Ejemplo 1: Matriz 2x2

```bash
curl -X POST http://localhost:8080/api/qr-factorization \
  -H "Content-Type: application/json" \
  -d '{
    "matrix": [
      [1, 2],
      [3, 4]
    ]
  }'
```

### Ejemplo 2: Matriz Diagonal

```bash
curl -X POST http://localhost:8080/api/qr-factorization \
  -H "Content-Type: application/json" \
  -d '{
    "matrix": [
      [5, 0, 0],
      [0, 3, 0],
      [0, 0, 7]
    ]
  }'
```

### Ejemplo 3: Matriz 4x3

```bash
curl -X POST http://localhost:8080/api/qr-factorization \
  -H "Content-Type: application/json" \
  -d '{
    "matrix": [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
      [10, 11, 12]
    ]
  }'
```

### Ejemplo 4: Estadísticas Directas

```bash
curl -X POST http://localhost:3001/api/statistics \
  -H "Content-Type: application/json" \
  -d '{
    "q": [[1, 2], [3, 4]],
    "r": [[5, 6], [7, 8]]
  }'
```

---

## 🐳 Comandos Docker

### Gestión de Servicios

```bash
# Ver logs en tiempo real
docker-compose logs -f

# Ver logs de un servicio
docker-compose logs -f go-api

# Reiniciar servicios
docker-compose restart

# Detener servicios
docker-compose down

# Reconstruir sin caché
docker-compose build --no-cache
docker-compose up -d
```

### Monitoreo

```bash
# Estado de contenedores
docker-compose ps

# Estadísticas de recursos
docker stats interseguro-go-api interseguro-node-api interseguro-frontend

# Inspeccionar red
docker network inspect interseguro-network
```

### Ejecutar Comandos Dentro de Contenedores

```bash
# Go API
docker exec -it interseguro-go-api sh

# Node.js API
docker exec -it interseguro-node-api sh

# Frontend
docker exec -it interseguro-frontend sh
```

---

##  Variables de Entorno

### Go API
- `PORT`: Puerto del servidor (default: 8080)
- `NODE_API_URL`: URL de Node.js API (default: http://node-api:3000/api/statistics)

### Node.js API
- `PORT`: Puerto del servidor (default: 3000)
- `NODE_ENV`: Entorno (default: production)

### Frontend
- Build-time: `REACT_APP_GO_API_URL` y `REACT_APP_NODE_API_URL`

---

## ⚡ Características Implementadas

### Frontend
- ✅ Grid dinámico para matrices
- ✅ Ejemplos predefinidos (2×2, 4×3, diagonal, identidad)
- ✅ Visualización con brackets matemáticos
- ✅ Estadísticas con tarjetas visuales
- ✅ Responsive design
- ✅ Validación en tiempo real

### Go API
- ✅ Factorización QR con gonum/mat
- ✅ Validación de matrices
- ✅ Comunicación HTTP con Node.js
- ✅ CORS habilitado
- ✅ Health checks
- ✅ Error handling robusto

### Node.js API
- ✅ Cálculo de estadísticas (max, min, avg, sum)
- ✅ Detección de matriz diagonal
- ✅ Validación con express-validator
- ✅ CORS habilitado
- ✅ Health checks
- ✅ Logging con Morgan

### Docker
- ✅ Multi-stage builds (optimización)
- ✅ Network bridge personalizada
- ✅ Health checks automáticos
- ✅ Restart policies
- ✅ Servicios de test con profiles

---

##  Estadísticas Calculadas

La API Node.js calcula:

1. **Valor Máximo**: Máximo en matrices Q y R
2. **Valor Mínimo**: Mínimo en matrices Q y R
3. **Promedio**: Media aritmética de todos los valores
4. **Suma Total**: Suma de todos los elementos
5. **Matriz Diagonal**: Verifica si alguna matriz es diagonal (elementos no diagonales = 0)

Devuelve estadísticas para:
- **Combined**: Q + R juntas
- **Q**: Solo matriz Q
- **R**: Solo matriz R

---

##  Clean Code Practices

### Aplicadas en el Proyecto

- ✅ Nombres descriptivos de variables y funciones
- ✅ Funciones pequeñas con responsabilidad única
- ✅ Separación de concerns (lógica/presentación)
- ✅ Comentarios JSDoc y Go comments
- ✅ Validación explícita de entrada
- ✅ Error handling consistente
- ✅ Middleware reutilizables (CORS, logging)
- ✅ Tests unitarios con casos edge
- ✅ DRY (Don't Repeat Yourself)

---

##  Manejo de Errores

### Errores Comunes

**1. Matriz vacía**
```json
{"error": true, "message": "La matriz no puede estar vacía"}
```

**2. Formato JSON inválido**
```json
{"error": true, "message": "Formato JSON inválido"}
```

**3. Matriz no rectangular**
```json
{"error": true, "message": "Todas las filas deben tener la misma longitud"}
```

**4. Error de comunicación entre APIs**
```json
{
  "success": true,
  "data": {
    "qr": {...},
    "statistics": null,
    "warning": "No se pudieron calcular las estadísticas"
  }
}
```

---

##  Estado del Proyecto

| Requisito | Estado |
|-----------|--------|
| API Go (Fiber + QR) | ✅ Completo |
| API Node.js (Express + Stats) | ✅ Completo |
| Frontend React | ✅ Completo |
| Docker + Networks | ✅ Completo |
| HTTP Communication | ✅ Completo |
| Clean Code | ✅ Completo |
| Documentación | ✅ Completo |
| Tests Unitarios | ✅ Completo |
| JWT Authentication | ❌ No implementado (opcional) |
| Cloud Deployment | ❌ No implementado (opcional) |

---

##  Troubleshooting

### Puerto ya en uso
```bash
# Cambiar en docker-compose.yml
ports:
  - "8081:8080"  # En lugar de 8080:8080
```

### Contenedores no inician
```bash
docker-compose logs
docker-compose logs | grep -i error
```

### Limpiar Docker completamente
```bash
docker-compose down
docker system prune -a  # CUIDADO: elimina todo
```

### Tests fallan en Docker
```bash
# Verificar que COPY incluya todos los archivos
COPY . .  # No solo src/
```

## ✅ Checklist Pre-Producción

- [x] Todos los servicios corriendo
- [x] Health checks funcionando
- [x] Tests pasando (Go y Node.js)
- [x] Comunicación entre servicios operativa
- [x] Frontend conectado a APIs
- [x] Validación de entrada implementada
- [x] Error handling robusto
- [x] Logs configurados
- [x] Docker optimizado (multi-stage)
- [x] Documentación completa

---
## Temas pendientes
  JWT(Falta de tiempo)
  Cloud(Se podria usar ngrok o vercel pero no se pudo por falta de tiempo)
**Proyecto**: Interseguro Challenge  
**Stack**: React + Go + Node.js + Docker  
**Última actualización**: Diciembre 2025  
**Status**: ✅ Producción Ready
