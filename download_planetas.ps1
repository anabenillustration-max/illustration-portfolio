$ProgressPreference = 'SilentlyContinue'

$zipPath = "C:\Users\ranap\.gemini\antigravity\brain\54f67b4a-20cc-4816-8255-9c2d66f5df34\scratch\planetas.zip"
$extractDir = "C:\Users\ranap\.gemini\antigravity\brain\54f67b4a-20cc-4816-8255-9c2d66f5df34\scratch\planetas_extracted"

$url = "https://docs.google.com/uc?export=download&id=12TfYBoPq5UwUj_mUr_2Sq2wWWZO7InT5"

Write-Host "Downloading Google Drive file..."
try {
    $webClient = New-Object System.Net.WebClient
    $webClient.Headers.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)")
    $webClient.DownloadFile($url, $zipPath)
    
    $len = (Get-Item $zipPath).Length
    Write-Host "Download complete. Size: $($len / 1KB -as [int])KB"
    
    # Let's see if it's a ZIP file
    if (Test-Path $extractDir) { Remove-Item $extractDir -Recurse -Force -ErrorAction SilentlyContinue }
    New-Item -ItemType Directory -Path $extractDir -Force | Out-Null
    
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    try {
        [System.IO.Compression.ZipFile]::ExtractToDirectory($zipPath, $extractDir)
        Write-Host "Extraction complete! Files extracted:"
        Get-ChildItem -Path $extractDir -Recurse | ForEach-Object {
            Write-Host "  $($_.FullName) ($($_.Length) bytes)"
        }
    } catch {
        Write-Host "Not a standard ZIP file or failed to extract: $_"
    }
} catch {
    Write-Error "Failed: $_"
}
