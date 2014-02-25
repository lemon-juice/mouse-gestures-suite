rmdir "D:\dev\aio-gestures-build" /S /Q
xcopy "D:\dev\aio-gestures\source" "D:\dev\aio-gestures-build" /I /E /Q

"C:\Program Files\7-Zip\7z.exe" a -tzip "D:\dev\aio-gestures-build\chrome\allinonegest.jar" "D:\dev\aio-gestures-build\chrome\*"

for /D %%f in ("D:\dev\aio-gestures-build\chrome\*") do rmdir %%f /S /Q

del "D:\dev\aio-gestures\mouse-gestures-suite-1.0.3.xpi" 2>nul
"C:\Program Files\7-Zip\7z.exe" a -tzip "D:\dev\aio-gestures\mouse-gestures-suite-1.0.3.xpi" "D:\dev\aio-gestures-build\*"

rmdir "D:\dev\aio-gestures-build" /S /Q
