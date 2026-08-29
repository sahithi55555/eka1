try {
    $body = @{ full_name = "RBAC Test"; email = "rbac_test@example.com"; password = "pass"; designation = "Software Engineer"; department = "Engineering" } | ConvertTo-Json
    Invoke-RestMethod -Uri http://localhost:8000/api/v1/auth/register -Method POST -Headers @{"Content-Type"="application/json"} -Body $body -ErrorAction SilentlyContinue | Out-Null
    
    $login = Invoke-RestMethod -Uri http://localhost:8000/api/v1/auth/login -Method POST -Body @{username="rbac_test@example.com"; password="pass"}
    $token = $login.access_token

    $me = Invoke-RestMethod -Uri http://localhost:8000/api/v1/auth/me -Method GET -Headers @{"Authorization"="Bearer $token"}
    Write-Output "Verification Response for rbac_test:"
    Write-Output ($me | ConvertTo-Json)

} catch {
    Write-Output "Error: $_"
}
