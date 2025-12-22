@echo off
REM 批处理脚本：查找并终止占用指定端口的进程
REM 用法: kill-port.bat <端口号>

if "%1"=="" (
    echo 用法: kill-port.bat ^<端口号^>
    echo 示例: kill-port.bat 2024
    exit /b 1
)

set PORT=%1
echo 正在查找占用端口 %PORT% 的进程...

for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%PORT%" ^| findstr "LISTENING"') do (
    set PID=%%a
    echo 找到进程 PID: !PID!
    tasklist /FI "PID eq !PID!" 2>nul | find /I "PID" >nul
    if !errorlevel! equ 0 (
        echo 正在终止进程...
        taskkill /PID !PID! /F >nul 2>&1
        if !errorlevel! equ 0 (
            echo ✓ 进程已终止
        ) else (
            echo ✗ 无法终止进程（可能需要管理员权限）
        )
    )
)

echo 完成！

