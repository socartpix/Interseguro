# Interseguro Challenge - QR Factorization System

Sistema de factorización QR de matrices con tres servicios dockerizados: Frontend React, API Go (Fiber) y API Node.js (Express).

## Inicio

```bash
docker-compose up -d --build
```

**Acceso:**
- Frontend: http://localhost:3002
- Go API: http://localhost:8080
- Node.js API: http://localhost:3001

## Arquitectura

```
Frontend (React) → Go API (QR Factorization) → Node.js API (Statistics)
```

## Ejemplo de Uso

```bash
curl -X POST http://localhost:8080/api/qr-factorization \
  -H "Content-Type: application/json" \
  -d '{"matrix": [[1,2],[3,4]]}'
```

## 🧪 Tests

```bash
docker-compose --profile test run --rm go-api-test
docker-compose --profile test run --rm node-api-test
```

## Documentación Completa

Ver [DOCUMENTATION.md](./DOCUMENTATION.md)

---

**Stack:** React + Go + Node.js + Docker  
**Status:** ✅ Production Ready
