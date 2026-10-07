@echo off
git add -A
git commit -m "feat(desktop): production installer v2.0.0 - 8-provider AI router, dynamic capabilities, truthful telemetry, NSIS+Portable installers, real GPU detection"
git tag -a release-v2.0.0 -m "Antigravity OS v2.0.0 - Production Windows Desktop Release"
echo Done.
