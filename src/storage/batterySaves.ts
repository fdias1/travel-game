import { getDb } from './idb';

export async function loadBatterySave(romId: string): Promise<Uint8Array | null> {
  const db = await getDb();
  const row = await db.get('batterySaves', romId);
  return row?.data ?? null;
}

export async function storeBatterySave(romId: string, data: Uint8Array) {
  const db = await getDb();
  await db.put('batterySaves', { romId, data, updatedAt: Date.now() }, romId);
}
