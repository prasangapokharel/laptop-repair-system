"""
Quick test to verify login endpoint returns roles
"""
import requests
import json

BASE_URL = "http://localhost:8000"

def test_login_with_roles():
    """Test that login endpoint returns user roles"""
    
    # Login with existing user
    login_data = {
        "phone": "9876543210",
        "password": "password123"
    }
    
    response = requests.post(f"{BASE_URL}/v1/auth/login", json=login_data)
    
    print(f"Status Code: {response.status_code}")
    print(f"\nResponse:")
    print(json.dumps(response.json(), indent=2))
    
    if response.status_code == 200:
        data = response.json()
        
        # Verify structure
        assert "user" in data, "Response missing 'user' field"
        assert "tokens" in data, "Response missing 'tokens' field"
        assert "roles" in data["user"], "User object missing 'roles' field"
        assert isinstance(data["user"]["roles"], list), "Roles should be a list"
        
        print(f"\n✓ Login response includes roles field")
        print(f"✓ User has {len(data['user']['roles'])} role(s)")
        
        if data["user"]["roles"]:
            print(f"\nRoles:")
            for role in data["user"]["roles"]:
                print(f"  - {role['name']}: {role['description']}")
        
        return True
    else:
        print(f"✗ Login failed: {response.json()}")
        return False

if __name__ == "__main__":
    try:
        test_login_with_roles()
    except Exception as e:
        print(f"✗ Test failed: {e}")
