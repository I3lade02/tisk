declare module "net-snmp" {
  export const Version2c: number;

  export interface Options {
    port?: number;
    retries?: number;
    timeout?: number;
    version?: number;
    idBitsSize?: 16 | 32;
  }

  export interface Varbind {
    oid: string;
    type: number;
    value: unknown;
  }

  export interface Session {
    get(
      oids: string[],
      callback: (error: Error | null, varbinds: Varbind[]) => void
    ): void;
    subtree(
      oid: string,
      maxRepetitions: number,
      feedCallback: (varbinds: Varbind[]) => void,
      doneCallback: (error?: Error | null) => void
    ): void;
    close(): void;
  }

  export function createSession(
    target: string,
    community: string,
    options?: Options
  ): Session;

  export function isVarbindError(varbind: Varbind): boolean;
  export function varbindError(varbind: Varbind): string;
}
