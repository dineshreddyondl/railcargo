#!/bin/bash
echo "�� Deploying RailCargo Backend..."
docker stop railcargo-backend 2>/dev/null || true
docker rm railcargo-backend 2>/dev/null || true
docker build -t railcargo-backend .
docker run -d --name railcargo-backend --restart unless-stopped -p 3001:3001 railcargo-backend
echo "✅ Deployment complete!"
curl -s http://localhost:3001/api/health || echo "⚠️ Health check failed"
