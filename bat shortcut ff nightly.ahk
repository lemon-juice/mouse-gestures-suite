!`::
	RunWait D:\dev\aio-gestures\aio.bat
	WinActivate, ahk_class MozillaWindowClass
	ifWinActive ahk_class MozillaWindowClass
	{
		SetKeyDelay 40
		Send ^+a
		Sleep 700
		Send ^o
		WinWait ahk_class #32770 ; Open File dialog
		Sleep 200
		Send !d
		Sleep 200
		SendInput D:\dev\aio-gestures
		Send {Enter}
		Sleep 500
		Send !n
		Sleep 200
		; Open last xpi file in folder
		SendInput *.xpi
		Send {Enter}
		Sleep 500
		Send +{Tab}{End}{Enter}
		Sleep 2000
		Send {Enter}
		Sleep 200
		Send !fx
		Sleep 2000
		Run C:\Program Files\FFNightly\firefox.exe -P "nightly" -console
	}
return
