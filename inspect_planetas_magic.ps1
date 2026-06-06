$path = "C:\Users\ranap\.gemini\antigravity\brain\54f67b4a-20cc-4816-8255-9c2d66f5df34\scratch\planetas.zip"
if (Test-Path $path) {
    $bytes = [System.IO.File]::ReadAllBytes($path)
    if ($bytes.Length -gt 16) {
        $hex = ""
        for ($i = 0; $i -lt 16; $i++) {
            $hex += $bytes[$i].ToString("X2") + " "
        }
        Write-Host "Magic bytes: $hex"
        
        # Check standard headers
        if ($hex.StartsWith("89 50 4E 47")) { Write-Host "It is a PNG file!" }
        elseif ($hex.StartsWith("FF D8 FF")) { Write-Host "It is a JPEG file!" }
        elseif ($hex.StartsWith("50 4B 03 04")) { Write-Host "It is a standard ZIP file!" }
        elseif ($hex.StartsWith("38 42 50 53")) { Write-Host "It is a PSD file!" }
        elseif ($hex.StartsWith("52 61 72 21")) { Write-Host "It is a RAR file!" }
        else { Write-Host "Unknown format" }
    } else {
        Write-Host "File too small: $($bytes.Length) bytes"
    }
} else {
    Write-Host "File not found"
}
