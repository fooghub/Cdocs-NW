/** @preserve
* Cdocs-nw // cdocs_nw_auxiliar.js - Javascript. // Archivo 'auxiliar' para cdocs_nw_principal.js
* Versión 0.1.0
* Fecha de edición/revisión: 24/09/2016
* Copyright (c) 2004 - 2016 Foog.Software
* MIT License (MIT).
*********************************************************/
/********************************************************
* Funciones globales JAVASCRIPT de propósito general:
*********************************************************/
/* jshint undef: true, unused: false, eqeqeq: true, browser: false, node: false */

/**
* Función - capitalizarPrimeraLetra - Escribe en mayúscula la primera letra de una cadena. 
**/

String.prototype.capitalizarPrimeraLetra = function(){
	
	return this.charAt(0).toUpperCase() + this.slice(1);
};

/**
* Función - buscarTipoNIF - Listado del tipo de entidades, para el NIF. 
**/
function buscarTipoNIF(letra){
	
	var tipoNIF = [], resultado = "";
	tipoNIF.A = "Sociedades anónimas.";
	tipoNIF.B = "Sociedades de responsabilidad limitada.";
	tipoNIF.C = "Sociedades colectivas.";
	tipoNIF.D = "Sociedades comanditarias.";
	tipoNIF.E = "Comunidades de bienes y herencias yacentes.";
	tipoNIF.F = "Sociedades cooperativas.";
	tipoNIF.G = "Asociaciones y otros tipos de sociedades civiles.";
	tipoNIF.H = "Comunidades de propietarios en régimen de propiedad horizontal.";
	/* La asignación siguiente: tipoNIF.I, es ficticia (DNI). */ 
	tipoNIF.I = "El NIF para los nacionales con DNI carece de letra inicial y coincide con este último documento.";
	/* -- */
	tipoNIF.J = "Sociedades civiles; con o sin personalidad jurídica.";
	tipoNIF.K = "NIF para españoles menores de 14 años que carezcan de DNI o extranjeros menores de 18 años que carezcan de NIE.";
	tipoNIF.L = "NIF para españoles mayores de 14 años residentes en el extranjero y que no tengan DNI.";
	tipoNIF.M = "NIF para extranjeros que sean miembros de embajadas u otros organismos internacionales acreditados en España.";
	tipoNIF.N = "Entidades extranjeras; no residentes en España.";
	tipoNIF.P = "Corporaciónes locales.";
	tipoNIF.Q = "Organismos autónomos; estatales o no; y asimilados; y congregaciones e instituciones religiosas.";
	tipoNIF.R = "Congregaciones e instituciones religiosas.";
	tipoNIF.S = "Organos de la Administración del Estado y comunidades autónomas.";
	tipoNIF.U = "Uniones temporales de empresas.";
	tipoNIF.V = "Fondos de inversiones y otros tipos no definidos en el resto de claves.";
	tipoNIF.X = "NIF para extranjeros residentes; con NIE asignado antes del 16 de julio de 2008.";
	tipoNIF.Y = "NIF para extranjeros residentes; con NIE asignado después del 16 de julio de 2008.";
	tipoNIF.Z = "NIF para extranjeros residentes; con NIE asignado después del 16 de julio de 2008.";
	tipoNIF.W = "Reservado a establecimientos permanentes de entidades no residentes en territorio español.";
	resultado = tipoNIF[letra.toUpperCase()] || "DESCONOCIDO";
	return resultado;
}

/**
* Función - obtenerPaises - Listado de paises del mundo.
* Argumentos de entrada: código ISO2 del país a buscar y del idioma del resultado (español, inglés o francés).
**/
function obtenerPaises(codISO2paises, idioma){
	
	if(idioma){
		idioma = idioma.toLowerCase();
	}else{
		idioma = "es";
	}
	var resultado, elemento;
	switch(idioma){
		case "es" :
		elemento = 0;
		resultado = "desconocido";
		break;
		case "en" :
		elemento = 1;
		resultado = "unknown";
		break;
		case "fr" :
		elemento = 2;
		resultado = "inconnu";
		break;
		default :
		elemento = 0;
		resultado = "desconocido";		
	}
	var paisesISO2 = {
		"AF":["Afganistán","Afghanistan","Afghanistan"],
		"AL":["Albania","Albania","Albanie"],
		"DE":["Alemania","Germany","Allemagne"],
		"DZ":["Algeria","Algeria","Algérie"],
		"AD":["Andorra","Andorra","Andorra"],
		"AO":["Angola","Angola","Angola"],
		"AI":["Anguila","Anguilla","Anguilla"],
		"AQ":["Antártida","Antarctica","L'Antarctique"],
		"AG":["Antigua y Barbuda","Antigua and Barbuda","Antigua et Barbuda"],
		"AN":["Antillas Neerlandesas","Netherlands Antilles","Antilles Néerlandaises"],
		"SA":["Arabia Saudita","Saudi Arabia","Arabie Saoudite"],
		"AR":["Argentina","Argentina","Argentine"],
		"AM":["Armenia","Armenia","L'Arménie"],
		"AW":["Aruba","Aruba","Aruba"],
		"AU":["Australia","Australia","Australie"],
		"AT":["Austria","Austria","Autriche"],
		"AZ":["Azerbayán","Azerbaijan","L'Azerbaïdjan"],
		"BE":["Bélgica","Belgium","Belgique"],
		"BS":["Bahamas","Bahamas","Bahamas"],
		"BH":["Bahrein","Bahrain","Bahreïn"],
		"BD":["Bangladesh","Bangladesh","Bangladesh"],
		"BB":["Barbados","Barbados","Barbade"],
		"BZ":["Belice","Belize","Belize"],
		"BJ":["Benín","Benin","Bénin"],
		"BT":["Bhután","Bhutan","Le Bhoutan"],
		"BY":["Bielorrusia","Belarus","Biélorussie"],
		"MM":["Birmania","Myanmar","Myanmar"],
		"BO":["Bolivia","Bolivia","Bolivie"],
		"BA":["Bosnia y Herzegovina","Bosnia and Herzegovina","Bosnie-Herzégovine"],
		"BW":["Botsuana","Botswana","Botswana"],
		"BR":["Brasil","Brazil","Brésil"],
		"BN":["Brunéi","Brunei","Brunei"],
		"BG":["Bulgaria","Bulgaria","Bulgarie"],
		"BF":["Burkina Faso","Burkina Faso","Burkina Faso"],
		"BI":["Burundi","Burundi","Burundi"],
		"CV":["Cabo Verde","Cape Verde","Cap-Vert"],
		"KH":["Camboya","Cambodia","Cambodge"],
		"CM":["Camerún","Cameroon","Cameroun"],
		"CA":["Canadá","Canada","Canada"],
		"TD":["Chad","Chad","Tchad"],
		"CL":["Chile","Chile","Chili"],
		"CN":["China","China","Chine"],
		"CY":["Chipre","Cyprus","Chypre"],
		"VA":["Ciudad del Vaticano","Vatican City State","Cité du Vatican"],
		"CO":["Colombia","Colombia","Colombie"],
		"KM":["Comoras","Comoros","Comores"],
		"CG":["Congo","Congo","Congo"],
		"CD":["Congo","Congo","Congo"],
		"KP":["Corea del Norte","North Korea","Corée du Nord"],
		"KR":["Corea del Sur","South Korea","Corée du Sud"],
		"CI":["Costa de Marfil","Ivory Coast","Côte-d'Ivoire"],
		"CR":["Costa Rica","Costa Rica","Costa Rica"],
		"HR":["Croacia","Croatia","Croatie"],
		"CU":["Cuba","Cuba","Cuba"],
		"DK":["Dinamarca","Denmark","Danemark"],
		"DM":["Dominica","Dominica","Dominique"],
		"EC":["Ecuador","Ecuador","Equateur"],
		"EG":["Egipto","Egypt","Egypte"],
		"SV":["El Salvador","El Salvador","El Salvador"],
		"AE":["Emiratos Árabes Unidos","United Arab Emirates","Emirats Arabes Unis"],
		"ER":["Eritrea","Eritrea","Erythrée"],
		"SK":["Eslovaquia","Slovakia","Slovaquie"],
		"SI":["Eslovenia","Slovenia","Slovénie"],
		"ES":["España","Spain","Espagne"],
		"US":["Estados Unidos de América","United States of America","États-Unis d'Amérique"],
		"EE":["Estonia","Estonia","L'Estonie"],
		"ET":["Etiopía","Ethiopia","Ethiopie"],
		"PH":["Filipinas","Philippines","Philippines"],
		"FI":["Finlandia","Finland","Finlande"],
		"FJ":["Fiyi","Fiji","Fidji"],
		"FR":["Francia","France","France"],
		"GA":["Gabón","Gabon","Gabon"],
		"GM":["Gambia","Gambia","Gambie"],
		"GE":["Georgia","Georgia","Géorgie"],
		"GH":["Ghana","Ghana","Ghana"],
		"GI":["Gibraltar","Gibraltar","Gibraltar"],
		"GD":["Granada","Grenada","Grenade"],
		"GR":["Grecia","Greece","Grèce"],
		"GL":["Groenlandia","Greenland","Groenland"],
		"GP":["Guadalupe","Guadeloupe","Guadeloupe"],
		"GU":["Guam","Guam","Guam"],
		"GT":["Guatemala","Guatemala","Guatemala"],
		"GF":["Guayana Francesa","French Guiana","Guyane française"],
		"GG":["Guernsey","Guernsey","Guernesey"],
		"GN":["Guinea","Guinea","Guinée"],
		"GQ":["Guinea Ecuatorial","Equatorial Guinea","Guinée Equatoriale"],
		"GW":["Guinea-Bissau","Guinea-Bissau","Guinée-Bissau"],
		"GY":["Guyana","Guyana","Guyane"],
		"HT":["Haití","Haiti","Haïti"],
		"HN":["Honduras","Honduras","Honduras"],
		"HK":["Hong kong","Hong Kong","Hong Kong"],
		"HU":["Hungría","Hungary","Hongrie"],
		"IN":["India","India","Inde"],
		"ID":["Indonesia","Indonesia","Indonésie"],
		"IR":["Irán","Iran","Iran"],
		"IQ":["Irak","Iraq","Irak"],
		"IE":["Irlanda","Ireland","Irlande"],
		"BV":["Isla Bouvet","Bouvet Island","Bouvet Island"],
		"IM":["Isla de Man","Isle of Man","Ile de Man"],
		"CX":["Isla de Navidad","Christmas Island","Christmas Island"],
		"NF":["Isla Norfolk","Norfolk Island","Île de Norfolk"],
		"IS":["Islandia","Iceland","Islande"],
		"BM":["Islas Bermudas","Bermuda Islands","Bermudes"],
		"KY":["Islas Caimán","Cayman Islands","Iles Caïmans"],
		"CC":["Islas Cocos (Keeling)","Cocos (Keeling) Islands","Cocos (Keeling"],
		"CK":["Islas Cook","Cook Islands","Iles Cook"],
		"AX":["Islas de Åland","Åland Islands","Îles Åland"],
		"FO":["Islas Feroe","Faroe Islands","Iles Féro"],
		"GS":["Islas Georgias del Sur y Sandwich del Sur","South Georgia and the South Sandwich Islands","Géorgie du Sud et les Îles Sandwich du Sud"],
		"HM":["Islas Heard y McDonald","Heard Island and McDonald Islands","Les îles Heard et McDonald"],
		"MV":["Islas Maldivas","Maldives","Maldives"],
		"FK":["Islas Malvinas","Falkland Islands (Malvinas)","Iles Falkland (Malvinas"],
		"MP":["Islas Marianas del Norte","Northern Mariana Islands","Iles Mariannes du Nord"],
		"MH":["Islas Marshall","Marshall Islands","Iles Marshall"],
		"PN":["Islas Pitcairn","Pitcairn Islands","Iles Pitcairn"],
		"SB":["Islas Salomón","Solomon Islands","Iles Salomon"],
		"TC":["Islas Turcas y Caicos","Turks and Caicos Islands","Iles Turques et Caïques"],
		"UM":["Islas Ultramarinas Menores de Estados Unidos","United States Minor Outlying Islands","États-Unis Îles mineures éloignées"],
		"VG":["Islas Vírgenes Británicas","Virgin Islands","Iles Vierges"],
		"VI":["Islas Vírgenes de los Estados Unidos","United States Virgin Islands","Îles Vierges américaines"],
		"IL":["Israel","Israel","Israël"],
		"IT":["Italia","Italy","Italie"],
		"JM":["Jamaica","Jamaica","Jamaïque"],
		"JP":["Japón","Japan","Japon"],
		"JE":["Jersey","Jersey","Maillot"],
		"JO":["Jordania","Jordan","Jordan"],
		"KZ":["Kazajistán","Kazakhstan","Le Kazakhstan"],
		"KE":["Kenia","Kenya","Kenya"],
		"KG":["Kirgizstán","Kyrgyzstan","Kirghizstan"],
		"KI":["Kiribati","Kiribati","Kiribati"],
		"KW":["Kuwait","Kuwait","Koweït"],
		"LB":["Líbano","Lebanon","Liban"],
		"LA":["Laos","Laos","Laos"],
		"LS":["Lesoto","Lesotho","Lesotho"],
		"LV":["Letonia","Latvia","La Lettonie"],
		"LR":["Liberia","Liberia","Liberia"],
		"LY":["Libia","Libya","Libye"],
		"LI":["Liechtenstein","Liechtenstein","Liechtenstein"],
		"LT":["Lituania","Lithuania","La Lituanie"],
		"LU":["Luxemburgo","Luxembourg","Luxembourg"],
		"MX":["México","Mexico","Mexique"],
		"MC":["Mónaco","Monaco","Monaco"],
		"MO":["Macao","Macao","Macao"],
		"MK":["Macedônia","Macedonia","Macédoine"],
		"MG":["Madagascar","Madagascar","Madagascar"],
		"MY":["Malasia","Malaysia","Malaisie"],
		"MW":["Malawi","Malawi","Malawi"],
		"ML":["Mali","Mali","Mali"],
		"MT":["Malta","Malta","Malte"],
		"MA":["Marruecos","Morocco","Maroc"],
		"MQ":["Martinica","Martinique","Martinique"],
		"MU":["Mauricio","Mauritius","Iles Maurice"],
		"MR":["Mauritania","Mauritania","Mauritanie"],
		"YT":["Mayotte","Mayotte","Mayotte"],
		"FM":["Micronesia","Estados Federados de","Federados Estados de"],
		"MD":["Moldavia","Moldova","Moldavie"],
		"MN":["Mongolia","Mongolia","Mongolie"],
		"ME":["Montenegro","Montenegro","Monténégro"],
		"MS":["Montserrat","Montserrat","Montserrat"],
		"MZ":["Mozambique","Mozambique","Mozambique"],
		"NA":["Namibia","Namibia","Namibie"],
		"NR":["Nauru","Nauru","Nauru"],
		"NP":["Nepal","Nepal","Népal"],
		"NI":["Nicaragua","Nicaragua","Nicaragua"],
		"NE":["Niger","Niger","Niger"],
		"NG":["Nigeria","Nigeria","Nigeria"],
		"NU":["Niue","Niue","Niou"],
		"NO":["Noruega","Norway","Norvège"],
		"NC":["Nueva Caledonia","New Caledonia","Nouvelle-Calédonie"],
		"NZ":["Nueva Zelanda","New Zealand","Nouvelle-Zélande"],
		"OM":["Omán","Oman","Oman"],
		"NL":["Países Bajos","Netherlands","Pays-Bas"],
		"PK":["Pakistán","Pakistan","Pakistan"],
		"PW":["Palau","Palau","Palau"],
		"PS":["Palestina","Palestine","La Palestine"],
		"PA":["Panamá","Panama","Panama"],
		"PG":["Papúa Nueva Guinea","Papua New Guinea","Papouasie-Nouvelle-Guinée"],
		"PY":["Paraguay","Paraguay","Paraguay"],
		"PE":["Perú","Peru","Pérou"],
		"PF":["Polinesia Francesa","French Polynesia","Polynésie française"],
		"PL":["Polonia","Poland","Pologne"],
		"PT":["Portugal","Portugal","Portugal"],
		"PR":["Puerto Rico","Puerto Rico","Porto Rico"],
		"QA":["Qatar","Qatar","Qatar"],
		"GB":["Reino Unido","United Kingdom","Royaume-Uni"],
		"CF":["República Centroafricana","Central African Republic","République Centrafricaine"],
		"CZ":["República Checa","Czech Republic","République Tchèque"],
		"DO":["República Dominicana","Dominican Republic","République Dominicaine"],
		"RE":["Reunión","Réunion","Réunion"],
		"RW":["Ruanda","Rwanda","Rwanda"],
		"RO":["Rumanía","Romania","Roumanie"],
		"RU":["Rusia","Russia","La Russie"],
		"EH":["Sahara Occidental","Western Sahara","Sahara Occidental"],
		"WS":["Samoa","Samoa","Samoa"],
		"AS":["Samoa Americana","American Samoa","Les Samoa américaines"],
		"BL":["San Bartolomé","Saint Barthélemy","Saint-Barthélemy"],
		"KN":["San Cristóbal y Nieves","Saint Kitts and Nevis","Saint Kitts et Nevis"],
		"SM":["San Marino","San Marino","San Marino"],
		"MF":["San Martín (Francia)","Saint Martin (French part)","Saint-Martin (partie française)"],
		"PM":["San Pedro y Miquelón","Saint Pierre and Miquelon","Saint-Pierre-et-Miquelon"],
		"VC":["San Vicente y las Granadinas","Saint Vincent and the Grenadines","Saint-Vincent et Grenadines"],
		"SH":["Santa Elena","Ascensión y Tristán de Acuña","Ascensión y Tristan de Acuña"],
		"LC":["Santa Lucía","Saint Lucia","Sainte-Lucie"],
		"ST":["Santo Tomé y Príncipe","Sao Tome and Principe","Sao Tomé et Principe"],
		"SN":["Senegal","Senegal","Sénégal"],
		"RS":["Serbia","Serbia","Serbie"],
		"SC":["Seychelles","Seychelles","Les Seychelles"],
		"SL":["Sierra Leona","Sierra Leone","Sierra Leone"],
		"SG":["Singapur","Singapore","Singapour"],
		"SY":["Siria","Syria","Syrie"],
		"SO":["Somalia","Somalia","Somalie"],
		"LK":["Sri lanka","Sri Lanka","Sri Lanka"],
		"ZA":["Sudáfrica","South Africa","Afrique du Sud"],
		"SD":["Sudán","Sudan","Soudan"],
		"SE":["Suecia","Sweden","Suède"],
		"CH":["Suiza","Switzerland","Suisse"],
		"SR":["Surinám","Suriname","Surinam"],
		"SJ":["Svalbard y Jan Mayen","Svalbard and Jan Mayen","Svalbard et Jan Mayen"],
		"SZ":["Swazilandia","Swaziland","Swaziland"],
		"TJ":["Tadjikistán","Tajikistan","Le Tadjikistan"],
		"TH":["Tailandia","Thailand","Thaïlande"],
		"TW":["Taiwán","Taiwan","Taiwan"],
		"TZ":["Tanzania","Tanzania","Tanzanie"],
		"IO":["Territorio Británico del Océano Índico","British Indian Ocean Territory","Territoire britannique de l'océan Indien"],
		"TF":["Territorios Australes y Antárticas Franceses","French Southern Territories","Terres australes françaises"],
		"TL":["Timor Oriental","East Timor","Timor-Oriental"],
		"TG":["Togo","Togo","Togo"],
		"TK":["Tokelau","Tokelau","Tokélaou"],
		"TO":["Tonga","Tonga","Tonga"],
		"TT":["Trinidad y Tobago","Trinidad and Tobago","Trinidad et Tobago"],
		"TN":["Tunez","Tunisia","Tunisie"],
		"TM":["Turkmenistán","Turkmenistan","Le Turkménistan"],
		"TR":["Turquía","Turkey","Turquie"],
		"TV":["Tuvalu","Tuvalu","Tuvalu"],
		"UA":["Ucrania","Ukraine","L'Ukraine"],
		"UG":["Uganda","Uganda","Ouganda"],
		"UY":["Uruguay","Uruguay","Uruguay"],
		"UZ":["Uzbekistán","Uzbekistan","L'Ouzbékistan"],
		"VU":["Vanuatu","Vanuatu","Vanuatu"],
		"VE":["Venezuela","Venezuela","Venezuela"],
		"VN":["Vietnam","Vietnam","Vietnam"],
		"WF":["Wallis y Futuna","Wallis and Futuna","Wallis et Futuna"],
		"XK":["República de Kosovo","Republic of Kosovo","République du Kosovo"],
		"YE":["Yemen","Yemen","Yémen"],
		"DJ":["Yibuti","Djibouti","Djibouti"],
		"ZM":["Zambia","Zambia","Zambie"],
		"ZW":["Zimbabue","Zimbabwe","Zimbabwe"]		
	};
	
	if (paisesISO2.hasOwnProperty(codISO2paises)){resultado = paisesISO2[codISO2paises][elemento];}		
	return resultado;
}

/**
* Función - obtenerProvincia - Listado de las provincias españolas (para el NIF).
* Argumento de entrada: código de la provincia.
**/
function obtenerProvincia(codProvincia){
	
	codProvincia = (codProvincia.length === 1) ? "0" + codProvincia : codProvincia.toString();
	var provincias = {
		"01" : "Álava",
		"02" : "Albacete",
		"03" : "Alicante",
		"04" : "Almería",
		"05" : "Ávila",
		"06" : "Badajoz",
		"07" : "Islas Baleares",
		"08" : "Barcelona",
		"09" : "Burgos",
		"10" : "Cáceres",
		"11" : "Cádiz",
		"12" : "Castellón",
		"13" : "Ciudad Real",
		"14" : "Córdoba",
		"15" : "A Coruña",
		"16" : "Cuenca",
		"17" : "Girona",
		"18" : "Granada",
		"19" : "Guadalajara",
		"20" : "Guipúzcoa",
		"21" : "Huelva",
		"22" : "Huesca",
		"23" : "Jaén",
		"24" : "León",
		"25" : "Lleida",
		"26" : "La Rioja",
		"27" : "Lugo",
		"28" : "Madrid",
		"29" : "Málaga",
		"30" : "Murcia",
		"31" : "Navarra",
		"32" : "Orense",
		"33" : "Asturias",
		"34" : "Palencia",
		"35" : "Las Palmas",
		"36" : "Pontevedra",
		"37" : "Salamanca",
		"38" : "Santa Cruz de Tenerife",
		"39" : "Cantabria",
		"40" : "Segovia",
		"41" : "Sevilla",
		"42" : "Soria",
		"43" : "Tarragona",
		"44" : "Teruel",
		"45" : "Toledo",
		"46" : "Valencia",
		"47" : "Valladolid",
		"48" : "Vizcaya",
		"49" : "Zamora",
		"50" : "Zaragoza",
		"51" : "Ceuta",
		"52" : "Melilla",
		"53" : "Alicante",
		"54" : "Alicante",
		"55" : "Girona",
		"56" : "Córdoba",
		"57" : "Islas Baleares",
		"58" : "Barcelona",
		"59" : "Barcelona",
		"60" : "Barcelona",
		"61" : "Barcelona",
		"62" : "Barcelona",
		"63" : "Barcelona",
		"64" : "Barcelona",
		"70" : "A Coruña",
		"71" : "Guipúzcoa",
		"72" : "Cádiz",
		"73" : "Murcia",
		"74" : "Asturias",
		"75" : "Santa Cruz de Tenerife",
		"76" : "Las Palmas",
		"77" : "Tarragona",
		"78" : "Madrid",
		"79" : "Madrid",
		"80" : "Madrid",
		"81" : "Madrid",
		"82" : "Madrid",
		"83" : "Madrid",
		"84" : "Madrid",
		"85" : "Madrid",
		"91" : "Sevilla",
		"92" : "Málaga",
		"93" : "Málaga",
		"94" : "Pontevedra",
		"95" : "Vizcaya",
		"96" : "Valencia",
		"97" : "Valencia",
		"98" : "Valencia",
		"99" : "Zaragoza"
	};
	
	if (provincias.hasOwnProperty(codProvincia)) {
        return provincias[codProvincia];
    } else {
        return "DESCONOCIDA";
    }
	
}

/**
* Función - documentarErrorAJAX - Listado de errores de conexión.
**/
function documentarErrorAJAX(textoError){
	
	var numError = textoError.toString().eliminarEspaciosEnBlanco().substr(0,3);
	
	var errorAJAX={
	"400":"Bad Request",
	"401":"Unauthorized",
	"402": "Payment Required",
	"403":"Forbidden",
	"404":"Not Found",
	"405":"Method Not Allowed",
	"406":"Not Acceptable",
	"407":"Proxy Authentication Required",
	"408":"Request Timeout",
	"409":"Conflict",
	"410":"Gone",
	"411":"Length Required",
	"412":"Precondition Failed",
	"413":"Request Entity Too Large",
	"414":"Request-URI Too Long",
	"415":"Unsupported Media Type",
	"416":"Requested Range Not Suitable",
	"417":"Expectation Failed",
	"418": "I'm a teapot",
	"419": "I'm a fox",
	"420": "Enhance Your Calm",
	"422":"Unprocessable Entity",
	"423":"Locked",
	"424":"Falied Dependency",
	"425":"Unassigned",
	"426":"Upgrade Required",
	"428":"Precondition Required",
	"429":"Too Many Requests",
	"431":"Request Headers Fileds Too Large",
	"440":"Login Time-out",	
	"444":"No Response",
	"449":"The request should be retried after doing the appropriate action",
	"450": "Blocked by Windows Parental Controls (Microsoft)",
	"451":"Unavailable for Legal Reasons",
	"495":"SSL Certificate Error",
	"496":"SSL Certificate Required",
	"497":"HTTP Request Sent to HTTPS Port",
	"498":"Invalid Token",
	"499":"Client Closed Request",
	"500":"Internal Server Error",
	"501":"Not Implemented",
	"502":"Bad Gateway",
	"503":"Service Unavailable",
	"504":"Gateway Timeout",
	"505":"HTTP Version Not Supported",
	"506":"Variant Also Negotiates",
	"507":"Insufficient Storage",
	"508":"Loop Detected",
	"509":"Bandwidth Limit Exceeded",
	"510":"Not Extended",
	"511":"Network Authentication Required",
	"520": "Unknown Error",
	"530" : "Site is frozen",
	"521": "Web Server Is Down",
	"522":"Connection Timed Out",
	"523":"Origin Is Unreachable",
	"524" : "A Timeout Occurred",
	"525":"SSL Handshake Failed",
	"526":"Invalid SSL Certificate",
	"527":"Railgun Error",	
	"598" : "Network read timeout error",
	"599" : "Network connect timeout error",
	"601" : "Access token invalid",	
	};
	if (errorAJAX.hasOwnProperty(numError)) {
		return numError + " : " + errorAJAX[numError];
	} else {
		if(isNaN(numError) === false){
			if(numError === "0"){numError = "520";}
			return numError + " : Unknown Error";
		}else{
			if(textoError === ""){
				return "520 : Unknown Error";	
			}else{
				if(typeof textoError === "object" && textoError.message) {textoError = textoError.message;}
				if(typeof textoError === "string" && textoError.length > 72 ) {textoError = textoError.substr(0,68) + " ...";}
				return textoError;
			}
		}
	}
}

/**
* Función - documentarIdioma - Listado de idiomas en el mundo (en español).
* Argumento de entrada: código ISO639_1 del idioma (dos letras). //Fuente: Wikypedia.
**/
function documentarIdioma(idiomaISO639_1){
	
	idiomaISO639_1 = idiomaISO639_1.toLowerCase();
	var idiomas = {
	"aa" : "afar",
	"ab" : "abjasio (o abjasiano)",
	"ae" : "avéstico",
	"af" : "afrikáans",
	"ak" : "akano",
	"am" : "amhárico",
	"an" : "aragonés",
	"ar" : "árabe",
	"as" : "asamés",
	"av" : "avar (o ávaro)",
	"ay" : "aimara",
	"az" : "azerí",
	"ba" : "baskir",
	"be" : "bielorruso",
	"bg" : "búlgaro",
	"bh" : "bhoyapurí",
	"bi" : "bislama",
	"bm" : "bambara",
	"bn" : "bengalí",
	"bo" : "tibetano",
	"br" : "bretón",
	"bs" : "bosnio",
	"ca" : "catalán",
	"ce" : "checheno",
	"ch" : "chamorro",
	"co" : "corso",
	"cr" : "cree",
	"cs" : "checo",
	"cu" : "eslavo eclesiástico antiguo",
	"cv" : "chuvasio",
	"cy" : "galés",
	"da" : "danés",
	"de" : "alemán",
	"dv" : "maldivo (o dhivehi)",
	"dz" : "dzongkha",
	"ee" : "ewé",
	"el" : "griego (moderno)",
	"en" : "inglés",
	"eo" : "esperanto",
	"es" : "español",
	"et" : "estonio",
	"eu" : "euskera",
	"fa" : "persa",
	"ff" : "fula",
	"fi" : "finés (o finlandés)",
	"fj" : "fiyiano (o fiyi)",
	"fo" : "feroés",
	"fr" : "francés",
	"fy" : "frisón (o frisio)",
	"ga" : "irlandés (o gaélico)",
	"gd" : "gaélico escocés",
	"gl" : "gallego",
	"gn" : "guaraní",
	"gu" : "guyaratí (o guyaratí)",
	"gv" : "manés (gaélico manés o de Isla de Man)",
	"ha" : "hausa",
	"he" : "hebreo",
	"hi" : "hindi (o hindú)",
	"ho" : "hiri motu",
	"hr" : "croata",
	"ht" : "haitiano",
	"hu" : "húngaro",
	"hy" : "armenio",
	"hz" : "herero",
	"ia" : "interlingua",
	"id" : "indonesio",
	"ie" : "occidental",
	"ig" : "igbo",
	"ii" : "yi de Sichuán",
	"ik" : "iñupiaq",
	"io" : "ido",
	"is" : "islandés",
	"it" : "italiano",
	"iu" : "inuktitut (o inuit)",
	"ja" : "japonés",
	"jv" : "javanés",
	"ka" : "georgiano",
	"kg" : "kongo (o kikongo)",
	"ki" : "kikuyu",
	"kj" : "kuanyama",
	"kk" : "kazajo (o kazajio)",
	"kl" : "groenlandés (o kalaallisut)",
	"km" : "camboyano (o jemer)",
	"kn" : "canarés",
	"ko" : "coreano",
	"kr" : "kanuri",
	"ks" : "cachemiro (o cachemir)",
	"ku" : "kurdo",
	"kv" : "komi",
	"kw" : "córnico",
	"ky" : "kirguís",
	"la" : "latín",
	"lb" : "luxemburgués",
	"lg" : "luganda",
	"li" : "limburgués",
	"ln" : "lingala",
	"lo" : "lao",
	"lt" : "lituano",
	"lu" : "luba-katanga (o chiluba)",
	"lv" : "letón",
	"mg" : "malgache (o malagasy)",
	"mh" : "marshalés",
	"mi" : "maorí",
	"mk" : "macedonio",
	"ml" : "malayalam",
	"mn" : "mongol",
	"mr" : "maratí",
	"ms" : "malayo",
	"mt" : "maltés",
	"my" : "birmano",
	"na" : "nauruano",
	"nb" : "noruego bokmål",
	"nd" : "ndebele del norte",
	"ne" : "nepalí",
	"ng" : "ndonga",
	"nl" : "neerlandés (u holandés)",
	"nn" : "nynorsk",
	"no" : "noruego",
	"nr" : "ndebele del sur",
	"nv" : "navajo",
	"ny" : "chichewa",
	"oc" : "occitano",
	"oj" : "ojibwa",
	"om" : "oromo",
	"or" : "oriya",
	"os" : "osético (u osetio, u oseta)",
	"pa" : "panyabí (o penyabi)",
	"pi" : "pali",
	"pl" : "polaco",
	"ps" : "pastú (o pastún, o pashto)",
	"pt" : "portugués",
	"qu" : "quechua",
	"rm" : "romanche",
	"rn" : "kirundi",
	"ro" : "rumano",
	"ru" : "ruso",
	"rw" : "ruandés (o kiñaruanda)",
	"sa" : "sánscrito",
	"sc" : "sardo",
	"sd" : "sindhi",
	"se" : "sami septentrional",
	"sg" : "sango",
	"si" : "cingalés",
	"sk" : "eslovaco",
	"sl" : "esloveno",
	"sm" : "samoano",
	"sn" : "shona",
	"so" : "somalí",
	"sq" : "albanés",
	"sr" : "serbio",
	"ss" : "suazi (o swati, o siSwati)",
	"st" : "sesotho",
	"su" : "sundanés (o sondanés)",
	"sv" : "sueco",
	"sw" : "suajili",
	"ta" : "tamil",
	"te" : "télugu",
	"tg" : "tayiko",
	"th" : "tailandés",
	"ti" : "tigriña",
	"tk" : "turcomano",
	"tl" : "tagalo",
	"tn" : "setsuana",
	"to" : "tongano",
	"tr" : "turco",
	"ts" : "tsonga",
	"tt" : "tártaro",
	"tw" : "twi",
	"ty" : "tahitiano",
	"ug" : "uigur",
	"uk" : "ucraniano",
	"ur" : "urdu",
	"uz" : "uzbeko",
	"ve" : "venda",
	"vi" : "vietnamita",
	"vo" : "volapük",
	"wa" : "valón",
	"wo" : "wolof",
	"xh" : "xhosa",
	"yi" : "yídish (o yidis, o yiddish)",
	"yo" : "yoruba",
	"za" : "chuan (o chuang, o zhuang)",
	"zh" : "chino",
	"zu" : "zulú"
	};
	if (idiomas.hasOwnProperty(idiomaISO639_1)) {
		return idiomas[idiomaISO639_1];
	} else {
		return "undefined";
	}
}


function formatearBytes(bytes,decimales) {
	
   if(bytes === 0){return "0 Byte";}
   var k = 1000;
   var dm = decimales || 2;
   var unidades = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
   var i = Math.floor(Math.log(bytes) / Math.log(k));
   var r = parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + unidades[i]; 
   r = r.replace(/\./g, ","); 
   return r;
}
