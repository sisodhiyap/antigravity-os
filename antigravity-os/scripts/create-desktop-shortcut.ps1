$WshShell = New-Object -ComObject WScript.Shell
$DesktopPath = [System.Environment]::GetFolderPath('Desktop')
$ShortcutPath = Join-Path -Path $DesktopPath -ChildPath "Antigravity OS.lnk"

$ProjectDir = Split-Path -Parent $PSScriptRoot
$TargetBat = Join-Path -Path $ProjectDir -ChildPath "launch-antigravity-os.bat"
$IconPath = Join-Path -Path $ProjectDir -ChildPath "public\favicon.ico"

$Shortcut = $WshShell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = $TargetBat
$Shortcut.WorkingDirectory = $ProjectDir
$Shortcut.Description = "Antigravity OS V7.0 - Standalone Sovereign Desktop Runtime"
if (Test-Path $IconPath) {
    $Shortcut.IconLocation = "$IconPath, 0"
}
$Shortcut.Save()

Write-Host "Desktop shortcut created successfully at: $ShortcutPath"
