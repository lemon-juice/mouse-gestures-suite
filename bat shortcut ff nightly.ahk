﻿!`::
	RunWait D:\dev\aio-gestures\aio.bat
	;WinActivate, ahk_class MozillaWindowClass
	
	Run C:\Program Files\FFNightly\firefox.exe  "D:\dev\aio-gestures\mouse-gestures-suite-1.7.0alpha1.xpi" -P "nightly" -console
	WinWait ahk_class MozillaDialogClass
	Sleep 1700
	Send {Enter}
	Sleep 300
	Send !f
	Sleep 200
	Send x
	Sleep 2000
	Run C:\Program Files\FFNightly\firefox.exe -P "nightly" -console
	
	return
