## CDOCS NW
----
![CDOCS](https://github.com/fooghub/Cdocs-NW/blob/master/cdocs-nw-proyect/images/png/logo48_1.png)

**CDOCS** (Comprueba Documentos) es una aplicación experimental, divulgativa, de escritorio, gratuita y de Código Abierto. Para **Windows**, **Linux** y **Mac OS X**; con el motor de ejecución  **NW.js** (antes conocido como **node-webkit**).

Mediante el cálculo del dígito o dígitos de control, pretende comprobar la consistencia o veracidad de los números de algunos documentos de identificación personal, fiscal y laboral, de la Administración española. También la de algunos códigos de identificación financiera, en el ámbito internacional.

>Los resultados ofrecidos por la aplicación son sólo orientativos, deben considerarse de forma prudente. La Administración o las entidades pueden modificar la estructura o los algoritmos de comprobación de sus códigos de identificación.

---

### Herramientas.

Para el desarrollo de aplicaciones con tecnologías Web y **NW.js** es necesario disponer de:

* [**NW.js**](https://nwjs.io/ "NW.js") — Permite llamar a todos los módulos **Node.js** directamente desde el **DOM**. Conviene trabajar con versiones estables (0.13 o superior) y con el _sabor_ **SDK** durante la programación, para disponer de la ventana "inspector" de **Chromium** (útil para el control de errores y auditoría de rendimiento) y distribuir con el _sabor_ **NORMAL**, más ligero. 

* [**Node.js**®](https://nodejs.org/es/ "Node.js®") — Un entorno de ejecución para JavaScript construido con el motor de **JavaScript V8 de Chrome**. Node.js usa un modelo de operaciones E/S sin bloqueo y orientado a eventos. El ecosistema de paquetes de Node.js, **npm**, es el más grande en librerías de código abierto del mundo. 

----

### Programación.

**CDOCS** está programada con lenguajes estándar del desarrollo Web: **HTML5**, **CSS3**, **JAVASCRIPT** de propósito general y específico para la **API's** de **NW.js** (**versión 0.13 ó superior**), **Node.js** y **Chrome/Chromium**. También **Markdown** y **JSON** (archivo "manifiesto").  

**JAVASCRIPT**:

_Código de terceros ..._

El directorio **&#47;node_modules** contiene dependencias opcionales que incrementan la funcionalidad o facilitan el uso de los módulos nativos de **Node.js**. Los principales son:

* [**marked**](https://www.npmjs.com/package/marked "marked") — Un veloz analizador y compilador de **Markdown**. Utilizado para traducir código **MD** a **HTML** o viceversa.

* [**unzip**](https://www.npmjs.com/package/unzip "unzip") — Descomprime archivos comprimidos con formato **.zip** en plataformas **Windows**, **Mac OS X** y distribuciones **Linux**.

* [**fs-extra**](https://www.npmjs.com/package/fs-extra "fs-extra") — Añade métodos para facilitar el uso del sistema de archivos que no se incluyen en el módulo **fs** nativo. Es un módulo popular, de hecho puede reemplazar completamente a su ascendente, **fs**.

* [**walk-sync**](https://www.npmjs.com/package/walk-sync "walk-sync") — De forma asíncrona y recursiva obtiene una matriz con todos los elementos (propiedades) contenidos en un directorio determinado.

En el directorio **&#47;js** encontramos, entre otros:

* Los archivos esenciales de la librería [**jsPDF**](https://github.com/MrRio/jsPDF "jsPDF") — Genera documentos **PDF** : **jspdf.js**, **addimage.js**, **split_text_to_size.js** y **standard_fonts_metrics.js**. El primero de los archivos contiene el código principal de la librería, el segundo (_plugin_ opcional) permite la inclusión de imágenes estáticas **.jpg** codificadas en _formato_ **base64**; el tercero y el cuarto (_plugins_ opcionales) facilitan el escalado del documento y la representación de símbolos de longitud variable **UTF-8**, necesarios para la correcta escritura de caracteres en español. 

* El guión [**iban.js**](https://github.com/arhs/iban.js "iban.js") — Código listo para verificar la exactitud del número **IBAN** de una cuenta bancaria de cualquier país adherido a este sistema.

----

### Características.

* **nw** — Este es un objeto global (no necesita de la función, _require_). Contiene toda la interfaz de programación de aplicaciones (**API**) de **NW.js**. El objeto **nw** es el legado o heredero del módulo _nw-gui_ utilizado en las versiones 0.12 y posteriores de **NW.js** que necesitaba de la función _require_ para cargar en la aplicación la _interfaz gráfica del usuario_ (`var nw = require("nw-gui")`).   

* **App** — La aplicación utiliza algunos métodos de este objeto para: Leer las etiquetas del **manifiesto**, registrar "**atajos de teclado**", borrar el almacenamiento caché	del navegador integrado y salir de la aplicación.	

* **Menu** y **MenuItem** — La aplicación dispone de un menú nativo emergente en la ventana principal para todas las plataformas.

* **Shell** — La aplicación usa algunos métodos de este objeto para abrir un archivo, un directorio (en estos casos hay que señalar la **ruta absoluta** al elemento tratado) local, o una página Web remota en el navegador del equipo, designado por defecto.

* **Shortcut** — (Atajos de teclado). Pulsando la combinación de teclas **Ctr+P** se abrirá, cuando la función este disponible, una ventana secundaria para visualizar el contenido **PDF** relacionado con el cálculo de verificación realizado. 	

* **Tray** — En **Windows** , muestra un icono en la bandeja del sistema con un menú contextual con un primer ítem que restaura, en su caso, el estado de la ventana principal y otro que sirve para cerrar la aplicación.

* **Window** — Además de la ventana principal, la aplicación puede abrir ventanas secundarias.

	* `nw.Window.get().capturePage(callback [, config ])` — (**Capturas de pantalla**). Desde el menú nativo de la aplicación, en algunas situaciones, se puede generar una imagen de la ventana principal y su contenido. Estas imágenes se guardan en la carpeta, **cdocs-screenshots** que reside en el directorio de entorno del usuario. 

	* `nw.Window.get().showDevTools()` — (**Herramienta de desarrollo/Depuración**). La **ventana inspector** (DevTools) sólo es funcional en las versiones **NW.js** con _sabor_ **SDK**. Además de con el método anterior (en programación), también puedes abrir esta ventana mediante el "atajo de teclado" [**F12**], en **Windows** o **Linux**. Y en **Mac OS X**, con la combinación de teclas: [**&#8984;**+**&#8997;**+**i**].	

* **Notificaciones** (enriquecidas) — Notificaciones en la bandeja del sistema del usuario.
	
* **&lt;webview&gt;** — Esta etiqueta permite la carga en directo a través de la red de contenido externo en una ventana de la aplicación.

* **localStorage** — (Almacenamiento local). Para guardar el valor de algunas variables de manera persistente.	
	
* **WebSQL** — La aplicación maneja una **base datos** en la que almacena información sobre las [entidades financieras con establecimiento en España](http://www.bde.es/bde/es/secciones/servicios/Particulares_y_e/Registros_de_Ent/ "Banco de España").

* **Sistema de archivos** — La aplicación utiliza los métodos (síncoronos y asíncronos) del módulo **fs-extra** (que incluye el nativo **fs**) para manejar archivos en el área local. El módulo **walk-sync** permite además obtener una matriz con los elementos contenidos en un directorio.

* **Sistema operativo** -  El módulo **os** proporciona una serie de métodos de utilidad relacionados con el sistema operativo. Se puede acceder a él mediante la llamada: `require("os")`. 

* **dns** — Con este módulo `require("dns")` y su método `dns.lookup()` comprobamos si el equipo está conectado a Internet. En realidad examinamos sólo la disponibilidad de un determinado dominio Web. 

* **http** — La interfaz HTTP están diseñada para admitir muchas características de este protocolo de red. 

* **https** — El protocolo HTTP sobre TLS / SSL. En Node.js se implementa como un módulo independiente. `require("https")`, utilizado en la aplicación, con el método `https.get()` para la transferencia de descarga de un archivo residente en un servidor remoto (actualizaciones).

* **process** — Este es un objeto **global** (no necesita de la llamada de carga `require()`). Proporciona información y control sobre el proceso **Node.js** actual. La aplicación recoge algunos métodos de este objeto. 

* **child_process** (proceso hijo) — `require("child_process").exec` y `require("child_process").spawn`. El módulo **child_process** proporciona la capacidad de generar procesos secundarios de naturaleza asíncrona, sin bloqueos.  El método **exec** se utiliza aquí para ejecutar los comandos: `cat /etc/issue` para obtener el nombre de la **distribución Linux** del usuario, `uname -m`, para obtener la arquitectura del sistema operativo (en **Linux** y **Mac OS X**) y `wmic OS get OSArchitecture`, con idéntico propósito en **Windows**. El método **spawn** consigue la realización de un guión ejecutable (**batch** en Windows o **bash** en Linux y Mac OS X) en la **línea de comandos**.

* **Actualizaciones. Pruebas, empaquetado y distribución, etc.** — (Ver **DOCUMENTACIÓN<sup>1</sup>**). 

----

### CDOCS en GitHub. Contenido.

**cdocs-nw-proyect** (**paquete principal**) — Todos los archivos del proyecto (código fuente). 

**cdocs-nw-tools** — Las imágenes (logo de la aplicación) en formatos **.ico**, **.png** y **.icns** para el uso en las plataformas, **Windows**, **Linux** y **Mac OSX**, respectivamente. También el archivo **CDOCS.desktop** (lanzador para **Linux**) y el directorio, **cdocs-nw-updater** con los recursos necesarios para el funcionamiento del sistema de actualizaciones.

> **<sup>1</sup>&#160;Para más detalles sobre descripción, propósito, características y programación de CDOCS NW leer: [DOCUMENTACIÓN](https://github.com/fooghub/Cdocs-NW/blob/master/cdocs-nw-proyect/md/documentation.md "documentation.md")**. Gracias.

----

Foog.Software — Julio 2017 — [**www.foog.es**](https://www.foog.es/ "www.foog.es")		
