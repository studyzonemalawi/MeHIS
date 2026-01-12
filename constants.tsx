
export const MALAWI_DISTRICTS = [
  "All Districts",
  "Balaka", "Blantyre", "Chikwawa", "Chiradzulu", "Chitipa", "Dedza", "Dowa",
  "Karonga", "Kasungu", "Likoma", "Lilongwe", "Machinga", "Mangochi", "Mchinji",
  "Mulanje", "Mwanza", "Mzimba", "Nkhata Bay", "Nkhotakota", "Nsanje", "Ntcheu",
  "Ntchisi", "Phalombe", "Rumphi", "Salima", "Thyolo", "Zomba"
];

export const YEARS = Array.from({ length: 80 }, (_, i) => (new Date().getFullYear() - i).toString());

export const TRAINING_TOPICS = [
  "Immunization", "Vitamin A and Nutrition screening", "iCCM", "CBMNC",
  "Family planning", "HIV Testing", "Malaria prevention", "Home based care",
  "NCD screening", "NTD prevention and treatment", "WASH",
  "Food safety and Hygiene", "Climate Change and Health", "IDSR"
];

export const FACILITY_TYPES = ["Government", "CHAM", "Private", "Other"];

export const RECRUITERS = [
  "Government", "Global Fund", "G2G-USAID", "Watikweza",
  "UNICEF", "PEPFER-HBCU", "Other"
];

export const WATER_POINT_TYPES = [
  "Borehole",
  "Piped Water (Communal Tap)",
  "Protected Shallow Well",
  "Unprotected Shallow Well",
  "Protected Spring",
  "Unprotected Spring",
  "River/Stream",
  "Dam/Cistern",
  "Other"
];

export const WATER_TREATMENT_METHODS = [
  "Boiling",
  "Chlorination (Water Guard)",
  "Filtration",
  "Solar Disinfection (SODIS)",
  "None",
  "Other"
];

export const TOILET_TYPES = [
  "Traditional Pit Latrine",
  "Improved Pit Latrine (VIP)",
  "Flush Toilet",
  "Composting Toilet",
  "No Facility (Open Defecation)",
  "Other"
];
