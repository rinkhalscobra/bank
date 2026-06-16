import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Upload,
  Camera,
  CreditCard,
  MapPin,
  User,
  Check,
  ChevronRight,
  ChevronLeft,
  Building2,
  AlertCircle,
  X,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useBranding } from '../contexts/BrandingContext';
import { supabase } from '../lib/supabase';
import Dropdown from '../components/ui/Dropdown';

const steps = ['Personal Info', 'Address', 'Identity Document', 'Selfie Verification'];

const ID_TYPES = [
  { value: 'passport', label: 'Passport' },
  { value: 'drivers_license', label: "Driver's License" },
  { value: 'national_id', label: 'National ID Card' },
];

const COUNTRIES = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany',
  'France', 'Japan', 'Brazil', 'India', 'Mexico', 'Nigeria',
  'South Africa', 'United Arab Emirates', 'Singapore', 'Other',
];

const INPUT_CLASS_NAME =
  'w-full rounded-xl border border-[#006446]/14 bg-[#006446]/[0.03] px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-[#006446]/20';

const COUNTRY_OPTIONS = COUNTRIES.map((country) => ({
  value: country,
  label: country,
}));

const ID_TYPE_OPTIONS = ID_TYPES.map((type) => ({
  value: type.value,
  label: type.label,
}));

export default function KycVerification() {
  const { user, refreshKycStatus } = useAuth();
  const { branding } = useBranding();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [dateOfBirth, setDateOfBirth] = useState('');
  const [nationality, setNationality] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');
  const [idType, setIdType] = useState('passport');
  const [idNumber, setIdNumber] = useState('');

  const [idFrontFile, setIdFrontFile] = useState<File | null>(null);
  const [idBackFile, setIdBackFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);

  const [idFrontPreview, setIdFrontPreview] = useState('');
  const [idBackPreview, setIdBackPreview] = useState('');
  const [selfiePreview, setSelfiePreview] = useState('');

  const idFrontRef = useRef<HTMLInputElement>(null);
  const idBackRef = useRef<HTMLInputElement>(null);
  const selfieRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (
    file: File | undefined,
    setFile: (f: File | null) => void,
    setPreview: (s: string) => void
  ) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (JPG, PNG, etc.)');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be under 10MB');
      return;
    }
    setError('');
    setFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const clearFile = (
    setFile: (f: File | null) => void,
    setPreview: (s: string) => void
  ) => {
    setFile(null);
    setPreview('');
  };

  const validateStep = (): boolean => {
    setError('');
    if (step === 0) {
      if (!dateOfBirth) { setError('Date of birth is required'); return false; }
      if (!nationality) { setError('Nationality is required'); return false; }
    } else if (step === 1) {
      if (!addressLine1.trim()) { setError('Address is required'); return false; }
      if (!city.trim()) { setError('City is required'); return false; }
      if (!postalCode.trim()) { setError('Postal code is required'); return false; }
      if (!country) { setError('Country is required'); return false; }
    } else if (step === 2) {
      if (!idNumber.trim()) { setError('ID number is required'); return false; }
      if (!idFrontFile) { setError('Please upload the front of your ID'); return false; }
      if (idType !== 'passport' && !idBackFile) { setError('Please upload the back of your ID'); return false; }
    } else if (step === 3) {
      if (!selfieFile) { setError('Please upload a selfie for verification'); return false; }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep()) {
      setStep((s) => Math.min(s + 1, steps.length - 1));
    }
  };

  const prevStep = () => setStep((s) => Math.max(s - 1, 0));

  const uploadFile = async (file: File, path: string): Promise<string> => {
    const { error } = await supabase.storage.from('kyc-documents').upload(path, file, {
      cacheControl: '3600',
      upsert: true,
    });
    if (error) throw error;
    return path;
  };

  const handleSubmit = async () => {
    if (!validateStep() || !user) return;
    setSubmitting(true);
    setError('');

    try {
      const userId = user.id;
      const timestamp = Date.now();

      let idFrontUrl = '';
      let idBackUrl = '';
      let selfieUrl = '';

      if (idFrontFile) {
        idFrontUrl = await uploadFile(idFrontFile, `${userId}/id-front-${timestamp}.${idFrontFile.name.split('.').pop()}`);
      }
      if (idBackFile) {
        idBackUrl = await uploadFile(idBackFile, `${userId}/id-back-${timestamp}.${idBackFile.name.split('.').pop()}`);
      }
      if (selfieFile) {
        selfieUrl = await uploadFile(selfieFile, `${userId}/selfie-${timestamp}.${selfieFile.name.split('.').pop()}`);
      }

      const { error: insertError } = await supabase.from('kyc_submissions').insert({
        user_id: userId,
        date_of_birth: dateOfBirth,
        nationality,
        id_type: idType,
        id_number: idNumber,
        id_front_url: idFrontUrl,
        id_back_url: idBackUrl,
        selfie_url: selfieUrl,
        address_line1: addressLine1,
        address_line2: addressLine2,
        city,
        state,
        postal_code: postalCode,
        country,
      });

      if (insertError) throw insertError;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ kyc_status: 'submitted' })
        .eq('id', userId);

      if (updateError) throw updateError;

      await refreshKycStatus();
      navigate('/kyc-status');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const stepIcons = [User, MapPin, CreditCard, Camera];

  return (
    <div className="min-h-screen bg-[#006446]/[0.04]">
      <div className="bg-[#006446] py-6 px-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Building2 className="w-8 h-8 text-white" strokeWidth={1.5} />
          <div>
            <h1 className="text-lg font-serif font-bold text-white">{branding.brandName}</h1>
            <p className="text-[10px] tracking-widest text-white/65">IDENTITY VERIFICATION</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="text-center mb-10">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#006446]/14 bg-[#006446]/10 px-4 py-2 text-sm font-medium text-[#006446]">
            <Shield className="w-4 h-4" />
            Required for account activation
          </div>
          <h2 className="text-3xl font-serif font-bold text-slate-900 mb-3">
            Verify Your Identity
          </h2>
          <p className="text-slate-500 max-w-lg mx-auto">
            To comply with financial regulations and protect your account, we need to verify your identity before activating your banking services.
          </p>
        </div>

        <div className="flex items-center justify-between mb-10 max-w-md mx-auto">
          {steps.map((label, i) => {
            const Icon = stepIcons[i];
            const isCompleted = i < step;
            const isCurrent = i === step;
            return (
              <div key={label} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 ${
                      isCompleted
                        ? 'bg-[#006446] text-white'
                        : isCurrent
                        ? 'bg-[#006446]/15 text-[#006446]'
                        : 'bg-white text-[#006446]/45 border border-[#006446]/10'
                    }`}
                  >
                    {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <span className={`text-xs mt-2 font-medium hidden sm:block ${
                    isCurrent ? 'text-[#006446]' : isCompleted ? 'text-[#006446]' : 'text-[#006446]/45'
                  }`}>
                    {label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`mx-1 h-0.5 w-8 sm:mx-2 sm:w-16 ${
                    i < step ? 'bg-[#006446]' : 'bg-[#006446]/15'
                  }`} />
                )}
              </div>
            );
          })}
        </div>

        {error && (
          <div className="mx-auto mb-6 flex max-w-lg items-center gap-2 rounded-2xl border border-[#006446]/14 bg-[#006446]/10 px-4 py-3 text-sm text-[#006446]">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <div className="mx-auto max-w-lg rounded-2xl border border-[#006446]/14 bg-white shadow-[0_24px_60px_-48px_rgba(0,100,70,0.45)]">
          <div className="p-6 sm:p-8">
            {step === 0 && (
              <PersonalInfoStep
                dateOfBirth={dateOfBirth}
                setDateOfBirth={setDateOfBirth}
                nationality={nationality}
                setNationality={setNationality}
              />
            )}

            {step === 1 && (
              <AddressStep
                addressLine1={addressLine1}
                setAddressLine1={setAddressLine1}
                addressLine2={addressLine2}
                setAddressLine2={setAddressLine2}
                city={city}
                setCity={setCity}
                state={state}
                setState={setState}
                postalCode={postalCode}
                setPostalCode={setPostalCode}
                country={country}
                setCountry={setCountry}
              />
            )}

            {step === 2 && (
              <DocumentStep
                idType={idType}
                setIdType={setIdType}
                idNumber={idNumber}
                setIdNumber={setIdNumber}
                idFrontPreview={idFrontPreview}
                idBackPreview={idBackPreview}
                idFrontRef={idFrontRef}
                idBackRef={idBackRef}
                onFrontSelect={(f) => handleFileSelect(f, setIdFrontFile, setIdFrontPreview)}
                onBackSelect={(f) => handleFileSelect(f, setIdBackFile, setIdBackPreview)}
                onClearFront={() => clearFile(setIdFrontFile, setIdFrontPreview)}
                onClearBack={() => clearFile(setIdBackFile, setIdBackPreview)}
              />
            )}

            {step === 3 && (
              <SelfieStep
                selfiePreview={selfiePreview}
                selfieRef={selfieRef}
                onSelect={(f) => handleFileSelect(f, setSelfieFile, setSelfiePreview)}
                onClear={() => clearFile(setSelfieFile, setSelfiePreview)}
              />
            )}
          </div>

          <div className="flex items-center justify-between border-t border-[#006446]/10 bg-[#006446]/[0.04] px-6 py-4 sm:px-8">
            {step > 0 ? (
              <button
                onClick={prevStep}
                className="flex items-center gap-2 text-sm font-medium text-[#006446] transition-colors hover:text-[#00523a]"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
            ) : (
              <div />
            )}

            {step < steps.length - 1 ? (
              <button
                onClick={nextStep}
                className="flex items-center gap-2 rounded-xl bg-[#006446] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#00523a]"
              >
                Continue
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-2 rounded-xl bg-[#006446] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#00523a] disabled:bg-slate-300 disabled:text-slate-500"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Submit Verification
                    <Shield className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        <p className="mx-auto mt-8 max-w-md text-center text-xs text-[#006446]/70">
          Your documents are encrypted and stored securely. We only use them for identity verification as required by financial regulations.
        </p>
      </div>
    </div>
  );
}

function PersonalInfoStep({
  dateOfBirth, setDateOfBirth, nationality, setNationality,
}: {
  dateOfBirth: string;
  setDateOfBirth: (v: string) => void;
  nationality: string;
  setNationality: (v: string) => void;
}) {
  return (
    <div className="space-y-5">
      <h3 className="text-lg font-semibold text-slate-900 mb-1">Personal Information</h3>
      <p className="text-sm text-slate-500 mb-4">Provide your basic personal details as they appear on your identity document.</p>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-800">Date of Birth</label>
        <input
          type="date"
          value={dateOfBirth}
          onChange={(e) => setDateOfBirth(e.target.value)}
          max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
          className={INPUT_CLASS_NAME}
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-800">Nationality</label>
        <Dropdown
          value={nationality}
          onChange={setNationality}
          options={COUNTRY_OPTIONS}
          placeholder="Select nationality"
          className="w-full"
        />
      </div>
    </div>
  );
}

function AddressStep({
  addressLine1, setAddressLine1, addressLine2, setAddressLine2,
  city, setCity, state, setState, postalCode, setPostalCode, country, setCountry,
}: {
  addressLine1: string; setAddressLine1: (v: string) => void;
  addressLine2: string; setAddressLine2: (v: string) => void;
  city: string; setCity: (v: string) => void;
  state: string; setState: (v: string) => void;
  postalCode: string; setPostalCode: (v: string) => void;
  country: string; setCountry: (v: string) => void;
}) {
  return (
    <div className="space-y-5">
      <h3 className="text-lg font-semibold text-slate-900 mb-1">Residential Address</h3>
      <p className="text-sm text-slate-500 mb-4">Enter your current residential address for verification purposes.</p>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-800">Address Line 1</label>
        <input
          type="text"
          value={addressLine1}
          onChange={(e) => setAddressLine1(e.target.value)}
          placeholder="123 Main Street"
          className={INPUT_CLASS_NAME}
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-800">Address Line 2 (Optional)</label>
        <input
          type="text"
          value={addressLine2}
          onChange={(e) => setAddressLine2(e.target.value)}
          placeholder="Apt 4B"
          className={INPUT_CLASS_NAME}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-800">City</label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className={INPUT_CLASS_NAME}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-800">State / Province</label>
          <input
            type="text"
            value={state}
            onChange={(e) => setState(e.target.value)}
            className={INPUT_CLASS_NAME}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-800">Postal Code</label>
          <input
            type="text"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            className={INPUT_CLASS_NAME}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-800">Country</label>
          <Dropdown
            value={country}
            onChange={setCountry}
            options={COUNTRY_OPTIONS}
            placeholder="Select"
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}

function DocumentStep({
  idType, setIdType, idNumber, setIdNumber,
  idFrontPreview, idBackPreview,
  idFrontRef, idBackRef,
  onFrontSelect, onBackSelect, onClearFront, onClearBack,
}: {
  idType: string; setIdType: (v: string) => void;
  idNumber: string; setIdNumber: (v: string) => void;
  idFrontPreview: string; idBackPreview: string;
  idFrontRef: React.RefObject<HTMLInputElement>;
  idBackRef: React.RefObject<HTMLInputElement>;
  onFrontSelect: (f: File | undefined) => void;
  onBackSelect: (f: File | undefined) => void;
  onClearFront: () => void;
  onClearBack: () => void;
}) {
  return (
    <div className="space-y-5">
      <h3 className="text-lg font-semibold text-slate-900 mb-1">Identity Document</h3>
      <p className="text-sm text-slate-500 mb-4">Upload a clear photo of a valid government-issued identity document.</p>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-800">Document Type</label>
        <Dropdown
          value={idType}
          onChange={setIdType}
          options={ID_TYPE_OPTIONS}
          className="w-full"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-800">Document Number</label>
        <input
          type="text"
          value={idNumber}
          onChange={(e) => setIdNumber(e.target.value)}
          placeholder="Enter your document number"
          className={INPUT_CLASS_NAME}
        />
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-800">Front of Document</label>
        <FileUploadZone
          preview={idFrontPreview}
          inputRef={idFrontRef}
          onSelect={onFrontSelect}
          onClear={onClearFront}
          label="Upload front of ID"
        />
      </div>
      {idType !== 'passport' && (
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-800">Back of Document</label>
          <FileUploadZone
            preview={idBackPreview}
            inputRef={idBackRef}
            onSelect={onBackSelect}
            onClear={onClearBack}
            label="Upload back of ID"
          />
        </div>
      )}
    </div>
  );
}

function SelfieStep({
  selfiePreview, selfieRef, onSelect, onClear,
}: {
  selfiePreview: string;
  selfieRef: React.RefObject<HTMLInputElement>;
  onSelect: (f: File | undefined) => void;
  onClear: () => void;
}) {
  return (
    <div className="space-y-5">
      <h3 className="text-lg font-semibold text-slate-900 mb-1">Selfie Verification</h3>
      <p className="text-sm text-slate-500 mb-4">
        Take or upload a clear photo of yourself. Make sure your face is well-lit and clearly visible.
      </p>
      <FileUploadZone
        preview={selfiePreview}
        inputRef={selfieRef}
        onSelect={onSelect}
        onClear={onClear}
        label="Upload a selfie"
        acceptCapture
      />
      <div className="space-y-2 rounded-2xl border border-[#006446]/14 bg-[#006446]/[0.04] p-4 text-sm text-slate-700">
        <p className="font-medium text-slate-800">Tips for a good selfie:</p>
        <ul className="list-inside list-disc space-y-1 text-[#006446]/80">
          <li>Face the camera directly with a neutral expression</li>
          <li>Ensure even lighting with no shadows on your face</li>
          <li>Remove glasses, hats, or face coverings</li>
          <li>Use a plain background if possible</li>
        </ul>
      </div>
    </div>
  );
}

function FileUploadZone({
  preview, inputRef, onSelect, onClear, label, acceptCapture,
}: {
  preview: string;
  inputRef: React.RefObject<HTMLInputElement>;
  onSelect: (f: File | undefined) => void;
  onClear: () => void;
  label: string;
  acceptCapture?: boolean;
}) {
  if (preview) {
    return (
      <div className="relative group">
        <img src={preview} alt="Preview" className="h-48 w-full rounded-2xl border border-[#006446]/14 object-cover" />
        <button
          onClick={onClear}
          className="absolute right-2 top-2 rounded-full bg-[#006446]/90 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      className="flex w-full cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-[#006446]/20 bg-[#006446]/[0.04] py-10 transition-colors hover:border-[#006446]/40 hover:bg-[#006446]/[0.07]"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#006446]/10">
        {acceptCapture ? <Camera className="h-6 w-6 text-[#006446]" /> : <Upload className="h-6 w-6 text-[#006446]" />}
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-slate-800">{label}</p>
        <p className="mt-1 text-xs text-[#006446]/70">JPG, PNG up to 10MB</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture={acceptCapture ? 'user' : undefined}
        onChange={(e) => onSelect(e.target.files?.[0])}
        className="hidden"
      />
    </button>
  );
}
