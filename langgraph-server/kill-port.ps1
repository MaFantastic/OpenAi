# PowerShell 脚本：查找并终止占用指定端口的进程
param(
    [Parameter(Mandatory=$true)]
    [int]$Port
)

Write-Host "正在查找占用端口 $Port 的进程..." -ForegroundColor Yellow

# 查找占用端口的进程
$connections = netstat -ano | Select-String ":$Port\s+.*LISTENING"
if ($connections) {
    $pids = $connections | ForEach-Object {
        $_.ToString().Split()[-1]
    } | Select-Object -Unique
    
    foreach ($pid in $pids) {
        $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
        if ($process) {
            Write-Host "找到进程: $($process.ProcessName) (PID: $pid)" -ForegroundColor Red
            Write-Host "正在终止进程..." -ForegroundColor Yellow
            Stop-Process -Id $pid -Force
            Write-Host "✓ 进程已终止" -ForegroundColor Green
        }
    }
} else {
    Write-Host "✓ 端口 $Port 未被占用" -ForegroundColor Green
}

