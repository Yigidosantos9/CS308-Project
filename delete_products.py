import urllib.request
import urllib.error
import json

BASE_URL = "http://localhost:9001"

def get_products():
    try:
        with urllib.request.urlopen(f"{BASE_URL}/products") as response:
            data = response.read()
            return json.loads(data)
    except Exception as e:
        print(f"Error fetching products: {e}")
        return []

def delete_product(product_id):
    try:
        req = urllib.request.Request(f"{BASE_URL}/products/{product_id}", method="DELETE")
        with urllib.request.urlopen(req) as response:
            if response.status == 200 or response.status == 204:
                print(f"✅ Successfully deleted Product ID: {product_id}")
                return True
            else:
                print(f"❌ Failed to delete Product ID: {product_id}. Status: {response.status}")
                return False
    except urllib.error.HTTPError as e:
         print(f"❌ Failed to delete Product ID: {product_id}. Status: {e.code}, Reason: {e.reason}")
         return False
    except Exception as e:
        print(f"Error deleting product {product_id}: {e}")
        return False

def main():
    products = get_products()
    if not products:
        print("No products found.")
        return

    targets = ["Product C", "Product D"]
    deleted_count = 0

    print(f"Searching for products: {targets}")
    
    for p in products:
        if p.get("name") in targets:
            print(f"Found target: {p['name']} (ID: {p['id']})")
            if delete_product(p['id']):
                deleted_count += 1
    
    print(f"Total deleted: {deleted_count}")

if __name__ == "__main__":
    main()
