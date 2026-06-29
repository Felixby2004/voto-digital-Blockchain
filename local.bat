@echo off
:: Batch script to run the services of Voto Digital in order

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
echo [1/8] Starting API Gateway...
start "API Gateway" pnpm run dev:gateway
timeout /t 3 /nobreak >nul

echo [2/8] Starting Auth Service...
start "Auth Service" pnpm run dev:auth
timeout /t 3 /nobreak >nul

echo [3/8] Starting Padron Simple...
start "Padron Simple" pnpm --filter padron-simple start:dev
timeout /t 3 /nobreak >nul

echo [4/8] Starting Electoral Service...
start "Electoral Service" pnpm --filter electoral-service start:dev
timeout /t 3 /nobreak >nul

echo [5/8] Starting Candidate Service...
start "Candidate Service" pnpm --filter candidate-service start:dev
timeout /t 3 /nobreak >nul

echo [6/8] Starting Dashboard Service...
start "Dashboard Service" pnpm --filter dashboard-service start:dev
timeout /t 3 /nobreak >nul

echo [7/8] Starting Audit Service...
start "Audit Service" pnpm --filter audit-service start:dev
timeout /t 3 /nobreak >nul

echo ===================================================
echo   Running Contract Tests...
echo ===================================================
echo.
echo [8/8] Executing: pnpm --filter contracts test
call pnpm --filter contracts test

echo.
echo All services have been spawned and tests finished.
echo Press any key to exit.
pause
