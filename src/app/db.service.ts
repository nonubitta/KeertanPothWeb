// src/app/db.service.ts
import { Injectable } from '@angular/core';
import initSqlJs, { Database } from 'sql.js';

@Injectable({ providedIn: 'root' })
export class DbService {
  private db: Database | null = null;
  private readonly DB_NAME = 'BaniDBStorage';
  private readonly STORE_NAME = 'files';
  private readonly FILE_KEY = 'banidb.db3';

  async initDb(): Promise<void> {
    const SQL = await initSqlJs({
      locateFile: () => 'assets/sql-wasm.wasm'
    });

    // Try to load from IndexedDB
    let dbFile = await this.loadFromIndexedDB();

    if (!dbFile) {
      console.log('DB not found in IndexedDB, fetching from server...');
      const response = await fetch(`assets/${this.FILE_KEY}`);
      const buffer = await response.arrayBuffer();
      dbFile = new Uint8Array(buffer);
      await this.saveToIndexedDB(dbFile);
    } else {
      console.log('Loaded DB from IndexedDB');
    }

    this.db = new SQL.Database(dbFile);
  }

  query(sql: string): any[] {
    if (!this.db) throw new Error('DB not initialized');

    const result = this.db.exec(sql);
    if (result.length === 0) return [];

    const columns = result[0].columns;
    const values = result[0].values;

    return values.map(row => {
      const obj: any = {};
      row.forEach((val, i) => obj[columns[i]] = val);
      return obj;
    });
  }

  // ===== IndexedDB Helpers =====

  private saveToIndexedDB(fileData: Uint8Array): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, 1);

      request.onupgradeneeded = () => {
        request.result.createObjectStore(this.STORE_NAME);
      };

      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction(this.STORE_NAME, 'readwrite');
        tx.objectStore(this.STORE_NAME).put(fileData, this.FILE_KEY);
        tx.oncomplete = () => {
          db.close();
          resolve();
        };
        tx.onerror = () => reject(tx.error);
      };

      request.onerror = () => reject(request.error);
    });
  }

  private loadFromIndexedDB(): Promise<Uint8Array | null> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, 1);

      request.onupgradeneeded = () => {
        // No data yet
        request.result.createObjectStore(this.STORE_NAME);
      };

      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction(this.STORE_NAME, 'readonly');
        const getRequest = tx.objectStore(this.STORE_NAME).get(this.FILE_KEY);

        getRequest.onsuccess = () => {
          db.close();
          if (getRequest.result) {
            resolve(new Uint8Array(getRequest.result));
          } else {
            resolve(null);
          }
        };

        getRequest.onerror = () => reject(getRequest.error);
      };

      request.onerror = () => reject(request.error);
    });
  }
}
