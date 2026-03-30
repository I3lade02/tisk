import type { RawSnmpSnapshot } from "./profiles/base.js";

import { SNMP_OIDS } from "./oids.js";

export function createDevelopIneo250iSampleRawSnapshot(): RawSnmpSnapshot {
  return {
    scalars: {
      [SNMP_OIDS.sysDescr]: "Develop ineo+ 250i",
      [SNMP_OIDS.hrPrinterStatus]: 3,
      [SNMP_OIDS.pageCounter]: 176198
    },
    tables: {
      [SNMP_OIDS.generalPrinterStatusBase]: {
        "1.1": 3
      },
      [SNMP_OIDS.tonerNamesBase]: {
        "1.1": "Toner (Cyan)",
        "1.2": "Toner (Magenta)",
        "1.3": "Toner (Yellow)",
        "1.4": "Toner (Black)",
        "1.5": "Waste toner box"
      },
      [SNMP_OIDS.tonerMaxBase]: {
        "1.1": 100,
        "1.2": 100,
        "1.3": 100,
        "1.4": 100,
        "1.5": -3
      },
      [SNMP_OIDS.tonerCurrentBase]: {
        "1.1": 60,
        "1.2": 50,
        "1.3": 59,
        "1.4": 41,
        "1.5": -3
      },
      [SNMP_OIDS.trayNamesBase]: {
        "1.1": "Tray 1",
        "1.2": "Tray 2",
        "1.3": "Bypass tray"
      },
      [SNMP_OIDS.trayCapacityBase]: {
        "1.1": 500,
        "1.2": 500,
        "1.3": 100
      },
      [SNMP_OIDS.trayCurrentBase]: {
        "1.1": 320,
        "1.2": 140,
        "1.3": -3
      },
      [SNMP_OIDS.alertSeverityBase]: {},
      [SNMP_OIDS.alertDescriptionBase]: {}
    }
  };
}
