#! /bin/bash

#  ################### 	
#  Archivo :     cdocs-nw-updater.sh
#  Versión:      0.1.0
#  Descripción:  Este es un archivo 'sh' (Shell Bourne) ejecutable, Linux. 
#                Inherente la aplicación CDOCS-NW, se utliza en la última fase de configuración
#                de cualquier actualización. En las versiones de CDOCS-NW para distribuciones:
#                Linux y Mac OS X. 
#  Autor:        Foog.Software
#  Edición:      agosto,2016
#  Licencia:     MIT License (MIT)
#  ################### 
#

# Argumentos de entrada / Declaración de variables:
argumentosNecesarios=$#
sistemaOperativo=$1
directorioDeTrabajo=$2
rutaEjecutable=$3

# Declaración de variables:
directorioDeTrabajoActualizado="$directorioDeTrabajo.new"
directorioDeTrabajoObsoleto="$directorioDeTrabajo.old"
br="\n" # Nueva línea en texto.
gestorMensajes="desconocido"

if hash kdialog 2>/dev/null; then
gestorMensajes="Kdialog"
elif hash zenity 2>/dev/null; then
gestorMensajes="Zenity"
fi


# Declaración de funciones:
function visualizarMensajeError
{
	tipoMensaje="advertencia"

	if [ "$gestorMensajes" == "Kdialog" ]; then  
		br="<br>"  
	fi

	mensajeError="Se ha producido un error inesperado e indefinido.${br}Es posible que la actualización solicitada${br}no haya funcionado.${br}Gracias."; tipoMensaje="error_l"

	case "$1" in
	"1") mensajeError="No han llegado los parámetros esperados.${br}La actualización solicitada no puede completarse.${br}Gracias."; tipoMensaje="advertencia"
	;;
	"2")  mensajeError="No ha llegado alguno de los parámetros esperados.${br}La actualización solicitada no puede completarse.${br}Gracias."; tipoMensaje="advertencia"  
	;;
	"3") mensajeError="El 'directorio de trabajo' de la aplicación, especificado${br}no existe o su ruta carece del formato esperado.${br}La actualización solicitada no puede completarse.${br}Gracias."; tipoMensaje="advertencia"  
	;;
	"4") mensajeError="El 'archivo ejecutable' de la aplicación, especificado${br}no existe o su ruta carece del formato esperado.${br}La actualización solicitada no puede completarse.${br}Gracias."; tipoMensaje="advertencia"   
	;;
	"5") mensajeError="Se ha producido un error inesperado${br}en la ejecución del comando 'CD' (change directory).${br}La actualización solicitada no puede completarse.${br}Gracias."; tipoMensaje="error_l" 
	;;
	"6") mensajeError="El directorio de trabajo 'package.nw' no existe o no es un directorio válido.${br}Reinicia la aplicación. Si no funciona, busca el archivo:${br}'documentation.md'${br}y lee el capítulo 'Actualizaciones'.${br}Gracias."; tipoMensaje="error"   
	;;
	"7") mensajeError="El directorio 'package.nw.new' no existe o no es${br}un directorio válido (este error puede ser crítico).${br}La actualización no ha funcionado.${br}Intenta la operación de nuevo.${br}Gracias."; tipoMensaje="error_l"    
	;;
	"8") mensajeError="No se puede renombrar 'package.nw' a 'package.nw.old'.${br}El directorio puede estar en uso o carecemos de permisos${br}suficientes para ejecutar el comando 'MV' (move or rename).${br}La actualización solicitada no puede completarse.${br}Gracias."; tipoMensaje="error_l" 
	;;
	"9") mensajeError="No se puede renombrar 'package.nw.new' a  'package.nw'.${br}Es posible que no tengamos permisos${br}suficientes para ejecutar el comando 'MV' (move or rename).${br}Reinicia la aplicación. Si no funciona, busca el archivo:${br}'documentation.pdf${br}y lee el capítulo 'Actualizaciones'.${br}Gracias."; tipoMensaje="error"   
	;;
	"10") mensajeError="La ejecución del comando 'EXEC' ha fallado.${br}La actualización ha funcionado.${br}Reinicia la aplicación manualmente para comprobar${br}los cambios entre versiones.${br}Gracias."; tipoMensaje="advertencia"   
	;;
	esac

	if [ "$tipoMensaje" == "advertencia" ]; then
		anuncio="ATENCIÓN ...${br}${br}"
	elif [ "$tipoMensaje" == "informativo" ]; then
		anuncio=""
	elif [ "$tipoMensaje" == "error" ]; then
		anuncio="ERROR CRÍTICO ...${br}${br}"
	else
		anuncio="ERROR ...${br}${br}"
	fi	  


	if [ "$gestorMensajes" == "Zenity" ]; then       
		texto="<b>$anuncio</b>$mensajeError"      
		if [ "$tipoMensaje" == "advertencia" ]; then   
			zenity --warning --title="CDOCS : ACTUALIZACIONES" --text="$texto"
			exit 0
		elif [ "$tipoMensaje" == "informativo" ]; then 
			zenity --info --title="CDOCS : ACTUALIZACIONES" --text="$texto"
			exit 0
		else
			zenity --error --title="CDOCS : ACTUALIZACIONES" --text="$texto"
			exit 0	
		fi
	elif [ "$gestorMensajes" == "Kdialog" ]; then
		texto="<b>$anuncio</b>$mensajeError<hr>"
		if [ "$tipoMensaje" == "advertencia" ]; then   
			kdialog --title "CDOCS : ACTUALIZACIONES " --sorry "$texto"
			exit 0 
		elif [ "$tipoMensaje" == "informativo" ]; then   
			kdialog --title "CDOCS : ACTUALIZACIONES " --msgbox "$texto"
			exit 0 
		else
			kdialog --title "CDOCS : ACTUALIZACIONES " --error "$texto"
			exit 0 
		fi
	else
		if hash gnome-terminal 2>/dev/null; then
			gnome-terminal -x sh -c "printf 'CDOCS : ACTUALIZACIONES\n\n$anuncio\n$mensajeError\n\n********\n\n';exec bash"
			exit 0
		elif hash konsole 2>/dev/null; then
			konsole -p tabtitle="CDOCS : ACTUALIZACIONES" --noclose  -e "printf '\n\n$anuncio$mensajeError\n\n********\n\n'"
			exit 0
		else
			if [ "$sistemaOperativo" == "macosx" ]; then
				textoOSX="\n\n$anuncio$mensajeError\n\n********\n\n"
				osascript -e 'tell app "System Events" to display dialog "'"textoOSX"'" buttons "ACEPTAR" default button 1 with icon 0 with title "CDOCS : ACTUALIZACIONES"' 
				exit 0
			else	
				xterm -hold -T "CDOCS : ACTUALIZACIONES" -e "printf '\n\n$anuncio$mensajeError\n\n********\n\n'"
				exit 0
			fi
		fi
	fi
	exit 0
}

# Primera comprobación de errores



if [ $# -lt 3 ] ||  [ $# -gt 3 ]; then
	visualizarMensajeError "1"
fi

if [  -z "$1" ] || [  -z "$2" ] || [  -z "$3" ]; then
	visualizarMensajeError "2"
fi

if [ ! -d "$directorioDeTrabajo" ]; then
	visualizarMensajeError "3"
fi

if [ ! -e "$rutaEjecutable" ]; then
	visualizarMensajeError "4"
fi




#Espera
sleep 2 

#Renombra:

if [ ! -d "$directorioDeTrabajo" ]; then
	visualizarMensajeError "6"
fi

if [ ! -d "$directorioDeTrabajoActualizado" ]; then
	visualizarMensajeError "7"
fi

mv "$directorioDeTrabajo" "$directorioDeTrabajoObsoleto" || visualizarMensajeError "8"

mv "$directorioDeTrabajoActualizado"  "$directorioDeTrabajo" || visualizarMensajeError "9"

if [ "$sistemaOperativo" == "macosx" ]; then
	actualizado="\n\nActualización completada con éxito.\nReinicia la aplicación.\nGracias.\n\n********\n\n"
	osascript -e 'tell app "System Events" to display dialog "'"actualizado"'" buttons "ACEPTAR" default button 1 with icon 0 with title "CDOCS : ACTUALIZACIONES"' 
exit 0
else	
	exec "$rutaEjecutable" || visualizarMensajeError "10"
fi

exit 0
