; build xpi
^`::
	RunWait D:\dev\aio-gestures\aio.bat
	WinActivate, ahk_class MozillaWindowClass
	ifWinActive ahk_class MozillaWindowClass
	{
		Send ^+a
		Sleep 500
		Send ^o
		WinWait ahk_class #32770 ; Open File dialog
		Sleep 500
		SendInput D:\dev\aio-gestures\*.xpi{Enter} ; Open last xpi file in folder
		Sleep 500
		Send +{Tab}{End}{Enter}
		Sleep 1500
		Send {Enter}
		Sleep 200
		Send {Tab}{Tab}
		Sleep 400
		Send {Enter}
	}
return
