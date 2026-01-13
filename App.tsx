
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
  Target, Map, Briefcase
} from 'lucide-react';
import { User, UserRole, HSARegistration, VillageData, VillageInspection, HouseholdRecord, ActionPlan, MonthlyWorkPlan, WorkPlanActivity, ActivityOccurrence, AdhocActivity, WaterPoint, WaterQualitySample, WASHHouseholdAssessment, ThreeState } from './types';
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

const AutoSaveIndicator = ({ lastSaved }: { lastSaved?: number }) => (
  <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-50 px-2 py-1 rounded-md animate-pulse">
    <CheckCircle2 size={12} />
    Draft auto-saved {lastSaved ? new Date(lastSaved).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
  </div>
);

const ProgressBar = ({ currentStep, totalSteps, title }: { currentStep: number, totalSteps: number, title?: string }) => {
  const progress = (currentStep / totalSteps) * 100;
  return (
    <div className="w-full mb-8">
      <div className="flex justify-between items-end mb-3">
        <div>
          <h4 className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-1">Step {currentStep} of {totalSteps}</h4>
          {title && <p className="text-lg font-bold text-slate-800 tracking-tight">{title}</p>}
        </div>
        <span className="text-sm font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">{Math.round(progress)}%</span>
      </div>
      <div className="relative h-2 w-full bg-slate-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-emerald-500 transition-all duration-500 ease-out rounded-full shadow-[0_0_10px_rgba(16,185,129,0.4)]"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

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
    ghost: "bg-transparent text-slate-500 hover:bg-slate-50"
  };
  return <button type={type} disabled={disabled} onClick={onClick} className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}>{children}</button>;
};

const Input = ({ label, value, onChange, type = "text", placeholder = "", required = false, maxLength, pattern, error, className = "", min, max, step, prefix }: any) => {
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
          className={`w-full ${prefix ? 'pl-16' : 'px-4'} ${isPassword ? 'pr-20' : ''} py-2.5 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all bg-white ${error ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-200 shadow-sm shadow-slate-100/30'}`}
        />
        {isPassword && (
          <button 
            type="button" 
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md hover:bg-emerald-100 transition-colors"
          >
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
    {error && <p className="text-[10px] text-rose-500 font-medium flex items-center gap-1 mt-1"><AlertCircle size={10}/> {error}</p>}
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

const CustomDatePicker = ({ label, value, onChange, required = false, error }: { label: string, value: string, onChange: (val: string) => void, required?: boolean, error?: string | null }) => {
  return (
    <div className="mb-4 relative">
      {label && <label className="text-sm font-semibold text-slate-600 block mb-1">{label}{required && <span className="text-rose-500">*</span>}</label>}
      <div className="relative group">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors pointer-events-none">
          <CalendarIcon size={18} />
        </div>
        <input 
          type="date"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          className={`w-full pl-10 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-white transition-all appearance-none cursor-pointer hover:bg-slate-50/50 ${error ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-200 shadow-sm shadow-slate-100/50'}`}
        />
      </div>
      {error && <p className="text-[10px] text-rose-500 font-medium flex items-center gap-1 mt-1.5"><AlertCircle size={10}/> {error}</p>}
    </div>
  );
};

// --- Main Forms for Work Plan ---

const MonthlyWorkPlanForm = ({ initialData, onSave, currentUser }: { initialData?: MonthlyWorkPlan, onSave: (data: MonthlyWorkPlan) => void, currentUser: User }) => {
  const [formData, setFormData] = useState<Partial<MonthlyWorkPlan>>(initialData || {
    month: '',
    year: new Date().getFullYear().toString(),
    hsaName: currentUser.fullName,
    district: currentUser.district,
    facility: '',
    activities: []
  });

  const [errors, setErrors] = useState<{ [key: string]: string | null }>({});

  const validate = () => {
    const newErrors: any = {};
    if (!formData.month) newErrors.month = "Month is required";
    if (!formData.year) newErrors.year = "Year is required";
    if (!formData.facility) newErrors.facility = "Facility is required";
    
    (formData.activities || []).forEach((act, actIdx) => {
      const targetError = validatePositiveNumber(act.targetCount, "Monthly Target");
      if (targetError) newErrors[`act_${actIdx}_target`] = targetError;
      
      act.occurrences.forEach((occ, occIdx) => {
        const rangeError = validateDateRange(occ.startDate, occ.endDate);
        if (rangeError) newErrors[`act_${actIdx}_occ_${occIdx}_range`] = rangeError;
        
        const startMonthError = validateWorkPlanDate(occ.startDate, formData.month!, formData.year!);
        if (startMonthError) newErrors[`act_${actIdx}_occ_${occIdx}_start`] = `Start Date: ${startMonthError}`;

        const endMonthError = validateWorkPlanDate(occ.endDate, formData.month!, formData.year!);
        if (endMonthError) newErrors[`act_${actIdx}_occ_${occIdx}_end`] = `End Date: ${endMonthError}`;
      });
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addActivity = () => {
    const newActivity: WorkPlanActivity = {
      id: Date.now().toString(),
      name: '',
      targetCount: 0,
      occurrences: []
    };
    setFormData({ ...formData, activities: [...(formData.activities || []), newActivity] });
  };

  const updateTargetCount = (idx: number, count: number) => {
    const activities = [...(formData.activities || [])];
    const safeCount = isNaN(count) ? 0 : Math.max(0, count);
    
    const currentOccurrences = activities[idx].occurrences;
    const newOccurrences = [...currentOccurrences];

    if (safeCount > currentOccurrences.length) {
      for (let i = currentOccurrences.length; i < safeCount; i++) {
        newOccurrences.push({ id: `${activities[idx].id}_occ_${i}`, location: '', startDate: '', endDate: '' });
      }
    } else {
      newOccurrences.splice(safeCount);
    }

    activities[idx] = { ...activities[idx], targetCount: safeCount, occurrences: newOccurrences };
    setFormData({ ...formData, activities });
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
      <Card title="Identification & Period">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          <Input label="HSA Name" value={formData.hsaName} disabled className="opacity-75" />
          <Input label="District" value={formData.district} disabled className="opacity-75" />
          <Input label="Health Facility" value={formData.facility} onChange={(v: string) => setFormData({...formData, facility: v})} required error={errors.facility} />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Year" value={formData.year} options={YEARS} onChange={(v: string) => setFormData({...formData, year: v})} required error={errors.year} />
            <Select label="Month" value={formData.month} options={["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]} onChange={(v: string) => setFormData({...formData, month: v})} required error={errors.month} />
          </div>
        </div>
      </Card>

      <div className="flex justify-between items-center px-2">
        <h3 className="text-xl font-black text-slate-800 tracking-tight">Planned Activities</h3>
        <Button onClick={addActivity} size="sm" variant="primary"><Plus size={16}/> Add Activity</Button>
      </div>

      {(formData.activities || []).map((act, actIdx) => (
        <Card key={act.id} className="border-l-4 border-l-emerald-500 relative">
          <button 
            onClick={() => setFormData({...formData, activities: (formData.activities || []).filter((_, i) => i !== actIdx)})}
            className="absolute top-4 right-4 text-slate-300 hover:text-rose-500 transition-colors"
          >
            <Trash2 size={18} />
          </button>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Input label="Name of Activity" value={act.name} onChange={(v: string) => {
              const acts = [...(formData.activities || [])];
              acts[actIdx].name = v;
              setFormData({...formData, activities: acts});
            }} required />
            <Input 
              label="Monthly Target (Sessions)" 
              type="number" 
              value={act.targetCount} 
              onChange={(v: number) => updateTargetCount(actIdx, v)} 
              required 
              error={errors[`act_${actIdx}_target`]}
              placeholder="e.g. 4"
            />
          </div>

          {act.targetCount > 0 && (
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Target size={12}/> Session Scheduling
              </h4>
              {act.occurrences.map((occ, occIdx) => (
                <div key={occ.id} className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input label={`Location (Session ${occIdx + 1})`} value={occ.location} onChange={(v: string) => {
                    const acts = [...(formData.activities || [])];
                    acts[actIdx].occurrences[occIdx].location = v;
                    setFormData({...formData, activities: acts});
                  }} placeholder="Venue or Village" />
                  
                  <CustomDatePicker label="Start Date" value={occ.startDate} onChange={(v: string) => {
                    const acts = [...(formData.activities || [])];
                    acts[actIdx].occurrences[occIdx].startDate = v;
                    setFormData({...formData, activities: acts});
                  }} error={errors[`act_${actIdx}_occ_${occIdx}_start`] || errors[`act_${actIdx}_occ_${occIdx}_range`]} />
                  
                  <CustomDatePicker label="End Date" value={occ.endDate} onChange={(v: string) => {
                    const acts = [...(formData.activities || [])];
                    acts[actIdx].occurrences[occIdx].endDate = v;
                    setFormData({...formData, activities: acts});
                  }} error={errors[`act_${actIdx}_occ_${occIdx}_end`]} />
                </div>
              ))}
            </div>
          )}

          <div className="mt-4">
            <Input label="Resources Required" value={act.resourcesRequired} onChange={(v: string) => {
              const acts = [...(formData.activities || [])];
              acts[actIdx].resourcesRequired = v;
              setFormData({...formData, activities: acts});
            }} placeholder="e.g. Bicycles, stationery, IEC materials" />
          </div>
        </Card>
      ))}

      <Button className="w-full mt-6 py-4 shadow-xl" onClick={() => { if(validate()) onSave({...formData, id: formData.id || Date.now().toString(), hsaId: currentUser.id} as MonthlyWorkPlan); }}>
        <Save size={18}/> Save Work Plan
      </Button>
    </div>
  );
};

const MonthlyReportForm = ({ plan, onSave }: { plan: MonthlyWorkPlan, onSave: (data: MonthlyWorkPlan) => void }) => {
  const [formData, setFormData] = useState<MonthlyWorkPlan>({ ...plan, adhocActivities: plan.adhocActivities || [] });
  const [errors, setErrors] = useState<any>({});

  const addAdhoc = () => {
    const newAdhoc: AdhocActivity = { id: Date.now().toString(), name: '', startDate: '', endDate: '', achievement: '' };
    setFormData({...formData, adhocActivities: [...(formData.adhocActivities || []), newAdhoc]});
  };

  const validate = () => {
    const newErrors: any = {};
    formData.adhocActivities?.forEach((adhoc, i) => {
      const rangeError = validateDateRange(adhoc.startDate, adhoc.endDate);
      if (rangeError) newErrors[`adhoc_${i}_range`] = rangeError;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500 pb-20">
      <div className="bg-amber-500 p-8 rounded-[2rem] text-white shadow-lg">
        <h2 className="text-3xl font-black tracking-tight">Monthly Report</h2>
        <p className="text-amber-50 font-medium">Reporting for {plan.month} {plan.year}</p>
      </div>

      <h3 className="text-xl font-black text-slate-800 px-2 mt-8">Planned Activities Performance</h3>
      {formData.activities.map((act, actIdx) => (
        <Card key={act.id} title={act.name} description={`Planned Target: ${act.targetCount} sessions`}>
          <div className="space-y-6">
            {act.occurrences.map((occ, occIdx) => (
              <div key={occ.id} className="p-5 border border-slate-100 rounded-2xl bg-slate-50/30">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Session {occIdx + 1} ({occ.location})</span>
                  <span className="text-[10px] text-slate-400 font-bold">{occ.startDate} to {occ.endDate}</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select 
                    label="Implementation Status" 
                    value={occ.status} 
                    options={['Completed', 'Partially completed', 'Completed after reschedule', 'Not done']} 
                    onChange={(v: any) => {
                      const newActs = [...formData.activities];
                      newActs[actIdx].occurrences[occIdx].status = v;
                      // Clear achievement if not applicable
                      if (v === 'Not done') newActs[actIdx].occurrences[occIdx].achievement = '';
                      setFormData({...formData, activities: newActs});
                    }} 
                  />

                  {occ.status === 'Completed after reschedule' && (
                    <CustomDatePicker label="Actual Date Completed" value={occ.actualDate || ''} onChange={(v: string) => {
                      const newActs = [...formData.activities];
                      newActs[actIdx].occurrences[occIdx].actualDate = v;
                      setFormData({...formData, activities: newActs});
                    }} />
                  )}

                  {occ.status === 'Not done' && (
                    <Input label="Reason for Not Done" value={occ.reason} onChange={(v: string) => {
                      const newActs = [...formData.activities];
                      newActs[actIdx].occurrences[occIdx].reason = v;
                      setFormData({...formData, activities: newActs});
                    }} placeholder="Describe why session was missed" />
                  )}
                </div>

                {occ.status && occ.status !== 'Not done' && (
                  <div className="mt-4">
                    <Input label="Key Achievement" value={occ.achievement} onChange={(v: string) => {
                      const newActs = [...formData.activities];
                      newActs[actIdx].occurrences[occIdx].achievement = v;
                      setFormData({...formData, activities: newActs});
                    }} placeholder="Describe successful outcomes" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      ))}

      <div className="flex justify-between items-center px-2 mt-8">
        <h3 className="text-xl font-black text-slate-800">Adhoc Monthly Activities</h3>
        <Button size="sm" variant="secondary" onClick={addAdhoc}><Plus size={16}/> Add Adhoc</Button>
      </div>

      {(formData.adhocActivities || []).map((adhoc, i) => (
        <Card key={adhoc.id} className="relative bg-amber-50/30 border-amber-100">
           <button 
            onClick={() => setFormData({...formData, adhocActivities: (formData.adhocActivities || []).filter((_, idx) => idx !== i)})}
            className="absolute top-4 right-4 text-amber-200 hover:text-rose-500 transition-colors"
          >
            <Trash2 size={18} />
          </button>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Activity Name" value={adhoc.name} onChange={(v: string) => {
              const adhocs = [...(formData.adhocActivities || [])];
              adhocs[i].name = v;
              setFormData({...formData, adhocActivities: adhocs});
            }} required />
            <div className="grid grid-cols-2 gap-4">
              <CustomDatePicker label="Start Date" value={adhoc.startDate} onChange={(v: string) => {
                const adhocs = [...(formData.adhocActivities || [])];
                adhocs[i].startDate = v;
                setFormData({...formData, adhocActivities: adhocs});
              }} error={errors[`adhoc_${i}_range`]} />
              <CustomDatePicker label="End Date" value={adhoc.endDate} onChange={(v: string) => {
                const adhocs = [...(formData.adhocActivities || [])];
                adhocs[i].endDate = v;
                setFormData({...formData, adhocActivities: adhocs});
              }} />
            </div>
          </div>
          <Input label="Key Achievement" value={adhoc.achievement} onChange={(v: string) => {
            const adhocs = [...(formData.adhocActivities || [])];
            adhocs[i].achievement = v;
            setFormData({...formData, adhocActivities: adhocs});
          }} placeholder="Adhoc activity results" />
        </Card>
      ))}

      <Button variant="amber" className="w-full py-4 shadow-xl shadow-amber-200/50" onClick={() => { if(validate()) onSave({...formData, reportFinalized: true}); }}>
        <CheckCircle2 size={18}/> Finalize Monthly Report
      </Button>
    </div>
  );
};

// --- Other Form Components ---

const WaterPointForm = ({ onSave }: { onSave: (data: WaterPoint) => void }) => {
  const [data, setData] = useState<Partial<WaterPoint>>({
    functionality: 'Functional',
    repairState: 'Good',
    mechanicContacted: false
  });

  return (
    <Card title="Register Water Point">
      <div className="space-y-4">
        <Input label="Water Point Name/ID" value={data.name} onChange={(v: string) => setData({...data, name: v})} />
        <Select label="Type" options={WATER_POINT_TYPES} value={data.type} onChange={(v: string) => setData({...data, type: v})} />
        <Select label="District" options={MALAWI_DISTRICTS.slice(1)} value={data.district} onChange={(v: string) => setData({...data, district: v})} />
        <Select label="Functionality" options={['Functional', 'Partially Functional', 'Non-Functional']} value={data.functionality} onChange={(v: any) => setData({...data, functionality: v})} />
        <Select label="Repair State" options={['Good', 'Fair', 'Poor']} value={data.repairState} onChange={(v: any) => setData({...data, repairState: v})} />
      </div>
      <Button className="w-full mt-6" onClick={() => onSave({...data, id: Date.now().toString(), lastInspectionDate: new Date().toISOString()} as WaterPoint)}>Save Water Point</Button>
    </Card>
  );
};

const SanitationAssessmentForm = ({ onSave }: { onSave: (data: WASHHouseholdAssessment) => void }) => {
  const [data, setData] = useState<Partial<WASHHouseholdAssessment>>({
    hasToilet: 'No',
    isShared: 'No',
    handwashAvailable: 'No',
    soapAvailable: 'No',
    compoundClean: 'No',
    wasteManagement: 'Pit',
    waterStorage: '',
    waterTreatment: 'None'
  });

  return (
    <Card title="Sanitation Assessment" description="Conduct a household hygiene and sanitation audit.">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
        <Input label="Household Head" value={data.householdHead} onChange={(v: string) => setData({...data, householdHead: v})} required />
        <Input label="Village" value={data.village} onChange={(v: string) => setData({...data, village: v})} required />
        
        <Select label="Main Water Source" options={WATER_POINT_TYPES} value={data.mainWaterSource} onChange={(v: string) => setData({...data, mainWaterSource: v})} required />
        <Input label="Water Storage Container" placeholder="e.g. Covered bucket, Jerry can" value={data.waterStorage} onChange={(v: string) => setData({...data, waterStorage: v})} required />
        
        <Select label="Water Treatment Method" options={WATER_TREATMENT_METHODS} value={data.waterTreatment} onChange={(v: string) => setData({...data, waterTreatment: v})} required />
        <Select label="Has Toilet?" options={['Yes', 'No']} value={data.hasToilet} onChange={(v: any) => setData({...data, hasToilet: v})} required />

        {data.hasToilet === 'Yes' && (
          <>
            <Select label="Toilet Type" options={TOILET_TYPES} value={data.toiletType} onChange={(v: string) => setData({...data, toiletType: v})} />
            <Select label="Toilet Condition" options={['Clean', 'Dirty', 'Needs Repair']} value={data.toiletCondition} onChange={(v: any) => setData({...data, toiletCondition: v})} />
            <Select label="Is Toilet Shared?" options={['Yes', 'No']} value={data.isShared} onChange={(v: any) => setData({...data, isShared: v})} />
          </>
        )}

        <Select label="Handwash Station Available?" options={['Yes', 'No']} value={data.handwashAvailable} onChange={(v: any) => setData({...data, handwashAvailable: v})} required />
        <Select label="Soap/Ash Available?" options={['Yes', 'No']} value={data.soapAvailable} onChange={(v: any) => setData({...data, soapAvailable: v})} required />
        <Select label="Is Compound Clean?" options={['Yes', 'No']} value={data.compoundClean} onChange={(v: any) => setData({...data, compoundClean: v})} required />
        <Select label="Waste Management" options={['Pit', 'Indiscriminate', 'Other']} value={data.wasteManagement} onChange={(v: any) => setData({...data, wasteManagement: v})} required />
      </div>
      <Button className="w-full mt-6 py-3" onClick={() => onSave({...data, id: Date.now().toString(), date: new Date().toISOString()} as WASHHouseholdAssessment)}>
        <Save size={18}/> Submit Assessment
      </Button>
    </Card>
  );
};

const VillageInspectionForm = ({ onSave }: { onSave: (data: VillageInspection) => void }) => {
  const [data, setData] = useState<Partial<VillageInspection>>({
    date: new Date().toISOString().split('T')[0],
    mainWaterSources: [],
    households: [],
    actionPlans: []
  });

  return (
    <Card title="New Village Inspection">
      <div className="space-y-4">
        <CustomDatePicker label="Inspection Date" value={data.date || ''} onChange={(v: string) => setData({...data, date: v})} />
        <Input label="Village Name" value={data.villageName} onChange={(v: string) => setData({...data, villageName: v})} />
        <Select label="District" options={MALAWI_DISTRICTS.slice(1)} value={data.district} onChange={(v: string) => setData({...data, district: v})} />
        <Input label="Health Facility" value={data.healthFacility} onChange={(v: string) => setData({...data, healthFacility: v})} />
        <Input label="GVH Name" value={data.gvh} onChange={(v: string) => setData({...data, gvh: v})} />
      </div>
      <Button className="w-full mt-6" onClick={() => onSave({...data, id: Date.now().toString()} as VillageInspection)}>Submit Inspection</Button>
    </Card>
  );
};

const HSARegistrationForm = ({ onSave }: { onSave: (data: HSARegistration) => void }) => {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<Partial<HSARegistration>>({
    gvhNames: [],
    villages: [],
    supplies: {
      bicycle: { received: 'No' },
      motorcycle: { received: 'No' },
      uniforms: { received: 'No' },
      gumboots: { received: 'No' },
      raincoat: { received: 'No' },
      umbrella: { received: 'No' },
      drugBoxes: { received: 'No' },
      torch: { received: 'No' },
    },
    thematicTrainings: {}
  });

  const handleSave = () => {
    onSave({ ...data, id: Date.now().toString(), submittedAt: new Date().toISOString() } as HSARegistration);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
      <ProgressBar currentStep={step} totalSteps={3} title="Community Health Reporting Tool" />
      {step === 1 && (
        <div className="space-y-4">
          <Input label="Full Name" value={data.hsaName} onChange={(v: string) => setData({ ...data, hsaName: v })} required />
          <Select label="District" value={data.district} options={MALAWI_DISTRICTS.slice(1)} onChange={(v: string) => setData({ ...data, district: v })} required />
          <Select label="Sex" value={data.sex} options={['Male', 'Female']} onChange={(v: any) => setData({ ...data, sex: v })} required />
          <Select label="Position" value={data.position} options={['HSA', 'SHSA']} onChange={(v: any) => setData({ ...data, position: v })} />
          <div className="flex gap-4 pt-4">
            <Button onClick={() => setStep(2)} className="ml-auto">Next Section <ArrowRightCircle size={16}/></Button>
          </div>
        </div>
      )}
      {step === 2 && (
        <div className="space-y-4">
          <Input label="Employment Number" value={data.employmentNumber} onChange={(v: string) => setData({ ...data, employmentNumber: v })} />
          <Input label="National ID" value={data.nationalId} onChange={(v: string) => setData({ ...data, nationalId: v })} />
          <CustomDatePicker label="Date of Birth" value={data.dob || ''} onChange={(v: string) => setData({ ...data, dob: v })} />
          <Input label="Year Appointed" value={data.yearAppointed} onChange={(v: string) => setData({ ...data, yearAppointed: v })} />
          <div className="flex gap-4 pt-4">
            <Button variant="secondary" onClick={() => setStep(1)}>Back</Button>
            <Button onClick={() => setStep(3)} className="ml-auto">Next Section <ArrowRightCircle size={16}/></Button>
          </div>
        </div>
      )}
      {step === 3 && (
        <div className="space-y-4">
          <Input label="Catchment Area" value={data.catchmentArea} onChange={(v: string) => setData({ ...data, catchmentArea: v })} />
          <Input label="Catchment Population" type="number" value={data.catchmentPopulation} onChange={(v: number) => setData({ ...data, catchmentPopulation: v })} />
          <Input label="Reporting Facility" value={data.reportingFacility} onChange={(v: string) => setData({ ...data, reportingFacility: v })} />
          <div className="flex gap-4 pt-4">
            <Button variant="secondary" onClick={() => setStep(2)}>Back</Button>
            <Button onClick={handleSave} className="ml-auto">Complete Reporting <CheckCircle size={16}/></Button>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Landing Page ---

const LandingPage = ({ onLogin }: any) => {
  const [mode, setMode] = useState<'login' | 'register' | 'verify' | 'recovery'>('login');
  const [formData, setFormData] = useState({ 
    fullName: '', 
    phoneNumber: '', 
    district: '', 
    role: UserRole.HSA, 
    password: '',
    confirmPassword: '',
    rememberMe: false
  });
  const [verificationCode, setVerificationCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const remembered = getFromStorage<{ phoneNumber: string }>('remembered_user', { phoneNumber: '' });
    if (remembered.phoneNumber) {
      setFormData(prev => ({ ...prev, phoneNumber: remembered.phoneNumber.replace('+265', ''), rememberMe: true }));
    }
  }, []);

  const handlePhoneChange = (v: string) => {
    const digits = v.replace(/\D/g, '').slice(0, 9);
    setFormData({ ...formData, phoneNumber: digits });
  };

  const handleAction = (e: React.FormEvent) => {
    e.preventDefault();
    const fullPhone = `+265${formData.phoneNumber}`;
    const users = getFromStorage<User[]>('users', []);

    if (mode === 'login') {
      const user = users.find(u => u.phoneNumber === fullPhone && u.password === formData.password);
      if (user) {
        if (formData.rememberMe) {
          saveToStorage('remembered_user', { phoneNumber: fullPhone });
        } else {
          localStorage.removeItem('mehis_remembered_user');
        }
        onLogin(user);
      } else {
        setError("Invalid phone number or password.");
      }
    } else if (mode === 'register') {
      const complexityError = validatePasswordComplexity(formData.password);
      if (complexityError) {
        setError(complexityError);
        return;
      }
      const matchError = validatePasswordsMatch(formData.password, formData.confirmPassword);
      if (matchError) {
        setError(matchError);
        return;
      }
      const existing = users.find(u => u.phoneNumber === fullPhone);
      if (existing) {
        setError("An account with this number already exists.");
        return;
      }

      const newUser = { 
        fullName: formData.fullName, 
        phoneNumber: fullPhone, 
        district: formData.district, 
        role: formData.role, 
        password: formData.password,
        id: Date.now().toString() 
      };
      saveToStorage('users', [...users, newUser]);
      onLogin(newUser);
    } else if (mode === 'recovery') {
      const user = users.find(u => u.phoneNumber === fullPhone);
      if (user) {
        const code = Math.floor(1000 + Math.random() * 9000).toString();
        setGeneratedCode(code);
        setMode('verify');
        alert(`[MOCK SMS to ${fullPhone}]: Your MeHIS password recovery code is ${code}`);
      } else {
        setError("User not found.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-900 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white/95 backdrop-blur-md rounded-[3rem] shadow-2xl p-10 border border-white/20 animate-in fade-in zoom-in duration-500">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-emerald-100 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner animate-bounce">
            <Heart className="text-emerald-600" size={40} />
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tighter">MeHIS</h1>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">
            {mode === 'login' ? 'Welcome Back' : mode === 'register' ? 'Create Account' : mode === 'verify' ? 'Confirm Identity' : 'Account Recovery'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 text-sm font-medium animate-in slide-in-from-top-2">
            <AlertOctagon size={20} />
            {error}
          </div>
        )}

        <form onSubmit={handleAction} className="space-y-4">
          {mode === 'register' && (
            <Input label="Full Name" value={formData.fullName} onChange={(v:any) => setFormData({...formData, fullName: v})} required />
          )}

          {(mode === 'login' || mode === 'register' || mode === 'recovery') && (
            <Input label="Phone Number" value={formData.phoneNumber} onChange={handlePhoneChange} prefix="+265" placeholder="XXXXXXXXX" required />
          )}

          {(mode === 'login' || mode === 'register') && (
            <Input label="Password" type="password" value={formData.password} onChange={(v:any) => setFormData({...formData, password: v})} required />
          )}

          {mode === 'register' && (
            <Input label="Re-enter Password" type="password" value={formData.confirmPassword} onChange={(v:any) => setFormData({...formData, confirmPassword: v})} required />
          )}

          {mode === 'login' && (
            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" checked={formData.rememberMe} onChange={e => setFormData({...formData, rememberMe: e.target.checked})} className="w-4 h-4 accent-emerald-600 rounded border-slate-300" />
                <span className="text-xs font-bold text-slate-500 group-hover:text-slate-700 transition-colors">Remember Me</span>
              </label>
              <button type="button" onClick={() => {setMode('recovery'); setError('');}} className="text-xs font-bold text-emerald-600 hover:text-emerald-700 underline underline-offset-2">Forgot Password?</button>
            </div>
          )}

          <Button type="submit" className="w-full py-4 text-lg mt-4 shadow-xl shadow-emerald-200" size="lg">
            {mode === 'login' ? 'Sign In' : mode === 'register' ? 'Register Account' : mode === 'verify' ? 'Confirm Code' : 'Send Recovery SMS'}
          </Button>
        </form>

        <div className="mt-8 text-center space-y-4 border-t pt-6">
          <button onClick={() => {setMode(mode === 'login' ? 'register' : 'login'); setError('');}} className="text-sm font-black text-emerald-600 uppercase tracking-widest hover:scale-105 transition-transform">
            {mode === 'login' ? 'New here? Join MeHIS' : 'Back to Login'}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Main App Component ---

export default function App() {
  const [user, setUser] = useState<User | null>(getFromStorage<User | null>('currentUser', null));
  const [view, setView] = useState('home');
  const [washView, setWashView] = useState<'hub' | 'waterPoints' | 'quality' | 'sanitation'>('hub');
  const [workPlanView, setWorkPlanView] = useState<'hub' | 'plan' | 'report'>('hub');
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  
  const [hsaData, setHsaData] = useState<HSARegistration[]>(getFromStorage<HSARegistration[]>('hsaData', []));
  const [inspections, setInspections] = useState<VillageInspection[]>(getFromStorage<VillageInspection[]>('inspections', []));
  const [waterPoints, setWaterPoints] = useState<WaterPoint[]>(getFromStorage<WaterPoint[]>('waterPoints', []));
  const [sanitationAssessments, setSanitationAssessments] = useState<WASHHouseholdAssessment[]>(getFromStorage<WASHHouseholdAssessment[]>('sanitationAssessments', []));
  const [workPlans, setWorkPlans] = useState<MonthlyWorkPlan[]>(getFromStorage<MonthlyWorkPlan[]>('workPlans', []));
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => saveToStorage('currentUser', user), [user]);
  useEffect(() => saveToStorage('hsaData', hsaData), [hsaData]);
  useEffect(() => saveToStorage('inspections', inspections), [inspections]);
  useEffect(() => saveToStorage('waterPoints', waterPoints), [waterPoints]);
  useEffect(() => saveToStorage('sanitationAssessments', sanitationAssessments), [sanitationAssessments]);
  useEffect(() => saveToStorage('workPlans', workPlans), [workPlans]);

  const NavItem = ({ id, icon: Icon, label }: any) => (
    <button onClick={() => { setView(id); setIsSidebarOpen(false); setWashView('hub'); setWorkPlanView('hub'); }} className={`flex items-center gap-3 w-full p-4 transition-all ${view === id ? 'text-emerald-700 bg-emerald-50 border-r-4 border-emerald-600 font-black' : 'text-slate-500 hover:bg-slate-50'}`}>
      <Icon size={20} className={view === id ? 'text-emerald-600' : 'text-slate-400'} /><span className="text-sm">{label}</span>
    </button>
  );

  if (!user) return <LandingPage onLogin={(u: User) => setUser(u)} />;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {isSidebarOpen && <div className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />}
      <aside className={`fixed inset-y-0 left-0 w-72 bg-white border-r border-slate-100 z-50 transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-8 border-b flex items-center gap-3"><div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg"><Heart className="text-white" size={22} /></div><h1 className="font-black text-2xl tracking-tighter text-slate-800">MeHIS</h1></div>
        <nav className="py-6">
          <NavItem id="home" icon={Home} label="Home Dashboard" />
          <NavItem id="workplan" icon={FileSpreadsheet} label="Work Plan & Report" />
          <NavItem id="wash" icon={Droplets} label="WASH Module" />
          <NavItem id="inspections" icon={Search} label="Village Inspections" />
          <NavItem id="registration" icon={UserIcon} label="Reporting Tool" />
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t bg-slate-50/50"><button onClick={() => setUser(null)} className="flex items-center gap-2 text-rose-500 text-xs font-black uppercase tracking-widest w-full p-3 bg-rose-50 rounded-xl hover:bg-rose-100"><LogOut size={14}/> Logout</button></div>
      </aside>

      <main className="flex-1 overflow-y-auto lg:ml-72">
        <header className="sticky top-0 bg-white/80 backdrop-blur-xl border-b p-6 flex items-center justify-between z-30">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2 text-slate-400" onClick={() => setIsSidebarOpen(true)}><Menu/></button>
            <h2 className="font-black text-slate-800 tracking-tight text-xl capitalize">
              {view === 'inspections' ? 'Village Visit' : view === 'registration' ? 'Community Health Reporting Tool' : view === 'workplan' ? 'Work Plan & Reporting' : view}
            </h2>
          </div>
        </header>

        <div className="p-8 max-w-5xl mx-auto min-h-screen">
          {view === 'home' && (
            <div className="space-y-8 animate-in fade-in">
              <div className="bg-emerald-600 text-white p-12 rounded-[3rem] shadow-2xl relative overflow-hidden">
                <h1 className="text-4xl font-black mb-4">Hello, {user.fullName.split(' ')[0]}!</h1>
                <p className="text-emerald-50 text-sm max-w-sm font-medium">Capture health facility & community data even without internet access. Data is synced locally for full offline usage.</p>
                <div className="absolute -top-10 -right-10 w-80 h-80 bg-emerald-500/30 rounded-full blur-[100px]"></div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="text-center border-emerald-100 bg-emerald-50/30">
                  <p className="text-3xl font-black text-emerald-600">{hsaData.length}</p>
                  <p className="text-[10px] uppercase font-black text-slate-500">Reports Filed</p>
                </Card>
                <Card className="text-center border-blue-100 bg-blue-50/30">
                  <p className="text-3xl font-black text-blue-600">{inspections.length}</p>
                  <p className="text-[10px] uppercase font-black text-slate-500">Village Visits</p>
                </Card>
                <Card className="text-center border-amber-100 bg-amber-50/30">
                  <p className="text-3xl font-black text-amber-600">{workPlans.length}</p>
                  <p className="text-[10px] uppercase font-black text-slate-500">Work Plans</p>
                </Card>
                <Card className="text-center border-purple-100 bg-purple-50/30">
                  <p className="text-3xl font-black text-purple-600">{waterPoints.length}</p>
                  <p className="text-[10px] uppercase font-black text-slate-500">Water Points</p>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button onClick={() => setView('workplan')} className="p-8 bg-white border rounded-[2.5rem] text-left hover:shadow-xl transition-all group">
                  <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-amber-600 group-hover:text-white transition-colors"><FileSpreadsheet size={28}/></div>
                  <h3 className="font-black text-slate-800 text-xl tracking-tight">Work Plan & Report</h3>
                  <p className="text-xs text-slate-400 mt-2">Create monthly activity targets and log performance results.</p>
                </button>
                <button onClick={() => setView('wash')} className="p-8 bg-white border rounded-[2.5rem] text-left hover:shadow-xl transition-all group">
                  <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors"><Droplets size={28}/></div>
                  <h3 className="font-black text-slate-800 text-xl tracking-tight">WASH</h3>
                  <p className="text-xs text-slate-400 mt-2">Manage Water, Sanitation and Hygiene community data.</p>
                </button>
                <button onClick={() => setView('inspections')} className="p-8 bg-white border rounded-[2.5rem] text-left hover:shadow-xl transition-all group">
                  <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-colors"><Search size={28}/></div>
                  <h3 className="font-black text-slate-800 text-xl tracking-tight">Village Visits</h3>
                  <p className="text-xs text-slate-400 mt-2">Screen communities and track environmental health issues.</p>
                </button>
                <button onClick={() => setView('registration')} className="p-8 bg-white border rounded-[2.5rem] text-left hover:shadow-xl transition-all group">
                  <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-purple-600 group-hover:text-white transition-colors"><Smartphone size={28}/></div>
                  <h3 className="font-black text-slate-800 text-xl tracking-tight">Community Reporting</h3>
                  <p className="text-xs text-slate-400 mt-2">Official health reporting tool for community workers.</p>
                </button>
              </div>
            </div>
          )}

          {view === 'workplan' && (
            <div className="space-y-6">
              {workPlanView === 'hub' ? (
                <div className="space-y-8 animate-in slide-in-from-bottom-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <button onClick={() => { setWorkPlanView('plan'); setSelectedPlanId(null); }} className="p-8 bg-emerald-600 text-white rounded-[2rem] shadow-lg hover:bg-emerald-700 transition-all text-left">
                      <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center mb-4"><Plus size={24}/></div>
                      <p className="font-black text-lg">Create Monthly Plan</p>
                      <p className="text-xs text-emerald-100">Set targets and locations for the next month</p>
                    </button>
                    <button className="p-8 bg-slate-100 text-slate-400 rounded-[2rem] text-left cursor-default">
                      <div className="w-12 h-12 bg-slate-200 rounded-xl flex items-center justify-center mb-4"><HistoryIcon size={24}/></div>
                      <p className="font-black text-lg">Quick Summary</p>
                      <p className="text-xs text-slate-400">View performance trends across districts</p>
                    </button>
                  </div>

                  <Card title="Monthly Plans & Reports" description="Manage your planning cycles and finalize your performance reports.">
                    {workPlans.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mx-auto mb-4"><FileSpreadsheet size={32}/></div>
                        <p className="text-sm font-bold text-slate-400">No active work plans found</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {workPlans.map(plan => (
                          <div key={plan.id} className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-4 hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${plan.reportFinalized ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                                {plan.reportFinalized ? <CheckCircle2 size={24}/> : <CalendarRange size={24}/>}
                              </div>
                              <div>
                                <h4 className="font-black text-slate-800 text-lg tracking-tight uppercase">{plan.month} {plan.year}</h4>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{plan.activities.length} Planned Activities</span>
                                  {plan.reportFinalized && <span className="text-[10px] font-black uppercase text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">Report Finalized</span>}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2 flex-wrap">
                              <Button variant="secondary" size="sm" onClick={() => { setSelectedPlanId(plan.id); setWorkPlanView('plan'); }}><Edit size={14}/> Edit Plan</Button>
                              <Button variant="amber" size="sm" onClick={() => { setSelectedPlanId(plan.id); setWorkPlanView('report'); }}><ClipboardCheck size={14}/> {plan.reportFinalized ? 'View Report' : 'Complete Report'}</Button>
                              <Button variant="ghost" className="text-rose-500" size="sm" onClick={() => { if(confirm("Are you sure?")) setWorkPlans(workPlans.filter(p => p.id !== plan.id)); }}><Trash2 size={14}/></Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                </div>
              ) : (
                <>
                  <button onClick={() => setWorkPlanView('hub')} className="flex items-center gap-2 text-xs font-black text-emerald-600 uppercase tracking-widest mb-6 hover:translate-x-[-4px] transition-transform">
                    <ChevronRight className="rotate-180" size={16}/> Back to Work Plan Hub
                  </button>
                  {workPlanView === 'plan' && (
                    <MonthlyWorkPlanForm 
                      currentUser={user}
                      initialData={selectedPlanId ? workPlans.find(p => p.id === selectedPlanId) : undefined}
                      onSave={(d) => {
                        if (selectedPlanId) {
                          setWorkPlans(workPlans.map(p => p.id === selectedPlanId ? d : p));
                        } else {
                          setWorkPlans([...workPlans, d]);
                        }
                        setWorkPlanView('hub');
                        alert("Monthly Work Plan Saved Successfully.");
                      }} 
                    />
                  )}
                  {workPlanView === 'report' && selectedPlanId && (
                    <MonthlyReportForm 
                      plan={workPlans.find(p => p.id === selectedPlanId)!}
                      onSave={(d) => {
                        setWorkPlans(workPlans.map(p => p.id === selectedPlanId ? d : p));
                        setWorkPlanView('hub');
                        alert("Monthly Performance Report Finalized.");
                      }}
                    />
                  )}
                </>
              )}
            </div>
          )}

          {view === 'wash' && (
            <div className="space-y-6">
               {washView === 'hub' ? (
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4">
                    <button onClick={() => setWashView('waterPoints')} className="p-8 bg-white border rounded-[2rem] text-center shadow-sm hover:border-blue-500 transition-all"><div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-