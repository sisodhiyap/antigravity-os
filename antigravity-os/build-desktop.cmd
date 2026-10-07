@echo off
set CSC_IDENTITY_AUTO_DISCOVERY=false
set WIN_CSC_LINK=
set WIN_CSC_KEY_PASSWORD=
npx electron-builder --config electron-builder.yml --win nsis portable
