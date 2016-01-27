/*!
  @title com.philips.HttpLibrary
  @version 1.5
  @author Philips
 */

// HTTP client implementation
//
// This library implements an interface for HTTP requests.
//
// Features:
//   * Basic HTTP/1.0 support
//   * Support for the following text encodings / charsets:
//     - ISO-8859-1
//     - ISO-8859-15
//     - UTF-8
//     - Windows codepage 1252
//   * HTTP proxy support
//   * XML parsing (using E4X)
//   * Chunked response decoding
//
// Not implemented:
//   * Authentication
//   * HTTP Redirects
//   * Multipart responses
//   * Keep-Alive
//   * PUT submission
//
// Exported static methods:
//
//
//   getHTTP(url, callback)    
//                  A convenience method to obtain text data from an HTTP server
//
//       Usage:
//        1. Create a callback function to handle the data.
//           This function will be called with the returned data (converted to
//           text using the text encoding specified in the HTTP response)
//           as an argument.
//
//           For example, this callback function could be:
//
//           function parseStatus(data)
//           {
//               System.print(data);
//               // do what you need to do
//           }
//
//        2. Now call getHTTP(url, callback) on your instance,
//           where url is the full URL, and callback is the above defined method.
//
//           For example:
//
//           var httpLib = com.philips.HttpLibrary;
//           httpLib.getHTTP("http://192.168.1.12/cgi-bin/status", parseStatus);
//
//
//   getHTTPBinary(url, callback)    
//                  A convenience method to obtain binary data from an HTTP server
//
//                  This method is similar to the getHTTP method,
//                  but here the callback is called with raw binary data,
//                  not converted to text.  This is useful for e.g. bitmap image data.
//
//   getHTTPXML(url, callback)    
//                  A convenience method to obtain binary data from an HTTP server
//
//                  This method is similar to the getHTTP method,
//                  but here the callback is called with a parsed XML object.
//
//       Example:
//           var httpLib = com.philips.HttpLibrary,
//               url;
//           function ParseNowPlaying(xmldata)
//           {
//              for (var item in xmldata.xml.item)
//              {
//                  // do what you need to do
//              }
//           }
//           url = "http://192.168.1.10" + 
//                 "/xbmcHttp?command=GetMediaLocation(music;" +
//                 encodeURIComponent(musicDirectoryHistory[musicDirectoryHistory.length-1]) +
//                 ")";
//           httpLib.getHTTPXML(url, ParseNowPlaying);
//
//   showHTTPImage(url, widget)
//                  A convenience method to obtain an image from an HTTP server
//                  and render it in a widget.
//
//       Usage:
//           Create a panel with a ProntoScript tag "MY_IMAGE_TAG"; the image
//           for this panel can be retrieved from an HTTP server with the following
//           script:
//
//           var httpLib = com.philips.HttpLibrary;
//           httpLib.showHTTPImage('http://myserver/image.png', 'MY_IMAGE_TAG');
//
// Exported static properies:
//
//   proxyHost      Host name of the HTTP proxy server to use.
//
//   proxyPort      TCP port of the HTTP proxy server to use.  Set to -1 to connect
//                  directly to the HTTP server, without using a proxy server.
//
// Exported classes:
//
//   HttpRequest    A low-level implementation of an HTTP/1.0 request, with an API
//                  similar to that of the XMLHttpRequest class found in web browsers.
//                  It can be used for more fine-grained control of the HTTP request;
//                  useful if custom request headers are needed, or if handling
//                  of non-success HTTP response codes is needed (i.e. to handle
//                  Basic HTTP authentication, cookies or HTTP redirection).
//                  Examples using this HttpRequest include the getHTTP and
//                  showHTTPImage implementations found in this library.
//
/*!
 * %created_by: ycl %
 * %version: 2 %
 * %date_created: Tue Jun 30 14:22:51 2009 %
 */

// Hints for the JSLint Code Quality Tool
/*jslint
    indent: 2,
    bitwise: false,
    regexp: false,
    nomen: false,
*/
/*global
  XML: false,
  System: false,
  TCPSocket: false,
  CF: false,
  Image: false,
*/

var com;

// Setup com.philips.HttpLibrary namespace
if (!com) { 
  com = {};
} else if (typeof com !== "object") {
  throw new Error("com already exists and is not an object");
}
if (!com.philips) {
  com.philips = {};
} else if (typeof com.philips !== "object") {
  throw new Error("com.philips already exists and is not an object");
}
if (com.philips.HttpLibrary) {
  throw new Error("com.philips.HttpLibrary already exists");
}

com.philips.HttpLibrary = {};

((function () {

  var tracing = false,
      proxyHost,
      proxyPort = -1,
      HttpError,
      READYSTATE,
      REGEXP_URI,
      REGEXP_HTTPURI,
      REGEXP_HTTPSTATUS,
      REGEXP_MIMETYPE,
      REGEXP_MIMETYPE2,
      REGEXP_CHUNKHEX,
      REGEXP_UTF8,
      ns;

  // Regular expression taken from RFC-3986, Appendix B
  REGEXP_URI = /^(([^:\/?#]+):)?(\/\/([^\/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/;
  REGEXP_HTTPURI = /^([^:]*):?(.*)/;
  REGEXP_HTTPSTATUS = /^([A-Z\/\.0-9]*) ([0-9]*) (.*)/;
  REGEXP_MIMETYPE = /([^()<>@,;:\\"\/\[\]?={}\s]*)\/([^()<>@,;:\\"\/\[\]?={}\s]*)\s*(;.*)?/;
  REGEXP_MIMETYPE2 = /\s*(\S+)=(\S+)/;
  REGEXP_CHUNKHEX = /^([A-Fa-f0-9]*).*/;
  REGEXP_UTF8 = /[\x80-\xFF]/;

  // Wrapper for System.print, to allow printing
  // longer multiline strings.
  function printLine(aText)
  {
    var lines,
        len,
        i;
    lines = aText.toString().split(/[\n\r\f]/);
    len = lines.length;
    for (i = 0; i < len; i += 1) {
      System.print(lines[i]);
    }
  }

  function trace(aTag, aArguments)
  {
    var out,
        params,
        i,
        a;
    if (tracing)
    {
      out = "TRACE: " + aTag + "(";
      if (aArguments.length > 0) {
        params = [];
        for (i = 0; i < aArguments.length; i += 1) {
          a = aArguments[i];
          if (typeof a === "string") {
            params.push("'" + a + "'");
          } else {
            params.push(a);
          }
        }
        params.concat(aArguments);
        out += params.join(",");
      }
      out += ")";
      printLine(out);
    }
  }

  // Hidden class HttpError
  HttpError = Error;
  HttpError.prototype = Error.prototype;


  // Parse URI, according to RFC-3986
  //
  //   foo://example.com:8042/over/there?name=ferret#nose
  //   \_/   \______________/\_________/ \_________/ \__/
  //    |           |            |            |        |
  // scheme     authority       path        query   fragment
  //    |   _____________________|__
  //   / \ /                        \
  //   urn:example:animal:ferret:nose
  //
  function parseUri(aURI)
  {
    var result;
    trace("parseUri", arguments);  
    result = {};
    REGEXP_URI.lastIndex = 0;
    if (aURI.match(REGEXP_URI)) {
      result.scheme = RegExp.$2;
      result.authority = RegExp.$4;
      result.path = RegExp.$5;
      result.query = RegExp.$7; 
      result.fragment = RegExp.$8; 
    }
    return  result;
  }

  // Parse an HTTP URI, defined in RFC-2616
  //
  //  http://example.com:8042/over/there?name=ferret
  //         \_________/ \__/\_____________________/
  //              |       |             |
  //            host     port      relRequestURI    fragment
  //          ____|________  ___________|____________  _|_
  //         /             \/                        \/   \
  //  http://www.example.com/cgi-bin/test.cgi?q=search#nose
  //
  function parseHttpUri(aHttpUri)
  {
    var uriParts,
        result,
        e,
        host,
        port,
        relRequestURI;
    trace("parseHttpUri", arguments);  
    uriParts = parseUri(aHttpUri);
    result = {};
    if (uriParts.scheme === "http") {
      REGEXP_HTTPURI.lastIndex = 0;
      if (uriParts.authority.match(REGEXP_HTTPURI)) {
        host = RegExp.$1;
        port = RegExp.$2;
        if (host) {
          if (host.length > 0) {
            result.host = host;
          }
        }
        result.port = (port) ? port : 80;
        relRequestURI = "/";
        if (uriParts.path) {
          if (uriParts.path.length > 0) {
            relRequestURI = uriParts.path; 
          }
        }
        if (uriParts.query) {
          relRequestURI += '?' + uriParts.query;
        }
        result.relRequestURI = relRequestURI;
        result.fragment = uriParts.fragment;
      }
    }
    return result;
  }


  // Convert a string containing windows-1252 byte values into
  // a JavaScript (unicode) string.
  function decodeCP1252(aBinary)
  {
    var result,
        plainStart,
        windows1252table,
        i,
        charCode;

    trace("decodeCP1252", arguments);
    result = "";
    plainStart = -1;
    // See:
    //  http://www.unicode.org/Public/MAPPINGS/VENDORS/MICSFT/
    //                                        WindowsBestFit/bestfit1252.txt
    // and
    //  http://www.utf8-chartable.de/
    windows1252table = {
      0x80: '\u20AC', // Euro Sign
      0x81: '\u0081',
      0x82: '\u201A', // Single Low-9 Quotation Mark
      0x83: '\u0192', // Latin Small Letter F With Hook
      0x84: '\u201E', // Double Low-9 Quotation Mark
      0x85: '\u2026', // Horizontal Ellipsis
      0x86: '\u2020', // Dagger
      0x87: '\u2021', // Double Dagger
      0x88: '\u02C6', // Modifier Letter Circumflex Accent
      0x89: '\u2030', // Per Mille Sign
      0x8a: '\u0160', // Latin Capital Letter S With Caron
      0x8b: '\u2039', // Single Left-Pointing Angle Quotation Mark
      0x8c: '\u0152', // Latin Capital Ligature Oe
      0x8d: '\u008D',
      0x8e: '\u017D', // Latin Capital Letter Z With Caron
      0x8f: '\u008F',
      0x90: '\u0090',
      0x91: '\u2018', // Left Single Quotation Mark
      0x92: '\u2019', // Right Single Quotation Mark
      0x93: '\u201C', // Left Double Quotation Mark
      0x94: '\u201D', // Right Double Quotation Mark
      0x95: '\u2022', // Bullet
      0x96: '\u2013', // En Dash
      0x97: '\u2014', // Em Dash
      0x98: '\u02DC', // Small Tilde
      0x99: '\u2122', // Trade Mark Sign
      0x9a: '\u0161', // Latin Small Letter S With Caron
      0x9b: '\u203A', // Single Right-Pointing Angle Quotation Mark
      0x9c: '\u0153', // Latin Small Ligature Oe
      0x9d: '\u009D',
      0x9e: '\u017E', // Latin Small Letter Z With Caron
      0x9f: '\u0178'  // Latin Capital Letter Y With Diaeresis
    };

    for (i = 0; i < aBinary.length; i += 1) {
      charCode = aBinary.charCodeAt(i);
      if ((charCode < 0x80) || (charCode >= 0xA0)) {
        // Keep track of byte sequences which can be copied as-is,
        // to avoid unnecessary object creation.
        if (plainStart < 0) {
          plainStart = i; 
        }
      } else {
        if (plainStart >= 0) {
          result += aBinary.substring(plainStart, i);
          plainStart = -1;
        }
        result += windows1252table[charCode];
      }
    }
    if (plainStart >= 0) {
      result += aBinary.substring(plainStart);
    }
    return result;
  }

  // Convert a string containing ISO 8859-15 (Latin-9) byte values into
  // a JavaScript (unicode) string.
  function decodeISO8859_15(aBinary)
  {
    var result,
        plainStart,
        iso8859_15table,
        i,
        charCode;
    trace("decodeISO8859_15", arguments);
    result = "";
    plainStart = -1;
    iso8859_15table = {
      0xa4: '\u20AC', // Euro Sign
      0xa6: '\u0160', // Capital S Caron
      0xa8: '\u0161', // Small S Caron
      0xb4: '\u017D', // Capital Z Caron
      0xb8: '\u017E', // Small Z Caron
      0xbc: '\u0152', // Capital Ligature Oe
      0xbd: '\u0153', // Small Ligature Oe
      0xbe: '\u0178'  // Capital Y Diaeresis
    };

    for (i = 0; i < aBinary.length; i += 1) {
      charCode = aBinary.charCodeAt(i);
      if (charCode in iso8859_15table) {
        if (plainStart >= 0) {
          result += aBinary.substring(plainStart, i);
          plainStart = -1;
        }
        result += iso8859_15table[charCode];
      } else {
        // Keep track of byte sequences which can be copied as-is,
        // to avoid unnecessary object creation.
        if (plainStart < 0) {
          plainStart = i; 
        }
      } 
    }
    if (plainStart >= 0) {
      result += aBinary.substring(plainStart);
    }
    return result;
  }

  // Convert a string containing UTF-8 byte values into
  // a JavaScript (unicode) string.
  function decodeUTF8(aBinary)
  {
    var result,
        plainStart,
        i,
        found,
        charCode;
    trace("decodeUTF8", arguments);
    REGEXP_UTF8.lastIndex = 0;
    found = aBinary.search(REGEXP_UTF8);
    if (found < 0) {
      return aBinary;
    }
    result = "";
    plainStart = 0;
    i = 0;
    for (; found >= 0; found = aBinary.substr(i).search(REGEXP_UTF8)) {
      result += aBinary.substr(plainStart, found);
      i += found;
      charCode = aBinary.charCodeAt(i);
      if ((charCode >= 0xC0) && (charCode < 0xE0)) {
        charCode = ((charCode & 0x1f) << 6) | (aBinary.charCodeAt(i + 1) & 0x3f);
        i += 2;
      } else if (charCode < 0xF0) {
        charCode = ((charCode & 0x0f) << 12) |
                   ((aBinary.charCodeAt(i + 1) & 0x3f) << 6) |
                   (aBinary.charCodeAt(i + 2) & 0x3f);
        i += 3;
      } else if (charCode < 0xF8) {
        charCode = ((charCode & 0x07) << 18) |
                   ((aBinary.charCodeAt(i + 1) & 0x3f) << 12) |
                   ((aBinary.charCodeAt(i + 2) & 0x3f) << 6) |
                   (aBinary.charCodeAt(i + 3) & 0x3f);
        i += 4;
      } else {
        throw new HttpError("Invalid UTF-8 sequence");
      }
      if (charCode < 0x10000) {
        result += String.fromCharCode(charCode);
      } else {
        // use surrogate pairs to represent high code points
        result += String.fromCharCode((charCode >> 10) | 0xD800) +
                  String.fromCharCode((charCode & 0x3FF) | 0xDC00);
      }
      plainStart = i;
    }
    result += aBinary.substring(plainStart);
    return result;
  }

  // Allowed values for HttpRequest.readyState
  READYSTATE = {
    UNINITIALIZED: 0,
    LOADING: 1,
    LOADED: 2,
    INTERACTIVE: 3,
    COMPLETED: 4
  };

  // Definition of the Philips.Pronto.HttpLibrary.HttpRequest class
  //   Similar to the XMLHttpRequest class available in Internet Explorer
  //   and Firefox
  //   See:
  //      http://www.w3.org/TR/XMLHttpRequest/
  //      https://developer.mozilla.org/en/XmlHttpRequest
  //
  //   References HTTP/1.1 standard:
  //      http://www.ietf.org/rfc/rfc2616 (HTTP/1.1)
  //
  function HttpRequest() {

    var multipart = false,
        chunked = false,
        status = -1, // HTTP response status request
        statusText = "",
        withCredentials = false,
	onconnect,
        onreadystatechange,
        readyState = READYSTATE.UNINITIALIZED,
        method,    // Method; "GET","POST","HEAD","PUT","DELETE","OPTIONS"
        port,      // TCP port
        host,      // TCP hostname
        relRequestURI, // relative request URI to use in HTTP request
        postBody,      // Body for POST request
  
        sock,          // TCP client socket

        overridingMimeType,
        charset,
  
        requestHeaders = {}, // object containing HTTP request headers
        headerData,          // byte array containing HTTP response header
        responseHeaders,     // object with HTTP response headers
        bodyData,            // byte array containing HTTP response payload
        responseText,        // text representation of bodyData

        chunkBuf,            // buffer for partial chunks
        chunkDone = false;

    function decodeResponseText()
    {
      trace("decodeResponseText", arguments);
      if (bodyData) {
        switch (charset) {
        case "utf-8":
        case "utf8":
          responseText = decodeUTF8(bodyData);
          break;
        case "windows-1252":
          responseText = decodeCP1252(bodyData);
          break;
        case "iso_8859-15": // Alias
        case "iso-8859-15": // preferred MIME name
          responseText = decodeISO8859_15(bodyData);
          break;
        // ISO-8859-1 can be mapped straight into Unicode.
        //case "iso_8859-1":  // Alias
        //case "iso-8859-1":  // preferred MIME name
        //case "latin1":      // Alias
        //case "iso-ir-100":  // Alias
        //case "l1-ir-100":   // Alias
        //case "ibm819":      // Alias
        //case "cp819":       // Alias
        //case "csISOLatin1": // Alias
        default:
          responseText = bodyData;
          break;
        }
      }
    }

    function parseHTTPHeader()
    {
      var headerLines,
          i,
          line,
          protocol,
          statusNumber,
          statusComment,
          colonIndex,
          key,
          len,
          value;
      trace("parseHTTPHeader", arguments);
      // headerData is byte array containing HTTP response header
      responseHeaders = {}; // object with HTTP headers
      headerLines = headerData.split('\r\n');
      len = headerLines.length;
      for (i = 0; i < len; i += 1) {
        line = headerLines[i];
        if (i < 1) {
          // 'line' contains something like:
          //   "HTTP/1.1 200 OK"
          REGEXP_HTTPSTATUS.lastIndex = 0;
          if (line.match(REGEXP_HTTPSTATUS)) {
            protocol = RegExp.$1;
            statusNumber = RegExp.$2;
            statusComment = RegExp.$3;
            statusText = statusNumber + " " + statusComment;
            try {
              status = parseInt(statusNumber, 10);
            } catch (ex) {
              throw new HttpError("Invalid HTTP status code: '" +
                                  statusNumber + "'");
            }
          } else {
            throw new HttpError("Invalid HTTP response: '" + line + "'");
          }
        } else {
          colonIndex = line.indexOf(':');
          key = line.substring(0, colonIndex).toUpperCase();
          value = line.substring(colonIndex + 2); // omit ': '
          responseHeaders[key] = value;
        }
      }
    }

    // Interpret the MIME type in order to know how
    // to process payload data
    //
    //  e.g. "text/plain; charset=UTF-8"
    function applyMimeType(aMimeType)
    {
      var params,
          pars,
          len,
          i,
          key,
          value;
      trace("applyMimeType", arguments);
      // regular expression matching : token "/" token *( ";" parameter )
      REGEXP_MIMETYPE.lastIndex = 0;
      if (aMimeType.match(REGEXP_MIMETYPE)) {
        params = RegExp.$3;
        if (params) {
          pars = params.split(";");
          len = pars.length;
          if (len > 0) {
            for (i = 0; i < len; i += 1) {
              REGEXP_MIMETYPE2.lastIndex = 0;
              if (pars[i].match(REGEXP_MIMETYPE2)) {
                key = RegExp.$1;
                value = RegExp.$2;
                if ((key === "charset") && (value)) {
                  charset = value.toLowerCase().replace(/"?([^"]*)"?/, "$1");
                }
              }
            }
          }
        }
      }
    }
  
    function processHTTPHeader()
    {
      var contentType;
      trace("processHTTPHeader", arguments);
      parseHTTPHeader();
      contentType = responseHeaders["CONTENT-TYPE"];
      if (overridingMimeType) {
        applyMimeType(overridingMimeType);
      } else if (contentType) {
        applyMimeType(contentType);
      }
      if (responseHeaders["TRANSFER-ENCODING"]) {
        if (responseHeaders["TRANSFER-ENCODING"] === "chunked") {
          chunked = true;
        }
      }
    }

    function setReadyState(aNewState)
    {
      trace("setReadyState", arguments);  
      if (readyState !== aNewState) {
        readyState = aNewState;
        if (onreadystatechange) {
          var evt = {}; // Stub event object
          onreadystatechange(evt);
        }
      }
    }

    function setRequestHeader(aHeader, aValue)
    {
      trace("setRequestHeader", arguments);  
      if (!(method)) {
        throw new HttpError("open() must be called before setRequestHeader()");
      }
      if (aValue) {
        requestHeaders[aHeader] = aValue.toString();
      } else {
        try {
          delete requestHeaders[aHeader];
        } catch (e) {
        }
      }
    }

    // TCPSocket callback
    function socket_Connect()
    {
      var requestText,
          h,
	  i;
      trace("socket_Connect", arguments);  
      if ((proxyHost) && (proxyPort > 0)) {
        requestText = method + " http://" + host + ":" + port + relRequestURI;
      } else {
        requestText = method + " " + relRequestURI;
      }
      requestText += " HTTP/1.0\r\n";
      setRequestHeader("Host", (port === 80) ? host : host + ":" + port);
      if (postBody)
      {
        setRequestHeader("Content-Length", postBody.length);
      }
      for (h in requestHeaders) {
        if (requestHeaders.hasOwnProperty(h)) {
          requestText += h + ": " + requestHeaders[h] + "\r\n";
        }
      }
      requestText += "\r\n";
      if (postBody) {
        requestText += postBody;
      }
      headerData = "";
      bodyData = "";
      chunkBuf = "";
      for (i = 0; i < requestText.length; i += 4096) {
	//System.print("chunk "+i);
        this.write(requestText.substring(i, i + 4096));
      }
      if (onconnect) {
        onconnect();
      }
    }

    function sendChunk(chunk)
    {
      var i;
      sock.write(chunk.length.toString(16) + "\r\n");
      for (i = 0; i < chunk.length; i += 4096) {
        sock.write(chunk.substring(i, i + 4096));
      }
      sock.write("\r\n");
    }

    // TCPSocket callback
    function socket_Close()
    {
      trace("socket_Close", arguments);  
      this.close();
      setReadyState(READYSTATE.COMPLETED);
    }

    // Add inbound body data to buffer
    function addBodyData(aData)
    {
      var headerEnd,
          chunkHeader,
          e,
          chunkLenHex,
          chunkLen;
      if (chunked) {
        if (chunkDone === false) {
          chunkBuf += aData;
        
          headerEnd = chunkBuf.indexOf('\r\n');
          while (headerEnd >= 0) {
            chunkHeader = chunkBuf.substring(0, headerEnd);
            REGEXP_CHUNKHEX.lastIndex = 0;
            if (chunkHeader.match(REGEXP_CHUNKHEX)) {
              chunkLenHex = RegExp.$1;
              chunkLen = parseInt(chunkLenHex, 16);
              if (!chunkLen) {
                chunkDone = true;
              }
              if (chunkBuf.length < headerEnd + 2 + chunkLen + 2) {
                // Re-process current chunk again when there is more
                // inbound data.
                return;
              }
              bodyData += chunkBuf.substring(headerEnd + 2,
                                             headerEnd + 2 + chunkLen);
              chunkBuf = chunkBuf.substring(headerEnd + 2 + chunkLen + 2);
            } else {
              throw new HttpError("Invalid HTTP chunk");
            }
            headerEnd = chunkBuf.indexOf('\r\n');
          }
        }
      } else {
        bodyData += aData;
      }
    }

    // TCPSocket callback
    function socket_Data()
    {
      var data,
          headerEnd,
          now;
      trace("socket_Data", arguments);  
      data = this.read();
      if (readyState < READYSTATE.LOADED) {
        // End of HTTP headers not yet reached.
        data = headerData + data;  // Prepend previous header data
        headerEnd = data.indexOf('\r\n\r\n');
        if (headerEnd >= 0) {
          // OK, found header.
          headerData = data.substring(0, headerEnd);
          processHTTPHeader();
          setReadyState(READYSTATE.LOADED);
          addBodyData(data.substring(headerEnd + 4));
          if (bodyData.length > 0) {
            setReadyState(READYSTATE.INTERACTIVE);
          }
        } else {
          // Header not yet found
          headerData = data;
        }
      } else {
        // Past headers; all inbound data is payload
        addBodyData(data);
        if (bodyData.length > 0) {
          setReadyState(READYSTATE.INTERACTIVE);
        }
      }
      now = new Date();
      this.time = now.getTime();
    }

    // TCPSocket callback
    function socket_IOError(e)
    {
      trace("socket_IOError", arguments);  
      System.print("I/O Error:" + e);
      System.print("host=" + host + ", port=" + port);
      this.close();
    }

    function abort()
    {
      trace("abort", arguments);  
      if (sock) {
        sock.close();
      }
    }

    function getAllResponseHeaders()
    {
      trace("getAllResponseHeaders", arguments);  
      return responseHeaders;
    }

    function getResponseHeader(aHeader)
    {
      trace("getResponseHeader", arguments);  
      return responseHeaders[aHeader];
    }

    function open(aMethod, aUrl, aAsync, aUser, aPassword)
    {
      var httpUri,
          n_port;
      trace("open", arguments);  
      if (method) {
        // Calling this method an already active request
        // (one for which open() or openRequest() has already been called)
        // is the equivalent of calling abort().
        return abort();
      }
      if (readyState !== READYSTATE.UNINITIALIZED) {
        throw new HttpError("HttpRequest not in UNINITIALIZED state");
      }
      if (aAsync !== true) {
        throw new HttpError("Synchroneous operation not supported");
      }
      if (aMethod) {
        method = aMethod.toString();
      } else {
        method = "GET";
      }
      if (!(aUrl)) {
        throw new HttpError("Missing URL");
      }
      httpUri = parseHttpUri(aUrl.toString());
      if (!(httpUri.host)) {
        throw new HttpError("Invalid URL: " + aUrl);
      }
      n_port = 0;
      try {
        // Symbolic port names are not supported
        n_port = parseInt(httpUri.port, 10);
      } catch (e) {
      }
      if ((n_port < 1) || (n_port > 65535)) {
        throw new HttpError("Invalid port");
      }
    
      port = n_port;
      host = httpUri.host;
      relRequestURI = httpUri.relRequestURI;
      setReadyState(READYSTATE.LOADING);
    }

    // Set the MIME type to use for interpreting the response.
    //
    // For example,
    //
    //   req.overrideMimeType("text/plain; charset=windows-1252");
    //
    // to deal with data which is actually in Windows codepage 1252,
    // but where the server does not indicate this in the HTTP
    // 'Content-Type' response header.
    function overrideMimeType(aMimeType)
    {
      trace("overrideMimeType", arguments);  
      if (status < 0) {
        throw new HttpError("overrideMimeType() must be called before send()");
      }
      if (overridingMimeType) {
        overridingMimeType = aMimeType.toString();
      } else {
        overridingMimeType = null;
      }
    }

    function send(aBody)
    {
      var now;
      trace("send", arguments);  
      // Perform send, with optional POST body
      if (!(method)) {
        throw new HttpError("open() must be called before send()");
      }
      if (readyState !== READYSTATE.LOADING) {
        throw new HttpError("HttpRequest not in LOADING state");
      }
      if (aBody) {
        postBody = aBody.toString();
      }
      sock = new TCPSocket(false);
      sock.onClose = socket_Close;
      sock.onConnect = socket_Connect;
      sock.onData = socket_Data;
      sock.onIOError = socket_IOError;
      sock.httpRequest = this;
      now = new Date();
      sock.time = now.getTime();
      if ((proxyHost) && (proxyPort > 0)) {
        sock.connect(proxyHost, proxyPort);
      } else {
        sock.connect(host, port);
      }
    }



    function get_responseBinary()
    {
      trace("get_responseBinary", arguments);  
      return bodyData;
    }

    function get_responseText()
    {
      trace("get_responseText", arguments);  
      if (!(responseText)) {
        decodeResponseText();
      }
      return responseText;
    }

    // Similar to XMLHttpRequest::responseXML, but returns
    // an E4X XML object, not a DOM XML object.
    function get_responseXML()
    {
      trace("get_responseXML", arguments);  
      return new XML(get_responseText());
    }

    function get_readyState()
    {
      trace("get_readyState", arguments);  
      return readyState;
    }

    function get_status()
    {
      trace("get_status", arguments);  
      return status;
    }

    function get_statusText()
    {
      trace("get_statusText", arguments);  
      return statusText;
    }

    function get_withCredentials()
    {
      trace("get_withCredentials", arguments);  
      return withCredentials;
    }

    function get_onreadystatechange()
    {
      trace("get_onreadystatechange", arguments);  
      return onreadystatechange;
    }

    function set_onreadystatechange(aFunction)
    {
      trace("set_onreadystatechange", arguments);  
      if (!(method)) {
        throw new HttpError(
          "open() must be called before setting onreadystatechange");
      }
      onreadystatechange = aFunction;
    }

    function set_onconnect(aFunction)
    {
      trace("set_onconnect", arguments);  
      onconnect = aFunction;	
    }

    // Public methods
    // **************
    //
    this.abort = abort;
    this.getAllResponseHeaders = getAllResponseHeaders;
    this.getResponseHeader = getResponseHeader;
    this.open = open;
    this.overrideMimeType = overrideMimeType;
    this.send = send;
    this.sendChunk = sendChunk;
    this.setRequestHeader = setRequestHeader;

    // Public instance properties
    // *****************
    //
    //multipart  TODO: IMPLEMENT ME
    this.__defineGetter__("onreadystatechange", get_onreadystatechange);
    this.__defineSetter__("onreadystatechange", set_onreadystatechange);
    this.__defineSetter__("onconnect", set_onconnect);
    this.__defineGetter__("readyState", get_readyState);
    this.__defineGetter__("responseText", get_responseText);
    this.__defineGetter__("responseBinary", get_responseBinary); // Not in XmlHttpRequest
    this.__defineGetter__("responseXML", get_responseXML);
    this.__defineGetter__("status", get_status);
    this.__defineGetter__("statusText", get_statusText);
    this.__defineGetter__("withCredentials", get_withCredentials);
  }

  // Convenience method to obtain binary data from an HTTP server
  //
  // Parameters:
  //   aUrl      HTTP URL
  //   aCallback Callback to invoke with binary data upon success
  function getHTTPBinary(aUrl, aCallback)
  {
    var req = new HttpRequest();
    req.open('GET', aUrl, true);
    req.setRequestHeader("Connection", "close");
    req.onreadystatechange = function (aEvt) {
      if (req.readyState === READYSTATE.COMPLETED) {
        if (req.status === 200) {
          if (aCallback) {
            aCallback(req.responseBinary);
          }
        } else {
          System.print("HTTP status: " + req.status);
        }
      }
    };
    req.send(null);
  }

  // Convenience method to obtain text from an HTTP server
  //
  // Parameters:
  //   aUrl      HTTP URL
  //   aCallback Callback to invoke with text data upon success
  function getHTTP(aUrl, aCallback)
  {
    var req = new HttpRequest();
    req.open('GET', aUrl, true);
    req.setRequestHeader("Connection", "close");
    req.setRequestHeader("Accept-Charset",
                         "*; q=0.2, ISO-8859-15; q=0.9, ISO-8859-1,utf-8");
    req.onreadystatechange = function (aEvt) {
      if (req.readyState === READYSTATE.COMPLETED) {
        if (req.status === 200) {
          if (aCallback) {
            aCallback(req.responseText);
          }
        } else {
          System.print("HTTP status: " + req.status);
        }
      }
    };
    req.send(null);
  }

  // Convenience method to obtain XML from an HTTP server
  //
  // Parameters:
  //   aUrl      HTTP URL
  //   aCallback Callback to invoke with XML data upon success
  function getHTTPXML(aUrl, aCallback)
  {
    var req = new HttpRequest();
    req.open('GET', aUrl, true);
    req.setRequestHeader("Accept",
                         "text/xml,application/xml,application/xhtml+xml");
    req.setRequestHeader("Connection", "close");
    req.setRequestHeader("Accept-Charset",
                         "*; q=0.2, ISO-8859-15; q=0.9, ISO-8859-1,utf-8");
    req.onreadystatechange = function (aEvt) {
      if (req.readyState === READYSTATE.COMPLETED) {
        if (req.status === 200) {
          if (aCallback) {
            aCallback(req.responseXML);
          }
        } else {
          System.print("HTTP status: " + req.status);
        }
      }
    };
    req.send(null);
  }

  // Convenience method to obtain an image from an HTTP
  // server and render it in a widget.
  //
  // Parameters:
  //   aUrl      HTTP URL of the image
  //   aWidget   Widget (or script tag of the widget) in which to set the image
  //   aIndex    Widget image index (optional, defaults to 0)
  //
  // Example usage:
  //    var httpLib = com.philips.HttpLibrary;
  //    httpLib.showHTTPImage('http://myserver/image.png', 'MY_IMAGE_TAG');
  //
  function showHTTPImage(aUrl, aWidget, aIndex)
  {
    var w,
        index = 0,
        req,
        data,
        newImage;
    if (typeof aWidget === 'string') {
      w = GUI.widget(aWidget);
    } else {
      w = aWidget;
    }
    if (aIndex) {
      index = parseInt(aIndex, 10);
    }
    req = new HttpRequest();
    req.open('GET', aUrl, true);
    req.setRequestHeader("Accept",
                         "image/*; q=0.2, image/jpeg; q=0.8, image/png");
    req.onreadystatechange = function (aEvt) {
      if (req.readyState === READYSTATE.COMPLETED) {
        if (req.status === 200) {
          data = req.responseBinary;
          newImage = new Image(data);
          w.setImage(newImage, index);
        } else {
          System.print("HTTP status: " + req.status);
        }
      }
    };
    req.send(null);
  }

  function set_proxyHost(aProxyHost)
  {
    if (aProxyHost) {
      proxyHost = aProxyHost.toString();
    } else {
      proxyHost = null;
    }
  }

  function get_proxyHost()
  {
    return proxyHost;
  }

  function set_proxyPort(aProxyPort)
  {
    proxyPort = parseInt(aProxyPort, 10);
  }

  function get_proxyPort()
  {
    return proxyPort;
  }

  // Populate namespace
  ns = com.philips.HttpLibrary;

  // Public classes
  ns.HttpRequest = HttpRequest;

  // Public static methods
  ns.parseUri = parseUri;
  ns.parseHttpUri = parseHttpUri;
  ns.getHTTP = getHTTP;
  ns.getHTTPBinary = getHTTPBinary;
  ns.getHTTPXML = getHTTPXML;
  ns.showHTTPImage = showHTTPImage;

  ns.__defineSetter__("proxyHost", set_proxyHost);
  ns.__defineGetter__("proxyHost", get_proxyHost);
  ns.__defineSetter__("proxyPort", set_proxyPort);
  ns.__defineGetter__("proxyPort", get_proxyPort);

}()));
