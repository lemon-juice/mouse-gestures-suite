set xpi_name=mouse-gestures-suite-1.1.0.xpi
rmdir "D:\dev\aio-gestures-build" /S /Q
xcopy "D:\dev\aio-gestures\source" "D:\dev\aio-gestures-build" /I /E /Q

"C:\Program Files\7-Zip\7z.exe" a -tzip "D:\dev\aio-gestures-build\chrome\allinonegest.jar" "D:\dev\aio-gestures-build\chrome\*"

for /D %%f in ("D:\dev\aio-gestures-build\chrome\*") do rmdir %%f /S /Q

del "D:\dev\aio-gestures\%xpi_name%" 2>nul
"C:\Program Files\7-Zip\7z.exe" a -tzip "D:\dev\aio-gestures\%xpi_name%" "D:\dev\aio-gestures-build\*"

rmdir "D:\dev\aio-gestures-build" /S /Q

if "%1"=="dbox" (
  copy /B "D:\dev\aio-gestures\%xpi_name%" "D:\Dropbox\Public\%xpi_name%"
)
