@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo Mobil app dizinine geçiliyor...
echo.
echo Expo başlatılıyor...
call npx expo start
pause

