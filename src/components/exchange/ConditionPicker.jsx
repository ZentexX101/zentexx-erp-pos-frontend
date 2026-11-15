import { LuCheck } from "react-icons/lu";
import { CONDITION_GRADES } from "../../utils/exchange";

const chip = (on) =>
  `inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-semibold ring-1 transition-colors ${
    on ? "bg-slate-900 text-white ring-slate-900" : "bg-white text-slate-600 ring-slate-300 hover:bg-slate-50"
  }`;

// Optional condition of an old device: grade A / B / C (click again to clear), box, charger and a short note
const ConditionPicker = ({ value, onChange }) => {
  const set = (patch) => onChange({ ...value, ...patch });

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-slate-700">
        Condition <span className="font-normal text-slate-500">(optional)</span>
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex gap-1" role="group" aria-label="Grade">
          {CONDITION_GRADES.map((grade) => (
            <button
              key={grade}
              type="button"
              aria-pressed={value.grade === grade}
              onClick={() => set({ grade: value.grade === grade ? null : grade })}
              className={`${chip(value.grade === grade)} w-9 justify-center px-0`}
              title={`Grade ${grade}`}
            >
              {grade}
            </button>
          ))}
        </div>
        <span className="h-5 w-px bg-slate-200" aria-hidden="true" />
        {[
          ["box", "Box"],
          ["charger", "Charger"],
        ].map(([field, label]) => (
          <button key={field} type="button" aria-pressed={value[field]} onClick={() => set({ [field]: !value[field] })} className={chip(value[field])}>
            {value[field] && <LuCheck className="size-3.5" strokeWidth={3} aria-hidden="true" />}
            {label}
          </button>
        ))}
      </div>
      <input
        value={value.note}
        onChange={(e) => set({ note: e.target.value })}
        maxLength={200}
        placeholder="Note, e.g. small scratch on the back, battery 85%"
        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-brand/10"
      />
    </div>
  );
};

export default ConditionPicker;
