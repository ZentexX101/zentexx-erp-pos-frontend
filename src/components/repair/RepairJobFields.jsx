import { ACCESSORY_OPTIONS, COMMON_PROBLEMS } from "../../constants/repair";
import { toDecimalInput } from "../../utils/number";
import Input from "../common/forms/Input";
import Select from "../common/forms/Select";
import Textarea from "../common/forms/Textarea";

// A one-tap choice at the counter
const Chip = ({ active, onClick, children }) => (
  <button
    type="button"
    aria-pressed={active}
    onClick={onClick}
    className={`rounded-full px-3 py-1.5 text-xs font-medium ring-1 transition ${active ? "bg-slate-100 text-slate-900 ring-slate-400" : "bg-white text-slate-600 ring-slate-200 hover:ring-slate-300"}`}
  >
    {children}
  </button>
);

// A section of the job form
export const JobSection = ({ title, hint, children }) => (
  <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/70 sm:p-5">
    <h2 className="font-semibold text-slate-900">{title}</h2>
    {hint && <p className="mt-0.5 text-[13px] text-slate-500">{hint}</p>}
    <div className="mt-4 space-y-4">{children}</div>
  </section>
);

// The device and what's wrong with it
export const RepairDeviceFields = ({ form, onField, imeiNote }) => {
  const toggleAccessory = (name) =>
    onField("accessories", form.accessories.includes(name) ? form.accessories.filter((item) => item !== name) : [...form.accessories, name]);
  const addProblem = (text) => onField("problem", form.problem.trim() ? `${form.problem.trim()}, ${text}` : text);

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="IMEI" placeholder="Fills in what we know about it" maxLength={50} value={form.imei} onChange={(e) => onField("imei", e.target.value)} />
        <Input
          label="Device"
          required
          placeholder="Galaxy A37"
          maxLength={120}
          value={form.deviceName}
          onChange={(e) => onField("deviceName", e.target.value)}
        />
      </div>
      {imeiNote}
      <Input label="Color" maxLength={40} value={form.color} onChange={(e) => onField("color", e.target.value)} />
      <div>
        <p className="mb-2 text-sm font-medium text-slate-700">Came with</p>
        <div className="flex flex-wrap gap-2">
          {ACCESSORY_OPTIONS.map((name) => (
            <Chip key={name} active={form.accessories.includes(name)} onClick={() => toggleAccessory(name)}>
              {name}
            </Chip>
          ))}
        </div>
      </div>
      <div>
        <Textarea label="What's wrong with it? *" maxLength={1000} value={form.problem} onChange={(e) => onField("problem", e.target.value)} />
        <div className="mt-2 flex flex-wrap gap-2">
          {COMMON_PROBLEMS.map((text) => (
            <Chip key={text} active={false} onClick={() => addProblem(text)}>
              + {text}
            </Chip>
          ))}
        </div>
      </div>
      <Input
        label="Condition when received"
        placeholder="Scratches, cracks, dents..."
        maxLength={500}
        value={form.condition}
        onChange={(e) => onField("condition", e.target.value)}
      />
    </>
  );
};

// Who repairs it: own staff or someone outside
export const RepairTechnicianFields = ({ form, onField, staff }) => (
  <>
    <div className="inline-flex rounded-xl bg-slate-100 p-1" role="group" aria-label="Who repairs it">
      {[
        ["staff", "Own staff"],
        ["outside", "Outside"],
      ].map(([value, label]) => (
        <button
          key={value}
          type="button"
          aria-pressed={form.technicianType === value}
          onClick={() => onField("technicianType", value)}
          className={`rounded-lg px-4 py-1.5 text-sm font-medium transition ${form.technicianType === value ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
        >
          {label}
        </button>
      ))}
    </div>
    {form.technicianType === "staff" ? (
      <Select
        label="Technician"
        placeholder="Not decided yet"
        options={staff.map((member) => ({ value: member._id, label: member.name }))}
        value={form.technician}
        onChange={(e) => onField("technician", e.target.value)}
      />
    ) : (
      <Input
        label="Shop or person"
        placeholder="Who it was sent to"
        maxLength={100}
        value={form.outsideName}
        onChange={(e) => onField("outsideName", e.target.value)}
      />
    )}
  </>
);

// What the customer was told
export const RepairPromiseFields = ({ form, onField }) => (
  <div className="grid gap-4 sm:grid-cols-2">
    <Input label="Estimate" inputMode="decimal" placeholder="0" value={form.estimate} onChange={(e) => onField("estimate", toDecimalInput(e.target.value))} />
    <Input label="Promised by" type="date" value={form.promisedDate} onChange={(e) => onField("promisedDate", e.target.value)} />
  </div>
);
