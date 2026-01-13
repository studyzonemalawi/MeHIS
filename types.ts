
export enum UserRole {
  HSA = 'HSA',
  HEALTH_FACILITY_SUPERVISOR = 'Health facility supervisor',
  DISTRICT_SUPERVISOR = 'District supervisor',
  NATIONAL_SUPERVISOR = 'National supervisor'
}

export interface User {
  fullName: string;
  phoneNumber: string;
  district: string;
  role: UserRole;
  password?: string;
  id: string;
}

export interface VillageData {
  id: string;
  name: string;
  population: number;
  isGazette: boolean;
}

export interface ActivityOccurrence {
  id: string;
  location: string;
  startDate: string;
  endDate: string;
  status?: 'Completed' | 'Partially completed' | 'Completed after reschedule' | 'Not done';
  achievement?: string;
  reason?: string;
  actualDate?: string; // For reschedule
}

export interface WorkPlanActivity {
  id: string;
  name: string;
  targetCount: number;
  occurrences: ActivityOccurrence[];
  resourcesRequired?: string;
}

export interface AdhocActivity {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  achievement: string;
}

export interface MonthlyWorkPlan {
  id: string;
  month: string;
  year: string;
  hsaId: string;
  hsaName: string;
  district: string;
  facility: string;
  activities: WorkPlanActivity[];
  adhocActivities?: AdhocActivity[];
  challenges?: string;
  submittedAt?: string;
  reportFinalized?: boolean;
}

export interface HSARegistration {
  id: string;
  // a. Identification
  district: string;
  hsaName: string;
  sex: 'Male' | 'Female';
  position: 'HSA' | 'SHSA';
  grade: 'HM' | 'HL';
  filledCatchment: 'Yes' | 'No';
  qualification: 'MSCE' | 'JCE' | 'PLSCE';
  yearAppointed: string;
  dob: string;
  employmentNumber: string;
  nationalId: string;
  contact: string;
  salarySupport: 'Government' | 'Partner';
  recruitedBy: string;
  recruitedByOther?: string;
  homeDistrict: string;
  homeTA: string;
  homeGVH: string;
  homeVillage: string;
  postalAddress?: string;

  // b. Training Status
  trainedICHIS: 'Yes' | 'No';
  preserviceShort: 'Yes' | 'No';
  preserviceLong: 'Yes' | 'No';
  mscePasses: 'Yes' | 'No';

  // c. HSA Location
  reportingFacility: string;
  facilityType: string;
  facilityTypeOther?: string;
  healthPostAvailable: 'Yes' | 'No';
  healthPostName?: string;
  catchmentArea: string;
  catchmentPopulation: number;
  gvhNames: string[];
  villages: VillageData[];

  // d. Geography
  coords?: { lat: number; lng: number };
  distanceToFacility: number;
  distanceToCouncil: number;
  numVHCs: number;
  numTrainedVHCs: number;
  villageClinic: 'Yes' | 'No';
  villageClinicFunctional: 'Yes' | 'No';
  hardToReach: 'Yes' | 'No';
  residentInCatchment: 'Yes' | 'No';

  // e. Gadgets
  govPhone: 'Yes' | 'No';
  phoneType?: 'Smart phone' | 'Tablet';
  phoneFunctional?: 'Yes' | 'No';
  yearReceivedPhone?: string;
  solarCharger: 'Yes' | 'No';

  // f. Supplies
  supplies: {
    bicycle: { received: 'Yes' | 'No'; year?: string };
    motorcycle: { received: 'Yes' | 'No'; year?: string };
    uniforms: { received: 'Yes' | 'No'; year?: string };
    gumboots: { received: 'Yes' | 'No'; year?: string };
    raincoat: { received: 'Yes' | 'No'; year?: string };
    umbrella: { received: 'Yes' | 'No'; year?: string };
    drugBoxes: { received: 'Yes' | 'No'; year?: string };
    torch: { received: 'Yes' | 'No'; year?: string };
  };

  // g. Topics
  thematicTrainings: { [key: string]: 'Yes' | 'No' };
  submittedAt?: string;
}

export interface WaterPoint {
  id: string;
  name: string;
  type: string;
  district: string;
  facility: string;
  ta: string;
  village: string;
  coords?: { lat: number; lng: number };
  functionality: 'Functional' | 'Partially Functional' | 'Non-Functional';
  repairState: 'Good' | 'Fair' | 'Poor';
  mechanicContacted: boolean;
  lastInspectionDate: string;
  submittedAt?: string;
}

export interface WaterQualitySample {
  id: string;
  sampleId: string;
  waterPointId: string;
  waterPointName: string;
  collectionDate: string;
  collectionTime: string;
  // H2S Logic
  h2sTestDone: 'Yes' | 'No';
  h2sIncubationStartTime?: string;
  h2sIncubationEndTime?: string;
  h2sResult?: 'Positive' | 'Negative' | 'Pending';
  // DPD Logic
  dpdTestDone: 'Yes' | 'No';
  dpdResult?: number; // ppm or mg/L
  actionTaken: string;
  submittedAt?: string;
}

export interface WASHHouseholdAssessment {
  id: string;
  date: string;
  householdHead: string;
  village: string;
  // Sanitation
  hasToilet: 'Yes' | 'No';
  toiletType?: string;
  toiletCondition?: 'Clean' | 'Dirty' | 'Needs Repair';
  isShared: 'Yes' | 'No';
  // Water
  mainWaterSource: string;
  waterStorage: string;
  waterTreatment: string;
  // Hygiene
  handwashAvailable: 'Yes' | 'No';
  soapAvailable: 'Yes' | 'No';
  compoundClean: 'Yes' | 'No';
  wasteManagement: 'Pit' | 'Indiscriminate' | 'Other';
  submittedAt?: string;
}

export interface HealthPostInfo {
  id: string;
  district: string;
  name: string;
  village: string;
  gvh: string;
  ta: string;
  facility: string;
  catchmentPopulation: number;
  yearConstructed: string;
  coords: { lat: number; lng: number } | null;
  isFunctional: 'Yes' | 'No';
  staffAvailable: string[];
  hasWater: 'Yes' | 'No';
  hasElectricity: 'Yes' | 'No';
  electricityTypes: string[];
  remarks: string;
  submittedAt: string;
}

export interface HCMCInfo {
  id: string;
  district: string;
  hcmcName: string;
  village: string;
  gvh: string;
  ta: string;
  facility: string;
  isFormed: 'Yes' | 'No';
  isOrientedRoles: 'Yes' | 'No';
  isOrientedDFF: 'Yes' | 'No';
  isFunctional: 'Yes' | 'No';
  remarks: string;
  submittedAt: string;
}

export type ThreeState = 'Yes' | 'No' | 'N/A';

export interface HouseholdRecord {
  id: string;
  headName: string;
  hasLatrine: ThreeState;
  latrineSafe?: ThreeState;
  latrineRoof?: ThreeState;
  latrineHandwash?: ThreeState;
  latrineClean?: ThreeState;
  refusePitPresent: ThreeState;
  noIndiscriminateWaste?: ThreeState;
  handwashAvailable: ThreeState;
  soapAshAvailable: ThreeState;
  foodPrepClean: ThreeState;
  utensilsProper: ThreeState;
  personalHygienePromoted: ThreeState;
  wellVentilated: ThreeState;
  noOvercrowding: ThreeState;
  compoundClean: ThreeState;
  properDrainage: ThreeState;
  noStagnantWater: ThreeState;
  mosquitoBreeding: ThreeState;
  llinInUse: ThreeState;
  rodentInfestation: ThreeState;
  animalSheltersAway: ThreeState;
  foodStoredSafely: ThreeState;
  noExpiredFood: ThreeState;
  meatHandledProperly: ThreeState;
  fliesControlled: ThreeState;
  observedDiseases: string[];
  diseaseCases: { [key: string]: number | undefined };
  otherDiseaseSpec?: string;
}

export interface VillageInspection {
  id: string;
  date: string;
  district: string;
  healthFacility: string;
  gvh: string;
  villageName: string;
  villagePopulation?: number;
  numHouseholds?: number;
  mainWaterSources: string[];
  otherWaterSource?: string;
  waterFreeContamination: ThreeState;
  burialSitesSafe: ThreeState;
  boreholesCount?: number;
  boreholesFunctional?: number;
  boreholesCleanSurroundings?: number;
  boreholesFenced?: number;
  boreholesCommittees?: number;
  wellsCount?: number;
  wellsFunctional?: number;
  wellsClean?: number;
  vhcAvailable: ThreeState;
  vhcActive: ThreeState;
  sanitationParticipation: ThreeState;
  households: HouseholdRecord[];
  overallObservations?: string;
  actionPlans: ActionPlan[];
  submittedAt?: string;
}

export interface ActionPlan {
  id: string;
  issueIdentified: string;
  actionRequired: string;
  responsiblePerson: string;
  timeline: string;
}
