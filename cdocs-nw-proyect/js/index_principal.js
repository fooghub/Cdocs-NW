/** @preserve
* cdocs-nw // index_principal.js - Javascript
* Versión 0.1.0
* Fecha de edición/revisión: 25/03/2017
* Copyright (c) 2004 - 2017 Foog.Software
* MIT License (MIT).
*********************************************************/

/*************************************
* Declaración de variables y funciones globales - JAVASCRIPT con la API de NW.js:
**************************************/
/*************************************
* Declaración de variables globales - Módulos nativos de NW.js y Node.js, requeridos:
**************************************/
/* jshint undef: true, unused: true, eqeqeq: true, browser: true, node: true, loopfunc: true */
/* globals nw, chrome, documentarIdioma, IBAN, documentarErrorAJAX, obtenerPaises, obtenerProvincia, buscarTipoNIF, obtenerPaises, crearArchivoPDF, formatearBytes */

/*NW.js - API -*/
//"nw" (NW.js) : Es el Objeto Global que contiene toda la interfaz de programación de aplicaciones (API) de NW.js. El objeto "nw" es el legado o heredero del módulo "nw-gui" utilizado en las versiones 0.12 y posteriores de NW.js. Necesitaba de la función "require" para cargar en la aplicación la "interfaz gráfica del usuario" (var nw = require("nw-gui")).
nw.Screen.Init(); // NW.js : Puesta en marcha del objeto 'Screen' (patrón con una sóla instancia), la llamada a esta función debe realizarse una sóla vez. 
/*Node.js - API - (Módulos nativos integrados en  NW.js)*/
var os = require("os"); // Node.js OS : Proporciona algunas funciones básicas de utilidad relacionadas con el sistema operativo. 
var dns = require("dns"); // Node.js DNS : Sistema de Nombres de Dominio.
var path = require("path"); // Node.js  Path : Este módulo contiene utilidades para manejar y transformar rutas de archivo.
var exec = require("child_process").exec; // Node.js: El módulo child_process proporciona la capacidad de generar procesos secundarios. Método 'exec'. Genera un proceso secundario (hijo) de forma asíncrona, permiten especificar una función de devolución de llamada que se invoca cuando termina el proceso secundario. 
//var spawn = require("child_process").spawn; // Node.js: El módulo child_process proporciona la capacidad de generar procesos secundarios. Método 'spawn'. Genera un proceso secundario (hijo) de forma asíncrona, sin bloqueos. (Variable/constante declarada en el ámbito de la función: actualizaciones.configurar).
//var http = require("http"); // Node.js HTTP : Las interfaces HTTP. (Variable/constante declarada en el ámbito de la función: actualizaciones.descargar).
//var https = require("https"); // Node.js HTTP : Las interfaces HTTPS. (Variable/constante declarada en el ámbito de la función: actualizaciones.descargar).
/*Node.js - API - (Módulos de terceros) */
var fs = require("fs-extra"); // Agrega métodos de sistema de archivos que no se incluyen en el módulo fs nativo.
var walkSync = require('walk-sync'); //Devuelve una matriz que contiene las propiedades de todos los archivos y subdirectorios encontrados en un directorio determinado.
//var marked = require("marked"); //Un ligero analizador de código markdown. (Variable/constante declarada en el ámbito de la función: traducirMD). 
//var unzip = require("unzip"); // Descomprime archivos '.zip' (multiplataforma), compatible con fs.ReadStream. (Variable/constante declarada en el ámbito de la función: actualizaciones.desempaquetar). 

var ventanaPrincipal = nw.Window.get();
var ventanasSecundariasAbiertas = [];
var ventanaSecundariaLicencia_orden = -1;
var ventanaSecundariaMarkdown_orden = -1;
var ventanaSecundariaWebview_orden = -1;
var numVentanasSecundariasAbiertas = 0;
var ventanaPrincipalMinimizada = false;
var ventanaPrincipalFoco = true;
var iconoBandeja = null;
var mnuEmergente= null;
var mnuContextoBandeja = null;
var alertaSalida = null;
var propiedadesEquipo = {
	arquitectura: "",
	obtenerArquitectura: function(){
	var procesoHijo = null;	
		if(/^windows/i.test(os.type())){
			
			procesoHijo = exec("wmic OS get OSArchitecture",function(error, stdout, stderr){				
				if (error) {
					propiedadesEquipo.arquitectura = "";	
					propiedadesEquipo.sistemaOperativoNombreComercial =	propiedadesEquipo.sistemaOperativoNombreComercial + propiedadesEquipo.arquitectura;	
					return;
				}
				
				if(/64/.test(stdout)){
				propiedadesEquipo.arquitectura = "64 bits";	
				propiedadesEquipo.sistemaOperativoNombreComercial =	propiedadesEquipo.sistemaOperativoNombreComercial + " (" + propiedadesEquipo.arquitectura + ").";
				}else if(/32/.test(stdout)){
				propiedadesEquipo.arquitectura = "32 bits";	
				propiedadesEquipo.sistemaOperativoNombreComercial =	propiedadesEquipo.sistemaOperativoNombreComercial + " (" + propiedadesEquipo.arquitectura + ").";	
				}else{
				propiedadesEquipo.arquitectura = "";	
				propiedadesEquipo.sistemaOperativoNombreComercial =	propiedadesEquipo.sistemaOperativoNombreComercial + propiedadesEquipo.arquitectura;	
				}			 		
			});
		}else{
			procesoHijo = exec("uname -m",function(error, stdout, stderr){				
				if (error) {
					propiedadesEquipo.arquitectura = "";	
					propiedadesEquipo.sistemaOperativoNombreComercial =	propiedadesEquipo.sistemaOperativoNombreComercial + propiedadesEquipo.arquitectura;	
					return;
				}
				propiedadesEquipo.arquitectura = stdout;
				propiedadesEquipo.sistemaOperativoNombreComercial =	(propiedadesEquipo.arquitectura !== "") ? propiedadesEquipo.sistemaOperativoNombreComercial + " — " + propiedadesEquipo.arquitectura : propiedadesEquipo.sistemaOperativoNombreComercial;
						 		
			});
			
		}
	},
	procesador : os.cpus()[0].model,
	tipo: "",
	sistemaOperativo : "",
	sistemaOperativoNombreComercial : "",
	sistemaOperativoNombreInterno : "",
	sistemaOperativoArquitectura : "",
	sistemaOperativoAlias : ((/^windows/i.test(os.type())) ? "windows" : (/^darwin/i.test(os.type())) ? "macosx" : "linux"),
	obtenerSistema : function(){
		var procesoHijo = null;
		var tipo = os.type();
		var plataforma = os.platform();
		var lanzamiento = os.release();	
		var abreviatura = (/^win/.test(plataforma)) ? "win" : plataforma.toLowerCase();
		var versionesWindows = {
			// Continuará ...
			"10.0" : "Windows 10",
			"6.3"  : "Windows 8.1",
			"6.2"  : "Windows 8",
			"6.1"  : "Windows 7",
			"6.0"  : "Windows Vista",
			"5.2"  : "Windows XP Professional",
			"5.1"  : "Windows XP",
			"4.90" : "Windows ME",
			"5.0"  : "Windows 2000",
			"4.10" : "Windows 98",
			"4.0"  : "Windows NT 4.0",
			"4.00" : "Windows 95"
		};
	var versionesDarwin = {
		//Darwin es el sistema operativo subyacente en MAC OS X. Esta relación muestra la relación entre el número de
		//versión de Darwin con el nombre comercial del sistema MAC OS X correspondiente.
		"0.1" : "Hera",	
		"0.2" : "Hera",	
		"1.0" : "Hera",
		"1.1" : "Hera",
		"1.2.1" : "Kodiak",
		"1.3.1" : "Cheetah",
		"1.4.1" : "Puma",
		"5.1" : "Puma",
		"5.5": "Puma",
		"6.0.1": "Jaguar",
		"6.8" : "Jaguar",
		"7.0" : "Panther",
		"7.9": "Panther",
		"8.0" : "Tiger",
		"8.11" : "Tiger",
		"9.0" : "Leopard",
		"9.8" : "Leopard",
		"10.0" : "Snow Leopard",
		"10.8" : "Snow Leopard",
		"11.0.0" : "Lion",
		"11.4.2" : "Lion",
		"12.0.0" : "Mountain Lion",
		"12.6.0" : "Mountain Lion",
		"13.0.0" : "Mavericks",
		"13.4.0" : "Mavericks",
		"14.0.0" : "Yosemite",
		"14.5.0" : "Yosemite",
		"15.0.0" : "El Capitan",
		"15.6.0" : "El Capitan",
		"16.0.0" : "Sierra",
		"16.1.0" : "Sierra",
		"16.3.0" : "Sierra"
		// Continuará ...
	};
	if (abreviatura === "win"){
		var versionesWindowsNum = (lanzamiento.match(/\d+\.\d+/) !== null) ? lanzamiento.match(/\d+\.\d+/)[0] : "";
		if (versionesWindows.hasOwnProperty(versionesWindowsNum)) {
			propiedadesEquipo.sistemaOperativoNombreComercial =  versionesWindows[versionesWindowsNum];
			propiedadesEquipo.obtenerArquitectura();
		} else {
			propiedadesEquipo.sistemaOperativoNombreComercial = "Windows"; 
		}
	}else if(abreviatura === "linux"){		
		procesoHijo = exec("cat /etc/issue", function(error, stdout, stderr){
			if(stdout){
				propiedadesEquipo.sistemaOperativoNombreComercial = stdout;
				propiedadesEquipo.sistemaOperativoNombreComercial = propiedadesEquipo.sistemaOperativoNombreComercial.replace(/kernel|on|an|\\r|\\m|\\n|\\l|\(|\)/ig, "");
				propiedadesEquipo.obtenerArquitectura();
				
			}
			if(stderr){
			  
				propiedadesEquipo.sistemaOperativoNombreComercial = "Linux";
				propiedadesEquipo.obtenerArquitectura();
			}
			if (error !== null) {
				propiedadesEquipo.sistemaOperativoNombreComercial = "Linux";
				propiedadesEquipo.obtenerArquitectura();
			}
		});
	}else if(abreviatura === "aix"){

	  propiedadesEquipo.sistemaOperativoNombreComercial =  "AIX";

	}else if(abreviatura === "freebsd"){
	  
	  propiedadesEquipo.sistemaOperativoNombreComercial =  "FreeBSD";

	}else if(abreviatura === "openbsd"){

		propiedadesEquipo.sistemaOperativoNombreComercial =  "OpenBSD"; 

	}else if(abreviatura === "sunos"){

		propiedadesEquipo.sistemaOperativoNombreComercial =  "SunOS"; 

	}else if(abreviatura === "darwin"){	

		var versionesDarwinNum = (lanzamiento.match(/(?:(\d+)\.)?(?:(\d+)\.)?(\*|\d+)$/) !== null) ? lanzamiento.match(/(?:(\d+)\.)?(?:(\d+)\.)?(\*|\d+)$/)[0] : "";
		if (versionesDarwin.hasOwnProperty(versionesDarwinNum)) {
			propiedadesEquipo.sistemaOperativoNombreComercial =  "Mac OS X " + versionesDarwin[versionesDarwinNum];
			propiedadesEquipo.obtenerArquitectura();
		} else {
			propiedadesEquipo.sistemaOperativoNombreComercial = "Mac OS X"; 
			propiedadesEquipo.obtenerArquitectura();
		}
	}else{
		propiedadesEquipo.sistemaOperativoNombreComercial =  plataforma.toUpperCase();
	}

	propiedadesEquipo.sistemaOperativoNombreInterno = tipo.replace(/_/g," ") + " " + lanzamiento;
	if(propiedadesEquipo.sistemaOperativoNombreInterno === this.sistemaOperativoNombreComercial){
		propiedadesEquipo.sistemaOperativoNombreInterno = "";
	}
	propiedadesEquipo.sistemaOperativo = plataforma;	
	},
	
	obtenerIdioma :function(){		
		var abreviaturaIdioma = (process.env.LANG) ? process.env.LANG : "";
		abreviaturaIdioma = (abreviaturaIdioma.length > 2) ? abreviaturaIdioma.substring(0, 2): abreviaturaIdioma;
		var nombreIdioma = documentarIdioma(abreviaturaIdioma);
		if(nombreIdioma !== "undefined"){
			propiedadesEquipo.idioma = "<span class='texto-talla-xs'><span>Idioma&#160;—&#160;<span class='texto-falsa-negrita'>" + nombreIdioma.capitalizarPrimeraLetra() + "</span><span>.</span></span>";
		}else{
			propiedadesEquipo.idioma = "";
		}
	},	
	idioma : "",
	pantalla : {
		anchuraTotal : null,
		alturaTotal : null,
		anchuraDisponible : null,
		alturaDisponible : null,
		profundidadColor : null,
		esquemaColor : null,	
		tablaInformativa : "",		
		monitores : null, 
		ratio : null, //
	},
	
	obtenerPropiedadesPantalla : function(){
		var magnitudes = [], tablaInformativa = true;
		if(screen && typeof screen === "object"){
			propiedadesEquipo.pantalla.anchuraTotal = (screen.width) ? screen.width : null;
			propiedadesEquipo.pantalla.alturaTotal = (screen.height) ? screen.height : null;
			propiedadesEquipo.pantalla.anchuraDisponible = (screen.availWidth) ? screen.availWidth : null;
			propiedadesEquipo.pantalla.alturaDisponible = (screen.availHeight) ? screen.availHeight : null;
			propiedadesEquipo.pantalla.profundidadColor = (screen.colorDepth) ? screen.colorDepth : null;
			propiedadesEquipo.pantalla.esquemaColor = (screen.pixelDepth) ? screen.pixelDepth : null;
		}	
			propiedadesEquipo.pantalla.monitores = (nw.Screen.screens && nw.Screen.screens.length > 0) ? nw.Screen.screens.length : null;
			propiedadesEquipo.pantalla.ratio = (window.devicePixelRatio) ? window.devicePixelRatio : null;			
		
		magnitudes = [propiedadesEquipo.pantalla.anchuraTotal, propiedadesEquipo.pantalla.alturaTotal, propiedadesEquipo.pantalla.profundidadColor, propiedadesEquipo.pantalla.monitores, propiedadesEquipo.pantalla.ratio];
		for(contador = 0; contador < magnitudes.length; contador++){
			if(magnitudes[contador] === null){
				tablaInformativa = false;
				break;
			}
		}
		if(tablaInformativa){
			propiedadesEquipo.pantalla.tablaInformativa = "<table class='texto-talla-xs'><tr><td rowspan='4' class='porcentaje6 imagen-medio texto-izquierda'><img src='images/png/pantalla_14.png' alt='' title='' width='14' height='14'></td><td class='porcentaje32'>Resolución de pantalla</td><td class='porcentaje6 texto-centrado'>—</td><td class='porcentaje56'>" + propiedadesEquipo.pantalla.anchuraTotal + "&#160;&#215;&#160;" + propiedadesEquipo.pantalla.alturaTotal + " píxeles.</td></tr><tr><td>Profundidad de color</td><td class='texto-centrado'>—</td><td>" + propiedadesEquipo.pantalla.profundidadColor + "&#160;bits&#160;&#215;&#160;píxel.</td></tr><tr><td>Píxel ratio</td><td class='texto-centrado'>—</td><td>"+ propiedadesEquipo.pantalla.ratio.toFixed(2) + "</td></tr><tr><td>Monitores</td><td class='texto-centrado'>—</td><td>" + propiedadesEquipo.pantalla.monitores + "</td></tr></table></table>";
		}else{
			propiedadesEquipo.pantalla.tablaInformativa ="";
		}				
	}
};
	
	var propiedadesPrograma = {
		arquitectura : ((/64/.test( os.arch())) ? "64-bit" :  (/32/.test( os.arch())) ? "32-bit" : ""), //os.arch(), devuelve la arquitectura de compilación de la aplicación.	
		versiones : {
		larga : nw.App.manifest.version,
		corta: nw.App.manifest.version.match(/\d+\.\d+/)[0],
		tipo: nw.App.manifest.release_version
		},
		tirada: (new obtenerFecha(nw.App.manifest.edition).mes.capitalizarPrimeraLetra() + ", " + new obtenerFecha(nw.App.manifest.edition).aaaa),
		serie: nw.App.manifest.series,
		nombre : nw.App.manifest.app_name.toUpperCase(),
		baseDatosFecha	: (new obtenerFecha(nw.App.manifest.db_date).mes.capitalizarPrimeraLetra() + ", " + new obtenerFecha(nw.App.manifest.db_date).aaaa),
		identificador : nw.App.manifest.name,
		motorNW : process.versions.nw,
		entornoNODE: process.versions.node,
		saborNW : ((nw.App.nwjs_flavor && /sdk/i.test(nw.App.nwjs_flavor)) ? "SDK" : ""),
		visorPDF :((detectarComplementoVisorPDF()) ? detectarComplementoVisorPDF() : ""),
		motorNWcomercial : process.versions["node-webkit"].match(/\d+\.\d+\.\d+/)[0],
		chromium : process.versions.chromium,
		webkit: ((navigator.userAgent && navigator.userAgent.match(/applewebkit\/(?:(\d+)\.)?(?:(\d+)\.)?(\*|\d+)/ig) !== null) ? navigator.userAgent.match(/applewebkit\/(?:(\d+)\.)?(?:(\d+)\.)?(\*|\d+)/ig)[0].replace(/applewebkit\//i,"") : " ... "),
		permisos : {webview:false},
		notificaciones : "",
		
		obtenerEstadoNotificaciones : function(){			
			if(chrome.notifications.getPermissionLevel && typeof chrome.notifications.getPermissionLevel === "function"){
				chrome.notifications.getPermissionLevel(function(permiso){
					if(permiso === "granted"){
						propiedadesPrograma.notificaciones = "SI.";
					}else{
						propiedadesPrograma.notificaciones = "<span>NO&#160;</span><span class='texto-talla-xs'>(permiso denegado por el Sistema)</span>.";
					}						
				});			
			}else{
				propiedadesPrograma.notificaciones = "<span>NO&#160;</span><span class='texto-talla-xs'>(sin soporte en Chromium " +  propiedadesPrograma.chromium + ")</span>.";
			}	
		},
		audio: "",
		obtenerEstadoAudio : function(){
		//No se utiliza	en la aplicación. Causa problemas en distribuciones Linux.			
			if(navigator.webkitGetUserMedia){
				navigator.webkitGetUserMedia({audio:true}, function(acierto){
					propiedadesPrograma.audio = "SI.";
				}, function(fallo){
					propiedadesPrograma.audio = "ERROR : Could not connect stream.";
				});
			}else{
				propiedadesPrograma.audio = "webRTC no disponible.";
			}			
		},
		repositorio : {git : "", actualizaciones : ""},
		obtenerRepositorios : function(){
			var repositorios = nw.App.manifest.repositories;			
			if(repositorios !== null){
				for (var i in repositorios){
					if(repositorios[i].type === "git"){
						propiedadesPrograma.repositorio.git = repositorios[i].url;
					}
					if(repositorios[i].type === "remote"){
						propiedadesPrograma.repositorio.actualizaciones = repositorios[i].url;
					}					
				}
			}
		},
		directorioTemporal : os.tmpdir(),
		directorioDatos : nw.App.dataPath,
		directorioEjecutable : path.dirname(process.execPath),
		archivoEjecutable : process.execPath,
		capturasPantalla : path.resolve((process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE).toString()) + path.sep + "cdocs-screenshots"	
	};
	
	var atajoTecladoImprimir = null;
	var notificarNuevasVersiones = false;
	
/*************************************
* Declaración de variables y funciones globales - JAVASCRIPT de propósito general:
**************************************/	
var fechaSistema; 
var formulario = "", formularios = ["home", "iban", "ccc", "ntc", "nif", "dni", "nie", "naf", "cccss", "update", "about", "options"];
var formularioPrecedente_about = false;
var botones = ["botones-mnu", "botones-inicio", "botones-nuevo", "botones-imprimir", "botones-validar"];
var teclasRestringidas = [8, 9, 16, 17, 18, 19, 20, 27, 34, 35, 36, 37, 38, 39, 40, 44, 45, 46];
var iconos = ["images/gif/giro_14.gif", "images/png/pantalla_14.png","images/png/gear_14.png", "images/png/barras.png", "images/png/barras-base.png", "images/png/barras-blanco.png","images/png/ok.png","images/png/info_14.png", "images/png/grid_14.png", "images/png/gato_14.png", "images/png/ok.png", "images/png/inspector_win_lnx.png", "images/png/inspector_macosx.png", "images/png/alerta.png", "images/png/logo64_0.png", "images/png/logo64_1.png", "images/png/delete.png", "images/png/alerta_128.png"];

var errorValidar = false;
var errorAJAX = false;
var plantillaAlertaEsperaPDF = "<span><img src='images/png/info_14.png' alt='' title='' class='alerta-imagen-info'></span><span class='alerta-texto-info'> ... creando archivo PDF. Un momento por favor.</span></span>";
var plantillaAlertaInfoPDF = "<span><img src='images/png/info_14.png' alt='' title='' class='alerta-imagen-info'></span><span class='alerta-texto-info'> ... pulsa &#171;IM<u>P</u>RIMIR&#187; para más detalles (PDF).</span></span>";
var formularioActivo = "";
var urlEntidad = "";
var formularioValorOculto = "";
var erroresIBAN;
var contador = 0;
var espera, demora, aplazamientoCierreProtector, intervalo;

var protector = {
	activo: false,	
	abrir: function(){
		this.activo = true;
		document.getElementById("protector").style.width = "100%";
		document.getElementById("protector").style.height = "100%";
		document.getElementById("protector").style.cursor = "wait";
	},	
	cerrar: function(demoraCierre){
		demoraCierre = demoraCierre || 0;
		demoraCierre = (!isNaN(demoraCierre)) ? parseInt(demoraCierre, 10) : 0;
		this.activo = false;
		if(demoraCierre === 0){
			clearTimeout(aplazamientoCierreProtector);
			document.getElementById("protector").style.cursor = "default";
			document.getElementById("protector").style.width = "1px";
			document.getElementById("protector").style.height = "1px";
		}else{
			clearTimeout(aplazamientoCierreProtector);
			aplazamientoCierreProtector = setTimeout(function(){
				document.getElementById("protector").style.cursor = "default";
				document.getElementById("protector").style.width = "1px";
				document.getElementById("protector").style.height = "1px";				
			}, demoraCierre);
		}
	}
};




/**
* Función - eliminarEspaciosEnBlanco - Elimina todos los espacios en blanco, en cualquier posición de una cadena.
* Ensayo con 'prototipos' Javascript.
**/
String.prototype.eliminarEspaciosEnBlanco = function(){
	var exreg0 =  new RegExp("(?:(?:^|\\n)\\s+|\\s+(?:$|\\n))", "g");
	var exreg1 =  new RegExp("\\s+", "g");
	return this.replace(exreg0,"").replace(exreg1,"");		
};



/**
* Función - asociarEventos - Asociación de escucha de los eventos necesarios, elementos y estado de los formularios, una vez cargados.
**/
function asociarEventos(formulario){
	
	for(contador = 0; contador< document.forms[0].length; contador += 1){if(document.forms[0].elements[contador].type === "text"){document.forms[0].elements[contador].focus();break;}}
	
	switch(formulario){
		case "home" :
			document.getElementById("iban-home").addEventListener("click", function(){cargarFormulario("iban");}, false);
			document.getElementById("ccc-home").addEventListener("click", function(){cargarFormulario("ccc");}, false);
			document.getElementById("ntc-home").addEventListener("click", function(){cargarFormulario("ntc");}, false);
			document.getElementById("nif-home").addEventListener("click", function(){cargarFormulario("nif");}, false);
			document.getElementById("dni-home").addEventListener("click", function(){cargarFormulario("dni");}, false);
			document.getElementById("nie-home").addEventListener("click", function(){cargarFormulario("nie");}, false);
			document.getElementById("naf-home").addEventListener("click", function(){cargarFormulario("naf");}, false);
			document.getElementById("cccss-home").addEventListener("click", function(){cargarFormulario("cccss");}, false);
		break;
		case "iban" :
			urlEntidad = "";
			document.forms[formulario].elements[0].addEventListener("keydown",function(){permitirSolo(event,"letra");}, false);
			document.forms[formulario].elements[0].addEventListener("keyup",function(){capitalizar(this); tabular(event, 0); borrarAlerta(event);}, false);
			document.forms[formulario].elements[1].addEventListener("keydown",function(){permitirSolo(event,"num");}, false);
			document.forms[formulario].elements[1].addEventListener("keyup",function(){tabular(event, 1); borrarAlerta(event);}, false);
			document.forms[formulario].elements[2].addEventListener("keydown",function(){permitirSolo(event,"numLetra");}, false);
			document.forms[formulario].elements[2].addEventListener("keyup",function(){capitalizar(this);borrarAlerta(event);}, false);
		break;
		case "ccc" :
			urlEntidad = "";
			document.forms[formulario].elements[0].addEventListener("keydown",function(){permitirSolo(event,"num");}, false);
			document.forms[formulario].elements[0].addEventListener("keyup",function(){capitalizar(this); tabular(event, 0); borrarAlerta(event);}, false);
			document.forms[formulario].elements[1].addEventListener("keydown",function(){permitirSolo(event,"num");}, false);
			document.forms[formulario].elements[1].addEventListener("keyup",function(){tabular(event, 1); borrarAlerta(event);}, false);
			document.forms[formulario].elements[2].addEventListener("keydown",function(){permitirSolo(event,"num");}, false);
			document.forms[formulario].elements[2].addEventListener("keyup",function(){tabular(event, 2); borrarAlerta(event);}, false);
			document.forms[formulario].elements[3].addEventListener("keydown",function(){permitirSolo(event,"num");}, false);
			document.forms[formulario].elements[3].addEventListener("keyup",function(){borrarAlerta(event);}, false);
		break;
		case "ntc" :
		case "naf":
		case "cccss":
			document.forms[formulario].elements[0].addEventListener("keydown",function(){permitirSolo(event,"num");}, false);
			document.forms[formulario].elements[0].addEventListener("keyup",function(){borrarAlerta(event);}, false);
		break;
		case "dni" :
			document.forms[formulario].elements[1].addEventListener("keydown",function(){permitirSolo(event,"num");}, false);
			document.forms[formulario].elements[1].addEventListener("keyup",function(){tabular(event, 1); borrarAlerta(event);}, false);
			document.forms[formulario].elements[2].addEventListener("keydown",function(){permitirSolo(event,"letra");}, false);
			document.forms[formulario].elements[2].addEventListener("keyup",function(){capitalizar(this); borrarAlerta(event);}, false);
		break;
		case "nie" :
			document.forms[formulario].elements[0].addEventListener("change",function(){cambiarPropiedadesNIE();}, false);
			document.forms[formulario].elements[1].addEventListener("keydown",function(){permitirSolo(event,"num");}, false);
			document.forms[formulario].elements[1].addEventListener("keyup",function(){tabular(event, 1); borrarAlerta(event);}, false);
			document.forms[formulario].elements[2].addEventListener("keydown",function(){permitirSolo(event,"letra");}, false);
			document.forms[formulario].elements[2].addEventListener("keyup",function(){capitalizar(this); borrarAlerta(event);}, false);		
		break;
		case "nif" :
			document.forms[formulario].elements[0].addEventListener("change",function(){cambiarPropiedadesNIF();}, false);
			document.forms[formulario].elements[1].addEventListener("keydown",function(){permitirSolo(event,"num");}, false);
			document.forms[formulario].elements[1].addEventListener("keyup",function(){tabular(event, 1); borrarAlerta(event);}, false);
			document.forms[formulario].elements[2].addEventListener("keydown",function(){permitirSolo(event,"numLetra");}, false);
			document.forms[formulario].elements[2].addEventListener("keyup",function(){capitalizar(this); borrarAlerta(event);}, false);		
		break;
		case "about" :
			document.getElementById("about-versiones").innerHTML = propiedadesPrograma.nombre.toUpperCase() + " " + propiedadesPrograma.versiones.larga + " " + propiedadesPrograma.versiones.tipo + " " + propiedadesPrograma.arquitectura;
			document.getElementById("about-tirada").innerHTML = propiedadesPrograma.tirada;
			document.getElementById("about-id").innerHTML = propiedadesPrograma.identificador;
			document.getElementById("about-base-datos").innerHTML = propiedadesPrograma.baseDatosFecha;
			document.getElementById("registro-BE").addEventListener("click",function(){abrirEnNavegador("http://www.bde.es/bde/es/secciones/servicios/Particulares_y_e/Registros_de_Ent/");}, false);			
			document.getElementById("ruta-capturas").innerHTML = propiedadesPrograma.capturasPantalla;			
			document.getElementById("ruta-capturas").addEventListener("click",function(){abrirCarpetaCapturasPantalla();}, false);
			document.getElementById("about-procesador").innerHTML = propiedadesEquipo.procesador;
			document.getElementById("about-so").innerHTML = propiedadesEquipo.sistemaOperativoNombreComercial;
			document.getElementById("about-so-interno").innerHTML = propiedadesEquipo.sistemaOperativoNombreInterno;
			document.getElementById("about-idioma").innerHTML = propiedadesEquipo.idioma;
			document.getElementById("about-pantalla").innerHTML = propiedadesEquipo.pantalla.tablaInformativa;
			document.getElementById("about-runtime").innerHTML = propiedadesPrograma.motorNW;
			document.getElementById("about-node").innerHTML = propiedadesPrograma.entornoNODE;	
			document.getElementById("about-chromium").innerHTML = propiedadesPrograma.chromium;	
			document.getElementById("about-webkit").innerHTML = propiedadesPrograma.webkit;	
			document.getElementById("about-pdf").innerHTML = propiedadesPrograma.visorPDF;	
			document.getElementById("about-notificaciones").innerHTML = propiedadesPrograma.notificaciones;		
			document.getElementById("about-webview").innerHTML = (propiedadesPrograma.permisos.webview) ? "SI" : "NO";			
			document.getElementById("about-enlace-opciones-webview").addEventListener("click",function(){cargarFormulario("options");}, false);
			document.getElementById("about-enlace-doc").addEventListener("click",function(){abrirNuevaVentana("./md/documentation.md", "CDOCS : DOCUMENTACIÓN");}, false);
			document.getElementById("about-inspector").innerHTML = (propiedadesEquipo.sistemaOperativoAlias === "macosx") ? "&#160;<img src='images/png/inspector_macosx.png' alt='' title='' width='62' height='20' class='imagen-medio'>" : "&#160;<img src='images/png/inspector_win_lnx.png' alt='' title='' width='62' height='20' class='imagen-medio'>";
			document.getElementById("about-enlace-inspector").addEventListener("click",function(){abrirVentanaInspector();}, false);
			document.getElementById("about-enlace-github").addEventListener("click",function(){abrirEnNavegador(propiedadesPrograma.repositorio.git);}, false);
			document.getElementById("about-enlace-licencia").addEventListener("click",function(){abrirNuevaVentana("./html/pages/licencia_mit.html");}, false);
			document.getElementById("about-enlace-web").addEventListener("click",function(){abrirEnNavegador(nw.App.manifest.maintainers[0].web);}, false);
			
		break;
		case "update" :		
			document.getElementById("update-so").innerHTML = propiedadesEquipo.sistemaOperativoNombreComercial;
			document.getElementById("update-versiones-instalada").innerHTML = "<span>" + propiedadesPrograma.versiones.larga + "</span>" + actualizaciones.versionesInstaladasImagen;
			document.getElementById("update-versiones-actualizaciones").innerHTML = "<span>" + actualizaciones.versionesDisponibles + "</span>" + actualizaciones.versionesDisponiblesImagen ;		
			document.getElementById("update-progreso").value = "0";
			document.getElementById("update-porcentaje-cifra").innerHTML = "&#160;";
			document.getElementById("update-porcentaje-distintivo").innerHTML = "&#160;";
			document.getElementById("update-tarea").innerHTML = actualizaciones.tarea;
			document.getElementById("update-mensaje").innerHTML = actualizaciones.mensaje;
			document.getElementById("alerta-update").innerHTML = actualizaciones.alerta;
		break;
		case "options":		
			var estadoImagenInterruptor = (propiedadesPrograma.permisos.webview) ? "visible" : "hidden";
			document.getElementById("options-webview").checked = propiedadesPrograma.permisos.webview;
			document.getElementById("verificado-options").style.visibility = estadoImagenInterruptor;
			document.getElementById("options-webview").addEventListener("change",function(){modificarPermisosWebview(document.getElementById("options-webview").checked);}, false);
		break;	
	}
}

/**
* Función - cambiarEstadoBotones - Botones: MENÚ, INICIO, NUEVO, IMPRIMIR, VALIDAR. Recorrido : -1 Oculto, 0 Inactivo, 1 Activo, 2 Dejar como está.
**/
function cambiarEstadoBotones(estado){	
	estado = estado || "inicial";
	var formulariosInformativos = ["home", "about", "update"]; 
	var botonesOcultos = (formulariosInformativos.indexOf(formularioActivo,0) === -1) ? false : true;
	var recorrido = [2,2,2,2,2];
	var etiqueta3 = "", etiqueta4 = "";
	switch(estado){
		case "inicial" :
		if(formularioActivo){ 
			if(formularioActivo === ""){
				recorrido = [1,1,-1,-1,1];
				etiqueta4 = "SALIR";
			}else if(formularioActivo === "home"){
				recorrido = [1,-1,-1,-1,1];
				etiqueta4 = "INFORMACIÓN";				
			}else if(formularioActivo === "about"){
				recorrido = [1,1,-1,-1,1];
				etiqueta4 = "ACTUALIZAR";
				botonesOcultos = true;
			}else if(formularioActivo === "options"){
				etiqueta3 = "CANCELAR";
				etiqueta4 = "GUARDAR";
				recorrido = [1,-1,-1,1,0];					
			}else if(formularioActivo === "update"){
				switch(actualizaciones.estado){
					case  1 :
					etiqueta3 = "CANCELAR";
					etiqueta4 = "INSTALAR";
					recorrido = [1,-1,-1,1,1];
					botonesOcultos = true;
					break;
					case 2:
					etiqueta3 = "IM<u>P</u>RIMIR";
					etiqueta4 = "CANCELAR";
					recorrido = [0,-1,-1,-1,0];
					botonesOcultos = true;	
					break;
					default:
					etiqueta3 = "IM<u>P</u>RIMIR";
					etiqueta4 = "CANCELAR";
					recorrido = [1,-1,-1,-1,1];
					botonesOcultos = true;					
					break;					
				}							
			}else{
				recorrido = [1,1,0,0,1];
				etiqueta3 = "IM<u>P</u>RIMIR";
				etiqueta4 = "VALIDAR";				
			}
		}else{
			recorrido = [1,1,-1,-1,1];
			etiqueta4 = "SALIR";
		}
		break;
		case "procesando" :
		recorrido = [0,0,0,0,0];
		break;
		case "esperando" :
		recorrido = [1,-1,-1,1,1];
		break;
		case "acierto" :
		recorrido = [1,1,1,1,0];
		break;
		case "error":
		recorrido = [1,1,1,0,0];
		break;
		case "mnu-activo" :
		recorrido = [1,2,2,2,2];
		break;
		case "mnu-inactivo" :
		recorrido = [0,2,2,2,2];
		break;
		case "descarga-cancelada" : 
		recorrido = [1,-1,-1,-1,1];
		etiqueta4 = "INICIO";
		break;		
	}
	
	for(contador = 0; contador < botones.length; contador++){
		var cambio = recorrido[contador];
		switch(cambio){
			case -1 :
			document.getElementById(botones[contador]).className = "";
			document.getElementById(botones[contador]).className = "botones-oculto";
			break;
			case 0 :
			
			if(botonesOcultos){
				if(document.getElementById(botones[contador]).className !== "botones-oculto"){
				document.getElementById(botones[contador]).className = "";
				document.getElementById(botones[contador]).className = "botones-inactivo";
				}
			}else{
				document.getElementById(botones[contador]).className = "";
				document.getElementById(botones[contador]).className = "botones-inactivo";
			}
			
			
			break;
			case 1 :
			document.getElementById(botones[contador]).className = "";
			document.getElementById(botones[contador]).className = "botones-activo";
			break;
		}
	}
	if(etiqueta3 !== ""){document.getElementById(botones[3]).innerHTML = etiqueta3;}
	if(etiqueta4 !== ""){document.getElementById(botones[4]).innerHTML = etiqueta4;}
}


/**
* Función - validarFormulario - Llamada a las funciones de cálculo de dígitos de control para verificar
* los datos introducidos.
**/
function validarFormulario(){
	var habilitado = true;	
	if(document.getElementById("botones-validar").className === "botones-inactivo" || document.getElementById("botones-validar").className === "botones-oculto"){habilitado = false;}


	if(habilitado){	
		if(document.getElementById("botones-validar").innerHTML === "VALIDAR"){
			for(contador = 0; contador < document.forms[formularioActivo].length; contador += 1){
				if((document.forms[formularioActivo].elements[contador].type === "text")&&(document.forms[formularioActivo].elements[contador].value === "")){document.forms[formularioActivo].elements[contador].focus();return;}
			}
			for(contador = 0; contador < document.forms[formularioActivo].length; contador += 1){
				if(document.forms[formularioActivo].elements[contador].type === "text"){document.forms[formularioActivo].elements[contador].value = document.forms[formularioActivo].elements[contador].value.eliminarEspaciosEnBlanco();}
			}
			cambiarEstadoBotones("procesando");
			switch(formularioActivo){
				case "iban" :
				verificarIBAN(document.forms[0].elements[0].value , document.forms[0].elements[1].value,  document.forms[0].elements[2].value);
				break;
				case "ccc" :
				document.forms.ccc.elements[0].value = rellenarConCeros(document.forms.ccc.elements[0].value,4);
				document.forms.ccc.elements[1].value = rellenarConCeros(document.forms.ccc.elements[1].value,4);
				document.forms.ccc.elements[2].value = rellenarConCeros(document.forms.ccc.elements[2].value,2);
				document.forms.ccc.elements[3].value = rellenarConCeros(document.forms.ccc.elements[3].value,10);
				verificarCCC(document.forms.ccc.elements[0].value, document.forms.ccc.elements[1].value, document.forms.ccc.elements[2].value, document.forms.ccc.elements[3].value);
				break;
				case "ntc" :
				verificarNTC(document.forms.ntc.elements[0].value);
				break;
				case "dni" :
				document.forms.dni.elements[1].value = rellenarConCeros(document.forms.dni.elements[1].value,8);
				verificarDNI_NIE("dni", document.forms.dni.elements[1].value+document.forms.dni.elements[2].value);
				break;
				case "nie":
				document.forms.nie.elements[1].value = rellenarConCeros(document.forms.nie.elements[1].value,7);
				verificarDNI_NIE("nie", document.forms.nie.elements[0].value+document.forms.nie.elements[1].value+ document.forms.nie.elements[2].value);
				break;
				case "nif":
				document.forms.nif.elements[1].value = rellenarConCeros(document.forms.nif.elements[1].value, document.getElementById("valor-nif").maxLength);
				verificarNIF(document.forms.nif.elements[0].value+document.forms[0].elements[1].value+ document.forms.nif.elements[2].value);
				break;
				case "naf" :
				verificarNAF_CCCSS("naf", document.forms.naf.elements[0].value);
				break;
				case "cccss" :
				verificarNAF_CCCSS("cccss", document.forms.cccss.elements[0].value);
				break;
				
			}
		}else if( formularioActivo === "" && document.getElementById("botones-validar").innerHTML === "SALIR"){
			salir();
		}else if(document.getElementById("botones-validar").innerHTML === "INFORMACIÓN"){
			cargarFormulario("about");
		}else if(document.getElementById("botones-validar").innerHTML === "INICIO" || document.getElementById("botones-validar").innerHTML === "CANCELAR"){
			cargarFormulario("home");
		}else if(document.getElementById("botones-validar").innerHTML === "ACTUALIZAR"){
			actualizaciones.comprobar();										   
		}else if(document.getElementById("botones-validar").innerHTML === "INSTALAR"){
			actualizaciones.preparar();				
		}else if(document.getElementById("botones-validar").innerHTML === "GUARDAR"){
			cambiarEstadoBotones("prcesando");			
			var estadoWebview = (document.getElementById("options-webview").checked) ? true : false;
			var mensajeWebview = "";
			if(propiedadesPrograma.permisos.webview !== estadoWebview){
				if(estadoWebview){
					localStorage.setItem("webview", "true");
					propiedadesPrograma.permisos.webview = true;
					mensajeWebview = "ACTIVO";
				}else{
					localStorage.setItem("webview", "false");
					propiedadesPrograma.permisos.webview = false;
					mensajeWebview = "INACTIVO";
				}
				notificar("WEBVIEW ...", mensajeWebview);			
			}		
			document.getElementById("botones-imprimir").click();					
		}  
	}	
}

/**
* Función - anunciarError - Visualiza un mensaje de error, en la parte inferior de la ventana principal de la aplicación.
**/

function anunciarError(formulario, mensaje, numError){	
	numError = numError || null;
	document.getElementById("imagen-estado").src="images/png/logo64_0.png";	
	document.getElementById("alerta-" + formulario).innerHTML = mensaje;
	var largo , resta;
	switch (formulario){
		case "iban" :
		if(numError === 1){
			document.forms.iban.elements[0].focus();	
		}else if (numError === 2){
			document.forms.iban.elements[1].focus();		
		}else if (numError === 3){
			document.forms.iban.elements[2].focus();
		}else if (numError === 4){
			seleccionarTexto(document.forms.iban.elements[2], 0, document.forms.iban.elements[2].value.length);	
		}else if(numError === 5){
			seleccionarTexto(document.forms.iban.elements[0], 0, 2);	
		}else if(numError === 6){
			seleccionarTexto(document.forms.iban.elements[1], 0, 2);	
		}else{
			document.forms.iban.elements[2].focus();
		}
		break;
		case "ntc" :
		case "naf" :
		case "cccss" :
		largo = (formulario === "cccss") ? 11 : 12;
		resta = (formulario === "ntc") ? 1 : 2;
		if(document.forms[formulario].elements[0].value.length < largo) {
			document.forms[formulario].elements[0].focus();
		}else{
			seleccionarTexto(document.forms[formulario].elements[0], document.forms[formulario].elements[0].value.length - resta, document.forms[formulario].elements[0].value.length);
		}
		break;
		case "dni":
		case "nie":
		case "nif":
		seleccionarTexto(document.forms[formulario].elements[2], 0,1);
		break;
		case "ccc":
		seleccionarTexto(document.forms.ccc.elements[2], 0,2);
		break;
	}
	cambiarEstadoBotones("error");
	elementoMnuCaptura.activar();
}

/**
* Función - seleccionarTexto - Selección un fragmento de texto (en un campo de texto) entre las posiciones indicadas.
**/
function seleccionarTexto(elemento,desde,hasta) {	
	if ("selectionStart" in elemento) {
		elemento.selectionStart = desde;
		elemento.selectionEnd = hasta;
		elemento.focus ();
	}
}

/**
* Función - mostrarAcierto - Visualiza la información relacionada con una verificación acertada.
**/
function mostrarAcierto(formulario, mensaje){	
	document.getElementById("imagen-estado").src="images/png/logo64_1.png";
	var resultados = document.getElementById("salida-" + formulario);
	resultados.innerHTML = resultados.innerHTML + mensaje;
	for(contador = 0; contador < document.forms[formulario].length; contador += 1){
		if(document.forms[formulario].elements[contador].type === "text"){
			document.forms[formulario].elements[contador].readOnly = true;
		}
		else if(document.forms[formulario].elements[contador].type === "select-one"){
			document.forms[formulario].elements[contador].disabled = true;
		}else if(document.forms[formulario].elements[contador].type === "hidden"){
			document.forms[formulario].elements[contador].value = formularioValorOculto;
		}
		if(document.forms[formulario].elements[contador].value.length > 1){ document.forms[formulario].elements[contador].style.textAlign = "center";}	}
	document.getElementById("verificado-" + formulario).style.visibility = "visible";
	if((formulario === "iban" || formulario === "ccc") && urlEntidad !== ""){
		if (document.getElementById("enlaceEntidad-" + formulario)){ document.getElementById("enlaceEntidad-" + formulario).addEventListener("click",function(){abrirEnNavegador(urlEntidad);},false);}
	}
	document.getElementById("alerta-" + formulario).innerHTML =plantillaAlertaInfoPDF;
	cambiarEstadoBotones("acierto");
	elementoMnuCaptura.activar();	
}

/**
* Función - restaurarFormulario - Devuelve el formulario activo a su estado inicial.
**/
function restaurarFormulario(){	
	if(document.getElementById("botones-nuevo").className === "botones-inactivo" || document.getElementById("botones-nuevo").className === "botones-oculto" || formularioActivo === ""){ return;}
	var formulario = formularioActivo;
	for(contador = 0; contador < document.forms[formulario].length; contador += 1){
		if(document.forms[formulario].elements[contador].type === "text"){
			document.forms[formulario].elements[contador].readOnly = false;
			if(document.forms[formulario].elements[contador].getAttribute("maxlength") > 1){document.forms[formulario].elements[contador].style.textAlign = "left";}
			document.forms[formulario].elements[contador].value = "";
		}else if(document.forms[formulario].elements[contador].type === "select-one"){
			document.forms[formulario].elements[contador].disabled = false;
		}else if(document.forms[formulario].elements[contador].type === "hidden"){
			document.forms[formulario].elements[contador].value = "";
		}
	}
	document.getElementById("verificado-" + formulario).style.visibility = "hidden";
	document.getElementById("imagen-estado").src="images/png/logo64.png";
	urlEntidad = "";
	if(document.getElementById("salida-" + formulario).parentNode.length > 1){
		document.getElementById("salida-" + formulario).removeChild(document.getElementById("salida-" + formulario).lastChild);
	}
	if(formulario === "nif"){
		document.getElementById("texto-informativo-nif").innerHTML = "SIETE NÚMEROS";
		document.getElementById("valor-nif").maxLength = "7";
		document.getElementById("letra-nif").placeholder = "(N/L)";		
	}
	for(contador = 0; contador < document.forms[0].length; contador += 1){
		if((document.forms[formulario].elements[contador].type === "text")&&(document.forms[formulario].elements[contador].value === "")){document.forms[formulario].elements[contador].focus(); break;}
	}
	borrarAlertaVoluntario(formulario);
	document.getElementById(formulario).reset();
	cambiarEstadoBotones("inicial");
}


/**
* Función - permitirSolo - Permite la entrada de sólo números, letras y letras/números.
**/
function permitirSolo(eventoTeclado,caracteres){
	 
	var tecla=eventoTeclado.keyCode, continuidad = true, permiso = true;
	for(contador=0; contador<=teclasRestringidas.length; contador += 1){if(tecla===teclasRestringidas[contador]){continuidad = false; break;}}
	if(continuidad){
		switch(caracteres){
			case "num" :
			if (eventoTeclado.altKey || eventoTeclado.ctrlKey || eventoTeclado.shiftKey){ permiso = false;}
			if(tecla<48){permiso = false;}
			else if(tecla>=48 && tecla<=57){permiso = true;}
			else if(tecla>57 && tecla<96){permiso = false;}
			else if(tecla>=96 && tecla<=105){permiso = true;}
			else{permiso = false;}
			break;
			case "letra" :
			if (eventoTeclado.altKey || eventoTeclado.ctrlKey){permiso = false;}
			if(tecla < 65 || tecla > 90){permiso = false;}else{permiso = true;}
			break;
			case "numLetra" :
			if (eventoTeclado.altKey || eventoTeclado.ctrlKey){permiso = false;}
			if(eventoTeclado.shiftKey && tecla <= 57 && tecla >= 48){permiso = false;} 
			if(tecla < 48){permiso = false;}
			else if(tecla >= 48 && tecla <= 57){permiso = true;}
			else if(tecla > 57 && tecla < 65){permiso = false;}
			else if(tecla >= 65 && tecla <= 90){permiso = true;}
			else if(tecla > 90 && tecla < 96){permiso = false;}
			else if(tecla >= 96 && tecla <= 105){permiso = true;}
			else{permiso = false;}
			break;
		}
		if(!permiso){
			eventoTeclado.returnValue = false;
		}else{
			return;
		}
	}
}	
	
/**
* Función - capitalizar - Convierte a mayúsculas los caracteres alfabéticos del valor de un campo.
**/
function capitalizar(campo){	
	campo.value=campo.value.toString().toUpperCase();
}

/**
* Función - rellenarConCeros - Rellena con ceros "0" (a la izquierda) el valor de un campo hasta alcanzar la longitud máxima permitida.
**/
function rellenarConCeros(cadena,ceros){	
	var salida = String(""), posiciones;
	cadena = cadena.toString();
	if (cadena.length < parseInt(ceros, 10)){
		for (posiciones = ceros; posiciones > cadena.length; posiciones -= 1){salida = salida + "0";}
	}
	return salida.concat(cadena);
}

/**
* Función - tabular - Tabulación derecha (automática) entre campos de texto editables. 
**/

function tabular(eventoTeclado,elemento){
	var tecla = eventoTeclado.keyCode;
	for(contador = 0;contador < teclasRestringidas.length;contador += 1){if(tecla === teclasRestringidas[contador]){return;}}
	var largoMax= parseInt(document.forms[0].elements[elemento].getAttribute("maxlength"),10);
	var largoValor=parseInt(document.forms[0].elements[elemento].value.length, 10);
	if(largoValor === largoMax){
		elemento +=  1;
		largoMax = parseInt(document.forms[0].elements[elemento].getAttribute("maxlength"),10);
		largoValor = parseInt(document.forms[0].elements[elemento].value.length, 10);
		if(largoValor < largoMax){document.forms[0].elements[elemento].focus();}else{return;}
	}
}
/**
* Función - borrarAlerta - Elimina automáticamente el mensaje informativo cuando recibe una pulsación del teclado.
**/
function borrarAlerta(eventoTeclado){
	if(eventoTeclado.keyCode !== 13 && errorValidar === true){
			
			clearTimeout(espera);
			espera = setTimeout(function(){document.getElementById("alerta-" + formularioActivo).innerHTML = "&#160;"; errorValidar=false; document.getElementById("imagen-estado").src="images/png/logo64.png";cambiarEstadoBotones("inicial");elementoMnuCaptura.desactivar();},10);
	}	
}

/**
* Función - borrarAlertaVoluntario - Elimina el mensaje informativo.
**/
function borrarAlertaVoluntario(formulario){
	document.getElementById("alerta-" + formulario).innerHTML = "&#160;";
	errorValidar=false;
	document.getElementById("imagen-estado").src="images/png/logo64.png";
	cambiarEstadoBotones("inicial");
	elementoMnuCaptura.desactivar();
}

/**
* Función - lanzarEvento - Despacha el evento (nombreEvento) solicitado, sobre el elemento indicado.
* Esta función no se utiliza en la aplicación. Está aquí a modo de ejémplo.
**/
/**
function lanzarEvento(elemento,nombreEvento){	
	var evento = document.createEvent("HTMLEvents");
	evento.initEvent(nombreEvento, true, true );
	return !elemento.dispatchEvent(evento);
}
**/

/**
* Función - cargarFormulario - Carga de contenidos en la ventana principal. AJAX (método GET) tradicional.
* ¡OJO! Con NW.js versión 0.13 o posterior.
* 
**/

function cargarFormulario(formulario){
	document.getElementById("imagen-estado").src="images/png/logo64.png";
	var rutaFormulario = "./html/forms/" + formulario + ".html";
	formularioPrecedente_about = (formularioActivo === "about") ? true : false;
	formularioActivo= ""; errorAJAX = false; formularioValorOculto = "";
	var errorSolicitudMensaje = "";
	var formularioEnMnu = formularios.indexOf(formulario,0);
	desactivarElementoMnu(formularioEnMnu);
	cambiarTitularVentana(formulario);
	var solicitud = new XMLHttpRequest();
	solicitud.open("GET", rutaFormulario, true);
	solicitud.send(null);
	solicitud.timeout = 5000;
	solicitud.ontimeout = function () {
		errorAJAX = true;
		errorSolicitudMensaje = "ERROR 408 : Request Timeout";
		document.getElementById("contenido").innerHTML = "&#160;";
		document.getElementById("contenido").innerHTML = "<div class='errorAJAX'><img src='images/png/alerta_128.png' alt='' title='' width='128' height='128'><div>¡¡ATENCIÓN!!</div><div id='alerta-error-carga-formulario'>" + errorSolicitudMensaje + "</div></div>";
		cambiarEstadoBotones("inicial");
		document.getElementById("pie").style.visibility = "hidden";
		protector.cerrar("0");		
	};	
	solicitud.onerror = function(evento) {
		errorAJAX = true;
		
		try{
			fs.statSync(rutaFormulario);
		}catch(errorEstado){
			if(errorEstado.code === "ENOENT"){
				errorSolicitudMensaje = 'ERROR : 404 — Recurso: "' + formulario + '" (Not Found).';
			}else{
				errorSolicitudMensaje = 'ERROR : ' + Math.abs(errorEstado.errno) + ' — Recurso: "' + formulario + '" (' + errorEstado.code + ').';				
			}	
			
		}
		
		if(errorSolicitudMensaje === ""){
			if(formulario && formulario !== ""){
				errorSolicitudMensaje = 'ERROR : 520 — Recurso: "' + formulario + '" (Unknown Error).';	
			}else{
				errorSolicitudMensaje = "ERROR : 520 — Unknown Error.";	
			}
		}
		document.getElementById("contenido").innerHTML = "&#160";
		document.getElementById("contenido").innerHTML = "<div class='errorAJAX'><img src='images/png/alerta_128.png' alt='' title='' width='128' height='128'><div>¡¡ATENCIÓN!!</div><div id='alerta-error-carga-formulario'>" + errorSolicitudMensaje + "</div></div>";
		cambiarEstadoBotones("inicial");
		document.getElementById("pie").style.visibility = "hidden";
		protector.cerrar("0");
	};
	
	solicitud.onload = function(evento) {
		formularioActivo = formulario;
		asociarEventos(formulario);
		cambiarEstadoBotones("inicial");
		errorAJAX = false;
		if(formulario === "about"){
			document.getElementById("pie").style.visibility = "visible";
		}else{
			document.getElementById("pie").style.visibility = "hidden";
		}	
		document.getElementById("pie-anualidad-corriente").innerHTML = fechaSistema.aaaa;
		protector.cerrar("0");
		if(notificarNuevasVersiones){
			notificarNuevasVersiones = false;
			notificar("¡HOLA!", "CDOCS v" + propiedadesPrograma.versiones.larga);				
		}
		
	};
	//
	solicitud.onreadystatechange = function(){
		if (solicitud.readyState === 4 && solicitud.status === 200) {
			document.getElementById("contenido").innerHTML = solicitud.responseText;			
		}			
	};
	
}	


/**
* Función - obtenerFecha - Formato de un objeto fecha.
* Ejemplo de función constructora. Si el argumento (cadena ó entero) no guarda el formato, rango esperado o la propiedad (cadena) asociada 
* mediante notación '.' (punto) a la función, no se encuentra entre las declaradas devuelve un lacónico 'undefined'.
**/
function obtenerFecha (objetoFecha){
	objetoFecha = objetoFecha || null;
	var fecha, D, M, A;
	var error =false;
	var semana = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
	var weekdays = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]; 
	var meses =  ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
	var months = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
	
	if(objetoFecha !== null){
	if(isNaN(objetoFecha)){
		if(/^\d{1,2}[.\/\-]\d{1,2}[.\/\-]\d{4,}$/.test(objetoFecha)){
			objetoFecha = objetoFecha.replace(/\/|\./g,"-");
			objetoFecha = objetoFecha.split("-").reverse().join("-");
		}else if(/^\d{4,}[.\/\-]\d{1,2}[.\/\-]\d{1,2}$/.test(objetoFecha)){
			objetoFecha = objetoFecha.replace(/\/|\./g,"-");
		}else{
						
			error =true;
		}
		D = objetoFecha.split("-")[2]; 
		M = objetoFecha.split("-")[1];
		A = objetoFecha.split("-")[0];
		
		if (D > new Date(A, M, 0).getDate()){error =true;}
		if(D < 1 || D > 31 || M < 1 || M > 12){
			error =true;
		}
		if(A < 1000 || A > 9999){
			error =true;			
		}
		fecha = new Date(A, M -1, D);
	}else{
		if(parseInt(objetoFecha,10) < -30610227600000 || parseInt(objetoFecha,10) > 253402210800000){
			error =true;
		}else{
			fecha =  new Date(parseInt(objetoFecha,10));
		}
	}
	}else{
		fecha = new Date();
	}
	if(!error){
	this.d = fecha.getDate();
	this.dd = ((this.d < 10) ? "0" + this.d : this.d);
	this.nDs =  fecha.getDay(); //Número de día de la semana
	this.dsemana = semana[this.nDs];
	this.wd = weekdays[this.nDs];
	this.m = fecha.getMonth() + 1;
	this.mm = ((this.m < 10) ? "0" + this.m : this.m);
	this.mes = meses[fecha.getMonth()];
	this.mo = months[fecha.getMonth()];
	this.aaaa = fecha.getFullYear();
	this.bisiesto = (new Date(this.aaaa, 2, 0).getDate() === 29) ? true : false;
	this.horas = ((fecha.getHours() < 10) ? "0" + fecha.getHours() : fecha.getHours());
	this.minutos = ((fecha.getMinutes() < 10) ? "0" + fecha.getMinutes() : fecha.getMinutes());
	this.segundos = ((fecha.getSeconds() < 10) ? "0" + fecha.getSeconds() : fecha.getSeconds());
	this.uDm = new Date(this.aaaa, this.m, 0).getDate(); //Último día del mes
	this.pDm = new Date(this.aaaa, this.m - 1, 1).getDay(); //Día de la semana del primero del mes	
	this.marcaTemporal = Date.parse(fecha);
	}	
}

/**
* Función - detectarComplementoVisorPDF - Intenta detectar la marca y el tipo de 'plugin' instalado
* en el equipo para visualizar archivos PDF (devuelve 'false' si no detecta nada).* Esta función no es operativa en esta
* aplicación. El código se conserva aquí a modo de ejemplo.
**/

function detectarComplementoVisorPDF(){
	var complementoPDF = (navigator.mimeTypes && navigator.mimeTypes["application/pdf"]);
	var complementoDatos = []; 
	if (typeof complementoPDF !== "undefined") {
		if (complementoPDF.enabledPlugin){
			if(complementoPDF.enabledPlugin.name){
				complementoDatos[0] = complementoPDF.enabledPlugin.name;
			}
			if(complementoPDF.enabledPlugin.version){
				complementoDatos[1] = complementoPDF.enabledPlugin.version;
			}else{
				if(complementoPDF.enabledPlugin.description && (/\d/g).test(complementoPDF.enabledPlugin.description)){
					complementoDatos[1] = complementoPDF.enabledPlugin.description.replace(/^\d\./g, "");
				}
			}				
		}
	}
	if(complementoDatos.length === 0){
		complementoDatos = false;
	}else if(complementoDatos.length === 2){
		complementoDatos = complementoDatos[0] + " " + complementoDatos[1];
	}else{
		complementoDatos = complementoDatos[0];
	}

	//Sólo en aplicaciones NW.js:
	if(!complementoDatos){complementoDatos = "Chromium PDF Viewer.";}
	//	
	return complementoDatos;	
}

/**
* Función - cambiarPropiedadesNIF - Cambia las propiedades de entrada del formulario "nif".
**/
function cambiarPropiedadesNIF(){	
	var seleccionado = document.getElementById("selector-nif").value;
	if(seleccionado === "I"){ //DNI
		document.getElementById("texto-informativo-nif").innerHTML = "OCHO NÚMEROS";
		document.getElementById("valor-nif").maxLength = "8";
		document.getElementById("letra-nif").placeholder = "LETRA";
	}else{
		document.getElementById("texto-informativo-nif").innerHTML = "SIETE NÚMEROS";
		document.getElementById("valor-nif").maxLength = "7";
		document.getElementById("letra-nif").placeholder = "(N/L)";
	}
	if(document.getElementById("valor-nif").value !== ""){ document.getElementById("valor-nif").value = "";}
	if(document.getElementById("letra-nif").value !== ""){document.getElementById("letra-nif").value = "";}
	document.getElementById("valor-nif").focus();
	borrarAlertaVoluntario("nif");	
}

/**
* Función - cambiarPropiedadesNIE - Restaura el formulario 'nie', si detecta un cambio en el selector de la primera letra.
**/
function cambiarPropiedadesNIE(){	
//var seleccionado = document.getElementById("selector-nie").value;
if(document.getElementById("valor-nie").value !== "") {document.getElementById("valor-nie").value = "";}
if(document.getElementById("letra-nie").value !== "") {document.getElementById("letra-nie").value = "";}
document.getElementById("valor-nie").focus();
borrarAlertaVoluntario("nie");	
}


/**
* Función - verificarIBAN - 
* Dependencias : iban.js
* https://github.com/arhs/iban.js/tree/master 
**/
function verificarIBAN(lugar, dc, cuenta){
	var iban = lugar + dc + cuenta, acierto = false, errorIBANjs = "", separador = " " , ccc, fromccc, consistenciaCuenta = false, ibanTexto, ibanElec, mensaje = ""; 
	if(document.forms.iban.elements[0].value.length < 2) {
		mensaje = "<span><img src='images/png/alerta.png' alt='' title='' class='alerta-imagen-error'></span><span class='alerta-texto-error'>El código (ISO) del país está formado por DOS caracteres alfabéticos.</span></span>";
		errorValidar=true;
		anunciarError("iban", mensaje, 1);
		return;
	}
	if(document.forms.iban.elements[1].value.length < 2) {
		mensaje = "<span><img src='images/png/alerta.png' alt='' title='' class='alerta-imagen-error'></span><span class='alerta-texto-error'>En el IBAN los dígitos de control (DC) son DOS números.</span></span>";
		errorValidar=true;
		anunciarError("iban", mensaje, 2);
		return;
	}
	if(document.forms.iban.elements[0].value === "ES" && document.forms.iban.elements[2].value.length !== 20) {
		mensaje = "<span><img src='images/png/alerta.png' alt='' title='' class='alerta-imagen-error'></span><span class='alerta-texto-error'>El Código de cuenta (en España) está formado por VEINTE números.</span></span>";
		errorValidar=true;
		anunciarError("iban", mensaje, 3);
		return;
	}

	if(document.forms.iban.elements[0].value === "ES" && isNaN(document.forms.iban.elements[2].value)) {
		mensaje = "<span><img src='images/png/alerta.png' alt='' title='' class='alerta-imagen-error'></span><span class='alerta-texto-error'>El Código de cuenta (en España) sólo admite NÚMEROS. Gracias.</span></span>";
		errorValidar=true;
		anunciarError("iban", mensaje, 4);
		return;
	}

	try{
		acierto =  IBAN.isValid(iban) ;
		ccc = IBAN.toBBAN(iban, separador);
		fromccc = IBAN.fromBBAN(lugar, ccc);
		consistenciaCuenta = IBAN.isValidBBAN(lugar, ccc);
		ibanTexto =  IBAN.printFormat(iban, separador);
		ibanElec = IBAN.electronicFormat(iban);
	}catch(error){
		errorIBANjs = error;	
	}finally{
		if(errorIBANjs !== ""){
			if(/No\scountry\swith\scode/.test(errorIBANjs)){	 
				mensaje = "<span><img src='images/png/alerta.png' alt='' title='' class='alerta-imagen-error'></span><span class='alerta-texto-error'>La aplicación no registra ningún país con el código: &#8220;<span class='alerta-texto-error-dc'>"+lugar+"</span>&#8221;.</span>";
				errorValidar=true;
				anunciarError("iban", mensaje, 5);
				
			}else if((/^TypeError:\sResult\sof\sexpression\s/).test(errorIBANjs) || (/slice/g).test(errorIBANjs) || (/Invalid\sBBAN/).test(errorIBANjs)){
				mensaje = "<span><img src='images/png/alerta.png' alt='' title='' class='alerta-imagen-error'></span><span class='alerta-texto-error'>Formato de Código de Cuenta inadecuado para país con código: &#8220;" + lugar + "&#8221.</span></span>";
				errorValidar=true;
				anunciarError("iban", mensaje, 4);
					
			}else{
				
				mensaje = "<span><img src='images/png/alerta.png' alt='' title='' class='alerta-imagen-error'></span><span class='alerta-texto-error'>" + errorIBANjs + ".</span></span>";
				errorValidar=true;
				anunciarError("iban", mensaje);
				
			}
		}else{
			if(!acierto){
				mensaje = "<span><img src='images/png/alerta.png' alt='' title='' class='alerta-imagen-error'></span><span class='alerta-texto-error'>IBAN erróneo. Por favor, revisa TODOS los datos introducidos.</span></span>";
				errorValidar=true;
				if(consistenciaCuenta){
					anunciarError("iban", mensaje,6);
					
				}else{
					anunciarError("iban", mensaje,4);
					
				}		
			}else{
				//Acierto
				if(lugar !== "ES"){
					var lugarNombre = (obtenerPaises(lugar) && obtenerPaises(lugar) !== "DESCONOCIDO") ? obtenerPaises(lugar) : "DESCONOCIDO";
					mensaje = "<div class='formulario-salida-resultados'><hr class='separador' /><div>Código de Cuenta : " + ccc + "</div><div style='margin-top:6px;'>País: " + lugar + " &#8212; " + lugarNombre + ".</div></div>";
					formularioValorOculto = ibanTexto + "|" + ccc + "|" + lugarNombre;
					mostrarAcierto("iban", mensaje);
				}else{
					bd.buscarEntidadBancaria(cuenta.substr(0, 4), function(valor){
						var entidadBancaria = valor;
						if(bd.estado.error || bd.estado.errorMensaje !== ""){bd.notificarError();}	
						if(entidadBancaria){
							if(entidadBancaria === "DESCONOCIDA"){
								formularioValorOculto = ibanTexto + "|" + ccc + "|" + "DESCONOCIDA";
								mensaje = "<div class='formulario-salida-resultados'><hr class='separador' /><div>Entidad: DESCONOCIDA</div></div>";	
							}else{
								var datos = entidadBancaria.split("|");
								formularioValorOculto = ibanTexto + "|" + ccc + "|" + datos[5] + " (España)|" + datos[3] + "|" + datos[4];
								if(datos[3] === ""){
									urlEntidad="http://app.bde.es/ren/app/Search?CFG=ConsultaDetalleEntidadCon.xml&TipoFormato=XSL&Paginate=OPEN&CODBE="+datos[0]+"&DONDE=11&RADIO=0&VDETALLE=S";			
									mensaje = "<div class='formulario-salida-resultados'><hr class='separador' /><div><a href='#' id='enlaceEntidad-iban' class='enlaceTexto'>"+datos[5]+"</a></div></div>";	
								}else{
									mensaje = "<div class='formulario-salida-resultados'><hr class='separador' /><div>" +datos[5] +"</div></div>";
								}
							}
						}else{
							formularioValorOculto = ibanTexto + "|" + ccc + "|" + "DESCONOCIDA";
							mensaje = "<div class='formulario-salida-resultados'><hr class='separador' /><div>Entidad: DESCONOCIDA</div></div>";
						}
						mostrarAcierto("iban", mensaje);	
					});								
				}				
			}	
		}
	}
}

/**
* Función - verificarCCC - (Código Cuenta Cliente, bancario. España).
**/
function verificarCCC(banco,oficina,ddcc,cuenta){
	var docNum = "", docDC = "", mensaje = "", iban = "" , valorOculto="", ibanDC, sum1 = 0, sum2 = 0, multiplicador, dc1, dc2, mod;
	docNum = "00" + banco + oficina + cuenta;
	docDC = ddcc; 
	multiplicador = [1,2,4,8,5,10,9,7,3,6];
	for(contador = 0; contador < docNum.length; contador += 1){
		if (contador <  10)	{sum1 += parseInt(docNum.charAt(contador), 10) * multiplicador[contador];}
		if (contador >= 10)	{sum2 += parseInt(docNum.charAt(contador), 10) * multiplicador[contador - 10];}
	}
	dc1 = ((11 - (sum1 % 11)) >= 10) ? (11 - (11 - (sum1 % 11))).toString() : (11 - (sum1 % 11)).toString();
	dc2 = ((11 - (sum2 % 11)) >= 10) ? (11 - (11 - (sum2 % 11))).toString() : (11 - (sum2 % 11)).toString();
	if (docDC === (dc1 + dc2)){
		iban = banco+oficina;
		mod = parseInt(iban,10)%97;
		iban = mod.toString() + dc1 + dc2 + oficina.substring(0,2);
		mod = parseInt(iban,10)%97;
		iban = mod.toString()+ cuenta.substring(2,docNum.length) + "142800";
		mod = parseInt(iban,10)%97;
		ibanDC = ((98-mod) < 10) ? ("0" + (98-mod)) : (98-mod).toString();
		iban="ES"+ibanDC+banco+oficina+dc1+dc2+cuenta;
		//Acierto: 			
		valorOculto = "ES" + ibanDC + "|";		
		bd.buscarEntidadBancaria(banco, function(valor){
			if(bd.estado.error || bd.estado.errorMensaje !== ""){bd.notificarError();}
			var entidadBancaria = valor;
			if(entidadBancaria){
				if(entidadBancaria === "DESCONOCIDA"){
					valorOculto = valorOculto + "DESCONOCIDA";
					mensaje = "<div class='formulario-salida-resultados'><div>Entidad: DESCONOCIDA</div><div style='margin-top:12px;'>IBAN: " + iban + "</div></div>";	
				}else{
					var datos = entidadBancaria.split("|");
					if(datos[3] === ""){
						valorOculto = valorOculto + datos[1];
						urlEntidad="http://app.bde.es/ren/app/Search?CFG=ConsultaDetalleEntidadCon.xml&TipoFormato=XSL&Paginate=OPEN&CODBE="+datos[0]+"&DONDE=11&RADIO=0&VDETALLE=S";			
						mensaje = "<div class='formulario-salida-resultados'><div><a href='#' id='enlaceEntidad-ccc' class='enlaceTexto'>"+datos[5]+"</a></div><div style='margin-top:12px;'>IBAN: "+ iban + "</div></div>";	
					}else{
						valorOculto = valorOculto + datos[1] + "|" + datos[3] + "|" + datos[4];
						mensaje = "<div class='formulario-salida-resultados'><div>" +datos[5] +"</div><div style='margin-top:12px;'>IBAN: " + iban + "</div></div>";
					}
				}
			}else{
				mensaje = "<div class='formulario-salida-resultados'><div>Entidad: DESCONOCIDA</div><div style='margin-top:12px;'>IBAN: " + iban + "</div></div>";
			} 
			formularioValorOculto = valorOculto;
			mostrarAcierto("ccc", mensaje);
		});
	}else{
		mensaje = "<span><img src='images/png/alerta.png' alt='' title='' class='alerta-imagen-error'></span><span class='alerta-texto-error'>El Dígito de Control (DC) debería ser igual a &#8220;<span class='alerta-texto-error-dc'>" + (dc1 + dc2) + "</span>&#8221.</span>";
		errorValidar=true;
		anunciarError("ccc", mensaje);
	}
}


/**
* Función - verificarNTC - (Número de Tarjeta de Crédito/ Débito).
**/
function verificarNTC(valor){
	var docNum = "", docDC = "", emisora = "", entidad =  "", entidad1 =  "", mensaje = "", sum1 = 0, multiplicador, dc1, mod;
	var regularCarteBlanche = new RegExp("^3(?:0[0-5][0-9]{11}|[68][0-9]{12}$)");
	var luhn = [], entidadesPosibles = [];
		var entidades = [
		[/^3[47]\d{13}$/, "American Express",""],
		[/^(?:62|88)\d{14,17}$/, "China UnionPay", ""], 
		[/^3(?:0[0-5]|[68][0-9])[0-9]{11}$/, "Diners Club",""],
		[regularCarteBlanche, "Diners Club", "Carte Blanche"],
		[/^(?:2014|2149)\d{11}/, "Diners Club","enRoute"],
		[/^6(?:011\d{12}|5\d{14}|4[4-9]\d{13}|22(?:1(?:2[6-9]|[3-9]\d)|[2-8]\d{2}|9(?:[01]\d|2[0-5]))\d{10})$/, "Discover", ""],  
		[/^600833\d{10,13}$/, "El Corte Inglés", ""],
		[/^6(?:37|38|39)\d{13}$/, "InstantPayment", ""],
		[/^(?:3[0-9]{15}|(2100|2131|1800)[0-9]{11})$/, "JCB", ""], 
		[/^6(?:304|706|709|771)\d{12,15}$/, "Laser", ""],
		[/^5[1-5]\d{14}$/, "MasterCard"],
		[/(?:5018|5020|5038|6304|6759|676[123])\d{12,15}$/, "MasterCard - Maestro", ""],
		[/((?:6334|6767)\d{12}(?:\d\d)?\d?)/, "MasterCard - Maestro", "Solo"],
		[/(?:(?:(?:4903|4905|4911|4936|6333|6759)\d{12})|(?:(?:564182|633110)\d{10})(\d\d)?\d?)/, "MasterCard - Maestro", "Switch"],
		[/^(4\d{12}(?:\d{3})?)$/, "VISA", ""],
		[/^5019\d{12}/, "Dankort", "VISA"],
		[/^8699\d{11}/, "Voyager", ""]	
		];
	if (valor.length >= 12){		
		docDC = parseInt(valor.charAt(valor.length-1), 10);
		docNum = (valor.length %2 === 0)? valor : "0" + valor;
		for(contador = 0; contador < docNum.length; contador += 1){
			multiplicador = (parseInt(docNum.charAt(contador), 10) * 2 < 10)? parseInt(docNum.charAt(contador), 10) * 2  : (parseInt(docNum.charAt(contador), 10) * 2) - 9;				
			if (contador & 0x01){luhn.unshift(parseInt(docNum.charAt(contador), 10));}else{luhn.unshift(multiplicador);}				
		}
		luhn.forEach(function(valor){sum1 += valor;});
		mod = sum1%10;
		if (mod === 0){
			for(contador = 0; contador < entidades.length; contador += 1){			
				if (entidades[contador][0].test(valor)){ 
					entidad = entidades[contador][1];
					entidad1 = entidades[contador][2];//modi
					if (entidadesPosibles.length === 0){
						if(entidad && entidad !== "" ){entidadesPosibles.unshift(entidad);}
						if(entidad1 && entidad1 !== "" ){entidadesPosibles.unshift(entidad1);}
					}else{
						if(entidadesPosibles.length < 2){
							if(entidadesPosibles.indexOf(entidad) === -1){entidadesPosibles.unshift(entidad);}
							if(entidadesPosibles.indexOf(entidad1) === -1){entidadesPosibles.unshift(entidad1);}
						}
					}	
				}					
			}
			if(entidadesPosibles.length > 0){
				emisora = (entidadesPosibles[1] && entidadesPosibles[1] !== "") ? entidadesPosibles[0] + " / " + entidadesPosibles[1] : entidadesPosibles[0];
			}else{
				emisora = "DESCONOCIDA";
			}
			mensaje = "<div class='formulario-salida-resultados'><hr class='separador' /><div>TARJETA : " + emisora + "</div></div>";
			formularioValorOculto = emisora;
			mostrarAcierto("ntc", mensaje);
		}else{
			dc1 = ((10 - ((sum1 - docDC) % 10)) === 10) ? "0": (10 - ((sum1 - docDC) % 10)).toString();
			mensaje = "<span><img src='images/png/alerta.png' alt='' title='' class='alerta-imagen-error'></span><span class='alerta-texto-error'>El Dígito de Control debería ser igual a &#8220;<span class='alerta-texto-error-dc'>" + dc1 + "</span>&#8221.</span>";
			errorValidar=true;
			anunciarError("ntc", mensaje);
			
		}
	}else{
		mensaje = "<span><img src='images/png/alerta.png' alt='' title='' class='alerta-imagen-error'></span><span class='alerta-texto-error'>Mínimo DOCE números. Gracias.</span>";
		errorValidar=true;
		anunciarError("ntc", mensaje);		
		
	}		
}

/**
* Función - verificarDNI_NIE - (Comprueba el dígito de control de un DNI o NIE -España-).
**/
function verificarDNI_NIE(documento,valor){
	var letrasFinales = "TRWAGMYFPDXBNJZSQVHLCKE", cifras = "" , letraFinalEntrada = "", letraDC = "", mensaje= "", letraInicial = "";
	if (documento === "dni"){
		cifras = valor.substr(0,8);
		letraFinalEntrada = valor.substr(8,1);
		letraDC = letrasFinales.substr((parseInt(cifras,10)%23),1);
	}else{
		letraInicial = valor.substr(0,1);
		cifras = valor.substr(1,7);
		letraFinalEntrada = valor.substr(8,1);
		var valorInicial = "";
		if(letraInicial === "X"){valorInicial = "0";}else if(letraInicial === "Y"){valorInicial = "1";}else{valorInicial = "2";}
		letraDC=letrasFinales.substr(parseInt(valorInicial+cifras,10)%23,1);
	}
	if(letraFinalEntrada===letraDC){
		mensaje = (documento === "dni") ? "<div class='formulario-salida-resultados' style='font-size:12px;text-align:justify;'>El DNI es un documento público, personal e intransferible, emitido por el Ministerio del Interior, que acredita la identidad y los datos personales de su titular, así como la nacionalidad española del mismo.</div>" : (letraInicial === "X") ? "<div class='formulario-salida-resultados'><hr class='separador' /><div style='font-size:12px;'>NIE asignado antes de julio de 2008.</div></div>" : "<div class='formulario-salida-resultados'><hr class='separador' /><div style='font-size:12px;'>NIE asignado después de julio de 2008.</div></div>";
		mostrarAcierto(documento, mensaje);
	}else{
		errorValidar = true;
		mensaje = "<span><img src='images/png/alerta.png' alt='' title='' class='alerta-imagen-error'></span><span class='alerta-texto-error'>La letra final (Dígito de Control) debería ser igual a &#8220;<span class='alerta-texto-error-dc'>" + letraDC + "</span>&#8221;.</span>";
		anunciarError(documento, mensaje);
	}
}

/**
* Función - verificarNAF_CCCSS - Comprueba los dígitos de control de un Número de Afiliación o Cuenta de Cotización (a la Seguridad Social, España).
**/
function verificarNAF_CCCSS(documento, valor){
	var docNum = "", docDC ="", mensaje = "", provinciaTexto = "", dividendo = 0, provincia, dc1, escapar = false;
	if (documento === "naf" && valor.length < 12){
		mensaje = "<span><img src='images/png/alerta.png' alt='' title='' class='alerta-imagen-error'></span><span class='alerta-texto-error'>Introduce DOCE números. Gracias!</span>";
		errorValidar=true;
		anunciarError("naf", mensaje);
		escapar = true;
					
	}
	else if (documento === "cccss" && valor.length < 11){
		mensaje = "<span><img src='images/png/alerta.png' alt='' title='' class='alerta-imagen-error'></span><span class='alerta-texto-error'>Introduce ONCE números. Gracias!</span>";
		errorValidar=true;
		anunciarError("cccss", mensaje);
		escapar = true;
		
	}else{
		provincia = parseInt(valor.substr(0,2),10); 
	}
	if(!escapar){	
		if (documento === "naf"){
			docNum = valor.substr(2,8);
			docDC = valor.substr(10,11);
		}else{
			docNum = valor.substr(2,7);
			docDC = valor.substr(9,10);
		}
		dividendo = (parseInt(docNum,10) < 10000000) ? provincia * 10000000 + parseInt(docNum,10) : provincia + parseInt(docNum,10);
		dc1 = ((dividendo%97) < 10) ? "0" + (dividendo%97) :  (dividendo%97).toString();
		if(docDC === dc1){
			provinciaTexto = (provincia > 57) ? "DESCONOCIDA" : obtenerProvincia(provincia);
			formularioValorOculto = provinciaTexto;
			mensaje =(documento === "naf") ? "<div class='formulario-salida-resultados'><hr class='separador' /><div>Provincia de afiliación : " + provinciaTexto.toUpperCase() + "</div></div>" :"<div class='formulario-salida-resultados'><hr class='separador' /><div>Provincia de actividad : " + provinciaTexto.toUpperCase() + "</div></div>";
			mostrarAcierto(documento, mensaje);
		}else{
			mensaje = "<span><img src='images/png/alerta.png' alt='' title='' class='alerta-imagen-error'></span><span class='alerta-texto-error'>La serie de números debería terminar en &#8220;<span class='alerta-texto-error-dc'>" + dc1 + "</span><span>&#8221; (DC).</span></span>";
			errorValidar=true;
			anunciarError(documento, mensaje);
		}
	}else{
		return;
	}
}


/**
* Función - verificarNIF - Número de Identificación Fiscal (incluye NIE y DNI). España.
**/
function verificarNIF(valor){
	var entidad = "", entidadTexto = "", mensaje = "", provinciaTexto = "DESCONOCIDA", tipoNIF = "", persona = false, sum1 = 0, sum2 = 0, dc1, dc2,dniNieDC = "TRWAGMYFPDXBNJZSQVHLCKE", nieInicial= ["X","Y","Z"], prefijo;	
	entidad = valor.substr(0, 1);
	var docNum = valor.substr(1, valor.length -2);
	var provincia = docNum.substr(0, 2);
	var docDC = valor.substr(valor.length -1, 1);
	var nifDC = "JABCDEFGHI";
	if (/^[XYZI]$/.test(entidad)){	
		persona = true;	
		if(entidad !== "I"){
		entidadTexto = entidad;
		for(prefijo in nieInicial){
		if (entidad === nieInicial[prefijo]){entidad = prefijo.toString();}
		}
		}else{
		entidadTexto = "DNI";
		entidad = ""; //DNI
		}
		dc2 = dniNieDC.charAt(parseInt(entidad + docNum, 10)%23);
		mensaje = (docDC === dc2) ? "ACIERTO" : "<span><img src='images/png/alerta.png' alt='' title='' class='alerta-imagen-error'></span><span class='alerta-texto-error'>La letra final debería ser igual a &#8220;<span class='alerta-texto-error-dc'>" + dc2 + "</span><span>&#8221;.</span></span>";
	}else{
		
		for(contador = 0; contador  < docNum.length; contador += 1){					
			if (contador % 2 === 0){						
				sum1 += ((parseInt(docNum.charAt(contador),10) * 2) > 9) ? (parseInt(docNum.charAt(contador),10) * 2) -9 : (parseInt(docNum.charAt(contador),10) * 2);
			}else{
				sum2 += parseInt(docNum.charAt(contador),10);
			}						
		}
		dc1 = ((sum1 + sum2) > 9)? 10 - ((sum1+sum2)%10) : 10 - (sum1+sum2);
		dc1 = (dc1 === 10) ? 0 : dc1;
		dc2 = nifDC.charAt(dc1);
		if (/^[ABEHU]$/.test(entidad)){
			entidadTexto = entidad;
			mensaje = (docDC === dc1.toString()) ? "ACIERTO" : "<span><img src='images/png/alerta.png' alt='' title='' class='alerta-imagen-error'></span><span class='alerta-texto-error'>El carácter final (de control) debería ser el número &#8220;<span class='alerta-texto-error-dc'>" + dc1 + "</span><span>&#8221;.</span></span>";
		}
		else if (/^[KLMPQRS]$/.test(entidad)){
			if(/^[KLM]$/.test(entidad)){persona = true;}
			entidadTexto = entidad;
			mensaje = (docDC === dc2) ? "ACIERTO" : "<span><img src='images/png/alerta.png' alt='' title='' class='alerta-imagen-error'></span><span class='alerta-texto-error'>El carácter final (de control) debería ser la letra &#8220;<span class='alerta-texto-error-dc'>" + dc2 + "</span><span>&#8221;.</span></span>";
		}else{
			entidadTexto = entidad;
			mensaje = (docDC === dc1.toString() || docDC === dc2 ) ? "ACIERTO" : "<span><img src='images/png/alerta.png' alt='' title='' class='alerta-imagen-error'></span><span class='alerta-texto-error'>El carácter final (de control) debería ser el número &#8220;<span class='alerta-texto-error-dc'>" + dc1 + "</span><span>&#8221; ó la letra &#8220;</span><span class='alerta-texto-error-dc'>" + dc2 + "&#8221;.</span>";
		}
	}	
	if(mensaje === "ACIERTO"){
		if(persona === false){
			provinciaTexto = (obtenerProvincia(provincia) && obtenerProvincia(provincia) !== "DESCONOCIDA") ? obtenerProvincia(provincia) : "DESCONOCIDA";			 
		}
		tipoNIF = "<span>Tipo &#8220;<span class='texto-capital'>" +  entidadTexto + "</span>&#8221; : </span>";
		if(entidadTexto === "DNI"){entidadTexto = "I";}
		mensaje = (provinciaTexto === "DESCONOCIDA") ? "<div class='formulario-salida-resultados-nif'><div>" + tipoNIF + buscarTipoNIF(entidadTexto) + "</div></div>" : "<div class='formulario-salida-resultados-nif'><div>" + tipoNIF + buscarTipoNIF(entidad) + "</div><div>Con sede (si el NIF fue asignado antes de 2009) en la provincia de " + provinciaTexto.toUpperCase() + ".</div></div>";
		formularioValorOculto = buscarTipoNIF(entidadTexto) + "|" + provinciaTexto; 
		mostrarAcierto("nif", mensaje);
	}else{
		errorValidar = true;
		anunciarError("nif", mensaje);
	}
}

/**
* Función - imprimirFormulario - .
**/				

function imprimirFormulario(){
	var continuidad = true;
	if(document.getElementById("botones-imprimir").className === "botones-inactivo" || document.getElementById("botones-imprimir").className === "botones-oculto" || formularioActivo === ""){continuidad = false;}
	if(continuidad){
		if((/^cancelar/i).test(document.getElementById("botones-imprimir").innerHTML)){
			if(formularioPrecedente_about){
				cargarFormulario("about");
			}else{
				cargarFormulario("home");
			}
		}else{
			formulario = formularioActivo;
			borrarAlertaVoluntario(formulario);
			document.getElementById("alerta-" + formulario).innerHTML = plantillaAlertaEsperaPDF; 
			cambiarEstadoBotones("procesando");
			clearTimeout(demora);
			demora = setTimeout(function(){crearArchivoPDF(formulario);},500);
		}
	}
}

/**
* Función - cambiarTitularVentana - Cambia el título de la ventana principal, en función del propósito del formulario activo.
**/	

function cambiarTitularVentana(formulario){
	var titular = "", nombreApp = propiedadesPrograma.nombre.toUpperCase();
	document.getElementById("captura-texto").innerHTML = "&#160;";
	switch(formulario){
		case "home":
		titular = nombreApp;
		break;
		case "cccss" :
		titular = nombreApp + " : CCC (ss)";
		break;
		case "about" :
		titular = nombreApp + " : ACERCA DE ...";
		break;
		case "update" :
		titular = nombreApp + " : ACTUALIZACIONES";
		break;
		case "options" :
		titular = nombreApp + " : AJUSTES ~ OPCIONES";
		break;
		default:
		titular = nombreApp + " : " + formulario.toUpperCase();
	}
	if(errorAJAX){titular = nombreApp + " : ERROR"; } 
	document.title = titular;
	document.getElementById("captura-texto").innerHTML = titular; 
}
/**
* Función - precargaImagen - Carga en la memoria caché los ficheros de imagen indicados en la matriz argumento.
**/	
function precargaImagen(matriz) {	
    if (!precargaImagen.listado) {
        precargaImagen.listado = [];
    }
    var listado = precargaImagen.listado;
    for (contador = 0; contador < matriz.length; contador++) {
        var imagen = new Image();
        imagen.onload = function() {
            var registro = listado.indexOf(this);
            if (registro !== -1) {
                listado.splice(registro, 1);
            }
        };
        listado.push(imagen);
        imagen.src = matriz[contador];
    }
}

/********************************************************
* Funciones globales - JAVASCRIPT con la API de NW.js y Node.js:
*********************************************************/


/**
* Función - construirMnuEmergente - Menú principal de la aplicación (tipo 'popup').
*¡OJO! Con NW.js versión 0.13 o posterior.
**/

function construirMnuEmergente(){ 
var mnu = new nw.Menu({type: 'menubar'}); 
if(propiedadesEquipo.sistemaOperativoAlias === "macosx"){
	mnu.createMacBuiltin(propiedadesPrograma.identificador,{
	hideEdit: true,
  	hideWindow: true
});
}
mnu.append(new nw.MenuItem({ type: "checkbox", label: "Inicio", click: function(){cargarFormulario("home");}}));
mnu.append(new nw.MenuItem({ type: "checkbox", label: "IBAN", click: function(){cargarFormulario("iban");}})); 	
mnu.append(new nw.MenuItem({ type: "checkbox", label: "CCC", click: function(){cargarFormulario("ccc");}}));
mnu.append(new nw.MenuItem({ type: "checkbox", label: "NTC", click: function(){cargarFormulario("ntc");}}));
mnu.append(new nw.MenuItem({ type: "checkbox", label: "NIF", click: function(){cargarFormulario("nif");}}));
mnu.append(new nw.MenuItem({ type: "checkbox", label: "DNI", click: function(){cargarFormulario("dni");}}));
mnu.append(new nw.MenuItem({ type: "checkbox", label: "NIE", click: function(){cargarFormulario("nie");}}));
mnu.append(new nw.MenuItem({ type: "checkbox", label: "NAF", click: function(){cargarFormulario("naf");}}));
mnu.append(new nw.MenuItem({ type: "checkbox", label: "CCC (SS)", click: function(){cargarFormulario("cccss");}}));
mnu.append(new nw.MenuItem({ type: "separator" }));
mnu.append(new nw.MenuItem({ type: "checkbox", label: "Actualizaciones", click: function(){actualizaciones.comprobar();}}));
mnu.append(new nw.MenuItem({ type: "checkbox", label: "Acerca de ...", click: function(){cargarFormulario("about");}}));
mnu.append(new nw.MenuItem({ type: "checkbox", label: "Ajustes", click: function(){cargarFormulario("options");}}));
mnu.append(new nw.MenuItem({ type: "separator" }));
mnu.append(new nw.MenuItem({ type: "normal", icon: "images/png/camera_16.png", label: "Captura de pantalla", click: function(){capturarPantalla();}}));
mnu.append(new nw.MenuItem({ type: "separator" }));
mnu.append(new nw.MenuItem({ type: "normal", label: "Salir", click: function(){
if(numVentanasSecundariasAbiertas > 0 ){
		notificar("", "",true);
	}else{
		salir();
	}	
	
}}));
mnu.items[10].enabled = false;
return mnu;
}

/**
* Función - visualizarMnuEmergente - Menú principal de la aplicación (tipo 'popup').
**/

function visualizarMnuEmergente(event){
	event.preventDefault();
	//var mnuX = (propiedadesEquipo.sistemaOperativoAlias === "mac") ? 472 : 384;
	var mnuX = 470; 
	var mnuY = 30; 
	if(document.getElementById("botones-mnu").className === "botones-activo"){
	mnuEmergente.popup(mnuX, mnuY);
	}
}


var elementoMnuCaptura = {
	numElemento : 13,
	iconoActivo : "images/png/camera_16.png",
	iconoInactivo : "images/png/camera_16_d.png",
	activar : function(){
		mnuEmergente.items[13].enabled=true;
		mnuEmergente.items[13].icon = this.iconoActivo;
	},
	desactivar : function(){
		mnuEmergente.items[13].enabled=false;
		mnuEmergente.items[13].icon = this.iconoInactivo;
	}
};

function desactivarElementoMnu(numElemento){	
	for(contador = 0; contador <  mnuEmergente.items.length; contador += 1){
		if(!mnuEmergente.items[contador].enabled){ mnuEmergente.items[contador].enabled = true;}
		if(mnuEmergente.items[contador].type === "checkbox" ){mnuEmergente.items[contador].checked = false;}	
	}
	
	elementoMnuCaptura.activar();
	
	if(numElemento > -1){
		if(numElemento >= 9 ){ numElemento = numElemento + 1;}
		if(mnuEmergente.items[numElemento].type === "checkbox" ){mnuEmergente.items[numElemento].checked = true;}
		mnuEmergente.items[numElemento].enabled=false;		
	}
	
	if(numElemento > -1 && numElemento > 0 && numElemento < 9){
		elementoMnuCaptura.desactivar();
	}
	
}

function activarIconoBandeja(){
	var icono = /^darwin/i.test(os.platform()) ? "images/png/logo128.png" :  "images/png/logo64.png" ;	
	iconoBandeja = new nw.Tray({ title: propiedadesPrograma.nombre.toUpperCase() + " " + propiedadesPrograma.versiones.corta, tooltip: "CDOCS " + propiedadesPrograma.versiones.corta, icon: icono });
	mnuContextoBandeja = new nw.Menu();
	mnuContextoBandeja.append(new nw.MenuItem({type: "checkbox", label: propiedadesPrograma.nombre.toUpperCase() + " " + propiedadesPrograma.versiones.corta, click: function(){if(ventanaPrincipalMinimizada){ventanaPrincipal.restore();}}}));
	mnuContextoBandeja.items[0].checked = true;
	if(!(/^darwin/i).test(os.platform())){
		mnuContextoBandeja.append(new nw.MenuItem({ type: "separator" }));
		mnuContextoBandeja.append(new nw.MenuItem({ label: "Salir", click: function(){ventanaPrincipal.close();}}));	
	}
	iconoBandeja.menu = mnuContextoBandeja;	
}

/**
* Función - abrirEnNavegador - Abre la página solicitada en el navegador del equipo.
**/
function abrirEnNavegador(url){		
	
	var dominioReferencia = "google.com";	
	
	if((url === propiedadesPrograma.repositorio.git) && (ventanasSecundariasAbiertas[ventanaSecundariaWebview_orden])){ventanasSecundariasAbiertas[ventanaSecundariaWebview_orden].close();}
	
	protector.abrir();
	
	dns.lookup(dominioReferencia, function(error) {
		if(error && error.code === "ENOTFOUND"){
			notificar("Sin acceso a Internet ..."); 
			protector.cerrar("0");						
		}else{
			if(url === propiedadesPrograma.repositorio.git && propiedadesPrograma.permisos.webview){
				protector.cerrar("0");
				abrirNuevaVentana("./html/pages/contenedor_webview.html", "CDOCS : CÓDIGO FUENTE (GitHub)");
												
			}else{
				nw.Shell.openExternal(url);
				protector.cerrar("6000");				
			}					
		}	
	});	
}
/**
* Función - abrirVentanaInspector - Abre la ventana de inspección 'Chromium' si estamos utilizando NW.js con 'sabor' SDK.
**/

function abrirVentanaInspector(){
	nw.Window.get().showDevTools();	
}

/**
* Función - abrirNuevaVentana - Abre una nueva ventana de la aplicación.
* ¡OJO! Con NW.js versión 0.13 o posterior.
**/
function abrirNuevaVentana(recursoHTML, titular){

	titular = titular || "";
	
	var ventanaSecundaria;
	var coordenadaX = ventanaPrincipal.x + 40;
	var coordenadaY = ventanaPrincipal.y + 40;	
	
	var identificador = "indefinido";
	var escalable = true;
	var emplazamiento = null;
	var anchura = 632;
	var altura = 364;
	var mostrar_en_la_barra_de_tareas = true;	
	
	
	if(recursoHTML === "./md/documentation.md"){
		var contenidoHTML = traducirMD(recursoHTML);
		recursoHTML = "./html/pages/contenedor_md.html?" + encodeURIComponent(contenidoHTML);
		identificador = "contenedor_markdown";
		if(ventanaSecundariaMarkdown_orden > - 1){
			if(ventanasSecundariasAbiertas[ventanaSecundariaMarkdown_orden]){
				ventanasSecundariasAbiertas[ventanaSecundariaMarkdown_orden].restore();
				ventanasSecundariasAbiertas[ventanaSecundariaMarkdown_orden].focus();
				return;
			}
		}
	}else if(recursoHTML === "./html/pages/contenedor_webview.html"){		
		escalable = false;		
		anchura = parseInt(propiedadesEquipo.pantalla.anchuraDisponible, 10);
		altura = (parseInt(propiedadesEquipo.pantalla.alturaTotal, 10) === parseInt(propiedadesEquipo.pantalla.alturaDisponible, 10)) ? (parseInt(propiedadesEquipo.pantalla.alturaDisponible, 10) - 20) : parseInt(propiedadesEquipo.pantalla.alturaDisponible, 10);
		identificador = "contenedor_webview";
		if(ventanaSecundariaWebview_orden > - 1){
			if(ventanasSecundariasAbiertas[ventanaSecundariaWebview_orden]){
				ventanasSecundariasAbiertas[ventanaSecundariaWebview_orden].restore();
				ventanasSecundariasAbiertas[ventanaSecundariaWebview_orden].focus();
				return;
			}
		}
	}else if(recursoHTML === "./html/pages/licencia_mit.html"){
		identificador = "contenedor_licencia";
		if(ventanaSecundariaLicencia_orden > - 1){
			if(ventanasSecundariasAbiertas[ventanaSecundariaLicencia_orden]){
				ventanasSecundariasAbiertas[ventanaSecundariaLicencia_orden].restore();
				ventanasSecundariasAbiertas[ventanaSecundariaLicencia_orden].focus();
				return;
			}
		}
	}else{
		identificador = "indefinido";
	}
	
	
	var opciones = {	
    title : titular,  
	width: anchura,
	height: altura,	
    position : emplazamiento,
    resizable : escalable,
	frame: true,
    show : false,
    };
			
	if(identificador !== "indefinido"){
	
		opciones.id = identificador;
	}
	
	if(ventanaPrincipalMinimizada || identificador === "contenedor_webview"){
		opciones.position = "center";
	}else{
		opciones.x = coordenadaX;
		opciones.y = coordenadaY;
	}
		
	if(titular !== ""){
		opciones.title = titular;		
	}
	
	
	ventanaSecundaria = nw.Window.open (recursoHTML, opciones,
	
		function(nuevaVentana){
		
		numVentanasSecundariasAbiertas += 1;
		
		numVentanasSecundariasAbiertas = (numVentanasSecundariasAbiertas < 1 ) ? 1 : numVentanasSecundariasAbiertas;
		
		ventanasSecundariasAbiertas[numVentanasSecundariasAbiertas - 1] = nuevaVentana;
		if(identificador === "contenedor_markdown"){ventanaSecundariaMarkdown_orden = numVentanasSecundariasAbiertas - 1;}
		if(identificador === "contenedor_webview"){ventanaSecundariaWebview_orden = numVentanasSecundariasAbiertas - 1;}
		if(identificador === "contenedor_licencia"){ventanaSecundariaLicencia_orden = numVentanasSecundariasAbiertas - 1;}
		nuevaVentana.zoomLevel = 0;
		nuevaVentana.setMinimumSize(632, 364);
		
		if(identificador === "contenedor_webview"){
		 	nuevaVentana.setMaximumSize(propiedadesEquipo.pantalla.anchuraDisponible, propiedadesEquipo.pantalla.alturaDisponible - 20);

		}
			
		
		if(!mostrar_en_la_barra_de_tareas){
			nuevaVentana.setShowInTaskbar(false);			
		}
		
		if(titular !== ""){nuevaVentana.title = titular;} // Funciona sólo si en el documento a cargar la etiqueta <title> está vacía.
		
		nuevaVentana.on("loaded",function(){
			if(propiedadesEquipo.sistemaOperativoAlias === "linux" && !escalable){nuevaVentana.setResizable(false);}
			nuevaVentana.show();			
		});
		
				
		nuevaVentana.on("move", function(nuevoValorX, nuevoValorY){
			if(identificador === "contenedor_webview"){
				nuevaVentana.setPosition("center");
			}
		});
		
				
		nuevaVentana.on("close",function(){			
			numVentanasSecundariasAbiertas--;
			if(identificador === "contenedor_licencia"){ventanaSecundariaLicencia_orden = - 1;}
			if(identificador === "contenedor_markdown"){ventanaSecundariaMarkdown_orden = - 1;}
			if(identificador === "contenedor_webview"){ventanaSecundariaWebview_orden = - 1;}
			if(numVentanasSecundariasAbiertas < 0){numVentanasSecundariasAbiertas = 0;} 	
			nuevaVentana.close(true);
			if(alertaSalida.open){cerrarAdvertenciaSalida(0);}		
		});		
	});	
	
}

/**
* Función - salir - Cierra la aplicación.
**/

function salir(){
	clearTimeout(espera);
	clearTimeout(demora);
	clearTimeout(aplazamientoCierreProtector);
	clearInterval(intervalo);
	if(alertaSalida.open){
		alertaSalida.close("0");
	}	
	nw.App.clearCache();
	nw.App.closeAllWindows();
	if(iconoBandeja !== null){
		iconoBandeja.remove();
		iconoBandeja = null;
	}
	nw.App.unregisterGlobalHotKey(atajoTecladoImprimir);
	atajoTecladoImprimir = null;	
	nw.App.quit();
}

/**
* Función - notificar - Crea un mensaje flotante, informativo o de alerta en la ventana principal.
**/
function abrirAdvertenciaSalida(){
	if(!alertaSalida.open){
		document.getElementById("advertencia-salida-botonera-pulsador-d").className = "";
		alertaSalida.showModal();
		reproducirSonido();		
	}	
}
function cerrarAdvertenciaSalida(valorRetorno){
	valorRetorno = parseInt(valorRetorno, 10) || 0;
	if(alertaSalida.open){
		alertaSalida.close(valorRetorno);		
	}	
}
function salirConAdvertenciaSalidaVisible(){	
	document.getElementById("advertencia-salida-botonera-pulsador-d").className = "seleccionado";
	clearTimeout(espera);
	espera = setTimeout(function(){
		document.getElementById("advertencia-salida-botonera-pulsador-d").className = "";
		clearTimeout(demora);
			demora = setTimeout(function(){
			document.getElementById("advertencia-salida-botonera-pulsador-d").click();	
		}, 100);
	}, 200);
}

function notificar(mensajePrincipal, mensajeSecundario, salida){
	switch(arguments.length){
		case 1 :
		mensajeSecundario = "";
		salida = false;
		break;
		case 2:
		salida = false;
		break;
	}
	
	if(!salida){		
		var identificador = "noticia", prioridad = 0, elegible = true, botones = [];				
		var argumentos = {
		  type: "basic",
		  title: "CDOCS",
		  message: mensajePrincipal,  
		  contextMessage: mensajeSecundario,
		  iconUrl: "./images/png/logo64.png",
		  priority: prioridad,
		  requireInteraction: false,
		  isClickable : elegible,
		  buttons: botones
		};
		if(chrome.notifications.getPermissionLevel && typeof chrome.notifications.getPermissionLevel === "function"){
			chrome.notifications.getPermissionLevel(function(permiso){
				if(permiso === "granted"){
					chrome.notifications.clear(identificador, function(){
						chrome.notifications.create(identificador, argumentos, function(){
							reproducirSonido();
							chrome.notifications.onClosed.addListener(function(id, cerradoPorUsuario){
								if(id === identificador && cerradoPorUsuario === true){
									ventanaPrincipal.focus();
								}
							});			
							
						});	
					});					
				}	
			});
		}
	}else{
		abrirAdvertenciaSalida();		
	}	
}

/**
* Función - reproducirSonido - Reproduce en el altavoz el sonido elegido, (almacenados en archivos con formato '.ogg').
**/
function reproducirSonido(sonido){
	sonido = sonido || "noticia";
	var rutaRelativaArchivoSonido = "";
	if(sonido === "noticia"){
		rutaRelativaArchivoSonido = "./sound/notice.ogg";
	}else if(sonido === "captura"){
		rutaRelativaArchivoSonido = "./sound/shutter.ogg";
	}
	var audio = new Audio(rutaRelativaArchivoSonido);
	audio.play();	
}

/**
* Función - capturarPulsacionesTeclado - Ejecuta una u otra función dependiendo de la pulsación del usuario en el teclado.
* En los casos de que esa pulsación sea sobre la tecla "Enter" o el conjunto, Ctr+P.
**/

function capturarPulsacionesTeclado(clave){
	if(ventanaPrincipalFoco){
		var elemento;
		if(clave === "Enter"){
			elemento = document.getElementById("botones-validar");
			if(elemento.className === "botones-activo" && (elemento.innerHTML === "VALIDAR" || elemento.innerHTML === "CANCELAR")){
				if(formularioActivo){
					validarFormulario(formularioActivo);
				}
			}
		}else if(clave === "Ctrl+P"){
			elemento = document.getElementById("botones-imprimir");
			if((elemento.className === "botones-activo") && (/rimir$/i.test(elemento.innerHTML))){
				if(formularioActivo){
					imprimirFormulario(formularioActivo);
				}
			}	
		}
	}
}

/**
* Función - traducirMD - Convierte un documento 'Markdown' en otro 'HTML' para suvisualización en una nueva ventana.
**/

function traducirMD(contenidoMD){
	var marked = require("marked");
	var resultado = "";
	var archivo = fs.readFileSync(contenidoMD, "utf8");		
	resultado = marked(archivo);
	return resultado;	
}

/**
* Función - capturarPantalla - Crea una imágen de la ventana principal (formato '.png').
**/

function capturarPantalla() {		
	var procesarCaptura = false;
	var rutaUsuario = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
	var rutaEscritorio = rutaUsuario;
	var rutaDirectorioCapturas = rutaEscritorio + path.sep + "cdocs-screenshots";
	var marcaTemporal = Math.floor(Date.now() / 1000);
	var nombreImagen = propiedadesPrograma.nombre.toLowerCase() + "-" + formularioActivo + "-" + marcaTemporal + ".png";
	var rutaImagenCaptura = rutaDirectorioCapturas +  path.sep + nombreImagen;
	
	var mostarError = function(error){
		document.getElementById("captura").style.visibility = "hidden";
		if(formularioActivo !== "about"){document.getElementById("pie").style.visibility = "hidden";}
		notificar("CAPTURA DE PANTALLA", "Imagen no encontrada.");
	};
	
	var visualizarCaptura = function(){
		document.getElementById("captura").style.visibility = "hidden";
		if(formularioActivo !== "about"){document.getElementById("pie").style.visibility = "hidden";}
		clearTimeout(espera);
		espera = setTimeout(function(){
		nw.Shell.openItem(rutaImagenCaptura);
		notificar("CAPTURA DE PANTALLA", nombreImagen);
		},1000);	
	};
	
	var comprobarImagenCaptura = function(){
		fs.stat(rutaImagenCaptura, function (error){
			if(error){
				mostarError(error);
				return;
			}
			
			visualizarCaptura();			
		});		
	};
	
	var construirImagenCaptura = function(){
			ventanaPrincipal.focus();
			document.getElementById("captura").style.visibility = "visible";
			if(formularioActivo !== "about"){document.getElementById("pie").style.visibility = "visible";}			
			reproducirSonido("captura");
			clearTimeout(espera);
			espera = setTimeout(function(){
				ventanaPrincipal.capturePage(function(buffer){			
				fs.writeFile(rutaImagenCaptura, buffer, function (error) {
					if (error){
						mostarError(error);
						return;		
					}
					
					comprobarImagenCaptura();					
				});
			}, {format : 'png', datatype : 'buffer'});		
		}, 1000);	
		
	};
	
	var crearDirectorioCapturas = function(){
		fs.ensureDir(rutaDirectorioCapturas, function (error) {
			if(error){
				mostarError(error);
				return;
			}
			construirImagenCaptura();			  
		});
		
	};
	
	var comprobarDirectorioCapturas = function(){
		fs.stat(rutaDirectorioCapturas, function (error){
			if(error){
				if(error.code === "ENOENT"){
					crearDirectorioCapturas();
				}else{
					mostarError(error);
					return;
				}
				
			}
			construirImagenCaptura();			
		});		
	};
	
	var comprobarRutaEscritorio = function(){
		fs.stat(rutaEscritorio, function (error){
			if(error){
				mostarError(error);
				return;
			}
			comprobarDirectorioCapturas();			
		});		
	};
	
	if(!protector.activo){
		procesarCaptura = true;
			
	}	
	if(procesarCaptura){		
		comprobarRutaEscritorio();
	}
	
}	

/**
* Función - abrirCarpetaCapturasPantalla - Abre el explorador de archivos en la ruta donde se encuentra la carpeta
* que almacena las imágenes (capturas de pantalla), si esa carpeta existe y si contiene algún archivo.
**/
function abrirCarpetaCapturasPantalla(){
	protector.abrir();
	var rutaRelativaCarpeta = (process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE).toString() + path.sep + "cdocs-screenshots";
	var rutaAbsolutaCarpeta = propiedadesPrograma.capturasPantalla;
	var archivosImagen = [], numArchivosImagen = 0, error = false, mensajeError = "";
	try{
	archivosImagen = walkSync.entries(rutaRelativaCarpeta);
	}catch(errorCapturado){
		error = true;
		mensajeError = errorCapturado;
	}finally{
		if(!error){
		numArchivosImagen =  archivosImagen.length;
		}
		if(numArchivosImagen > 0){
			nw.Shell.showItemInFolder(rutaAbsolutaCarpeta);
			protector.cerrar("2000");			
		}else{
			notificar("CAPTURAS DE PANTALLA ...","No hay imágenes guardadas.");
			protector.cerrar("1000");			 			
		}
	}	
}



/**
* Objeto bd - Base de datos. WebSQL (almacenamiento) es aún parte de HTML5 en Chromium.
* Este sistema está declarado como obsoleto. En futuras versiones trataré de implementar SQLite, con algún módulo de terceros.
* ¡OJO! Todas las funciones relacionadas con la base de datos WebSQL son asíncronas.
**/

var bd = {};
bd.bancos = null;
bd.estado = {error:false, errorMensaje:"", tarea:""};
/**
* Objeto Base de datos - Función .abrir()
* Crea la base de datos 'bancos', con una sola tabla 'entidades'.
**/
bd.abrir = function(){
	this.estado.tarea = "abrir";
	this.bancos = openDatabase("bd_WebSQL_bancos", "1.0", "Entidades Financieras", 5 * 1024 * 1024);
	clearTimeout(espera);
	espera = setTimeout(function(){
		if((bd.bancos !== null) && (bd.bancos.version)){
		bd.comprobar();
	}else{
		bd.estado.error = true;
		bd.estado.errorMensaje = "Unable to open local database.";
	}		
	},1000);	
};
/**
* Objeto Base de datos - Función .comprobar()
* Comprueba si existe la tabla 'entidades', si no es así escribe dicha tabla.
**/

bd.comprobar = function(tabla){
	tabla = tabla || "entidades";
	this.estado.tarea = "comprobar";
	this.bancos.transaction(function (consulta){
		consulta.executeSql("SELECT name FROM sqlite_master WHERE type='table' AND name=?", [tabla], function (consulta, resultados) {
			if(resultados.rows.length === 0){
				bd.construir(tabla);
			}else{
				if(notificarNuevasVersiones){bd.actualizar();}
			}  
		}, function(transaction, error){
			this.estado.error = true;
			this.estado.errorMensaje = "Verification table failed.";
		});
	});	
	
};
/**
* Objeto Base de datos - Función .construir()
* Escribe la tabla 'entidades' en la base de datos 'bancos'.
**/
bd.construir = function(tabla){
	tabla = tabla || "entidades";	
	this.estado.tarea = "construir";
	var rutaDatosTabla = "";
	switch(tabla){
		case "entidades" :
		rutaDatosTabla = "./js/tabla_entidades_financieras.js";
		break;		
	}
	
	try{
		fs.statSync(rutaDatosTabla);							
	}catch(errorCapturado){
		this.estado.error = true;
		this.estado.errorMensaje = "Table not found."; 
	}
	
	if(this.estado.error === false){
	var datosTabla = require(rutaDatosTabla);
	
	datosTabla.escribirTablaEntidadesFinancieras(this.bancos, function(resultado){
		if(resultado === false){
			bd.estado.error = true;
			bd.estado.errorMensaje = "Construction of table failed."; 
		}		
	});
	}
};
/**
* Objeto Base de datos - Función .notificarError()
* Notifica, en los formularios que hacen uso de la base de datos, si ha ocurrido algún error en las operaciones
* de lectura o escritura de la correspondiente tabla.
**/
bd.notificarError = function(){
	var tipoError = ""; 
	switch(this.estado.tarea){
		case "abrir":
		case "construir":
		tipoError = "Error escritura Base de Datos :";
		break;
		case "actualizar":
		tipoError = "Error escritura Base de Datos :";
		break;
		case "comprobar":
		case "buscar":
		tipoError = "Error lectura Base de Datos :";
		break;
		default:
		tipoError = "Error operaciones Base de Datos :";		
	}
	notificar(tipoError, this.estado.errorMensaje);	
};

/**
* Objeto Base de datos - Función .actualizar()
* Actualiza la tabla 'entidaddes' en las actualizaciones de versión.
**/

bd.actualizar = function(tabla){
tabla = tabla || "entidades";
this.estado.tarea = "actualizar";
if(this.bancos !== null && this.estado.error === false){
this.bancos.transaction(function (consulta){
consulta.executeSql("DROP TABLE " + tabla,[], 
function(consulta,resultados){
	bd.construir(tabla);
},
function(consulta,error){
bd.estado.error = false;
bd.estado.errorMensaje = "Modification of table failed."; 	
});
});
}	
};

/**
* Objeto Base de datos - Función .buscarEntidadBancaria - Argumentos: Código de la entidad buscada; 'respuesta' es la función de
* salida (callback);
**/
bd.buscarEntidadBancaria = function(codEntidad, respuesta){
	this.estado.tarea = "buscar";
	codEntidad = parseInt(codEntidad,10);
	codEntidad = codEntidad.toString();	
	var datos = codEntidad + "||||||";	
	if(this.bancos === null){
		respuesta(datos);
		this.estado.error = true;
		this.estado.errorMensaje = "Unable to open local database.";
		
	}else{
	if(this.estado.error === false){
	this.bancos.transaction(function (consulta){			
		consulta.executeSql("SELECT * FROM entidades WHERE COD_BE=?", [codEntidad], function (consulta, resultados) {
			if(resultados.rows.length > 0){
				datos =  resultados.rows.item(0).COD_BE + "|" + resultados.rows.item(0).NOMBRE_50 + "|" + resultados.rows.item(0).NOMBRE_105 + "|" + resultados.rows.item(0).FECHA_BAJA + "|" + resultados.rows.item(0).MOTIVO_BAJA + "|" + resultados.rows.item(0).NOMBRE_35 + "|" + resultados.rows.item(0).ANAGRAMA;			
				respuesta(datos);
			}else{
				respuesta("DESCONOCIDA");
			}
		}, function(transaction, error){
			respuesta(datos);
			bd.estado.error = true;
			bd.estado.errorMensaje = "Search failed in table."; 
			
		});
	});	
	}else{
		respuesta(datos);			
	}
	}	
};


/**
* Objeto actualizaciones  - Sistema de actualizaciones de la aplicación. Los paquetes con el código fuente de la aplicación y el 'instalador' están
* almacenados en un sitio Web remoto.
**/
var actualizaciones = {};
actualizaciones.versionesInstaladasImagen = "";
actualizaciones.versionesDisponibles = "";
actualizaciones.versionesDisponiblesImagen = "";
actualizaciones.tarea = "";
actualizaciones.valorProgreso = 0;
actualizaciones.porcentaje = "&#160;";
actualizaciones.DistintivoPorcentaje = "&#160;";
actualizaciones.mensaje = "";
actualizaciones.alerta= "";
actualizaciones.pesoPaqueteComprimido = 0;
actualizaciones.pesoPaqueteComprimidoTexto = "";
actualizaciones.almacenamientoLocalTemporal = "";
actualizaciones.paqueteComprimidoURL = "";
actualizaciones.estado = 0;
actualizaciones.plataforma = (propiedadesEquipo.sistemaOperativoAlias === "macosx") ? "Mac OS X " : (propiedadesEquipo.sistemaOperativoAlias === "windows") ? "Windows" : "Linux";
actualizaciones.paqueteFuente = (propiedadesEquipo.sistemaOperativoAlias === "macosx") ? "app.nw" :  "package.nw";
actualizaciones.directorioDeTrabajo = path.dirname(process.cwd()) + path.sep + actualizaciones.paqueteFuente;
actualizaciones.directorioDeTrabajoResidual = path.dirname(process.cwd()) + path.sep + actualizaciones.paqueteFuente + ".new";
actualizaciones.directorioDeTrabajoObsoleto = path.dirname(process.cwd()) + path.sep + actualizaciones.paqueteFuente + ".old";

/**
* Objeto actualizaciones  - Función .anunciarDisponibilidad - Indica sobre disponibiliddad de una actualización de la aplicación, para su descarga e instalación.
**/
actualizaciones.anunciarDisponibilidad = function(estreno){
	estreno = estreno || false;	
		if(!estreno){
			actualizaciones.versionesInstaladasImagen = "<span>&#160;&#160;<img src='images/png/ok.png' alt='' title='' class='imagen-medio'></span>";
			actualizaciones.versionesDisponiblesImagen = "";
			actualizaciones.versionesDisponibles = propiedadesPrograma.versiones.larga;
			actualizaciones.tarea = "Actualizaciones disponibles ...";
			actualizaciones.mensaje = "Ahora no hay ninguna versión nueva para la aplicación.\n¡Vuelve pronto!\nGracias.";				
		}else{
			actualizaciones.versionesInstaladasImagen = "";
			actualizaciones.versionesDisponiblesImagen = "<span>&#160;&#160;<img src='images/png/ok.png' alt='' title='' class='imagen-medio'></span>";
			actualizaciones.tarea = "Actualizaciones disponibles ...";			
			actualizaciones.mensaje = "¡Hay una nueva versión! - CDOCS " + actualizaciones.versionesDisponibles +"\nPaquete: " + actualizaciones.paqueteComprimidoNombre + " (" +  actualizaciones.pesoPaqueteComprimidoTexto +  "). "+ actualizaciones.plataforma + ", 32 y 64 bit.\nPulsa 'INSTALAR' para comenzar con la la actualización o 'CANCELAR' si quieres dejarlo para otro momento.";	
			actualizaciones.estado = 1;
		}
		cargarFormulario("update");	
};

/**
* Objeto actualizaciones  - Función .comprobar - Con conexión a Internet, comprueba sobre la disponibilidad de actualizaciones (AJAX método POST, formato JSON).
**/
actualizaciones.comprobar = function(){
	actualizaciones.versionesDisponibles = "";
	actualizaciones.errorNum = 0;
	actualizaciones.errorMensaje = "";
	actualizaciones.mensajeAlerta = "";
	actualizaciones.valorProgreso = 0;
	actualizaciones.porcentaje = "&#160;";
	actualizaciones.DistintivoPorcentaje = "&#160;";
	actualizaciones.mensaje = "";
	actualizaciones.alerta= "";
	actualizaciones.pesoPaqueteComprimido = 0;
	actualizaciones.pesoPaqueteComprimidoTexto = "";
	actualizaciones.almacenamientoLocalTemporal = "";
	actualizaciones.paqueteComprimidoURL = "";
	actualizaciones.paqueteComprimidoNombre = "";
	actualizaciones.paqueteTemporalNombre = "";
	actualizaciones.archivosNuevos = 0;
	actualizaciones.pesoArchivosNuevos = 0;
	actualizaciones.rutaDirectorioActualizador =  path.dirname(process.cwd()) + path.sep + "cdocs-nw-updater"; 	
	actualizaciones.rutaInstalador = (propiedadesEquipo.sistemaOperativoAlias === "windows") ? actualizaciones.rutaDirectorioActualizador + path.sep + 'windows' + path.sep + "cdocs-nw-updater-windows-launcher.bat" : actualizaciones.rutaDirectorioActualizador + path.sep + "unix" + path.sep + "cdocs-nw-updater-unix.sh"; 
	actualizaciones.estado = 0;	
	protector.abrir();
	
	var comprobarEstadoRed = function(){

		dns.lookup("google.com", function(error) {
			if(error && error.code === "ENOTFOUND"){
				protector.cerrar("0");
				notificar("Sin acceso a Internet ..."); 
				return;
			}
			
			comprobarEnRepositorioExterno();
		});		
	};
	
	var comprobarEnRepositorioExterno = function(){
		var textoError = "";
		var pruebaArgumentos = true;
		var consistenciaArgumentos = [((propiedadesPrograma.identificador && propiedadesPrograma.identificador !=="") ? propiedadesPrograma.identificador : null), ((propiedadesPrograma.versiones.larga && (/^(\d+\.)?(\d+\.)?(\*|\d+)$/.test(propiedadesPrograma.versiones.larga)) ) ? propiedadesPrograma.versiones.larga : null), ((propiedadesEquipo.sistemaOperativoAlias && propiedadesEquipo.sistemaOperativoAlias !== "") ? propiedadesEquipo.sistemaOperativoAlias : null)];
		var consistenciaUrl = (propiedadesPrograma.repositorio.actualizaciones && (/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/.test(propiedadesPrograma.repositorio.actualizaciones))) ? propiedadesPrograma.repositorio.actualizaciones : null;
		if (consistenciaArgumentos.length === 3){ 
			for(contador = 0; contador < consistenciaArgumentos.length; contador += 1){if(consistenciaArgumentos[contador] === null){pruebaArgumentos = false;}}
		}else{
			pruebaArgumentos = false;
		}
		if (consistenciaUrl === null){pruebaArgumentos = false;}
		if(!pruebaArgumentos){
			actualizaciones.mensaje = "Los parámetros de la solicitud son insuficientes o carecen del formato esperado.\nÉste puede ser un error crítico.";
			actualizaciones.mensajeAlerta = "<span><img src='images/png/alerta.png' alt='' title='' class='alerta-imagen-error'></span><span class='alerta-texto-error'>Error 400 : Bad Request.</span>";
			actualizaciones.anunciarError(actualizaciones.estado);
			return;
		}
		var argumentos = "name=" + propiedadesPrograma.identificador + "&version=" + propiedadesPrograma.versiones.larga + "&os=" + propiedadesEquipo.sistemaOperativoAlias;
		var respuesta = {};
		var consulta = new XMLHttpRequest();
		consulta.open('POST',propiedadesPrograma.repositorio.actualizaciones, true);
		consulta.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');	
		consulta.timeout = 7000;
		consulta.send(argumentos);		
		consulta.ontimeout = function () {
			textoError = "524 : A Timeout Occurred";
			actualizaciones.mensajeAlerta = "<span><img src='images/png/alerta.png' alt='' title='' class='alerta-imagen-error'></span><span class='alerta-texto-error'>Error " + textoError + ".</span>";
			actualizaciones.anunciarError(actualizaciones.estado);			
		};
				
		consulta.onerror = function() {
			textoError = "419 : Name Not Resolved";	
			actualizaciones.mensajeAlerta = "<span><img src='images/png/alerta.png' alt='' title='' class='alerta-imagen-error'></span><span class='alerta-texto-error'>Error " + textoError + ".</span>";
			actualizaciones.anunciarError(actualizaciones.estado);				
		};
		consulta.onload = function(){
			if(consulta.status !== 200){textoError = documentarErrorAJAX(consulta.status);}
			
			if(textoError !== ""){
				actualizaciones.mensajeAlerta = "<span><img src='images/png/alerta.png' alt='' title='' class='alerta-imagen-error'></span><span class='alerta-texto-error'>Error " + textoError + ".</span>";
				actualizaciones.anunciarError(actualizaciones.estado);		
			}else{
				if(respuesta.hasOwnProperty('success') && respuesta.success && respuesta.hasOwnProperty('error') && respuesta.hasOwnProperty('errorMessage') && respuesta.hasOwnProperty('releases') && Array.isArray(respuesta.releases)){
					if(respuesta.error){
						if(respuesta.errorMessage !== ""){
							actualizaciones.mensajeAlerta = "<span><img src='images/png/alerta.png' alt='' title='' class='alerta-imagen-error'></span><span class='alerta-texto-error'>Error " + respuesta.errorMessage + ".</span>";
							actualizaciones.anunciarError(actualizaciones.estado);
						}else{
							actualizaciones.mensajeAlerta = "<span><img src='images/png/alerta.png' alt='' title='' class='alerta-imagen-error'></span><span class='alerta-texto-error'>Error 500 : Internal Server Error.</span>";

							actualizaciones.anunciarError(actualizaciones.estado);
						}
					}else{
						if((respuesta.releases[0].premiere) && (respuesta.releases[0].version > propiedadesPrograma.versiones.larga) && (respuesta.releases[0].url !== "") && (respuesta.releases[0].size) && (parseInt(respuesta.releases[0].size) > 0)){
							actualizaciones.versionesDisponibles = respuesta.releases[0].version;
							actualizaciones.pesoPaqueteComprimido = parseInt(respuesta.releases[0].size);
							actualizaciones.pesoPaqueteComprimidoTexto = formatearBytes(actualizaciones.pesoPaqueteComprimido, 2);
							actualizaciones.paqueteComprimidoURL = respuesta.releases[0].url;
							actualizaciones.paqueteComprimidoNombre = actualizaciones.paqueteComprimidoURL.substr(actualizaciones.paqueteComprimidoURL.lastIndexOf("/") + 1, actualizaciones.paqueteComprimidoURL.length);
							actualizaciones.anunciarDisponibilidad(true);							
						}else{
							actualizaciones.anunciarDisponibilidad(false);
						}
					}					
				
				}else{
					actualizaciones.mensajeAlerta = "<span><img src='images/png/alerta.png' alt='' title='' class='alerta-imagen-error'></span><span class='alerta-texto-error'>Error 500 : Internal Server Error.</span>";
					actualizaciones.anunciarError(actualizaciones.estado);
				}				
			}			
		};
		consulta.onreadystatechange = function(){
			if (consulta.readyState === 4 && consulta.status === 200) {				
				try{
					respuesta = JSON.parse(consulta.responseText);				
				}catch(errorFormatoJSON){
					if(/json/ig.test(errorFormatoJSON)){
						if(/[web filter block]/ig.test(consulta.responseText)){
							textoError = "401 : Unauthorized";
						}else{
							textoError = "601 : Access Token Invalid";	
						}
					}else{
						if(errorFormatoJSON.length > 56){textoError = errorFormatoJSON.substr(0, 56) + " ... ";}								
						textoError = "520 : " + textoError;						
					}
				}			
			}		
		}; 	
	};
	comprobarEstadoRed();	
};

/**
* Objeto actualizaciones  - Función .anunciarError - Alerta sobre un error en la búsqueda, descarga o instalación de una actualización.
**/
actualizaciones.anunciarError = function(estado){
	estado = estado || 0;
	if(ventanaPrincipalMinimizada){
		ventanaPrincipal.restore();	
		ventanaPrincipal.focus();	
	}
		
		if(estado === 0){
			actualizaciones.versionesInstaladasImagen = "";
			actualizaciones.versionesDisponiblesImagen = "";
			actualizaciones.versionesDisponibles = "?";
			actualizaciones.tarea = "Actualizaciones disponibles. Error ... ";
			actualizaciones.mensaje = (actualizaciones.mensaje === "") ? "Ha fallado la conexión con el repositorio de actualizaciones remoto:\n"  + propiedadesPrograma.repositorio.actualizaciones + "\nInténtalo de nuevo más tarde.\n¡Gracias!" : actualizaciones.mensaje;
			actualizaciones.alerta= actualizaciones.mensajeAlerta;
			cargarFormulario("update");				
		}else{
			if(actualizaciones.valorProgreso >= 100){
				actualizaciones.valorProgreso = 99;
				document.getElementById("update-progreso").value = actualizaciones.valorProgreso;
				document.getElementById("update-porcentaje-cifra").innerHTML = actualizaciones.valorProgreso.toString();			
			}			
			
			document.getElementById("update-versiones-actualizaciones").innerHTML = "&#160;";
			document.getElementById("update-versiones-actualizaciones").innerHTML = "<span>" + actualizaciones.versionesDisponibles + "</span><span>&#160;&#160;<img src='images/png/delete.png' alt='' title='' width='16' height='16' class='imagen-medio'></span>";	
			document.getElementById("update-progreso").value = actualizaciones.valorProgreso.toString();
			document.getElementById("update-porcentaje-cifra").innerHTML = document.getElementById("update-porcentaje-cifra").innerHTML;
			document.getElementById("update-porcentaje-distintivo").innerHTML = document.getElementById("update-porcentaje-distintivo").innerHTML;
			document.getElementById("update-tarea").innerHTML = "#&160;";
			document.getElementById("update-tarea").innerHTML = "Instalando actualizaciones. Error ...";
			document.getElementById("update-mensaje").innerHTML = actualizaciones.errorMensaje;
			document.getElementById("alerta-update").innerHTML = actualizaciones.mensajeAlerta;
			
			actualizaciones.estado = 0;
			cambiarEstadoBotones();
		}
	
};

/**
* Objeto actualizaciones  - Función .preparar - Comprueba los requisitos necesarios, previos a la descarga de un paquete de actualización.
**/
actualizaciones.preparar = function(){
	actualizaciones.estado = 2;
	cambiarEstadoBotones();
	
	var errorNum = 0;
	var mensajeTarea = "Preparando descarga : \n" + actualizaciones.paqueteComprimidoNombre + " (" +  actualizaciones.pesoPaqueteComprimidoTexto + ").";
	if(numVentanasSecundariasAbiertas > 0){
		for(contador = 0; contador < ventanasSecundariasAbiertas.length; contador += 1){
			if(ventanasSecundariasAbiertas[contador]){ventanasSecundariasAbiertas[contador].close();}
		}
	}
		
	var comprobarExistenciaPaqueteFuente = function(){
			var errorRequisitos;
			document.getElementById("update-mensaje").innerHTML = mensajeTarea + "\n— Comprobando requisitos.";
			fs.stat(actualizaciones.directorioDeTrabajo, function (error){
				if(error){
								errorNum = (error.errno && isNaN(error.errno) === false) ? Math.abs(error.errno) : "4000";
					
					actualizaciones.errorMensaje = mensajeTarea + "\n**\n" + error + "\n**\nPulsa 'CANCELAR' ..."; 
					actualizaciones.mensajeAlerta = "<span><img src='images/png/alerta.png' alt='' title='' class='alerta-imagen-error'></span><span class='alerta-texto-error'>Error " +errorNum + " : " + error.code + ".</span>";
					actualizaciones.anunciarError(actualizaciones.estado);
					return;
				}
				try{fs.removeSync(actualizaciones.directorioDeTrabajoResidual);}catch(error0){errorRequisitos = error0;}
				try{fs.removeSync(actualizaciones.directorioDeTrabajoObsoleto);}catch(error1){errorRequisitos = error1;}
				try{fs.removeSync(actualizaciones.rutaDirectorioActualizador);}catch(error2){errorRequisitos = error2;}
				
				clearTimeout(demora);
				demora = setTimeout(function(){crearDirectorioTemporal();}, 2000);				
			});
	};
	
	
	var crearDirectorioTemporal = function(){
		
		document.getElementById("update-mensaje").innerHTML = mensajeTarea + "\n— Creando espacio temporal.";		

		fs.mkdtemp(propiedadesPrograma.directorioTemporal + path.sep + 'cdocs-nw-update-', function(error, directorioTemporal){
		if (error) {
						errorNum = (error.errno && isNaN(error.errno) === false) ? Math.abs(error.errno) : "4000";
			
			actualizaciones.errorMensaje = mensajeTarea + "\n**\n" + error + "\n**\nPulsa 'CANCELAR' ..."; 
			actualizaciones.mensajeAlerta = "<span><img src='images/png/alerta.png' alt='' title='' class='alerta-imagen-error'></span><span class='alerta-texto-error'>Error " + errorNum + " : " + error.code + ".</span>";
			actualizaciones.anunciarError(actualizaciones.estado);
			return;				
		}
		actualizaciones.almacenamientoLocalTemporal = directorioTemporal;
			clearTimeout(demora);
			demora = setTimeout(function(){
				actualizaciones.valorProgreso = 1;
				document.getElementById("update-progreso").value = actualizaciones.valorProgreso;
				document.getElementById("update-porcentaje-cifra").innerHTML = actualizaciones.valorProgreso;
				clearTimeout(espera);
				espera = setTimeout(function(){actualizaciones.descargar();}, 500);	
			},1000);				
		});		
	};
	
	
	
		document.getElementById("update-progreso").value = "0";
		document.getElementById("update-porcentaje-cifra").innerHTML = "&#160;";
		document.getElementById("update-porcentaje-distintivo").innerHTML = "&#160;";
		document.getElementById("update-tarea").innerHTML = "&#160;";
		document.getElementById("update-mensaje").innerHTML = "&#160;";
		document.getElementById("alerta-update").innerHTML = "&#160;";
		document.getElementById("update-progreso").value = "0";
		document.getElementById("update-porcentaje-cifra").innerHTML = "0";
		document.getElementById("update-porcentaje-distintivo").innerHTML = "%";
		document.getElementById("update-tarea").innerHTML = "Instalando actualizaciones  ...";
		document.getElementById("update-mensaje").innerHTML = mensajeTarea + "\n— ";
		document.getElementById("alerta-update").innerHTML = "&#160;";
		document.getElementById("alerta-update").innerHTML = "<span><img src='images/gif/giro_14.gif' alt='' title='' class='alerta-imagen-info'></span><span class='alerta-texto-info'> ... esta operación puede durar algunos minutos.</span></span>";
		comprobarExistenciaPaqueteFuente();
	
};

/**
* Objeto actualizaciones  - Función .descargar - Descarga el paquete de actualización (comprimido .zip) en el directorio temporal creado al efecto.
**/


actualizaciones.descargar = function(){	
	var errorNum = 0;	
	var mensajeTarea = "Descargando : \n" + actualizaciones.paqueteComprimidoNombre + " (" +  actualizaciones.pesoPaqueteComprimidoTexto + ")";
	var transferencia = function(){	
		var regular = new RegExp("^https://", "i");
		var protocoloSeguro = ((regular.test(actualizaciones.paqueteComprimidoURL)) ? true : false);
		var protocolo = (protocoloSeguro) ? require("https") : require("http");		
		var solicitud = protocolo.get(actualizaciones.paqueteComprimidoURL, function (respuesta) {
			var peso = respuesta.headers['content-length'];
			respuesta.setEncoding('binary');
			var contador = "", porcentaje = 0;
			actualizaciones.valorProgreso = 1;
			document.getElementById("update-progreso").value = actualizaciones.valorProgreso;
			document.getElementById("update-porcentaje-cifra").innerHTML = (actualizaciones.valorProgreso).toString();		
			
			respuesta.on('data', function (pieza) {					
				contador += pieza;
				porcentaje = parseInt(Math.round(30  * contador.length/peso), 10);
				if(porcentaje >= 1){
					actualizaciones.valorProgreso = porcentaje;
					document.getElementById("update-progreso").value = actualizaciones.valorProgreso;
					document.getElementById("update-porcentaje-cifra").innerHTML = (porcentaje).toString();	
				}		
							
			});
			
			respuesta.on('end', function() {
				fs.writeFile(actualizaciones.almacenamientoLocalTemporal + path.sep + actualizaciones.paqueteComprimidoNombre, contador, 'binary', function (error) {
					if (error){
					errorNum = (error.errno && isNaN(error.errno) === false) ? Math.abs(error.errno) : "4000";
					
					actualizaciones.errorMensaje = mensajeTarea + "\n**" + error + "\n**\nPulsa 'CANCELAR' ..."; 
					actualizaciones.mensajeAlerta = "<span><img src='images/png/alerta.png' alt='' title='' class='alerta-imagen-error'></span><span class='alerta-texto-error'>Error " + errorNum + " : " + error.code + ".</span>";
					actualizaciones.anunciarError(actualizaciones.estado);
					return;				
					} 
					
					clearTimeout(demora);
					demora = setTimeout(function(){						
					verificarDescarga();
					}, 1000);
				});
			});
		});	
		solicitud.on('error', function(error){
			errorNum = (error.errno && isNaN(error.errno) === false) ? Math.abs(error.errno) : "521";			
			actualizaciones.errorMensaje = mensajeTarea + "\n**\n" + error + "\n**\nPulsa 'CANCELAR' ..."; 
			actualizaciones.mensajeAlerta = "<span><img src='images/png/alerta.png' alt='' title='' class='alerta-imagen-error'></span><span class='alerta-texto-error'>Error " + errorNum + " : " + error.code + ".</span>";
			actualizaciones.anunciarError(actualizaciones.estado);
			return;			
		});
		
	};
	
	var verificarDescarga = function(){		
		document.getElementById("update-mensaje").innerHTML = mensajeTarea + "\n— Verificando descarga.";
		document.getElementById("alerta-update").innerHTML = "&#160;";
		document.getElementById("alerta-update").innerHTML = "<span><img src='images/gif/giro_14.gif' alt='' title='' class='alerta-imagen-info'></span><span class='alerta-texto-info'> ... esta operación puede durar algunos minutos.</span></span>";
		fs.stat(actualizaciones.almacenamientoLocalTemporal + path.sep + actualizaciones.paqueteComprimidoNombre, function (error, acierto){
				if(error){
					errorNum = (error.errno && isNaN(error.errno) === false) ? Math.abs(error.errno) : "4000";
					
					actualizaciones.errorMensaje = mensajeTarea + "\n**\n" + error + "\n**\nPulsa 'CANCELAR' ..."; 
					actualizaciones.mensajeAlerta = "<span><img src='images/png/alerta.png' alt='' title='' class='alerta-imagen-error'></span><span class='alerta-texto-error'>Error " + errorNum + " : " + error.code + ".</span>";
					actualizaciones.anunciarError(actualizaciones.estado);
					return;						
				}
				if(acierto){
					if(acierto.size && acierto.size === actualizaciones.pesoPaqueteComprimido){
						clearTimeout(demora);
						demora = setTimeout(function(){
							actualizaciones.valorProgreso = 30;
							document.getElementById("update-progreso").value = actualizaciones.valorProgreso;
							document.getElementById("update-porcentaje-cifra").innerHTML = actualizaciones.valorProgreso;
							intervalo =	setInterval(function(){
								if(actualizaciones.valorProgreso < 32){
									actualizaciones.valorProgreso = actualizaciones.valorProgreso + 1;
									document.getElementById("update-progreso").value = actualizaciones.valorProgreso;
									document.getElementById("update-porcentaje-cifra").innerHTML = actualizaciones.valorProgreso.toString();							
									}else{
										clearInterval(intervalo);
										actualizaciones.desempaquetar();							
									}
								
							},500);												
						},1000);						
						
					}else{
						
						actualizaciones.errorMensaje = mensajeTarea + "\n**\nError: The downloaded package has an unexpected size.\n**\nPulsa 'CANCELAR' ..."; 
						actualizaciones.mensajeAlerta = "<span><img src='images/png/alerta.png' alt='' title='' class='alerta-imagen-error'></span><span class='alerta-texto-error'>Error : 4001 UNEXPECTED_SIZE.</span>";
						actualizaciones.anunciarError(actualizaciones.estado);
						return;
					}
				}		
				
			});
		
	};
	
		document.getElementById("update-mensaje").innerHTML = "&#160;";
		document.getElementById("update-progreso").value = 1;
		document.getElementById("update-porcentaje-cifra").innerHTML = "1";
		document.getElementById("update-porcentaje-distintivo").innerHTML = "%";
		document.getElementById("update-tarea").innerHTML = "Instalando actualizaciones  ...";
		document.getElementById("update-mensaje").innerHTML = mensajeTarea + "\n— ";
		transferencia();
};

/**
* Objeto actualizaciones  - Función .desempaquetar - Desempaqueta el contenido del archivo comprimido descargado.
**/

actualizaciones.desempaquetar = function(){
	var unzip = require("unzip"); 
	
	var errorNum = 0;
	
	var mensajeTarea = "Desempaquetando : \n" + actualizaciones.paqueteComprimidoNombre + " (" +  actualizaciones.pesoPaqueteComprimidoTexto + ")";
	
	var comprobarDesempaquetado = function(){
			
			document.getElementById("update-mensaje").innerHTML = mensajeTarea + "\n— Verificando resultados.";	
			actualizaciones.paqueteTemporalNombre = propiedadesPrograma.identificador + "-" + actualizaciones.versionesDisponibles + "-update";
			fs.stat(actualizaciones.almacenamientoLocalTemporal + path.sep + actualizaciones.paqueteTemporalNombre, function (error){
				if(error){
					errorNum = (error.errno && isNaN(error.errno) === false) ? Math.abs(error.errno) : "4000";					
					actualizaciones.errorMensaje = mensajeTarea + "\n**\n" + error + "\n**\nPulsa 'CANCELAR' ..."; 
					actualizaciones.mensajeAlerta = "<span><img src='images/png/alerta.png' alt='' title='' class='alerta-imagen-error'></span><span class='alerta-texto-error'>Error " + errorNum + " : " + error.code + ".</span>";
					actualizaciones.anunciarError(actualizaciones.estado);
					return;
				}
				
				
				try{
					var entradas = [];				
					entradas = walkSync.entries(actualizaciones.almacenamientoLocalTemporal + path.sep + actualizaciones.paqueteTemporalNombre);
					actualizaciones.archivosNuevos =  entradas.length;		
					entradas.forEach(function(objeto) {
					actualizaciones.pesoArchivosNuevos = actualizaciones.pesoArchivosNuevos + objeto.size;
					});						
					if((actualizaciones.archivosNuevos > 0) && (actualizaciones.pesoArchivosNuevos >= actualizaciones.pesoPaqueteComprimido)){
						clearTimeout(demora);
						demora = setTimeout(function(){
							actualizaciones.valorProgreso = 32;	
							document.getElementById("update-progreso").value = actualizaciones.valorProgreso;
							document.getElementById("update-porcentaje-cifra").innerHTML = actualizaciones.valorProgreso;
							intervalo =	setInterval(function(){
								if(actualizaciones.valorProgreso < 64){
								actualizaciones.valorProgreso = actualizaciones.valorProgreso + 1;
								document.getElementById("update-progreso").value = actualizaciones.valorProgreso;
								document.getElementById("update-porcentaje-cifra").innerHTML = actualizaciones.valorProgreso;							
								}else{
									clearInterval(intervalo);
									actualizaciones.copiarArchivosNuevos();								
								}
							}, 200);
						}, 500);								
						}else{
							
							actualizaciones.errorMensaje = mensajeTarea + "\n**\nError: The decompressed package has an unexpected size.\n**\nPulsa 'CANCELAR' ..."; 	
							actualizaciones.mensajeAlerta = "<span><img src='images/png/alerta.png' alt='' title='' class='alerta-imagen-error'></span><span class='alerta-texto-error'>Error : 4001 UNEXPECTED_SIZE.</span>";
							actualizaciones.anunciarError(actualizaciones.estado);
							return;
						}			
				}catch(error1){
					errorNum = (error1.errno && isNaN(error1.errno) === false) ? Math.abs(error1.errno) : "4004";
					var errorCode = (error1.code) ? error1.code : "EWALK";				
					actualizaciones.errorMensaje = mensajeTarea + "\n**\n" + error1 + "\n**\nPulsa 'CANCELAR' ...";  	
					actualizaciones.mensajeAlerta = "<span><img src='images/png/alerta.png' alt='' title='' class='alerta-imagen-error'></span><span class='alerta-texto-error'>Error " + errorNum + " : " + errorCode + "</span>";
					actualizaciones.anunciarError(actualizaciones.estado);
					return;
					
				}
			});			
		};
		document.getElementById("update-mensaje").innerHTML = "&#160;";
		document.getElementById("update-mensaje").innerHTML = mensajeTarea  + "\n— ";	
		fs.createReadStream(actualizaciones.almacenamientoLocalTemporal + path.sep + actualizaciones.paqueteComprimidoNombre).pipe(unzip.Extract({ path: actualizaciones.almacenamientoLocalTemporal}))
		.on('close', function(){
			document.getElementById("update-mensaje").innerHTML = "&#160;";
			document.getElementById("update-mensaje").innerHTML = mensajeTarea + "\n— Verificando resultados.";				
			clearTimeout(demora);
			demora = setTimeout(function(){
				comprobarDesempaquetado();
			},1000);	
		});
		
};
/**
* Objeto actualizaciones  - Función .copiarArchivosNuevos - Copia los archivos de la actualización desde el directorio temporal dinde fueron
* descargados y desempaqueados, en el directorio de trabajo raíz de la aplicación.
*/
actualizaciones.copiarArchivosNuevos = function(){
	var errorNum = 0;	
	var pesoEstimadoArchivosNuevos = (propiedadesEquipo.sistemaOperativoAlias === "windows") ? actualizaciones.pesoArchivosNuevos : actualizaciones.pesoArchivosNuevos + 4096;
	var mensajeTarea = "Copiando archivos : \nCDOCS " + actualizaciones.versionesDisponibles + " (nueva versión), " + actualizaciones.archivosNuevos + " archivos nuevos (" + formatearBytes(pesoEstimadoArchivosNuevos, 2) +").";	
	document.getElementById("update-mensaje").innerHTML = "&#160;";
	document.getElementById("update-mensaje").innerHTML = mensajeTarea  + "\n— ";	
	
	var comprobarCopia = function(){
	var entradas = [], numArchivosNuevosProvisional = 0, pesoArchivosNuevosProvisional = 0;	
	document.getElementById("update-mensaje").innerHTML = "&#160;";
	document.getElementById("update-mensaje").innerHTML = mensajeTarea + "\n— Comprobando copia de archivos.";	
			
			
			fs.stat(actualizaciones.directorioDeTrabajoResidual, function (error){
				if(error){
					errorNum = (error.errno && isNaN(error.errno) === false) ? Math.abs(error.errno) : "4000";
					
					actualizaciones.errorMensaje = mensajeTarea + "\n**\n" + error + "\n**\nPulsa 'CANCELAR' ..."; 
					actualizaciones.mensajeAlerta = "<span><img src='images/png/alerta.png' alt='' title='' class='alerta-imagen-error'></span><span class='alerta-texto-error'>Error " + errorNum + " : " + error.code + ".</span>";
					actualizaciones.anunciarError(actualizaciones.estado);
					return;
				}
				
				try{
					entradas = walkSync.entries(actualizaciones.directorioDeTrabajoResidual);	
				}catch(error1){
					errorNum = (error1.errno && isNaN(error1.errno) === false) ? Math.abs(error1.errno) : "4014";
					var errorCode = (error1.code && error1.code !== "") ? error1.code : "EWALK";					
					actualizaciones.errorMensaje = mensajeTarea + "\n**\n" + error1 + "\n**\nPulsa 'CANCELAR' ...";  	
					actualizaciones.mensajeAlerta = "<span><img src='images/png/alerta.png' alt='' title='' class='alerta-imagen-error'></span><span class='alerta-texto-error'>Error " + errorNum + " : " + errorCode + "</span>";
					actualizaciones.anunciarError(actualizaciones.estado);
					return;				
				}
				
				numArchivosNuevosProvisional =  entradas.length;		
				entradas.forEach(function(objeto){
					pesoArchivosNuevosProvisional = pesoArchivosNuevosProvisional + objeto.size;
				});	
				if((numArchivosNuevosProvisional === actualizaciones.archivosNuevos) && (pesoArchivosNuevosProvisional >= actualizaciones.pesoArchivosNuevos)){
						clearTimeout(demora);
						demora = setTimeout(function(){
							actualizaciones.valorProgreso = 64;	
							document.getElementById("update-progreso").value = actualizaciones.valorProgreso;
							document.getElementById("update-porcentaje-cifra").innerHTML = actualizaciones.valorProgreso;
							actualizaciones.moverInstalador();										
						
						},1000);								
						}else{							
							actualizaciones.errorMensaje = mensajeTarea + "\n**\nError: File copy failed.\n**\nPulsa 'CANCELAR' ..."; 	
							actualizaciones.mensajeAlerta = "<span><img src='images/png/alerta.png' alt='' title='' class='alerta-imagen-error'></span><span class='alerta-texto-error'>Error : 4009 FILE_COPY_FAILED.</span>";
							actualizaciones.anunciarError(actualizaciones.estado);
							return;
						}					
			});		
	};
	
	
	
	fs.copy(actualizaciones.almacenamientoLocalTemporal + path.sep + actualizaciones.paqueteTemporalNombre, actualizaciones.directorioDeTrabajoResidual,  function (error) {
		if(error){
			errorNum = (error.errno && isNaN(error.errno) === false) ? Math.abs(error.errno) : "4005";
			
			actualizaciones.errorMensaje = mensajeTarea + "\n**\n" + error + "\n**\nPulsa 'CANCELAR' ..."; 
			actualizaciones.mensajeAlerta = "<span><img src='images/png/alerta.png' alt='' title='' class='alerta-imagen-error'></span><span class='alerta-texto-error'>Error " + errorNum + " : " + error.code + ".</span>";	
		
					actualizaciones.anunciarError(actualizaciones.estado);
					return;	
		}
		
		clearTimeout(demora);
			demora = setTimeout(function(){
				comprobarCopia();				
			},2000);
			
		
	}); 
	
	
	
};
/**
* Objeto actualizaciones  - Función .moverInstalador - Mueve el directorio en el que se encuentran los archivos del 'instalador' hasta el 
* directorio de trabajo raíz de la aplicación.
*/
actualizaciones.moverInstalador = function(){	
		
		
		var errorNum = 0;
		var pesoEstimadoArchivosNuevos = (propiedadesEquipo.sistemaOperativoAlias === "windows") ? actualizaciones.pesoArchivosNuevos : actualizaciones.pesoArchivosNuevos + 4096;

		var mensajeTarea = "Copiando archivos : \nCDOCS " + actualizaciones.versionesDisponibles + " (nueva versión), " + actualizaciones.archivosNuevos + " archivos nuevos (" + formatearBytes(pesoEstimadoArchivosNuevos, 2) +").";	
		document.getElementById("update-mensaje").innerHTML = "&#160;";
		document.getElementById("update-mensaje").innerHTML = mensajeTarea  + "\n— Comprobando copia de archivos.";
		
		var comprobarExistenciaActualizador = function(){
			document.getElementById("update-mensaje").innerHTML = "&#160;";
			document.getElementById("update-mensaje").innerHTML = mensajeTarea + "\n— Comprobando copia de archivos.";
		
		var rutaInstaladorAuxiliarWindows = actualizaciones.rutaDirectorioActualizador + path.sep + 'windows' + path.sep + "cdocs-nw-updater-windows.vbs";
		
			var errorCapturado = false, objetoError;
			
			
			fs.stat(actualizaciones.rutaDirectorioActualizador, function (error){
				if(error){
					errorNum = (error.errno && isNaN(error.errno) === false) ? Math.abs(error.errno) : "4000";					
					actualizaciones.errorMensaje = mensajeTarea +"\n**\n" + error + "\n**\nPulsa 'CANCELAR' ..."; 
					actualizaciones.mensajeAlerta = "<span><img src='images/png/alerta.png' alt='' title='' class='alerta-imagen-error'></span><span class='alerta-texto-error'>Error " +errorNum + " : " + error.code + ".</span>";
					actualizaciones.anunciarError(actualizaciones.estado);
					return;	
				}
				fs.stat(actualizaciones.rutaInstalador, function (error){
					if(error){
					errorNum = (error.errno && isNaN(error.errno) === false) ? Math.abs(error.errno) : "4000";					
					actualizaciones.errorMensaje =  mensajeTarea + "\n**\n" + error + "\n**\nPulsa 'CANCELAR' ..."; 
					actualizaciones.mensajeAlerta = "<span><img src='images/png/alerta.png' alt='' title='' class='alerta-imagen-error'></span><span class='alerta-texto-error'>Error " +errorNum + " : " + error.code + ".</span>";
					actualizaciones.anunciarError(actualizaciones.estado);
					return;	
					}
					if(propiedadesEquipo.sistemaOperativoAlias === "windows"){
						
						try{
							fs.statSync(rutaInstaladorAuxiliarWindows);							
						}catch(error1){
							errorCapturado = true;
							objetoError = error1;
						}finally{
							if(errorCapturado){
								errorNum = (objetoError.errno) ? Math.abs(objetoError.errno) : 4000;
								var errorCode = (objetoError.code && objetoError.code !== "") ? objetoError.code : "UNDEFINED";								
								actualizaciones.errorMensaje =  mensajeTarea + "\n**\n" + objetoError + "\n**\nPulsa 'CANCELAR' ..."; 
								actualizaciones.mensajeAlerta = "<span><img src='images/png/alerta.png' alt='' title='' class='alerta-imagen-error'></span><span class='alerta-texto-error'>Error " +errorNum + " : " + errorCode + ".</span>";
								actualizaciones.anunciarError(actualizaciones.estado);
								return;									
							}else{
								
								intervalo =	setInterval(function(){	
									if(actualizaciones.valorProgreso < 97){
										actualizaciones.valorProgreso = actualizaciones.valorProgreso + 1;
										document.getElementById("update-progreso").value = actualizaciones.valorProgreso;
										document.getElementById("update-porcentaje-cifra").innerHTML = actualizaciones.valorProgreso.toString();							
									}else{
										clearInterval(intervalo);
										actualizaciones.configurar();								
									}
								}, 200);								
							}	
						}
					}else{
						
						intervalo =	setInterval(function(){
								if(actualizaciones.valorProgreso < 97){
								actualizaciones.valorProgreso = actualizaciones.valorProgreso + 1;
								document.getElementById("update-progreso").value = actualizaciones.valorProgreso;
								document.getElementById("update-porcentaje-cifra").innerHTML = actualizaciones.valorProgreso.toString();							
								}else{
									clearInterval(intervalo);
									actualizaciones.configurar();								
								}
						}, 200);							
					}
					
				});					
				
			});
			
	};
	
	fs.move(actualizaciones.directorioDeTrabajoResidual + path.sep + "cdocs-nw-updater" , actualizaciones.rutaDirectorioActualizador, function (error) {
		if (error){
			errorNum = (error.errno && isNaN(error.errno) === false) ? Math.abs(error.errno) : "4000";					
			actualizaciones.errorMensaje =  mensajeTarea + "\n**\n" + error + "\n**\nPulsa 'CANCELAR' ..."; 
			actualizaciones.mensajeAlerta = "<span><img src='images/png/alerta.png' alt='' title='' class='alerta-imagen-error'></span><span class='alerta-texto-error'>Error " +errorNum + " : " + error.code + ".</span>";
			actualizaciones.anunciarError(actualizaciones.estado);
			return;	
			
		}
		clearTimeout(demora);
		demora = setTimeout(function(){comprobarExistenciaActualizador();}, 1000);
	});
	
	
	
};

/**
* Objeto actualizaciones  - Función .configurar - Mediante el uso de los archivos correspondiente en el 'instalador' 
* realiza las funciones necesarias para:
* - Eliminar el directorio temporal en el que se almacenaron y desembalaron los archivos de la actualización en curso.
* - Renombrar el directorio de trabajo actual de la aplicación, añadiendo el sufijo '.old'.
* - Renombrar el nuevo directorio de trabajo de la aplicaión (actualización), eliminando el sufijo '.new'.
* - Reiniciar la aplicación actualizada.
* El 'instalador' contiene una serie de archivos ejecutables en la línea de comandos. Un archivo (guiones) '.bat' y otro '.vbs' en el caso de
* Windows. Un archivo (guión) '.sh' para Linux y Mac OSX.
*/

actualizaciones.configurar = function(){	
	var errorNum = 0, errorCode;
	var mensajeTarea = "Configurando : \nCDOCS "+ actualizaciones.versionesDisponibles + " (nueva versión).";
	actualizaciones.valorProgreso = 97;	
	document.getElementById("update-progreso").value = actualizaciones.valorProgreso;
	document.getElementById("update-porcentaje-cifra").innerHTML = actualizaciones.valorProgreso;
	document.getElementById("update-mensaje").innerHTML ="#&160;";	
	document.getElementById("update-mensaje").innerHTML = mensajeTarea  + "\n— ";
	document.getElementById("alerta-update").innerHTML = "&#160;";
	document.getElementById("alerta-update").innerHTML = "<span><img src='images/gif/giro_14.gif' alt='' title='' class='alerta-imagen-info'></span><span class='alerta-texto-info'> ... un momento por favor.</span></span>";
	
	if(ventanaPrincipalMinimizada){
		ventanaPrincipal.restore();	
		ventanaPrincipal.focus();	
	}
	
	var reiniciar = function(){
	var procesoHijo = null; 
	var spawn = require("child_process").spawn;
	var procesoHijoError = false;
	var procesoHijoErrorMensaje = "";
	actualizaciones.valorProgreso = 100;
	document.getElementById("update-progreso").value = actualizaciones.valorProgreso;	
	document.getElementById("update-mensaje").innerHTML = mensajeTarea  + "\n— Reiniciando aplicación.";
	document.getElementById("update-porcentaje-cifra").innerHTML = actualizaciones.valorProgreso;
		
	if(propiedadesEquipo.sistemaOperativoAlias === "windows"){
		
		procesoHijo = spawn("cmd.exe", ["/c", actualizaciones.rutaInstalador, process.cwd(), process.execPath],{detached:true, shell:false});	
		procesoHijo.unref();
		
		procesoHijo.stderr.on('data', function(data) {
			procesoHijoError = true;
			procesoHijoErrorMensaje = data.toString();			
		});
		
		procesoHijo.on('close', function(code) {
			if(procesoHijoError){			
			actualizaciones.errorMensaje = mensajeTarea + "\n**\nError : " + procesoHijoErrorMensaje + "\n**\nPulsa 'CANCELAR' ..."; 
			actualizaciones.mensajeAlerta = "<span><img src='images/png/alerta.png' alt='' title='' class='alerta-imagen-error'></span><span class='alerta-texto-error'>Error " + procesoHijo.pid + " : ECHILDPROCESS.</span>";	
			actualizaciones.anunciarError(actualizaciones.estado);
			return;		
			}
				
					switch(parseInt(code, 10)){
						case 0:
						code = 0;
						break;
						case 6009 :
						actualizaciones.errorMensaje = mensajeTarea + "\n**\nError : No han llegado los parámetros esperados.\n**\nPulsa 'CANCELAR' ..."; 
						actualizaciones.mensajeAlerta = "<span><img src='images/png/alerta.png' alt='' title='' class='alerta-imagen-error'></span><span class='alerta-texto-error'>Error 6009 : EARGUMENTS.</span>";	
						break;
						case 6010 :
						actualizaciones.errorMensaje = mensajeTarea + "\n**\nError : No se encontró el archivo 'cdocs-nw-updater-windows.vbs'.\n**\nPulsa 'CANCELAR' ..."; 
						actualizaciones.mensajeAlerta = "<span><img src='images/png/alerta.png' alt='' title='' class='alerta-imagen-error'></span><span class='alerta-texto-error'>Error 4058 : ENOENT.</span>";	

						break;
						case 6011 :
						actualizaciones.errorMensaje = mensajeTarea + "\n**\nError : La ejecución del comando 'START' no ha funcionado.\n**\nPulsa 'CANCELAR' ..."; 
						actualizaciones.mensajeAlerta = "<span><img src='images/png/alerta.png' alt='' title='' class='alerta-imagen-error'></span><span class='alerta-texto-error'>Error 6011 : ECOMMAND.</span>";	

						break;
						default:
						actualizaciones.errorMensaje = mensajeTarea + "\n**\nError : El procesamiento por lotes externo ha fallado.\n**\nPulsa 'CANCELAR' ..."; 
						actualizaciones.mensajeAlerta = "<span><img src='images/png/alerta.png' alt='' title='' class='alerta-imagen-error'></span><span class='alerta-texto-error'>Error " + code + " : EBATCHPROCESSING.</span>";	
										
					}
					
						if(code === 0){
							ventanaPrincipal.minimize();
							actualizaciones.estado = 0;
							cambiarEstadoBotones();
							salir();
						}else{
							actualizaciones.anunciarError(actualizaciones.estado);
							return;	
						}			
					
			
		});	
		
	}else{
		try{
			fs.chmodSync(actualizaciones.rutaInstalador,"700");
		}catch(error){
			errorNum = (error.errno && isNaN(error.errno) === false) ? Math.abs(error.errno) : "4011";
			errorCode = (error.code && error.code !== "") ? error.code : "EPERM";	
			actualizaciones.errorMensaje = mensajeTarea + "\n**\n" + error + "\n**\nPulsa 'CANCELAR' ..."; 
			actualizaciones.mensajeAlerta = "<span><img src='images/png/alerta.png' alt='' title='' class='alerta-imagen-error'></span><span class='alerta-texto-error'>Error " + errorNum + " : " + error.code + ".</span>";	
			actualizaciones.anunciarError(actualizaciones.estado);
			return;			
		}
		
		procesoHijo = spawn(actualizaciones.rutaInstalador, [propiedadesEquipo.sistemaOperativoAlias, process.cwd(), process.execPath],{stdio: ['ignore','ignore','ignore']});	
		procesoHijo.unref();
		ventanaPrincipal.minimize();
		actualizaciones.estado = 0;
		cambiarEstadoBotones();
		salir();		
	}	
};
	
	clearTimeout(demora);
	demora = setTimeout(function(){
	
		actualizaciones.valorProgreso = 98;	
		document.getElementById("update-progreso").value = actualizaciones.valorProgreso;
		document.getElementById("update-porcentaje-cifra").innerHTML = actualizaciones.valorProgreso;
		document.getElementById("update-mensaje").innerHTML = "#&160;";
		document.getElementById("update-mensaje").innerHTML = mensajeTarea + "\n— Eliminando archivos temporales.";
	
	try{	
	fs.removeSync(actualizaciones.almacenamientoLocalTemporal);
	}catch(error){
		errorNum = 0;
	}finally{
		
			
		intervalo =	setInterval(function(){
			if(actualizaciones.valorProgreso < 99){
				actualizaciones.valorProgreso = actualizaciones.valorProgreso + 1;
				document.getElementById("update-progreso").value = actualizaciones.valorProgreso;
				document.getElementById("update-porcentaje-cifra").innerHTML = actualizaciones.valorProgreso.toString();							
			}else{
				clearInterval(intervalo);
				clearTimeout(demora);
				demora = setTimeout(function(){
					reiniciar();
				},1000);		
			}
		}, 1000);			
	}	
	}, 1000);
	

};
/********************************************************
* Función - registrarVersiones_abrirBaseDatos - Registra datos (sobre la versión corriente) en el almacenamiento
* persistente de la aplicación. Crea/abre la base de datos 'bancos'.
*********************************************************/
function registrarVersiones_abrirBaseDatos(){
	notificarNuevasVersiones = false;
	var almacenamientoLocalVersiones = localStorage.getItem("claveVersiones");		
	if(propiedadesPrograma.versiones.larga && almacenamientoLocalVersiones === null){
		localStorage.setItem("claveVersiones", propiedadesPrograma.versiones.larga);
		notificarNuevasVersiones = true;	
	}else{
		if(propiedadesPrograma.versiones.larga && (propiedadesPrograma.versiones.larga > almacenamientoLocalVersiones)){
			localStorage.setItem("claveVersiones", propiedadesPrograma.versiones.larga);
			notificarNuevasVersiones = true;			
		}
	}
	bd.abrir();
}
function iniciarPermisosWebview(){	
	if(localStorage.getItem ("webview") === null){
		if(propiedadesEquipo.sistemaOperativoAlias === "windows"){
			localStorage.setItem("webview", "true");
		}else{
			localStorage.setItem("webview", "false");
		}		
	}
	if(localStorage.getItem("webview") === "true"){
		
		propiedadesPrograma.permisos.webview = true;
	}else{
		propiedadesPrograma.permisos.webview = false;
	}
}

function modificarPermisosWebview(permisoConcedido){
	var permisoInicial = (propiedadesPrograma.permisos.webview) ? true : false;	
	if(formularioActivo === "options"){
		cambiarEstadoBotones("inicial");
		document.getElementById("alerta-options").innerHTML = "&#160;";	
		if(document.getElementById("options-webview").checked){
			document.getElementById("verificado-options").style.visibility = "visible";
		}else{
			document.getElementById("verificado-options").style.visibility = "hidden";
		}
		
		if(permisoInicial !== permisoConcedido){
			cambiarEstadoBotones("esperando");
			document.getElementById("alerta-options").innerHTML ="<span><img src='images/png/info_14.png' alt='' title='' class='alerta-imagen-info'></span><span class='alerta-texto-info'> ... pulsa &#171;GUARDAR&#187; para conservar los cambios.</span></span>";	
		}
		
	}	
}	
/********************************************************
* Función iniciar - De puesta en marcha de la aplicación. (el argumento es una función de llamada 'callback').
*********************************************************/

function iniciar(verFormularioInicio){
	precargaImagen(iconos);
	mnuEmergente = construirMnuEmergente();
	fechaSistema = new obtenerFecha(); 
	propiedadesEquipo.obtenerSistema();	
	alertaSalida = document.getElementById("advertencia-salida");
	alertaSalida.addEventListener("close", function (){if(parseInt(alertaSalida.returnValue,10) === 1){salir();}});
	if(propiedadesEquipo.sistemaOperativoAlias !== "macosx"){activarIconoBandeja();}
	atajoTecladoImprimir = new nw.Shortcut({key : "Ctrl+P", active : function() {capturarPulsacionesTeclado(this.key);}});
	nw.App.registerGlobalHotKey(atajoTecladoImprimir);	
	document.oncontextmenu = function(){return false;};
	document.addEventListener("keydown",function(event){
		event.stopPropagation();
		if(!event.altKey && event.keyCode === 13){
			capturarPulsacionesTeclado("Enter");
		}
	},false);	
	
	if(propiedadesEquipo.sistemaOperativoAlias === "linux"){
		ventanaPrincipal.setResizable(false);
	}
	iniciarPermisosWebview("webview");
	registrarVersiones_abrirBaseDatos();
	propiedadesPrograma.obtenerEstadoNotificaciones();
	propiedadesPrograma.obtenerRepositorios();
	propiedadesEquipo.obtenerPropiedadesPantalla();
	propiedadesEquipo.obtenerIdioma();	
	verFormularioInicio();	
}

/********************************************************
* Capturas de los eventos que se producen en la ventana principal.
*********************************************************/


ventanaPrincipal.on("loaded", function(){
		iniciar(function(){
		protector.abrir();
		cargarFormulario("home");
		ventanaPrincipal.show();
		ventanaPrincipal.focus();		
	});	
});

ventanaPrincipal.on('minimize', function(){ventanaPrincipalMinimizada = true;});

ventanaPrincipal.on('restore', function(){
	ventanaPrincipalMinimizada = false;	
	ventanaPrincipal.setPosition("center");
	ventanaPrincipal.focus();
	if(propiedadesEquipo.sistemaOperativoAlias === "linux"){
		ventanaPrincipal.setResizable(false);
	}	
	
});
ventanaPrincipal.on('close', function(){
	
	if(actualizaciones.estado === 2){		
		if(ventanaPrincipalMinimizada){
			ventanaPrincipal.restore();	
			ventanaPrincipal.focus();			
		}
		return;
	}
		
	if(numVentanasSecundariasAbiertas > 0 ){
		if(!alertaSalida.open){
			notificar("", "",true);
			return;			
		}else{
			salirConAdvertenciaSalidaVisible();			
			return;	
		}		
	} 
	
	if(iconoBandeja !== null){
		iconoBandeja.remove();
		iconoBandeja = null;
	}
	
	clearTimeout(espera);
	clearTimeout(demora);
	clearTimeout(aplazamientoCierreProtector);
	clearInterval(intervalo);	
	nw.App.clearCache();	
	nw.App.unregisterGlobalHotKey(atajoTecladoImprimir);
	nw.App.closeAllWindows();
	ventanaPrincipal.close(true);	
});

ventanaPrincipal.on('focus', function() {
ventanaPrincipalFoco = true; 
 });
 
ventanaPrincipal.on('blur', function() {
	ventanaPrincipalFoco = false;		
});

/********************************************************
* Capturas de los eventos que se producen en la pantalla. Cambio en los límites y en el número de monitores.  
*********************************************************/
nw.Screen.on('displayBoundsChanged', function(objetoPantalla){	
	propiedadesEquipo.obtenerPropiedadesPantalla();
	if(formularioActivo && formularioActivo === "about"){cargarFormulario("home");}
});
nw.Screen.on('displayAdded', function(objetoPantalla){
	propiedadesEquipo.obtenerPropiedadesPantalla();
	if(formularioActivo && formularioActivo === "about"){cargarFormulario("home");}
});
nw.Screen.on('displayRemoved', function(objetoPantalla){
	propiedadesEquipo.obtenerPropiedadesPantalla();
	if(formularioActivo && formularioActivo === "about"){cargarFormulario("home");}
});

/********************************************************
* Manejador de errores 'Node.js' Conviene utilizar sólo durante el desarrollo para depurar los errores y excepciones 
* no capturados que pueden producirse en la ejecución de la aplicación.
* En las versiones "Beta" (experimentales) se mantiene. Si detecta error añade la información correspondiente al 
* fichero:txt/errorlog.txt.
********************************************************/

process.on('uncaughtException', function(error){	
	var fecha = new Date(), errorEscritura = false;
	var fechaUTC = fecha.toUTCString(); 
	var datos = "\nUNCAUGHT EXCEPTION!\nDate: " + fechaUTC + "\nMessage: " + error.message + "\n" + error.stack + "\n*****";
	try{
		fs.appendFileSync("./txt/errorlog.txt", datos);	
	}catch(e){
		errorEscritura = true;
	}finally{
		
		process.exit(1);
	}	
});




