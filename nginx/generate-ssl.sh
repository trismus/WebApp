#!/bin/bash

# Generate self-signed SSL certificate for development

CERT_DIR="./nginx/ssl"
mkdir -p "$CERT_DIR"

echo "Generating self-signed SSL certificate for development..."

openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout "$CERT_DIR/key.pem" \
    -out "$CERT_DIR/cert.pem" \
    -subj "/C=DE/ST=State/L=City/O=WebApp/CN=localhost"

echo "SSL certificate generated successfully!"
echo "Certificate: $CERT_DIR/cert.pem"
echo "Private Key: $CERT_DIR/key.pem"
echo ""
echo "Note: This is a self-signed certificate for development only."
echo "Your browser will show a security warning - this is normal."
