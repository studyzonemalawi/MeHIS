
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Home, ClipboardList, Database, Heart, Droplets, 
  MapPin, Settings, HelpCircle, LogOut, LayoutDashboard, 
  Menu, X, User as UserIcon, Plus, ChevronRight, FileText,
  Search, Download, Trash2, Edit, Save, Camera, Bell, AlertCircle, CheckCircle2,
  Filter, Users, Droplet, Bug, Info, Activity, ListChecks, Calendar as CalendarIcon, ClipboardCheck,
  Zap, Clock, MessageSquare, Microscope, CloudUpload, History as HistoryIcon,
  ArrowUpRight, Users2, Building2, MapPinned, Stethoscope, Smartphone, FileSpreadsheet,
  CheckCircle, ArrowRightCircle, AlertOctagon, Key, SmartphoneNfc, Eye, EyeOff, CalendarRange,
  Target, Map, Briefcase, Trash, MapPinCheck, Timer, TestTube
} from 'lucide-react';
import { User, UserRole, HSARegistration, VillageData, VillageInspection, HouseholdRecord, ActionPlan, MonthlyWorkPlan, WorkPlanActivity, ActivityOccurrence, AdhocActivity, WaterPoint, WASHHouseholdAssessment, ThreeState, WaterQualitySample } from './types';
import { MALAWI_DISTRICTS, YEARS, TRAINING_TOPICS, RECRUITERS, FACILITY_TYPES, WATER_POINT_TYPES, WATER_TREATMENT_METHODS, TOILET_TYPES } from './constants';
import { getFromStorage, saveToStorage } from './services/storage';
import { 
  validatePhoneNumber, 
  validateNationalID, 
  validateEmploymentNumber, 
  validateDOB, 
  validateYearAppointed, 
  validatePositiveNumber,
  validateWorkPlanDate,
  validateDateRange,
  validatePasswordComplexity,
  validatePasswordsMatch
} from './utils/validation';

// --- UI Helpers ---

const Button = ({ children, onClick, className = "", variant = "primary", disabled = false, type = "button" as any, size = "md" }: any) => {
  const base = "px-4 py-2 rounded-lg font-medium transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2";
  const sizes: any = {
    sm: "text-xs px-3 py-1.5",
    md: "text-sm px-4 py-2",
    lg: "text-base px-6 py-3"
  };
  const variants: any = {
    primary: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-200",
    secondary: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50",
    outline: "bg-transparent border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50",
    danger: "bg-rose-500 text-white hover:bg-rose-600 shadow-lg shadow-rose-200",
    amber: "bg-amber-500 text-white hover:bg-amber-600 shadow-lg shadow-amber-200",
    ghost: "bg-transparent text-slate-500 hover:bg-slate-50",
    blue: "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200"
  };
  return <button type={type} disabled={disabled} onClick={onClick} className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}>{children}</button>;
};

const Input = ({ label, value, onChange, type = "text", placeholder = "", required = false, maxLength, pattern, error, className = "", min, max, step, prefix, disabled }: any) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const actualType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className={`flex flex-col gap-1 mb-4 ${className}`}>
      {label && <label className="text-sm font-semibold text-slate-600">{label}{required && <span className="text-rose-500">*</span>}</label>}
      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-4 text-slate-400 font-bold text-sm pointer-events-none">{prefix}</span>
        )}
        <input 
          type={actualType} 
          value={value === undefined || value === null ? "" : value} 
          onChange={e => {
            const val = e.target.value;
            onChange(type === "number" ? (val === "" ? undefined : Number(val)) : val);
          }} 
          placeholder={placeholder}
          required={required}
          maxLength={maxLength}
          pattern={pattern}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          className={`w-full ${prefix ? 'pl-16' : 'px-4'} ${isPassword ? 'pr-20' : ''} py-2.5 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all bg-white disabled:bg-slate-50 ${error ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-200 shadow-sm shadow-slate-100/30'}`}
        />
        {isPassword && (
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
            {showPassword ? "Hide" : "Show"}
          </button>
        )}
      </div>
      {error && <p className="text-[10px] text-rose-500 font-medium flex items-center gap-1 mt-1"><AlertCircle size={10}/> {error}</p>}
    </div>
  );
};

const Select = ({ label, value, onChange, options, required = false, error, className = "" }: any) => (
  <div className={`flex flex-col gap-1 mb-4 ${className}`}>
    {label && <label className="text-sm font-semibold text-slate-600">{label}{required && <span className="text-rose-500">*</span>}</label>}
    <select 
      value={value || ""} 
      onChange={e => onChange(e.target.value)}
      required={required}
      className={`px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-white shadow-sm shadow-slate-100/30 ${error ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-200'}`}
    >
      <option value="">Select...</option>
      {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
    </select>
    {error && <p className="text-[10px] text-rose-500 font-medium flex items-center gap-1 mt-1.5"><AlertCircle size={10}/> {error}</p>}
  </div>
);

const Card = ({ children, title, description, className = "" }: any) => (
  <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden ${className}`}>
    {(title || description) && (
      <div className="p-4 border-b border-slate-100 bg-slate-50/50">
        {title && <h3 className="font-bold text-slate-800 tracking-tight">{title}</h3>}
        {description && <p className="text-xs text-slate-500">{description}</p>}
      </div>
    )}
    <div className="p-4">{children}</div>
  </div>
);

const CustomDatePicker = ({ label, value, onChange, required = false, error }: { label: string, value: string, onChange: (val: string) => void, required?: boolean, error?: string | null }) => (
  <div className="mb-4 relative">
    {label && <label className="text-sm font-semibold text-slate-600 block mb-1">{label}{required && <span className="text-rose-500">*</span>}</label>}
    <div className="relative group">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors pointer-events-none">
        <CalendarIcon size={18} />
      </div>
      <input type="date" value={value || ""} onChange={(e) => onChange(e.target.value)} required={required} className="w-full pl-10 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-white transition-all appearance-none cursor-pointer" />
    </div>
    {error && <p className="text-[10px] text-rose-500 font-medium flex items-center gap-1 mt-1.5"><AlertCircle size={10}/> {error}</p>}
  </div>
);

// --- WASH Module Subcomponents ---

const WaterPointForm = ({ onSave, onCancel }: { onSave: (data: WaterPoint) => void, onCancel: () => void }) => {
  const [data, setData] = useState<Partial<WaterPoint>>({
    functionality: 'Functional',
    repairState: 'Good',
    mechanicContacted: false
  });

  useEffect(() => {
    // Auto-capture GPS
    navigator.geolocation.getCurrentPosition(
      (pos) => setData(prev => ({ ...prev, coords: { lat: pos.coords.latitude, lng: pos.coords.longitude } })),
      (err) => console.error("Location capture failed", err)
    );
  }, []);

  return (
    <Card title="Register New Water Point" description="Auto-capturing GPS coordinates. Please fill out details below.">
      <div className="space-y-4">
        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MapPin className="text-emerald-600" />
            <div>
              <p className="text-xs font-black text-emerald-800 uppercase tracking-widest">GPS Coordinates</p>
              <p className="text-sm font-mono text-emerald-700">
                {data.coords ? `${data.coords.lat.toFixed(6)}, ${data.coords.lng.toFixed(6)}` : 'Capturing location...'}
              </p>
            </div>
          </div>
          {data.coords && <CheckCircle2 className="text-emerald-600" size={20} />}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          <Input label="Water Point Name/ID" value={data.name} onChange={(v: string) => setData({...data, name: v})} required />
          <Select label="Water Point Type" options={WATER_POINT_TYPES} value={data.type} onChange={(v: string) => setData({...data, type: v})} required />
          <Select label="District" options={MALAWI_DISTRICTS.slice(1)} value={data.district} onChange={(v: string) => setData({...data, district: v})} required />
          <Input label="Health Facility" value={data.facility} onChange={(v: string) => setData({...data, facility: v})} required />
          <Input label="Traditional Authority (TA)" value={data.ta} onChange={(v: string) => setData({...data, ta: v})} required />
          <Input label="Village" value={data.village} onChange={(v: string) => setData({...data, village: v})} required />
          <Select label="Functionality Status" options={['Functional', 'Partially Functional', 'Non-Functional']} value={data.functionality} onChange={(v: any) => setData({...data, functionality: v})} required />
          <Select label="State of Repair" options={['Good', 'Fair', 'Poor']} value={data.repairState} onChange={(v: any) => setData({...data, repairState: v})} required />
        </div>
      </div>
      <div className="flex gap-3 mt-8">
        <Button variant="secondary" onClick={onCancel} className="flex-1">Cancel</Button>
        <Button variant="blue" className="flex-1" onClick={() => onSave({ ...data, id: Date.now().toString() } as WaterPoint)}>
          <Save size={18}/> Register Water Point
        </Button>
      </div>
    </Card>
  );
};

const WaterQualityMonitoringForm = ({ waterPoints, onSave, onCancel }: { waterPoints: WaterPoint[], onSave: (data: WaterQualitySample) => void, onCancel: () => void }) => {
  const [data, setData] = useState<Partial<WaterQualitySample>>({
    h2sTestDone: 'No',
    dpdTestDone: 'No',
    h2sResult: 'Pending'
  });
  const [showProcedures, setShowProcedures] = useState<'h2s' | 'dpd' | null>(null);

  const PROCEDURES = {
    h2s: "1. Collect 20ml water in a sterile bottle containing H2S test strip. 2. Incubate at room temperature (25-35°C) for 24 hours. 3. Observe for color change. Black color indicates fecal contamination (Positive).",
    dpd: "1. Rinse comparator cell with sample water. 2. Fill to 5ml mark. 3. Add one DPD No.1 tablet. 4. Crush and mix until dissolved. 5. Compare the color against the standard scale immediately. Record the reading in mg/L."
  };

  return (
    <Card title="Water Quality Monitoring" description="Perform H2S or DPD tests and record results.">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          <Input label="Sample Identification / Batch ID" value={data.sampleId} onChange={(v: string) => setData({...data, sampleId: v})} required />
          <Select label="Select Water Point" options={waterPoints.map(wp => `${wp.name} (${wp.village})`)} value={data.waterPointName} onChange={(v: string) => {
            const found = waterPoints.find(wp => `${wp.name} (${wp.village})` === v);
            setData({...data, waterPointName: v, waterPointId: found?.id});
          }} required />
          <CustomDatePicker label="Collection Date" value={data.collectionDate || ''} onChange={(v: string) => setData({...data, collectionDate: v})} required />
          <Input label="Collection Time" type="time" value={data.collectionTime} onChange={(v: string) => setData({...data, collectionTime: v})} required />
        </div>

        <div className="space-y-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="flex items-center justify-between">
            <h4 className="font-black text-slate-800 uppercase tracking-widest text-[10px]">Hydrogen Sulphide (H2S) Test</h4>
            <button onClick={() => setShowProcedures(showProcedures === 'h2s' ? null : 'h2s')} className="text-blue-600 text-[10px] font-bold underline">Show Procedure</button>
          </div>
          {showProcedures === 'h2s' && <div className="p-3 bg-blue-50 text-blue-800 text-xs rounded-lg animate-in fade-in slide-in-from-top-2">{PROCEDURES.h2s}</div>}
          <Select label="H2S Test Conducted?" options={['Yes', 'No']} value={data.h2sTestDone} onChange={(v: any) => setData({...data, h2sTestDone: v})} />
          {data.h2sTestDone === 'Yes' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in zoom-in-95">
              <Input label="Incubation Start Time" type="datetime-local" value={data.h2sIncubationStartTime} onChange={(v: string) => setData({...data, h2sIncubationStartTime: v})} />
              <Select label="Result (after 24h)" options={['Pending', 'Positive', 'Negative']} value={data.h2sResult} onChange={(v: any) => setData({...data, h2sResult: v})} />
            </div>
          )}
        </div>

        <div className="space-y-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="flex items-center justify-between">
            <h4 className="font-black text-slate-800 uppercase tracking-widest text-[10px]">DPD Comparator Test</h4>
            <button onClick={() => setShowProcedures(showProcedures === 'dpd' ? null : 'dpd')} className="text-blue-600 text-[10px] font-bold underline">Show Procedure</button>
          </div>
          {showProcedures === 'dpd' && <div className="p-3 bg-blue-50 text-blue-800 text-xs rounded-lg animate-in fade-in slide-in-from-top-2">{PROCEDURES.dpd}</div>}
          <Select label="DPD Test Conducted?" options={['Yes', 'No']} value={data.dpdTestDone} onChange={(v: any) => setData({...data, dpdTestDone: v})} />
          {data.dpdTestDone === 'Yes' && (
            <Input label="Chlorine Result (mg/L or ppm)" type="number" step="0.1" value={data.dpdResult} onChange={(v: number) => setData({...data, dpdResult: v})} />
          )}
        </div>

        <Input label="Action Taken / Recommendations" value={data.actionTaken} onChange={(v: string) => setData({...data, actionTaken: v})} placeholder="e.g. Chlorination scheduled, Public notice issued" />
      </div>
      <div className="flex gap-3 mt-8">
        <Button variant="secondary" onClick={onCancel} className="flex-1">Cancel</Button>
        <Button variant="primary" className="flex-1" onClick={() => onSave({ ...data, id: Date.now().toString(), submittedAt: new Date().toISOString() } as WaterQualitySample)}>
          <TestTube size={18}/> Log Test Results
        </Button>
      </div>
    </Card>
  );
};

const SanitationAssessmentForm = ({ onSave, onCancel }: { onSave: (data: WASHHouseholdAssessment) => void, onCancel: () => void }) => {
  const [data, setData] = useState<Partial<WASHHouseholdAssessment>>({
    hasToilet: 'No',
    isShared: 'No',
    handwashAvailable: 'No',
    soapAvailable: 'No',
    compoundClean: 'No',
    wasteManagement: 'Pit',
    waterTreatment: 'None'
  });

  return (
    <Card title="Household Sanitation Assessment" description="Detailed hygiene and environmental health audit.">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10">
        <div className="space-y-4">
          <h4 className="font-black text-slate-400 uppercase tracking-widest text-[10px] border-b pb-1">Identification & Water</h4>
          <Input label="Household Head Name" value={data.householdHead} onChange={(v: string) => setData({...data, householdHead: v})} required />
          <Input label="Village" value={data.village} onChange={(v: string) => setData({...data, village: v})} required />
          <Select label="Main Water Source" options={WATER_POINT_TYPES} value={data.mainWaterSource} onChange={(v: string) => setData({...data, mainWaterSource: v})} required />
          <Input label="Water Storage Container" placeholder="e.g. Covered Bucket" value={data.waterStorage} onChange={(v: string) => setData({...data, waterStorage: v})} required />
          <Select label="Water Treatment Method" options={WATER_TREATMENT_METHODS} value={data.waterTreatment} onChange={(v: string) => setData({...data, waterTreatment: v})} required />
        </div>

        <div className="space-y-4">
          <h4 className="font-black text-slate-400 uppercase tracking-widest text-[10px] border-b pb-1">Sanitation & Hygiene</h4>
          <Select label="Does Household have a Toilet?" options={['Yes', 'No']} value={data.hasToilet} onChange={(v: any) => setData({...data, hasToilet: v})} required />
          {data.hasToilet === 'Yes' && (
            <div className="pl-6 border-l-2 border-slate-100 space-y-4 animate-in slide-in-from-left-2">
              <Select label="Toilet Type" options={TOILET_TYPES} value={data.toiletType} onChange={(v: string) => setData({...data, toiletType: v})} />
              <Select label="Condition" options={['Clean', 'Dirty', 'Needs Repair']} value={data.toiletCondition} onChange={(v: any) => setData({...data, toiletCondition: v})} />
              <Select label="Is Toilet Shared?" options={['Yes', 'No']} value={data.isShared} onChange={(v: any) => setData({...data, isShared: v})} />
            </div>
          )}
          <Select label="Handwash Station Available?" options={['Yes', 'No']} value={data.handwashAvailable} onChange={(v: any) => setData({...data, handwashAvailable: v})} required />
          <Select label="Soap/Ash Available?" options={['Yes', 'No']} value={data.soapAvailable} onChange={(v: any) => setData({...data, soapAvailable: v})} required />
          <Select label="Is Compound Clean?" options={['Yes', 'No']} value={data.compoundClean} onChange={(v: any) => setData({...data, compoundClean: v})} required />
          <Select label="Waste Management" options={['Pit', 'Indiscriminate', 'Other']} value={data.wasteManagement} onChange={(v: any) => setData({...data, wasteManagement: v})} required />
        </div>
      </div>
      <div className="flex gap-3 mt-8">
        <Button variant="secondary" onClick={onCancel} className="flex-1">Cancel</Button>
        <Button variant="emerald" className="flex-1" onClick={() => onSave({ ...data, id: Date.now().toString(), date: new Date().toISOString() } as WASHHouseholdAssessment)}>
          <Save size={18}/> Submit Assessment
        </Button>
      </div>
    </Card>
  );
};

// --- Landing Page ---

const LandingPage = ({ onLogin }: any) => {
  const [mode, setMode] = useState<'login' | 'register' | 'verify' | 'recovery'>('login');
  const [formData, setFormData] = useState({ 
    fullName: '', phoneNumber: '', district: '', role: UserRole.HSA, password: '', confirmPassword: '', rememberMe: false
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const remembered = getFromStorage<{ phoneNumber: string }>('remembered_user', { phoneNumber: '' });
    if (remembered.phoneNumber) setFormData(prev => ({ ...prev, phoneNumber: remembered.phoneNumber.replace('+265', ''), rememberMe: true }));
  }, []);

  const handlePhoneChange = (v: string) => setFormData({ ...formData, phoneNumber: v.replace(/\D/g, '').slice(0, 9) });

  const handleAction = (e: React.FormEvent) => {
    e.preventDefault();
    const fullPhone = `+265${formData.phoneNumber}`;
    const users = getFromStorage<User[]>('users', []);

    if (mode === 'login') {
      const user = users.find(u => u.phoneNumber === fullPhone && u.password === formData.password);
      if (user) {
        if (formData.rememberMe) saveToStorage('remembered_user', { phoneNumber: fullPhone });
        else localStorage.removeItem('mehis_remembered_user');
        onLogin(user);
      } else setError("Invalid phone number or password.");
    } else if (mode === 'register') {
      const complexityError = validatePasswordComplexity(formData.password);
      if (complexityError) { setError(complexityError); return; }
      if (formData.password !== formData.confirmPassword) { setError("Passwords match error"); return; }
      if (users.find(u => u.phoneNumber === fullPhone)) { setError("Account exists."); return; }
      const newUser = { fullName: formData.fullName, phoneNumber: fullPhone, district: formData.district, role: formData.role, password: formData.password, id: Date.now().toString() };
      saveToStorage('users', [...users, newUser]);
      onLogin(newUser);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-600 to-teal-900 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white/95 backdrop-blur-md rounded-[3rem] shadow-2xl p-10 border border-white/20">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-emerald-100 rounded-[2rem] flex items-center justify-center mx-auto mb-6"><Heart className="text-emerald-600" size={40} /></div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tighter">MeHIS</h1>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">{mode === 'login' ? 'Sign In' : 'Create Account'}</p>
        </div>
        {error && <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm font-medium">{error}</div>}
        <form onSubmit={handleAction} className="space-y-4">
          {mode === 'register' && <Input label="Full Name" value={formData.fullName} onChange={(v:any) => setFormData({...formData, fullName: v})} required />}
          <Input label="Phone Number" value={formData.phoneNumber} onChange={handlePhoneChange} prefix="+265" placeholder="XXXXXXXXX" required />
          <Input label="Password" type="password" value={formData.password} onChange={(v:any) => setFormData({...formData, password: v})} required />
          {mode === 'register' && <Input label="Confirm Password" type="password" value={formData.confirmPassword} onChange={(v:any) => setFormData({...formData, confirmPassword: v})} required />}
          <Button type="submit" className="w-full py-4 text-lg mt-4">Continue</Button>
        </form>
        <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')} className="w-full mt-6 text-sm font-black text-emerald-600 uppercase tracking-widest">{mode === 'login' ? 'New here? Join MeHIS' : 'Back to Login'}</button>
      </div>
    </div>
  );
};

// --- Main App Component ---

export default function App() {
  const [user, setUser] = useState<User | null>(getFromStorage<User | null>('currentUser', null));
  const [view, setView] = useState('home');
  const [washView, setWashView] = useState<'hub' | 'water-points' | 'quality' | 'sanitation'>('hub');
  const [registrationMode, setRegistrationMode] = useState<'hub' | 'form'>('hub');
  
  const [hsaData, setHsaData] = useState<HSARegistration[]>(getFromStorage<HSARegistration[]>('hsaData', []));
  const [waterPoints, setWaterPoints] = useState<WaterPoint[]>(getFromStorage<WaterPoint[]>('waterPoints', []));
  const [qualityLogs, setQualityLogs] = useState<WaterQualitySample[]>(getFromStorage<WaterQualitySample[]>('qualityLogs', []));
  const [sanitationAssessments, setSanitationAssessments] = useState<WASHHouseholdAssessment[]>(getFromStorage<WASHHouseholdAssessment[]>('sanitationAssessments', []));
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => saveToStorage('currentUser', user), [user]);
  useEffect(() => saveToStorage('hsaData', hsaData), [hsaData]);
  useEffect(() => saveToStorage('waterPoints', waterPoints), [waterPoints]);
  useEffect(() => saveToStorage('qualityLogs', qualityLogs), [qualityLogs]);
  useEffect(() => saveToStorage('sanitationAssessments', sanitationAssessments), [sanitationAssessments]);

  const NavItem = ({ id, icon: Icon, label }: any) => (
    <button onClick={() => { setView(id); setIsSidebarOpen(false); setRegistrationMode('hub'); setWashView('hub'); }} className={`flex items-center gap-3 w-full p-4 transition-all ${view === id ? 'text-emerald-700 bg-emerald-50 border-r-4 border-emerald-600 font-black' : 'text-slate-500 hover:bg-slate-50'}`}>
      <Icon size={20} className={view === id ? 'text-emerald-600' : 'text-slate-400'} /><span className="text-sm">{label}</span>
    </button>
  );

  if (!user) return <LandingPage onLogin={(u: User) => setUser(u)} />;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {isSidebarOpen && <div className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />}
      <aside className={`fixed inset-y-0 left-0 w-72 bg-white border-r border-slate-100 z-50 transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-8 border-b flex items-center gap-3"><div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg"><Heart className="text-white" size={22} /></div><h1 className="font-black text-2xl tracking-tighter text-slate-800">MeHIS</h1></div>
        <nav className="py-6">
          <NavItem id="home" icon={Home} label="Home Dashboard" />
          <NavItem id="wash" icon={Droplets} label="WASH" />
          <NavItem id="registration" icon={UserIcon} label="Annual Data Registration" />
          <NavItem id="reporting" icon={FileSpreadsheet} label="Reporting Tool (DB)" />
          <NavItem id="inspections" icon={Search} label="Village Inspections" />
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t"><button onClick={() => setUser(null)} className="flex items-center gap-2 text-rose-500 text-xs font-black uppercase tracking-widest w-full p-3 bg-rose-50 rounded-xl hover:bg-rose-100"><LogOut size={14}/> Logout</button></div>
      </aside>

      <main className="flex-1 overflow-y-auto lg:ml-72">
        <header className="sticky top-0 bg-white/80 backdrop-blur-xl border-b p-6 flex items-center justify-between z-30">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2 text-slate-400" onClick={() => setIsSidebarOpen(true)}><Menu/></button>
            <h2 className="font-black text-slate-800 tracking-tight text-xl uppercase tracking-tighter">
              {view === 'wash' ? 'Water, Sanitation & Hygiene' : 'Community Health Info System'}
            </h2>
          </div>
        </header>

        <div className="p-8 max-w-6xl mx-auto min-h-screen">
          {view === 'home' && (
             <div className="space-y-8 animate-in fade-in">
                <div className="bg-emerald-600 text-white p-12 rounded-[3rem] shadow-2xl relative overflow-hidden">
                  <h1 className="text-4xl font-black mb-4 tracking-tighter">Welcome to MeHIS</h1>
                  <p className="text-emerald-50 text-sm max-w-sm font-medium">Empowering community health workers in Malawi with digitized, offline-first reporting.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <button onClick={() => setView('wash')} className="p-8 bg-white border rounded-[2.5rem] text-left hover:shadow-xl transition-all group">
                    <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors"><Droplets size={28}/></div>
                    <h3 className="font-black text-slate-800 text-xl tracking-tight">WASH</h3>
                    <p className="text-xs text-slate-400 mt-2">Manage water points, quality logs, and sanitation.</p>
                  </button>
                  <button onClick={() => setView('registration')} className="p-8 bg-white border rounded-[2.5rem] text-left hover:shadow-xl transition-all group">
                    <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-colors"><UserIcon size={28}/></div>
                    <h3 className="font-black text-slate-800 text-xl tracking-tight">Annual Registration</h3>
                    <p className="text-xs text-slate-400 mt-2">HSA personnel and infrastructure audits.</p>
                  </button>
                  <button onClick={() => setView('reporting')} className="p-8 bg-white border rounded-[2.5rem] text-left hover:shadow-xl transition-all group">
                    <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-amber-600 group-hover:text-white transition-colors"><Database size={28}/></div>
                    <h3 className="font-black text-slate-800 text-xl tracking-tight">Database</h3>
                    <p className="text-xs text-slate-400 mt-2">Filter and export data to Excel.</p>
                  </button>
                </div>
             </div>
          )}

          {view === 'wash' && (
            <div className="space-y-6">
              {washView === 'hub' ? (
                <div className="space-y-8 animate-in slide-in-from-bottom-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <button onClick={() => setWashView('water-points')} className="p-10 bg-white border-2 border-slate-50 rounded-[3rem] text-center shadow-lg hover:border-blue-500 hover:shadow-xl transition-all group">
                      <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform"><MapPinned size={32}/></div>
                      <h4 className="font-black text-slate-800 text-lg uppercase tracking-tight">Water Points</h4>
                      <p className="text-xs text-slate-400 mt-2">Infrastructure & GPS Logs</p>
                    </button>
                    <button onClick={() => setWashView('quality')} className="p-10 bg-white border-2 border-slate-50 rounded-[3rem] text-center shadow-lg hover:border-emerald-500 hover:shadow-xl transition-all group">
                      <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform"><TestTube size={32}/></div>
                      <h4 className="font-black text-slate-800 text-lg uppercase tracking-tight">Water Quality</h4>
                      <p className="text-xs text-slate-400 mt-2">H2S & DPD Tests</p>
                    </button>
                    <button onClick={() => setWashView('sanitation')} className="p-10 bg-white border-2 border-slate-50 rounded-[3rem] text-center shadow-lg hover:border-amber-500 hover:shadow-xl transition-all group">
                      <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform"><ClipboardList size={32}/></div>
                      <h4 className="font-black text-slate-800 text-lg uppercase tracking-tight">Sanitation</h4>
                      <p className="text-xs text-slate-400 mt-2">Household Assessments</p>
                    </button>
                  </div>

                  <Card title="Recent WASH Activities" description="Overview of the latest entries in the WASH module.">
                    <div className="space-y-4">
                      {waterPoints.slice(-2).map(wp => (
                        <div key={wp.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                          <div className="flex items-center gap-3"><MapPin size={16} className="text-blue-500"/><p className="text-sm font-bold">{wp.name}</p></div>
                          <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-black">Water Point</span>
                        </div>
                      ))}
                      {qualityLogs.slice(-2).map(log => (
                        <div key={log.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                          <div className="flex items-center gap-3"><TestTube size={16} className="text-emerald-500"/><p className="text-sm font-bold">{log.sampleId}</p></div>
                          <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-black">Quality Log</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              ) : (
                <>
                  <button onClick={() => setWashView('hub')} className="flex items-center gap-2 text-xs font-black text-blue-600 uppercase tracking-widest mb-6"><ChevronRight className="rotate-180" size={16}/> Back to WASH Hub</button>
                  {washView === 'water-points' && <WaterPointForm onCancel={() => setWashView('hub')} onSave={(d) => { setWaterPoints([...waterPoints, d]); setWashView('hub'); alert("Water Point Saved."); }} />}
                  {washView === 'quality' && <WaterQualityMonitoringForm waterPoints={waterPoints} onCancel={() => setWashView('hub')} onSave={(d) => { setQualityLogs([...qualityLogs, d]); setWashView('hub'); alert("Water Quality Log Saved."); }} />}
                  {washView === 'sanitation' && <SanitationAssessmentForm onCancel={() => setWashView('hub')} onSave={(d) => { setSanitationAssessments([...sanitationAssessments, d]); setWashView('hub'); alert("Household Assessment Saved."); }} />}
                </>
              )}
            </div>
          )}

          {/* ... Other Views (Reporting, Registration, Inspections) would continue here ... */}
        </div>
      </main>
    </div>
  );
}
