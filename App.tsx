
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
  Target, Map, Briefcase, Trash, MapPinCheck, Timer, TestTube, Construction, UsersRound,
  GraduationCap, BriefcaseIcon, Phone, MapPinIcon, Tool, Bike, Shirt, Umbrella, ShieldAlert,
  BarChart3, PieChart
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

const Input = ({ label, value, onChange, type = "text", placeholder = "", required = false, maxLength, pattern, error, className = "", min, max, step, prefix, disabled, icon: Icon }: any) => {
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
        {Icon && !prefix && (
          <span className="absolute left-4 text-slate-400 pointer-events-none">
            <Icon size={18} />
          </span>
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
          className={`w-full ${prefix || Icon ? 'pl-11' : 'px-4'} ${isPassword ? 'pr-20' : ''} py-2.5 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all bg-white disabled:bg-slate-50 ${error ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-200 shadow-sm shadow-slate-100/30'}`}
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

const Select = ({ label, value, onChange, options, required = false, error, className = "", icon: Icon }: any) => (
  <div className={`flex flex-col gap-1 mb-4 ${className}`}>
    {label && <label className="text-sm font-semibold text-slate-600">{label}{required && <span className="text-rose-500">*</span>}</label>}
    <div className="relative">
      {Icon && (
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          <Icon size={18} />
        </span>
      )}
      <select 
        value={value || ""} 
        onChange={e => onChange(e.target.value)}
        required={required}
        className={`${Icon ? 'pl-11' : 'px-4'} w-full py-2.5 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-white shadow-sm shadow-slate-100/30 appearance-none ${error ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-200'}`}
      >
        <option value="">Select...</option>
        {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
        <ChevronRight size={16} className="rotate-90" />
      </div>
    </div>
    {error && <p className="text-[10px] text-rose-500 font-medium flex items-center gap-1 mt-1.5"><AlertCircle size={10}/> {error}</p>}
  </div>
);

// Fix: Making children optional to resolve "Property 'children' is missing" errors in multiple lines (274, 582, 717, 768, 1003, 1080, 1127)
const Card = ({ children, className = "" }: { children?: React.ReactNode, className?: string }) => (
  <div className={`bg-white rounded-[2.5rem] border border-slate-100 shadow-sm ${className}`}>
    {children}
  </div>
);

const SectionHeader = ({ title, icon: Icon }: { title: string, icon: any }) => (
  <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mb-4 mt-8 first:mt-0">
    <Icon className="text-emerald-600" size={18} />
    <h4 className="font-black text-slate-700 uppercase tracking-widest text-[10px]">{title}</h4>
  </div>
);

const DeleteConfirmationModal = ({ isOpen, onCancel, onConfirm }: { isOpen: boolean, onCancel: () => void, onConfirm: () => void }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[2rem] max-w-sm w-full shadow-2xl p-8 border border-slate-100 animate-in zoom-in-95 duration-200">
        <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <AlertOctagon size={32} />
        </div>
        <h3 className="text-xl font-black text-slate-800 text-center mb-3 tracking-tight">Delete Record?</h3>
        <p className="text-slate-500 text-center text-sm mb-8 leading-relaxed">
          Are you sure you want to delete this record? This action cannot be undone.
        </p>
        <div className="flex flex-col gap-3">
          <Button variant="danger" size="lg" className="w-full" onClick={onConfirm}>
            Yes, Delete Permanently
          </Button>
          <Button variant="ghost" className="w-full text-slate-400 font-bold" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

// --- Module Form Components ---

/**
 * HSA Registration Form
 * Replaced original personnel audit with systematic interlinked subsections.
 */
const HSARegistrationForm = ({ initialData, onCancel, onSave }: { initialData?: HSARegistration, onCancel: () => void, onSave: (data: HSARegistration) => void }) => {
  const [data, setData] = useState<Partial<HSARegistration>>(initialData || {
    district: '', hsaName: '', sex: 'Female', position: 'HSA', grade: 'HL',
    filledCatchment: 'No', qualification: 'MSCE', trainedICHIS: 'No',
    preserviceShort: 'No', preserviceLong: 'No', mscePasses: 'No',
    healthPostAvailable: 'No', villageClinic: 'No', villageClinicFunctional: 'No',
    hardToReach: 'No', residentInCatchment: 'No', govPhone: 'No', solarCharger: 'No',
    thematicTrainings: TRAINING_TOPICS.reduce((acc, topic) => ({ ...acc, [topic]: 'No' }), {}),
    supplies: {
      bicycle: { received: 'No' }, motorcycle: { received: 'No' },
      uniforms: { received: 'No' }, gumboots: { received: 'No' },
      raincoat: { received: 'No' }, umbrella: { received: 'No' },
      drugBoxes: { received: 'No' }, torch: { received: 'No' }
    },
    villages: [], gvhNames: [''],
    homeDistrict: '', homeTA: '', homeGVH: '', homeVillage: '', postalAddress: ''
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (!initialData) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setData(prev => ({ ...prev, coords: { lat: pos.coords.latitude, lng: pos.coords.longitude } })),
        (err) => console.warn("Geolocation denied/failed")
      );
    }
  }, [initialData]);

  const handleThematicChange = (topic: string, val: 'Yes' | 'No') => {
    setData(prev => ({
      ...prev,
      thematicTrainings: { ...prev.thematicTrainings, [topic]: val }
    }));
  };

  const handleSupplyChange = (key: keyof HSARegistration['supplies'], field: 'received' | 'year', val: string) => {
    setData(prev => ({
      ...prev,
      supplies: {
        ...prev.supplies!,
        [key]: { ...prev.supplies![key], [field]: val }
      }
    }));
  };

  const addVillage = () => {
    setData(prev => ({
      ...prev,
      villages: [...(prev.villages || []), { id: Date.now().toString(), name: '', population: 0, isGazette: false }]
    }));
  };

  const removeVillage = (id: string) => {
    setData(prev => ({
      ...prev,
      villages: prev.villages?.filter(v => v.id !== id)
    }));
  };

  const updateVillage = (id: string, field: keyof VillageData, val: any) => {
    setData(prev => ({
      ...prev,
      villages: prev.villages?.map(v => v.id === id ? { ...v, [field]: val } : v)
    }));
  };

  const addGVH = () => setData(prev => ({ ...prev, gvhNames: [...(prev.gvhNames || []), ''] }));
  const updateGVH = (idx: number, val: string) => {
    const next = [...(data.gvhNames || [])];
    next[idx] = val;
    setData(prev => ({ ...prev, gvhNames: next }));
  };

  const handleSave = () => {
    // Systematic Validation
    const newErrors: any = {};
    if (!data.hsaName) newErrors.hsaName = "Name is required";
    if (!data.district) newErrors.district = "District is required";
    if (data.employmentNumber && data.employmentNumber.length > 8) newErrors.employmentNumber = "Max 8 digits";
    if (data.nationalId && !/^[A-Z0-9]{8}$/.test(data.nationalId)) newErrors.nationalId = "8 Alphanumeric Caps";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      alert("Please fix validation errors before saving.");
      return;
    }

    const finalData = {
      ...data,
      id: data.id || Date.now().toString(),
      submittedAt: new Date().toISOString()
    } as HSARegistration;
    onSave(finalData);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-3xl font-black text-slate-800 tracking-tighter">HSA annual data Registration</h3>
          <p className="text-slate-400 text-sm font-medium">Interlinked systematic personnel and catchment audit.</p>
        </div>
        <Button variant="ghost" onClick={onCancel} className="text-slate-400 hover:text-rose-500"><X size={24}/></Button>
      </div>

      <Card className="p-8 space-y-12">
        {/* a. Identification */}
        <section>
          <SectionHeader title="a. HSA Identification & Home Address" icon={UserIcon} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6">
            <Select label="District" options={MALAWI_DISTRICTS.slice(1)} value={data.district} onChange={(v:any)=>setData({...data, district: v})} error={errors.district} required />
            <Input label="HSA Full Name" value={data.hsaName} onChange={(v:any)=>setData({...data, hsaName: v})} error={errors.hsaName} required icon={UserIcon} />
            <Select label="Sex" options={['Male', 'Female']} value={data.sex} onChange={(v:any)=>setData({...data, sex: v})} />
            <Select label="Position" options={['HSA', 'SHSA']} value={data.position} onChange={(v:any)=>setData({...data, position: v})} />
            <Select label="Grade" options={['HM', 'HL']} value={data.grade} onChange={(v:any)=>setData({...data, grade: v})} />
            <Select label="Filled Catchment Area?" options={['Yes', 'No']} value={data.filledCatchment} onChange={(v:any)=>setData({...data, filledCatchment: v})} />
            <Select label="Academic Qualification" options={['PLSCE', 'JCE', 'MSCE']} value={data.qualification} onChange={(v:any)=>setData({...data, qualification: v})} />
            <Select label="Year Appointed" options={YEARS} value={data.yearAppointed} onChange={(v:any)=>setData({...data, yearAppointed: v})} />
            <Input label="Date of Birth" type="date" value={data.dob} onChange={(v:any)=>setData({...data, dob: v})} icon={CalendarIcon} />
            <Input label="Employment Number (Max 8)" value={data.employmentNumber} onChange={(v:any)=>setData({...data, employmentNumber: v.replace(/\D/g, '').slice(0, 8)})} maxLength={8} error={errors.employmentNumber} />
            <Input label="National ID (strictly Capital letters 8 figures/letters)" value={data.nationalId} onChange={(v:any)=>setData({...data, nationalId: v.toUpperCase()})} maxLength={8} placeholder="CAPITALS" error={errors.nationalId} />
            <Input label="Contact (numbers)" value={data.contact} onChange={(v:any)=>setData({...data, contact: v.replace(/\D/g, '')})} icon={Phone} />
            <Select label="Salary Support" options={['Government', 'Partner']} value={data.salarySupport} onChange={(v:any)=>setData({...data, salarySupport: v})} />
            <Select label="Recruited By" options={RECRUITERS} value={data.recruitedBy} onChange={(v:any)=>setData({...data, recruitedBy: v})} />
            {data.recruitedBy === 'Other' && (
              <Input label="Specify Recruiter" value={data.recruitedByOther} onChange={(v:any)=>setData({...data, recruitedByOther: v})} className="animate-in slide-in-from-top-2" />
            )}
          </div>
          <div className="mt-6 p-6 bg-slate-50 rounded-3xl border border-slate-100">
             <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">HSA Permanent Home Address</h5>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6">
               <Select label="Home District" options={MALAWI_DISTRICTS.slice(1)} value={data.homeDistrict} onChange={(v:any)=>setData({...data, homeDistrict: v})} />
               <Input label="Traditional Authority (TA)" value={data.homeTA} onChange={(v:any)=>setData({...data, homeTA: v})} />
               <Input label="GVH" value={data.homeGVH} onChange={(v:any)=>setData({...data, homeGVH: v})} />
               <Input label="Village" value={data.homeVillage} onChange={(v:any)=>setData({...data, homeVillage: v})} />
               <Input label="Postal Address (Optional)" value={data.postalAddress} onChange={(v:any)=>setData({...data, postalAddress: v})} />
             </div>
          </div>
        </section>

        {/* b. Training Status */}
        <section>
          <SectionHeader title="b. Training Status" icon={GraduationCap} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6">
            <Select label="Trained in iCHIS?" options={['Yes', 'No']} value={data.trainedICHIS} onChange={(v:any)=>setData({...data, trainedICHIS: v})} />
            <Select label="Preservice ≤12 weeks?" options={['Yes', 'No']} value={data.preserviceShort} onChange={(v:any)=>setData({...data, preserviceShort: v})} />
            <Select label="1-Year Preservice?" options={['Yes', 'No']} value={data.preserviceLong} onChange={(v:any)=>setData({...data, preserviceLong: v})} />
            <Select label="MSCE Pass (Eng, Math, Bio/GenSci)?" options={['Yes', 'No']} value={data.mscePasses} onChange={(v:any)=>setData({...data, mscePasses: v})} />
          </div>
        </section>

        {/* c. HSA Location */}
        <section>
          <SectionHeader title="c. HSA Location" icon={MapPinIcon} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 mb-6">
            <Input label="Reporting Facility" value={data.reportingFacility} onChange={(v:any)=>setData({...data, reportingFacility: v})} icon={Building2} />
            <Select label="Reporting Facility Type" options={['Government', 'CHAM', 'Private', 'Other']} value={data.facilityType} onChange={(v:any)=>setData({...data, facilityType: v})} />
            {data.facilityType === 'Other' && <Input label="Specify Facility Type" value={data.facilityTypeOther} onChange={(v:any)=>setData({...data, facilityTypeOther: v})} />}
            <Select label="Health post structure available?" options={['Yes', 'No']} value={data.healthPostAvailable} onChange={(v:any)=>setData({...data, healthPostAvailable: v})} />
            {data.healthPostAvailable === 'Yes' && (
              <Input label="Name of Health post" value={data.healthPostName} onChange={(v:any)=>setData({...data, healthPostName: v})} className="animate-in slide-in-from-top-2" />
            )}
            <Input label="Catchment Area Name" value={data.catchmentArea} onChange={(v:any)=>setData({...data, catchmentArea: v})} />
            <Input label="Catchment Area Population" type="number" value={data.catchmentPopulation} onChange={(v:any)=>setData({...data, catchmentPopulation: v})} />
          </div>
          
          <div className="space-y-6">
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
              <div className="flex justify-between items-center mb-4">
                <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">GVH Names</h5>
                <Button variant="secondary" size="sm" onClick={addGVH}><Plus size={14}/> Add GVH</Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {data.gvhNames?.map((gvh, idx) => (
                  <Input key={idx} value={gvh} onChange={(v:any)=>updateGVH(idx, v)} placeholder={`GVH Name ${idx+1}`} />
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h5 className="text-xs font-black uppercase text-slate-800 tracking-widest">Village Names & Population</h5>
                  <p className="text-[10px] text-slate-400 font-bold">List villages, populations, and gazette status.</p>
                </div>
                <Button variant="primary" size="sm" onClick={addVillage}><Plus size={14}/> Add Village</Button>
              </div>
              <div className="space-y-3">
                {data.villages?.map((village) => (
                  <div key={village.id} className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 items-end animate-in fade-in">
                    <Input className="mb-0" label="Village Name" value={village.name} onChange={(v:any)=>updateVillage(village.id, 'name', v)} />
                    <Input className="mb-0" label="Population" type="number" value={village.population} onChange={(v:any)=>updateVillage(village.id, 'population', v)} />
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-slate-500 mb-2">Gazette?</label>
                      <button 
                        onClick={() => updateVillage(village.id, 'isGazette', !village.isGazette)}
                        className={`w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${village.isGazette ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-400'}`}
                      >
                        {village.isGazette ? 'Gazette' : 'Non-Gazette'}
                      </button>
                    </div>
                    <Button variant="ghost" className="text-rose-500 mb-1" onClick={() => removeVillage(village.id)}><Trash2 size={18}/></Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* d. Location */}
        <section>
          <SectionHeader title="d. Location" icon={MapPinIcon} />
          <div className="p-6 bg-blue-50 border border-blue-100 rounded-[2.5rem] flex items-center justify-between mb-8 shadow-inner">
             <div className="flex items-center gap-5">
               <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm border border-blue-100"><MapPin size={28}/></div>
               <div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-blue-800 opacity-60">Geolocation Capture</p>
                 <p className="text-xl font-black text-blue-900 tracking-tight">{data.coords ? `${data.coords.lat.toFixed(6)}, ${data.coords.lng.toFixed(6)}` : 'Requesting GPS...'}</p>
               </div>
             </div>
             {data.coords && <div className="bg-emerald-500 text-white p-2 rounded-full shadow-lg"><CheckCircle size={20}/></div>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6">
            <Input label="KM: Catchment to Facility" type="number" value={data.distanceToFacility} onChange={(v:any)=>setData({...data, distanceToFacility: v})} />
            <Input label="KM: Facility to District Council" type="number" value={data.distanceToCouncil} onChange={(v:any)=>setData({...data, distanceToCouncil: v})} />
            <Input label="Number of VHCs" type="number" value={data.numVHCs} onChange={(v:any)=>setData({...data, numVHCs: v})} />
            <Input label="Number of Trained VHCs" type="number" value={data.numTrainedVHCs} onChange={(v:any)=>setData({...data, numTrainedVHCs: v})} />
            <Select label="Village clinic?" options={['Yes', 'No']} value={data.villageClinic} onChange={(v:any)=>setData({...data, villageClinic: v})} />
            <Select label="Village clinic functional?" options={['Yes', 'No']} value={data.villageClinicFunctional} onChange={(v:any)=>setData({...data, villageClinicFunctional: v})} />
            <Select label="Hard to Reach Catchment?" options={['Yes', 'No']} value={data.hardToReach} onChange={(v:any)=>setData({...data, hardToReach: v})} />
            <Select label="Resident in Catchment Area?" options={['Yes', 'No']} value={data.residentInCatchment} onChange={(v:any)=>setData({...data, residentInCatchment: v})} />
          </div>
        </section>

        {/* e. Mobile Gadgets */}
        <section>
          <SectionHeader title="e. Mobile Gadgets" icon={Smartphone} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6">
            <Select label="Government phone?" options={['Yes', 'No']} value={data.govPhone} onChange={(v:any)=>setData({...data, govPhone: v})} />
            {data.govPhone === 'Yes' && (
              <>
                <Select label="Type of phone" options={['Smart phone', 'Tablet']} value={data.phoneType} onChange={(v:any)=>setData({...data, phoneType: v})} className="animate-in slide-in-from-top-2" />
                <Select label="Phone functional?" options={['Yes', 'No']} value={data.phoneFunctional} onChange={(v:any)=>setData({...data, phoneFunctional: v})} className="animate-in slide-in-from-top-2" />
                <Select label="Year received phone" options={YEARS} value={data.yearReceivedPhone} onChange={(v:any)=>setData({...data, yearReceivedPhone: v})} className="animate-in slide-in-from-top-2" />
              </>
            )}
            <Select label="Phone Solar Charger?" options={['Yes', 'No']} value={data.solarCharger} onChange={(v:any)=>setData({...data, solarCharger: v})} />
          </div>
        </section>

        {/* f. Community Health supplies */}
        <section>
          <SectionHeader title="f. Community Health Supplies" icon={Tool} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.keys(data.supplies!).map((key: any) => (
              <div key={key} className="p-6 bg-slate-50 border border-slate-100 rounded-3xl transition-all hover:bg-white hover:shadow-md group">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3 group-hover:text-emerald-600 transition-colors">{key}</p>
                <div className="flex flex-col gap-3">
                  <Select className="mb-0" label="Received?" options={['Yes', 'No']} value={data.supplies![key as keyof HSARegistration['supplies']].received} onChange={(v:any)=>handleSupplyChange(key, 'received', v)} />
                  {data.supplies![key as keyof HSARegistration['supplies']].received === 'Yes' && (
                     <Select className="mb-0 animate-in slide-in-from-top-2" label="Year" options={YEARS} value={data.supplies![key as keyof HSARegistration['supplies']].year} onChange={(v:any)=>handleSupplyChange(key, 'year', v)} />
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* g. Training status */}
        <section>
          <SectionHeader title="g. Training status" icon={ClipboardCheck} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {TRAINING_TOPICS.map(topic => (
              <div key={topic} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:border-emerald-200 transition-all">
                <span className="text-xs font-black text-slate-600 uppercase tracking-tight pr-4">{topic}</span>
                <div className="flex gap-1 shrink-0">
                  <button 
                    onClick={() => handleThematicChange(topic, 'Yes')}
                    className={`px-4 py-1.5 rounded-xl text-[10px] font-black tracking-widest transition-all ${data.thematicTrainings![topic] === 'Yes' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100' : 'bg-slate-100 text-slate-400'}`}
                  >YES</button>
                  <button 
                    onClick={() => handleThematicChange(topic, 'No')}
                    className={`px-4 py-1.5 rounded-xl text-[10px] font-black tracking-widest transition-all ${data.thematicTrainings![topic] === 'No' ? 'bg-rose-600 text-white shadow-lg shadow-rose-100' : 'bg-slate-100 text-slate-400'}`}
                  >NO</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="pt-12 border-t flex flex-col sm:flex-row gap-4">
          <Button variant="secondary" className="flex-1 py-5 text-lg" onClick={onCancel}>Discard & Cancel</Button>
          <Button variant="primary" className="flex-[2] py-5 text-lg shadow-2xl shadow-emerald-200" onClick={handleSave}>
            <Save size={24}/> Finalize & Submit Registration
          </Button>
        </div>
      </Card>
    </div>
  );
};

/**
 * District Community Health Reporting Tool
 * Populate all HSA data submitted under all sections of "HSA Registration".
 * Apply advanced search to filter data by National, District and health facility.
 * Integrate built-in excel download function.
 */
const DistrictReportingTool = ({ records }: { records: HSARegistration[] }) => {
  const [filter, setFilter] = useState({ 
    search: '',
    scope: 'National', // National, District, Facility
    district: 'All Districts', 
    facility: '',
    trained: 'All'
  });

  const filtered = useMemo(() => {
    return records.filter(r => {
      const searchMatch = !filter.search || 
        r.hsaName.toLowerCase().includes(filter.search.toLowerCase()) || 
        r.nationalId.toLowerCase().includes(filter.search.toLowerCase());
      
      const districtMatch = filter.district === 'All Districts' || r.district === filter.district;
      const facilityMatch = !filter.facility || r.reportingFacility.toLowerCase().includes(filter.facility.toLowerCase());
      
      return searchMatch && districtMatch && facilityMatch;
    });
  }, [records, filter]);

  const downloadCSV = () => {
    if (filtered.length === 0) {
      alert("No data available to export.");
      return;
    }
    
    // Comprehensive column headers covering all interlinked sections
    const headers = [
      "HSA Name", "Sex", "District", "Position", "Grade", "National ID", "Employment No", "DOB", "Contact", "Salary Support", "Recruited By",
      "Home District", "Home TA", "Home GVH", "Home Village", "Postal Address",
      "iCHIS Trained", "Preservice Short", "1-Year Preservice", "MSCE Pass",
      "Reporting Facility", "Facility Type", "Health Post Available", "Health Post Name", "Catchment Name", "Catchment Population",
      "Distance to Facility (KM)", "Distance to Council (KM)", "VHCs", "Trained VHCs", "Village Clinic", "Hard to Reach", "Resident in Catchment",
      "Gov Phone", "Phone Type", "Phone Functional", "Solar Charger",
      "Bicycle Received", "Motorcycle Received", "Uniforms Received", "Gumboots Received", "Raincoat Received", "Umbrella Received", "Drug Boxes Received", "Torch Received",
      ...TRAINING_TOPICS
    ];
    
    const rows = filtered.map(r => {
      const supplyData = (key: keyof HSARegistration['supplies']) => `${r.supplies?.[key]?.received || 'No'} (${r.supplies?.[key]?.year || 'N/A'})`;
      const thematicData = TRAINING_TOPICS.map(topic => r.thematicTrainings?.[topic] || 'No');

      return [
        r.hsaName, r.sex, r.district, r.position, r.grade, r.nationalId, r.employmentNumber, r.dob, r.contact, r.salarySupport, r.recruitedBy,
        r.homeDistrict, r.homeTA, r.homeGVH, r.homeVillage, r.postalAddress || 'N/A',
        r.trainedICHIS, r.preserviceShort, r.preserviceLong, r.mscePasses,
        r.reportingFacility, r.facilityType, r.healthPostAvailable, r.healthPostName || 'N/A', r.catchmentArea, r.catchmentPopulation,
        r.distanceToFacility, r.distanceToCouncil, r.numVHCs, r.numTrainedVHCs, r.villageClinic, r.hardToReach, r.residentInCatchment,
        r.govPhone, r.phoneType || 'N/A', r.phoneFunctional || 'N/A', r.solarCharger,
        supplyData('bicycle'), supplyData('motorcycle'), supplyData('uniforms'), supplyData('gumboots'), supplyData('raincoat'), supplyData('umbrella'), supplyData('drugBoxes'), supplyData('torch'),
        ...thematicData
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers, ...rows].map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `MeHIS_Detailed_HSA_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 px-2">
        <div>
          <h3 className="text-3xl font-black text-slate-800 tracking-tighter">Community Health Reporting Tool</h3>
          <p className="text-sm text-slate-400 font-medium">Populating all HSA registration data with advanced multi-tier filtering.</p>
        </div>
        <Button onClick={downloadCSV} variant="blue" size="lg" className="w-full sm:w-auto shadow-xl shadow-blue-100">
          <FileSpreadsheet size={20}/> Download Excel (CSV)
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Input placeholder="Search Name or ID..." value={filter.search} onChange={(v:any)=>setFilter({...filter, search: v})} icon={Search} className="mb-0" />
        <Select options={MALAWI_DISTRICTS} value={filter.district} onChange={(v:any)=>setFilter({...filter, district: v})} icon={MapPin} className="mb-0" />
        <Input placeholder="Filter by Health Facility..." value={filter.facility} onChange={(v:any)=>setFilter({...filter, facility: v})} icon={Building2} className="mb-0" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm text-center border-slate-100 relative group overflow-hidden">
           <div className="absolute top-0 right-0 w-20 h-20 bg-slate-50 rounded-bl-full -z-1 transition-transform group-hover:scale-150"></div>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Populated Profiles</p>
           <p className="text-4xl font-black text-slate-800">{filtered.length}</p>
        </div>
        <div className="bg-emerald-50 p-8 rounded-[2.5rem] border shadow-sm text-center border-emerald-100">
           <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">Reporting Coverage</p>
           <p className="text-4xl font-black text-emerald-700">{records.length > 0 ? (filtered.length/records.length*100).toFixed(0) : 0}%</p>
        </div>
        <div className="bg-blue-50 p-8 rounded-[2.5rem] border shadow-sm text-center border-blue-100">
           <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">National Filter Scope</p>
           <p className="text-4xl font-black text-blue-700">{filter.district === 'All Districts' ? 'All' : 'Single'}</p>
        </div>
        <div className="bg-amber-50 p-8 rounded-[2.5rem] border shadow-sm text-center border-amber-100">
           <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-2">Sync Status</p>
           <p className="text-2xl font-black text-amber-700">Real-time</p>
        </div>
      </div>

      <Card className="overflow-hidden shadow-2xl shadow-slate-200/50">
        <div className="p-6 bg-slate-50/50 border-b flex justify-between items-center">
           <h4 className="font-black text-slate-800 uppercase tracking-widest text-[10px]">Registry Population View</h4>
           <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
             <Info size={12}/> Showing {filtered.length} audited profiles
           </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-widest border-b">
                <th className="px-6 py-4">HSA / District</th>
                <th className="px-6 py-4">Facility</th>
                <th className="px-6 py-4">National ID</th>
                <th className="px-6 py-4">iCHIS Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(r => (
                <tr key={r.id} className="group hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-5">
                    <div>
                      <p className="font-black text-slate-800 text-sm leading-tight">{r.hsaName}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{r.district} • {r.sex}</p>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-slate-600 font-bold text-xs">{r.reportingFacility}</p>
                    <p className="text-[10px] text-slate-400 uppercase">{r.facilityType}</p>
                  </td>
                  <td className="px-6 py-5">
                    <span className="px-2 py-0.5 bg-slate-100 text-[9px] font-black uppercase tracking-widest rounded-md text-slate-600">{r.nationalId}</span>
                  </td>
                  <td className="px-6 py-5">
                    {r.trainedICHIS === 'Yes' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest">
                        <CheckCircle size={10}/> Trained
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-400 rounded-full text-[9px] font-black uppercase tracking-widest">
                        Untrained
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button className="p-2 text-slate-300 hover:text-emerald-600 transition-colors">
                      <Eye size={18}/>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

// --- Landing Page ---

const LandingPage = ({ onLogin }: { onLogin: (u: User) => void }) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(UserRole.HSA);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !password) {
      setError("Please enter both phone number and password");
      return;
    }
    onLogin({
      id: Date.now().toString(),
      fullName: 'Health Regional Admin',
      phoneNumber: phone,
      district: 'Lilongwe',
      role: role
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-600 to-emerald-900 flex items-center justify-center p-6 overflow-hidden relative">
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/10 rounded-full blur-[80px]"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-emerald-400/20 rounded-full blur-[100px]"></div>
      
      <div className="max-w-md w-full relative z-10">
        <div className="bg-white/95 backdrop-blur-xl rounded-[3.5rem] shadow-2xl p-12 border border-white/20">
          <div className="flex justify-center mb-10">
            <div className="w-20 h-20 bg-emerald-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-emerald-200">
              <Heart className="text-white" size={40} />
            </div>
          </div>
          <h2 className="text-4xl font-black text-center text-slate-800 tracking-tighter mb-2">MeHIS Portal</h2>
          <p className="text-center text-slate-400 text-sm mb-10 font-bold uppercase tracking-widest leading-relaxed">Malawi Environmental Health Information System</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <Input label="Phone Number" value={phone} onChange={setPhone} prefix="+265" placeholder="99XXXXXXX" required />
            <Input label="Password" type="password" value={password} onChange={setPassword} required />
            <Select label="System Access Level" options={Object.values(UserRole)} value={role} onChange={(v: any) => setRole(v)} />
            
            {error && <p className="text-[10px] text-rose-500 font-black uppercase text-center mt-4 tracking-widest">{error}</p>}
            
            <Button type="submit" className="w-full py-5 mt-8 text-lg shadow-2xl shadow-emerald-200" size="lg">Authorize Access</Button>
          </form>
        </div>
        <div className="mt-10 text-center">
           <p className="text-[10px] text-white/60 font-black uppercase tracking-[0.2em]">Ministry of Health • Republic of Malawi</p>
        </div>
      </div>
    </div>
  );
};

// --- Infrastructure Form Components ---

const HealthPostForm = ({ initialData, onCancel, onSave }: { initialData?: HealthPostInfo, onCancel: () => void, onSave: (data: HealthPostInfo) => void }) => {
  const [formData, setFormData] = useState<Partial<HealthPostInfo>>(initialData || {
    district: '', name: '', village: '', gvh: '', ta: '', facility: '',
    catchmentPopulation: 0, yearConstructed: '', isFunctional: 'Yes',
    staffAvailable: [], hasWater: 'No', hasElectricity: 'No',
    electricityTypes: [], remarks: ''
  });

  const handleSave = () => {
    onSave({
      ...formData,
      id: formData.id || Date.now().toString(),
      submittedAt: new Date().toISOString()
    } as HealthPostInfo);
  };

  return (
    <Card className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-2">
      <div className="flex items-center justify-between">
        <h3 className="text-3xl font-black text-slate-800 tracking-tighter">{initialData ? 'Edit' : 'Register'} Health Post</h3>
        <Button variant="ghost" onClick={onCancel} className="text-slate-300 hover:text-rose-500"><X size={24}/></Button>
      </div>

      <SectionHeader title="Location & Authority" icon={MapPin} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
        <Select label="District" options={MALAWI_DISTRICTS.slice(1)} value={formData.district} onChange={(v:any)=>setFormData({...formData, district: v})} required />
        <Input label="Health Post Name" value={formData.name} onChange={(v:any)=>setFormData({...formData, name: v})} required icon={Building2} />
        <Input label="Village" value={formData.village} onChange={(v:any)=>setFormData({...formData, village: v})} />
        <Input label="GVH" value={formData.gvh} onChange={(v:any)=>setFormData({...formData, gvh: v})} />
        <Input label="TA" value={formData.ta} onChange={(v:any)=>setFormData({...formData, ta: v})} />
        <Input label="Parent Facility" value={formData.facility} onChange={(v:any)=>setFormData({...formData, facility: v})} />
      </div>

      <SectionHeader title="Structure & Utility" icon={Tool} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
        <Input label="Population Served" type="number" value={formData.catchmentPopulation} onChange={(v:any)=>setFormData({...formData, catchmentPopulation: v})} />
        <Select label="Year Constructed" options={YEARS} value={formData.yearConstructed} onChange={(v:any)=>setFormData({...formData, yearConstructed: v})} />
        <Select label="Operational Status" options={['Yes', 'No']} value={formData.isFunctional} onChange={(v:any)=>setFormData({...formData, isFunctional: v})} />
        <Select label="Water Connectivity" options={['Yes', 'No']} value={formData.hasWater} onChange={(v:any)=>setFormData({...formData, hasWater: v})} />
        <Select label="Electricity Access" options={['Yes', 'No']} value={formData.hasElectricity} onChange={(v:any)=>setFormData({...formData, hasElectricity: v})} />
      </div>
      
      <Input label="General Observations" value={formData.remarks} onChange={(v:any)=>setFormData({...formData, remarks: v})} placeholder="Structure condition, roof, security..." />

      <div className="mt-8 flex gap-4">
        <Button variant="secondary" className="flex-1 py-4" onClick={onCancel}>Cancel</Button>
        <Button variant="primary" className="flex-[2] py-4 shadow-xl shadow-emerald-200" onClick={handleSave}><Save size={20}/> Record Facility Data</Button>
      </div>
    </Card>
  );
};

const HCMCForm = ({ initialData, onCancel, onSave }: { initialData?: HCMCInfo, onCancel: () => void, onSave: (data: HCMCInfo) => void }) => {
  const [formData, setFormData] = useState<Partial<HCMCInfo>>(initialData || {
    district: '', hcmcName: '', village: '', gvh: '', ta: '', facility: '',
    isFormed: 'Yes', isOrientedRoles: 'No', isOrientedDFF: 'No',
    isFunctional: 'Yes', status: 'Active', remarks: ''
  });

  const handleSave = () => {
    onSave({
      ...formData,
      id: formData.id || Date.now().toString(),
      submittedAt: new Date().toISOString()
    } as HCMCInfo);
  };

  return (
    <Card className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-2">
      <div className="flex items-center justify-between">
        <h3 className="text-3xl font-black text-slate-800 tracking-tighter">{initialData ? 'Edit' : 'New'} HCMC Profile</h3>
        <Button variant="ghost" onClick={onCancel} className="text-slate-300 hover:text-rose-500"><X size={24}/></Button>
      </div>

      <SectionHeader title="Committee Governance" icon={UsersRound} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
        <Select label="District" options={MALAWI_DISTRICTS.slice(1)} value={formData.district} onChange={(v:any)=>setFormData({...formData, district: v})} required />
        <Input label="HCMC Full Name" value={formData.hcmcName} onChange={(v:any)=>setFormData({...formData, hcmcName: v})} required icon={Users} />
        <Input label="Facility / Cluster" value={formData.facility} onChange={(v:any)=>setFormData({...formData, facility: v})} />
        <Input label="HQ Village" value={formData.village} onChange={(v:any)=>setFormData({...formData, village: v})} />
      </div>

      <SectionHeader title="Operational Capacity" icon={ShieldAlert} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6">
        <Select label="Administrative Status" options={['Active', 'Inactive', 'Pending']} value={formData.status} onChange={(v:any)=>setFormData({...formData, status: v})} />
        <Select label="Legally Formed?" options={['Yes', 'No']} value={formData.isFormed} onChange={(v:any)=>setFormData({...formData, isFormed: v})} />
        <Select label="Oriented on HSA Roles?" options={['Yes', 'No']} value={formData.isOrientedRoles} onChange={(v:any)=>setFormData({...formData, isOrientedRoles: v})} />
        <Select label="Oriented on DFF?" options={['Yes', 'No']} value={formData.isOrientedDFF} onChange={(v:any)=>setFormData({...formData, isOrientedDFF: v})} />
        <Select label="Meetings Regular?" options={['Yes', 'No']} value={formData.isFunctional} onChange={(v:any)=>setFormData({...formData, isFunctional: v})} />
      </div>

      <Input label="Committee Remarks" value={formData.remarks} onChange={(v:any)=>setFormData({...formData, remarks: v})} placeholder="Success stories or funding issues..." />

      <div className="mt-8 flex gap-4">
        <Button variant="secondary" className="flex-1 py-4" onClick={onCancel}>Cancel</Button>
        <Button variant="primary" className="flex-[2] py-4 shadow-xl shadow-emerald-200" onClick={handleSave}><Save size={20}/> Save Committee Data</Button>
      </div>
    </Card>
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

  // Health Post Filter State
  const [hpSearch, setHpSearch] = useState('');
  const [hpDistrictFilter, setHpDistrictFilter] = useState('All Districts');

  // HCMC Filter State
  const [hcmcSearch, setHcmcSearch] = useState('');
  const [hcmcDistrictFilter, setHcmcDistrictFilter] = useState('All Districts');
  const [hcmcStatusFilter, setHcmcStatusFilter] = useState('All Statuses');

  // Deletion state
  const [deleteTarget, setDeleteTarget] = useState<{ id: string, type: 'health-post' | 'hcmc' | 'hsa' } | null>(null);

  // Editing state
  const [editingHealthPost, setEditingHealthPost] = useState<HealthPostInfo | undefined>(undefined);
  const [editingHcmc, setEditingHcmc] = useState<HCMCInfo | undefined>(undefined);
  const [editingHsa, setEditingHsa] = useState<HSARegistration | undefined>(undefined);

  useEffect(() => saveToStorage('currentUser', user), [user]);
  useEffect(() => saveToStorage('hsaData', hsaData), [hsaData]);
  useEffect(() => saveToStorage('healthPosts', healthPosts), [healthPosts]);
  useEffect(() => saveToStorage('hcmcRecords', hcmcRecords), [hcmcRecords]);

  const filteredHealthPosts = useMemo(() => {
    return healthPosts.filter(hp => {
      const matchesSearch = hp.name.toLowerCase().includes(hpSearch.toLowerCase()) || 
                           hp.village.toLowerCase().includes(hpSearch.toLowerCase());
      const matchesDistrict = hpDistrictFilter === 'All Districts' || hp.district === hpDistrictFilter;
      return matchesSearch && matchesDistrict;
    });
  }, [healthPosts, hpSearch, hpDistrictFilter]);

  const filteredHcmcRecords = useMemo(() => {
    return hcmcRecords.filter(rec => {
      const matchesSearch = rec.hcmcName.toLowerCase().includes(hcmcSearch.toLowerCase()) || 
                           rec.facility.toLowerCase().includes(hcmcSearch.toLowerCase());
      const matchesDistrict = hcmcDistrictFilter === 'All Districts' || rec.district === hcmcDistrictFilter;
      const matchesStatus = hcmcStatusFilter === 'All Statuses' || rec.status === hcmcStatusFilter;
      return matchesSearch && matchesDistrict && matchesStatus;
    });
  }, [hcmcRecords, hcmcSearch, hcmcDistrictFilter, hcmcStatusFilter]);

  // Statistics
  const hcmcStats = useMemo(() => {
    const total = hcmcRecords.length;
    const functional = hcmcRecords.filter(r => r.isFunctional === 'Yes').length;
    const oriented = hcmcRecords.filter(r => r.isOrientedRoles === 'Yes').length;
    return {
      total,
      functional,
      oriented,
      functionalRate: total > 0 ? Math.round((functional / total) * 100) : 0,
      orientationRate: total > 0 ? Math.round((oriented / total) * 100) : 0
    };
  }, [hcmcRecords]);

  const handleEditHsa = (h: HSARegistration) => {
    setEditingHsa(h);
    setRegistrationMode('form');
  };

  const handleCancelForm = () => {
    setEditingHealthPost(undefined);
    setEditingHcmc(undefined);
    setEditingHsa(undefined);
    setRegistrationMode('hub');
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'health-post') {
      setHealthPosts(healthPosts.filter(h => h.id !== deleteTarget.id));
    } else if (deleteTarget.type === 'hcmc') {
      setHcmcRecords(hcmcRecords.filter(h => h.id !== deleteTarget.id));
    } else if (deleteTarget.type === 'hsa') {
      setHsaData(hsaData.filter(h => h.id !== deleteTarget.id));
    }
    setDeleteTarget(null);
  };

  const NavItem = ({ id, icon: Icon, label }: any) => (
    <button onClick={() => { setView(id); setIsSidebarOpen(false); setRegistrationMode('hub'); handleCancelForm(); }} className={`flex items-center gap-3 w-full p-4 transition-all ${view === id ? 'text-emerald-700 bg-emerald-50 border-r-4 border-emerald-600 font-black' : 'text-slate-500 hover:bg-slate-50'}`}>
      <Icon size={20} className={view === id ? 'text-emerald-600' : 'text-slate-400'} /><span className="text-sm">{label}</span>
    </button>
  );

  if (!user) return <LandingPage onLogin={(u: User) => setUser(u)} />;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
      {isSidebarOpen && <div className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />}
      
      <DeleteConfirmationModal 
        isOpen={deleteTarget !== null} 
        onCancel={() => setDeleteTarget(null)} 
        onConfirm={confirmDelete} 
      />

      <aside className={`fixed inset-y-0 left-0 w-80 bg-white border-r border-slate-100 z-50 transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full shadow-2xl lg:shadow-none'}`}>
        <div className="p-8 border-b flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200">
            <Heart className="text-white" size={24} />
          </div>
          <h1 className="font-black text-3xl tracking-tighter text-slate-800">MeHIS</h1>
        </div>
        <nav className="py-8 overflow-y-auto max-h-[calc(100vh-180px)] space-y-1">
          <NavItem id="home" icon={Home} label="Dashboard Home" />
          <NavItem id="registration" icon={UserIcon} label="HSA Registration (Annual)" />
          <NavItem id="health-posts" icon={Building2} label="Health Posts" />
          <NavItem id="hcmc" icon={UsersRound} label="HCMC Committees" />
          <NavItem id="wash" icon={Droplets} label="WASH Monitoring" />
          <NavItem id="reporting" icon={BarChart3} label="Reporting Tool" />
          <NavItem id="inspections" icon={Search} label="Village Inspections" />
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-8 border-t bg-white">
          <button onClick={() => setUser(null)} className="flex items-center justify-center gap-3 text-rose-500 text-xs font-black uppercase tracking-widest w-full p-4 bg-rose-50 rounded-2xl hover:bg-rose-100 transition-colors">
            <LogOut size={16}/> End Session
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto lg:ml-80 scroll-smooth">
        <header className="sticky top-0 bg-white/70 backdrop-blur-2xl border-b p-6 flex items-center justify-between z-30">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-3 text-slate-400 bg-white border rounded-xl shadow-sm" onClick={() => setIsSidebarOpen(true)}><Menu size={24}/></button>
            <div>
              <h2 className="font-black text-slate-800 tracking-tight text-xl uppercase">
                {view === 'health-posts' ? 'Infrastructure Audit' : 
                 view === 'hcmc' ? 'Governance Tracking' : 
                 view === 'registration' ? 'HSA annual data Registration' : 
                 view === 'reporting' ? 'District community Health Reporting Tool' : 'Digital Hub'}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
               <p className="text-xs font-black text-slate-800">{user.fullName}</p>
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{user.role}</p>
            </div>
            <div className="w-10 h-10 bg-slate-100 rounded-full border border-slate-200 flex items-center justify-center">
               <UserIcon size={20} className="text-slate-400"/>
            </div>
          </div>
        </header>

        <div className="p-8 lg:p-12 max-w-7xl mx-auto min-h-screen">
          {view === 'home' && (
             <div className="space-y-12 animate-in fade-in duration-700">
                <div className="bg-emerald-600 text-white p-16 rounded-[4rem] shadow-[0_32px_64px_-16px_rgba(5,150,105,0.25)] relative overflow-hidden">
                  <h1 className="text-5xl font-black mb-4 tracking-tighter">Community Health Digital Hub</h1>
                  <p className="text-emerald-50 text-lg max-w-md font-medium leading-relaxed opacity-90">Digitalizing professional registration, facility management, and reporting for the Republic of Malawi.</p>
                  <div className="absolute -top-10 -right-10 w-96 h-96 bg-emerald-500/40 rounded-full blur-[120px]"></div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <button onClick={() => setView('registration')} className="p-10 bg-white border rounded-[3rem] text-left hover:shadow-2xl hover:-translate-y-1 transition-all group border-slate-100">
                    <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mb-8 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm"><UserIcon size={32}/></div>
                    <h3 className="font-black text-slate-800 text-2xl tracking-tight">HSA Registration</h3>
                    <p className="text-sm text-slate-400 mt-3 font-medium">Capture annual HSA identification, training, and systematic data.</p>
                  </button>
                  <button onClick={() => setView('reporting')} className="p-10 bg-white border rounded-[3rem] text-left hover:shadow-2xl hover:-translate-y-1 transition-all group border-slate-100">
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mb-8 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm"><BarChart3 size={32}/></div>
                    <h3 className="font-black text-slate-800 text-2xl tracking-tight">Reporting Tool</h3>
                    <p className="text-sm text-slate-400 mt-3 font-medium">National and District level data analytics and excel downloads.</p>
                  </button>
                  <button onClick={() => setView('hcmc')} className="p-10 bg-white border rounded-[3rem] text-left hover:shadow-2xl hover:-translate-y-1 transition-all group border-slate-100">
                    <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-3xl flex items-center justify-center mb-8 group-hover:bg-purple-600 group-hover:text-white transition-all shadow-sm"><UsersRound size={32}/></div>
                    <h3 className="font-black text-slate-800 text-2xl tracking-tight">HCMC Committees</h3>
                    <p className="text-sm text-slate-400 mt-3 font-medium">Manage committee formation, orientation, and status tracking.</p>
                  </button>
                </div>
             </div>
          )}

          {view === 'health-posts' && (
             <div className="space-y-8 animate-in fade-in duration-500">
               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-2">
                 <div>
                   <h3 className="text-3xl font-black text-slate-800 tracking-tighter">Infrastructure Registry</h3>
                   <p className="text-sm text-slate-400 font-medium">Official records for community health posts nationwide.</p>
                 </div>
                 <Button onClick={() => { setEditingHealthPost(undefined); setRegistrationMode('form'); }} size="lg" variant="blue" className="shadow-blue-100 shadow-xl"><Plus size={20}/> New Audit</Button>
               </div>
               
               {registrationMode === 'hub' ? (
                 <>
                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                     <Input placeholder="Search health posts..." value={hpSearch} onChange={(v: string) => setHpSearch(v)} icon={Search} className="mb-0" />
                     <Select options={MALAWI_DISTRICTS} value={hpDistrictFilter} onChange={(v: string) => setHpDistrictFilter(v)} icon={Filter} className="mb-0" />
                     <div className="flex items-center gap-2 px-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">{filteredHealthPosts.length} Results</div>
                   </div>
                   <Card className="p-6">
                     {filteredHealthPosts.length === 0 ? (
                       <div className="text-center py-24">
                         <Search size={64} className="mx-auto text-slate-100 mb-6"/>
                         <p className="text-slate-300 font-black uppercase tracking-widest">No infrastructure matches</p>
                       </div>
                     ) : (
                       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                         {filteredHealthPosts.map(hp => (
                           <div key={hp.id} className="p-6 bg-slate-50 border border-slate-100 rounded-[2.5rem] flex flex-col justify-between hover:shadow-xl transition-all hover:bg-white group relative overflow-hidden">
                             <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="flex gap-2">
                                  <Button variant="ghost" className="bg-white/80 p-2 shadow-sm rounded-full text-blue-500" onClick={() => { setEditingHealthPost(hp); setRegistrationMode('form'); }}><Edit size={16}/></Button>
                                  <Button variant="ghost" className="bg-white/80 p-2 shadow-sm rounded-full text-rose-500" onClick={() => setDeleteTarget({ id: hp.id, type: 'health-post' })}><Trash size={16}/></Button>
                                </div>
                             </div>
                             <div className="flex items-center gap-4 mb-6">
                               <div className="w-14 h-14 bg-blue-100 rounded-[1.5rem] flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm"><Building2 size={24}/></div>
                               <div>
                                 <p className="font-black text-slate-800 text-lg leading-tight">{hp.name}</p>
                                 <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black mt-1">{hp.village} • {hp.district}</p>
                               </div>
                             </div>
                             <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                               <div className="flex items-center gap-1.5 text-slate-400">
                                 <Users size={12}/> {hp.catchmentPopulation.toLocaleString()}
                               </div>
                               <span className={`px-3 py-1 rounded-full ${hp.isFunctional === 'Yes' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                 {hp.isFunctional === 'Yes' ? 'Functional' : 'Inactive'}
                               </span>
                             </div>
                           </div>
                         ))}
                       </div>
                     )}
                   </Card>
                 </>
               ) : (
                 <HealthPostForm initialData={editingHealthPost} onCancel={handleCancelForm} onSave={(d) => { if (editingHealthPost) setHealthPosts(healthPosts.map(h => h.id === d.id ? d : h)); else setHealthPosts([...healthPosts, d]); handleCancelForm(); }} />
               )}
             </div>
          )}

          {view === 'hcmc' && (
             <div className="space-y-8 animate-in fade-in duration-500">
               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-2">
                 <div>
                   <h3 className="text-3xl font-black text-slate-800 tracking-tighter">Governance Monitoring</h3>
                   <p className="text-sm text-slate-400 font-medium">Tracking Health Centre Management Committee performance.</p>
                 </div>
                 <Button onClick={() => { setEditingHcmc(undefined); setRegistrationMode('form'); }} size="lg" variant="amber" className="shadow-amber-100 shadow-xl"><Plus size={20}/> New Entry</Button>
               </div>
               {registrationMode === 'hub' ? (
                 <>
                   <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm text-center group">
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 group-hover:text-emerald-600 transition-colors">Total HCMC</p>
                        <p className="text-4xl font-black text-slate-800">{hcmcStats.total}</p>
                      </div>
                      <div className="bg-emerald-50 p-8 rounded-[2.5rem] border border-emerald-100 shadow-sm text-center">
                        <p className="text-[10px] font-black uppercase text-emerald-600 tracking-widest mb-2">Functional %</p>
                        <p className="text-4xl font-black text-emerald-700">{hcmcStats.functionalRate}%</p>
                      </div>
                      <div className="bg-blue-50 p-8 rounded-[2.5rem] border border-blue-100 shadow-sm text-center">
                        <p className="text-[10px] font-black uppercase text-blue-600 tracking-widest mb-2">Oriented %</p>
                        <p className="text-4xl font-black text-blue-700">{hcmcStats.orientationRate}%</p>
                      </div>
                      <div className="bg-amber-50 p-8 rounded-[2.5rem] border border-amber-100 shadow-sm text-center">
                        <p className="text-[10px] font-black uppercase text-amber-600 tracking-widest mb-2">Dist. Coverage</p>
                        <p className="text-2xl font-black text-amber-700">{(hcmcStats.total / (MALAWI_DISTRICTS.length - 1 || 1)).toFixed(1)}</p>
                      </div>
                   </div>
                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                     <Input placeholder="Filter by name or facility..." value={hcmcSearch} onChange={(v: string) => setHcmcSearch(v)} icon={Search} className="mb-0" />
                     <Select options={MALAWI_DISTRICTS} value={hcmcDistrictFilter} onChange={(v: string) => setHcmcDistrictFilter(v)} icon={Filter} className="mb-0" />
                     <Select options={['All Statuses', 'Active', 'Inactive', 'Pending']} value={hcmcStatusFilter} onChange={(v: string) => setHcmcStatusFilter(v)} icon={Activity} className="mb-0" />
                   </div>
                   <Card className="p-6">
                     {filteredHcmcRecords.length === 0 ? (
                       <div className="text-center py-24"><UsersRound size={64} className="mx-auto text-slate-100 mb-6"/><p className="text-slate-300 font-black tracking-widest uppercase">No committees found</p></div>
                     ) : (
                       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                         {filteredHcmcRecords.map(rec => (
                           <div key={rec.id} className="p-8 bg-white border border-slate-100 rounded-[3rem] shadow-sm flex flex-col justify-between hover:shadow-2xl hover:-translate-y-1 transition-all group border-b-4 border-b-transparent hover:border-b-amber-500">
                             <div>
                               <div className="flex items-center gap-5 mb-6">
                                 <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${rec.status === 'Active' ? 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white' : 'bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white'}`}><UsersRound size={28}/></div>
                                 <div className="flex-1">
                                   <p className="font-black text-slate-800 text-xl tracking-tight leading-tight">{rec.hcmcName}</p>
                                   <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black mt-1">HSA Zone: {rec.village}</p>
                                 </div>
                               </div>
                               <div className="flex flex-wrap items-center gap-2 mb-8">
                                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${rec.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : rec.status === 'Inactive' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>{rec.status || 'Pending'}</span>
                                  <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[9px] font-black uppercase tracking-widest">{rec.district}</span>
                               </div>
                             </div>
                             <div className="flex gap-2 border-t pt-4">
                               <Button variant="ghost" className="flex-1 text-blue-500 bg-blue-50/50 hover:bg-blue-50" onClick={() => { setEditingHcmc(rec); setRegistrationMode('form'); }}><Edit size={16}/> Edit</Button>
                               <Button variant="ghost" className="flex-1 text-rose-500 bg-rose-50/50 hover:bg-rose-50" onClick={() => setDeleteTarget({ id: rec.id, type: 'hcmc' })}><Trash size={16}/> Delete</Button>
                             </div>
                           </div>
                         ))}
                       </div>
                     )}
                   </Card>
                 </>
               ) : (
                 <HCMCForm initialData={editingHcmc} onCancel={handleCancelForm} onSave={(d) => { if (editingHcmc) setHcmcRecords(hcmcRecords.map(r => r.id === d.id ? d : r)); else setHcmcRecords([...hcmcRecords, d]); handleCancelForm(); }} />
               )}
             </div>
          )}

          {view === 'registration' && (
             <div className="space-y-8 animate-in fade-in duration-500">
               {registrationMode === 'hub' ? (
                 <div className="space-y-10">
                    <div className="flex justify-between items-center px-2">
                      <div>
                        <h3 className="text-3xl font-black text-slate-800 tracking-tighter">HSA Registration Hub</h3>
                        <p className="text-sm text-slate-400 font-medium">Official "HSA annual data Registration" interface.</p>
                      </div>
                      <Button onClick={() => { setEditingHsa(undefined); setRegistrationMode('form'); }} size="lg" className="bg-emerald-600 text-white shadow-emerald-200 shadow-xl hover:scale-105"><Plus size={20}/> New Registration</Button>
                    </div>
                    <Card className="p-1">
                      <div className="p-6 bg-slate-50/50 border-b flex items-center justify-between">
                         <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Submitted annual registrations</h5>
                         <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                           <