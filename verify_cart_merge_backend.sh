#!/bin/bash

# Configuration
AUTH_API="http://localhost:8000"
GATEWAY_API="http://localhost:8080"
PRODUCT_API="http://localhost:9001"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo "Starting Cart Merge Verification..."

# 1. Signup Customer (User A)
echo "1. Signing up Customer (User A)..."
TIMESTAMP=$(date +%s)
# Ensure email is unique
EMAIL="merge_test_${RANDOM}_${TIMESTAMP}@test.com"
PASSWORD="password"

SIGNUP_RESPONSE=$(curl -s -X POST "$AUTH_API/membership/sign-up" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\",
    \"firstName\": \"Merge\",
    \"lastName\": \"Tester\",
    \"phoneNumber\": \"1234567890\",
    \"birthDate\": \"1990-01-01\"
  }")
echo "Signup Response: $SIGNUP_RESPONSE"

# 2. Login Customer to get Token/ID
echo "2. Logging in Customer..."
LOGIN_RESPONSE=$(curl -s -X POST "$AUTH_API/membership/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\"
  }")

# echo "Login Response: $LOGIN_RESPONSE"

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
USER_ID=$(echo $LOGIN_RESPONSE | grep -o '"userId":[^,]*' | cut -d':' -f2 | tr -d ' }')

if [ -z "$TOKEN" ]; then
  echo -e "${RED}Failed to login customer${NC}"
  echo "Login Response Body: $LOGIN_RESPONSE"
  exit 1
fi
echo "User Logged In. ID: $USER_ID"

# 3. Get a Product ID to add to cart
# We'll try to find a product, if not create one (requires PM token, skipping for simplicity, assuming products exist)
# Using '1' or fetching first available.
PRODUCTS_LIST=$(curl -s -X GET "$GATEWAY_API/api/products")
PRODUCT_ID=$(echo $PRODUCTS_LIST | grep -o '"id":[^,]*' | head -1 | cut -d':' -f2 | tr -d ' ')

if [ -z "$PRODUCT_ID" ]; then
    echo -e "${RED}No products found to test with. Please ensure database is seeded.${NC}"
    exit 1
fi
echo "Using Product ID: $PRODUCT_ID"

# 4. Simulate Guest Cart (User ID = 123456789 for example, assuming negative for guest in frontend but backend just takes a Long)
# In frontend, guest IDs are negative randoms. Let's use a specific random positive ID for backend testing as 'guestUserId' param
GUEST_USER_ID=987654321

echo "3. Adding item to Guest Cart (ID: $GUEST_USER_ID)..."
curl -s -X POST "$GATEWAY_API/api/cart/add?userId=$GUEST_USER_ID&productId=$PRODUCT_ID&quantity=2" > /dev/null

# Verify Guest Cart has item
GUEST_CART=$(curl -s -X GET "$GATEWAY_API/api/cart?userId=$GUEST_USER_ID")
if echo "$GUEST_CART" | grep -q "\"quantity\":2"; then
    echo "Guest Cart populated successfully."
else
    echo -e "${RED}Failed to populate Guest Cart.${NC}"
    echo "Response: $GUEST_CART"
    exit 1
fi

# 5. Merge Carts
echo "4. Merging Guest Cart ($GUEST_USER_ID) into Real User Cart ($USER_ID)..."
MERGE_RESPONSE=$(curl -s -X POST "$GATEWAY_API/api/cart/merge?guestUserId=$GUEST_USER_ID&userId=$USER_ID")

# 6. Verify User Cart has items
echo "5. Verifying User Cart..."
USER_CART=$(curl -s -X GET "$GATEWAY_API/api/cart?userId=$USER_ID")

if echo "$USER_CART" | grep -q "\"quantity\":2"; then
    echo -e "${GREEN}SUCCESS: Cart merged successfully! Item found in user cart.${NC}"
else
    echo -e "${RED}FAILURE: User Cart does not contain merged items.${NC}"
    echo "User Cart Response: $USER_CART"
    exit 1
fi

# 7. Verify Guest Cart is deleted/empty
echo "6. Verifying Guest Cart is empty/deleted..."
GUEST_CART_AFTER=$(curl -s -X GET "$GATEWAY_API/api/cart?userId=$GUEST_USER_ID")
# Depending on implementation, might return empty cart or 404 handled as empty.
# In CartService.java: getCart creates new empty if not found. So we expect empty items.
if echo "$GUEST_CART_AFTER" | grep -q "\"items\":\[\]"; then
    echo -e "${GREEN}SUCCESS: Guest Cart is empty.${NC}"
else 
    # It might return null or something else?
    echo "Guest Cart After Merge: $GUEST_CART_AFTER"
    # Actually if it returns a new empty cart with totalQuantity 0, that's fine too.
    if echo "$GUEST_CART_AFTER" | grep -q "\"totalQuantity\":0"; then
         echo -e "${GREEN}SUCCESS: Guest Cart is empty.${NC}"
    else
         echo -e "${RED}WARNING: Guest cart might not have been cleared?${NC}"
    fi
fi
