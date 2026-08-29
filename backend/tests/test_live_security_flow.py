import json
import urllib.request
import urllib.parse
import urllib.error
import time

BASE_URL = "http://127.0.0.1:8000/api/v1"

def make_request(method, endpoint, data=None, token=None, form_data=False):
    url = f"{BASE_URL}{endpoint}"
    headers = {}
    body = None

    if token:
        headers["Authorization"] = f"Bearer {token}"

    if data:
        if form_data:
            headers["Content-Type"] = "application/x-www-form-urlencoded"
            body = urllib.parse.urlencode(data).encode("utf-8")
        else:
            headers["Content-Type"] = "application/json"
            body = json.dumps(data).encode("utf-8")

    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            resp_body = resp.read().decode("utf-8")
            return resp.status, json.loads(resp_body) if resp_body else {}
    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8")
        try:
            parsed = json.loads(err_body)
        except Exception:
            parsed = {"detail": err_body}
        return e.code, parsed


def test_live_security_flow():
    import pytest
    timestamp = int(time.time())
    admin_email = "admin@eka.com"
    admin_pass = "admin123"

    print(">>> 0. Authenticate as initialized system admin")
    try:
        status, res = make_request("POST", "/auth/login", {"username": admin_email, "password": admin_pass}, form_data=True)
    except urllib.error.URLError:
        pytest.skip("Live server is not running on 127.0.0.1:8000; skipping live integration test.")
    assert status == 200, f"Admin login failed: {res}"
    admin_token = res["access_token"]

    print(">>> TEST 1: Normal Registration (role=employee)")
    emp_email = f"emp_{timestamp}@test.com"
    status, res = make_request("POST", "/auth/register", {
        "full_name": "Standard Employee",
        "email": emp_email,
        "password": "Password123!",
        "designation": "Software Engineer",
        "department": "Engineering",
        "role": "employee"
    })
    assert status == 201, f"Register employee failed: {res}"

    # Log in as normal employee
    status, res = make_request("POST", "/auth/login", {"username": emp_email, "password": "Password123!"}, form_data=True)
    assert status == 200
    emp_token = res["access_token"]

    # Verify /me
    status, res = make_request("GET", "/auth/me", token=emp_token)
    assert status == 200
    assert res["role"] == "employee", f"Expected employee role, got {res['role']}"
    assert res["requested_role"] == "employee"
    assert res["role_status"] == "approved"

    print(">>> TEST 2 & TEST 8: Malicious Registration Requesting Admin Role directly")
    cand_email = f"candidate_admin_{timestamp}@test.com"
    status, res = make_request("POST", "/auth/register", {
        "full_name": "Wannabe Admin",
        "email": cand_email,
        "password": "Password123!",
        "designation": "Security Lead",
        "department": "IT",
        "role": "admin"  # Malicious/direct payload
    })
    assert status == 201, f"Register candidate failed: {res}"

    print(">>> TEST 3: Login before approval")
    status, res = make_request("POST", "/auth/login", {"username": cand_email, "password": "Password123!"}, form_data=True)
    assert status == 200
    cand_token = res["access_token"]

    # Check /me -> active role MUST NOT be admin
    status, res = make_request("GET", "/auth/me", token=cand_token)
    assert status == 200
    assert res["role"] == "employee", f"SECURITY FAIL: Active role became admin without approval! Got {res['role']}"
    assert res["requested_role"] == "admin"
    assert res["role_status"] == "pending"

    print(">>> TEST 4: Pending user attempts admin-only endpoint")
    status, res = make_request("POST", "/auth/promote", {"email": emp_email, "role": "admin"}, token=cand_token)
    assert status == 403, f"SECURITY FAIL: Pending user was able to access admin endpoint! Got status {status}"

    status, res = make_request("POST", "/auth/approve-role", {"email": emp_email}, token=cand_token)
    assert status == 403, f"SECURITY FAIL: Pending user was able to approve roles! Got status {status}"

    print(">>> TEST 5: Admin approves the pending user")
    # First, list role requests as admin
    status, res = make_request("GET", "/auth/role-requests?status_filter=pending", token=admin_token)
    assert status == 200
    pending_emails = [r["email"] for r in res]
    assert cand_email in pending_emails, f"Candidate email not in pending requests: {pending_emails}"

    # Admin approves role
    status, res = make_request("POST", "/auth/approve-role", {"email": cand_email}, token=admin_token)
    assert status == 200, f"Approval failed: {res}"

    print(">>> TEST 6: Verify approved user now has active admin role")
    status, res = make_request("GET", "/auth/me", token=cand_token)
    assert status == 200
    assert res["role"] == "admin", f"Expected active role admin after approval, got {res['role']}"
    assert res["role_status"] == "approved"

    print(">>> TEST 7: Admin endpoint accessible by approved user")
    status, res = make_request("GET", "/auth/role-requests", token=cand_token)
    assert status == 200, f"Newly approved admin could not access admin endpoint: {res}"

    print(">>> TEST 9: Role Rejection workflow")
    rej_email = f"rej_{timestamp}@test.com"
    status, res = make_request("POST", "/auth/register", {
        "full_name": "Rejected Candidate",
        "email": rej_email,
        "password": "Password123!",
        "designation": "Junior Analyst",
        "department": "Finance",
        "requested_role": "admin"
    })
    assert status == 201

    # Admin rejects
    status, res = make_request("POST", "/auth/reject-role", {"email": rej_email, "reason": "Insufficient credentials"}, token=admin_token)
    assert status == 200

    # Login rejected user and verify /me
    status, res = make_request("POST", "/auth/login", {"username": rej_email, "password": "Password123!"}, form_data=True)
    assert status == 200
    rej_token = res["access_token"]
    status, res = make_request("GET", "/auth/me", token=rej_token)
    assert status == 200
    assert res["role"] == "employee"
    assert res["role_status"] == "rejected"

    print("\n==========================================")
    print("ALL 8+ SECURITY & APPROVAL TESTS PASSED!")
    print("==========================================\n")


if __name__ == "__main__":
    test_live_security_flow()
