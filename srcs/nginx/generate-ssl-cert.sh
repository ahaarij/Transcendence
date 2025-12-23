#!/bin/bash
# generates self-signed ssl certificates for development
# production should use let's encrypt or commercial certificates

# creates ssl directory if it doesn't exist
mkdir -p ssl

# generates private key and self-signed certificate
# valid for 365 days with minimal user interaction
openssl req -x509 \
    -nodes \
    -days 365 \
    -newkey rsa:2048 \
    -keyout ssl/server.key \
    -out ssl/server.crt \
    -subj "/C=US/ST=State/L=City/O=Transcendence/OU=Dev/CN=localhost" \
    -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"

# sets proper permissions on private key
chmod 600 ssl/server.key
chmod 644 ssl/server.crt

echo "✅ ssl certificates generated successfully!"
echo "   - certificate: ssl/server.crt"
echo "   - private key: ssl/server.key"
echo ""
echo "⚠️  note: these are self-signed certificates for development only"
echo "   browsers will show security warnings - this is normal"
echo "   for production, use let's encrypt or commercial certificates"
