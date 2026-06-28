# 本機開發伺服器（避免 file:// CORS 問題）
$port = 8080
$path = $PSScriptRoot
$url  = "http://localhost:$port/"

$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add($url)
$listener.Start()
Write-Host "伺服器啟動：$url"
Start-Process $url

while ($listener.IsListening) {
    $ctx  = $listener.GetContext()
    $req  = $ctx.Request
    $resp = $ctx.Response

    $file = Join-Path $path $req.Url.LocalPath.TrimStart('/')
    if ($req.Url.LocalPath -eq '/') { $file = Join-Path $path 'index.html' }

    if (Test-Path $file -PathType Leaf) {
        $mime = switch ([System.IO.Path]::GetExtension($file)) {
            '.html' { 'text/html; charset=utf-8' }
            '.js'   { 'application/javascript' }
            '.css'  { 'text/css' }
            '.png'  { 'image/png' }
            '.webp' { 'image/webp' }
            default { 'application/octet-stream' }
        }
        $bytes = [System.IO.File]::ReadAllBytes($file)
        $resp.ContentType   = $mime
        $resp.ContentLength64 = $bytes.Length
        $resp.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
        $resp.StatusCode = 404
    }
    $resp.OutputStream.Close()
}
