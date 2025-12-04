#!/bin/bash

BASE_URL="http://localhost:9001"

echo "1. Adding a Product..."
RESPONSE=$(curl -s -X POST $BASE_URL/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Product", "price":100.0, "stock":10, "model":"TP-01", "serialNumber":"SN-01", "description":"Desc", "brand":"TestBrand", "productType":"JACKET", "targetAudience":"UNISEX", "warrantyStatus":"STANDARD", "distributorInfo":"Dist Info"}')
echo "Response: $RESPONSE"
PRODUCT_ID=$(echo $RESPONSE | jq -r '.id')
echo "Product ID: $PRODUCT_ID"

echo "2. Adding a Comment..."
RESPONSE=$(curl -s -X POST $BASE_URL/comments \
  -H "Content-Type: application/json" \
  -d "{\"productId\":$PRODUCT_ID, \"userId\":123, \"content\":\"Great product!\"}")
echo "Response: $RESPONSE"
COMMENT_ID=$(echo $RESPONSE | jq -r '.id')
echo "Comment ID: $COMMENT_ID"

echo "3. Verifying Comment is NOT visible (initially unapproved)..."
curl -s $BASE_URL/products/$PRODUCT_ID/comments

echo "4. Approving Comment..."
curl -s -X PUT $BASE_URL/comments/$COMMENT_ID/approve

echo "5. Verifying Comment IS visible..."
curl -s $BASE_URL/products/$PRODUCT_ID/comments

echo "6. Adding a Rating..."
RESPONSE=$(curl -s -X POST $BASE_URL/ratings \
  -H "Content-Type: application/json" \
  -d "{\"productId\":$PRODUCT_ID, \"userId\":123, \"score\":5}")
echo "Response: $RESPONSE"

echo "7. Getting Average Rating..."
curl -s $BASE_URL/products/$PRODUCT_ID/rating
