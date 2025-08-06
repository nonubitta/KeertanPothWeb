// src/app/db.service.ts
import { Injectable } from '@angular/core';
import initSqlJs, { Database } from 'sql.js';

@Injectable({ providedIn: 'root' })
export class DbService {
  private db: Database | null = null;

  async initDb(): Promise<void> {
    const SQL = await initSqlJs({
      locateFile: () => 'assets/sql-wasm.wasm'
    });

    const response = await fetch('assets/banidb.db3');
    const buffer = await response.arrayBuffer();

    this.db = new SQL.Database(new Uint8Array(buffer));
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
}
