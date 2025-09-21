@echo off
chcp 65001 >nul
title ГСПК 32 - Система управления документами

echo ========================================
echo    ГСПК 32 - Быстрый запуск
echo ========================================
echo.

echo Проверка Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python не установлен!
    echo 💡 Скачайте Python с сайта python.org
    pause
    exit /b 1
)

echo ✅ Python найден

echo.
echo Проверка зависимостей...
python -c "import kivy" >nul 2>&1
if errorlevel 1 (
    echo ⚠️ Kivy не установлен. Установка...
    pip install kivy==2.2.1
    if errorlevel 1 (
        echo ❌ Ошибка установки Kivy
        pause
        exit /b 1
    )
)

echo ✅ Зависимости проверены

echo.
echo Запуск ГСПК 32...
python main.py

echo.
echo ========================================
echo    ГСПК 32 завершен
echo ========================================
pause
