import * as SegfaultHandler from 'segfault-handler';
SegfaultHandler.registerHandler('crash.log');
// tslint:disable-next-line:no-console
console.log('Registered a segfault handler.');
