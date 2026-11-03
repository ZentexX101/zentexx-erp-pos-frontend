import { roundTaka } from "./number";

// Same maths as the backend: a percent of the device's selling price, per piece
export const servicePrice = (unitPrice, percent, quantity = 1) => roundTaka((unitPrice * percent * quantity) / 100);

// Every piece on the invoice that can get a service, flat: one row per IMEI, one row per non-IMEI line.
// key identifies the pick; services: ids it already has (IMEI); usedByService: pieces per service (others).
export const deviceRows = (devices) =>
  devices.flatMap((device) =>
    device.trackSerial
      ? device.serials.map((row) => ({ key: `${device.product}:${row.serial}`, device, serial: row.serial, services: row.services.map(String) }))
      : device.quantity > 0
        ? [{ key: String(device.product), device, serial: null, quantity: device.quantity, usedByService: device.usedByService ?? {} }]
        : [],
  );

// How many more of this row can get the service (IMEI: 1 or 0)
export const piecesLeft = (row, serviceId) => {
  if (!row || !serviceId) return 0;
  if (row.serial) return row.services.includes(serviceId) ? 0 : 1;
  return row.quantity - (row.usedByService[serviceId] ?? 0);
};
