#!/bin/bash

# Configuration
AUTH_API="http://localhost:8000"
GATEWAY_API="http://localhost:8080"
ORDER_API="http://localhost:9002"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo "Starting verification..."

# 1. Signup Customer
echo "1. Signing up Customer..."
TIMESTAMP=$(date +%s)
EMAIL="customer_${TIMESTAMP}@test.com"
PASSWORD="password"

curl -s -X POST "$AUTH_API/membership/sign-up" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\",
    \"firstName\": \"Test\",
    \"lastName\": \"Customer\",
    \"phoneNumber\": \"1234567890\",
    \"birthDate\": \"1990-01-01\"
  }"
echo ""

# 2. Login Customer
echo "2. Logging in Customer..."
LOGIN_RESPONSE=$(curl -s -X POST "$AUTH_API/membership/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\"
  }")

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
# USER_ID is not returned in login response, but not needed for place order as it's extracted from token

if [ -z "$TOKEN" ]; then
  echo -e "${RED}Failed to login customer${NC}"
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi
echo "Customer Token received."

# 3. Place Order (via Gateway)
echo "3. Placing Order..."
# Note: Gateway placeOrder endpoint uses SecurityContext to get userId.
# It calls order-api. createOrder(userId).
ORDER_RESPONSE=$(curl -v -X POST "$GATEWAY_API/api/orders" \
  -H "Authorization: Bearer $TOKEN" 2>&1)

ORDER_ID=$(echo $ORDER_RESPONSE | grep -o '"id":[^,]*' | cut -d':' -f2 | tr -d ' ')

if [ -z "$ORDER_ID" ]; then
  echo -e "${RED}Failed to place order${NC}"
  echo "Response: $ORDER_RESPONSE"
  exit 1
fi
echo "Order Placed. ID: $ORDER_ID"

# 4. Login Product Manager
echo "4. Logging in Product Manager..."
PM_EMAIL="pm@ecommerce.com"
PM_PASSWORD="password"

PM_LOGIN_RESPONSE=$(curl -s -X POST "$AUTH_API/membership/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$PM_EMAIL\",
    \"password\": \"$PM_PASSWORD\"
  }")

PM_TOKEN=$(echo $PM_LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$PM_TOKEN" ]; then
  echo -e "${RED}Failed to login Product Manager${NC}"
  # Check if Seeding worked
  echo "Response: $PM_LOGIN_RESPONSE"
  exit 1
fi
echo "Product Manager Token received."

# 5. Update Order Status
echo "5. Updating Order Status to SHIPPED..."
STATUS="SHIPPED"
UPDATE_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X PUT "$GATEWAY_API/api/orders/$ORDER_ID/status?status=$STATUS" \
  -H "Authorization: Bearer $PM_TOKEN")

if [ "$UPDATE_RESPONSE" -ne 200 ]; then
  echo -e "${RED}Failed to update order status. HTTP Code: $UPDATE_RESPONSE${NC}"
  exit 1
fi
echo "Order Status Updated."

# 6. Verify Status (as Customer)
echo "6. Verifying Status..."
VERIFY_RESPONSE=$(curl -s -X GET "$GATEWAY_API/api/orders" \
  -H "Authorization: Bearer $TOKEN")

# Check if status is SHIPPED in the response
if echo "$VERIFY_RESPONSE" | grep -q "\"status\":\"SHIPPED\""; then
  echo -e "${GREEN}SUCCESS: Order status verified as SHIPPED${NC}"
else
  echo -e "${RED}FAILURE: Order status mismatch${NC}"
  echo "Response: $VERIFY_RESPONSE"
  exit 1
fi
