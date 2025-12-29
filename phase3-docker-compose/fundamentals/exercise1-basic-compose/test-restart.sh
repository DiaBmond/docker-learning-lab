#!/bin/bash

echo "1) Triggering crash..."
curl -s http://localhost:3000/api/crash | jq '.'
echo ""

echo "2) Checking status after crash..."
sleep 5
docker-compose ps
echo ""

echo "3) Waiting for container to restart..."
sleep 10

echo "4) Verifying service is back:"
curl -s http://localhost:3000/api/health | jq '{status, uptime}'
echo ""

echo "5) Restart count:"
docker inspect api-server --format='{{.RestartCount}}'
echo ""

echo "6) Recent logs:"
docker-compose logs --tail=10 backend
echo ""

echo "✔ Test complete!"

