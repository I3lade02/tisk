declare module "better-sqlite3" {
  export interface RunResult {
    changes: number;
    lastInsertRowid: number | bigint;
  }

  export interface Statement {
    run(...params: any[]): RunResult;
    get(...params: any[]): any;
    all(...params: any[]): any[];
  }

  export default class Database {
    constructor(filename: string, options?: Record<string, unknown>);
    pragma(source: string, options?: Record<string, unknown>): unknown;
    exec(source: string): this;
    prepare(source: string): Statement;
    transaction<T extends (...args: any[]) => unknown>(fn: T): T;
    close(): void;
  }
}
