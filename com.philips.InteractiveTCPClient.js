/*!
   @title	com.philips.InteractiveTCPClient
   @version 1.0 
   @author Philips
 */

/**
 * Usage:
 * 
 * Create a new instance of the InteractiveTCPClient Class
 *
 *   var myTCPClient = new com.philips.InteractiveTCPClient(...) 
 *
 * using the parameters described below:
 * 
 * aProcessDataCallback
 *         the function which will process the retrieved
 *         data from the socket, note that the function will
 *         be called delimiter based, i.e. when the delimiter
 *         is found in data read from the socket
 *
 * aIOErrorCallback
 *        the function which will be called when an io error occurs
 *
 * aDelimiter
 *        a string upon receipt of which the data needs to be processed
 *
 * aIP
 *        IP address of the server
 *
 * aPort
 *        TCP Port number of the server
 *
 * aComRetries
 *        Number of retries when a failure occurs
 *
 * The trace and traceHex functions are provided for debugging purposes.
 * Use System.setDebugMask(9) to use them.
 *
 */

// Hints for the JSLint Code Quality Tool
/*jslint
    indent: 3, plusplus: false
*/

var System,
    Diagnostics,
    TCPSocket,
    com;

// create the com.philips namespace
if (!com) {
   com = {};
} else if (typeof com !== "object") {
   throw new Error("com already exist and is not an object");
}
if (!com.philips) {
   com.philips = {};
} else if (typeof com.philips !== "object") {
   throw new Error("com.philips already exist and is not an object");
}

com.philips.trace = function (aMsg, aSize)
{
   if (aSize) {
      System.print(">>>>>>>>>>>>>>>>>>>>>>");
      if (aMsg.length < aSize) {
         aSize = aMsg.length;
      }
      while (aSize > 0) {
         System.print(aMsg.slice(0, 90));
         aMsg = aMsg.slice(90);
         aSize -= 90;
      }
      System.print("<<<<<<<<<<<<<<<<<<<<<<");
   } else {
      System.print(aMsg);
      if ((aMsg !== null) && (aMsg !== undefined) &&
          (aMsg.search("rror") > 0)) {
         Diagnostics.log(aMsg);
      }
   }
};

com.philips.traceHex = function (aMsg, aSize)
{
   var newStr = "",
       i;
   for (i = 0; i < aMsg.length; i++) {
      newStr += aMsg.charCodeAt(i).toString(16) + " ";
   }
   com.philips.trace(newStr, aSize);
};

// create the InteractiveTCPClient class in the com.philips namespace
com.philips.InteractiveTCPClient = function (aProcessDataCallback,
                                             aIOErrorCallback,
                                             aDelimiter,
                                             aIP, aPort, aComRetries)
{
   var that = this;
   this.delimiterSize = aDelimiter.length;
   this.delimiter = new RegExp(aDelimiter);
   this.processDataCallback = aProcessDataCallback;
   this.IOErrorCallback = aIOErrorCallback;
   this.retries = 0;
   this.ioErrorCommand = ""; //will contain the failed command
   this.socket = null;
   this.IPAddress = aIP;
   this.port = aPort;
   this.waitingForConnection = false;
   this.waitingForConnectionQueue = null;
   this.comRetries = 3;
   if (aComRetries) {
      this.comRetries = aComRetries;
   }
   
   this.checkForIOError = function ()
   {
      if (this.ioErrorCommand !== "") {
         this.initSocket(this.ioErrorCommand);
      }
   };
   
   this.checkForStalledSocket = function ()
   {
      var command;
      if (this.waitingForConnection && (this.retries > this.comRetries)) {
         com.philips.trace("Please check network parameters!");
      } else {
         this.retries++;
         command = this.waitingForConnectionQueue.shift();
         this.initSocket(command);
      }
   };
   
   this.initSocket = function (command)
   {
      try
      {
         if (this.socket) {
            this.close();
         }
         this.socket = new TCPSocket();
         this.data = "";
         this.delimiterHitIndex = -1;
         this.socket.command = command;
         this.socket.clientRef = this;
         this.socket.onConnect = this.onConnect;
         this.socket.onData = this.onData;
         this.socket.onClose = this.onClose;
         this.socket.onIOError = this.onIOError;
      } catch (e) {
         com.philips.trace("Error creating Socket in InteractiveTCPClient: " +
                           e);
      }
      try {
         this.waitingForConnection = true;
         this.socket.connect(this.IPAddress, this.port);            
      } catch (e2) {
         this.waitingForConnection = false;
         com.philips.trace("Error in execute - socket connect: " + e2);
         this.retries++;
         if (this.retries > this.comRetries) {
            com.philips.trace("Please check network parameters!");
         } else {
            this.initSocket(command);
         }
      }
   };
   
   this.onConnect = function ()
   {
      this.waitingForConnection = false;
      this.clientRef.retries = 0;
      this.clientRef.ioErrorCommand = "";
      try
      {
         this.write(this.command);
         if (this.waitingForConnectionQueue) {
            while (this.waitingForConnectionQueue.length > 0) {
               this.command = this.waitingForConnectionQueue.shift();
               this.write(this.command);
               System.delay(200);
            }
            this.waitingForConnectionQueue = null;
         }
      } catch (e) {
         com.philips.trace("onConnect error: " + e);
      }
   };
   
   this.onData = function ()
   {
      this.clientRef.retries = 0;
      this.clientRef.ioErrorCommand = "";
      try {
         this.clientRef.data += this.read();
      } catch (e) {
         com.philips.trace("Read error: " + e);
      }
      try {
         this.clientRef.delimiterHitIndex =
            this.clientRef.data.search(this.clientRef.delimiter);
         while (this.clientRef.delimiterHitIndex >= 0) 
         {
            this.clientRef.pData =
               this.clientRef.data.slice(0, this.clientRef.delimiterHitIndex);
            this.clientRef.processDataCallback.call(this.clientRef);
            //remove before and delimiter included.
            this.clientRef.data =
               this.clientRef.data.slice(this.clientRef.delimiterHitIndex +
                                         this.clientRef.delimiterSize);
            this.clientRef.delimiterHitIndex =
               this.clientRef.data.search(this.clientRef.delimiter);
         }   
      } catch (e2) {
         com.philips.trace("Error in processData callback: " + e2);
         com.philips.trace(this.clientRef.data, 1000);
      }
   };   
   this.onClose = function ()
   {
      this.clientRef.socket = null;
   };
   this.onIOError = function (error)
   {
      com.philips.trace("IOError: " + error + " - retries: " +
                        this.clientRef.retries, 500);
      this.clientRef.retries++;
      if (this.clientRef.retries < this.clientRef.comRetries) {
         this.clientRef.ioErrorCommand = this.command;
         scheduleAfter(3000, function () {
            that.checkForIOError();
         });
         com.philips.trace("ioErrorCommand = " +
                           this.clientRef.ioErrorCommand, 500);
      } else {
         com.philips.trace("IOError: " + error);
         try {
            this.clientRef.IOErrorCallback.call(this.clientRef, error);   
         } catch (e) {
            com.philips.trace("Error in calling of IOError callback: " + e);
         }   
      }
   };
      
   this.close = function ()
   {
      try {
         this.data = "";
         this.socket.clientRef = null;
         this.socket.close();
         this.socket = null;
      } catch (e) {
         com.philips.trace("Error in closing of socket: " + e);
      }
   };
   
   this.execute = function (command)
   {
      if (this.socket) {
         this.socket.command = command;
         if (this.socket.connected) {
            try {
               this.socket.write(this.socket.command);
            } catch (e) {
               this.initSocket(command);
            }
         } else {
            if (this.waitingForConnection) {
               if (this.waitingForConnectionQueue === null) {
                  this.waitingForConnectionQueue = [];
               }
               this.waitingForConnectionQueue.push(command);
               scheduleAfter(5000, function () {
                  that.checkForStalledSocket();
               });
            }
         }
      } else {
         this.initSocket(command);
      }
   };
};
