@echo off
:: Batch script to run the services of Voto Digital in order

:: Automatically terminate any stale Node processes on project ports from previous runs
powershell -Command "Get-Process -Id (Get-NetTCPConnection -LocalPort 3000,3001,3002,3003,3004,3005,3006,3007,3008,3009,3010,3011,3012,3013,3014,3015 -ErrorAction SilentlyContinue).OwningProcess -ErrorAction SilentlyContinue | Where Name -eq node | Stop-Process -Force" >nul 2>&1

:: Clear global DATABASE_URL to force services to use local .env DATABASE_URL
set DATABASE_URL=

:: Load local .env variables into CMD environment to resolve lifecycle load issues
if exist .env (
    powershell -Command "Get-Content .env | Where-Object { $_ -and -not $_.StartsWith('#') } | Foreach-Object { $name, $val = $_ -split '=', 2; if ($name -and $val) { $val = $val.Trim().Trim([char]34).Trim([char]39); Write-Output ('set ' + $name.Trim() + '=' + $val) } } | Out-File -Encoding ascii env_temp.bat"
    if exist env_temp.bat (
        call env_temp.bat
        del env_temp.bat
    )
)

echo ===================================================
echo   Starting Voto Digital Services
echo ===================================================
echo.

:: 1. Verify pnpm installation
where pnpm >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] pnpm is not installed or not in PATH.
    echo Please install pnpm before running this script.
    pause
    exit /b 1
)

:: 2. Verify .env file
if not exist .env (
    echo [INFO] .env file not found. Copying from .env.example...
    copy .env.example .env
)
copy /Y .env apps\.env >nul

:: 3. Verify node_modules
if not exist node_modules (
    echo [WARNING] node_modules folder is missing.
    echo Running pnpm install first...
    call pnpm install
    if %errorlevel% neq 0 (
        echo [ERROR] pnpm install failed.
        pause
        exit /b 1
    )
)

:: 4. Start services in order
echo [1/11] Starting API Gateway...
start "API Gateway" pnpm run dev:gateway
timeout /t 3 /nobreak >nul

echo [2/11] Starting Auth Service...
start "Auth Service" pnpm run dev:auth
timeout /t 3 /nobreak >nul

echo [3/11] Starting Padron Simple...
start "Padron Simple" pnpm --filter padron-simple start:dev
timeout /t 3 /nobreak >nul

echo [4/11] Starting Electoral Service...
start "Electoral Service" pnpm --filter electoral-service start:dev
timeout /t 3 /nobreak >nul

echo [5/11] Starting Candidate Service...
start "Candidate Service" pnpm --filter candidate-service start:dev
timeout /t 3 /nobreak >nul

echo [6/11] Starting Dashboard Service...
start "Dashboard Service" pnpm --filter dashboard-service start:dev
timeout /t 3 /nobreak >nul

echo [7/11] Starting Audit Service...
start "Audit Service" pnpm --filter audit-service start:dev
timeout /t 3 /nobreak >nul

echo [8/11] Starting Blockchain Service...
start "Blockchain Service" pnpm --filter blockchain-service start:dev
timeout /t 3 /nobreak >nul

echo [9/11] Starting Relayer Service...
start "Relayer Service" pnpm --filter relayer-service start:dev
timeout /t 3 /nobreak >nul

echo [10/12] Starting Crypto Service...
start "Crypto Service" pnpm --filter crypto-service start:dev
timeout /t 3 /nobreak >nul

echo [11/12] Starting Web Frontend...
start "Web Frontend" pnpm run dev:web
timeout /t 3 /nobreak >nul

echo ===================================================
echo   Running Contract Tests...
echo ===================================================
echo.
echo [11/11] Executing: pnpm --filter contracts test
call pnpm --filter contracts test

echo.
echo All services have been spawned and tests finished.
echo Press any key to exit.
pause
