const SegfaultHandler = require('segfault-handler');
SegfaultHandler.registerHandler('crash.log');
console.log("Registered a segfault handler.");
