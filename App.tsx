
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
  Target, Map, Briefcase, Trash, MapPinCheck, Timer, TestTube, Construction, UsersRound
} from 'lucide-react';
import { User, UserRole, HSARegistration, VillageData, VillageInspection, HouseholdRecord, ActionPlan, MonthlyWorkPlan, WorkPlanActivity, ActivityOccurrence, AdhocActivity, WaterPoint, WASHHouseholdAssessment, ThreeState, WaterQualitySample, HealthPostInfo, HCMCInfo } from './types';
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

const CheckboxGroup = ({ label, options, selected, onChange, className = "" }: { label: string, options: string[], selected: string[], onChange: (vals: string[]) => void, className?: string }) => (
  <div className={`mb-6 ${className}`}>
    <label className="text-sm font-semibold text-slate-600 block mb-3">{label}</label>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {options.map(opt => (
        <label key={opt} className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group">
          <input 
            type="checkbox" 
            checked={selected.includes(opt)}
            onChange={e => {
              if (e.target.checked) onChange([...selected, opt]);
              else onChange(selected.filter(s => s !== opt));
            }}
            className="w-5 h-5 accent-emerald-600 rounded-md" 
          />
          <span className="text-sm text-slate-700 font-medium group-hover:text-slate-900">{opt}</span>
        </label>
      ))}
    </div>
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

const SectionHeader = ({ title, icon: Icon }: { title: string, icon: any }) => (
  <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mb-4 mt-6 first:mt-0">
    <Icon className="text-emerald-600" size={18} />
    <h4 className="font-black text-slate-700 uppercase tracking-widest text-[10px]">{title}</h4>
  </div>
);

// --- Module Form Components ---

const HealthPostForm = ({ onSave, onCancel, initialData }: { onSave: (data: HealthPostInfo) => void, onCancel: () => void, initialData?: HealthPostInfo }) => {
  const [data, setData] = useState<Partial<HealthPostInfo>>({
    staffAvailable: [],
    electricityTypes: [],
    isFunctional: 'Yes',
    hasWater: 'No',
    hasElectricity: 'No',
    coords: null
  });

  useEffect(() => {
    if (initialData) {
      setData(initialData);
    } else {
      navigator.geolocation.getCurrentPosition(
        (pos) => setData(prev => ({ ...prev, coords: { lat: pos.coords.latitude, lng: pos.coords.longitude } })),
        (err) => console.error("GPS capture failed", err)
      );
    }
  }, [initialData]);

  return (
    <Card title={initialData ? "Edit Health Post" : "Health Post Information"} description="Capture health infrastructure details and resource availability.">
      <div className="space-y-6">
        <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-between">
           <div className="flex items-center gap-3 text-blue-800">
             <MapPin size={24} />
             <div>
               <p className="text-[10px] font-black uppercase tracking-widest">Geolocation Capture</p>
               <p className="text-sm font-bold">{data.coords ? `${data.coords.lat.toFixed(6)}, ${data.coords.lng.toFixed(6)}` : 'Capturing GPS...'}</p>
             </div>
           </div>
           {data.coords && <CheckCircle2 className="text-emerald-500" />}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          <Select label="District" options={MALAWI_DISTRICTS.slice(1)} value={data.district} onChange={(v: string) => setData({...data, district: v})} required />
          <Input label="Health Post Name" value={data.name} onChange={(v: string) => setData({...data, name: v})} required />
          <Input label="Village" value={data.village} onChange={(v: string) => setData({...data, village: v})} required />
          <Input label="GVH" value={data.gvh} onChange={(v: string) => setData({...data, gvh: v})} required />
          <Input label="Traditional Authority (TA)" value={data.ta} onChange={(v: string) => setData({...data, ta: v})} required />
          <Input label="Health Facility" value={data.facility} onChange={(v: string) => setData({...data, facility: v})} required />
          <Input label="Catchment Population" type="number" value={data.catchmentPopulation} onChange={(v: number) => setData({...data, catchmentPopulation: v})} required />
          <Select label="Year Constructed" options={YEARS} value={data.yearConstructed} onChange={(v: string) => setData({...data, yearConstructed: v})} required />
          <Select label="Is Health Post Functional?" options={['Yes', 'No']} value={data.isFunctional} onChange={(v: any) => setData({...data, isFunctional: v})} required />
        </div>

        <CheckboxGroup 
          label="Health Staff Available (Select Multiple)" 
          options={['HSA', 'CMA', 'CHN', 'None']} 
          selected={data.staffAvailable || []} 
          onChange={(v) => setData({...data, staffAvailable: v})} 
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          <Select label="Water Access?" options={['Yes', 'No']} value={data.hasWater} onChange={(v: any) => setData({...data, hasWater: v})} required />
          <Select label="Electricity Access?" options={['Yes', 'No']} value={data.hasElectricity} onChange={(v: any) => setData({...data, hasElectricity: v})} required />
        </div>

        {data.hasElectricity === 'Yes' && (
          <CheckboxGroup 
            label="Electricity Type (Select Multiple)" 
            options={['ESCOM', 'Solar', 'Generator', 'Other']} 
            selected={data.electricityTypes || []} 
            onChange={(v) => setData({...data, electricityTypes: v})} 
            className="animate-in slide-in-from-top-2"
          />
        )}

        <Input label="Remarks" value={data.remarks} onChange={(v: string) => setData({...data, remarks: v})} placeholder="Any additional infrastructure observations" />
      </div>
      <div className="flex gap-4 mt-8">
        <Button variant="secondary" className="flex-1" onClick={onCancel}>Cancel</Button>
        <Button variant="primary" className="flex-1" onClick={() => onSave({...data, id: data.id || Date.now().toString(), submittedAt: data.submittedAt || new Date().toISOString()} as HealthPostInfo)}>
          <Save size={18}/> {initialData ? 'Update Health Post Data' : 'Save Health Post Data'}
        </Button>
      </div>
    </Card>
  );
};

const HCMCForm = ({ onSave, onCancel, initialData }: { onSave: (data: HCMCInfo) => void, onCancel: () => void, initialData?: HCMCInfo }) => {
  const [data, setData] = useState<Partial<HCMCInfo>>({
    isFormed: 'No',
    isOrientedRoles: 'No',
    isOrientedDFF: 'No',
    isFunctional: 'No',
    district: '',
    hcmcName: '',
    village: '',
    gvh: '',
    ta: '',
    facility: '',
    remarks: ''
  });

  useEffect(() => {
    if (initialData) {
      setData(initialData);
    }
  }, [initialData]);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    const requiredFields = ['district', 'hcmcName', 'village', 'gvh', 'ta', 'facility'];
    requiredFields.forEach(f => {
      if (!data[f as keyof HCMCInfo]) newErrors[f] = "This field is required";
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validate()) {
      onSave({
        ...data,
        id: data.id || Date.now().toString(),
        submittedAt: data.submittedAt || new Date().toISOString()
      } as HCMCInfo);
    }
  };

  return (
    <Card 
      title={initialData ? "Edit HCMC Record" : "HCMC Registration Form"} 
      description="Record committee formation, orientation, and operational status for Health Centre Management Committees."
    >
      <div className="space-y-6">
        <SectionHeader title="Location & Identification" icon={MapPin} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          <Select 
            label="District" 
            options={MALAWI_DISTRICTS.slice(1)} 
            value={data.district} 
            onChange={(v: string) => setData({...data, district: v})} 
            error={errors.district}
            required 
          />
          <Input 
            label="HCMC Name" 
            value={data.hcmcName} 
            onChange={(v: string) => setData({...data, hcmcName: v})} 
            placeholder="e.g. Area 25 HCMC"
            error={errors.hcmcName}
            required 
          />
          <Input 
            label="Health Facility" 
            value={data.facility} 
            onChange={(v: string) => setData({...data, facility: v})} 
            placeholder="Parent health facility"
            error={errors.facility}
            required 
          />
          <Input 
            label="Traditional Authority (TA)" 
            value={data.ta} 
            onChange={(v: string) => setData({...data, ta: v})} 
            error={errors.ta}
            required 
          />
          <Input 
            label="GVH" 
            value={data.gvh} 
            onChange={(v: string) => setData({...data, gvh: v})} 
            error={errors.gvh}
            required 
          />
          <Input 
            label="Village" 
            value={data.village} 
            onChange={(v: string) => setData({...data, village: v})} 
            error={errors.village}
            required 
          />
        </div>

        <SectionHeader title="Committee Status & Functionality" icon={ClipboardCheck} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
          <Select 
            label="HCMC Formed?" 
            options={['Yes', 'No']} 
            value={data.isFormed} 
            onChange={(v: any) => setData({...data, isFormed: v})} 
          />
          <Select 
            label="Committee Functional?" 
            options={['Yes', 'No']} 
            value={data.isFunctional} 
            onChange={(v: any) => setData({...data, isFunctional: v})} 
          />
          <Select 
            label="Oriented on Roles & Responsibilities?" 
            options={['Yes', 'No']} 
            value={data.isOrientedRoles} 
            onChange={(v: any) => setData({...data, isOrientedRoles: v})} 
          />
          <Select 
            label="Oriented on Direct Facility Funding (DFF)?" 
            options={['Yes', 'No']} 
            value={data.isOrientedDFF} 
            onChange={(v: any) => setData({...data, isOrientedDFF: v})} 
          />
        </div>

        <Input 
          label="Additional Remarks" 
          value={data.remarks} 
          onChange={(v: string) => setData({...data, remarks: v})} 
          placeholder="Notes on committee meetings, challenges, or successes..." 
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-slate-100">
        <Button variant="secondary" className="flex-1" onClick={onCancel} size="lg">Cancel</Button>
        <Button variant="primary" className="flex-[2]" onClick={handleSave} size="lg">
          <Save size={18}/> {initialData ? 'Update HCMC Record' : 'Save HCMC Record'}
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
          <Button type="submit" className="w-full py-4 text-lg mt-4 shadow-xl shadow-emerald-200">Continue</Button>
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
  const [registrationMode, setRegistrationMode] = useState<'hub' | 'form'>('hub');
  
  const [hsaData, setHsaData] = useState<HSARegistration[]>(getFromStorage<HSARegistration[]>('hsaData', []));
  const [healthPosts, setHealthPosts] = useState<HealthPostInfo[]>(getFromStorage<HealthPostInfo[]>('healthPosts', []));
  const [hcmcRecords, setHcmcRecords] = useState<HCMCInfo[]>(getFromStorage<HCMCInfo[]>('hcmcRecords', []));
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Editing state
  const [editingHealthPost, setEditingHealthPost] = useState<HealthPostInfo | undefined>(undefined);
  const [editingHcmc, setEditingHcmc] = useState<HCMCInfo | undefined>(undefined);

  useEffect(() => saveToStorage('currentUser', user), [user]);
  useEffect(() => saveToStorage('hsaData', hsaData), [hsaData]);
  useEffect(() => saveToStorage('healthPosts', healthPosts), [healthPosts]);
  useEffect(() => saveToStorage('hcmcRecords', hcmcRecords), [hcmcRecords]);

  const handleEditHealthPost = (hp: HealthPostInfo) => {
    setEditingHealthPost(hp);
    setRegistrationMode('form');
  };

  const handleEditHcmc = (rec: HCMCInfo) => {
    setEditingHcmc(rec);
    setRegistrationMode('form');
  };

  const handleCancelForm = () => {
    setEditingHealthPost(undefined);
    setEditingHcmc(undefined);
    setRegistrationMode('hub');
  };

  const NavItem = ({ id, icon: Icon, label }: any) => (
    <button onClick={() => { setView(id); setIsSidebarOpen(false); setRegistrationMode('hub'); setEditingHealthPost(undefined); setEditingHcmc(undefined); }} className={`flex items-center gap-3 w-full p-4 transition-all ${view === id ? 'text-emerald-700 bg-emerald-50 border-r-4 border-emerald-600 font-black' : 'text-slate-500 hover:bg-slate-50'}`}>
      <Icon size={20} className={view === id ? 'text-emerald-600' : 'text-slate-400'} /><span className="text-sm">{label}</span>
    </button>
  );

  if (!user) return <LandingPage onLogin={(u: User) => setUser(u)} />;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {isSidebarOpen && <div className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />}
      <aside className={`fixed inset-y-0 left-0 w-72 bg-white border-r border-slate-100 z-50 transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-8 border-b flex items-center gap-3"><div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg"><Heart className="text-white" size={22} /></div><h1 className="font-black text-2xl tracking-tighter text-slate-800">MeHIS</h1></div>
        <nav className="py-6 overflow-y-auto max-h-[calc(100vh-160px)]">
          <NavItem id="home" icon={Home} label="Home Dashboard" />
          <NavItem id="registration" icon={UserIcon} label="Annual Data Registration" />
          <NavItem id="health-posts" icon={Building2} label="Health Post Information" />
          <NavItem id="hcmc" icon={UsersRound} label="HCMC Information" />
          <NavItem id="wash" icon={Droplets} label="WASH" />
          <NavItem id="reporting" icon={FileSpreadsheet} label="Reporting Tool (DB)" />
          <NavItem id="inspections" icon={Search} label="Village Inspections" />
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t"><button onClick={() => setUser(null)} className="flex items-center gap-2 text-rose-500 text-xs font-black uppercase tracking-widest w-full p-3 bg-rose-50 rounded-xl hover:bg-rose-100"><LogOut size={14}/> Logout</button></div>
      </aside>

      <main className="flex-1 overflow-y-auto lg:ml-72">
        <header className="sticky top-0 bg-white/80 backdrop-blur-xl border-b p-6 flex items-center justify-between z-30">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2 text-slate-400" onClick={() => setIsSidebarOpen(true)}><Menu/></button>
            <h2 className="font-black text-slate-800 tracking-tight text-xl uppercase">
              {view === 'health-posts' ? 'Infrastructure Audit' : view === 'hcmc' ? 'Committee Tracking' : view === 'registration' ? 'HSA Personnel Audit' : 'MeHIS Platform'}
            </h2>
          </div>
        </header>

        <div className="p-8 max-w-6xl mx-auto min-h-screen">
          {view === 'home' && (
             <div className="space-y-8 animate-in fade-in">
                <div className="bg-emerald-600 text-white p-12 rounded-[3rem] shadow-2xl relative overflow-hidden">
                  <h1 className="text-4xl font-black mb-4 tracking-tighter">Community Health Digital Hub</h1>
                  <p className="text-emerald-50 text-sm max-w-sm font-medium">Digitalizing facility management and community health reporting for Malawi.</p>
                  <div className="absolute -top-10 -right-10 w-80 h-80 bg-emerald-500/30 rounded-full blur-[100px]"></div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <button onClick={() => setView('registration')} className="p-8 bg-white border rounded-[2.5rem] text-left hover:shadow-xl transition-all group">
                    <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-colors"><UserIcon size={28}/></div>
                    <h3 className="font-black text-slate-800 text-xl tracking-tight">HSA Audit</h3>
                    <p className="text-xs text-slate-400 mt-2">Annual HSA personnel and infrastructure data registration.</p>
                  </button>
                  <button onClick={() => setView('health-posts')} className="p-8 bg-white border rounded-[2.5rem] text-left hover:shadow-xl transition-all group">
                    <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors"><Building2 size={28}/></div>
                    <h3 className="font-black text-slate-800 text-xl tracking-tight">Health Posts</h3>
                    <p className="text-xs text-slate-400 mt-2">Manage health post infrastructure, staff, and resources.</p>
                  </button>
                  <button onClick={() => setView('hcmc')} className="p-8 bg-white border rounded-[2.5rem] text-left hover:shadow-xl transition-all group">
                    <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-purple-600 group-hover:text-white transition-colors"><UsersRound size={28}/></div>
                    <h3 className="font-black text-slate-800 text-xl tracking-tight">HCMC Information</h3>
                    <p className="text-xs text-slate-400 mt-2">Track management committees and orientation status.</p>
                  </button>
                </div>
             </div>
          )}

          {view === 'health-posts' && (
             <div className="space-y-6">
               <div className="flex justify-between items-center px-2">
                 <div><h3 className="text-2xl font-black text-slate-800 tracking-tighter">Health Post Directory</h3><p className="text-sm text-slate-400">Manage community health infrastructure records</p></div>
                 <Button onClick={() => { setEditingHealthPost(undefined); setRegistrationMode('form'); }} size="lg" variant="blue"><Plus size={20}/> New Health Post</Button>
               </div>
               
               {registrationMode === 'hub' ? (
                 <Card className="p-4">
                   {healthPosts.length === 0 ? (
                     <div className="text-center py-16"><Building2 size={48} className="mx-auto text-slate-100 mb-4"/><p className="text-slate-300 font-bold">No health post records found</p></div>
                   ) : (
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       {healthPosts.map(hp => (
                         <div key={hp.id} className="p-4 bg-slate-50 border rounded-2xl flex justify-between items-center hover:shadow-md transition-shadow">
                           <div className="flex items-center gap-4">
                             <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600"><Building2 size={20}/></div>
                             <div>
                               <p className="font-black text-slate-800">{hp.name}</p>
                               <p className="text-[10px] text-slate-400 uppercase tracking-widest">{hp.village} | {hp.district}</p>
                             </div>
                           </div>
                           <div className="flex gap-1">
                             <Button variant="ghost" className="text-blue-500" onClick={() => handleEditHealthPost(hp)}><Edit size={16}/></Button>
                             <Button variant="ghost" className="text-rose-500" onClick={() => setHealthPosts(healthPosts.filter(h => h.id !== hp.id))}><Trash size={16}/></Button>
                           </div>
                         </div>
                       ))}
                     </div>
                   )}
                 </Card>
               ) : (
                 <HealthPostForm 
                  initialData={editingHealthPost}
                  onCancel={handleCancelForm} 
                  onSave={(d) => { 
                    if (editingHealthPost) {
                      setHealthPosts(healthPosts.map(h => h.id === d.id ? d : h));
                    } else {
                      setHealthPosts([...healthPosts, d]); 
                    }
                    handleCancelForm();
                  }} 
                 />
               )}
             </div>
          )}

          {view === 'hcmc' && (
             <div className="space-y-6">
               <div className="flex justify-between items-center px-2">
                 <div><h3 className="text-2xl font-black text-slate-800 tracking-tighter">HCMC Database</h3><p className="text-sm text-slate-400">Track committee formation and training</p></div>
                 <Button onClick={() => { setEditingHcmc(undefined); setRegistrationMode('form'); }} size="lg" variant="amber"><Plus size={20}/> New HCMC Entry</Button>
               </div>

               {registrationMode === 'hub' ? (
                 <Card className="p-4">
                   {hcmcRecords.length === 0 ? (
                     <div className="text-center py-16"><UsersRound size={48} className="mx-auto text-slate-100 mb-4"/><p className="text-slate-300 font-bold">No HCMC records found</p></div>
                   ) : (
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       {hcmcRecords.map(rec => (
                         <div key={rec.id} className="p-4 bg-slate-50 border rounded-2xl flex justify-between items-center hover:shadow-md transition-shadow">
                           <div className="flex items-center gap-4">
                             <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600"><UsersRound size={20}/></div>
                             <div>
                               <p className="font-black text-slate-800">{rec.hcmcName}</p>
                               <p className="text-[10px] text-slate-400 uppercase tracking-widest">{rec.facility} | {rec.district}</p>
                             </div>
                           </div>
                           <div className="flex gap-1">
                             <Button variant="ghost" className="text-amber-600" onClick={() => handleEditHcmc(rec)}><Edit size={16}/></Button>
                             <Button variant="ghost" className="text-rose-500" onClick={() => setHcmcRecords(hcmcRecords.filter(h => h.id !== rec.id))}><Trash size={16}/></Button>
                           </div>
                         </div>
                       ))}
                     </div>
                   )}
                 </Card>
               ) : (
                 <HCMCForm 
                  initialData={editingHcmc}
                  onCancel={handleCancelForm} 
                  onSave={(d) => { 
                    if (editingHcmc) {
                      setHcmcRecords(hcmcRecords.map(r => r.id === d.id ? d : r));
                    } else {
                      setHcmcRecords([...hcmcRecords, d]); 
                    }
                    handleCancelForm();
                  }} 
                 />
               )}
             </div>
          )}

          {view === 'registration' && (
             <div className="space-y-6">
               {registrationMode === 'hub' ? (
                 <div className="space-y-8 animate-in slide-in-from-bottom-4">
                    <div className="flex justify-between items-center px-2">
                      <div><h3 className="text-2xl font-black text-slate-800 tracking-tighter">Annual Registration Hub</h3><p className="text-sm text-slate-400">Track and update HSA audit information</p></div>
                      <Button onClick={() => setRegistrationMode('form')} size="lg"><Plus size={20}/> New Annual Audit</Button>
                    </div>
                    <Card title="HSA Annual Data Records" description="List of submitted annual personnel and infrastructure audits.">
                      {hsaData.length === 0 ? (
                        <div className="text-center py-16"><UserIcon size={48} className="mx-auto text-slate-100 mb-4" /><p className="font-bold text-slate-300">No annual registrations found</p></div>
                      ) : (
                        <div className="space-y-3">
                          {hsaData.map(record => (
                            <div key={record.id} className="p-4 bg-slate-50 border rounded-2xl flex justify-between items-center hover:bg-white transition-all hover:shadow-sm">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600"><UserIcon size={20}/></div>
                                <div><p className="font-black text-slate-800">{record.hsaName}</p><p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Audit Date: {new Date(record.submittedAt!).toLocaleDateString()}</p></div>
                              </div>
                              <div className="flex gap-2">
                                <Button variant="ghost" className="text-rose-500" size="sm" onClick={() => setHsaData(hsaData.filter(r => r.id !== record.id))}><Trash size={14}/></Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </Card>
                  </div>
               ) : (
                 <HSARegistrationForm onCancel={() => setRegistrationMode('hub')} onSave={(d: any) => { setHsaData([...hsaData, d]); setRegistrationMode('hub'); }} />
               )}
             </div>
          )}

          {view === 'reporting' && (
             <DistrictReportingTool records={hsaData} />
          )}

          {view === 'wash' && (
            <div className="space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4">
                  <button className="p-10 bg-white border-2 border-slate-50 rounded-[3rem] text-center shadow-lg hover:border-blue-500 transition-all group">
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform"><MapPinned size={32}/></div>
                    <h4 className="font-black text-slate-800 text-lg uppercase tracking-tight">Water Points</h4>
                  </button>
                  <button className="p-10 bg-white border-2 border-slate-50 rounded-[3rem] text-center shadow-lg hover:border-emerald-500 transition-all group">
                    <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform"><TestTube size={32}/></div>
                    <h4 className="font-black text-slate-800 text-lg uppercase tracking-tight">Quality</h4>
                  </button>
                  <button className="p-10 bg-white border-2 border-slate-50 rounded-[3rem] text-center shadow-lg hover:border-amber-500 transition-all group">
                    <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform"><ClipboardList size={32}/></div>
                    <h4 className="font-black text-slate-800 text-lg uppercase tracking-tight">Sanitation</h4>
                  </button>
               </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// Re-defining internal component placeholders
const HSARegistrationForm = ({ onCancel, onSave }: any) => {
  return (
    <div className="p-12 bg-white rounded-3xl border border-slate-100 text-center shadow-sm">
      <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6"><UserIcon size={32}/></div>
      <h3 className="text-xl font-black text-slate-800 mb-2">Personnel Audit Form</h3>
      <p className="text-slate-400 mb-8 max-w-xs mx-auto text-sm">You are starting a new annual personnel and catchment audit for an HSA.</p>
      <div className="flex gap-4 justify-center">
        <Button onClick={onCancel} variant="secondary">Cancel</Button>
        <Button onClick={() => onSave({id: Date.now().toString(), hsaName: 'HSA Personnel Audit Sample', submittedAt: new Date().toISOString()})} variant="primary">Submit Mock Audit</Button>
      </div>
    </div>
  );
}

const DistrictReportingTool = ({ records }: { records: HSARegistration[] }) => {
  return (
    <Card title="District Reporting Dashboard">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-2xl font-black text-slate-800 tracking-tight">{records.length}</p>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Audit Records</p>
        </div>
        <Button variant="primary"><Download size={14}/> Export to CSV</Button>
      </div>
      <div className="p-20 text-center border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50/30">
        <FileSpreadsheet size={48} className="mx-auto text-slate-200 mb-4" />
        <p className="text-slate-300 font-bold">Data visualization engine ready</p>
        <p className="text-slate-200 text-xs mt-1">Filters: District, Facility, Catchment Population</p>
      </div>
    </Card>
  );
};
