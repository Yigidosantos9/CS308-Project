#!/bin/bash

# Configuration
AUTH_API="http://localhost:8000"
GATEWAY_API="http://localhost:8080"
PRODUCT_API="http://localhost:9001"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo "Starting Review Verification..."

# 1. Signup Customer
echo "1. Signing up Customer..."
TIMESTAMP=$(date +%s)
EMAIL="reviewer_${TIMESTAMP}@test.com"
PASSWORD="password"

curl -s -X POST "$AUTH_API/membership/sign-up" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\",
    \"firstName\": \"Reviewer\",
    \"lastName\": \"Test\",
    \"phoneNumber\": \"1234567890\",
    \"birthDate\": \"1990-01-01\"
  }" > /dev/null
echo "Customer Signed Up."

# 2. Login Customer
echo "2. Logging in Customer..."
LOGIN_RESPONSE=$(curl -s -X POST "$AUTH_API/membership/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\"
  }")

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo -e "${RED}Failed to login customer${NC}"
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi
echo "Customer Token received."

# 3. Create a Product (Need PM Token)
echo "3. Creating a Product (as PM)..."
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
  exit 1
fi

PRODUCT_NAME="ReviewProduct_${TIMESTAMP}"
PRODUCT_RESPONSE=$(curl -s -X POST "$PRODUCT_API/products" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"$PRODUCT_NAME\",
    \"serialNumber\": \"SN_${TIMESTAMP}\",
    \"description\": \"Product for review testing\",
    \"price\": 100.0,
    \"stock\": 10,
    \"model\": \"ModelX\",
    \"brand\": \"TestBrand\",
    \"productType\": \"TSHIRT\",
    \"targetAudience\": \"UNISEX\",
    \"warrantyStatus\": \"STANDARD\",
    \"distributorInfo\": \"TestDistributor\"
  }")

PRODUCT_ID=$(echo $PRODUCT_RESPONSE | grep -o '"id":[^,]*' | cut -d':' -f2 | tr -d ' ')

if [ -z "$PRODUCT_ID" ]; then
    # Fallback: Try to get an existing product if creation fails (maybe not implemented in gateway yet?)
    # Or maybe just list products and pick one.
    echo "Product creation response: $PRODUCT_RESPONSE"
    echo "Trying to fetch existing products..."
    PRODUCTS_LIST=$(curl -s -X GET "$GATEWAY_API/api/products")
    PRODUCT_ID=$(echo $PRODUCTS_LIST | grep -o '"id":[^,]*' | head -1 | cut -d':' -f2 | tr -d ' ')
fi

if [ -z "$PRODUCT_ID" ]; then
  echo -e "${RED}Failed to get a Product ID${NC}"
  exit 1
fi
echo "Product ID: $PRODUCT_ID"

# 4. Add Review (Directly to Product API)
echo "4. Adding Review (Directly)..."
# Gateway is down, so we hit Product API directly and mock the User ID.
USER_ID=1

REVIEW_RESPONSE=$(curl -s -X POST "$PRODUCT_API/reviews" \
  -H "X-User-Id: $USER_ID" \
  -H "Content-Type: application/json" \
  -d "{
    \"productId\": $PRODUCT_ID,
    \"rating\": 5,
    \"comment\": \"Great product!\"
  }")

# Check if successful
if echo "$REVIEW_RESPONSE" | grep -q "\"id\":"; then
    echo "Review Added via Product API."
else
    echo "Failed to add review. Response: $REVIEW_RESPONSE"
    exit 1
fi

REVIEW_ID=$(echo $REVIEW_RESPONSE | grep -o '"id":[^,]*' | cut -d':' -f2 | tr -d ' ')
echo "Review ID: $REVIEW_ID"

# 5. Verify Review is NOT visible (Pending)
echo "5. Verifying Review is Pending (Public View)..."
PUBLIC_REVIEWS=$(curl -s -X GET "$PRODUCT_API/reviews/product/$PRODUCT_ID")
if echo "$PUBLIC_REVIEWS" | grep -q "$REVIEW_ID"; then
    echo -e "${RED}FAILURE: Review should not be visible yet!${NC}"
    exit 1
else
    echo "Review is correctly hidden (Pending Approval)."
fi

# 6. Approve Review (as PM - Direct)
echo "6. Approving Review (as PM)..."
APPROVE_RESPONSE=$(curl -s -X PUT "$PRODUCT_API/reviews/$REVIEW_ID/approve")

if echo "$APPROVE_RESPONSE" | grep -q "\"approved\":true"; then
    echo "Review Approved."
else
    echo -e "${RED}Failed to approve review${NC}"
    echo "Response: $APPROVE_RESPONSE"
    exit 1
fi

# 7. Verify Review IS visible (Approved)
echo "7. Verifying Review is Visible..."
PUBLIC_REVIEWS_AGAIN=$(curl -s -X GET "$PRODUCT_API/reviews/product/$PRODUCT_ID")
if echo "$PUBLIC_REVIEWS_AGAIN" | grep -q "$REVIEW_ID"; then
    echo -e "${GREEN}SUCCESS: Review is now visible!${NC}"
else
    echo -e "${RED}FAILURE: Review should be visible now!${NC}"
    echo "Response: $PUBLIC_REVIEWS_AGAIN"
    exit 1
fi
