Get-ChildItem Env:Path | Out-File -FilePath "check-path-output.txt"
Get-Command mongod -ErrorAction SilentlyContinue | Out-File -FilePath "check-mongod-output.txt"
Get-Command mongosh -ErrorAction SilentlyContinue | Out-File -FilePath "check-mongosh-output.txt"