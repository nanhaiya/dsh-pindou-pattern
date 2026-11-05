# Builds the single-file Windows app: web/index.html is produced by
# build-web.mjs first, then csc embeds it (plus the WebView2 SDK assemblies)
# into build/BeadPatternStudio.exe.
#
# Requires: Node.js >= 20.3, .NET Framework 4.x (csc.exe ships with Windows).
# The WebView2 SDK package is downloaded from nuget.org on first run.

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$sdkVersion = "1.0.2903.40"
$workDir = Join-Path $root "work\exe"
$sdkDir = Join-Path $workDir "sdk"
$nupkg = Join-Path $workDir "wv2.nupkg"
$csc = "C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe"

if (-not (Test-Path $csc)) {
    throw "csc.exe not found at $csc"
}

Write-Host "1/4 building web/index.html"
Push-Location $root
try {
    node build-web.mjs
    if ($LASTEXITCODE -ne 0) { throw "build-web.mjs failed" }
} finally {
    Pop-Location
}

Write-Host "2/4 preparing WebView2 SDK $sdkVersion"
if (-not (Test-Path (Join-Path $sdkDir "Microsoft.Web.WebView2.Core.dll"))) {
    New-Item -ItemType Directory -Force -Path $workDir | Out-Null
    if (-not (Test-Path $nupkg)) {
        Write-Host "    downloading nuget package"
        $url = "https://www.nuget.org/api/v2/package/Microsoft.Web.WebView2/$sdkVersion"
        Invoke-WebRequest -Uri $url -OutFile $nupkg -UseBasicParsing
    }
    $extract = Join-Path $workDir "pkg"
    if (Test-Path $extract) { Remove-Item -Recurse -Force $extract }
    Expand-Archive -Path $nupkg -DestinationPath $extract -Force
    New-Item -ItemType Directory -Force -Path $sdkDir | Out-Null
    Copy-Item (Join-Path $extract "lib\net462\Microsoft.Web.WebView2.Core.dll") $sdkDir -Force
    Copy-Item (Join-Path $extract "lib\net462\Microsoft.Web.WebView2.WinForms.dll") $sdkDir -Force
    Copy-Item (Join-Path $extract "runtimes\win-x64\native\WebView2Loader.dll") $sdkDir -Force
}

$icon = Join-Path $root "win\icon.ico"
$page = Join-Path $root "web\index.html"
$outDir = Join-Path $root "build"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

Write-Host "3/4 compiling resources"
$args = @(
    "/nologo",
    "/target:winexe",
    "/platform:x64",
    "/optimize+",
    "/codepage:65001",
    "/win32icon:$icon",
    "/resource:$page,index.html",
    "/resource:$(Join-Path $sdkDir 'WebView2Loader.dll'),WebView2Loader.dll",
    "/resource:$(Join-Path $sdkDir 'Microsoft.Web.WebView2.Core.dll'),Microsoft.Web.WebView2.Core.dll",
    "/resource:$(Join-Path $sdkDir 'Microsoft.Web.WebView2.WinForms.dll'),Microsoft.Web.WebView2.WinForms.dll",
    "/r:$(Join-Path $sdkDir 'Microsoft.Web.WebView2.Core.dll')",
    "/r:$(Join-Path $sdkDir 'Microsoft.Web.WebView2.WinForms.dll')",
    "/r:System.dll",
    "/r:System.Drawing.dll",
    "/r:System.Windows.Forms.dll",
    "/out:$(Join-Path $outDir 'BeadPatternStudio.exe')",
    (Join-Path $root "win\Program.cs")
)

Write-Host "4/4 compiling exe"
& $csc $args
if ($LASTEXITCODE -ne 0) { throw "csc failed" }

$exe = Join-Path $outDir "BeadPatternStudio.exe"
$size = (Get-Item $exe).Length
Write-Host ("done: {0} ({1:N0} bytes)" -f $exe, $size)
