SET /A errorNum=0
SET actualizador=%~p0%cdocs-nw-updater-windows.vbs
SET directorioDeTrabajoApp=%1
SET archivoEjecutableApp=%2
IF [%directorioDeTrabajoApp%]==[] GOTO salida_error_6009 
IF [%archivoEjecutableApp%]==[] GOTO salida_error_6009 
IF NOT EXIST %actualizador% GOTO salida_error_6010
START  /D %~p0  %actualizador% %directorioDeTrabajoApp% %archivoEjecutableApp% && (GOTO salida) || (GOTO salida_error_6011)
:salida_error_6009
SET /A errorNum=6009
GOTO salida
:salida_error_6010
SET /A errorNum=6010
GOTO salida
:salida_error_6011
SET /A errorNum=6011
GOTO salida
:salida
EXIT /B %errorNum%