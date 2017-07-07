/* jshint undef: true, unused: true, eqeqeq: true, browser: true, node: true, loopfunc: true */


/** @preserve
* Completo
*********************************************************/
/** @preserve
 * jsPDF - PDF Document creation from JavaScript
 * Version ${versionID}
 *                           CommitID ${commitID}
 *
 * Copyright (c) 2010-2014 James Hall <james@parall.ax>, https://github.com/MrRio/jsPDF
 *               2010 Aaron Spike, https://github.com/acspike
 *               2012 Willow Systems Corporation, willow-systems.com
 *               2012 Pablo Hess, https://github.com/pablohess
 *               2012 Florian Jenett, https://github.com/fjenett
 *               2013 Warren Weckesser, https://github.com/warrenweckesser
 *               2013 Youssef Beddad, https://github.com/lifof
 *               2013 Lee Driscoll, https://github.com/lsdriscoll
 *               2013 Stefan Slonevskiy, https://github.com/stefslon
 *               2013 Jeremy Morel, https://github.com/jmorel
 *               2013 Christoph Hartmann, https://github.com/chris-rock
 *               2014 Juan Pablo Gaviria, https://github.com/juanpgaviria
 *               2014 James Makes, https://github.com/dollaruw
 *               2014 Diego Casorran, https://github.com/diegocr
 *               2014 Steven Spungin, https://github.com/Flamenco
 *               2014 Kenneth Glassey, https://github.com/Gavvers
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 * Contributor(s):
 *    siefkenj, ahwolf, rickygu, Midnith, saintclair, eaparango,
 *    kim3er, mfo, alnorth, Flamenco
 */

/**
 * Creates new jsPDF document object instance.
 *
 * @class
 * @param orientation One of "portrait" or "landscape" (or shortcuts "p" (Default), "l")
 * @param unit        Measurement unit to be used when coordinates are specified.
 *                    One of "pt" (points), "mm" (Default), "cm", "in"
 * @param format      One of 'pageFormats' as shown below, default: a4
 * @returns {jsPDF}
 * @name jsPDF
 */
var jsPDF = (function (global) {
    'use strict';
    var pdfVersion = '1.3',
        pageFormats = { // Size in pt of various paper formats
            'a0': [2383.94, 3370.39], 'a1': [1683.78, 2383.94],
            'a2': [1190.55, 1683.78], 'a3': [841.89, 1190.55],
            'a4': [595.28, 841.89], 'a5': [419.53, 595.28],
            'a6': [297.64, 419.53], 'a7': [209.76, 297.64],
            'a8': [147.40, 209.76], 'a9': [104.88, 147.40],
            'a10': [73.70, 104.88], 'b0': [2834.65, 4008.19],
            'b1': [2004.09, 2834.65], 'b2': [1417.32, 2004.09],
            'b3': [1000.63, 1417.32], 'b4': [708.66, 1000.63],
            'b5': [498.90, 708.66], 'b6': [354.33, 498.90],
            'b7': [249.45, 354.33], 'b8': [175.75, 249.45],
            'b9': [124.72, 175.75], 'b10': [87.87, 124.72],
            'c0': [2599.37, 3676.54], 'c1': [1836.85, 2599.37],
            'c2': [1298.27, 1836.85], 'c3': [918.43, 1298.27],
            'c4': [649.13, 918.43], 'c5': [459.21, 649.13],
            'c6': [323.15, 459.21], 'c7': [229.61, 323.15],
            'c8': [161.57, 229.61], 'c9': [113.39, 161.57],
            'c10': [79.37, 113.39], 'dl': [311.81, 623.62],
            'letter': [612, 792],
            'government-letter': [576, 756],
            'legal': [612, 1008],
            'junior-legal': [576, 360],
            'ledger': [1224, 792],
            'tabloid': [792, 1224],
            'credit-card': [153, 243]
        };

    /**
     * jsPDF's Internal PubSub Implementation.
     * See mrrio.github.io/jsPDF/doc/symbols/PubSub.html
     * Backward compatible rewritten on 2014 by
     * Diego Casorran, https://github.com/diegocr
     *
     * @class
     * @name PubSub
     */
    function PubSub(context) {
        var topics = {};

        this.subscribe = function (topic, callback, once) {
            if (typeof callback !== 'function') {
                return false;
            }

            if (!topics.hasOwnProperty(topic)) {
                topics[topic] = {};
            }

            var id = Math.random().toString(35);
            topics[topic][id] = [callback, !!once];

            return id;
        };

        this.unsubscribe = function (token) {
            for (var topic in topics) {
                if (topics[topic][token]) {
                    delete topics[topic][token];
                    return true;
                }
            }
            return false;
        };

        this.publish = function (topic) {
            if (topics.hasOwnProperty(topic)) {
                var args = Array.prototype.slice.call(arguments, 1), idr = [];

                for (var id in topics[topic]) {
                    var sub = topics[topic][id];
                    try {
                        sub[0].apply(context, args);
                    } catch (ex) {
                        if (global.console) {
                            console.error('jsPDF PubSub Error', ex.message, ex);
                        }
                    }
                    if (sub[1]) idr.push(id);
                }
                if (idr.length) idr.forEach(this.unsubscribe);
            }
        };
    }

    /**
     * @constructor
     * @private
     */
    function jsPDF(orientation, unit, format, compressPdf) {
        var options = {};

        if (typeof orientation === 'object') {
            options = orientation;

            orientation = options.orientation;
            unit = options.unit || unit;
            format = options.format || format;
            compressPdf = options.compress || options.compressPdf || compressPdf;
        }

        // Default options
        unit = unit || 'mm';
        format = format || 'a4';
        orientation = ('' + (orientation || 'P')).toLowerCase();

        var format_as_string = ('' + format).toLowerCase(),
            compress = !!compressPdf && typeof Uint8Array === 'function',
            textColor = options.textColor || '0 g',
            drawColor = options.drawColor || '0 G',
            activeFontSize = options.fontSize || 16,
            lineHeightProportion = options.lineHeight || 1.15,
            lineWidth = options.lineWidth || 0.200025, // 2mm
            objectNumber = 2,  // 'n' Current object number
            outToPages = !1,  // switches where out() prints. outToPages true = push to pages obj. outToPages false = doc builder content
            offsets = [],  // List of offsets. Activated and reset by buildDocument(). Pupulated by various calls buildDocument makes.
            fonts = {},  // collection of font objects, where key is fontKey - a dynamically created label for a given font.
            fontmap = {},  // mapping structure fontName > fontStyle > font key - performance layer. See addFont()
            activeFontKey,      // will be string representing the KEY of the font as combination of fontName + fontStyle
            k,                  // Scale factor
            tmp,
            page = 0,
            currentPage,
            pages = [],
            pagesContext = [], // same index as pages and pagedim
            pagedim = [],
            content = [],
            additionalObjects = [],
            lineCapID = 0,
            lineJoinID = 0,
            content_length = 0,
            pageWidth,
            pageHeight,
            pageMode,
            zoomMode,
            layoutMode,
            documentProperties = {
                'title': '',
                'subject': '',
                'author': '',
                'keywords': '',
                'creator': ''
            },
            API = {},
            events = new PubSub(API),

        /////////////////////
        // Private functions
        /////////////////////
            f2 = function (number) {
                return number.toFixed(2); // Ie, %.2f
            },
            f3 = function (number) {
                return number.toFixed(3); // Ie, %.3f
            },
            padd2 = function (number) {
                return ('0' + parseInt(number)).slice(-2);
            },
            out = function (string) {
                if (outToPages) {
                    /* set by beginPage */
                    pages[currentPage].push(string);
                } else {
                    // +1 for '\n' that will be used to join 'content'
                    content_length += string.length + 1;
                    content.push(string);
                }
            },
            newObject = function () {
                // Begin a new object
                objectNumber++;
                offsets[objectNumber] = content_length;
                out(objectNumber + ' 0 obj');
                return objectNumber;
            },
        // Does not output the object until after the pages have been output.
        // Returns an object containing the objectId and content.
        // All pages have been added so the object ID can be estimated to start right after.
        // This does not modify the current objectNumber;  It must be updated after the newObjects are output.
            newAdditionalObject = function () {
                var objId = pages.length * 2 + 1;
                objId += additionalObjects.length;
                var obj = {objId: objId, content: ''};
                additionalObjects.push(obj);
                return obj;
            },
        // Does not output the object.  The caller must call newObjectDeferredBegin(oid) before outputing any data
            newObjectDeferred = function () {
                objectNumber++;
                offsets[objectNumber] = function () {
                    return content_length;
                };
                return objectNumber;
            },
            newObjectDeferredBegin = function (oid) {
                offsets[oid] = content_length;
            },
            putStream = function (str) {
                out('stream');
                out(str);
                out('endstream');
            },
            putPages = function () {
                var n, p, arr, i, deflater, adler32, adler32cs, wPt, hPt;

                adler32cs = global.adler32cs || jsPDF.adler32cs;
                if (compress && typeof adler32cs === 'undefined') {
                    compress = false;
                }

                // outToPages = false as set in endDocument(). out() writes to content.

                for (n = 1; n <= page; n++) {
                    newObject();
                    wPt = (pageWidth = pagedim[n].width) * k;
                    hPt = (pageHeight = pagedim[n].height) * k;
                    out('<</Type /Page');
                    out('/Parent 1 0 R');
                    out('/Resources 2 0 R');
                    out('/MediaBox [0 0 ' + f2(wPt) + ' ' + f2(hPt) + ']');
                    // Added for annotation plugin
                    events.publish('putPage', {pageNumber: n, page: pages[n]});
                    out('/Contents ' + (objectNumber + 1) + ' 0 R');
                    out('>>');
                    out('endobj');

                    // Page content
                    p = pages[n].join('\n');
                    newObject();
                    if (compress) {
                        arr = [];
                        i = p.length;
                        while (i--) {
                            arr[i] = p.charCodeAt(i);
                        }
                        adler32 = adler32cs.from(p);
                        deflater = new Deflater(6);
                        deflater.append(new Uint8Array(arr));
                        p = deflater.flush();
                        arr = new Uint8Array(p.length + 6);
                        arr.set(new Uint8Array([120, 156])),
                            arr.set(p, 2);
                        arr.set(new Uint8Array([adler32 & 0xFF, (adler32 >> 8) & 0xFF, (adler32 >> 16) & 0xFF, (adler32 >> 24) & 0xFF]), p.length + 2);
                        p = String.fromCharCode.apply(null, arr);
                        out('<</Length ' + p.length + ' /Filter [/FlateDecode]>>');
                    } else {
                        out('<</Length ' + p.length + '>>');
                    }
                    putStream(p);
                    out('endobj');
                }
                offsets[1] = content_length;
                out('1 0 obj');
                out('<</Type /Pages');
                var kids = '/Kids [';
                for (i = 0; i < page; i++) {
                    kids += (3 + 2 * i) + ' 0 R ';
                }
                out(kids + ']');
                out('/Count ' + page);
                out('>>');
                out('endobj');
                events.publish('postPutPages');
            },
            putFont = function (font) {
                font.objectNumber = newObject();
                out('<</BaseFont/' + font.PostScriptName + '/Type/Font');
                if (typeof font.encoding === 'string') {
                    out('/Encoding/' + font.encoding);
                }
                out('/Subtype/Type1>>');
                out('endobj');
            },
            putFonts = function () {
                for (var fontKey in fonts) {
                    if (fonts.hasOwnProperty(fontKey)) {
                        putFont(fonts[fontKey]);
                    }
                }
            },
            putXobjectDict = function () {
                // Loop through images, or other data objects
                events.publish('putXobjectDict');
            },
            putResourceDictionary = function () {
                out('/ProcSet [/PDF /Text /ImageB /ImageC /ImageI]');
                out('/Font <<');

                // Do this for each font, the '1' bit is the index of the font
                for (var fontKey in fonts) {
                    if (fonts.hasOwnProperty(fontKey)) {
                        out('/' + fontKey + ' ' + fonts[fontKey].objectNumber + ' 0 R');
                    }
                }
                out('>>');
                out('/XObject <<');
                putXobjectDict();
                out('>>');
            },
            putResources = function () {
                putFonts();
                events.publish('putResources');
                // Resource dictionary
                offsets[2] = content_length;
                out('2 0 obj');
                out('<<');
                putResourceDictionary();
                out('>>');
                out('endobj');
                events.publish('postPutResources');
            },
            putAdditionalObjects = function () {
                events.publish('putAdditionalObjects');
                for (var i = 0; i < additionalObjects.length; i++) {
                    var obj = additionalObjects[i];
                    offsets[obj.objId] = content_length;
                    out(obj.objId + ' 0 obj');
                    out(obj.content);
                    ;
                    out('endobj');
                }
                objectNumber += additionalObjects.length;
                events.publish('postPutAdditionalObjects');
            },
            addToFontDictionary = function (fontKey, fontName, fontStyle) {
                // this is mapping structure for quick font key lookup.
                // returns the KEY of the font (ex: "F1") for a given
                // pair of font name and type (ex: "Arial". "Italic")
                if (!fontmap.hasOwnProperty(fontName)) {
                    fontmap[fontName] = {};
                }
                fontmap[fontName][fontStyle] = fontKey;
            },
            /**
             * FontObject describes a particular font as member of an instnace of jsPDF
             *
             * It's a collection of properties like 'id' (to be used in PDF stream),
             * 'fontName' (font's family name), 'fontStyle' (font's style variant label)
             *
             * @class
             * @public
             * @property id {String} PDF-document-instance-specific label assinged to the font.
             * @property PostScriptName {String} PDF specification full name for the font
             * @property encoding {Object} Encoding_name-to-Font_metrics_object mapping.
             * @name FontObject
             */
            addFont = function (PostScriptName, fontName, fontStyle, encoding) {
                var fontKey = 'F' + (Object.keys(fonts).length + 1).toString(10),
                // This is FontObject
                    font = fonts[fontKey] = {
                        'id': fontKey,
                        'PostScriptName': PostScriptName,
                        'fontName': fontName,
                        'fontStyle': fontStyle,
                        'encoding': encoding,
                        'metadata': {}
                    };
                addToFontDictionary(fontKey, fontName, fontStyle);
                events.publish('addFont', font);

                return fontKey;
            },
            addFonts = function () {

                var HELVETICA = "helvetica",
                    TIMES = "times",
                    COURIER = "courier",
                    NORMAL = "normal",
                    BOLD = "bold",
                    ITALIC = "italic",
                    BOLD_ITALIC = "bolditalic",
                    encoding = 'StandardEncoding',
                    ZAPF = "zapfdingbats",
                    standardFonts = [
                        ['Helvetica', HELVETICA, NORMAL],
                        ['Helvetica-Bold', HELVETICA, BOLD],
                        ['Helvetica-Oblique', HELVETICA, ITALIC],
                        ['Helvetica-BoldOblique', HELVETICA, BOLD_ITALIC],
                        ['Courier', COURIER, NORMAL],
                        ['Courier-Bold', COURIER, BOLD],
                        ['Courier-Oblique', COURIER, ITALIC],
                        ['Courier-BoldOblique', COURIER, BOLD_ITALIC],
                        ['Times-Roman', TIMES, NORMAL],
                        ['Times-Bold', TIMES, BOLD],
                        ['Times-Italic', TIMES, ITALIC],
                        ['Times-BoldItalic', TIMES, BOLD_ITALIC],
                        ['ZapfDingbats',ZAPF ]
                    ];

                for (var i = 0, l = standardFonts.length; i < l; i++) {
                    var fontKey = addFont(
                        standardFonts[i][0],
                        standardFonts[i][1],
                        standardFonts[i][2],
                        encoding);

                    // adding aliases for standard fonts, this time matching the capitalization
                    var parts = standardFonts[i][0].split('-');
                    addToFontDictionary(fontKey, parts[0], parts[1] || '');
                }
                events.publish('addFonts', {fonts: fonts, dictionary: fontmap});
            },
            SAFE = function __safeCall(fn) {
                fn.foo = function __safeCallWrapper() {
                    try {
                        return fn.apply(this, arguments);
                    } catch (e) {
                        var stack = e.stack || '';
                        if (~stack.indexOf(' at ')) stack = stack.split(" at ")[1];
                        var m = "Error in function " + stack.split("\n")[0].split('<')[0] + ": " + e.message;
                        if (global.console) {
                            global.console.error(m, e);
                            if (global.alert) alert(m);
                        } else {
                            throw new Error(m);
                        }
                    }
                };
                fn.foo.bar = fn;
                return fn.foo;
            },
            to8bitStream = function (text, flags) {
                /**
                 * PDF 1.3 spec:
                 * "For text strings encoded in Unicode, the first two bytes must be 254 followed by
                 * 255, representing the Unicode byte order marker, U+FEFF. (This sequence conflicts
                 * with the PDFDocEncoding character sequence thorn ydieresis, which is unlikely
                 * to be a meaningful beginning of a word or phrase.) The remainder of the
                 * string consists of Unicode character codes, according to the UTF-16 encoding
                 * specified in the Unicode standard, version 2.0. Commonly used Unicode values
                 * are represented as 2 bytes per character, with the high-order byte appearing first
                 * in the string."
                 *
                 * In other words, if there are chars in a string with char code above 255, we
                 * recode the string to UCS2 BE - string doubles in length and BOM is prepended.
                 *
                 * HOWEVER!
                 * Actual *content* (body) text (as opposed to strings used in document properties etc)
                 * does NOT expect BOM. There, it is treated as a literal GID (Glyph ID)
                 *
                 * Because of Adobe's focus on "you subset your fonts!" you are not supposed to have
                 * a font that maps directly Unicode (UCS2 / UTF16BE) code to font GID, but you could
                 * fudge it with "Identity-H" encoding and custom CIDtoGID map that mimics Unicode
                 * code page. There, however, all characters in the stream are treated as GIDs,
                 * including BOM, which is the reason we need to skip BOM in content text (i.e. that
                 * that is tied to a font).
                 *
                 * To signal this "special" PDFEscape / to8bitStream handling mode,
                 * API.text() function sets (unless you overwrite it with manual values
                 * given to API.text(.., flags) )
                 * flags.autoencode = true
                 * flags.noBOM = true
                 *
                 * ===================================================================================
                 * `flags` properties relied upon:
                 *   .sourceEncoding = string with encoding label.
                 *                     "Unicode" by default. = encoding of the incoming text.
                 *                     pass some non-existing encoding name
                 *                     (ex: 'Do not touch my strings! I know what I am doing.')
                 *                     to make encoding code skip the encoding step.
                 *   .outputEncoding = Either valid PDF encoding name
                 *                     (must be supported by jsPDF font metrics, otherwise no encoding)
                 *                     or a JS object, where key = sourceCharCode, value = outputCharCode
                 *                     missing keys will be treated as: sourceCharCode === outputCharCode
                 *   .noBOM
                 *       See comment higher above for explanation for why this is important
                 *   .autoencode
                 *       See comment higher above for explanation for why this is important
                 */

                var i, l, sourceEncoding, encodingBlock, outputEncoding, newtext, isUnicode, ch, bch;

                flags = flags || {};
                sourceEncoding = flags.sourceEncoding || 'Unicode';
                outputEncoding = flags.outputEncoding;

                // This 'encoding' section relies on font metrics format
                // attached to font objects by, among others,
                // "Willow Systems' standard_font_metrics plugin"
                // see jspdf.plugin.standard_font_metrics.js for format
                // of the font.metadata.encoding Object.
                // It should be something like
                //   .encoding = {'codePages':['WinANSI....'], 'WinANSI...':{code:code, ...}}
                //   .widths = {0:width, code:width, ..., 'fof':divisor}
                //   .kerning = {code:{previous_char_code:shift, ..., 'fof':-divisor},...}
                if ((flags.autoencode || outputEncoding) &&
                    fonts[activeFontKey].metadata &&
                    fonts[activeFontKey].metadata[sourceEncoding] &&
                    fonts[activeFontKey].metadata[sourceEncoding].encoding) {
                    encodingBlock = fonts[activeFontKey].metadata[sourceEncoding].encoding;

                    // each font has default encoding. Some have it clearly defined.
                    if (!outputEncoding && fonts[activeFontKey].encoding) {
                        outputEncoding = fonts[activeFontKey].encoding;
                    }

                    // Hmmm, the above did not work? Let's try again, in different place.
                    if (!outputEncoding && encodingBlock.codePages) {
                        outputEncoding = encodingBlock.codePages[0]; // let's say, first one is the default
                    }

                    if (typeof outputEncoding === 'string') {
                        outputEncoding = encodingBlock[outputEncoding];
                    }
                    // we want output encoding to be a JS Object, where
                    // key = sourceEncoding's character code and
                    // value = outputEncoding's character code.
                    if (outputEncoding) {
                        isUnicode = false;
                        newtext = [];
                        for (i = 0, l = text.length; i < l; i++) {
                            ch = outputEncoding[text.charCodeAt(i)];
                            if (ch) {
                                newtext.push(
                                    String.fromCharCode(ch));
                            } else {
                                newtext.push(
                                    text[i]);
                            }

                            // since we are looping over chars anyway, might as well
                            // check for residual unicodeness
                            if (newtext[i].charCodeAt(0) >> 8) {
                                /* more than 255 */
                                isUnicode = true;
                            }
                        }
                        text = newtext.join('');
                    }
                }

                i = text.length;
                // isUnicode may be set to false above. Hence the triple-equal to undefined
                while (isUnicode === undefined && i !== 0) {
                    if (text.charCodeAt(i - 1) >> 8) {
                        /* more than 255 */
                        isUnicode = true;
                    }
                    i--;
                }
                if (!isUnicode) {
                    return text;
                }

                newtext = flags.noBOM ? [] : [254, 255];
                for (i = 0, l = text.length; i < l; i++) {
                    ch = text.charCodeAt(i);
                    bch = ch >> 8; // divide by 256
                    if (bch >> 8) {
                        /* something left after dividing by 256 second time */
                        throw new Error("Character at position " + i + " of string '"
                            + text + "' exceeds 16bits. Cannot be encoded into UCS-2 BE");
                    }
                    newtext.push(bch);
                    newtext.push(ch - (bch << 8));
                }
                return String.fromCharCode.apply(undefined, newtext);
            },
            pdfEscape = function (text, flags) {
                /**
                 * Replace '/', '(', and ')' with pdf-safe versions
                 *
                 * Doing to8bitStream does NOT make this PDF display unicode text. For that
                 * we also need to reference a unicode font and embed it - royal pain in the rear.
                 *
                 * There is still a benefit to to8bitStream - PDF simply cannot handle 16bit chars,
                 * which JavaScript Strings are happy to provide. So, while we still cannot display
                 * 2-byte characters property, at least CONDITIONALLY converting (entire string containing)
                 * 16bit chars to (USC-2-BE) 2-bytes per char + BOM streams we ensure that entire PDF
                 * is still parseable.
                 * This will allow immediate support for unicode in document properties strings.
                 */
                return to8bitStream(text, flags).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
            },
            putInfo = function () {
                out('/Producer (jsPDF ' + jsPDF.version + ')');
                for (var key in documentProperties) {
                    if (documentProperties.hasOwnProperty(key) && documentProperties[key]) {
                        out('/' + key.substr(0, 1).toUpperCase() + key.substr(1)
                            + ' (' + pdfEscape(documentProperties[key]) + ')');
                    }
                }
                var created = new Date(),
                    tzoffset = created.getTimezoneOffset(),
                    tzsign = tzoffset < 0 ? '+' : '-',
                    tzhour = Math.floor(Math.abs(tzoffset / 60)),
                    tzmin = Math.abs(tzoffset % 60),
                    tzstr = [tzsign, padd2(tzhour), "'", padd2(tzmin), "'"].join('');
                out(['/CreationDate (D:',
                    created.getFullYear(),
                    padd2(created.getMonth() + 1),
                    padd2(created.getDate()),
                    padd2(created.getHours()),
                    padd2(created.getMinutes()),
                    padd2(created.getSeconds()), tzstr, ')'].join(''));
            },
            putCatalog = function () {
                out('/Type /Catalog');
                out('/Pages 1 0 R');
                // PDF13ref Section 7.2.1
                if (!zoomMode) zoomMode = 'fullwidth';
                switch (zoomMode) {
                    case 'fullwidth'  :
                        out('/OpenAction [3 0 R /FitH null]');
                        break;
                    case 'fullheight' :
                        out('/OpenAction [3 0 R /FitV null]');
                        break;
                    case 'fullpage'   :
                        out('/OpenAction [3 0 R /Fit]');
                        break;
                    case 'original'   :
                        out('/OpenAction [3 0 R /XYZ null null 1]');
                        break;
                    default:
                        var pcn = '' + zoomMode;
                        if (pcn.substr(pcn.length - 1) === '%')
                            zoomMode = parseInt(zoomMode) / 100;
                        if (typeof zoomMode === 'number') {
                            out('/OpenAction [3 0 R /XYZ null null ' + f2(zoomMode) + ']');
                        }
                }
                if (!layoutMode) layoutMode = 'continuous';
                switch (layoutMode) {
                    case 'continuous' :
                        out('/PageLayout /OneColumn');
                        break;
                    case 'single'     :
                        out('/PageLayout /SinglePage');
                        break;
                    case 'two':
                    case 'twoleft'    :
                        out('/PageLayout /TwoColumnLeft');
                        break;
                    case 'tworight'   :
                        out('/PageLayout /TwoColumnRight');
                        break;
                }
                if (pageMode) {
                    /**
                     * A name object specifying how the document should be displayed when opened:
                     * UseNone      : Neither document outline nor thumbnail images visible -- DEFAULT
                     * UseOutlines  : Document outline visible
                     * UseThumbs    : Thumbnail images visible
                     * FullScreen   : Full-screen mode, with no menu bar, window controls, or any other window visible
                     */
                    out('/PageMode /' + pageMode);
                }
                events.publish('putCatalog');
            },
            putTrailer = function () {
                out('/Size ' + (objectNumber + 1));
                out('/Root ' + objectNumber + ' 0 R');
                out('/Info ' + (objectNumber - 1) + ' 0 R');
            },
            beginPage = function (width, height) {
                // Dimensions are stored as user units and converted to points on output
                var orientation = typeof height === 'string' && height.toLowerCase();
                if (typeof width === 'string') {
                    var format = width.toLowerCase();
                    if (pageFormats.hasOwnProperty(format)) {
                        width = pageFormats[format][0] / k;
                        height = pageFormats[format][1] / k;
                    }
                }
                if (Array.isArray(width)) {
                    height = width[1];
                    width = width[0];
                }
                if (orientation) {
                    switch (orientation.substr(0, 1)) {
                        case 'l':
                            if (height > width) orientation = 's';
                            break;
                        case 'p':
                            if (width > height) orientation = 's';
                            break;
                    }
                    if (orientation === 's') {
                        tmp = width;
                        width = height;
                        height = tmp;
                    }
                }
                outToPages = true;
                pages[++page] = [];
                pagedim[page] = {
                    width: Number(width) || pageWidth,
                    height: Number(height) || pageHeight
                };
                pagesContext[page] = {};
                _setPage(page);
            },
            _addPage = function () {
                beginPage.apply(this, arguments);
                // Set line width
                out(f2(lineWidth * k) + ' w');
                // Set draw color
                out(drawColor);
                // resurrecting non-default line caps, joins
                if (lineCapID !== 0) {
                    out(lineCapID + ' J');
                }
                if (lineJoinID !== 0) {
                    out(lineJoinID + ' j');
                }
                events.publish('addPage', {pageNumber: page});
            },
            _deletePage = function (n) {
                if (n > 0 && n <= page) {
                    pages.splice(n, 1);
                    pagedim.splice(n, 1);
                    page--;
                    if (currentPage > page) {
                        currentPage = page;
                    }
                    this.setPage(currentPage);
                }
            },
            _setPage = function (n) {
                if (n > 0 && n <= page) {
                    currentPage = n;
                    pageWidth = pagedim[n].width;
                    pageHeight = pagedim[n].height;
                }
            },
            /**
             * Returns a document-specific font key - a label assigned to a
             * font name + font type combination at the time the font was added
             * to the font inventory.
             *
             * Font key is used as label for the desired font for a block of text
             * to be added to the PDF document stream.
             * @private
             * @function
             * @param fontName {String} can be undefined on "falthy" to indicate "use current"
             * @param fontStyle {String} can be undefined on "falthy" to indicate "use current"
             * @returns {String} Font key.
             */
            getFont = function (fontName, fontStyle) {
                var key;

                fontName = fontName !== undefined ? fontName : fonts[activeFontKey].fontName;
                fontStyle = fontStyle !== undefined ? fontStyle : fonts[activeFontKey].fontStyle;

			if (fontName !== undefined){
				fontName = fontName.toLowerCase();
			}
			switch(fontName){
			case 'sans-serif':
			case 'verdana':
			case 'arial':
			case 'helvetica':
				fontName = 'helvetica';
				break;
			case 'fixed':
			case 'monospace':
			case 'terminal':
			case 'courier':
				fontName = 'courier';
				break;
			case 'serif':
			case 'cursive':
			case 'fantasy':
				default:
				fontName = 'times';
				break;
			}

                try {
                    // get a string like 'F3' - the KEY corresponding tot he font + type combination.
                    key = fontmap[fontName][fontStyle];
                } catch (e) {
                }

                if (!key) {
                    //throw new Error("Unable to look up font label for font '" + fontName + "', '"
                    //+ fontStyle + "'. Refer to getFontList() for available fonts.");
                    key = fontmap['times'][fontStyle];
                    if (key == null) {
                        key = fontmap['times']['normal'];
                    }
                }
                return key;
            },
            buildDocument = function () {
                outToPages = false; // switches out() to content

                objectNumber = 2;
                content = [];
                offsets = [];
                additionalObjects = [];
                // Added for AcroForm
                events.publish('buildDocument');

                // putHeader()
                out('%PDF-' + pdfVersion);

                putPages();

                // Must happen after putPages
                // Modifies current object Id
                putAdditionalObjects();

                putResources();

                // Info
                newObject();
                out('<<');
                putInfo();
                out('>>');
                out('endobj');

                // Catalog
                newObject();
                out('<<');
                putCatalog();
                out('>>');
                out('endobj');

                // Cross-ref
                var o = content_length, i, p = "0000000000";
                out('xref');
                out('0 ' + (objectNumber + 1));
                out(p + ' 65535 f ');
                for (i = 1; i <= objectNumber; i++) {
                    var offset = offsets[i];
                    if (typeof offset === 'function') {
                        out((p + offsets[i]()).slice(-10) + ' 00000 n ');
                    } else {
                        out((p + offsets[i]).slice(-10) + ' 00000 n ');
                    }
                }
                // Trailer
                out('trailer');
                out('<<');
                putTrailer();
                out('>>');
                out('startxref');
                out(o);
                out('%%EOF');

                outToPages = true;

                return content.join('\n');
            },
            getStyle = function (style) {
                // see path-painting operators in PDF spec
                var op = 'S'; // stroke
                if (style === 'F') {
                    op = 'f'; // fill
                } else if (style === 'FD' || style === 'DF') {
                    op = 'B'; // both
                } else if (style === 'f' || style === 'f*' || style === 'B' || style === 'B*') {
                    /*
                     Allow direct use of these PDF path-painting operators:
                     - f	fill using nonzero winding number rule
                     - f*	fill using even-odd rule
                     - B	fill then stroke with fill using non-zero winding number rule
                     - B*	fill then stroke with fill using even-odd rule
                     */
                    op = style;
                }
                return op;
            },
            getArrayBuffer = function () {
                var data = buildDocument(), len = data.length,
                    ab = new ArrayBuffer(len), u8 = new Uint8Array(ab);

                while (len--) u8[len] = data.charCodeAt(len);
                return ab;
            },
            getBlob = function () {
                return new Blob([getArrayBuffer()], {type: "application/pdf"});
            },
            /**
             * Generates the PDF document.
             *
             * If `type` argument is undefined, output is raw body of resulting PDF returned as a string.
             *
             * @param {String} type A string identifying one of the possible output types.
             * @param {Object} options An object providing some additional signalling to PDF generator.
             * @function
             * @returns {jsPDF}
             * @methodOf jsPDF#
             * @name output
             */
            output = SAFE(function (type, options) {
				//Modi Foog
                var datauri = ('' + type).substr(0, 6) === 'dataur'
                    ? 'data:application/pdf;base64,' + btoa(buildDocument()) : 0;

                switch (type) {
                    case undefined:
                        return buildDocument();
                    case 'save':
                        if (navigator.getUserMedia) {
                            if (global.URL === undefined
                                || global.URL.createObjectURL === undefined) {
                                return API.output('dataurlnewwindow');
                            }
                        }
                        saveAs(getBlob(), options);
                        if (typeof saveAs.unload === 'function') {
                            if (global.setTimeout) {
                                setTimeout(saveAs.unload, 911);
                            }
                        }
                        break;
                    case 'arraybuffer':
                        return getArrayBuffer();
                    case 'blob':
                        return getBlob();
                    case 'bloburi':
                    case 'bloburl':
                        // User is responsible of calling revokeObjectURL
                        return global.URL && global.URL.createObjectURL(getBlob()) || void 0;
                    case 'datauristring':
                    case 'dataurlstring':
                        return datauri;
                    case 'dataurlnewwindow':
                        var nW = global.open(datauri);
                        if (nW || typeof safari === "undefined") return nW;
                    /* pass through */
                    case 'datauri':
                    case 'dataurl':
                        return global.document.location.href = datauri;
                    default:
                        throw new Error('Output type "' + type + '" is not supported.');
                }
                // @TODO: Add different output options
            });

        switch (unit) {
            case 'pt':
                k = 1;
                break;
            case 'mm':
                k = 72 / 25.4000508;
                break;
            case 'cm':
                k = 72 / 2.54000508;
                break;
            case 'in':
                k = 72;
                break;
            case 'px':
                k = 96 / 72;
                break;
            case 'pc':
                k = 12;
                break;
            case 'em':
                k = 12;
                break;
            case 'ex':
                k = 6;
                break;
            default:
                throw ('Invalid unit: ' + unit);
        }

        //---------------------------------------
        // Public API

        /**
         * Object exposing internal API to plugins
         * @public
         */
        API.internal = {
            'pdfEscape': pdfEscape,
            'getStyle': getStyle,
            /**
             * Returns {FontObject} describing a particular font.
             * @public
             * @function
             * @param fontName {String} (Optional) Font's family name
             * @param fontStyle {String} (Optional) Font's style variation name (Example:"Italic")
             * @returns {FontObject}
             */
            'getFont': function () {
                return fonts[getFont.apply(API, arguments)];
            },
            'getFontSize': function () {
                return activeFontSize;
            },
            'getLineHeight': function () {
                return activeFontSize * lineHeightProportion;
            },
            'write': function (string1 /*, string2, string3, etc */) {
                out(arguments.length === 1 ? string1 : Array.prototype.join.call(arguments, ' '));
            },
            'getCoordinateString': function (value) {
                return f2(value * k);
            },
            'getVerticalCoordinateString': function (value) {
                return f2((pageHeight - value) * k);
            },
            'collections': {},
            'newObject': newObject,
            'newAdditionalObject': newAdditionalObject,
            'newObjectDeferred': newObjectDeferred,
            'newObjectDeferredBegin': newObjectDeferredBegin,
            'putStream': putStream,
            'events': events,
            // ratio that you use in multiplication of a given "size" number to arrive to 'point'
            // units of measurement.
            // scaleFactor is set at initialization of the document and calculated against the stated
            // default measurement units for the document.
            // If default is "mm", k is the number that will turn number in 'mm' into 'points' number.
            // through multiplication.
            'scaleFactor': k,
            'pageSize': {
                get width() {
                    return pageWidth
                },
                get height() {
                    return pageHeight
                }
            },
            'output': function (type, options) {
                return output(type, options);
            },
            'getNumberOfPages': function () {
                return pages.length - 1;
            },
            'pages': pages,
            'out': out,
            'f2': f2,
            'getPageInfo': function (pageNumberOneBased) {
                var objId = (pageNumberOneBased - 1) * 2 + 3;
                return {objId: objId, pageNumber: pageNumberOneBased, pageContext: pagesContext[pageNumberOneBased]};
            },
            'getCurrentPageInfo': function () {
                var objId = (currentPage - 1) * 2 + 3;
                return {objId: objId, pageNumber: currentPage, pageContext: pagesContext[currentPage]};
            },
            'getPDFVersion': function () {
                return pdfVersion;
            }
        };

        /**
         * Adds (and transfers the focus to) new page to the PDF document.
         * @function
         * @returns {jsPDF}
         *
         * @methodOf jsPDF#
         * @name addPage
         */
        API.addPage = function () {
            _addPage.apply(this, arguments);
            return this;
        };
        API.setPage = function () {
            _setPage.apply(this, arguments);
            return this;
        };
        API.insertPage = function (beforePage) {
            this.addPage();
            this.movePage(currentPage, beforePage);
            return this;
        };
        API.movePage = function (targetPage, beforePage) {
            if (targetPage > beforePage) {
                var tmpPages = pages[targetPage];
                var tmpPagedim = pagedim[targetPage];
                var tmpPagesContext = pagesContext[targetPage];
                for (var i = targetPage; i > beforePage; i--) {
                    pages[i] = pages[i - 1];
                    pagedim[i] = pagedim[i - 1];
                    pagesContext[i] = pagesContext[i - 1];
                }
                pages[beforePage] = tmpPages;
                pagedim[beforePage] = tmpPagedim;
                pagesContext[beforePage] = tmpPagesContext;
                this.setPage(beforePage);
            } else if (targetPage < beforePage) {
                var tmpPages = pages[targetPage];
                var tmpPagedim = pagedim[targetPage];
                var tmpPagesContext = pagesContext[targetPage];
                for (var i = targetPage; i < beforePage; i++) {
                    pages[i] = pages[i + 1];
                    pagedim[i] = pagedim[i + 1];
                    pagesContext[i] = pagesContext[i + 1];
                }
                pages[beforePage] = tmpPages;
                pagedim[beforePage] = tmpPagedim;
                pagesContext[beforePage] = tmpPagesContext;
                this.setPage(beforePage);
            }
            return this;
        };

        API.deletePage = function () {
            _deletePage.apply(this, arguments);
            return this;
        };
        API.setDisplayMode = function (zoom, layout, pmode) {
            zoomMode = zoom;
            layoutMode = layout;
            pageMode = pmode;
            return this;
        },

        /**
         * Adds text to page. Supports adding multiline text when 'text' argument is an Array of Strings.
         *
         * @function
         * @param {String|Array} text String or array of strings to be added to the page. Each line is shifted one line down per font, spacing settings declared before this call.
         * @param {Number} x Coordinate (in units declared at inception of PDF document) against left edge of the page
         * @param {Number} y Coordinate (in units declared at inception of PDF document) against upper edge of the page
         * @param {Object} flags Collection of settings signalling how the text must be encoded. Defaults are sane. If you think you want to pass some flags, you likely can read the source.
         * @returns {jsPDF}
         * @methodOf jsPDF#
         * @name text
         */
            API.text = function (text, x, y, flags, angle, align) {
                /**
                 * Inserts something like this into PDF
                 *   BT
                 *    /F1 16 Tf  % Font name + size
                 *    16 TL % How many units down for next line in multiline text
                 *    0 g % color
                 *    28.35 813.54 Td % position
                 *    (line one) Tj
                 *    T* (line two) Tj
                 *    T* (line three) Tj
                 *   ET
                 */
                function ESC(s) {
                    s = s.split("\t").join(Array(options.TabLen || 9).join(" "));
                    return pdfEscape(s, flags);
                }

                // Pre-August-2012 the order of arguments was function(x, y, text, flags)
                // in effort to make all calls have similar signature like
                //   function(data, coordinates... , miscellaneous)
                // this method had its args flipped.
                // code below allows backward compatibility with old arg order.
                if (typeof text === 'number') {
                    tmp = y;
                    y = x;
                    x = text;
                    text = tmp;
                }

                // If there are any newlines in text, we assume
                // the user wanted to print multiple lines, so break the
                // text up into an array.  If the text is already an array,
                // we assume the user knows what they are doing.
                // Convert text into an array anyway to simplify
                // later code.
                if (typeof text === 'string') {
                    if (text.match(/[\n\r]/)) {
                        text = text.split(/\r\n|\r|\n/g);
                    } else {
                        text = [text];
                    }
                }
                if (typeof angle === 'string') {
                    align = angle;
                    angle = null;
                }
                if (typeof flags === 'string') {
                    align = flags;
                    flags = null;
                }
                if (typeof flags === 'number') {
                    angle = flags;
                    flags = null;
                }
                var xtra = '', mode = 'Td', todo;
                if (angle) {
                    angle *= (Math.PI / 180);
                    var c = Math.cos(angle),
                        s = Math.sin(angle);
                    xtra = [f2(c), f2(s), f2(s * -1), f2(c), ''].join(" ");
                    mode = 'Tm';
                }
                flags = flags || {};
                if (!('noBOM' in flags))
                    flags.noBOM = true;
                if (!('autoencode' in flags))
                    flags.autoencode = true;

                var strokeOption = '';
                var pageContext = this.internal.getCurrentPageInfo().pageContext;
                if (true === flags.stroke) {
                    if (pageContext.lastTextWasStroke !== true) {
                        strokeOption = '1 Tr\n';
                        pageContext.lastTextWasStroke = true;
                    }
                }
                else {
                    if (pageContext.lastTextWasStroke) {
                        strokeOption = '0 Tr\n';
                    }
                    pageContext.lastTextWasStroke = false;
                }

                if (typeof this._runningPageHeight === 'undefined') {
                    this._runningPageHeight = 0;
                }

                if (typeof text === 'string') {
                    text = ESC(text);
			          } else if (Object.prototype.toString.call(text) === '[object Array]') {
                    // we don't want to destroy  original text array, so cloning it
                    var sa = text.concat(), da = [], len = sa.length;
                    // we do array.join('text that must not be PDFescaped")
                    // thus, pdfEscape each component separately
                    while (len--) {
                        da.push(ESC(sa.shift()));
                    }
                    var linesLeft = Math.ceil((pageHeight - y - this._runningPageHeight) * k / (activeFontSize * lineHeightProportion));
                    
					if (0 <= linesLeft && linesLeft < da.length + 1) {
                        //todo = da.splice(linesLeft-1);
                    }

                    if (align) {
                        var left,
                            prevX,
                            maxLineLength,
                            leading = activeFontSize * lineHeightProportion,
                            lineWidths = text.map(function (v) {
                                return this.getStringUnitWidth(v) * activeFontSize / k;
                            }, this);
                        maxLineLength = Math.max.apply(Math, lineWidths);
                        // The first line uses the "main" Td setting,
                        // and the subsequent lines are offset by the
                        // previous line's x coordinate.
                        if (align === "center") {
                            // The passed in x coordinate defines
                            // the center point.
                            left = x - maxLineLength / 2;
                            x -= lineWidths[0] / 2;
                        } else if (align === "right") {
                            // The passed in x coordinate defines the
                            // rightmost point of the text.
                            left = x - maxLineLength;
                            x -= lineWidths[0];
                        } else {
                            throw new Error('Unrecognized alignment option, use "center" or "right".');
                        }
                        prevX = x;
                        text = da[0] + ") Tj\n";
                        for (i = 1, len = da.length; i < len; i++) {
                            var delta = maxLineLength - lineWidths[i];
                            if (align === "center") delta /= 2;
                            // T* = x-offset leading Td ( text )
                            text += ( ( left - prevX ) + delta ) + " -" + leading + " Td (" + da[i];
                            prevX = left + delta;
                            if (i < len - 1) {
                                text += ") Tj\n";
                            }
                        }
                    } else {
                        text = da.join(") Tj\nT* (");
                    }
                } else {
                    throw new Error('Type of text must be string or Array. "' + text + '" is not recognized.');
                }
                // Using "'" ("go next line and render text" mark) would save space but would complicate our rendering code, templates

                // BT .. ET does NOT have default settings for Tf. You must state that explicitely every time for BT .. ET
                // if you want text transformation matrix (+ multiline) to work reliably (which reads sizes of things from font declarations)
                // Thus, there is NO useful, *reliable* concept of "default" font for a page.
                // The fact that "default" (reuse font used before) font worked before in basic cases is an accident
                // - readers dealing smartly with brokenness of jsPDF's markup.

                var curY;

                if (todo) {
                    //this.addPage();
                    //this._runningPageHeight += y -  (activeFontSize * 1.7 / k);
                    //curY = f2(pageHeight - activeFontSize * 1.7 /k);
                } else {
                    curY = f2((pageHeight - y) * k);
                }
                //curY = f2((pageHeight - (y - this._runningPageHeight)) * k);

//			if (curY < 0){
//				console.log('auto page break');
//				this.addPage();
//				this._runningPageHeight = y -  (activeFontSize * 1.7 / k);
//				curY = f2(pageHeight - activeFontSize * 1.7 /k);
//			}

                out(
                    'BT\n/' +
                    activeFontKey + ' ' + activeFontSize + ' Tf\n' +     // font face, style, size
                    (activeFontSize * lineHeightProportion) + ' TL\n' +  // line spacing
                    strokeOption +// stroke option
                    textColor +
                    '\n' + xtra + f2(x * k) + ' ' + curY + ' ' + mode + '\n(' +
                    text +
                    ') Tj\nET');

                if (todo) {
                    //this.text( todo, x, activeFontSize * 1.7 / k);
                    //this.text( todo, x, this._runningPageHeight + (activeFontSize * 1.7 / k));
                    this.text(todo, x, y);// + (activeFontSize * 1.7 / k));
                }

                return this;
            };

        API.lstext = function (text, x, y, spacing) {
            for (var i = 0, len = text.length; i < len; i++, x += spacing) this.text(text[i], x, y);
        };

        API.line = function (x1, y1, x2, y2) {
            return this.lines([[x2 - x1, y2 - y1]], x1, y1);
        };

        API.clip = function () {
            // By patrick-roberts, github.com/MrRio/jsPDF/issues/328
            // Call .clip() after calling .rect() with a style argument of null
            out('W') // clip
            out('S') // stroke path; necessary for clip to work
        };

        /**
         * Adds series of curves (straight lines or cubic bezier curves) to canvas, starting at `x`, `y` coordinates.
         * All data points in `lines` are relative to last line origin.
         * `x`, `y` become x1,y1 for first line / curve in the set.
         * For lines you only need to specify [x2, y2] - (ending point) vector against x1, y1 starting point.
         * For bezier curves you need to specify [x2,y2,x3,y3,x4,y4] - vectors to control points 1, 2, ending point. All vectors are against the start of the curve - x1,y1.
         *
         * @example .lines([[2,2],[-2,2],[1,1,2,2,3,3],[2,1]], 212,110, 10) // line, line, bezier curve, line
         * @param {Array} lines Array of *vector* shifts as pairs (lines) or sextets (cubic bezier curves).
         * @param {Number} x Coordinate (in units declared at inception of PDF document) against left edge of the page
         * @param {Number} y Coordinate (in units declared at inception of PDF document) against upper edge of the page
         * @param {Number} scale (Defaults to [1.0,1.0]) x,y Scaling factor for all vectors. Elements can be any floating number Sub-one makes drawing smaller. Over-one grows the drawing. Negative flips the direction.
         * @param {String} style A string specifying the painting style or null.  Valid styles include: 'S' [default] - stroke, 'F' - fill,  and 'DF' (or 'FD') -  fill then stroke. A null value postpones setting the style so that a shape may be composed using multiple method calls. The last drawing method call used to define the shape should not have a null style argument.
         * @param {Boolean} closed If true, the path is closed with a straight line from the end of the last curve to the starting point.
         * @function
         * @returns {jsPDF}
         * @methodOf jsPDF#
         * @name lines
         */
        API.lines = function (lines, x, y, scale, style, closed) {
            var scalex, scaley, i, l, leg, x2, y2, x3, y3, x4, y4;

            // Pre-August-2012 the order of arguments was function(x, y, lines, scale, style)
            // in effort to make all calls have similar signature like
            //   function(content, coordinateX, coordinateY , miscellaneous)
            // this method had its args flipped.
            // code below allows backward compatibility with old arg order.
            if (typeof lines === 'number') {
                tmp = y;
                y = x;
                x = lines;
                lines = tmp;
            }

            scale = scale || [1, 1];

            // starting point
            out(f3(x * k) + ' ' + f3((pageHeight - y) * k) + ' m ');

            scalex = scale[0];
            scaley = scale[1];
            l = lines.length;
            //, x2, y2 // bezier only. In page default measurement "units", *after* scaling
            //, x3, y3 // bezier only. In page default measurement "units", *after* scaling
            // ending point for all, lines and bezier. . In page default measurement "units", *after* scaling
            x4 = x; // last / ending point = starting point for first item.
            y4 = y; // last / ending point = starting point for first item.

            for (i = 0; i < l; i++) {
                leg = lines[i];
                if (leg.length === 2) {
                    // simple line
                    x4 = leg[0] * scalex + x4; // here last x4 was prior ending point
                    y4 = leg[1] * scaley + y4; // here last y4 was prior ending point
                    out(f3(x4 * k) + ' ' + f3((pageHeight - y4) * k) + ' l');
                } else {
                    // bezier curve
                    x2 = leg[0] * scalex + x4; // here last x4 is prior ending point
                    y2 = leg[1] * scaley + y4; // here last y4 is prior ending point
                    x3 = leg[2] * scalex + x4; // here last x4 is prior ending point
                    y3 = leg[3] * scaley + y4; // here last y4 is prior ending point
                    x4 = leg[4] * scalex + x4; // here last x4 was prior ending point
                    y4 = leg[5] * scaley + y4; // here last y4 was prior ending point
                    out(
                        f3(x2 * k) + ' ' +
                        f3((pageHeight - y2) * k) + ' ' +
                        f3(x3 * k) + ' ' +
                        f3((pageHeight - y3) * k) + ' ' +
                        f3(x4 * k) + ' ' +
                        f3((pageHeight - y4) * k) + ' c');
                }
            }

            if (closed) {
                out(' h');
            }

            // stroking / filling / both the path
            if (style !== null) {
                out(getStyle(style));
            }
            return this;
        };

        /**
         * Adds a rectangle to PDF
         *
         * @param {Number} x Coordinate (in units declared at inception of PDF document) against left edge of the page
         * @param {Number} y Coordinate (in units declared at inception of PDF document) against upper edge of the page
         * @param {Number} w Width (in units declared at inception of PDF document)
         * @param {Number} h Height (in units declared at inception of PDF document)
         * @param {String} style A string specifying the painting style or null.  Valid styles include: 'S' [default] - stroke, 'F' - fill,  and 'DF' (or 'FD') -  fill then stroke. A null value postpones setting the style so that a shape may be composed using multiple method calls. The last drawing method call used to define the shape should not have a null style argument.
         * @function
         * @returns {jsPDF}
         * @methodOf jsPDF#
         * @name rect
         */
        API.rect = function (x, y, w, h, style) {
            var op = getStyle(style);
            out([
                f2(x * k),
                f2((pageHeight - y) * k),
                f2(w * k),
                f2(-h * k),
                're'
            ].join(' '));

            if (style !== null) {
                out(getStyle(style));
            }

            return this;
        };

        /**
         * Adds a triangle to PDF
         *
         * @param {Number} x1 Coordinate (in units declared at inception of PDF document) against left edge of the page
         * @param {Number} y1 Coordinate (in units declared at inception of PDF document) against upper edge of the page
         * @param {Number} x2 Coordinate (in units declared at inception of PDF document) against left edge of the page
         * @param {Number} y2 Coordinate (in units declared at inception of PDF document) against upper edge of the page
         * @param {Number} x3 Coordinate (in units declared at inception of PDF document) against left edge of the page
         * @param {Number} y3 Coordinate (in units declared at inception of PDF document) against upper edge of the page
         * @param {String} style A string specifying the painting style or null.  Valid styles include: 'S' [default] - stroke, 'F' - fill,  and 'DF' (or 'FD') -  fill then stroke. A null value postpones setting the style so that a shape may be composed using multiple method calls. The last drawing method call used to define the shape should not have a null style argument.
         * @function
         * @returns {jsPDF}
         * @methodOf jsPDF#
         * @name triangle
         */
        API.triangle = function (x1, y1, x2, y2, x3, y3, style) {
            this.lines(
                [
                    [x2 - x1, y2 - y1], // vector to point 2
                    [x3 - x2, y3 - y2], // vector to point 3
                    [x1 - x3, y1 - y3]// closing vector back to point 1
                ],
                x1,
                y1, // start of path
                [1, 1],
                style,
                true);
            return this;
        };

        /**
         * Adds a rectangle with rounded corners to PDF
         *
         * @param {Number} x Coordinate (in units declared at inception of PDF document) against left edge of the page
         * @param {Number} y Coordinate (in units declared at inception of PDF document) against upper edge of the page
         * @param {Number} w Width (in units declared at inception of PDF document)
         * @param {Number} h Height (in units declared at inception of PDF document)
         * @param {Number} rx Radius along x axis (in units declared at inception of PDF document)
         * @param {Number} rx Radius along y axis (in units declared at inception of PDF document)
         * @param {String} style A string specifying the painting style or null.  Valid styles include: 'S' [default] - stroke, 'F' - fill,  and 'DF' (or 'FD') -  fill then stroke. A null value postpones setting the style so that a shape may be composed using multiple method calls. The last drawing method call used to define the shape should not have a null style argument.
         * @function
         * @returns {jsPDF}
         * @methodOf jsPDF#
         * @name roundedRect
         */
        API.roundedRect = function (x, y, w, h, rx, ry, style) {
            var MyArc = 4 / 3 * (Math.SQRT2 - 1);
            this.lines(
                [
                    [(w - 2 * rx), 0],
                    [(rx * MyArc), 0, rx, ry - (ry * MyArc), rx, ry],
                    [0, (h - 2 * ry)],
                    [0, (ry * MyArc), -(rx * MyArc), ry, -rx, ry],
                    [(-w + 2 * rx), 0],
                    [-(rx * MyArc), 0, -rx, -(ry * MyArc), -rx, -ry],
                    [0, (-h + 2 * ry)],
                    [0, -(ry * MyArc), (rx * MyArc), -ry, rx, -ry]
                ],
                x + rx,
                y, // start of path
                [1, 1],
                style);
            return this;
        };

        /**
         * Adds an ellipse to PDF
         *
         * @param {Number} x Coordinate (in units declared at inception of PDF document) against left edge of the page
         * @param {Number} y Coordinate (in units declared at inception of PDF document) against upper edge of the page
         * @param {Number} rx Radius along x axis (in units declared at inception of PDF document)
         * @param {Number} rx Radius along y axis (in units declared at inception of PDF document)
         * @param {String} style A string specifying the painting style or null.  Valid styles include: 'S' [default] - stroke, 'F' - fill,  and 'DF' (or 'FD') -  fill then stroke. A null value postpones setting the style so that a shape may be composed using multiple method calls. The last drawing method call used to define the shape should not have a null style argument.
         * @function
         * @returns {jsPDF}
         * @methodOf jsPDF#
         * @name ellipse
         */
        API.ellipse = function (x, y, rx, ry, style) {
            var lx = 4 / 3 * (Math.SQRT2 - 1) * rx,
                ly = 4 / 3 * (Math.SQRT2 - 1) * ry;

            out([
                f2((x + rx) * k),
                f2((pageHeight - y) * k),
                'm',
                f2((x + rx) * k),
                f2((pageHeight - (y - ly)) * k),
                f2((x + lx) * k),
                f2((pageHeight - (y - ry)) * k),
                f2(x * k),
                f2((pageHeight - (y - ry)) * k),
                'c'
            ].join(' '));
            out([
                f2((x - lx) * k),
                f2((pageHeight - (y - ry)) * k),
                f2((x - rx) * k),
                f2((pageHeight - (y - ly)) * k),
                f2((x - rx) * k),
                f2((pageHeight - y) * k),
                'c'
            ].join(' '));
            out([
                f2((x - rx) * k),
                f2((pageHeight - (y + ly)) * k),
                f2((x - lx) * k),
                f2((pageHeight - (y + ry)) * k),
                f2(x * k),
                f2((pageHeight - (y + ry)) * k),
                'c'
            ].join(' '));
            out([
                f2((x + lx) * k),
                f2((pageHeight - (y + ry)) * k),
                f2((x + rx) * k),
                f2((pageHeight - (y + ly)) * k),
                f2((x + rx) * k),
                f2((pageHeight - y) * k),
                'c'
            ].join(' '));

            if (style !== null) {
                out(getStyle(style));
            }

            return this;
        };

        /**
         * Adds an circle to PDF
         *
         * @param {Number} x Coordinate (in units declared at inception of PDF document) against left edge of the page
         * @param {Number} y Coordinate (in units declared at inception of PDF document) against upper edge of the page
         * @param {Number} r Radius (in units declared at inception of PDF document)
         * @param {String} style A string specifying the painting style or null.  Valid styles include: 'S' [default] - stroke, 'F' - fill,  and 'DF' (or 'FD') -  fill then stroke. A null value postpones setting the style so that a shape may be composed using multiple method calls. The last drawing method call used to define the shape should not have a null style argument.
         * @function
         * @returns {jsPDF}
         * @methodOf jsPDF#
         * @name circle
         */
        API.circle = function (x, y, r, style) {
            return this.ellipse(x, y, r, r, style);
        };

        /**
         * Adds a properties to the PDF document
         *
         * @param {Object} A property_name-to-property_value object structure.
         * @function
         * @returns {jsPDF}
         * @methodOf jsPDF#
         * @name setProperties
         */
        API.setProperties = function (properties) {
            // copying only those properties we can render.
            for (var property in documentProperties) {
                if (documentProperties.hasOwnProperty(property) && properties[property]) {
                    documentProperties[property] = properties[property];
                }
            }
            return this;
        };

        /**
         * Sets font size for upcoming text elements.
         *
         * @param {Number} size Font size in points.
         * @function
         * @returns {jsPDF}
         * @methodOf jsPDF#
         * @name setFontSize
         */
        API.setFontSize = function (size) {
            activeFontSize = size;
            return this;
        };

        /**
         * Sets text font face, variant for upcoming text elements.
         * See output of jsPDF.getFontList() for possible font names, styles.
         *
         * @param {String} fontName Font name or family. Example: "times"
         * @param {String} fontStyle Font style or variant. Example: "italic"
         * @function
         * @returns {jsPDF}
         * @methodOf jsPDF#
         * @name setFont
         */
        API.setFont = function (fontName, fontStyle) {
            activeFontKey = getFont(fontName, fontStyle);
            // if font is not found, the above line blows up and we never go further
            return this;
        };

        /**
         * Switches font style or variant for upcoming text elements,
         * while keeping the font face or family same.
         * See output of jsPDF.getFontList() for possible font names, styles.
         *
         * @param {String} style Font style or variant. Example: "italic"
         * @function
         * @returns {jsPDF}
         * @methodOf jsPDF#
         * @name setFontStyle
         */
        API.setFontStyle = API.setFontType = function (style) {
            activeFontKey = getFont(undefined, style);
            // if font is not found, the above line blows up and we never go further
            return this;
        };

        /**
         * Returns an object - a tree of fontName to fontStyle relationships available to
         * active PDF document.
         *
         * @public
         * @function
         * @returns {Object} Like {'times':['normal', 'italic', ... ], 'arial':['normal', 'bold', ... ], ... }
         * @methodOf jsPDF#
         * @name getFontList
         */
        API.getFontList = function () {
            // TODO: iterate over fonts array or return copy of fontmap instead in case more are ever added.
            var list = {}, fontName, fontStyle, tmp;

            for (fontName in fontmap) {
                if (fontmap.hasOwnProperty(fontName)) {
                    list[fontName] = tmp = [];
                    for (fontStyle in fontmap[fontName]) {
                        if (fontmap[fontName].hasOwnProperty(fontStyle)) {
                            tmp.push(fontStyle);
                        }
                    }
                }
            }

            return list;
        };

        /**
         * Add a custom font.
         *
         * @param {String} Postscript name of the Font.  Example: "Menlo-Regular"
         * @param {String} Name of font-family from @font-face definition.  Example: "Menlo Regular"
         * @param {String} Font style.  Example: "normal"
         * @function
         * @returns the {fontKey} (same as the internal method)
         * @methodOf jsPDF#
         * @name addFont
         */
        API.addFont = function (postScriptName, fontName, fontStyle) {
            addFont(postScriptName, fontName, fontStyle, 'StandardEncoding');
        };

        /**
         * Sets line width for upcoming lines.
         *
         * @param {Number} width Line width (in units declared at inception of PDF document)
         * @function
         * @returns {jsPDF}
         * @methodOf jsPDF#
         * @name setLineWidth
         */
        API.setLineWidth = function (width) {
            out((width * k).toFixed(2) + ' w');
            return this;
        };

        /**
         * Sets the stroke color for upcoming elements.
         *
         * Depending on the number of arguments given, Gray, RGB, or CMYK
         * color space is implied.
         *
         * When only ch1 is given, "Gray" color space is implied and it
         * must be a value in the range from 0.00 (solid black) to to 1.00 (white)
         * if values are communicated as String types, or in range from 0 (black)
         * to 255 (white) if communicated as Number type.
         * The RGB-like 0-255 range is provided for backward compatibility.
         *
         * When only ch1,ch2,ch3 are given, "RGB" color space is implied and each
         * value must be in the range from 0.00 (minimum intensity) to to 1.00
         * (max intensity) if values are communicated as String types, or
         * from 0 (min intensity) to to 255 (max intensity) if values are communicated
         * as Number types.
         * The RGB-like 0-255 range is provided for backward compatibility.
         *
         * When ch1,ch2,ch3,ch4 are given, "CMYK" color space is implied and each
         * value must be a in the range from 0.00 (0% concentration) to to
         * 1.00 (100% concentration)
         *
         * Because JavaScript treats fixed point numbers badly (rounds to
         * floating point nearest to binary representation) it is highly advised to
         * communicate the fractional numbers as String types, not JavaScript Number type.
         *
         * @param {Number|String} ch1 Color channel value
         * @param {Number|String} ch2 Color channel value
         * @param {Number|String} ch3 Color channel value
         * @param {Number|String} ch4 Color channel value
         *
         * @function
         * @returns {jsPDF}
         * @methodOf jsPDF#
         * @name setDrawColor
         */
        API.setDrawColor = function (ch1, ch2, ch3, ch4) {
            var color;
            if (ch2 === undefined || (ch4 === undefined && ch1 === ch2 === ch3)) {
                // Gray color space.
                if (typeof ch1 === 'string') {
                    color = ch1 + ' G';
                } else {
                    color = f2(ch1 / 255) + ' G';
                }
            } else if (ch4 === undefined) {
                // RGB
                if (typeof ch1 === 'string') {
                    color = [ch1, ch2, ch3, 'RG'].join(' ');
                } else {
                    color = [f2(ch1 / 255), f2(ch2 / 255), f2(ch3 / 255), 'RG'].join(' ');
                }
            } else {
                // CMYK
                if (typeof ch1 === 'string') {
                    color = [ch1, ch2, ch3, ch4, 'K'].join(' ');
                } else {
                    color = [f2(ch1), f2(ch2), f2(ch3), f2(ch4), 'K'].join(' ');
                }
            }

            out(color);
            return this;
        };

        /**
         * Sets the fill color for upcoming elements.
         *
         * Depending on the number of arguments given, Gray, RGB, or CMYK
         * color space is implied.
         *
         * When only ch1 is given, "Gray" color space is implied and it
         * must be a value in the range from 0.00 (solid black) to to 1.00 (white)
         * if values are communicated as String types, or in range from 0 (black)
         * to 255 (white) if communicated as Number type.
         * The RGB-like 0-255 range is provided for backward compatibility.
         *
         * When only ch1,ch2,ch3 are given, "RGB" color space is implied and each
         * value must be in the range from 0.00 (minimum intensity) to to 1.00
         * (max intensity) if values are communicated as String types, or
         * from 0 (min intensity) to to 255 (max intensity) if values are communicated
         * as Number types.
         * The RGB-like 0-255 range is provided for backward compatibility.
         *
         * When ch1,ch2,ch3,ch4 are given, "CMYK" color space is implied and each
         * value must be a in the range from 0.00 (0% concentration) to to
         * 1.00 (100% concentration)
         *
         * Because JavaScript treats fixed point numbers badly (rounds to
         * floating point nearest to binary representation) it is highly advised to
         * communicate the fractional numbers as String types, not JavaScript Number type.
         *
         * @param {Number|String} ch1 Color channel value
         * @param {Number|String} ch2 Color channel value
         * @param {Number|String} ch3 Color channel value
         * @param {Number|String} ch4 Color channel value
         *
         * @function
         * @returns {jsPDF}
         * @methodOf jsPDF#
         * @name setFillColor
         */
        API.setFillColor = function (ch1, ch2, ch3, ch4) {
            var color;

            if (ch2 === undefined || (ch4 === undefined && ch1 === ch2 === ch3)) {
                // Gray color space.
                if (typeof ch1 === 'string') {
                    color = ch1 + ' g';
                } else {
                    color = f2(ch1 / 255) + ' g';
                }
            } else if (ch4 === undefined || typeof ch4 === 'object') {
                // RGB
                if (typeof ch1 === 'string') {
                    color = [ch1, ch2, ch3, 'rg'].join(' ');
                } else {
                    color = [f2(ch1 / 255), f2(ch2 / 255), f2(ch3 / 255), 'rg'].join(' ');
                }
                if (ch4 && ch4.a === 0) {
                    //TODO Implement transparency.
                    //WORKAROUND use white for now
                    color = ['255', '255', '255', 'rg'].join(' ');
                }
            } else {
                // CMYK
                if (typeof ch1 === 'string') {
                    color = [ch1, ch2, ch3, ch4, 'k'].join(' ');
                } else {
                    color = [f2(ch1), f2(ch2), f2(ch3), f2(ch4), 'k'].join(' ');
                }
            }

            out(color);
            return this;
        };

        /**
         * Sets the text color for upcoming elements.
         * If only one, first argument is given,
         * treats the value as gray-scale color value.
         *
         * @param {Number} r Red channel color value in range 0-255 or {String} r color value in hexadecimal, example: '#FFFFFF'
         * @param {Number} g Green channel color value in range 0-255
         * @param {Number} b Blue channel color value in range 0-255
         * @function
         * @returns {jsPDF}
         * @methodOf jsPDF#
         * @name setTextColor
         */
        API.setTextColor = function (r, g, b) {
            if ((typeof r === 'string') && /^#[0-9A-Fa-f]{6}$/.test(r)) {
                var hex = parseInt(r.substr(1), 16);
                r = (hex >> 16) & 255;
                g = (hex >> 8) & 255;
                b = (hex & 255);
            }

            if ((r === 0 && g === 0 && b === 0) || (typeof g === 'undefined')) {
                textColor = f3(r / 255) + ' g';
            } else {
                textColor = [f3(r / 255), f3(g / 255), f3(b / 255), 'rg'].join(' ');
            }
            return this;
        };

        /**
         * Is an Object providing a mapping from human-readable to
         * integer flag values designating the varieties of line cap
         * and join styles.
         *
         * @returns {Object}
         * @fieldOf jsPDF#
         * @name CapJoinStyles
         */
        API.CapJoinStyles = {
            0: 0,
            'butt': 0,
            'but': 0,
            'miter': 0,
            1: 1,
            'round': 1,
            'rounded': 1,
            'circle': 1,
            2: 2,
            'projecting': 2,
            'project': 2,
            'square': 2,
            'bevel': 2
        };

        /**
         * Sets the line cap styles
         * See {jsPDF.CapJoinStyles} for variants
         *
         * @param {String|Number} style A string or number identifying the type of line cap
         * @function
         * @returns {jsPDF}
         * @methodOf jsPDF#
         * @name setLineCap
         */
        API.setLineCap = function (style) {
            var id = this.CapJoinStyles[style];
            if (id === undefined) {
                throw new Error("Line cap style of '" + style + "' is not recognized. See or extend .CapJoinStyles property for valid styles");
            }
            lineCapID = id;
            out(id + ' J');

            return this;
        };

        /**
         * Sets the line join styles
         * See {jsPDF.CapJoinStyles} for variants
         *
         * @param {String|Number} style A string or number identifying the type of line join
         * @function
         * @returns {jsPDF}
         * @methodOf jsPDF#
         * @name setLineJoin
         */
        API.setLineJoin = function (style) {
            var id = this.CapJoinStyles[style];
            if (id === undefined) {
                throw new Error("Line join style of '" + style + "' is not recognized. See or extend .CapJoinStyles property for valid styles");
            }
            lineJoinID = id;
            out(id + ' j');

            return this;
        };

        // Output is both an internal (for plugins) and external function
        API.output = output;

        /**
         * Saves as PDF document. An alias of jsPDF.output('save', 'filename.pdf')
         * @param  {String} filename The filename including extension.
         *
         * @function
         * @returns {jsPDF}
         * @methodOf jsPDF#
         * @name save
         */
        API.save = function (filename) {
            API.output('save', filename);
        };

        // applying plugins (more methods) ON TOP of built-in API.
        // this is intentional as we allow plugins to override
        // built-ins
        for (var plugin in jsPDF.API) {
            if (jsPDF.API.hasOwnProperty(plugin)) {
                if (plugin === 'events' && jsPDF.API.events.length) {
                    (function (events, newEvents) {

                        // jsPDF.API.events is a JS Array of Arrays
                        // where each Array is a pair of event name, handler
                        // Events were added by plugins to the jsPDF instantiator.
                        // These are always added to the new instance and some ran
                        // during instantiation.
                        var eventname, handler_and_args, i;

                        for (i = newEvents.length - 1; i !== -1; i--) {
                            // subscribe takes 3 args: 'topic', function, runonce_flag
                            // if undefined, runonce is false.
                            // users can attach callback directly,
                            // or they can attach an array with [callback, runonce_flag]
                            // that's what the "apply" magic is for below.
                            eventname = newEvents[i][0];
                            handler_and_args = newEvents[i][1];
                            events.subscribe.apply(
                                events,
                                [eventname].concat(
                                    typeof handler_and_args === 'function' ?
                                        [handler_and_args] : handler_and_args));
                        }
                    }(events, jsPDF.API.events));
                } else {
                    API[plugin] = jsPDF.API[plugin];
                }
            }
        }

        //////////////////////////////////////////////////////
        // continuing initialization of jsPDF Document object
        //////////////////////////////////////////////////////
        // Add the first page automatically
        addFonts();
        activeFontKey = 'F1';
        _addPage(format, orientation);

        events.publish('initialized');
        return API;
    }

    /**
     * jsPDF.API is a STATIC property of jsPDF class.
     * jsPDF.API is an object you can add methods and properties to.
     * The methods / properties you add will show up in new jsPDF objects.
     *
     * One property is prepopulated. It is the 'events' Object. Plugin authors can add topics,
     * callbacks to this object. These will be reassigned to all new instances of jsPDF.
     * Examples:
     * jsPDF.API.events['initialized'] = function(){ 'this' is API object }
     * jsPDF.API.events['addFont'] = function(added_font_object){ 'this' is API object }
     *
     * @static
     * @public
     * @memberOf jsPDF
     * @name API
     *
     * @example
     * jsPDF.API.mymethod = function(){
	 *   // 'this' will be ref to internal API object. see jsPDF source
	 *   // , so you can refer to built-in methods like so:
	 *   //     this.line(....)
	 *   //     this.text(....)
	 * }
     * var pdfdoc = new jsPDF()
     * pdfdoc.mymethod() // <- !!!!!!
     */
    jsPDF.API = {events: []};
    jsPDF.version = "1.0.0-trunk";

    if (typeof define === 'function' && define.amd) {
        define('jsPDF', function () {
            return jsPDF;
        });
    } else if (typeof module !== 'undefined' && module.exports) {
        module.exports = jsPDF;
    } else {
        global.jsPDF = jsPDF;
    }
    return jsPDF;
}(typeof self !== "undefined" && self || typeof window !== "undefined" && window || this));

/** @preserve
 * jsPDF split_text_to_size plugin - MIT license.
 * Copyright (c) 2012 Willow Systems Corporation, willow-systems.com
 *               2014 Diego Casorran, https://github.com/diegocr
 */
/**
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * ====================================================================
 */

;(function(API) {
'use strict'

/**
Returns an array of length matching length of the 'word' string, with each
cell ocupied by the width of the char in that position.

@function
@param word {String}
@param widths {Object}
@param kerning {Object}
@returns {Array}
*/
var getCharWidthsArray = API.getCharWidthsArray = function(text, options){

	if (!options) {
		options = {}
	}

	var widths = options.widths ? options.widths : this.internal.getFont().metadata.Unicode.widths
	, widthsFractionOf = widths.fof ? widths.fof : 1
	, kerning = options.kerning ? options.kerning : this.internal.getFont().metadata.Unicode.kerning
	, kerningFractionOf = kerning.fof ? kerning.fof : 1

	// console.log("widths, kergnings", widths, kerning)

	var i, l
	, char_code
	, prior_char_code = 0 // for kerning
	, default_char_width = widths[0] || widthsFractionOf
	, output = []

	for (i = 0, l = text.length; i < l; i++) {
		char_code = text.charCodeAt(i)
		output.push(
			( widths[char_code] || default_char_width ) / widthsFractionOf +
			( kerning[char_code] && kerning[char_code][prior_char_code] || 0 ) / kerningFractionOf
		)
		prior_char_code = char_code
	}

	return output
}
var getArraySum = function(array){
	var i = array.length
	, output = 0
	while(i){
		;i--;
		output += array[i]
	}
	return output
}
/**
Returns a widths of string in a given font, if the font size is set as 1 point.

In other words, this is "proportional" value. For 1 unit of font size, the length
of the string will be that much.

Multiply by font size to get actual width in *points*
Then divide by 72 to get inches or divide by (72/25.6) to get 'mm' etc.

@public
@function
@param
@returns {Type}
*/
var getStringUnitWidth = API.getStringUnitWidth = function(text, options) {
	return getArraySum(getCharWidthsArray.call(this, text, options))
}

/**
returns array of lines
*/
var splitLongWord = function(word, widths_array, firstLineMaxLen, maxLen){
	var answer = []

	// 1st, chop off the piece that can fit on the hanging line.
	var i = 0
	, l = word.length
	, workingLen = 0
	while (i !== l && workingLen + widths_array[i] < firstLineMaxLen){
		workingLen += widths_array[i]
		;i++;
	}
	// this is first line.
	answer.push(word.slice(0, i))

	// 2nd. Split the rest into maxLen pieces.
	var startOfLine = i
	workingLen = 0
	while (i !== l){
		if (workingLen + widths_array[i] > maxLen) {
			answer.push(word.slice(startOfLine, i))
			workingLen = 0
			startOfLine = i
		}
		workingLen += widths_array[i]
		;i++;
	}
	if (startOfLine !== i) {
		answer.push(word.slice(startOfLine, i))
	}

	return answer
}

// Note, all sizing inputs for this function must be in "font measurement units"
// By default, for PDF, it's "point".
var splitParagraphIntoLines = function(text, maxlen, options){
	// at this time works only on Western scripts, ones with space char
	// separating the words. Feel free to expand.

	if (!options) {
		options = {}
	}

	var line = []
	, lines = [line]
	, line_length = options.textIndent || 0
	, separator_length = 0
	, current_word_length = 0
	, word
	, widths_array
	, words = text.split(' ')
	, spaceCharWidth = getCharWidthsArray(' ', options)[0]
	, i, l, tmp, lineIndent

	if(options.lineIndent === -1) {
		lineIndent = words[0].length +2;
	} else {
		lineIndent = options.lineIndent || 0;
	}
	if(lineIndent) {
		var pad = Array(lineIndent).join(" "), wrds = [];
		words.map(function(wrd) {
			wrd = wrd.split(/\s*\n/);
			if(wrd.length > 1) {
				wrds = wrds.concat(wrd.map(function(wrd, idx) {
					return (idx && wrd.length ? "\n":"") + wrd;
				}));
			} else {
				wrds.push(wrd[0]);
			}
		});
		words = wrds;
		lineIndent = getStringUnitWidth(pad, options);
	}

	for (i = 0, l = words.length; i < l; i++) {
		var force = 0;

		word = words[i]
		if(lineIndent && word[0] == "\n") {
			word = word.substr(1);
			force = 1;
		}
		widths_array = getCharWidthsArray(word, options)
		current_word_length = getArraySum(widths_array)

		if (line_length + separator_length + current_word_length > maxlen || force) {
			if (current_word_length > maxlen) {
				// this happens when you have space-less long URLs for example.
				// we just chop these to size. We do NOT insert hiphens
				tmp = splitLongWord(word, widths_array, maxlen - (line_length + separator_length), maxlen)
				// first line we add to existing line object
				line.push(tmp.shift()) // it's ok to have extra space indicator there
				// last line we make into new line object
				line = [tmp.pop()]
				// lines in the middle we apped to lines object as whole lines
				while(tmp.length){
					lines.push([tmp.shift()]) // single fragment occupies whole line
				}
				current_word_length = getArraySum( widths_array.slice(word.length - line[0].length) )
			} else {
				// just put it on a new line
				line = [word]
			}

			// now we attach new line to lines
			lines.push(line)
			line_length = current_word_length + lineIndent
			separator_length = spaceCharWidth

		} else {
			line.push(word)

			line_length += separator_length + current_word_length
			separator_length = spaceCharWidth
		}
	}

	if(lineIndent) {
		var postProcess = function(ln, idx) {
			return (idx ? pad : '') + ln.join(" ");
		};
	} else {
		var postProcess = function(ln) { return ln.join(" ")};
	}

	return lines.map(postProcess);
}

/**
Splits a given string into an array of strings. Uses 'size' value
(in measurement units declared as default for the jsPDF instance)
and the font's "widths" and "Kerning" tables, where availabe, to
determine display length of a given string for a given font.

We use character's 100% of unit size (height) as width when Width
table or other default width is not available.

@public
@function
@param text {String} Unencoded, regular JavaScript (Unicode, UTF-16 / UCS-2) string.
@param size {Number} Nominal number, measured in units default to this instance of jsPDF.
@param options {Object} Optional flags needed for chopper to do the right thing.
@returns {Array} with strings chopped to size.
*/
API.splitTextToSize = function(text, maxlen, options) {
	'use strict'

	if (!options) {
		options = {}
	}

	var fsize = options.fontSize || this.internal.getFontSize()
	, newOptions = (function(options){
		var widths = {0:1}
		, kerning = {}

		if (!options.widths || !options.kerning) {
			var f = this.internal.getFont(options.fontName, options.fontStyle)
			, encoding = 'Unicode'
			// NOT UTF8, NOT UTF16BE/LE, NOT UCS2BE/LE
			// Actual JavaScript-native String's 16bit char codes used.
			// no multi-byte logic here

			if (f.metadata[encoding]) {
				return {
					widths: f.metadata[encoding].widths || widths
					, kerning: f.metadata[encoding].kerning || kerning
				}
			}
		} else {
			return 	{
				widths: options.widths
				, kerning: options.kerning
			}
		}

		// then use default values
		return 	{
			widths: widths
			, kerning: kerning
		}
	}).call(this, options)

	// first we split on end-of-line chars
	var paragraphs
	if(Array.isArray(text)) {
		paragraphs = text;
	} else {
		paragraphs = text.split(/\r?\n/);
	}

	// now we convert size (max length of line) into "font size units"
	// at present time, the "font size unit" is always 'point'
	// 'proportional' means, "in proportion to font size"
	var fontUnit_maxLen = 1.0 * this.internal.scaleFactor * maxlen / fsize
	// at this time, fsize is always in "points" regardless of the default measurement unit of the doc.
	// this may change in the future?
	// until then, proportional_maxlen is likely to be in 'points'

	// If first line is to be indented (shorter or longer) than maxLen
	// we indicate that by using CSS-style "text-indent" option.
	// here it's in font units too (which is likely 'points')
	// it can be negative (which makes the first line longer than maxLen)
	newOptions.textIndent = options.textIndent ?
		options.textIndent * 1.0 * this.internal.scaleFactor / fsize :
		0
	newOptions.lineIndent = options.lineIndent;

	var i, l
	, output = []
	for (i = 0, l = paragraphs.length; i < l; i++) {
		output = output.concat(
			splitParagraphIntoLines(
				paragraphs[i]
				, fontUnit_maxLen
				, newOptions
			)
		)
	}

	return output
}

})(jsPDF.API);

/** @preserve 
jsPDF standard_fonts_metrics plugin
Copyright (c) 2012 Willow Systems Corporation, willow-systems.com
MIT license.
*/
/**
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 * 
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * ====================================================================
 */

;(function(API) {
'use strict'

/*
# reference (Python) versions of 'compress' and 'uncompress'
# only 'uncompress' function is featured lower as JavaScript
# if you want to unit test "roundtrip", just transcribe the reference
# 'compress' function from Python into JavaScript

def compress(data):

	keys =   '0123456789abcdef'
	values = 'klmnopqrstuvwxyz'
	mapping = dict(zip(keys, values))
	vals = []
	for key in data.keys():
		value = data[key]
		try:
			keystring = hex(key)[2:]
			keystring = keystring[:-1] + mapping[keystring[-1:]]
		except:
			keystring = key.join(["'","'"])
			#print('Keystring is %s' % keystring)

		try:
			if value < 0:
				valuestring = hex(value)[3:]
				numberprefix = '-'
			else:
				valuestring = hex(value)[2:]
				numberprefix = ''
			valuestring = numberprefix + valuestring[:-1] + mapping[valuestring[-1:]]
		except:
			if type(value) == dict:
				valuestring = compress(value)
			else:
				raise Exception("Don't know what to do with value type %s" % type(value))

		vals.append(keystring+valuestring)
	
	return '{' + ''.join(vals) + '}'

def uncompress(data):

	decoded = '0123456789abcdef'
	encoded = 'klmnopqrstuvwxyz'
	mapping = dict(zip(encoded, decoded))

	sign = +1
	stringmode = False
	stringparts = []

	output = {}

	activeobject = output
	parentchain = []

	keyparts = ''
	valueparts = ''

	key = None

	ending = set(encoded)

	i = 1
	l = len(data) - 1 # stripping starting, ending {}
	while i != l: # stripping {}
		# -, {, }, ' are special.

		ch = data[i]
		i += 1

		if ch == "'":
			if stringmode:
				# end of string mode
				stringmode = False
				key = ''.join(stringparts)
			else:
				# start of string mode
				stringmode = True
				stringparts = []
		elif stringmode == True:
			#print("Adding %s to stringpart" % ch)
			stringparts.append(ch)

		elif ch == '{':
			# start of object
			parentchain.append( [activeobject, key] )
			activeobject = {}
			key = None
			#DEBUG = True
		elif ch == '}':
			# end of object
			parent, key = parentchain.pop()
			parent[key] = activeobject
			key = None
			activeobject = parent
			#DEBUG = False

		elif ch == '-':
			sign = -1
		else:
			# must be number
			if key == None:
				#debug("In Key. It is '%s', ch is '%s'" % (keyparts, ch))
				if ch in ending:
					#debug("End of key")
					keyparts += mapping[ch]
					key = int(keyparts, 16) * sign
					sign = +1
					keyparts = ''
				else:
					keyparts += ch
			else:
				#debug("In value. It is '%s', ch is '%s'" % (valueparts, ch))
				if ch in ending:
					#debug("End of value")
					valueparts += mapping[ch]
					activeobject[key] = int(valueparts, 16) * sign
					sign = +1
					key = None
					valueparts = ''
				else:
					valueparts += ch

			#debug(activeobject)

	return output

*/

/**
Uncompresses data compressed into custom, base16-like format. 
@public
@function
@param
@returns {Type}
*/
var uncompress = function(data){

	var decoded = '0123456789abcdef'
	, encoded = 'klmnopqrstuvwxyz'
	, mapping = {}

	for (var i = 0; i < encoded.length; i++){
		mapping[encoded[i]] = decoded[i]
	}

	var undef
	, output = {}
	, sign = 1
	, stringparts // undef. will be [] in string mode
	
	, activeobject = output
	, parentchain = []
	, parent_key_pair
	, keyparts = ''
	, valueparts = ''
	, key // undef. will be Truthy when Key is resolved.
	, datalen = data.length - 1 // stripping ending }
	, ch

	i = 1 // stripping starting {
	
	while (i != datalen){
		// - { } ' are special.

		ch = data[i]
		i += 1

		if (ch == "'"){
			if (stringparts){
				// end of string mode
				key = stringparts.join('')
				stringparts = undef				
			} else {
				// start of string mode
				stringparts = []				
			}
		} else if (stringparts){
			stringparts.push(ch)
		} else if (ch == '{'){
			// start of object
			parentchain.push( [activeobject, key] )
			activeobject = {}
			key = undef
		} else if (ch == '}'){
			// end of object
			parent_key_pair = parentchain.pop()
			parent_key_pair[0][parent_key_pair[1]] = activeobject
			key = undef
			activeobject = parent_key_pair[0]
		} else if (ch == '-'){
			sign = -1
		} else {
			// must be number
			if (key === undef) {
				if (mapping.hasOwnProperty(ch)){
					keyparts += mapping[ch]
					key = parseInt(keyparts, 16) * sign
					sign = +1
					keyparts = ''
				} else {
					keyparts += ch
				}
			} else {
				if (mapping.hasOwnProperty(ch)){
					valueparts += mapping[ch]
					activeobject[key] = parseInt(valueparts, 16) * sign
					sign = +1
					key = undef
					valueparts = ''
				} else {
					valueparts += ch					
				}
			}
		}
	} // end while

	return output
}

// encoding = 'Unicode' 
// NOT UTF8, NOT UTF16BE/LE, NOT UCS2BE/LE. NO clever BOM behavior
// Actual 16bit char codes used.
// no multi-byte logic here

// Unicode characters to WinAnsiEncoding:
// {402: 131, 8211: 150, 8212: 151, 8216: 145, 8217: 146, 8218: 130, 8220: 147, 8221: 148, 8222: 132, 8224: 134, 8225: 135, 8226: 149, 8230: 133, 8364: 128, 8240:137, 8249: 139, 8250: 155, 710: 136, 8482: 153, 338: 140, 339: 156, 732: 152, 352: 138, 353: 154, 376: 159, 381: 142, 382: 158}
// as you can see, all Unicode chars are outside of 0-255 range. No char code conflicts.
// this means that you can give Win cp1252 encoded strings to jsPDF for rendering directly
// as well as give strings with some (supported by these fonts) Unicode characters and 
// these will be mapped to win cp1252 
// for example, you can send char code (cp1252) 0x80 or (unicode) 0x20AC, getting "Euro" glyph displayed in both cases.

var encodingBlock = {
	'codePages': ['WinAnsiEncoding']
	, 'WinAnsiEncoding': uncompress("{19m8n201n9q201o9r201s9l201t9m201u8m201w9n201x9o201y8o202k8q202l8r202m9p202q8p20aw8k203k8t203t8v203u9v2cq8s212m9t15m8w15n9w2dw9s16k8u16l9u17s9z17x8y17y9y}")
}
, encodings = {'Unicode':{
	'Courier': encodingBlock
	, 'Courier-Bold': encodingBlock
	, 'Courier-BoldOblique': encodingBlock
	, 'Courier-Oblique': encodingBlock
	, 'Helvetica': encodingBlock
	, 'Helvetica-Bold': encodingBlock
	, 'Helvetica-BoldOblique': encodingBlock
	, 'Helvetica-Oblique': encodingBlock
	, 'Times-Roman': encodingBlock
	, 'Times-Bold': encodingBlock
	, 'Times-BoldItalic': encodingBlock
	, 'Times-Italic': encodingBlock
//	, 'Symbol'
//	, 'ZapfDingbats'
}}
/** 
Resources:
Font metrics data is reprocessed derivative of contents of
"Font Metrics for PDF Core 14 Fonts" package, which exhibits the following copyright and license:

Copyright (c) 1989, 1990, 1991, 1992, 1993, 1997 Adobe Systems Incorporated. All Rights Reserved.

This file and the 14 PostScript(R) AFM files it accompanies may be used,
copied, and distributed for any purpose and without charge, with or without
modification, provided that all copyright notices are retained; that the AFM
files are not distributed without this file; that all modifications to this
file or any of the AFM files are prominently noted in the modified file(s);
and that this paragraph is not modified. Adobe Systems has no responsibility
or obligation to support the use of the AFM files.

*/
, fontMetrics = {'Unicode':{
	// all sizing numbers are n/fontMetricsFractionOf = one font size unit
	// this means that if fontMetricsFractionOf = 1000, and letter A's width is 476, it's
	// width is 476/1000 or 47.6% of its height (regardless of font size)
	// At this time this value applies to "widths" and "kerning" numbers.

	// char code 0 represents "default" (average) width - use it for chars missing in this table.
	// key 'fof' represents the "fontMetricsFractionOf" value

	'Courier-Oblique': uncompress("{'widths'{k3w'fof'6o}'kerning'{'fof'-6o}}")
	, 'Times-BoldItalic': uncompress("{'widths'{k3o2q4ycx2r201n3m201o6o201s2l201t2l201u2l201w3m201x3m201y3m2k1t2l2r202m2n2n3m2o3m2p5n202q6o2r1w2s2l2t2l2u3m2v3t2w1t2x2l2y1t2z1w3k3m3l3m3m3m3n3m3o3m3p3m3q3m3r3m3s3m203t2l203u2l3v2l3w3t3x3t3y3t3z3m4k5n4l4m4m4m4n4m4o4s4p4m4q4m4r4s4s4y4t2r4u3m4v4m4w3x4x5t4y4s4z4s5k3x5l4s5m4m5n3r5o3x5p4s5q4m5r5t5s4m5t3x5u3x5v2l5w1w5x2l5y3t5z3m6k2l6l3m6m3m6n2w6o3m6p2w6q2l6r3m6s3r6t1w6u1w6v3m6w1w6x4y6y3r6z3m7k3m7l3m7m2r7n2r7o1w7p3r7q2w7r4m7s3m7t2w7u2r7v2n7w1q7x2n7y3t202l3mcl4mal2ram3man3mao3map3mar3mas2lat4uau1uav3maw3way4uaz2lbk2sbl3t'fof'6obo2lbp3tbq3mbr1tbs2lbu1ybv3mbz3mck4m202k3mcm4mcn4mco4mcp4mcq5ycr4mcs4mct4mcu4mcv4mcw2r2m3rcy2rcz2rdl4sdm4sdn4sdo4sdp4sdq4sds4sdt4sdu4sdv4sdw4sdz3mek3mel3mem3men3meo3mep3meq4ser2wes2wet2weu2wev2wew1wex1wey1wez1wfl3rfm3mfn3mfo3mfp3mfq3mfr3tfs3mft3rfu3rfv3rfw3rfz2w203k6o212m6o2dw2l2cq2l3t3m3u2l17s3x19m3m}'kerning'{cl{4qu5kt5qt5rs17ss5ts}201s{201ss}201t{cks4lscmscnscoscpscls2wu2yu201ts}201x{2wu2yu}2k{201ts}2w{4qx5kx5ou5qx5rs17su5tu}2x{17su5tu5ou}2y{4qx5kx5ou5qx5rs17ss5ts}'fof'-6ofn{17sw5tw5ou5qw5rs}7t{cksclscmscnscoscps4ls}3u{17su5tu5os5qs}3v{17su5tu5os5qs}7p{17su5tu}ck{4qu5kt5qt5rs17ss5ts}4l{4qu5kt5qt5rs17ss5ts}cm{4qu5kt5qt5rs17ss5ts}cn{4qu5kt5qt5rs17ss5ts}co{4qu5kt5qt5rs17ss5ts}cp{4qu5kt5qt5rs17ss5ts}6l{4qu5ou5qw5rt17su5tu}5q{ckuclucmucnucoucpu4lu}5r{ckuclucmucnucoucpu4lu}7q{cksclscmscnscoscps4ls}6p{4qu5ou5qw5rt17sw5tw}ek{4qu5ou5qw5rt17su5tu}el{4qu5ou5qw5rt17su5tu}em{4qu5ou5qw5rt17su5tu}en{4qu5ou5qw5rt17su5tu}eo{4qu5ou5qw5rt17su5tu}ep{4qu5ou5qw5rt17su5tu}es{17ss5ts5qs4qu}et{4qu5ou5qw5rt17sw5tw}eu{4qu5ou5qw5rt17ss5ts}ev{17ss5ts5qs4qu}6z{17sw5tw5ou5qw5rs}fm{17sw5tw5ou5qw5rs}7n{201ts}fo{17sw5tw5ou5qw5rs}fp{17sw5tw5ou5qw5rs}fq{17sw5tw5ou5qw5rs}7r{cksclscmscnscoscps4ls}fs{17sw5tw5ou5qw5rs}ft{17su5tu}fu{17su5tu}fv{17su5tu}fw{17su5tu}fz{cksclscmscnscoscps4ls}}}")
	, 'Helvetica-Bold': uncompress("{'widths'{k3s2q4scx1w201n3r201o6o201s1w201t1w201u1w201w3m201x3m201y3m2k1w2l2l202m2n2n3r2o3r2p5t202q6o2r1s2s2l2t2l2u2r2v3u2w1w2x2l2y1w2z1w3k3r3l3r3m3r3n3r3o3r3p3r3q3r3r3r3s3r203t2l203u2l3v2l3w3u3x3u3y3u3z3x4k6l4l4s4m4s4n4s4o4s4p4m4q3x4r4y4s4s4t1w4u3r4v4s4w3x4x5n4y4s4z4y5k4m5l4y5m4s5n4m5o3x5p4s5q4m5r5y5s4m5t4m5u3x5v2l5w1w5x2l5y3u5z3r6k2l6l3r6m3x6n3r6o3x6p3r6q2l6r3x6s3x6t1w6u1w6v3r6w1w6x5t6y3x6z3x7k3x7l3x7m2r7n3r7o2l7p3x7q3r7r4y7s3r7t3r7u3m7v2r7w1w7x2r7y3u202l3rcl4sal2lam3ran3rao3rap3rar3ras2lat4tau2pav3raw3uay4taz2lbk2sbl3u'fof'6obo2lbp3xbq3rbr1wbs2lbu2obv3rbz3xck4s202k3rcm4scn4sco4scp4scq6ocr4scs4mct4mcu4mcv4mcw1w2m2zcy1wcz1wdl4sdm4ydn4ydo4ydp4ydq4yds4ydt4sdu4sdv4sdw4sdz3xek3rel3rem3ren3reo3rep3req5ter3res3ret3reu3rev3rew1wex1wey1wez1wfl3xfm3xfn3xfo3xfp3xfq3xfr3ufs3xft3xfu3xfv3xfw3xfz3r203k6o212m6o2dw2l2cq2l3t3r3u2l17s4m19m3r}'kerning'{cl{4qs5ku5ot5qs17sv5tv}201t{2ww4wy2yw}201w{2ks}201x{2ww4wy2yw}2k{201ts201xs}2w{7qs4qu5kw5os5qw5rs17su5tu7tsfzs}2x{5ow5qs}2y{7qs4qu5kw5os5qw5rs17su5tu7tsfzs}'fof'-6o7p{17su5tu5ot}ck{4qs5ku5ot5qs17sv5tv}4l{4qs5ku5ot5qs17sv5tv}cm{4qs5ku5ot5qs17sv5tv}cn{4qs5ku5ot5qs17sv5tv}co{4qs5ku5ot5qs17sv5tv}cp{4qs5ku5ot5qs17sv5tv}6l{17st5tt5os}17s{2kwclvcmvcnvcovcpv4lv4wwckv}5o{2kucltcmtcntcotcpt4lt4wtckt}5q{2ksclscmscnscoscps4ls4wvcks}5r{2ks4ws}5t{2kwclvcmvcnvcovcpv4lv4wwckv}eo{17st5tt5os}fu{17su5tu5ot}6p{17ss5ts}ek{17st5tt5os}el{17st5tt5os}em{17st5tt5os}en{17st5tt5os}6o{201ts}ep{17st5tt5os}es{17ss5ts}et{17ss5ts}eu{17ss5ts}ev{17ss5ts}6z{17su5tu5os5qt}fm{17su5tu5os5qt}fn{17su5tu5os5qt}fo{17su5tu5os5qt}fp{17su5tu5os5qt}fq{17su5tu5os5qt}fs{17su5tu5os5qt}ft{17su5tu5ot}7m{5os}fv{17su5tu5ot}fw{17su5tu5ot}}}")
	, 'Courier': uncompress("{'widths'{k3w'fof'6o}'kerning'{'fof'-6o}}")
	, 'Courier-BoldOblique': uncompress("{'widths'{k3w'fof'6o}'kerning'{'fof'-6o}}")
	, 'Times-Bold': uncompress("{'widths'{k3q2q5ncx2r201n3m201o6o201s2l201t2l201u2l201w3m201x3m201y3m2k1t2l2l202m2n2n3m2o3m2p6o202q6o2r1w2s2l2t2l2u3m2v3t2w1t2x2l2y1t2z1w3k3m3l3m3m3m3n3m3o3m3p3m3q3m3r3m3s3m203t2l203u2l3v2l3w3t3x3t3y3t3z3m4k5x4l4s4m4m4n4s4o4s4p4m4q3x4r4y4s4y4t2r4u3m4v4y4w4m4x5y4y4s4z4y5k3x5l4y5m4s5n3r5o4m5p4s5q4s5r6o5s4s5t4s5u4m5v2l5w1w5x2l5y3u5z3m6k2l6l3m6m3r6n2w6o3r6p2w6q2l6r3m6s3r6t1w6u2l6v3r6w1w6x5n6y3r6z3m7k3r7l3r7m2w7n2r7o2l7p3r7q3m7r4s7s3m7t3m7u2w7v2r7w1q7x2r7y3o202l3mcl4sal2lam3man3mao3map3mar3mas2lat4uau1yav3maw3tay4uaz2lbk2sbl3t'fof'6obo2lbp3rbr1tbs2lbu2lbv3mbz3mck4s202k3mcm4scn4sco4scp4scq6ocr4scs4mct4mcu4mcv4mcw2r2m3rcy2rcz2rdl4sdm4ydn4ydo4ydp4ydq4yds4ydt4sdu4sdv4sdw4sdz3rek3mel3mem3men3meo3mep3meq4ser2wes2wet2weu2wev2wew1wex1wey1wez1wfl3rfm3mfn3mfo3mfp3mfq3mfr3tfs3mft3rfu3rfv3rfw3rfz3m203k6o212m6o2dw2l2cq2l3t3m3u2l17s4s19m3m}'kerning'{cl{4qt5ks5ot5qy5rw17sv5tv}201t{cks4lscmscnscoscpscls4wv}2k{201ts}2w{4qu5ku7mu5os5qx5ru17su5tu}2x{17su5tu5ou5qs}2y{4qv5kv7mu5ot5qz5ru17su5tu}'fof'-6o7t{cksclscmscnscoscps4ls}3u{17su5tu5os5qu}3v{17su5tu5os5qu}fu{17su5tu5ou5qu}7p{17su5tu5ou5qu}ck{4qt5ks5ot5qy5rw17sv5tv}4l{4qt5ks5ot5qy5rw17sv5tv}cm{4qt5ks5ot5qy5rw17sv5tv}cn{4qt5ks5ot5qy5rw17sv5tv}co{4qt5ks5ot5qy5rw17sv5tv}cp{4qt5ks5ot5qy5rw17sv5tv}6l{17st5tt5ou5qu}17s{ckuclucmucnucoucpu4lu4wu}5o{ckuclucmucnucoucpu4lu4wu}5q{ckzclzcmzcnzcozcpz4lz4wu}5r{ckxclxcmxcnxcoxcpx4lx4wu}5t{ckuclucmucnucoucpu4lu4wu}7q{ckuclucmucnucoucpu4lu}6p{17sw5tw5ou5qu}ek{17st5tt5qu}el{17st5tt5ou5qu}em{17st5tt5qu}en{17st5tt5qu}eo{17st5tt5qu}ep{17st5tt5ou5qu}es{17ss5ts5qu}et{17sw5tw5ou5qu}eu{17sw5tw5ou5qu}ev{17ss5ts5qu}6z{17sw5tw5ou5qu5rs}fm{17sw5tw5ou5qu5rs}fn{17sw5tw5ou5qu5rs}fo{17sw5tw5ou5qu5rs}fp{17sw5tw5ou5qu5rs}fq{17sw5tw5ou5qu5rs}7r{cktcltcmtcntcotcpt4lt5os}fs{17sw5tw5ou5qu5rs}ft{17su5tu5ou5qu}7m{5os}fv{17su5tu5ou5qu}fw{17su5tu5ou5qu}fz{cksclscmscnscoscps4ls}}}")
	//, 'Symbol': uncompress("{'widths'{k3uaw4r19m3m2k1t2l2l202m2y2n3m2p5n202q6o3k3m2s2l2t2l2v3r2w1t3m3m2y1t2z1wbk2sbl3r'fof'6o3n3m3o3m3p3m3q3m3r3m3s3m3t3m3u1w3v1w3w3r3x3r3y3r3z2wbp3t3l3m5v2l5x2l5z3m2q4yfr3r7v3k7w1o7x3k}'kerning'{'fof'-6o}}")
	, 'Helvetica': uncompress("{'widths'{k3p2q4mcx1w201n3r201o6o201s1q201t1q201u1q201w2l201x2l201y2l2k1w2l1w202m2n2n3r2o3r2p5t202q6o2r1n2s2l2t2l2u2r2v3u2w1w2x2l2y1w2z1w3k3r3l3r3m3r3n3r3o3r3p3r3q3r3r3r3s3r203t2l203u2l3v1w3w3u3x3u3y3u3z3r4k6p4l4m4m4m4n4s4o4s4p4m4q3x4r4y4s4s4t1w4u3m4v4m4w3r4x5n4y4s4z4y5k4m5l4y5m4s5n4m5o3x5p4s5q4m5r5y5s4m5t4m5u3x5v1w5w1w5x1w5y2z5z3r6k2l6l3r6m3r6n3m6o3r6p3r6q1w6r3r6s3r6t1q6u1q6v3m6w1q6x5n6y3r6z3r7k3r7l3r7m2l7n3m7o1w7p3r7q3m7r4s7s3m7t3m7u3m7v2l7w1u7x2l7y3u202l3rcl4mal2lam3ran3rao3rap3rar3ras2lat4tau2pav3raw3uay4taz2lbk2sbl3u'fof'6obo2lbp3rbr1wbs2lbu2obv3rbz3xck4m202k3rcm4mcn4mco4mcp4mcq6ocr4scs4mct4mcu4mcv4mcw1w2m2ncy1wcz1wdl4sdm4ydn4ydo4ydp4ydq4yds4ydt4sdu4sdv4sdw4sdz3xek3rel3rem3ren3reo3rep3req5ter3mes3ret3reu3rev3rew1wex1wey1wez1wfl3rfm3rfn3rfo3rfp3rfq3rfr3ufs3xft3rfu3rfv3rfw3rfz3m203k6o212m6o2dw2l2cq2l3t3r3u1w17s4m19m3r}'kerning'{5q{4wv}cl{4qs5kw5ow5qs17sv5tv}201t{2wu4w1k2yu}201x{2wu4wy2yu}17s{2ktclucmucnu4otcpu4lu4wycoucku}2w{7qs4qz5k1m17sy5ow5qx5rsfsu5ty7tufzu}2x{17sy5ty5oy5qs}2y{7qs4qz5k1m17sy5ow5qx5rsfsu5ty7tufzu}'fof'-6o7p{17sv5tv5ow}ck{4qs5kw5ow5qs17sv5tv}4l{4qs5kw5ow5qs17sv5tv}cm{4qs5kw5ow5qs17sv5tv}cn{4qs5kw5ow5qs17sv5tv}co{4qs5kw5ow5qs17sv5tv}cp{4qs5kw5ow5qs17sv5tv}6l{17sy5ty5ow}do{17st5tt}4z{17st5tt}7s{fst}dm{17st5tt}dn{17st5tt}5o{ckwclwcmwcnwcowcpw4lw4wv}dp{17st5tt}dq{17st5tt}7t{5ow}ds{17st5tt}5t{2ktclucmucnu4otcpu4lu4wycoucku}fu{17sv5tv5ow}6p{17sy5ty5ow5qs}ek{17sy5ty5ow}el{17sy5ty5ow}em{17sy5ty5ow}en{5ty}eo{17sy5ty5ow}ep{17sy5ty5ow}es{17sy5ty5qs}et{17sy5ty5ow5qs}eu{17sy5ty5ow5qs}ev{17sy5ty5ow5qs}6z{17sy5ty5ow5qs}fm{17sy5ty5ow5qs}fn{17sy5ty5ow5qs}fo{17sy5ty5ow5qs}fp{17sy5ty5qs}fq{17sy5ty5ow5qs}7r{5ow}fs{17sy5ty5ow5qs}ft{17sv5tv5ow}7m{5ow}fv{17sv5tv5ow}fw{17sv5tv5ow}}}")
	, 'Helvetica-BoldOblique': uncompress("{'widths'{k3s2q4scx1w201n3r201o6o201s1w201t1w201u1w201w3m201x3m201y3m2k1w2l2l202m2n2n3r2o3r2p5t202q6o2r1s2s2l2t2l2u2r2v3u2w1w2x2l2y1w2z1w3k3r3l3r3m3r3n3r3o3r3p3r3q3r3r3r3s3r203t2l203u2l3v2l3w3u3x3u3y3u3z3x4k6l4l4s4m4s4n4s4o4s4p4m4q3x4r4y4s4s4t1w4u3r4v4s4w3x4x5n4y4s4z4y5k4m5l4y5m4s5n4m5o3x5p4s5q4m5r5y5s4m5t4m5u3x5v2l5w1w5x2l5y3u5z3r6k2l6l3r6m3x6n3r6o3x6p3r6q2l6r3x6s3x6t1w6u1w6v3r6w1w6x5t6y3x6z3x7k3x7l3x7m2r7n3r7o2l7p3x7q3r7r4y7s3r7t3r7u3m7v2r7w1w7x2r7y3u202l3rcl4sal2lam3ran3rao3rap3rar3ras2lat4tau2pav3raw3uay4taz2lbk2sbl3u'fof'6obo2lbp3xbq3rbr1wbs2lbu2obv3rbz3xck4s202k3rcm4scn4sco4scp4scq6ocr4scs4mct4mcu4mcv4mcw1w2m2zcy1wcz1wdl4sdm4ydn4ydo4ydp4ydq4yds4ydt4sdu4sdv4sdw4sdz3xek3rel3rem3ren3reo3rep3req5ter3res3ret3reu3rev3rew1wex1wey1wez1wfl3xfm3xfn3xfo3xfp3xfq3xfr3ufs3xft3xfu3xfv3xfw3xfz3r203k6o212m6o2dw2l2cq2l3t3r3u2l17s4m19m3r}'kerning'{cl{4qs5ku5ot5qs17sv5tv}201t{2ww4wy2yw}201w{2ks}201x{2ww4wy2yw}2k{201ts201xs}2w{7qs4qu5kw5os5qw5rs17su5tu7tsfzs}2x{5ow5qs}2y{7qs4qu5kw5os5qw5rs17su5tu7tsfzs}'fof'-6o7p{17su5tu5ot}ck{4qs5ku5ot5qs17sv5tv}4l{4qs5ku5ot5qs17sv5tv}cm{4qs5ku5ot5qs17sv5tv}cn{4qs5ku5ot5qs17sv5tv}co{4qs5ku5ot5qs17sv5tv}cp{4qs5ku5ot5qs17sv5tv}6l{17st5tt5os}17s{2kwclvcmvcnvcovcpv4lv4wwckv}5o{2kucltcmtcntcotcpt4lt4wtckt}5q{2ksclscmscnscoscps4ls4wvcks}5r{2ks4ws}5t{2kwclvcmvcnvcovcpv4lv4wwckv}eo{17st5tt5os}fu{17su5tu5ot}6p{17ss5ts}ek{17st5tt5os}el{17st5tt5os}em{17st5tt5os}en{17st5tt5os}6o{201ts}ep{17st5tt5os}es{17ss5ts}et{17ss5ts}eu{17ss5ts}ev{17ss5ts}6z{17su5tu5os5qt}fm{17su5tu5os5qt}fn{17su5tu5os5qt}fo{17su5tu5os5qt}fp{17su5tu5os5qt}fq{17su5tu5os5qt}fs{17su5tu5os5qt}ft{17su5tu5ot}7m{5os}fv{17su5tu5ot}fw{17su5tu5ot}}}")
	//, 'ZapfDingbats': uncompress("{'widths'{k4u2k1w'fof'6o}'kerning'{'fof'-6o}}")
	, 'Courier-Bold': uncompress("{'widths'{k3w'fof'6o}'kerning'{'fof'-6o}}")
	, 'Times-Italic': uncompress("{'widths'{k3n2q4ycx2l201n3m201o5t201s2l201t2l201u2l201w3r201x3r201y3r2k1t2l2l202m2n2n3m2o3m2p5n202q5t2r1p2s2l2t2l2u3m2v4n2w1t2x2l2y1t2z1w3k3m3l3m3m3m3n3m3o3m3p3m3q3m3r3m3s3m203t2l203u2l3v2l3w4n3x4n3y4n3z3m4k5w4l3x4m3x4n4m4o4s4p3x4q3x4r4s4s4s4t2l4u2w4v4m4w3r4x5n4y4m4z4s5k3x5l4s5m3x5n3m5o3r5p4s5q3x5r5n5s3x5t3r5u3r5v2r5w1w5x2r5y2u5z3m6k2l6l3m6m3m6n2w6o3m6p2w6q1w6r3m6s3m6t1w6u1w6v2w6w1w6x4s6y3m6z3m7k3m7l3m7m2r7n2r7o1w7p3m7q2w7r4m7s2w7t2w7u2r7v2s7w1v7x2s7y3q202l3mcl3xal2ram3man3mao3map3mar3mas2lat4wau1vav3maw4nay4waz2lbk2sbl4n'fof'6obo2lbp3mbq3obr1tbs2lbu1zbv3mbz3mck3x202k3mcm3xcn3xco3xcp3xcq5tcr4mcs3xct3xcu3xcv3xcw2l2m2ucy2lcz2ldl4mdm4sdn4sdo4sdp4sdq4sds4sdt4sdu4sdv4sdw4sdz3mek3mel3mem3men3meo3mep3meq4mer2wes2wet2weu2wev2wew1wex1wey1wez1wfl3mfm3mfn3mfo3mfp3mfq3mfr4nfs3mft3mfu3mfv3mfw3mfz2w203k6o212m6m2dw2l2cq2l3t3m3u2l17s3r19m3m}'kerning'{cl{5kt4qw}201s{201sw}201t{201tw2wy2yy6q-t}201x{2wy2yy}2k{201tw}2w{7qs4qy7rs5ky7mw5os5qx5ru17su5tu}2x{17ss5ts5os}2y{7qs4qy7rs5ky7mw5os5qx5ru17su5tu}'fof'-6o6t{17ss5ts5qs}7t{5os}3v{5qs}7p{17su5tu5qs}ck{5kt4qw}4l{5kt4qw}cm{5kt4qw}cn{5kt4qw}co{5kt4qw}cp{5kt4qw}6l{4qs5ks5ou5qw5ru17su5tu}17s{2ks}5q{ckvclvcmvcnvcovcpv4lv}5r{ckuclucmucnucoucpu4lu}5t{2ks}6p{4qs5ks5ou5qw5ru17su5tu}ek{4qs5ks5ou5qw5ru17su5tu}el{4qs5ks5ou5qw5ru17su5tu}em{4qs5ks5ou5qw5ru17su5tu}en{4qs5ks5ou5qw5ru17su5tu}eo{4qs5ks5ou5qw5ru17su5tu}ep{4qs5ks5ou5qw5ru17su5tu}es{5ks5qs4qs}et{4qs5ks5ou5qw5ru17su5tu}eu{4qs5ks5qw5ru17su5tu}ev{5ks5qs4qs}ex{17ss5ts5qs}6z{4qv5ks5ou5qw5ru17su5tu}fm{4qv5ks5ou5qw5ru17su5tu}fn{4qv5ks5ou5qw5ru17su5tu}fo{4qv5ks5ou5qw5ru17su5tu}fp{4qv5ks5ou5qw5ru17su5tu}fq{4qv5ks5ou5qw5ru17su5tu}7r{5os}fs{4qv5ks5ou5qw5ru17su5tu}ft{17su5tu5qs}fu{17su5tu5qs}fv{17su5tu5qs}fw{17su5tu5qs}}}")
	, 'Times-Roman': uncompress("{'widths'{k3n2q4ycx2l201n3m201o6o201s2l201t2l201u2l201w2w201x2w201y2w2k1t2l2l202m2n2n3m2o3m2p5n202q6o2r1m2s2l2t2l2u3m2v3s2w1t2x2l2y1t2z1w3k3m3l3m3m3m3n3m3o3m3p3m3q3m3r3m3s3m203t2l203u2l3v1w3w3s3x3s3y3s3z2w4k5w4l4s4m4m4n4m4o4s4p3x4q3r4r4s4s4s4t2l4u2r4v4s4w3x4x5t4y4s4z4s5k3r5l4s5m4m5n3r5o3x5p4s5q4s5r5y5s4s5t4s5u3x5v2l5w1w5x2l5y2z5z3m6k2l6l2w6m3m6n2w6o3m6p2w6q2l6r3m6s3m6t1w6u1w6v3m6w1w6x4y6y3m6z3m7k3m7l3m7m2l7n2r7o1w7p3m7q3m7r4s7s3m7t3m7u2w7v3k7w1o7x3k7y3q202l3mcl4sal2lam3man3mao3map3mar3mas2lat4wau1vav3maw3say4waz2lbk2sbl3s'fof'6obo2lbp3mbq2xbr1tbs2lbu1zbv3mbz2wck4s202k3mcm4scn4sco4scp4scq5tcr4mcs3xct3xcu3xcv3xcw2l2m2tcy2lcz2ldl4sdm4sdn4sdo4sdp4sdq4sds4sdt4sdu4sdv4sdw4sdz3mek2wel2wem2wen2weo2wep2weq4mer2wes2wet2weu2wev2wew1wex1wey1wez1wfl3mfm3mfn3mfo3mfp3mfq3mfr3sfs3mft3mfu3mfv3mfw3mfz3m203k6o212m6m2dw2l2cq2l3t3m3u1w17s4s19m3m}'kerning'{cl{4qs5ku17sw5ou5qy5rw201ss5tw201ws}201s{201ss}201t{ckw4lwcmwcnwcowcpwclw4wu201ts}2k{201ts}2w{4qs5kw5os5qx5ru17sx5tx}2x{17sw5tw5ou5qu}2y{4qs5kw5os5qx5ru17sx5tx}'fof'-6o7t{ckuclucmucnucoucpu4lu5os5rs}3u{17su5tu5qs}3v{17su5tu5qs}7p{17sw5tw5qs}ck{4qs5ku17sw5ou5qy5rw201ss5tw201ws}4l{4qs5ku17sw5ou5qy5rw201ss5tw201ws}cm{4qs5ku17sw5ou5qy5rw201ss5tw201ws}cn{4qs5ku17sw5ou5qy5rw201ss5tw201ws}co{4qs5ku17sw5ou5qy5rw201ss5tw201ws}cp{4qs5ku17sw5ou5qy5rw201ss5tw201ws}6l{17su5tu5os5qw5rs}17s{2ktclvcmvcnvcovcpv4lv4wuckv}5o{ckwclwcmwcnwcowcpw4lw4wu}5q{ckyclycmycnycoycpy4ly4wu5ms}5r{cktcltcmtcntcotcpt4lt4ws}5t{2ktclvcmvcnvcovcpv4lv4wuckv}7q{cksclscmscnscoscps4ls}6p{17su5tu5qw5rs}ek{5qs5rs}el{17su5tu5os5qw5rs}em{17su5tu5os5qs5rs}en{17su5qs5rs}eo{5qs5rs}ep{17su5tu5os5qw5rs}es{5qs}et{17su5tu5qw5rs}eu{17su5tu5qs5rs}ev{5qs}6z{17sv5tv5os5qx5rs}fm{5os5qt5rs}fn{17sv5tv5os5qx5rs}fo{17sv5tv5os5qx5rs}fp{5os5qt5rs}fq{5os5qt5rs}7r{ckuclucmucnucoucpu4lu5os}fs{17sv5tv5os5qx5rs}ft{17ss5ts5qs}fu{17sw5tw5qs}fv{17sw5tw5qs}fw{17ss5ts5qs}fz{ckuclucmucnucoucpu4lu5os5rs}}}")
	, 'Helvetica-Oblique': uncompress("{'widths'{k3p2q4mcx1w201n3r201o6o201s1q201t1q201u1q201w2l201x2l201y2l2k1w2l1w202m2n2n3r2o3r2p5t202q6o2r1n2s2l2t2l2u2r2v3u2w1w2x2l2y1w2z1w3k3r3l3r3m3r3n3r3o3r3p3r3q3r3r3r3s3r203t2l203u2l3v1w3w3u3x3u3y3u3z3r4k6p4l4m4m4m4n4s4o4s4p4m4q3x4r4y4s4s4t1w4u3m4v4m4w3r4x5n4y4s4z4y5k4m5l4y5m4s5n4m5o3x5p4s5q4m5r5y5s4m5t4m5u3x5v1w5w1w5x1w5y2z5z3r6k2l6l3r6m3r6n3m6o3r6p3r6q1w6r3r6s3r6t1q6u1q6v3m6w1q6x5n6y3r6z3r7k3r7l3r7m2l7n3m7o1w7p3r7q3m7r4s7s3m7t3m7u3m7v2l7w1u7x2l7y3u202l3rcl4mal2lam3ran3rao3rap3rar3ras2lat4tau2pav3raw3uay4taz2lbk2sbl3u'fof'6obo2lbp3rbr1wbs2lbu2obv3rbz3xck4m202k3rcm4mcn4mco4mcp4mcq6ocr4scs4mct4mcu4mcv4mcw1w2m2ncy1wcz1wdl4sdm4ydn4ydo4ydp4ydq4yds4ydt4sdu4sdv4sdw4sdz3xek3rel3rem3ren3reo3rep3req5ter3mes3ret3reu3rev3rew1wex1wey1wez1wfl3rfm3rfn3rfo3rfp3rfq3rfr3ufs3xft3rfu3rfv3rfw3rfz3m203k6o212m6o2dw2l2cq2l3t3r3u1w17s4m19m3r}'kerning'{5q{4wv}cl{4qs5kw5ow5qs17sv5tv}201t{2wu4w1k2yu}201x{2wu4wy2yu}17s{2ktclucmucnu4otcpu4lu4wycoucku}2w{7qs4qz5k1m17sy5ow5qx5rsfsu5ty7tufzu}2x{17sy5ty5oy5qs}2y{7qs4qz5k1m17sy5ow5qx5rsfsu5ty7tufzu}'fof'-6o7p{17sv5tv5ow}ck{4qs5kw5ow5qs17sv5tv}4l{4qs5kw5ow5qs17sv5tv}cm{4qs5kw5ow5qs17sv5tv}cn{4qs5kw5ow5qs17sv5tv}co{4qs5kw5ow5qs17sv5tv}cp{4qs5kw5ow5qs17sv5tv}6l{17sy5ty5ow}do{17st5tt}4z{17st5tt}7s{fst}dm{17st5tt}dn{17st5tt}5o{ckwclwcmwcnwcowcpw4lw4wv}dp{17st5tt}dq{17st5tt}7t{5ow}ds{17st5tt}5t{2ktclucmucnu4otcpu4lu4wycoucku}fu{17sv5tv5ow}6p{17sy5ty5ow5qs}ek{17sy5ty5ow}el{17sy5ty5ow}em{17sy5ty5ow}en{5ty}eo{17sy5ty5ow}ep{17sy5ty5ow}es{17sy5ty5qs}et{17sy5ty5ow5qs}eu{17sy5ty5ow5qs}ev{17sy5ty5ow5qs}6z{17sy5ty5ow5qs}fm{17sy5ty5ow5qs}fn{17sy5ty5ow5qs}fo{17sy5ty5ow5qs}fp{17sy5ty5qs}fq{17sy5ty5ow5qs}7r{5ow}fs{17sy5ty5ow5qs}ft{17sv5tv5ow}7m{5ow}fv{17sv5tv5ow}fw{17sv5tv5ow}}}")
}};

/*
This event handler is fired when a new jsPDF object is initialized
This event handler appends metrics data to standard fonts within
that jsPDF instance. The metrics are mapped over Unicode character
codes, NOT CIDs or other codes matching the StandardEncoding table of the
standard PDF fonts.
Future:
Also included is the encoding maping table, converting Unicode (UCS-2, UTF-16)
char codes to StandardEncoding character codes. The encoding table is to be used
somewhere around "pdfEscape" call.
*/

API.events.push([ 
	'addFont'
	,function(font) {
		var metrics
		, unicode_section
		, encoding = 'Unicode'
		, encodingBlock;

		metrics = fontMetrics[encoding][font.PostScriptName];
		if (metrics) {
			if (font.metadata[encoding]) {
				unicode_section = font.metadata[encoding];
			} else {
				unicode_section = font.metadata[encoding] = {};
			}

			unicode_section.widths = metrics.widths;
			unicode_section.kerning = metrics.kerning;
		}

		encodingBlock = encodings[encoding][font.PostScriptName];
		if (encodingBlock) {
			if (font.metadata[encoding]) {
				unicode_section = font.metadata[encoding];
			} else {
				unicode_section = font.metadata[encoding] = {};
			}

			unicode_section.encoding = encodingBlock;
			if (encodingBlock.codePages && encodingBlock.codePages.length) {
				font.encoding = encodingBlock.codePages[0];
			}
		}
	}
]) // end of adding event handler

})(jsPDF.API);

/** @preserve
 * jsPDF addImage plugin
 * Copyright (c) 2012 Jason Siefken, https://github.com/siefkenj/
 *               2013 Chris Dowling, https://github.com/gingerchris
 *               2013 Trinh Ho, https://github.com/ineedfat
 *               2013 Edwin Alejandro Perez, https://github.com/eaparango
 *               2013 Norah Smith, https://github.com/burnburnrocket
 *               2014 Diego Casorran, https://github.com/diegocr
 *               2014 James Robb, https://github.com/jamesbrobb
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

;(function(jsPDFAPI) {
	'use strict'

	var namespace = 'addImage_',
		supported_image_types = ['jpeg', 'jpg', 'png'];

	// Image functionality ported from pdf.js
	var putImage = function(img) {

		var objectNumber = this.internal.newObject()
		, out = this.internal.write
		, putStream = this.internal.putStream

		img['n'] = objectNumber

		out('<</Type /XObject')
		out('/Subtype /Image')
		out('/Width ' + img['w'])
		out('/Height ' + img['h'])
		if (img['cs'] === this.color_spaces.INDEXED) {
			out('/ColorSpace [/Indexed /DeviceRGB '
					// if an indexed png defines more than one colour with transparency, we've created a smask
					+ (img['pal'].length / 3 - 1) + ' ' + ('smask' in img ? objectNumber + 2 : objectNumber + 1)
					+ ' 0 R]');
		} else {
			out('/ColorSpace /' + img['cs']);
			if (img['cs'] === this.color_spaces.DEVICE_CMYK) {
				out('/Decode [1 0 1 0 1 0 1 0]');
			}
		}
		out('/BitsPerComponent ' + img['bpc']);
		if ('f' in img) {
			out('/Filter /' + img['f']);
		}
		if ('dp' in img) {
			out('/DecodeParms <<' + img['dp'] + '>>');
		}
		if ('trns' in img && img['trns'].constructor == Array) {
			var trns = '',
				i = 0,
				len = img['trns'].length;
			for (; i < len; i++)
				trns += (img['trns'][i] + ' ' + img['trns'][i] + ' ');
			out('/Mask [' + trns + ']');
		}
		if ('smask' in img) {
			out('/SMask ' + (objectNumber + 1) + ' 0 R');
		}
		out('/Length ' + img['data'].length + '>>');

		putStream(img['data']);

		out('endobj');

		// Soft mask
		if ('smask' in img) {
			var dp = '/Predictor 15 /Colors 1 /BitsPerComponent ' + img['bpc'] + ' /Columns ' + img['w'];
			var smask = {'w': img['w'], 'h': img['h'], 'cs': 'DeviceGray', 'bpc': img['bpc'], 'dp': dp, 'data': img['smask']};
			if ('f' in img)
				smask.f = img['f'];
			putImage.call(this, smask);
		}

	    //Palette
		if (img['cs'] === this.color_spaces.INDEXED) {

			this.internal.newObject();
			//out('<< /Filter / ' + img['f'] +' /Length ' + img['pal'].length + '>>');
			//putStream(zlib.compress(img['pal']));
			out('<< /Length ' + img['pal'].length + '>>');
			putStream(this.arrayBufferToBinaryString(new Uint8Array(img['pal'])));
			out('endobj');
		}
	}
	, putResourcesCallback = function() {
		var images = this.internal.collections[namespace + 'images']
		for ( var i in images ) {
			putImage.call(this, images[i])
		}
	}
	, putXObjectsDictCallback = function(){
		var images = this.internal.collections[namespace + 'images']
		, out = this.internal.write
		, image
		for (var i in images) {
			image = images[i]
			out(
				'/I' + image['i']
				, image['n']
				, '0'
				, 'R'
			)
		}
	}
	, checkCompressValue = function(value) {
		if(value && typeof value === 'string')
			value = value.toUpperCase();
		return value in jsPDFAPI.image_compression ? value : jsPDFAPI.image_compression.NONE;
	}
	, getImages = function() {
		var images = this.internal.collections[namespace + 'images'];
		//first run, so initialise stuff
		if(!images) {
			this.internal.collections[namespace + 'images'] = images = {};
			this.internal.events.subscribe('putResources', putResourcesCallback);
			this.internal.events.subscribe('putXobjectDict', putXObjectsDictCallback);
		}

		return images;
	}
	, getImageIndex = function(images) {
		var imageIndex = 0;

		if (images){
			// this is NOT the first time this method is ran on this instance of jsPDF object.
			imageIndex = Object.keys ?
			Object.keys(images).length :
			(function(o){
				var i = 0
				for (var e in o){if(o.hasOwnProperty(e)){ i++ }}
				return i
			})(images)
		}

		return imageIndex;
	}
	, notDefined = function(value) {
		return typeof value === 'undefined' || value === null;
	}
	, generateAliasFromData = function(data) {
		return typeof data === 'string' && jsPDFAPI.sHashCode(data);
	}
	, doesNotSupportImageType = function(type) {
		return supported_image_types.indexOf(type) === -1;
	}
	, processMethodNotEnabled = function(type) {
		return typeof jsPDFAPI['process' + type.toUpperCase()] !== 'function';
	}
	, isDOMElement = function(object) {
		return typeof object === 'object' && object.nodeType === 1;
	}
	, createDataURIFromElement = function(element, format, angle) {

		//if element is an image which uses data url defintion, just return the dataurl
		if (element.nodeName === 'IMG' && element.hasAttribute('src')) {
			var src = ''+element.getAttribute('src');
			if (!angle && src.indexOf('data:image/') === 0) return src;

			// only if the user doesn't care about a format
			if (!format && /\.png(?:[?#].*)?$/i.test(src)) format = 'png';
		}

		if(element.nodeName === 'CANVAS') {
			var canvas = element;
		} else {
			var canvas = document.createElement('canvas');
			canvas.width = element.clientWidth || element.width;
			canvas.height = element.clientHeight || element.height;

			var ctx = canvas.getContext('2d');
			if (!ctx) {
				throw ('addImage requires canvas to be supported by browser.');
			}
			if (angle) {
				var x, y, b, c, s, w, h, to_radians = Math.PI/180, angleInRadians;

				if (typeof angle === 'object') {
					x = angle.x;
					y = angle.y;
					b = angle.bg;
					angle = angle.angle;
				}
				angleInRadians = angle*to_radians;
				c = Math.abs(Math.cos(angleInRadians));
				s = Math.abs(Math.sin(angleInRadians));
				w = canvas.width;
				h = canvas.height;
				canvas.width = h * s + w * c;
				canvas.height = h * c + w * s;

				if (isNaN(x)) x = canvas.width / 2;
				if (isNaN(y)) y = canvas.height / 2;

				ctx.clearRect(0,0,canvas.width, canvas.height);
				ctx.fillStyle = b || 'white';
				ctx.fillRect(0, 0, canvas.width, canvas.height);
				ctx.save();
				ctx.translate(x, y);
				ctx.rotate(angleInRadians);
				ctx.drawImage(element, -(w/2), -(h/2));
				ctx.rotate(-angleInRadians);
				ctx.translate(-x, -y);
				ctx.restore();
			} else {
				ctx.drawImage(element, 0, 0, canvas.width, canvas.height);
			}
		}
		return canvas.toDataURL((''+format).toLowerCase() == 'png' ? 'image/png' : 'image/jpeg');
	}
	,checkImagesForAlias = function(alias, images) {
		var cached_info;
		if(images) {
			for(var e in images) {
				if(alias === images[e].alias) {
					cached_info = images[e];
					break;
				}
			}
		}
		return cached_info;
	}
	,determineWidthAndHeight = function(w, h, info) {
		if (!w && !h) {
			w = -96;
			h = -96;
		}
		if (w < 0) {
			w = (-1) * info['w'] * 72 / w / this.internal.scaleFactor;
		}
		if (h < 0) {
			h = (-1) * info['h'] * 72 / h / this.internal.scaleFactor;
		}
		if (w === 0) {
			w = h * info['w'] / info['h'];
		}
		if (h === 0) {
			h = w * info['h'] / info['w'];
		}

		return [w, h];
	}
	, writeImageToPDF = function(x, y, w, h, info, index, images) {
		var dims = determineWidthAndHeight.call(this, w, h, info),
			coord = this.internal.getCoordinateString,
			vcoord = this.internal.getVerticalCoordinateString;

		w = dims[0];
		h = dims[1];

		images[index] = info;

		this.internal.write(
			'q'
			, coord(w)
			, '0 0'
			, coord(h) // TODO: check if this should be shifted by vcoord
			, coord(x)
			, vcoord(y + h)
			, 'cm /I'+info['i']
			, 'Do Q'
		)
	};

	/**
	 * COLOR SPACES
	 */
	jsPDFAPI.color_spaces = {
		DEVICE_RGB:'DeviceRGB',
		DEVICE_GRAY:'DeviceGray',
		DEVICE_CMYK:'DeviceCMYK',
		CAL_GREY:'CalGray',
		CAL_RGB:'CalRGB',
		LAB:'Lab',
		ICC_BASED:'ICCBased',
		INDEXED:'Indexed',
		PATTERN:'Pattern',
		SEPERATION:'Seperation',
		DEVICE_N:'DeviceN'
	};

	/**
	 * DECODE METHODS
	 */
	jsPDFAPI.decode = {
		DCT_DECODE:'DCTDecode',
		FLATE_DECODE:'FlateDecode',
		LZW_DECODE:'LZWDecode',
		JPX_DECODE:'JPXDecode',
		JBIG2_DECODE:'JBIG2Decode',
		ASCII85_DECODE:'ASCII85Decode',
		ASCII_HEX_DECODE:'ASCIIHexDecode',
		RUN_LENGTH_DECODE:'RunLengthDecode',
		CCITT_FAX_DECODE:'CCITTFaxDecode'
	};

	/**
	 * IMAGE COMPRESSION TYPES
	 */
	jsPDFAPI.image_compression = {
		NONE: 'NONE',
		FAST: 'FAST',
		MEDIUM: 'MEDIUM',
		SLOW: 'SLOW'
	};

	jsPDFAPI.sHashCode = function(str) {
		return Array.prototype.reduce && str.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);
	};

	jsPDFAPI.isString = function(object) {
		return typeof object === 'string';
	};

	/**
	 * Strips out and returns info from a valid base64 data URI
	 * @param {String[dataURI]} a valid data URI of format 'data:[<MIME-type>][;base64],<data>'
	 * @returns an Array containing the following
	 * [0] the complete data URI
	 * [1] <MIME-type>
	 * [2] format - the second part of the mime-type i.e 'png' in 'image/png'
	 * [4] <data>
	 */
	jsPDFAPI.extractInfoFromBase64DataURI = function(dataURI) {
		return /^data:([\w]+?\/([\w]+?));base64,(.+?)$/g.exec(dataURI);
	};

	/**
	 * Check to see if ArrayBuffer is supported
	 */
	jsPDFAPI.supportsArrayBuffer = function() {
		return typeof ArrayBuffer !== 'undefined' && typeof Uint8Array !== 'undefined';
	};

	/**
	 * Tests supplied object to determine if ArrayBuffer
	 * @param {Object[object]}
	 */
	jsPDFAPI.isArrayBuffer = function(object) {
		if(!this.supportsArrayBuffer())
	        return false;
		return object instanceof ArrayBuffer;
	};

	/**
	 * Tests supplied object to determine if it implements the ArrayBufferView (TypedArray) interface
	 * @param {Object[object]}
	 */
	jsPDFAPI.isArrayBufferView = function(object) {
		if(!this.supportsArrayBuffer())
	        return false;
		if(typeof Uint32Array === 'undefined')
			return false;
		return (object instanceof Int8Array ||
				object instanceof Uint8Array ||
				(typeof Uint8ClampedArray !== 'undefined' && object instanceof Uint8ClampedArray) ||
				object instanceof Int16Array ||
				object instanceof Uint16Array ||
				object instanceof Int32Array ||
				object instanceof Uint32Array ||
				object instanceof Float32Array ||
				object instanceof Float64Array );
	};

	/**
	 * Exactly what it says on the tin
	 */
	jsPDFAPI.binaryStringToUint8Array = function(binary_string) {
		/*
		 * not sure how efficient this will be will bigger files. Is there a native method?
		 */
		var len = binary_string.length;
	    var bytes = new Uint8Array( len );
	    for (var i = 0; i < len; i++) {
	        bytes[i] = binary_string.charCodeAt(i);
	    }
	    return bytes;
	};

	/**
	 * @see this discussion
	 * http://stackoverflow.com/questions/6965107/converting-between-strings-and-arraybuffers
	 *
	 * As stated, i imagine the method below is highly inefficent for large files.
	 *
	 * Also of note from Mozilla,
	 *
	 * "However, this is slow and error-prone, due to the need for multiple conversions (especially if the binary data is not actually byte-format data, but, for example, 32-bit integers or floats)."
	 *
	 * https://developer.mozilla.org/en-US/Add-ons/Code_snippets/StringView
	 *
	 * Although i'm strugglig to see how StringView solves this issue? Doesn't appear to be a direct method for conversion?
	 *
	 * Async method using Blob and FileReader could be best, but i'm not sure how to fit it into the flow?
	 */
	jsPDFAPI.arrayBufferToBinaryString = function(buffer) {
		if('TextDecoder' in window){
			var decoder = new TextDecoder('ascii');
			return decoder.decode(buffer);
		}

		if(this.isArrayBuffer(buffer))
			buffer = new Uint8Array(buffer);

	    var binary_string = '';
	    var len = buffer.byteLength;
	    for (var i = 0; i < len; i++) {
	        binary_string += String.fromCharCode(buffer[i]);
	    }
	    return binary_string;
	    /*
	     * Another solution is the method below - convert array buffer straight to base64 and then use atob
	     */
		//return atob(this.arrayBufferToBase64(buffer));
	};

	/**
	 * Converts an ArrayBuffer directly to base64
	 *
	 * Taken from here
	 *
	 * http://jsperf.com/encoding-xhr-image-data/31
	 *
	 * Need to test if this is a better solution for larger files
	 *
	 */
	jsPDFAPI.arrayBufferToBase64 = function(arrayBuffer) {
		var base64    = ''
		var encodings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

		var bytes         = new Uint8Array(arrayBuffer)
		var byteLength    = bytes.byteLength
		var byteRemainder = byteLength % 3
		var mainLength    = byteLength - byteRemainder

		var a, b, c, d
		var chunk

		// Main loop deals with bytes in chunks of 3
		for (var i = 0; i < mainLength; i = i + 3) {
			// Combine the three bytes into a single integer
			chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2]

			// Use bitmasks to extract 6-bit segments from the triplet
			a = (chunk & 16515072) >> 18 // 16515072 = (2^6 - 1) << 18
			b = (chunk & 258048)   >> 12 // 258048   = (2^6 - 1) << 12
			c = (chunk & 4032)     >>  6 // 4032     = (2^6 - 1) << 6
			d = chunk & 63               // 63       = 2^6 - 1

			// Convert the raw binary segments to the appropriate ASCII encoding
			base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d]
		}

		// Deal with the remaining bytes and padding
		if (byteRemainder == 1) {
			chunk = bytes[mainLength]

			a = (chunk & 252) >> 2 // 252 = (2^6 - 1) << 2

			// Set the 4 least significant bits to zero
			b = (chunk & 3)   << 4 // 3   = 2^2 - 1

			base64 += encodings[a] + encodings[b] + '=='
		} else if (byteRemainder == 2) {
			chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1]

			a = (chunk & 64512) >> 10 // 64512 = (2^6 - 1) << 10
			b = (chunk & 1008)  >>  4 // 1008  = (2^6 - 1) << 4

			// Set the 2 least significant bits to zero
			c = (chunk & 15)    <<  2 // 15    = 2^4 - 1

			base64 += encodings[a] + encodings[b] + encodings[c] + '='
		}

		return base64
	};

	jsPDFAPI.createImageInfo = function(data, wd, ht, cs, bpc, f, imageIndex, alias, dp, trns, pal, smask) {
		var info = {
				alias:alias,
				w : wd,
				h : ht,
				cs : cs,
				bpc : bpc,
				i : imageIndex,
				data : data
				// n: objectNumber will be added by putImage code
			};

		if(f) info.f = f;
		if(dp) info.dp = dp;
		if(trns) info.trns = trns;
		if(pal) info.pal = pal;
		if(smask) info.smask = smask;

		return info;
	};

	jsPDFAPI.addImage = function(imageData, format, x, y, w, h, alias, compression, rotation) {
		'use strict'

		if(typeof format !== 'string') {
			var tmp = h;
			h = w;
			w = y;
			y = x;
			x = format;
			format = tmp;
		}

		if (typeof imageData === 'object' && !isDOMElement(imageData) && "imageData" in imageData) {
			var options = imageData;

			imageData = options.imageData;
			format = options.format || format;
			x = options.x || x || 0;
			y = options.y || y || 0;
			w = options.w || w;
			h = options.h || h;
			alias = options.alias || alias;
			compression = options.compression || compression;
			rotation = options.rotation || options.angle || rotation;
		}

		if (isNaN(x) || isNaN(y))
		{
			console.error('jsPDF.addImage: Invalid coordinates', arguments);
			throw new Error('Invalid coordinates passed to jsPDF.addImage');
		}

		var images = getImages.call(this), info;

		if (!(info = checkImagesForAlias(imageData, images))) {
			var dataAsBinaryString;

			if(isDOMElement(imageData))
				imageData = createDataURIFromElement(imageData, format, rotation);

			if(notDefined(alias))
				alias = generateAliasFromData(imageData);

			if (!(info = checkImagesForAlias(alias, images))) {

				if(this.isString(imageData)) {

					var base64Info = this.extractInfoFromBase64DataURI(imageData);

					if(base64Info) {

						format = base64Info[2];
						imageData = atob(base64Info[3]);//convert to binary string

					} else {

						if (imageData.charCodeAt(0) === 0x89 &&
							imageData.charCodeAt(1) === 0x50 &&
							imageData.charCodeAt(2) === 0x4e &&
							imageData.charCodeAt(3) === 0x47  )  format = 'png';
					}
				}
				format = (format || 'JPEG').toLowerCase();

				if(doesNotSupportImageType(format))
					throw new Error('addImage currently only supports formats ' + supported_image_types + ', not \''+format+'\'');

				if(processMethodNotEnabled(format))
					throw new Error('please ensure that the plugin for \''+format+'\' support is added');

				/**
				 * need to test if it's more efficent to convert all binary strings
				 * to TypedArray - or should we just leave and process as string?
				 */
				if(this.supportsArrayBuffer()) {
					// no need to convert if imageData is already uint8array
					if(!(imageData instanceof Uint8Array)){
						dataAsBinaryString = imageData;
						imageData = this.binaryStringToUint8Array(imageData);
					}
				}

				info = this['process' + format.toUpperCase()](
					imageData,
					getImageIndex(images),
					alias,
					checkCompressValue(compression),
					dataAsBinaryString
				);

				if(!info)
					throw new Error('An unkwown error occurred whilst processing the image');
			}
		}

		writeImageToPDF.call(this, x, y, w, h, info, info.i, images);

		return this
	};

	/**
	 * JPEG SUPPORT
	 **/

	//takes a string imgData containing the raw bytes of
	//a jpeg image and returns [width, height]
	//Algorithm from: http://www.64lines.com/jpeg-width-height
	var getJpegSize = function(imgData) {
		'use strict'
		var width, height, numcomponents;
		// Verify we have a valid jpeg header 0xff,0xd8,0xff,0xe0,?,?,'J','F','I','F',0x00
		if (!imgData.charCodeAt(0) === 0xff ||
			!imgData.charCodeAt(1) === 0xd8 ||
			!imgData.charCodeAt(2) === 0xff ||
			!imgData.charCodeAt(3) === 0xe0 ||
			!imgData.charCodeAt(6) === 'J'.charCodeAt(0) ||
			!imgData.charCodeAt(7) === 'F'.charCodeAt(0) ||
			!imgData.charCodeAt(8) === 'I'.charCodeAt(0) ||
			!imgData.charCodeAt(9) === 'F'.charCodeAt(0) ||
			!imgData.charCodeAt(10) === 0x00) {
				throw new Error('getJpegSize requires a binary string jpeg file')
		}
		var blockLength = imgData.charCodeAt(4)*256 + imgData.charCodeAt(5);
		var i = 4, len = imgData.length;
		while ( i < len ) {
			i += blockLength;
			if (imgData.charCodeAt(i) !== 0xff) {
				throw new Error('getJpegSize could not find the size of the image');
			}
			if (imgData.charCodeAt(i+1) === 0xc0 || //(SOF) Huffman  - Baseline DCT
			    imgData.charCodeAt(i+1) === 0xc1 || //(SOF) Huffman  - Extended sequential DCT
			    imgData.charCodeAt(i+1) === 0xc2 || // Progressive DCT (SOF2)
			    imgData.charCodeAt(i+1) === 0xc3 || // Spatial (sequential) lossless (SOF3)
			    imgData.charCodeAt(i+1) === 0xc4 || // Differential sequential DCT (SOF5)
			    imgData.charCodeAt(i+1) === 0xc5 || // Differential progressive DCT (SOF6)
			    imgData.charCodeAt(i+1) === 0xc6 || // Differential spatial (SOF7)
			    imgData.charCodeAt(i+1) === 0xc7) {
				height = imgData.charCodeAt(i+5)*256 + imgData.charCodeAt(i+6);
				width = imgData.charCodeAt(i+7)*256 + imgData.charCodeAt(i+8);
                numcomponents = imgData.charCodeAt(i+9);
				return [width, height, numcomponents];
			} else {
				i += 2;
				blockLength = imgData.charCodeAt(i)*256 + imgData.charCodeAt(i+1)
			}
		}
	}
	, getJpegSizeFromBytes = function(data) {

		var hdr = (data[0] << 8) | data[1];

		if(hdr !== 0xFFD8)
			throw new Error('Supplied data is not a JPEG');

		var len = data.length,
			block = (data[4] << 8) + data[5],
			pos = 4,
			bytes, width, height, numcomponents;

		while(pos < len) {
			pos += block;
			bytes = readBytes(data, pos);
			block = (bytes[2] << 8) + bytes[3];
			if((bytes[1] === 0xC0 || bytes[1] === 0xC2) && bytes[0] === 0xFF && block > 7) {
				bytes = readBytes(data, pos + 5);
				width = (bytes[2] << 8) + bytes[3];
				height = (bytes[0] << 8) + bytes[1];
                numcomponents = bytes[4];
				return {width:width, height:height, numcomponents: numcomponents};
			}

			pos+=2;
		}

		throw new Error('getJpegSizeFromBytes could not find the size of the image');
	}
	, readBytes = function(data, offset) {
		return data.subarray(offset, offset+ 5);
	};

	jsPDFAPI.processJPEG = function(data, index, alias, compression, dataAsBinaryString) {
		'use strict'
		var colorSpace = this.color_spaces.DEVICE_RGB,
			filter = this.decode.DCT_DECODE,
			bpc = 8,
			dims;

		if(this.isString(data)) {
			dims = getJpegSize(data);
			return this.createImageInfo(data, dims[0], dims[1], dims[3] == 1 ? this.color_spaces.DEVICE_GRAY:colorSpace, bpc, filter, index, alias);
		}

		if(this.isArrayBuffer(data))
			data = new Uint8Array(data);

		if(this.isArrayBufferView(data)) {

			dims = getJpegSizeFromBytes(data);

			// if we already have a stored binary string rep use that
			data = dataAsBinaryString || this.arrayBufferToBinaryString(data);

			return this.createImageInfo(data, dims.width, dims.height, dims.numcomponents == 1 ? this.color_spaces.DEVICE_GRAY:colorSpace, bpc, filter, index, alias);
		}

		return null;
	};

	jsPDFAPI.processJPG = function(/*data, index, alias, compression, dataAsBinaryString*/) {
		return this.processJPEG.apply(this, arguments);
	}

})(jsPDF.API);

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
	var imagenCopyLeft = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wgARCABAAEADAREAAhEBAxEB/8QAHAABAAICAwEAAAAAAAAAAAAABwUGAggAAQME/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEAMQAAAB2pIULSKOEqKRNEKDQuH0HZ8wRjKFokh6VwxLaXoNiKHUPxGMDXsdQVOx2KEIZga9jmCxLCQHpXTEtpeg2FIGhcPUyPAIxlJohQtIo4SopE0f/8QAHhAAAgIDAQEBAQAAAAAAAAAABAUCAwABBhQVERL/2gAIAQEAAQUCxk2oWQM6UwqWgzjc2GcFgfSmCyWtqGcMbMorBKKCXRq5EMuje7BH3Q5CJ2xRDMI30EpTVLKLMTpTdlMka6K4F6+mbYMAQZhIV4eIH0x7Xq76IPNG+VkHr2tS6ZEDQ438lVVCisgesqksfYpSe/ZKw7XlaB78TUu7Y40eyj/VVsL6774DVFkeopPRsZYdv1NOlD2KyRsYsQXiKYNgrAgPCTbzNoEMyLXrH5wPNBepk2WxZiUXkpTVz0Zjq5EDfKhIENJi9GXavvJdGqVsVgmMlNDOBvNGC70aaJmzjS8C5owrFqmhZXn/xAAUEQEAAAAAAAAAAAAAAAAAAABg/9oACAEDAQE/AQH/xAAUEQEAAAAAAAAAAAAAAAAAAABg/9oACAECAQE/AQH/xAAvEAACAQIDBgMJAQEAAAAAAAABAgMAERITIQQiMUFCUSOR0RAyM1JTYWJxwbHh/9oACAEBAAY/AqvIbueCDiaOBshPlT1rFlTS36iCaxZU0X5AEUMbZ6fK/rV4zZxxQ8R7DIdXOir3NfPI2rMeVXwiSXnI1WfaFv8Ajr/lWj2hL9jp/tHdy5eTrVr4JF1VhzoSDRxo69jTJfci3R/aW/xH3nNNDCxXZx2668GFpB3Arxomj/YpNnnbFCdAT00wA8VN5PSlQ+5LuH+VFi1zJbt51JGj5bOLYu1DFtV15gJ/2ljjUKi8AKaKVcSNyqWE9DEVs8jathsamw6YJNPOosWmXLY+dSSquMoL4e9C+zEDnvUrxsGRuBFNJI2FF51LMetia2dG0bDc1Nh65NPOme25LvD+0t/iJuuKaWFS2znXTprwZmj+w4VeaVpP2aXaJ1wwrqAeqmIPivup60rn3It8/vlRj4ONUbsaNtyRdGU86ADZcv02q7bOoP46ViTZ1xd21ogtmS/TWhpjkbRVHKhGNXOrt3PstILOPdccRV0XPTunHyrDnTR/Yk1hzppPsCau65Cd34+VWjF3PFzxPs//xAAlEAABAwMEAgMBAQAAAAAAAAABABEhMUFhUYGR8KGxEMHRceH/2gAIAQEAAT8hQ31TlghJo9TdGnFgHcp4i7AG4QkZa1PsjvrnLj4EkOzFkRgEk2IdThCugj60WR+Dm+SEyR0dM+CPxG02O4uhNw2xjqMJnaMejICnR+bufSaYwgR62ROTtYcjjCdiCQYHKLAP1DEd0ZMe/wAnbZBcMZJd77vxFNPef6jdQzBAbguKeOCLHknW1EQBIQbBGoghKBGJKZAuOrGqLg48NyIfwmZUSy1SlmBhAYU5pmZoIkDxkHkDhDCI9EUPsI5JGFGLDo5ogzMNDYmW8q7DoZehBcyfzZz7TzQRPfe6z1GDicZTm1GpJbUQ+zqCIfwURlRgDyf4gsGMgu99n4iij9w/s7IyyJk6MmWEuxhocIVw9Sy+DdGxpqXeqFGFIoeUIYOhZfJsiMSPsY6DQJvbqBb4ib3WSMIy3P8A2cK3DDQ3KuQ3h+EdGx37OVGnu8gY+P/aAAwDAQACAAMAAAAQgkgEAAgEggAkkkkEkggkkEAkAkkAkgEE/8QAFBEBAAAAAAAAAAAAAAAAAAAAYP/aAAgBAwEBPxAB/8QAFBEBAAAAAAAAAAAAAAAAAAAAYP/aAAgBAgEBPxAB/8QAIxABAAEDBQACAwEAAAAAAAAAAREAITFBUWFxgRChwfDxkf/aAAgBAQABPxCkwjVo835HyanpDDceQleoOKYA9x9eL7pVD3v14vup4UjS+AQe5OKTAMY5zfkPY+F0pKYkMvDL/mtXx+RvbpoMAcBUBoJDUeLY9X3WmQZYlK2QQ9p8iQhTgCfKYJyR5OKx7vslODfRraSysI8iUSLExpaTeWR8yNNUsK2xexs6FRh2dyKScQMdy60xkrVINTN+NVlvAEtTg12VaeJqfw4cE2MF9ocIpYq1zmcEOMmITsGEXAsPEiMTLSotMI6Dz7s6KlDB/lAWaD4iriELAl4XWoGFTMhcGUKawxtQgUmwH7rrSkamzGybJkdGkEZtkQQPRD7SixlpWrXLd7UELPbEEfVMmA9f4LNKRFTIBKDDeJpnfINIXQhLGklA1S7IP7jSn+Rdjw3XAatJQLXpRPBB5TNwgoWrXJZ5SMz/ALroI+qeJYXGJ2F3QoiF90VCCOoCe5NKc2bYk5dSGmyziVPIKVTdcp5ilgKlSfgs8Khw3dFcs+11waocgwmxFjozO/KrSMo4Rj3Z0VO2aAsJaeWHudKcYEdvoNUQicI0aUYGFqMR6vGQpAkSmR6YfVLcLcktEmgm5R0SgFGzF7vw0DYhCTVAcF1XlWkQVi7WnDAe5X4HsgoRrx2at2Ib1CpsDB3rejmlA4V0xGFMTVb4xGVSPLJyda3g5pMyAOPH+B7Lf4//2Q==";
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
/** @preserve
* iban.js - Javascript.
* ARHS Developments SA
* https://github.com/arhs/iban.js
* MIT License (MIT).
*********************************************************/
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['exports'], factory);
    } else if (typeof exports === 'object' && typeof exports.nodeName !== 'string') {
        // CommonJS
        factory(exports);
    } else {
        // Browser globals
        factory(root.IBAN = {});
    }
}(this, function(exports){

    // Array.prototype.map polyfill
    // code from https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/map
    if (!Array.prototype.map){
        Array.prototype.map = function(fun /*, thisArg */){
            "use strict";

            if (this === void 0 || this === null)
                throw new TypeError();

            var t = Object(this);
            var len = t.length >>> 0;
            if (typeof fun !== "function")
                throw new TypeError();

            var res = new Array(len);
            var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
            for (var i = 0; i < len; i++)
            {
                // NOTE: Absolute correctness would demand Object.defineProperty
                //       be used.  But this method is fairly new, and failure is
                //       possible only if Object.prototype or Array.prototype
                //       has a property |i| (very unlikely), so use a less-correct
                //       but more portable alternative.
                if (i in t)
                    res[i] = fun.call(thisArg, t[i], i, t);
            }

            return res;
        };
    }

    var A = 'A'.charCodeAt(0),
        Z = 'Z'.charCodeAt(0);

    /**
     * Prepare an IBAN for mod 97 computation by moving the first 4 chars to the end and transforming the letters to
     * numbers (A = 10, B = 11, ..., Z = 35), as specified in ISO13616.
     *
     * @param {string} iban the IBAN
     * @returns {string} the prepared IBAN
     */
    function iso13616Prepare(iban) {
        iban = iban.toUpperCase();
        iban = iban.substr(4) + iban.substr(0,4);

        return iban.split('').map(function(n){
            var code = n.charCodeAt(0);
            if (code >= A && code <= Z){
                // A = 10, B = 11, ... Z = 35
                return code - A + 10;
            } else {
                return n;
            }
        }).join('');
    }

    /**
     * Calculates the MOD 97 10 of the passed IBAN as specified in ISO7064.
     *
     * @param iban
     * @returns {number}
     */
    function iso7064Mod97_10(iban) {
        var remainder = iban,
            block;

        while (remainder.length > 2){
            block = remainder.slice(0, 9);
            remainder = parseInt(block, 10) % 97 + remainder.slice(block.length);
        }

        return parseInt(remainder, 10) % 97;
    }

    /**
     * Parse the BBAN structure used to configure each IBAN Specification and returns a matching regular expression.
     * A structure is composed of blocks of 3 characters (one letter and 2 digits). Each block represents
     * a logical group in the typical representation of the BBAN. For each group, the letter indicates which characters
     * are allowed in this group and the following 2-digits number tells the length of the group.
     *
     * @param {string} structure the structure to parse
     * @returns {RegExp}
     */
    function parseStructure(structure){
        // split in blocks of 3 chars
        var regex = structure.match(/(.{3})/g).map(function(block){

            // parse each structure block (1-char + 2-digits)
            var format,
                pattern = block.slice(0, 1),
                repeats = parseInt(block.slice(1), 10);

            switch (pattern){
                case "A": format = "0-9A-Za-z"; break;
                case "B": format = "0-9A-Z"; break;
                case "C": format = "A-Za-z"; break;
                case "F": format = "0-9"; break;
                case "L": format = "a-z"; break;
                case "U": format = "A-Z"; break;
                case "W": format = "0-9a-z"; break;
            }

            return '([' + format + ']{' + repeats + '})';
        });

        return new RegExp('^' + regex.join('') + '$');
    }

    /**
     * Create a new Specification for a valid IBAN number.
     *
     * @param countryCode the code of the country
     * @param length the length of the IBAN
     * @param structure the structure of the underlying BBAN (for validation and formatting)
     * @param example an example valid IBAN
     * @constructor
     */
    function Specification(countryCode, length, structure, example){

        this.countryCode = countryCode;
        this.length = length;
        this.structure = structure;
        this.example = example;
    }

    /**
     * Lazy-loaded regex (parse the structure and construct the regular expression the first time we need it for validation)
     */
    Specification.prototype._regex = function(){
        return this._cachedRegex || (this._cachedRegex = parseStructure(this.structure));
    };

    /**
     * Check if the passed iban is valid according to this specification.
     *
     * @param {String} iban the iban to validate
     * @returns {boolean} true if valid, false otherwise
     */
    Specification.prototype.isValid = function(iban){
        return this.length == iban.length && this.countryCode === iban.slice(0,2) && this._regex().test(iban.slice(4)) && iso7064Mod97_10(iso13616Prepare(iban)) == 1;
    };

    /**
     * Convert the passed IBAN to a country-specific BBAN.
     *
     * @param iban the IBAN to convert
     * @param separator the separator to use between BBAN blocks
     * @returns {string} the BBAN
     */
    Specification.prototype.toBBAN = function(iban, separator) {
        return this._regex().exec(iban.slice(4)).slice(1).join(separator);
    };

    /**
     * Convert the passed BBAN to an IBAN for this country specification.
     * Please note that <i>"generation of the IBAN shall be the exclusive responsibility of the bank/branch servicing the account"</i>.
     * This method implements the preferred algorithm described in http://en.wikipedia.org/wiki/International_Bank_Account_Number#Generating_IBAN_check_digits
     *
     * @param bban the BBAN to convert to IBAN
     * @returns {string} the IBAN
     */
    Specification.prototype.fromBBAN = function(bban) {
        if (!this.isValidBBAN(bban)){
            throw new Error('Invalid BBAN');
        }

        var remainder = iso7064Mod97_10(iso13616Prepare(this.countryCode + '00' + bban)),
            checkDigit = ('0' + (98 - remainder)).slice(-2);

        return this.countryCode + checkDigit + bban;
    };

    /**
     * Check of the passed BBAN is valid.
     * This function only checks the format of the BBAN (length and matching the letetr/number specs) but does not
     * verify the check digit.
     *
     * @param bban the BBAN to validate
     * @returns {boolean} true if the passed bban is a valid BBAN according to this specification, false otherwise
     */
    Specification.prototype.isValidBBAN = function(bban) {
        return this.length - 4 == bban.length && this._regex().test(bban);
    };

    var countries = {};

    function addSpecification(IBAN){
        countries[IBAN.countryCode] = IBAN;
    }

    addSpecification(new Specification("AD", 24, "F04F04A12",          "AD1200012030200359100100"));
    addSpecification(new Specification("AE", 23, "F03F16",             "AE070331234567890123456"));
    addSpecification(new Specification("AL", 28, "F08A16",             "AL47212110090000000235698741"));
    addSpecification(new Specification("AT", 20, "F05F11",             "AT611904300234573201"));
    addSpecification(new Specification("AZ", 28, "U04A20",             "AZ21NABZ00000000137010001944"));
    addSpecification(new Specification("BA", 20, "F03F03F08F02",       "BA391290079401028494"));
    addSpecification(new Specification("BE", 16, "F03F07F02",          "BE68539007547034"));
    addSpecification(new Specification("BG", 22, "U04F04F02A08",       "BG80BNBG96611020345678"));
    addSpecification(new Specification("BH", 22, "U04A14",             "BH67BMAG00001299123456"));
    addSpecification(new Specification("BR", 29, "F08F05F10U01A01",    "BR9700360305000010009795493P1"));
    addSpecification(new Specification("CH", 21, "F05A12",             "CH9300762011623852957"));
    addSpecification(new Specification("CR", 21, "F03F14",             "CR0515202001026284066"));
    addSpecification(new Specification("CY", 28, "F03F05A16",          "CY17002001280000001200527600"));
    addSpecification(new Specification("CZ", 24, "F04F06F10",          "CZ6508000000192000145399"));
    addSpecification(new Specification("DE", 22, "F08F10",             "DE89370400440532013000"));
    addSpecification(new Specification("DK", 18, "F04F09F01",          "DK5000400440116243"));
    addSpecification(new Specification("DO", 28, "U04F20",             "DO28BAGR00000001212453611324"));
    addSpecification(new Specification("EE", 20, "F02F02F11F01",       "EE382200221020145685"));
    addSpecification(new Specification("ES", 24, "F04F04F01F01F10",    "ES9121000418450200051332"));
    addSpecification(new Specification("FI", 18, "F06F07F01",          "FI2112345600000785"));
    addSpecification(new Specification("FO", 18, "F04F09F01",          "FO6264600001631634"));
    addSpecification(new Specification("FR", 27, "F05F05A11F02",       "FR1420041010050500013M02606"));
    addSpecification(new Specification("GB", 22, "U04F06F08",          "GB29NWBK60161331926819"));
    addSpecification(new Specification("GE", 22, "U02F16",             "GE29NB0000000101904917"));
    addSpecification(new Specification("GI", 23, "U04A15",             "GI75NWBK000000007099453"));
    addSpecification(new Specification("GL", 18, "F04F09F01",          "GL8964710001000206"));
    addSpecification(new Specification("GR", 27, "F03F04A16",          "GR1601101250000000012300695"));
    addSpecification(new Specification("GT", 28, "A04A20",             "GT82TRAJ01020000001210029690"));
    addSpecification(new Specification("HR", 21, "F07F10",             "HR1210010051863000160"));
    addSpecification(new Specification("HU", 28, "F03F04F01F15F01",    "HU42117730161111101800000000"));
    addSpecification(new Specification("IE", 22, "U04F06F08",          "IE29AIBK93115212345678"));
    addSpecification(new Specification("IL", 23, "F03F03F13",          "IL620108000000099999999"));
    addSpecification(new Specification("IS", 26, "F04F02F06F10",       "IS140159260076545510730339"));
    addSpecification(new Specification("IT", 27, "U01F05F05A12",       "IT60X0542811101000000123456"));
    addSpecification(new Specification("KW", 30, "U04A22",             "KW81CBKU0000000000001234560101"));
    addSpecification(new Specification("KZ", 20, "F03A13",             "KZ86125KZT5004100100"));
    addSpecification(new Specification("LB", 28, "F04A20",             "LB62099900000001001901229114"));
    addSpecification(new Specification("LC", 32, "U04F24",             "LC07HEMM000100010012001200013015"));
    addSpecification(new Specification("LI", 21, "F05A12",             "LI21088100002324013AA"));
    addSpecification(new Specification("LT", 20, "F05F11",             "LT121000011101001000"));
    addSpecification(new Specification("LU", 20, "F03A13",             "LU280019400644750000"));
    addSpecification(new Specification("LV", 21, "U04A13",             "LV80BANK0000435195001"));
    addSpecification(new Specification("MC", 27, "F05F05A11F02",       "MC5811222000010123456789030"));
    addSpecification(new Specification("MD", 24, "U02A18",             "MD24AG000225100013104168"));
    addSpecification(new Specification("ME", 22, "F03F13F02",          "ME25505000012345678951"));
    addSpecification(new Specification("MK", 19, "F03A10F02",          "MK07250120000058984"));
    addSpecification(new Specification("MR", 27, "F05F05F11F02",       "MR1300020001010000123456753"));
    addSpecification(new Specification("MT", 31, "U04F05A18",          "MT84MALT011000012345MTLCAST001S"));
    addSpecification(new Specification("MU", 30, "U04F02F02F12F03U03", "MU17BOMM0101101030300200000MUR"));
    addSpecification(new Specification("NL", 18, "U04F10",             "NL91ABNA0417164300"));
    addSpecification(new Specification("NO", 15, "F04F06F01",          "NO9386011117947"));
    addSpecification(new Specification("PK", 24, "U04A16",             "PK36SCBL0000001123456702"));
    addSpecification(new Specification("PL", 28, "F08F16",             "PL61109010140000071219812874"));
    addSpecification(new Specification("PS", 29, "U04A21",             "PS92PALS000000000400123456702"));
    addSpecification(new Specification("PT", 25, "F04F04F11F02",       "PT50000201231234567890154"));
    addSpecification(new Specification("RO", 24, "U04A16",             "RO49AAAA1B31007593840000"));
    addSpecification(new Specification("RS", 22, "F03F13F02",          "RS35260005601001611379"));
    addSpecification(new Specification("SA", 24, "F02A18",             "SA0380000000608010167519"));
    addSpecification(new Specification("SE", 24, "F03F16F01",          "SE4550000000058398257466"));
    addSpecification(new Specification("SI", 19, "F05F08F02",          "SI56263300012039086"));
    addSpecification(new Specification("SK", 24, "F04F06F10",          "SK3112000000198742637541"));
    addSpecification(new Specification("SM", 27, "U01F05F05A12",       "SM86U0322509800000000270100"));
    addSpecification(new Specification("ST", 25, "F08F11F02",          "ST68000100010051845310112"));
    addSpecification(new Specification("TL", 23, "F03F14F02",          "TL380080012345678910157"));
    addSpecification(new Specification("TN", 24, "F02F03F13F02",       "TN5910006035183598478831"));
    addSpecification(new Specification("TR", 26, "F05F01A16",          "TR330006100519786457841326"));
    addSpecification(new Specification("VG", 24, "U04F16",             "VG96VPVG0000012345678901"));
    addSpecification(new Specification("XK", 20, "F04F10F02",          "XK051212012345678906"));

    // Angola
    addSpecification(new Specification("AO", 25, "F21",                "AO69123456789012345678901"));
    // Burkina
    addSpecification(new Specification("BF", 27, "F23",                "BF2312345678901234567890123"));
    // Burundi
    addSpecification(new Specification("BI", 16, "F12",                "BI41123456789012"));
    // Benin
    addSpecification(new Specification("BJ", 28, "F24",                "BJ39123456789012345678901234"));
    // Ivory
    addSpecification(new Specification("CI", 28, "U01F23",             "CI17A12345678901234567890123"));
    // Cameron
    addSpecification(new Specification("CM", 27, "F23",                "CM9012345678901234567890123"));
    // Cape Verde
    addSpecification(new Specification("CV", 25, "F21",                "CV30123456789012345678901"));
    // Algeria
    addSpecification(new Specification("DZ", 24, "F20",                "DZ8612345678901234567890"));
    // Iran
    addSpecification(new Specification("IR", 26, "F22",                "IR861234568790123456789012"));
    // Jordan
    addSpecification(new Specification("JO", 30, "A04F22",             "JO15AAAA1234567890123456789012"));
    // Madagascar
    addSpecification(new Specification("MG", 27, "F23",                "MG1812345678901234567890123"));
    // Mali
    addSpecification(new Specification("ML", 28, "U01F23",             "ML15A12345678901234567890123"));
    // Mozambique
    addSpecification(new Specification("MZ", 25, "F21",                "MZ25123456789012345678901"));
    // Quatar
    addSpecification(new Specification("QA", 29, "U04A21",             "QA30AAAA123456789012345678901"));
    // Senegal
    addSpecification(new Specification("SN", 28, "U01F23",             "SN52A12345678901234567890123"));
    // Ukraine
    addSpecification(new Specification("UA", 29, "F25",                "UA511234567890123456789012345"));

    var NON_ALPHANUM = /[^a-zA-Z0-9]/g,
        EVERY_FOUR_CHARS =/(.{4})(?!$)/g;

    /**
     * Utility function to check if a variable is a String.
     *
     * @param v
     * @returns {boolean} true if the passed variable is a String, false otherwise.
     */
    function isString(v){
        return (typeof v == 'string' || v instanceof String);
    }

    /**
     * Check if an IBAN is valid.
     *
     * @param {String} iban the IBAN to validate.
     * @returns {boolean} true if the passed IBAN is valid, false otherwise
     */
    exports.isValid = function(iban){
        if (!isString(iban)){
            return false;
        }
        iban = this.electronicFormat(iban);
        var countryStructure = countries[iban.slice(0,2)];
        return !!countryStructure && countryStructure.isValid(iban);
    };

    /**
     * Convert an IBAN to a BBAN.
     *
     * @param iban
     * @param {String} [separator] the separator to use between the blocks of the BBAN, defaults to ' '
     * @returns {string|*}
     */
    exports.toBBAN = function(iban, separator){
        if (typeof separator == 'undefined'){
            separator = ' ';
        }
        iban = this.electronicFormat(iban);
        var countryStructure = countries[iban.slice(0,2)];
        if (!countryStructure) {
			
            throw new Error('No country with code ' + iban.slice(0,2));
			
        }
        return countryStructure.toBBAN(iban, separator);
    };

    /**
     * Convert the passed BBAN to an IBAN for this country specification.
     * Please note that <i>"generation of the IBAN shall be the exclusive responsibility of the bank/branch servicing the account"</i>.
     * This method implements the preferred algorithm described in http://en.wikipedia.org/wiki/International_Bank_Account_Number#Generating_IBAN_check_digits
     *
     * @param countryCode the country of the BBAN
     * @param bban the BBAN to convert to IBAN
     * @returns {string} the IBAN
     */
    exports.fromBBAN = function(countryCode, bban){
        var countryStructure = countries[countryCode];
        if (!countryStructure) {
			throw new Error('No country with code ' + countryCode);
        }
        return countryStructure.fromBBAN(this.electronicFormat(bban));
    };

    /**
     * Check the validity of the passed BBAN.
     *
     * @param countryCode the country of the BBAN
     * @param bban the BBAN to check the validity of
     */
    exports.isValidBBAN = function(countryCode, bban){
        if (!isString(bban)){
            return false;
        }
        var countryStructure = countries[countryCode];
        return countryStructure && countryStructure.isValidBBAN(this.electronicFormat(bban));
    };

    /**
     *
     * @param iban
     * @param separator
     * @returns {string}
     */
    exports.printFormat = function(iban, separator){
        if (typeof separator == 'undefined'){
            separator = ' ';
        }
        return this.electronicFormat(iban).replace(EVERY_FOUR_CHARS, "$1" + separator);
    };

    /**
     *
     * @param iban
     * @returns {string}
     */
    exports.electronicFormat = function(iban){
        return iban.replace(NON_ALPHANUM, '').toUpperCase();
    };

    /**
     * An object containing all the known IBAN specifications.
     */
    exports.countries = countries;

}));

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
							actualizaciones.anunciarError(respuesta.errorMessage);
						}else{
							actualizaciones.anunciarError("500 : Internal Server Error");
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
			actualizaciones.mensaje = (actualizaciones.mensaje === "") ? "Ha fallado la conexión con el repositorio de actualizaciones remoto:\n"  + nw.App.manifest.updates_repository + "\nInténtalo de nuevo más tarde.\n¡Gracias!" : actualizaciones.mensaje;
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




