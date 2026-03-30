import { Buffer } from "node:buffer";

import * as snmp from "net-snmp";
import type { PrinterSummary } from "@tisk/shared";

import { env } from "../../config/env.js";
import { logger } from "../../utils/logger.js";
import { SNMP_OIDS } from "./oids.js";
import type { RawSnmpSnapshot, SnmpPrimitive } from "./profiles/base.js";

function toPrimitive(value: unknown): SnmpPrimitive {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return value;
  }

  if (typeof value === "bigint") {
    return Number(value);
  }

  if (Buffer.isBuffer(value)) {
    return value.toString("utf8").trim();
  }

  return String(value);
}

function createSession(printer: PrinterSummary) {
  return snmp.createSession(printer.ipAddress, printer.snmpCommunity, {
    retries: env.snmpRetries,
    timeout: env.snmpTimeoutMs,
    version: snmp.Version2c
  });
}

function getScalars(session: snmp.Session, oids: string[]): Promise<Record<string, SnmpPrimitive>> {
  return new Promise((resolve, reject) => {
    session.get(oids, (error, varbinds) => {
      if (error) {
        reject(error);
        return;
      }

      const result: Record<string, SnmpPrimitive> = {};

      for (const varbind of varbinds) {
        if (snmp.isVarbindError(varbind)) {
          result[varbind.oid] = null;
          continue;
        }

        result[varbind.oid] = toPrimitive(varbind.value);
      }

      resolve(result);
    });
  });
}

function walkTable(session: snmp.Session, oid: string): Promise<Record<string, SnmpPrimitive>> {
  return new Promise((resolve, reject) => {
    const result: Record<string, SnmpPrimitive> = {};

    session.subtree(
      oid,
      env.snmpMaxRepetitions,
      (varbinds) => {
        for (const varbind of varbinds) {
          if (snmp.isVarbindError(varbind)) {
            logger.debug(`SNMP varbind error for ${varbind.oid}: ${snmp.varbindError(varbind)}`);
            continue;
          }

          const rowKey = varbind.oid.startsWith(`${oid}.`)
            ? varbind.oid.slice(oid.length + 1)
            : varbind.oid;

          result[rowKey] = toPrimitive(varbind.value);
        }
      },
      (error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(result);
      }
    );
  });
}

export class SnmpClient {
  async readPrinter(printer: PrinterSummary): Promise<RawSnmpSnapshot> {
    const session = createSession(printer);

    try {
      const [scalars, generalStatuses, tonerNames, tonerMax, tonerCurrent, trayNames, trayCapacity, trayCurrent, alertSeverity, alertDescription] =
        await Promise.all([
          getScalars(session, [
            SNMP_OIDS.sysDescr,
            SNMP_OIDS.hrPrinterStatus,
            SNMP_OIDS.pageCounter
          ]),
          walkTable(session, SNMP_OIDS.generalPrinterStatusBase),
          walkTable(session, SNMP_OIDS.tonerNamesBase),
          walkTable(session, SNMP_OIDS.tonerMaxBase),
          walkTable(session, SNMP_OIDS.tonerCurrentBase),
          walkTable(session, SNMP_OIDS.trayNamesBase),
          walkTable(session, SNMP_OIDS.trayCapacityBase),
          walkTable(session, SNMP_OIDS.trayCurrentBase),
          walkTable(session, SNMP_OIDS.alertSeverityBase),
          walkTable(session, SNMP_OIDS.alertDescriptionBase)
        ]);

      return {
        scalars,
        tables: {
          [SNMP_OIDS.generalPrinterStatusBase]: generalStatuses,
          [SNMP_OIDS.tonerNamesBase]: tonerNames,
          [SNMP_OIDS.tonerMaxBase]: tonerMax,
          [SNMP_OIDS.tonerCurrentBase]: tonerCurrent,
          [SNMP_OIDS.trayNamesBase]: trayNames,
          [SNMP_OIDS.trayCapacityBase]: trayCapacity,
          [SNMP_OIDS.trayCurrentBase]: trayCurrent,
          [SNMP_OIDS.alertSeverityBase]: alertSeverity,
          [SNMP_OIDS.alertDescriptionBase]: alertDescription
        }
      };
    } finally {
      session.close();
    }
  }
}
