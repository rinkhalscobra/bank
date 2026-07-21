interface BankPaymentPanelProps {
  bankName: string;
  bankAccountNumber: string;
  bankIban: string;
  bankSwiftCode: string;
  onChangeBankName: (v: string) => void;
  onChangeBankAccountNumber: (v: string) => void;
  onChangeBankIban: (v: string) => void;
  onChangeBankSwiftCode: (v: string) => void;
}

export default function BankPaymentPanel({
  bankName,
  bankAccountNumber,
  bankIban,
  bankSwiftCode,
  onChangeBankName,
  onChangeBankAccountNumber,
  onChangeBankIban,
  onChangeBankSwiftCode,
}: BankPaymentPanelProps) {
  const inputClassName =
    'w-full rounded-xl border border-[#006446]/14 bg-[#006446]/[0.03] px-4 py-2.5 text-sm text-slate-900 transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#006446]/20';

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-800">Bank Name</label>
          <input
            type="text"
            value={bankName}
            onChange={(e) => onChangeBankName(e.target.value)}
            placeholder=""
            className={inputClassName}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-800">Account Number</label>
          <input
            type="text"
            value={bankAccountNumber}
            onChange={(e) => onChangeBankAccountNumber(e.target.value)}
            placeholder=""
            className={inputClassName}
          />
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-800">IBAN</label>
          <input
            type="text"
            value={bankIban}
            onChange={(e) => onChangeBankIban(e.target.value.toUpperCase())}
            placeholder="e.g., CH93 0076 2011 6238 5295 7"
            maxLength={42}
            autoCapitalize="characters"
            spellCheck={false}
            className={inputClassName}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-800">SWIFT / BIC Code</label>
          <input
            type="text"
            value={bankSwiftCode}
            onChange={(e) => onChangeBankSwiftCode(e.target.value)}
            placeholder=""
            className={inputClassName}
          />
        </div>
      </div>
    </div>
  );
}
