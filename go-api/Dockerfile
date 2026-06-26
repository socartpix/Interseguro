# Build stage
FROM golang:1.21-alpine AS builder

WORKDIR /app

# Copiar todo el código fuente
COPY . .

# Descargar dependencias y compilar
RUN go mod tidy && \
    CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main .

# Runtime stage
FROM alpine:latest

RUN apk --no-cache add ca-certificates

WORKDIR /root/

# Copiar el binario desde el builder
COPY --from=builder /app/main .

# Exponer puerto
EXPOSE 8080

# Ejecutar la aplicación
CMD ["./main"]
