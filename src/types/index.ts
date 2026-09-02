export type UserRole = 'company' | 'customer';

export interface UserSession {
  role: UserRole;
  email: string;
  name: string;
  operatorId?: string;
  authenticatedAt: string;
}

export interface CompanyAccount {
  email: string;
  password: string;
  name: string;
  title: string;
  badge: string;
  department: string;
}

export interface CustomerAccount {
  email: string;
  password: string;
  name: string;
  operatorId: string;
  registeredAt: string;
}

export interface Equipment {
  id: string;
  type: string;
  model: string;
  manufactureYear: number | null;
  siteId: string;
  status: 'Available' | 'Rented' | 'Idle' | 'Maintenance';
  ownershipType: string;
}

export interface RentalTransaction {
  rentalId: string;
  equipmentId: string;
  type: string;
  siteId: string;
  checkOutDate: string | null;
  checkInDate: string | null;
  expectedReturnDate: string | null;
  engineHoursPerDay: number;
  idleHoursPerDay: number;
  operatingDays: number;
  lastOperatorId: string;
  fuelUsagePerDay: number;
  status: 'Active' | 'Overdue' | 'Returned';
  utilizationPercent: number;
}

export interface UsageLog {
  usageId: string;
  equipmentId: string;
  type: string;
  date: string | null;
  siteId: string;
  engineHoursPerDay: number;
  idleHoursPerDay: number;
  fuelUsage: number;
  operatorId: string | null;
  locationStatus: string;
  utilizationPercent: number;
  anomalyFlag: 'Normal' | 'Anomaly';
}

export interface DemandRecord {
  demandRecordId: string;
  date: string | null;
  siteId: string;
  equipmentType: string;
  rentalRequests: number;
  rentalsCompleted: number;
  unfulfilledDemand: number;
  averageRentalDurationDays: number;
  priority: 'Normal' | 'High' | 'Critical';
}

export interface Operator {
  operatorId: string;
  name: string;
  primaryEquipmentType: string;
  certificationLevel: string;
  experienceYears: number;
  homeSiteId: string;
  active: 'Yes' | 'No';
}

export interface SiteLocation {
  siteId: string;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  category: string;
}

export interface AnomalyReport {
  id: string;
  equipmentId: string;
  equipmentType: string;
  siteId: string;
  operatorId: string | null;
  anomalyType: 'High Idle' | 'Zero Runtime' | 'Missing Operator' | 'Unassigned Equipment' | 'Overdue Critical' | 'Low Utilization';
  severity: 'Critical' | 'High' | 'Medium';
  reason: string;
  signalData: string;
  recommendedAction: string;
  detectedAt: string;
}

export interface DemandForecast {
  siteId: string;
  siteName: string;
  equipmentType: string;
  projectedDemandNextWeek: number;
  availableAtSite: number;
  predictedGap: number; // positive = deficit, negative/0 = balanced
  confidenceScore: number; // 0-100%
  priority: 'Critical' | 'High' | 'Normal' | 'Low';
  reasoning: string;
}

export interface RecommendationAction {
  id: string;
  title: string;
  category: 'Reassign' | 'Return' | 'Extend' | 'Operator' | 'Maintenance' | 'Pre-position';
  equipmentId: string;
  equipmentType: string;
  sourceSiteId: string;
  targetSiteId?: string;
  signal: string;
  insight: string;
  actionText: string;
  expectedOutcome: string;
  urgency: 'Immediate' | 'Scheduled' | 'Review';
  executed?: boolean;
}

export interface NotificationAlert {
  id: string;
  type: 'overdue' | 'anomaly' | 'idle' | 'demand' | 'return' | 'checkout';
  title: string;
  message: string;
  equipmentId?: string;
  siteId?: string;
  timestamp: string;
  read: boolean;
  severity: 'critical' | 'warning' | 'info';
}

export interface NotificationPreferences {
  email: string;
  overdueAlerts: boolean;
  returnReminders: boolean;
  criticalAnomalies: boolean;
  highIdleAlerts: boolean;
  demandGapAlerts: boolean;
  dailyDigest: boolean;
  enableBrowserPush?: boolean;
  enableAutoEmailDispatch?: boolean;
  ccEmails?: string;
  webhookUrl?: string;
  smtpRelayStatus?: 'active' | 'simulated' | 'connected';
}

export interface EmailDispatchRecord {
  id: string;
  recipientEmail: string;
  ccEmails?: string;
  subject: string;
  severity: 'critical' | 'warning' | 'info';
  alertType: string;
  equipmentId?: string;
  siteId?: string;
  timestamp: string;
  status: 'Delivered' | 'Dispatched' | 'Client Opened';
  deliveryMethod: 'Direct API / Relay' | 'Mail Client (Gmail/Outlook)' | 'Desktop Push' | 'In-App Telemetry Event';
  plainTextBody: string;
  htmlBody: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestedPrompts?: string[];
  dataContext?: {
    equipmentId?: string;
    siteId?: string;
    type?: string;
  };
}
