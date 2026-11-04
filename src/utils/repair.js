// The fields both the create and edit forms send
export const toJobPayload = (form) => ({
  deviceName: form.deviceName.trim(),
  imei: form.imei.trim(),
  color: form.color.trim(),
  accessories: form.accessories,
  problem: form.problem.trim(),
  condition: form.condition.trim(),
  technicianType: form.technicianType,
  technician: form.technicianType === "staff" ? form.technician : "",
  outsideName: form.technicianType === "outside" ? form.outsideName.trim() : "",
  estimate: Number(form.estimate) || 0,
  promisedDate: form.promisedDate,
});

export const jobFormError = (form) => (!form.deviceName.trim() && "Enter the device.") || (!form.problem.trim() && "Say what's wrong with it.") || "";
