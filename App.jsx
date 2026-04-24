import { useState, useMemo } from "react";
import { Home, RotateCcw, Copy, Check } from "lucide-react";

export default function App() {
  const [address, setAddress] = useState("");
  const [sqft, setSqft] = useState("");
  const [arvPsf, setArvPsf] = useState("");
  const [asIsPsf, setAsIsPsf] = useState("");
  const [repairLevel, setRepairLevel] = useState("medium");
  const [extras, setExtras] = useState({ roof: false, pool: false, hvac: false });
  const [anchorOverride, setAnchorOverride] = useState("");
  const [copied, setCopied] = useState(false);

  const n = (v) => {
    const x = parseFloat(String(v).replace(/[^0-9.]/g, ""));
    return isNaN(x) ? 0 : x;
  };

  const repairRates = { none: 0, light: 20000, medium: 40000, heavy: 50000 };

  const calc = useMemo(() => {
    const s = n(sqft);
    const arv = s * n(arvPsf);
    const asIs = s * n(asIsPsf);
    const baseRepair = repairRates[repairLevel];
    const extrasTotal =
      (extras.roof ? 10000 : 0) +
      (extras.pool ? 10000 : 0) +
      (extras.hvac ? 10000 : 0);
    const repairTotal = baseRepair + extrasTotal;
    // Cash offer (flip): lesser of two formulas, based on ARV
    const cashA = arv * 0.895 - 40000 - repairTotal;
    const cashB = arv * 0.7 - repairTotal;
    const maxCash = Math.min(cashA, cashB);
    const cashFormulaUsed = cashA <= cashB ? "A" : "B";
    // Novation: As-Is × 92.5% − $30K
    const maxNov = asIs * 0.925 - 30000;
    const defaultAnchor = maxCash - 10000;
    const anchor = anchorOverride !== "" ? n(anchorOverride) : defaultAnchor;
    return {
      arv,
      asIs,
      baseRepair,
      extrasTotal,
      repairTotal,
      maxCash,
      maxNov,
      anchor,
      defaultAnchor,
      cashFormulaUsed,
    };
  }, [sqft, arvPsf, asIsPsf, repairLevel, extras, anchorOverride]);

  const fmt = (v) =>
    v === 0 || isNaN(v)
      ? "$0"
      : v.toLocaleString("en-US", {
          style: "currency",
          currency: "USD",
          maximumFractionDigits: 0,
        });

  const reset = () => {
    setAddress("");
    setSqft("");
    setArvPsf("");
    setAsIsPsf("");
    setRepairLevel("medium");
    setExtras({ roof: false, pool: false, hvac: false });
    setAnchorOverride("");
  };

  const copySummary = () => {
    const text = [
      address && `Property: ${address}`,
      n(sqft) > 0 && `Sq Ft: ${n(sqft).toLocaleString()}`,
      `ARV: ${fmt(calc.arv)} ($${n(arvPsf).toLocaleString()}/sqft)`,
      `As-Is Price: ${fmt(calc.asIs)} ($${n(asIsPsf).toLocaleString()}/sqft)`,
      `Max Cash Offer: ${fmt(calc.maxCash)}`,
      `Max Novation Offer: ${fmt(calc.maxNov)}`,
    ]
      .filter(Boolean)
      .join("\n");
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const hasResults = n(sqft) > 0 && (n(arvPsf) > 0 || n(asIsPsf) > 0);

  return (
    <div className="min-h-screen bg-slate-700 text-stone-900 font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=IBM+Plex+Sans:wght@400;500;600&family=JetBrains+Mono:wght@500;700&display=swap');
        .font-display { font-family: 'Fraunces', serif; font-optical-sizing: auto; }
        .font-body { font-family: 'IBM Plex Sans', sans-serif; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        input, select { font-family: 'IBM Plex Sans', sans-serif; }
        input:focus, select:focus { outline: none; }
        input[type="number"]::-webkit-outer-spin-button,
        input[type="number"]::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        input[type="number"] { -moz-appearance: textfield; }
      `}</style>

      <div className="max-w-md mx-auto px-5 pt-6 pb-32 font-body">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-slate-300 text-slate-900 rounded-lg flex items-center justify-center">
              <Home size={18} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="font-display text-xl font-semibold leading-none tracking-tight text-stone-50">
                Offer Calculator
              </h1>
              <p className="text-[11px] text-stone-400 uppercase tracking-widest mt-0.5">
                Heritage · HBS Tool
              </p>
            </div>
          </div>
          <button
            onClick={reset}
            className="text-stone-400 hover:text-stone-50 transition p-2 -mr-2"
            aria-label="Reset"
          >
            <RotateCcw size={18} />
          </button>
        </header>

        {/* Inputs */}
        <section className="space-y-3">
          <Field label="Address" optional>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="123 Main St"
              className="w-full bg-transparent text-base font-medium placeholder:text-stone-400 placeholder:font-normal"
            />
          </Field>

          <Field label="Sq Ft">
            <NumberInput
              value={sqft}
              onChange={setSqft}
              placeholder="1,500"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="ARV $/Sq Ft" hint="Top of market">
              <NumberInput
                value={arvPsf}
                onChange={setArvPsf}
                placeholder="200"
                prefix="$"
              />
            </Field>
            <Field label="As-Is $/Sq Ft" hint="Current cond.">
              <NumberInput
                value={asIsPsf}
                onChange={setAsIsPsf}
                placeholder="160"
                prefix="$"
              />
            </Field>
          </div>

          {/* Derived price readouts */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-200 text-slate-900 rounded-xl px-3 py-2.5">
              <p className="text-[10px] uppercase tracking-widest text-slate-700 font-semibold">
                ARV
              </p>
              <p className="font-display text-xl font-semibold tracking-tight leading-tight mt-0.5">
                {fmt(calc.arv)}
              </p>
            </div>
            <div className="bg-slate-200 text-slate-900 rounded-xl px-3 py-2.5">
              <p className="text-[10px] uppercase tracking-widest text-slate-700 font-semibold">
                As-Is Price
              </p>
              <p className="font-display text-xl font-semibold tracking-tight leading-tight mt-0.5">
                {fmt(calc.asIs)}
              </p>
            </div>
          </div>

          {/* Repair Level */}
          <div className="pt-2">
            <p className="text-[11px] uppercase tracking-widest text-stone-400 font-medium mb-2 px-1">
              Repair Level
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "none", label: "None", sub: "$0", desc: "" },
                { id: "light", label: "Light", sub: "$20K", desc: "Paint & floor" },
                { id: "medium", label: "Medium", sub: "$40K", desc: "Standard flip" },
                { id: "heavy", label: "Heavy", sub: "$50K", desc: "Totally trashed" },
              ].map((opt) => {
                const active = repairLevel === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setRepairLevel(opt.id)}
                    className={`py-3 px-3 rounded-xl border-2 transition-all text-left ${
                      active
                        ? "border-slate-200 bg-slate-200 text-slate-900"
                        : "border-slate-500 bg-slate-800 text-stone-200 hover:border-slate-400"
                    }`}
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-semibold text-sm">{opt.label}</span>
                      <span
                        className={`font-mono text-xs font-semibold ${
                          active ? "text-slate-700" : "text-stone-300"
                        }`}
                      >
                        {opt.sub}
                      </span>
                    </div>
                    {opt.desc && (
                      <div
                        className={`text-[10px] mt-0.5 ${
                          active ? "text-slate-600" : "text-stone-400"
                        }`}
                      >
                        {opt.desc}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Major systems add-ons */}
            <p className="text-[11px] uppercase tracking-widest text-stone-400 font-medium mb-2 px-1 mt-5">
              Add-Ons · $10K each
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "roof", label: "Roof" },
                { id: "pool", label: "Pool" },
                { id: "hvac", label: "HVAC" },
              ].map((opt) => {
                const active = extras[opt.id];
                return (
                  <button
                    key={opt.id}
                    onClick={() =>
                      setExtras((prev) => ({ ...prev, [opt.id]: !prev[opt.id] }))
                    }
                    className={`py-3 px-2 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${
                      active
                        ? "border-slate-200 bg-slate-200 text-slate-900"
                        : "border-slate-500 bg-slate-800 text-stone-200 hover:border-slate-400"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                        active
                          ? "border-slate-900 bg-slate-900"
                          : "border-stone-400"
                      }`}
                    >
                      {active && <Check size={11} className="text-slate-200" strokeWidth={3} />}
                    </div>
                    <span className="font-semibold text-sm">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Results */}
        <section className="mt-8">
          <div className="flex items-baseline justify-between mb-3 px-1">
            <h2 className="font-display text-lg font-semibold tracking-tight text-stone-50">
              Offers
            </h2>
            {hasResults && (
              <button
                onClick={copySummary}
                className="text-xs text-stone-400 hover:text-stone-50 flex items-center gap-1 transition"
              >
                {copied ? (
                  <>
                    <Check size={13} /> Copied
                  </>
                ) : (
                  <>
                    <Copy size={13} /> Copy
                  </>
                )}
              </button>
            )}
          </div>

          <div className="space-y-2">
            <ResultRow
              label="Repair Total"
              sublabel={
                calc.extrasTotal > 0
                  ? `${repairLevel} base + ${fmt(calc.extrasTotal)} add-ons`
                  : `${repairLevel} rehab`
              }
              value={fmt(calc.repairTotal)}
              muted
            />

            <ResultRow
              label="Max Cash Offer"
              sublabel={`Lesser of ARV × 89.5% − $40K − Rep or ARV × 70% − Rep · ${calc.cashFormulaUsed}`}
              value={fmt(calc.maxCash)}
              emphasis
            />

            <ResultRow
              label="Max Novation Offer"
              sublabel="As-Is × 92.5% − $30K"
              value={fmt(calc.maxNov)}
              emphasis
            />

            {/* Anchor Offer — editable */}
            <div className="bg-slate-100 border-2 border-slate-900 rounded-2xl p-4 mt-3">
              <div className="flex items-baseline justify-between mb-1">
                <div>
                  <p className="text-[11px] uppercase tracking-widest text-slate-900 font-semibold">
                    Anchor Offer
                  </p>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Starting point · Max Cash − $10K
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="font-display text-2xl font-semibold text-slate-900">
                  $
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={
                    anchorOverride !== ""
                      ? anchorOverride
                      : calc.defaultAnchor > 0
                      ? Math.round(calc.defaultAnchor).toLocaleString()
                      : ""
                  }
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^0-9.-]/g, "");
                    setAnchorOverride(raw);
                  }}
                  onFocus={(e) => e.target.select()}
                  placeholder="0"
                  className="font-display text-3xl font-semibold text-slate-900 bg-transparent w-full tracking-tight placeholder:text-slate-400"
                />
                {anchorOverride !== "" && (
                  <button
                    onClick={() => setAnchorOverride("")}
                    className="text-[11px] text-slate-700 underline whitespace-nowrap"
                  >
                    reset
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        <footer className="mt-10 pt-6 border-t border-slate-500 text-center">
          <p className="text-[10px] uppercase tracking-widest text-stone-400">
            Internal use only
          </p>
        </footer>
      </div>
    </div>
  );
}

function Field({ label, hint, optional, children }) {
  return (
    <label className="block bg-white border border-stone-200 rounded-xl px-4 py-2.5 focus-within:border-stone-900 transition-colors">
      <div className="flex items-baseline justify-between">
        <span className="text-[11px] uppercase tracking-widest text-stone-500 font-medium">
          {label}
          {optional && (
            <span className="text-stone-400 normal-case tracking-normal ml-1">
              (optional)
            </span>
          )}
        </span>
        {hint && (
          <span className="text-[10px] text-stone-400 font-mono">{hint}</span>
        )}
      </div>
      <div className="mt-0.5">{children}</div>
    </label>
  );
}

function NumberInput({ value, onChange, placeholder, prefix }) {
  const formatted =
    value === "" ? "" : Number(String(value).replace(/,/g, "")).toLocaleString();
  return (
    <div className="flex items-center">
      {prefix && (
        <span className="text-base font-medium text-stone-400 mr-1">
          {prefix}
        </span>
      )}
      <input
        type="text"
        inputMode="decimal"
        value={formatted}
        onChange={(e) => {
          const raw = e.target.value.replace(/[^0-9.]/g, "");
          onChange(raw);
        }}
        onFocus={(e) => e.target.select()}
        placeholder={placeholder}
        className="w-full bg-transparent text-base font-medium placeholder:text-stone-400 placeholder:font-normal"
      />
    </div>
  );
}

function ResultRow({ label, sublabel, value, muted, emphasis }) {
  return (
    <div
      className={`flex items-center justify-between rounded-xl px-4 py-3 ${
        muted
          ? "bg-stone-100"
          : emphasis
          ? "bg-white border border-stone-200"
          : "bg-white"
      }`}
    >
      <div>
        <p
          className={`text-sm font-semibold ${
            muted ? "text-stone-600" : "text-stone-900"
          }`}
        >
          {label}
        </p>
        {sublabel && (
          <p className="text-[10px] text-stone-400 font-mono mt-0.5">
            {sublabel}
          </p>
        )}
      </div>
      <p
        className={`font-display tracking-tight ${
          muted
            ? "text-lg font-semibold text-stone-700"
            : "text-2xl font-semibold text-stone-900"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
