@echo off
setlocal enabledelayedexpansion

for /r %%F in (*.avi) do (
    echo Converting: %%F
    ffmpeg -y -i "%%F" -c:v h264 -c:a aac "%%~dpnF.mp4"
    
    if errorlevel 1 (
        echo FAILED: %%F
    ) else (
        del "%%F"
        echo Deleted: %%F
    )
)

echo.
echo Done.
pause
