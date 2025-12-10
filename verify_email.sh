#!/bin/bash

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

BASE_URL="http://localhost:8080/api"
AUTH_URL="http://localhost:8000/membership"

echo "Starting Email Notification Verification..."

# 1. Signup and Login
EMAIL="test_email_$(date +%s)@example.com"
PASSWORD="password123"

echo "Creating user $EMAIL..."
curl -s -X POST "$AUTH_URL/sign-up" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\",
    \"firstName\": \"Test\",
    \"lastName\": \"User\",
    \"phoneNumber\": \"1234567890\",
    \"birthDate\": \"1990-01-01\"
  }"

echo "Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST "$AUTH_URL/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$EMAIL\", \"password\": \"$PASSWORD\"}")

echo "Login Response: $LOGIN_RESPONSE"

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

# Extract User ID from JWT
if [ -n "$TOKEN" ]; then
  PAYLOAD=$(echo $TOKEN | cut -d. -f2)
  # Add padding
  len=${#PAYLOAD}
  mod=$((len % 4))
  if [ $mod -eq 2 ]; then PAYLOAD="${PAYLOAD}=="; elif [ $mod -eq 3 ]; then PAYLOAD="${PAYLOAD}="; fi
  
  # Decode payload (try -D for Mac, -d for Linux)
  DECODED_PAYLOAD=$(echo "$PAYLOAD" | base64 -D 2>/dev/null || echo "$PAYLOAD" | base64 -d 2>/dev/null)
  
  # Extract ID using grep/cut to avoid dependency on jq if possible, but jq is safer
  # Assuming payload has "id":123
  USER_ID=$(echo $DECODED_PAYLOAD | grep -o '"id":[0-9]*' | cut -d':' -f2)
fi

if [ -z "$TOKEN" ]; then
  echo -e "${RED}Login failed${NC}"
  exit 1
fi
echo -e "${GREEN}Logged in as User ID: $USER_ID${NC}"

# 2. Place Order
echo "Placing Order..."
# Assuming product ID 1 exists and has stock
ORDER_RESPONSE=$(curl -s -X POST "$BASE_URL/orders" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "productId": 1,
        "quantity": 1
      }
    ],
    "shippingAddress": "123 Test St",
    "paymentMethod": "CREDIT_CARD"
  }') 2>&1
  
  # Capture status code separately if needed, but for now let's just see the output
  echo "Order Response Body: $ORDER_RESPONSE"

ORDER_ID=$(echo $ORDER_RESPONSE | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

if [ -z "$ORDER_ID" ]; then
  echo -e "${RED}Order placement failed${NC}"
  echo "Response: $ORDER_RESPONSE"
  exit 1
fi
echo -e "${GREEN}Order placed. ID: $ORDER_ID${NC}"

echo "Waiting for invoice email log..."
sleep 2
# We can't easily grep logs here since we are running the script.
# We will ask the user to check logs.

# 3. Approve Refund (Simulate Sales Manager)
# We need a Sales Manager token. For now, let's assume we can use the same user if we grant role,
# or we skip this if we can't easily get a sales manager token.
# Assuming the system has a way to run as admin or we just try.
# If this fails due to 403, we know auth is working at least.

echo "Attempting to approve refund (requires Sales Manager role)..."
# This might fail if the user is not a sales manager.
REFUND_RESPONSE=$(curl -s -X PUT "$BASE_URL/sales/refunds/$ORDER_ID/approve" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

echo "Refund Response: $REFUND_RESPONSE"

echo -e "${GREEN}Verification steps completed.${NC}"
echo "Please check the Gateway API logs for:"
echo "1. 'Invoice email sent to $EMAIL for invoice $ORDER_ID'"
echo "2. 'Refund email sent to $EMAIL for order $ORDER_ID'"
echo "   - Verify the email subject is 'Refund Approved - Order #$ORDER_ID'"
echo "   - Verify the email body contains 'Product(s): ...'"
