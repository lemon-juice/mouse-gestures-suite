set xpi_name=mouse-gestures-suite-2.5.0a.xpi

del "D:\dev\aio-gestures\%xpi_name%" 2>nul
"C:\Program Files\7-Zip\7z.exe" a -tzip "D:\dev\aio-gestures\%xpi_name%" "D:\dev\aio-gestures\source\*"

copy /B "D:\dev\aio-gestures\%xpi_name%" "D:\www\test\xpi\%xpi_name%"
