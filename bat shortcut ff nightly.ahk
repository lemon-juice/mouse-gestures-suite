!`::
	RunWait D:\dev\aio-gestures\build.bat
	;WinActivate, ahk_class MozillaWindowClass
	
	Run C:\Program Files\FFNightly\firefox.exe  "D:\dev\aio-gestures\mouse-gestures-suite-1.7.0beta5.xpi" -P "nightly" -console
	WinWait ahk_class MozillaDialogClass
	Sleep 300
	Send {Enter}
	Sleep 300
	Send !f
	Sleep 200
	Send x
	Sleep 2000
	Run C:\Program Files\FFNightly\firefox.exe -P "nightly" -console
	
	return
