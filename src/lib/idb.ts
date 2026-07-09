// 최소 IndexedDB 키-값 드라이버 (외부 의존성 없음).
// storage.ts 의 StorageDriver 인터페이스와 호환된다.
// 모든 데이터는 브라우저 로컬(IndexedDB)에만 저장되며 네트워크로 나가지 않는다.

const DB_NAME = 'deskshield'
const STORE = 'kv'
const DB_VERSION = 1

let dbPromise: Promise<IDBDatabase> | null = null

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE)
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
  return dbPromise
}

function tx<T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest): Promise<T> {
  return openDB().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const t = db.transaction(STORE, mode)
        const store = t.objectStore(STORE)
        const req = fn(store)
        req.onsuccess = () => resolve(req.result as T)
        req.onerror = () => reject(req.error)
      }),
  )
}

export interface KVDriver {
  read<T>(key: string, fallback: T): Promise<T>
  write<T>(key: string, value: T): Promise<void>
  remove(key: string): Promise<void>
}

export const idbDriver: KVDriver = {
  async read<T>(key: string, fallback: T): Promise<T> {
    const v = await tx<T | undefined>('readonly', (s) => s.get(key))
    return v === undefined ? fallback : v
  },
  async write<T>(key: string, value: T): Promise<void> {
    await tx('readwrite', (s) => s.put(value, key))
  },
  async remove(key: string): Promise<void> {
    await tx('readwrite', (s) => s.delete(key))
  },
}

// IndexedDB 사용 가능 여부 (실제 열기까지 시도)
export async function idbAvailable(): Promise<boolean> {
  if (typeof indexedDB === 'undefined') return false
  try {
    await openDB()
    return true
  } catch {
    return false
  }
}
