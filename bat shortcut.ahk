; build xpi
^`::
	RunWait D:\dev\aio-gestures\aio.bat
	WinActivate, ahk_class MozillaWindowClass
	Send ^+a
return
