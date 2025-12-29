#!/bin/bash

echo "Testing Volume Types"
echo "======================"
echo ""

# Test 1: Named Volume
echo "Testing Named Volume (Persistent)"
curl -s -X POST http://localhost:3000/api/named-volume/write \
  -H "Content-Type: application/json" \
  -d '{"data": "Test data"}' > /dev/null

RESULT=$(curl -s http://localhost:3000/api/named-volume/read | jq -r '.success')
if [ "$RESULT" = "true" ]; then
  echo "   Named volume: Write/Read works"
else
  echo "   Named volume: Failed"
fi
echo ""

# Test 2: Bind Mount (Logs)
echo "Testing Bind Mount - Logs"
curl -s -X POST http://localhost:3000/api/bind-mount/log \
  -H "Content-Type: application/json" \
  -d '{"message": "Test log"}' > /dev/null

if [ -f logs/app.log ]; then
  echo "   Bind mount: Log file created on host"
else
  echo "   Bind mount: Log file not found"
fi
echo ""

# Test 3: Bind Mount (Config)
echo "Testing Bind Mount - Config (Read-only)"
RESULT=$(curl -s http://localhost:3000/api/config | jq -r '.success')
if [ "$RESULT" = "true" ]; then
  echo "   Config: Readable"
else
  echo "   Config: Failed to read"
fi

docker exec volume-demo sh -c "echo 'test' > /etc/config/test.txt" 2>&1 | grep -q "Read-only"
if [ $? -eq 0 ]; then
  echo "   Config: Read-only enforced"
else
  echo "   Config: Read-only not enforced"
fi
echo ""

# Test 4: tmpfs
echo "Testing tmpfs (RAM storage)"
curl -s -X POST http://localhost:3000/api/tmpfs/write \
  -H "Content-Type: application/json" \
  -d '{"data": "Temp data"}' > /dev/null

RESULT=$(curl -s http://localhost:3000/api/tmpfs/read | jq -r '.success')
if [ "$RESULT" = "true" ]; then
  echo "   tmpfs: Write/Read works"
else
  echo "   tmpfs: Failed"
fi

docker exec volume-demo df -h /tmp | grep -q "tmpfs"
if [ $? -eq 0 ]; then
  echo "   tmpfs: Mounted in RAM"
else
  echo "   tmpfs: Not in RAM"
fi
echo ""

# Test 5: Persistence
echo "Testing Persistence"
echo "   Restarting container..."
docker-compose restart app > /dev/null 2>&1
sleep 5

RESULT=$(curl -s http://localhost:3000/api/named-volume/read | jq -r '.success')
if [ "$RESULT" = "true" ]; then
  echo "   Named volume: Data persisted after restart"
else
  echo "   Named volume: Data lost"
fi

RESULT=$(curl -s http://localhost:3000/api/tmpfs/read | jq -r '.success')
if [ "$RESULT" = "false" ]; then
  echo "   tmpfs: Data cleared after restart (expected)"
else
  echo "   tmpfs: Data persisted (unexpected)"
fi

echo ""
echo "======================"
echo "Volume Tests Complete!"