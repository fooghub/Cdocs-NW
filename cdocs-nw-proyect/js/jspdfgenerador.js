/** @preserve
* Cdocs // jspdfgenerador.js - Javascript. 
* Versión 0.1.0
* Fecha de edición/revisión: 31/01/2016
* Copyright (c) 2004 - 2016 Foog.Software
* Licencia MIT.
**/

/**
* Función - crearArchivoPDF - Genera un documento PDF con AlivePDF. 
**/
/* jshint undef: true, unused: true, eqeqeq: true, browser: true, node: false */
function crearArchivoPDF(formulario){
	var errorPDF = false;
	var errorPDFmensaje= "";
	var fechaPDF = new obtenerFecha();
	var nombrePDF = formulario + "_" + parseInt(fechaPDF.marcaTemporal / 1000,10) + ".pdf";
	var documentoFecha = fechaPDF.dd + "/" + fechaPDF.mm + "/" + fechaPDF.aaaa + " " + fechaPDF.horas + ":" + fechaPDF.minutos + ":" + fechaPDF.segundos;
	var documentoAutor = "Foog.Software";
	var documentoWeb = "www.foog.es";
	var documentoAsunto = "Oficina: Gestión de documentos";
	var documentoPrograma = "CDOCS (Comprueba Documentos) ";
	var titular = "", titularVentana = "", titularPropiedades = "", abreviatura = "", abreviatura2 = "" ,  numVerificado = "", numVerificado2 = "", entidad = "", observaciones = "", definiciones = "", datos = "";
	//Datos base64. Para la imágenes incrustadas, (images/note.jpg), (images/copyleft.jpg):
	var imagenLogo = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAgAAZABkAAD/7AARRHVja3kAAQAEAAAAHgAA/+4ADkFkb2JlAGTAAAAAAf/bAIQAEAsLCwwLEAwMEBcPDQ8XGxQQEBQbHxcXFxcXHx4XGhoaGhceHiMlJyUjHi8vMzMvL0BAQEBAQEBAQEBAQEBAQAERDw8RExEVEhIVFBEUERQaFBYWFBomGhocGhomMCMeHh4eIzArLicnJy4rNTUwMDU1QEA/QEBAQEBAQEBAQEBA/8AAEQgAQABAAwEiAAIRAQMRAf/EAHgAAAEFAQEAAAAAAAAAAAAAAAQAAwUGBwIBAQEAAAAAAAAAAAAAAAAAAAAAEAACAQIDAggMBgMBAAAAAAABAgMABBESBSExUXHSExRVBhZBgZHBIjKSkzRUlBVhodFCUqIjM1PTEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwC+yyLEhZvEPCTwVG3uqWtkR0+6EDNtWFBmfDhOAajZttxCp3ek3jArO+jajrN9dSwrzsoctJiyrgCSFAzkbsKC2d49E+el9huRS7x6J89L7Df+dVju1rfy6+9j5dLuzrfy6+9j5dBZ+8eifPS+w3Ioqy1azvHKWN4JZQMeakGViBwYhap3drW/l197Hy6HubHUtIeG4mXmXDYxMrqxzJt/YTQaXFKJVxwwI2Mp3g05QsDYzk7ucjRyPxNFUA8vxcPE3mrNIIrCa4nF9ctbAMchWMy5jmOO4jDCtLl+Lh4m81Znazww3FwZbEXwLHBWLjJgzbf8fDQE9D7PdaSfTNyqXQ+z3Wkn0zcql0+z6hT2pq96fZ9Qp7U1B50Ps91pJ9M3KqNnESSSLA5kiBISQjKWXhy+CnLrNNO0kNm1tGQMIUV2UYDhYY7aZEE7ukQjYPKwSNSpGZmOAAxoNRjlWKVC4IUwp6WBI8tGqysAynEHcap03aLUW1+HTbAq0EbpBImUHnCNkpzbwF27uCrVbYB5VX1A2z8D4aBS/Fw8TVm2mfdDc3X266S0bMecLyrFmGZsMM2/CtIl+Lh4m81ZZbjSmuLj7k8yKHbm+YVWJOZsc2egncvarraH6qP9K6ji7WSSJGurRFnIUYXKMdvAAMTURzfZL/vfe6i/Wuox2WikWWO5v0kjIZHEcQKspxBG2glPuFxdSPZ6dq92b6MlYxPkSO4ZdjLGRtU/xzb6FtNQ1HJcalqU0kradjHbRy7xdyjINmH7FxY1xqEWnay73WjM/TUXnLi2dRG02HrTQhSRm8LKOMUDc6rqOrra2T4PIrZVKjB5ZHwQPJwsAMMaCf7F2RHP6vIMxXGG3x/c7eu3m8tXWCPmolXed7HhJ30Dp1jHZxW1hH/rtYwSf5Od7eXE1J0A8/ozwud2JXy1l7zSaLqV5b3NnBcvnOAuULALmLK6YEesDWqyRrKhRtxqMv8ASLa9CrfWiXeTYkm5wOMYH86Cgd4ouqdP903Kpd4ouqdP903Kq5d1tD6r/u3Lpd1tD6r/ALty6Cnx9puZkWWLS7GORDmR1jYMpHhBD13DrJu75ZLPTYk1e4Yok8bPlVn9EyLCfRDYHf46tvdbQ+q/7ty6MsNGtLFi1hZR2rsMGlPpPhxkk/nQGWy4TMMcebRUJ4SKLpuKJYkyjad5J3k8NOUH/9k=";
	var imagenCopyLeft = "data:image/jpeg;base64,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";
	var recursoPDFcadena = "";
	switch(formulario){
	case "iban" :
		datos = (document.forms.iban.elements["oculto-iban"].value).split("|");
		titularVentana = "CDOCS : IBAN (PDF)";
		titular = "INTERNATIONAL BANK ACCOUNT NUMBER";
		abreviatura = "IBAN  :";
		numVerificado = datos[0];
		abreviatura2 = "BBAN :";
		numVerificado2 = datos[1];
		if(datos[0].substr(0,2) === "ES"){
			if(datos[2] === "DESCONOCIDA"){
				entidad = "País : España";
				observaciones = "La entidad con número " +  datos[1].substr(0,4) + " NO está registrada en la base de datos de la aplicación, que contiene información sobre el Registro de Entidades del B.E.";	
			}else{
				entidad = datos[2];
				observaciones = (datos[3]) ? "La entidad " + datos[1].substr(0,4)  + " causó BAJA con fecha " + datos[3] + " en el Registro de Entidades del Banco de España, (" + datos[4] + ")." : "" ;	
			} 
		}else{
			entidad = "País : " + datos[2];
		}
		definiciones = "El International Bank Account Number  –Código Internacional de Cuenta Bancaria, en español – es un código alfanumérico que identifica una cuenta bancaria determinada en una entidad financiera en cualquier lugar del mundo (si el país está adherido al sistema IBAN).\nConsta de un máximo de 34 caracteres alfanuméricos. Los dos primeros identifican el país. Los dos siguientes son dígitos de control. Los restantes son el número de cuenta o  BBAN (Basic Bank Account Number).";
	break;
	case "ccc" :
		datos = (document.forms.ccc.elements["oculto-ccc"].value).split("|");
		titularVentana = "CDOCS : CCC (PDF)";
		titular = "CÓDIGO CUENTA CLIENTE";
		abreviatura = "CCC  :";
		numVerificado = document.forms.ccc.elements[0].value + " " + document.forms.ccc.elements[1].value + " " + document.forms.ccc.elements[2].value + " " + document.forms.ccc.elements[3].value;
		abreviatura2 = "IBAN :";
		numVerificado2 = datos[0] + " " + numVerificado;
		if (datos[1] === "DESCONOCIDA"){
			observaciones = "La entidad con número " + document.forms.ccc.elements[0].value + " NO está registrada en la base de datos de la aplicación, que contiene información sobre el Registro de Entidades del B.E.";	
		}else{
			entidad = datos[1];
			if(datos[3] && /\sA$/i.test(datos[3])) datos[3] = datos[3].substr(0,datos[3].length -2);
			if(datos[3] && /\sPOR$/i.test(datos[3])) datos[3] = datos[3].substr(0,datos[3].length -4);
			observaciones = (datos[2]) ? "La entidad " + document.forms.ccc.elements[0].value + " causó BAJA con fecha " + datos[2] + " en el Registro de Entidades del Banco de España, (" + datos[3] + ")." : "" ;	
		}	
		definiciones =  "El Código Cuenta Cliente (CCC) es un código utilizado en España por las entidades financieras para la identificación de las cuentas de sus clientes.\nConsta de veinte dígitos. Los cuatro primeros son el Código de la Entidad, que coincide con el Número de Registro de Entidades del Banco de España. Los cuatro siguientes identifican la oficina. Los siguientes dos dígitos son los llamados dígitos de control, que sirven para validar el CCC. Los diez últimos dígitos identifican unívocamente la cuenta.";
	break;
		case "ntc": 
			titularVentana = "CDOCS : NTC (PDF)";
			titular = "NÚMERO DE TARJETA DE CRÉDITO O DÉBITO";
			abreviatura = "NTC :";
			numVerificado = document.forms.ntc.elements[0].value.substr(0,6)  + " " + document.forms.ntc.elements[0].value.substr(6,document.forms.ntc.elements[0].value.length - 7)+ " " + document.forms.ntc.elements[0].value.substr(-1);
			datos = document.forms.ntc.elements["oculto-ntc"].value;
			if(datos){
				entidad = "TARJETA : " + datos;
				observaciones = 'Es posible que el dato "TARJETA", no coincida con el del documento examinado.';
			}
			definiciones = "La tarjeta de crédito (o débito) es un instrumento material de identificación. Puede ser una tarjeta de plástico con una banda magnética, un microchip y un número en relieve, que es un caso especial de la norma ISO/IEC 7812.\nLos seis primeros dígitos conforman el Número de Identificación del Emisor (IIN) que contiene el identificador principal de la industria (MII), primer dígito de los seis. Un número de cuenta, serie de extensión variable, y un último dígito (de control) que cumple el algoritmo de Luhn con respecto a todos los números anteriores.";
	break;
	case 'nif' :
		titularVentana = "CDOCS : NIF (PDF)";
		titular = "NÚMERO DE IDENTIFICACIÓN FISCAL";
		abreviatura = "NIF :";
		datos = document.forms.nif.elements["oculto-nif"].value.split("|");
		var tipo = document.forms.nif.elements[0].value;
		var valor = document.forms.nif.elements[1].value + " " + document.forms.nif.elements[2].value;
		if(tipo === "I"){
			//DNI
			numVerificado = valor;
			abreviatura2 = "DNI :";
			numVerificado2 = valor;	
			entidad = datos[0];	
		}else if(/^[XYZ]/i.test(tipo)){
			numVerificado = tipo + " " + valor;
			abreviatura2 = "NIE :";
			numVerificado2 = numVerificado;	
			entidad = 'Tipo "' + tipo + '" - ' + datos[0];
		}else{
			numVerificado = tipo + " " + valor;
			entidad = 'Tipo "' + tipo + '" - ' + datos[0];
		}
		if(!/^[IKLMXYZ]/i.test(tipo)){
			if(datos[1] && datos[1] !== "" && datos[1] !== "DESCONOCIDA"){
			observaciones = "Con sede en la provincia de " + datos[1].toUpperCase() + " si el NIF fue asignado con anterioridad a enero del 2008."; 
			}
		}
		definiciones = "El Número de Identificación Fiscal (NIF) es la manera de identificación tributaria utilizada en España para las personas físicas y jurídicas. El antecedente del NIF es el Código de Identificación Fiscal (CIF), utilizado sólo en personas jurídicas hasta enero de 2008.\nEstá formado generalmente por una letra inicial seguida de siete u ocho números más un dígito de control, que puede ser un número o una letra.";
	break;
	case 'dni' :
		titularVentana = "CDOCS : DNI (PDF)";
		titular = "DOCUMENTO NACIONAL DE IDENTIDAD";
		abreviatura = "DNI :";
		numVerificado = document.forms.dni.elements[1].value + " " + document.forms.dni.elements[2].value;
		abreviatura2 = "NIF :";
		numVerificado2 = numVerificado;	
		definiciones = "El DNI es un documento público, personal e intransferible, emitido por el Ministerio del Interior, que acredita la identidad y los datos personales de su titular, así como la nacionalidad española del mismo.\nEsta formado por un máximo de ocho números y una letra final (de control).\nEl NIF (Número de Identificación Fiscal) para los nacionales con DNI coincide con este último.";
	break;
	case 'nie' :
		titularVentana = "CDOCS : NIE (PDF)";
		titular = "NÚMERO DE IDENTIDAD DE EXTRANJERO";
		abreviatura = "NIE :";
		numVerificado = document.forms.nie.elements[0].value + " " + document.forms.nie.elements[1].value + " " + document.forms.nie.elements[2].value;
		abreviatura2 = "NIF :";
		numVerificado2 = numVerificado;	
		if(document.forms.nie.elements[0].value === "X"){
			observaciones = "NIE asignado antes del mes de julio de 2008.";
		}else{
			observaciones = "NIE asignado después del mes de julio de 2008.";
		}
		definiciones = 'El número de identidad de extranjero, más conocido por sus siglas NIE es, en España, un código que sirve para la identificación de los no nacionales.\nEstá compuesto por una letra inicial, siete dígitos y un carácter de verificación alfabético. La letra inicial es una "X" para los asignados antes de julio de 2008 y una "Y" para los asignados a partir de dicha fecha. Una vez agotada la serie numérica de la "Y" la norma prevé que se utilice la "Z".\nEl NIF (Número de Identificación Fiscal) para los extranjeros con NIE coincide con este último.';
	break;
	case 'naf' :
		titularVentana = "CDOCS : NAF (PDF)";
		titular = "NÚMERO DE AFILIACIÓN A LA SEGURIDAD SOCIAL";
		datos = document.forms.naf.elements["oculto-naf"].value;
		abreviatura = "NAF :";
		numVerificado = document.forms.naf.elements[0].value.substr(0,2) + " " + document.forms.naf.elements[0].value.substr(2,document.forms.naf.elements[0].value.length -4) + " " + document.forms.naf.elements[0].value.substr(document.forms.naf.elements[0].value.length -2, document.forms.naf.elements[0].value.length);
		entidad = "Provincia de afiliación: " + datos;
		definiciones = "El Número de afiliación (acto administrativo mediante el cual la Tesorería General de la Seguridad Social reconoce la condición de incluida en el Sistema a la persona física que por primera vez realiza una actividad) a la Seguridad Social identifica al ciudadano en sus relaciones con la Seguridad Social.\nEstá formado por doce números, los dos primeros coinciden con el código de la provincia de afiliación y los dos últimos son dígitos de control.";
	break;
	case 'cccss' :
		titularVentana = "CDOCS : CCCss (PDF)";
		titular = "CÓDIGO DE CUENTA DE COTIZACIÓN";
		datos = document.forms.cccss.elements["oculto-cccss"].value;
		abreviatura = "CCC :";
		numVerificado = document.forms.cccss.elements[0].value.substr(0,2) + " " + document.forms.cccss.elements[0].value.substr(2,document.forms.cccss.elements[0].value.length -4) + " " + document.forms.cccss.elements[0].value.substr(document.forms.cccss.elements[0].value.length -2, document.forms.cccss.elements[0].value.length);
		entidad = "Provincia de actividad: " + datos;
		definiciones =  "La inscripción es el acto administrativo por el que la Tesorería General de la Seguridad Social asigna al empresario un número para su identificación y control de sus obligaciones en el respectivo Régimen del Sistema de la Seguridad Social. Dicho número es considerado como primero y principal Código de Cuenta de Cotización.\nEl empresario debe solicitar un Código de Cuenta de Cotización en cada una de las provincias donde ejerza actividad.\nEstá formado por once números donde los dos primeros indican la provincia de inscripción y los dos últimos los dígitos de control.";	break;
	}
	titularPropiedades = (formulario === 'cccss') ? "CCC (SS)" : formulario.toUpperCase();
	try{

		var documentoPDF = new jsPDF("landscape", "pt", "a5");
		//Estructura de documentoPDF,una sóla página con orientación "LANDSCAPE" (apaisado).
		//Cabecera: Imagen y título:
		documentoPDF.addImage(imagenLogo, 'JPEG', 10, 10, 60, 60);
		documentoPDF.setFillColor(208,208,208);
		documentoPDF.rect(70, 30, 500, 26, "F");
		documentoPDF.setFont("helvetica");
		documentoPDF.setFontType("bold");
		documentoPDF.setFontSize(16);
		documentoPDF.text(74, 50, titular);
		//Cuerpo del documento con contenido variable:
		documentoPDF.setFontSize(14);
		documentoPDF.text(74, 90, abreviatura);
		documentoPDF.setFontSize(16);
		documentoPDF.text(130, 90, numVerificado);
		documentoPDF.setFontSize(14);
		documentoPDF.text(74, 110, abreviatura2);
		documentoPDF.setFontSize(16);
		documentoPDF.text(130, 110, numVerificado2);
		var fraseEntidad = documentoPDF.setFont('helvetica','bold').setFontSize(12).splitTextToSize(entidad, 490);
   		documentoPDF.text(74, 140, fraseEntidad);
		var fraseObservaciones = documentoPDF.setFont('helvetica','bolditalic').setFontSize(10).splitTextToSize(observaciones, 490);
		documentoPDF.text(74, 200, fraseObservaciones);
		var fraseDefiniciones = documentoPDF.setFont('helvetica','normal').setFontSize(10).splitTextToSize(definiciones, 490);
		documentoPDF.text(74, 250, fraseDefiniciones);
		//Pie del documento:
		documentoPDF.setDrawColor(208,208,208);
		documentoPDF.setLineWidth(2);
		documentoPDF.line(74, 338, 566, 338);
		documentoPDF.setLineWidth(0);
		documentoPDF.setDrawColor(255,255,255);
		documentoPDF.setFontSize(8);
		documentoPDF.setTextColor(128, 128, 128);
		documentoPDF.text(74, 350, documentoPrograma + " - " + documentoFecha);
		documentoPDF.text(74, 360, titular);
		documentoPDF.addImage(imagenCopyLeft, 'JPEG', 74, 364, 6, 6);
		documentoPDF.text(82, 370, "2004 - " + fechaPDF.aaaa + " " + documentoAutor);
		documentoPDF.setTextColor(0,0,153);
		documentoPDF.text(74, 379, documentoWeb);
		//Información en el documento:
		documentoPDF.setProperties({
        title: titularPropiedades,
        subject: documentoAsunto,
        author: documentoAutor,
        keywords: documentoWeb,
        creator: documentoPrograma
		});
		//Salida:
		recursoPDFcadena = btoa(documentoPDF.output('datauristring')); 
			
	}catch(errorCapturado){
		errorPDF = true;
		errorPDFmensaje = errorCapturado;
	}finally{
		
		if(errorPDF){
			
			notificar("ERROR DE ESCRITURA PDF", "Archivo — " + nombrePDF);			
			
		}else{
			abrirNuevaVentana("./html/pages/contenedor_pdf.html?" + recursoPDFcadena, titularVentana);			
		}		
		borrarAlertaVoluntario(formulario);
		document.getElementById("alerta-" + formulario).innerHTML = plantillaAlertaInfoPDF;	
		cambiarEstadoBotones("acierto");
		elementoMnuCaptura.activar();		
	}
}
