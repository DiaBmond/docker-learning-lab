#!/bin/bash

echo "Network Isolation Tests"
echo "=========================="
echo ""

# Test 1: Frontend to Database (should fail)
echo "Testing: Frontend → Database"
docker exec web-frontend sh -c "ping -c 1 -W 2 database 2>&1" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "   FAIL: Frontend can reach database (security issue!)"
else
    echo "   PASS: Frontend blocked from database"
fi
echo ""

# Test 2: Frontend to Backend (should work)
echo "Testing: Frontend → Backend"
docker exec web-frontend sh -c "wget -q --timeout=2 -O- http://backend:3000/api/health" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "   PASS: Frontend can reach backend"
else
    echo "   FAIL: Frontend blocked from backend (wrong!)"
fi
echo ""

# Test 3: Backend to Database (should work) - Use API test instead
echo "Testing: Backend → Database"
RESPONSE=$(curl -s http://localhost:3000/api/users)
if echo "$RESPONSE" | grep -q '"count":4'; then
    echo "   PASS: Backend can reach database"
else
    echo "   FAIL: Backend blocked from database (wrong!)"
fi
echo ""

# Test 4: Database to Frontend (should fail)
echo "Testing: Database → Frontend"
docker exec postgres-db sh -c "ping -c 1 -W 2 frontend 2>&1" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "   FAIL: Database can reach frontend (security issue!)"
else
    echo "   PASS: Database blocked from frontend"
fi
echo ""

# Test 5: Database to Internet (should fail - internal network)
echo "Testing: Database → Internet"
docker exec postgres-db sh -c "ping -c 1 -W 2 8.8.8.8 2>&1" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "   FAIL: Database can reach internet (security issue!)"
else
    echo "   PASS: Database blocked from internet"
fi
echo ""

echo "=========================="
echo "Isolation Test Complete!"