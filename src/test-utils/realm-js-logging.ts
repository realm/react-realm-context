import Debug from 'debug';
import Realm from 'realm';

enum SyncLogLevel {
  all,
  trace,
  debug,
  detail,
  info,
  warn,
  error,
  fatal,
  off,
}

const realmDebug = Debug('realm');
if (typeof (Realm.Sync as any).setSyncLogger === 'function') {
  (Realm.Sync as any).setSyncLogger((level: number, message: string) => {
    realmDebug(`[${SyncLogLevel[level]}] ${message}`);
  });
} else {
  throw new Error('Expected Realm.Sync.setSyncLogger to be a function');
}

if (!('DEBUG' in process.env)) {
  // tslint:disable-next-line:no-console
  console.log('Run with DEBUG=realm to get Realm JS log output');
}
