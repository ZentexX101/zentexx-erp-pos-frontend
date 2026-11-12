import { getCountries, getCountryCallingCode, getExampleNumber, parsePhoneNumberFromString } from "libphonenumber-js/max";
import examples from "libphonenumber-js/mobile/examples";
import { useCallback, useId, useMemo, useRef, useState } from "react";
import { LuChevronDown, LuSearch } from "react-icons/lu";
import { useDismiss } from "../../../hooks/useDismiss";
import { DEFAULT_COUNTRY, splitPhone } from "../../../utils/phone";

// Each flag is its own small SVG file, fetched only when it's shown
const FLAG_URLS = import.meta.glob("/node_modules/country-flag-icons/3x2/*.svg", { eager: true, query: "?no-inline", import: "default" });
const flagUrl = (country) => FLAG_URLS[`/node_modules/country-flag-icons/3x2/${country}.svg`];

const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

// Every country with its dialling code; Bangladesh first, the rest A–Z
const COUNTRIES = getCountries()
  .map((code) => ({ code, name: regionNames.of(code) ?? code, dial: getCountryCallingCode(code) }))
  .sort((a, b) => (a.code === DEFAULT_COUNTRY ? -1 : b.code === DEFAULT_COUNTRY ? 1 : a.name.localeCompare(b.name)));

const dialOf = (country) => getCountryCallingCode(country);

// The country + what was typed -> E.164 ("" when nothing is typed). A leading 0 is the local trunk prefix.
const buildPhone = (country, national) => {
  if (!national) return "";
  return parsePhoneNumberFromString(national, country)?.number ?? `+${dialOf(country)}${national.replace(/^0+/, "")}`;
};

const Flag = ({ country }) => (
  <img src={flagUrl(country)} alt="" aria-hidden="true" className="h-3.5 w-5 shrink-0 rounded-[2px] object-cover ring-1 ring-black/10" />
);

// Phone number for any country: a searchable country picker (flag + dialling code) and the number.
// value / onChange use E.164 ("+8801712345678", "+966501234567"; "" when empty). Pasting a number
// with its + code picks the country by itself.
const PhoneInput = ({ label, error, required = false, value, onChange, className = "", ...props }) => {
  const id = useId();
  const listId = useId();
  const ref = useRef(null);
  const searchRef = useRef(null);

  // country and typed number; re-read from value only when it changes from outside (e.g. editing)
  const [country, setCountry] = useState(() => splitPhone(value).country);
  const [national, setNational] = useState(() => splitPhone(value).national);
  const [own, setOwn] = useState(value);
  if (value !== own) {
    const next = splitPhone(value);
    setOwn(value);
    setCountry(next.country);
    setNational(next.national);
  }

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
  }, []);
  useDismiss(ref, open, close);

  const emit = (nextCountry, nextNational) => {
    const phone = buildPhone(nextCountry, nextNational);
    setCountry(nextCountry);
    setNational(nextNational);
    setOwn(phone);
    onChange(phone);
  };

  const handleType = (text) => {
    // a full international number (typed or pasted with +): take its country from it
    if (text.trim().startsWith("+")) {
      const parsed = parsePhoneNumberFromString(text);
      if (parsed?.country) return emit(parsed.country, parsed.nationalNumber);
    }
    emit(country, text.replace(/\D/g, "").slice(0, 17));
  };

  const pickCountry = (code) => {
    emit(code, national);
    close();
  };

  const matches = useMemo(() => {
    const term = query.trim().toLowerCase().replace(/^\+/, "");
    if (!term) return COUNTRIES;
    return COUNTRIES.filter((c) => c.name.toLowerCase().includes(term) || c.code.toLowerCase() === term || c.dial.startsWith(term));
  }, [query]);

  const placeholder = getExampleNumber(country, examples)?.formatNational() ?? "Phone number";

  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="mb-1 block text-sm font-medium text-slate-700">
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>
      )}
      <div ref={ref} className="relative">
        <div
          className={`flex rounded-md border bg-white transition focus-within:ring-2 ${
            error ? "border-red-400 focus-within:ring-red-200" : "border-slate-300 focus-within:border-slate-400 focus-within:ring-brand/10"
          }`}
        >
          <button
            type="button"
            onClick={() => (open ? close() : (setOpen(true), setTimeout(() => searchRef.current?.focus())))}
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-controls={listId}
            aria-label={`Country: ${regionNames.of(country)} +${dialOf(country)}`}
            className="flex shrink-0 items-center gap-1.5 rounded-l-md border-r border-slate-200 px-3 text-sm text-slate-600 hover:bg-slate-50 focus:outline-none focus-visible:bg-slate-50"
          >
            <Flag country={country} />
            <span className="tabular-nums">+{dialOf(country)}</span>
            <LuChevronDown className={`h-3.5 w-3.5 text-slate-400 transition ${open ? "rotate-180" : ""}`} aria-hidden="true" />
          </button>
          <input
            id={id}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            aria-invalid={Boolean(error)}
            value={national}
            onChange={(e) => handleType(e.target.value)}
            placeholder={placeholder}
            className="min-w-0 flex-1 rounded-r-md px-3 py-2 text-slate-900 outline-none"
            {...props}
          />
        </div>

        {open && (
          <div className="absolute left-0 top-full z-40 mt-1 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
            <div className="flex items-center gap-2 border-b border-slate-100 px-3">
              <LuSearch className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
              <input
                ref={searchRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (matches[0]) pickCountry(matches[0].code);
                  }
                }}
                placeholder="Search country or code"
                aria-label="Search country"
                className="h-10 min-w-0 flex-1 text-sm text-slate-900 outline-none"
              />
            </div>
            <ul id={listId} role="listbox" aria-label="Country" className="max-h-64 overflow-y-auto py-1">
              {matches.map((c) => {
                const active = c.code === country;
                return (
                  <li key={c.code} role="option" aria-selected={active}>
                    <button
                      type="button"
                      onClick={() => pickCountry(c.code)}
                      className={`flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition ${
                        active ? "bg-slate-100 font-semibold text-slate-900" : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <Flag country={c.code} />
                      <span className="min-w-0 flex-1 truncate">{c.name}</span>
                      <span className="shrink-0 tabular-nums text-slate-500">+{c.dial}</span>
                    </button>
                  </li>
                );
              })}
              {!matches.length && <li className="px-3 py-6 text-center text-sm text-slate-500">No country found</li>}
            </ul>
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default PhoneInput;
