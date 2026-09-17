import { getDb, saveStateKey } from './idb';

export async function loadSaveStateSlot(
  romId: string,
  slot: number,
): Promise<Uint8Array | null> {
  const db = await getDb();
  const row = await db.get('saveStates', saveStateKey(romId, slot));
  return row?.data ?? null;
}

export async function storeSaveStateSlot(
  romId: string,
  slot: number,
  data: Uint8Array,
) {
  const db = await getDb();
  await db.put(
    'saveStates',
    { romId, slot, data, updatedAt: Date.now() },
    saveStateKey(romId, slot),
  );
}

export async function loadAutoSaveState(
  romId: string,
): Promise<{ name: string; data: Uint8Array } | null> {
  const db = await getDb();
  const row = await db.get('autoSaveStates', romId);
  if (!row) return null;
  return { name: row.name, data: row.data };
}

export async function storeAutoSaveState(
  romId: string,
  name: string,
  data: Uint8Array,
) {
  const db = await getDb();
  await db.put(
    'autoSaveStates',
    { romId, name, data, updatedAt: Date.now() },
    romId,
  );
}
