'  ################### 	
'  Archivo :     cdocs-nw-updater-windows.vbs
'  Versión:      0.1.0
'  Descripción:  Este es un archivo 'VBScript' (Visual Basic Script Edition), lenguaje interpretado por el sistema operativo Windows, 
'                inherente la aplicación CDOCS-NW. Se utiliza en la última fase de actualización de la aplicación CDOCS-NW.
'  Autor:        Foog.Software
'  Edición:      agosto, 2016
'  
'  Nota:         Este archivo se editó con 'Notepad++' (programa gratuito para Windows) y fue codificado como UCS-2 Little Endian,
'                para visualizar correctamente los caracteres del conjunto UTF-8.
'  ################### 

' # Declaración de variables
Dim argumentos, directorioDeTrabajo, directorioDeTrabajoNuevo, directorioDeTrabajoObsoleto, rutaArchivoEjecutable

'  # Asignación de objetos VBScript
Set fso = CreateObject("Scripting.FileSystemObject")
'  # Declaración de funciones
Function mostrarErrorDefinido(numError)
	Select Case numError
		Case 1
		mensaje = "ATENCIÓN ..." & CHR(13) & "No han llegado los parámetros esperados para continuar" & CHR(13) & "con el proceso de actualización de la aplicación." & CHR(13) & "Gracias."
		icono = 48
		Case 2
		mensaje = "ATENCIÓN ..." & CHR(13) & "La ruta especificada para el Directorio de Trabajo"  & CHR(13) & "de la aplicación no es correcta." & CHR(13) & "El proceso de actualización se ha detenido." & CHR(13) & "Gracias."
		icono = 48	
		Case 3
		mensaje = "ATENCIÓN ..." & CHR(13) & "La ruta especificada para el Archivo Ejecutable"  & CHR(13) & "de la aplicación no es correcta." & CHR(13) & "El proceso de actualización se ha detenido." & CHR(13) & "Gracias."
		icono = 48
		Case 4
		mensaje = "ERROR CRÍTICO ..." & CHR(13) & "No se ha encontrado el Directorio de Trabajo 'package.nw'."  & CHR(13) & "El proceso de actualización se ha detenido." & CHR(13) & "Reinicia la aplicación manualmente, si no funciona" & CHR(13) & "busca, 'documentation.pdf' y lee" & CHR(13) & "el capítulo 'Actualizaciones'. Gracias."
		icono = 16
		Case 5
		mensaje = "ATENCIÓN ..." & CHR(13) & "No se ha encontrado el directorio 'package.nw.new' con los" & CHR(13) & "archivos nuevos."  & CHR(13) & "El proceso de actualización se ha detenido." & CHR(13) & "Reinicia manualmente la aplicación e intenta la operación de nuevo." & CHR(13) & "Gracias."
		icono = 48
		Case 6
		mensaje = "ERROR ..." & CHR(13) & "No ha sido posible renombrar el directorio" & CHR(13) & "package.nw' a 'package.nw.old'." & CHR(13) & "El directorio 'package.nw' está ocupado o no" & CHR(13) & "tenemos los permisos necesarios."  & CHR(13) & "El proceso de actualización se ha detenido." & CHR(13) & "Gracias."
		icono = 16
		Case 7
		mensaje = "ERROR CRÍTICO ..." & CHR(13) & "No ha sido posible renombrar el directorio" & CHR(13) & "package.nw.new' a 'package.nw'." & CHR(13) & "El directorio 'package.nw.new' no existe o no" & CHR(13) & "tenemos los permisos necesarios."  & CHR(13) & "El proceso de actualización se ha interrumpido." & CHR(13) & "Reinicia la aplicación manualmente, si no funciona" & CHR(13) & "busca 'documentation.pdf' y lee" & CHR(13) & "el capítulo 'Actualizaciones'. Gracias."
		icono = 16	
		Case 8
		mensaje = "No ha sido posible reiniciar la aplicación de forma automática."& CHR(13) & "El proceso de actualización ha concluido con éxito." & CHR(13) & "Reinicia la aplicación manualmente para comprobar los" & CHR(13) & "cambios entre versiones." & CHR(13) & "Gracias."
		icono = 64
		Case Else		
		mensaje = "ERROR ..." & CHR(13) & "Se producido un error inesperado." & CHR(13) & "El proceso de actualización puede que no haya funcionado." & CHR(13) & "Gracias."
		icono = 16		
	End Select
	
	MsgBox mensaje, icono, "CDOCS : ACTUALIZACIONES"
	Err.Clear
	WScript.Quit 0

End Function

'  # Comprueba argumentos de entrada.
if WScript.Arguments.Count <> 2 then
	mostrarErrorDefinido(1)
else
	directorioDeTrabajo = WScript.Arguments(0)
	rutaArchivoEjecutable = WScript.Arguments(1)
end if

' # Asignación de variables
directorioDeTrabajoNuevo = directorioDeTrabajo & ".new"
directorioDeTrabajoObsoleto = directorioDeTrabajo & ".old"

'  # Comprueba si existen los directorios necesarios.
if NOT (fso.FolderExists(directorioDeTrabajo)) then
	Set fso = Nothing
	mostrarErrorDefinido(2)
end if

if NOT (fso.FileExists(rutaArchivoEjecutable)) then
	Set fso = Nothing
	mostrarErrorDefinido(3)
end if


if NOT (fso.FolderExists(directorioDeTrabajoNuevo)) then
	Set fso = Nothing
	mostrarErrorDefinido(5)
end if

'  # Elimina 'package.nw.old' (copia de seguridad de alguna actualización anterior), si existe.
if (fso.FolderExists(directorioDeTrabajoObsoleto)) then
	fso.DeleteFolder directorioDeTrabajoObsoleto, True
	Set fso = Nothing
end if

'  # Detiene la ejecución de este guión durante dos segundos (para asegurarnos que la aplicación nativa está cerrada).
WScript.Sleep 2000


On Error Resume Next
'  # Renombra 'package.nw' a 'package.nw.old'.
fso.MoveFolder directorioDeTrabajo, directorioDeTrabajoObsoleto

If Err.Number <> 0 Then
  mostrarErrorDefinido(6) 
End If

'  # Renombra 'package.nw.new' a 'package.nw'.
fso.MoveFolder directorioDeTrabajoNuevo, directorioDeTrabajo

If Err.Number <> 0 Then
  mostrarErrorDefinido(7)  
End If

'  # Si todo ha ido bien, lanza la aplicación actualizada.
Dim objShell
Set objShell = WScript.CreateObject( "WScript.Shell" )
objShell.Run(rutaArchivoEjecutable)
Set objShell = Nothing

If Err.Number <> 0 Then
  mostrarErrorDefinido(8)  
End If

WScript.Quit 0
