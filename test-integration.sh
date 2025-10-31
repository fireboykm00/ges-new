#!/bin/bash

# Test script to verify GES application integration

echo "Testing GES Restaurant Stock Management System Integration"

# Test backend health
echo "1. Testing backend health..."
curl -s http://localhost:8080/actuator/health | grep -q '"status":"UP"' && echo "✓ Backend is healthy" || echo "✗ Backend health check failed"

# Test user registration
echo "2. Testing user registration..."
REG_RESPONSE=$(curl -s -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"integrationtest","password":"testpass123"}')
  
echo "$REG_RESPONSE" | grep -q '"message":"User registered successfully"' && echo "✓ User registration successful" || echo "✗ User registration failed"

# Extract token from registration response
TOKEN=$(echo "$REG_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

# Test user login
echo "3. Testing user login..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"integrationtest","password":"testpass123"}')
  
echo "$LOGIN_RESPONSE" | grep -q '"role":"STAFF"' && echo "✓ User login successful" || echo "✗ User login failed"

# Extract token from login response
TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

# Test protected endpoint access
echo "4. Testing protected endpoint access..."
STOCKS_RESPONSE=$(curl -s -X GET http://localhost:8080/api/stocks \
  -H "Authorization: Bearer $TOKEN")
  
echo "$STOCKS_RESPONSE" | grep -q '\[\]' && echo "✓ Protected endpoint access successful" || echo "✗ Protected endpoint access failed"

# Test frontend availability
echo "5. Testing frontend availability..."
FRONTEND_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5173)
  
[ "$FRONTEND_RESPONSE" = "200" ] && echo "✓ Frontend is available" || echo "✗ Frontend is not available"

echo "Integration test completed!"