import { openDB, type DBSchema, type IDBPDatabase } from 'idb';

interface TravelGameDb extends DBSchema {
  batterySaves: {
    key: string;
    value: {
      romId: string;
      data: Uint8Array;
      updatedAt: number;
    };
  };
  saveStates: {
    key: string;
    value: {
      romId: string;
      slot: number;
      data: Uint8Array;
      updatedAt: number;
    };
  };
  autoSaveStates: {
    key: string;
    value: {
      romId: string;
      name: string;
      data: Uint8Array;
      updatedAt: number;
    };
  };
}

const DB_NAME = 'travel-game';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<TravelGameDb>> | null = null;

export function getDb() {
  if (!dbPromise) {
    dbPromise = openDB<TravelGameDb>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        db.createObjectStore('batterySaves');
        db.createObjectStore('saveStates');
        db.createObjectStore('autoSaveStates');
      },
    });
  }
  return dbPromise;
}

export function saveStateKey(romId: string, slot: number) {
  return `${romId}::slot-${slot}`;
}
