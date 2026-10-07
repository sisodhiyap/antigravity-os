# ANTIGRAVITY OS V7 — DESKTOP INSTALLATION GUIDE

## 1. Automated Windows Installer (NSIS)
The desktop package produces an enterprise Windows installer:
- **Target**: `dist/desktop-installer/Antigravity OS Setup.exe`
- **Shortcuts**: Automatically places shortcuts in the Start Menu and on the Desktop.
- **Repair / Upgrade**: Seamless in-place upgrades preserving the `workspaces/` vault.
- **Uninstaller**: Registered in Windows Settings / Control Panel.

## 2. Building the Installer
To build the distribution package:
```powershell
npm run package:desktop
```
