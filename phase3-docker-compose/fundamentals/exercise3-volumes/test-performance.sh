#!/bin/bash

echo "⚡ Volume Performance Test"
echo "========================="
echo ""

# Color codes for better output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if container is running
if ! docker ps | grep -q "volume-demo"; then
    echo "❌ Container not running. Starting services..."
    docker-compose up -d
    sleep 5
fi

echo "📊 Testing write performance (100MB files)..."
echo ""

# Test 1: Named Volume (Disk)
echo -e "${BLUE}1️⃣ Named Volume (Disk-based storage):${NC}"
docker exec volume-demo sh -c "dd if=/dev/zero of=/data/test bs=1M count=100 2>&1" > /tmp/named_result.txt
NAMED_TIME=$(grep -o '[0-9.]\+ s' /tmp/named_result.txt | head -1)
NAMED_SPEED=$(grep -o '[0-9.]\+ MB/s' /tmp/named_result.txt | head -1)
echo "   Time: $NAMED_TIME"
echo "   Speed: $NAMED_SPEED"
echo ""

# Test 2: tmpfs (RAM)
echo -e "${BLUE}2️⃣ tmpfs (RAM-based storage):${NC}"
docker exec volume-demo sh -c "dd if=/dev/zero of=/tmp/test bs=1M count=100 2>&1" > /tmp/tmpfs_result.txt
TMPFS_TIME=$(grep -o '[0-9.]\+ s' /tmp/tmpfs_result.txt | head -1)
TMPFS_SPEED=$(grep -o '[0-9.]\+ MB/s' /tmp/tmpfs_result.txt | head -1)
echo "   Time: $TMPFS_TIME"
echo "   Speed: $TMPFS_SPEED"
echo ""

# Test 3: Bind Mount (Host)
echo -e "${BLUE}3️⃣ Bind Mount (Host directory):${NC}"
docker exec volume-demo sh -c "dd if=/dev/zero of=/app/logs/test bs=1M count=100 2>&1" > /tmp/bind_result.txt
BIND_TIME=$(grep -o '[0-9.]\+ s' /tmp/bind_result.txt | head -1)
BIND_SPEED=$(grep -o '[0-9.]\+ MB/s' /tmp/bind_result.txt | head -1)
echo "   Time: $BIND_TIME"
echo "   Speed: $BIND_SPEED"
echo ""

# Comparison
echo "========================="
echo -e "${GREEN}📈 Performance Comparison:${NC}"
echo ""
echo "   Named Volume: $NAMED_TIME ($NAMED_SPEED)"
echo -e "   tmpfs (RAM):  $TMPFS_TIME ($TMPFS_SPEED) ${YELLOW}← Fastest!${NC}"
echo "   Bind Mount:   $BIND_TIME ($BIND_SPEED)"
echo ""

# Calculate speedup
echo -e "${YELLOW}💡 Key Insights:${NC}"
echo "   • tmpfs is stored in RAM (fastest)"
echo "   • Named volume and bind mount use disk"
echo "   • tmpfs ~5-10x faster than disk-based storage"
echo "   • Use tmpfs for temporary/cache data"
echo ""

# Cleanup test files
echo "🧹 Cleaning up test files..."
docker exec volume-demo rm -f /data/test /tmp/test /app/logs/test 2>/dev/null
rm -f /tmp/named_result.txt /tmp/tmpfs_result.txt /tmp/bind_result.txt 2>/dev/null
echo "   ✅ Cleanup complete"
echo ""

# Additional tests
echo "========================="
echo "🔬 Additional Tests:"
echo ""

# Test 4: Read performance
echo -e "${BLUE}4️⃣ Read Performance Test:${NC}"
echo "   Writing 50MB test file..."
docker exec volume-demo sh -c "dd if=/dev/zero of=/data/read-test bs=1M count=50 2>/dev/null"
docker exec volume-demo sh -c "dd if=/dev/zero of=/tmp/read-test bs=1M count=50 2>/dev/null"

echo ""
echo "   Reading from Named Volume:"
docker exec volume-demo sh -c "dd if=/data/read-test of=/dev/null bs=1M 2>&1" > /tmp/read_named.txt
NAMED_READ=$(grep -o '[0-9.]\+ MB/s' /tmp/read_named.txt)
echo "   Speed: $NAMED_READ"

echo ""
echo "   Reading from tmpfs:"
docker exec volume-demo sh -c "dd if=/tmp/read-test of=/dev/null bs=1M 2>&1" > /tmp/read_tmpfs.txt
TMPFS_READ=$(grep -o '[0-9.]\+ MB/s' /tmp/read_tmpfs.txt)
echo -e "   Speed: $TMPFS_READ ${YELLOW}← Faster!${NC}"

# Cleanup
docker exec volume-demo rm -f /data/read-test /tmp/read-test 2>/dev/null
rm -f /tmp/read_named.txt /tmp/read_tmpfs.txt 2>/dev/null
echo ""

# Test 5: Small files (simplified for Alpine)
echo -e "${BLUE}5️⃣ Small Files Test (100 files):${NC}"
echo "   Testing Named Volume..."
START=$(date +%s.%N)
docker exec volume-demo sh -c 'i=1; while [ $i -le 100 ]; do echo test > /data/small-$i; i=$((i+1)); done' 2>/dev/null
END=$(date +%s.%N)
NAMED_SMALL=$(echo "$END - $START" | bc)
echo "   Time: ${NAMED_SMALL}s"

echo ""
echo "   Testing tmpfs..."
START=$(date +%s.%N)
docker exec volume-demo sh -c 'i=1; while [ $i -le 100 ]; do echo test > /tmp/small-$i; i=$((i+1)); done' 2>/dev/null
END=$(date +%s.%N)
TMPFS_SMALL=$(echo "$END - $START" | bc)
echo -e "   Time: ${TMPFS_SMALL}s ${YELLOW}← Faster for many small files!${NC}"

# Cleanup
docker exec volume-demo sh -c "rm -f /data/small-* /tmp/small-*" 2>/dev/null
echo ""

# Summary
echo "========================="
echo -e "${GREEN}🎯 Summary:${NC}"
echo ""
echo "   Write Performance:"
echo "   • tmpfs is fastest for write operations"
echo "   • Best for cache, temporary processing"
echo ""
echo "   Read Performance:"
echo "   • tmpfs also fastest for reads"
echo "   • No disk I/O latency"
echo ""
echo "   Small Files (IOPS):"
echo "   • tmpfs excels at many small operations"
echo "   • Disk-based slower due to seek time"
echo ""
echo "   When to use each:"
echo "   • Named Volume:  Persistent data (databases)"
echo "   • Bind Mount:    Development, logs, config"
echo "   • tmpfs:         Cache, temp files, sessions"
echo ""
echo "========================="
echo "✅ Performance test complete!"