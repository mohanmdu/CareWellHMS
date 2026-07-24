/** IP Dashboard quadrant. bedsTotal/bedsOccupied are a live snapshot (asOf) - not affected by the date filter. */
export interface CeoIpSummary {
  bedsTotal: number;
  bedsOccupied: number;
  patientsAdmitted: number;
  patientsDischarged: number;
  asOf: string;
}

/** OP Dashboard quadrant. "New" = the patient's chronologically first-ever appointment. */
export interface CeoOpSummary {
  totalAppointments: number;
  newAppointments: number;
  repeatAppointments: number;
}

/** IP Revenue pie chart. labXray is combined (no Radiology split needed on the IP side). */
export interface CeoIpRevenue {
  labXray: number;
  pharmacy: number;
  roomRent: number;
  consultingFee: number;
  other: number;
  total: number;
}

/** OP Revenue donut chart. Unlike the IP side, Lab and Radiology are split here. */
export interface CeoOpRevenue {
  consultingFee: number;
  lab: number;
  radiology: number;
  pharmacy: number;
  other: number;
  total: number;
}

/** The global From/To filter shared by all 4 quadrants - null fields mean "in place" (no date bound). */
export interface CeoDashboardDateRange {
  fromDate: string | null;
  toDate: string | null;
}
