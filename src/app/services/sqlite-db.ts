import { Injectable } from '@angular/core';
import initSqlJs, { Database } from 'sql.js';

@Injectable({
  providedIn: 'root'
})
export class SqliteDbService {
  private db: Database | null = null;

  async loadDatabase(): Promise<void> {
    const SQL = await initSqlJs({
      locateFile: () => 'assets/sql-wasm.wasm'
    });

    const response = await fetch('assets/banidb.db3');
    const buffer = await response.arrayBuffer();
    this.db = new SQL.Database(new Uint8Array(buffer));
  }

  query(sql: string): any[] {
    if (!this.db) throw new Error('Database not loaded');

    const result = this.db.exec(sql);
    if (result.length === 0) return [];

    const [data] = result;
    const columns = data.columns;
    const values = data.values;

    return values.map(row =>
      Object.fromEntries(row.map((val, i) => [columns[i], val]))
    );
  }
}
