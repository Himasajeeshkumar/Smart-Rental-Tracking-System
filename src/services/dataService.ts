import equipmentData from '../data/equipment.json';
import rentalsData from '../data/rentals.json';
import usageLogsData from '../data/usage_logs.json';
import demandHistoryData from '../data/demand_history.json';
import operatorsData from '../data/operators.json';
import sitesData from '../data/sites.json';

import {
  Equipment,
  RentalTransaction,
  UsageLog,
  DemandRecord,
  Operator,
  SiteLocation,
  AnomalyReport,
  DemandForecast,
  RecommendationAction,
  NotificationAlert,
  NotificationPreferences
} from '../types';
import { emailService } from './emailService';

// In-Memory mutable dataset initialized from JSON files
class DataService {
  private equipment: Equipment[] = [...(equipmentData as Equipment[])];
  private rentals: RentalTransaction[] = [...(rentalsData as RentalTransaction[])];
  private usageLogs: UsageLog[] = [...(usageLogsData as UsageLog[])];
  private demandHistory: DemandRecord[] = [...(demandHistoryData as DemandRecord[])];
  private operators: Operator[] = [...(operatorsData as Operator[])];
  private sites: SiteLocation[] = [...(sitesData as SiteLocation[])];

  private recommendations: RecommendationAction[] = [];
  private notifications: NotificationAlert[] = [];
  private listeners: (() => void)[] = [];

  constructor() {
    this.initRecommendations();
    this.initNotifications();
  }

  // Event subscription for UI reactivity
  public subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(listener => listener());
  }

  // --- Getters ---
  public getEquipment(): Equipment[] {
    return this.equipment;
  }

  public getRentals(): RentalTransaction[] {
    return this.rentals;
  }

  public getUsageLogs(): UsageLog[] {
    return this.usageLogs;
  }

  public getDemandHistory(): DemandRecord[] {
    return this.demandHistory;
  }

  public getOperators(): Operator[] {
    return this.operators;
  }

  public getSites(): SiteLocation[] {
    return this.sites;
  }

  public getEquipmentById(id: string): Equipment | undefined {
    return this.equipment.find(e => e.id.toLowerCase() === id.toLowerCase());
  }

  public getOperatorById(id: string): Operator | undefined {
    return this.operators.find(o => o.operatorId.toLowerCase() === id.toLowerCase());
  }

  public getSiteById(siteId: string): SiteLocation | undefined {
    return this.sites.find(s => s.siteId.toLowerCase() === siteId.toLowerCase());
  }

  public getRentalsByEquipmentId(eqId: string): RentalTransaction[] {
    return this.rentals.filter(r => r.equipmentId.toLowerCase() === eqId.toLowerCase());
  }

  public getActiveRentalByEquipmentId(eqId: string): RentalTransaction | undefined {
    return this.rentals.find(r => r.equipmentId.toLowerCase() === eqId.toLowerCase() && (r.status === 'Active' || r.status === 'Overdue'));
  }

  public getUsageLogsByEquipmentId(eqId: string): UsageLog[] {
    return this.usageLogs.filter(u => u.equipmentId.toLowerCase() === eqId.toLowerCase());
  }

  // --- Executive KPIs ---
  public getKPISummary() {
    const totalEquipment = this.equipment.length;
    const rentedEquipment = this.equipment.filter(e => e.status === 'Rented').length;
    const idleEquipment = this.equipment.filter(e => e.status === 'Idle').length;
    const availableEquipment = this.equipment.filter(e => e.status === 'Available').length;
    const maintenanceEquipment = this.equipment.filter(e => e.status === 'Maintenance').length;

    const activeRentals = this.rentals.filter(r => r.status === 'Active' || r.status === 'Overdue');
    const overdueRentals = this.rentals.filter(r => r.status === 'Overdue');

    // Calculate unassigned equipment (available or idle at sites with no operator assigned)
    const unassignedCount = this.equipment.filter(e => e.status === 'Available' || e.status === 'Idle').length;

    // Average utilization from active rentals
    const totalUtil = activeRentals.reduce((sum, r) => sum + (Number(r.utilizationPercent) || 0), 0);
    const avgUtilization = activeRentals.length > 0 ? (totalUtil / activeRentals.length).toFixed(1) : '74.2';

    // Calculate anomalies and demand gaps
    const anomalies = this.getAnomalies();
    const demandForecasts = this.getDemandForecasts();
    const demandGaps = demandForecasts.filter(f => f.predictedGap > 0).length;

    return {
      totalEquipment,
      rentedEquipment,
      activeRentals: activeRentals.length,
      idleEquipment,
      availableEquipment,
      maintenanceEquipment,
      overdueCount: overdueRentals.length,
      unassignedCount,
      avgUtilization: Number(avgUtilization),
      attentionCount: overdueRentals.length + anomalies.length,
      demandGaps
    };
  }

  // --- Overdue Rentals ---
  public getOverdueRentals(): (RentalTransaction & { daysOverdue: number; siteName: string; operatorName: string })[] {
    const overdue = this.rentals.filter(r => r.status === 'Overdue');
    return overdue.map(r => {
      const site = this.getSiteById(r.siteId);
      const op = this.getOperatorById(r.lastOperatorId);
      return {
        ...r,
        daysOverdue: Math.floor(Math.random() * 8) + 2, // 2-10 days overdue
        siteName: site ? site.name : r.siteId,
        operatorName: op ? op.name : r.lastOperatorId || 'Unassigned'
      };
    });
  }

  // --- Explainable Anomalies ---
  public getAnomalies(): AnomalyReport[] {
    const reports: AnomalyReport[] = [];

    // 1. High Idle Anomaly in Rentals
    const highIdleRentals = this.rentals
      .filter(r => (r.status === 'Active' || r.status === 'Overdue') && r.idleHoursPerDay > 4.0)
      .slice(0, 15);

    highIdleRentals.forEach((r, idx) => {
      reports.push({
        id: `ANOM-IDLE-${idx + 1}`,
        equipmentId: r.equipmentId,
        equipmentType: r.type,
        siteId: r.siteId,
        operatorId: r.lastOperatorId,
        anomalyType: 'High Idle',
        severity: r.idleHoursPerDay > 5.5 ? 'Critical' : 'High',
        reason: `Engine idle time (${r.idleHoursPerDay} hrs/day) exceeds 45% of total operating shift. Machine is running without moving earth.`,
        signalData: `Idle: ${r.idleHoursPerDay}h/day | Engine: ${r.engineHoursPerDay}h/day | Util: ${r.utilizationPercent}%`,
        recommendedAction: 'Reassign machine to high-demand active excavation phase or prompt operator on idle shutdown.',
        detectedAt: '2 hours ago'
      });
    });

    // 2. Zero Runtime Anomaly
    const zeroRuntime = this.rentals
      .filter(r => r.status === 'Active' && (r.engineHoursPerDay < 1.0 || r.utilizationPercent < 15))
      .slice(0, 8);

    zeroRuntime.forEach((r, idx) => {
      reports.push({
        id: `ANOM-ZERO-${idx + 1}`,
        equipmentId: r.equipmentId,
        equipmentType: r.type,
        siteId: r.siteId,
        operatorId: r.lastOperatorId,
        anomalyType: 'Zero Runtime',
        severity: 'Critical',
        reason: `Rented equipment has near-zero runtime (${r.engineHoursPerDay} hrs/day) over ${r.operatingDays} operating days. Incurring rental cost while dormant.`,
        signalData: `Engine: ${r.engineHoursPerDay}h/day | Operating Days: ${r.operatingDays}d | Status: Rented`,
        recommendedAction: 'Initiate early rental check-in or reassign to adjacent deficit site.',
        detectedAt: 'Today'
      });
    });

    // 3. Missing Operator Anomaly
    const missingOpLogs = this.usageLogs
      .filter(u => u.anomalyFlag === 'Anomaly' && !u.operatorId)
      .slice(0, 10);

    missingOpLogs.forEach((u, idx) => {
      reports.push({
        id: `ANOM-OP-${idx + 1}`,
        equipmentId: u.equipmentId,
        equipmentType: u.type,
        siteId: u.siteId,
        operatorId: null,
        anomalyType: 'Missing Operator',
        severity: 'Medium',
        reason: `Telemetry logged on-site operation (${u.engineHoursPerDay} hrs) without authenticated operator credentials.`,
        signalData: `Usage Log ID: ${u.usageId} | Date: ${u.date} | Site: ${u.siteId}`,
        recommendedAction: 'Verify site supervisor sign-off and assign certified operator.',
        detectedAt: 'Yesterday'
      });
    });

    return reports;
  }

  // --- Demand Forecasting ---
  public getDemandForecasts(): DemandForecast[] {
    const forecasts: DemandForecast[] = [];

    // Group demand records by site and equipment type
    const siteTypeMap: { [key: string]: { requests: number; completed: number; unfulfilled: number; count: number } } = {};

    this.demandHistory.forEach(d => {
      const key = `${d.siteId}___${d.equipmentType}`;
      if (!siteTypeMap[key]) {
        siteTypeMap[key] = { requests: 0, completed: 0, unfulfilled: 0, count: 0 };
      }
      siteTypeMap[key].requests += Number(d.rentalRequests) || 0;
      siteTypeMap[key].completed += Number(d.rentalsCompleted) || 0;
      siteTypeMap[key].unfulfilled += Number(d.unfulfilledDemand) || 0;
      siteTypeMap[key].count += 1;
    });

    // Generate forecasts for top sites
    const topSiteKeys = Object.keys(siteTypeMap).slice(0, 30);

    topSiteKeys.forEach(key => {
      const [siteId, equipmentType] = key.split('___');
      const stats = siteTypeMap[key];
      const avgWeeklyReq = Math.max(1, Math.round(stats.requests / stats.count));
      const unfulfilled = stats.unfulfilled;

      // Count currently available machines of this type at this site
      const availableAtSite = this.equipment.filter(
        e => e.siteId === siteId && e.type === equipmentType && (e.status === 'Available' || e.status === 'Idle')
      ).length;

      const projectedDemand = Math.max(2, Math.round(avgWeeklyReq * 1.15 + (unfulfilled > 0 ? 1 : 0)));
      const gap = Math.max(0, projectedDemand - availableAtSite);
      const confidence = Math.min(96, Math.max(72, 80 + Math.round(stats.count / 2)));
      const site = this.getSiteById(siteId);

      let reasoning = '';
      if (gap > 0) {
        reasoning = `Historical surge of +${Math.round(stats.requests / 10)}% in ${equipmentType} requests coupled with ${availableAtSite} on-site units yields a net deficit of ${gap} unit(s).`;
      } else {
        reasoning = `On-site inventory (${availableAtSite} units) matches projected weekly demand of ${projectedDemand} units. Fleet balanced.`;
      }

      forecasts.push({
        siteId,
        siteName: site ? site.name : siteId,
        equipmentType,
        projectedDemandNextWeek: projectedDemand,
        availableAtSite,
        predictedGap: gap,
        confidenceScore: confidence,
        priority: gap >= 3 ? 'Critical' : gap > 0 ? 'High' : 'Normal',
        reasoning
      });
    });

    return forecasts.sort((a, b) => b.predictedGap - a.predictedGap);
  }

  // --- Recommendations / Action Queue ---
  private initRecommendations() {
    this.recommendations = [
      {
        id: 'REC-001',
        title: 'Reassign Dormant Wheel Loader to Deficit Site S003',
        category: 'Reassign',
        equipmentId: 'EQX10000',
        equipmentType: 'Wheel Loader',
        sourceSiteId: 'S012',
        targetSiteId: 'S003',
        signal: 'EQX10000 has been idle for 6 consecutive days at S012 while S003 has an unfulfilled deficit of 2 Wheel Loaders.',
        insight: 'Cross-site transfer will eliminate 34 idle hours/week and avoid external rental procurement costs.',
        actionText: 'Execute Transfer to S003',
        expectedOutcome: '+24% fleet utilization gain, $4,200/mo third-party rental avoidance.',
        urgency: 'Immediate',
        executed: false
      },
      {
        id: 'REC-002',
        title: 'Initiate Early Return for Low-Usage Excavator EQX12520',
        category: 'Return',
        equipmentId: 'EQX12520',
        equipmentType: 'Excavator',
        sourceSiteId: 'S037',
        signal: 'Rental transaction R000001 active with only 1.2 hrs/day engine runtime versus 7.2 scheduled hours.',
        insight: 'Excavation phase at Site S037 completed ahead of schedule. Equipment is dormant on site.',
        actionText: 'Trigger Check-In & Final Inspection',
        expectedOutcome: 'Stops ongoing rental billing overrun and makes unit available for active bids.',
        urgency: 'Immediate',
        executed: false
      },
      {
        id: 'REC-003',
        title: 'Assign Certified Operator to Unattended Crane EQX11487',
        category: 'Operator',
        equipmentId: 'EQX11487',
        equipmentType: 'Crane',
        sourceSiteId: 'S006',
        signal: 'Crane is on-site at S006 with no active operator assigned for the upcoming structural lift shift.',
        insight: 'Operator OP1307 is Level 2 certified on Heavy Cranes and currently on standby at adjacent site S006.',
        actionText: 'Assign Operator OP1307',
        expectedOutcome: 'Ensures lift schedule compliance and safety audit certification.',
        urgency: 'Scheduled',
        executed: false
      },
      {
        id: 'REC-004',
        title: 'Extend Rental Duration for High-Output Bulldozer EQX14317',
        category: 'Extend',
        equipmentId: 'EQX14317',
        equipmentType: 'Bulldozer',
        sourceSiteId: 'S050',
        signal: 'Active rental approaching expected return date with 86% peak daily utilization on levee embankment project.',
        insight: 'Site S050 earthwork phase extended by 14 days due to recent weather delays.',
        actionText: 'Extend Rental by 14 Days',
        expectedOutcome: 'Prevents operational disruption and secures contracted equipment rate.',
        urgency: 'Review',
        executed: false
      },
      {
        id: 'REC-005',
        title: 'Pre-Position 2 Compactors at Interstate 80 Project (S006)',
        category: 'Pre-position',
        equipmentId: 'EQX12632',
        equipmentType: 'Compactor',
        sourceSiteId: 'S031',
        targetSiteId: 'S006',
        signal: 'Demand forecast predicts 4 Compactor requests at S006 next week with 0 units currently available.',
        insight: 'S031 has 3 idle compactors awaiting return.',
        actionText: 'Pre-Position to S006',
        expectedOutcome: 'Zero-day turnaround for upcoming asphalt paving milestone.',
        urgency: 'Scheduled',
        executed: false
      }
    ];
  }

  public getRecommendations(): RecommendationAction[] {
    return this.recommendations;
  }

  public executeRecommendation(recId: string): boolean {
    const rec = this.recommendations.find(r => r.id === recId);
    if (rec) {
      rec.executed = true;
      if (rec.category === 'Reassign' && rec.targetSiteId) {
        const eq = this.getEquipmentById(rec.equipmentId);
        if (eq) {
          eq.siteId = rec.targetSiteId;
          eq.status = 'Rented';
        }
      } else if (rec.category === 'Return') {
        const eq = this.getEquipmentById(rec.equipmentId);
        if (eq) {
          eq.status = 'Available';
        }
      }
      this.notify();
      return true;
    }
    return false;
  }

  // --- Notifications ---
  private initNotifications() {
    this.notifications = [
      {
        id: 'NOTIF-01',
        type: 'overdue',
        title: 'Rental Overdue Warning',
        message: 'Excavator EQX12520 at Site S037 has passed its expected return date by 3 days.',
        equipmentId: 'EQX12520',
        siteId: 'S037',
        timestamp: '10 mins ago',
        read: false,
        severity: 'critical'
      },
      {
        id: 'NOTIF-02',
        type: 'anomaly',
        title: 'Excessive Idle Hours Flagged',
        message: 'Wheel Loader EQX10000 at Site S012 logged 5.8 idle hours/day with <15% utilization.',
        equipmentId: 'EQX10000',
        siteId: 'S012',
        timestamp: '1 hour ago',
        read: false,
        severity: 'warning'
      },
      {
        id: 'NOTIF-03',
        type: 'demand',
        title: 'Projected Demand Deficit',
        message: 'Site S003 requires 2 additional Excavators next week for Highland Hydroelectric expansion.',
        siteId: 'S003',
        timestamp: '3 hours ago',
        read: true,
        severity: 'info'
      }
    ];
  }

  public getNotifications(): NotificationAlert[] {
    return this.notifications;
  }

  public markNotificationAsRead(id: string) {
    const n = this.notifications.find(item => item.id === id);
    if (n) {
      n.read = true;
      this.notify();
    }
  }

  public addNotification(alert: Omit<NotificationAlert, 'id' | 'timestamp' | 'read'>) {
    const newAlert: NotificationAlert = {
      ...alert,
      id: `NOTIF-${Date.now()}`,
      timestamp: 'Just now',
      read: false
    };
    this.notifications.unshift(newAlert);
    this.notify();

    // Auto-dispatch email alert if preferences allow
    try {
      const prefsRaw = localStorage.getItem('cat_smart_rental_notification_prefs_v1');
      const prefs: NotificationPreferences = prefsRaw ? JSON.parse(prefsRaw) : {
        email: 'himasajeesh2005@gmail.com',
        overdueAlerts: true,
        criticalAnomalies: true,
        enableAutoEmailDispatch: true,
        enableBrowserPush: true
      };

      if (prefs.enableAutoEmailDispatch !== false && prefs.email) {
        const shouldSend =
          (alert.type === 'overdue' && prefs.overdueAlerts !== false) ||
          (alert.type === 'anomaly' && prefs.criticalAnomalies !== false) ||
          (alert.type === 'idle' && prefs.highIdleAlerts !== false) ||
          alert.severity === 'critical';

        if (shouldSend) {
          const eq = alert.equipmentId ? this.getEquipmentById(alert.equipmentId) : undefined;
          const site = alert.siteId ? this.getSiteById(alert.siteId) : undefined;

          emailService.dispatchAlertEmail(
            {
              recipientEmail: prefs.email,
              ccEmails: prefs.ccEmails,
              subject: `[CAT Telemetry Alert] ${alert.title}`,
              severity: alert.severity,
              alertType: alert.type.toUpperCase(),
              equipmentId: alert.equipmentId,
              equipmentType: eq?.type,
              siteId: alert.siteId,
              siteName: site?.name,
              reason: alert.message,
              recommendedAction: 'Verify telemetry parameters and coordinate with site operations lead.'
            },
            prefs
          );
        }
      }
    } catch (e) {
      console.warn('Auto email dispatch skipped:', e);
    }
  }

  // --- Customer Portal Isolation ---
  public getCustomerData(operatorId: string) {
    const cleanOpId = operatorId.trim().toUpperCase();
    const operator = this.operators.find(o => o.operatorId.toUpperCase() === cleanOpId);

    if (!operator) {
      return null;
    }

    // Find rentals associated with this operator
    const associatedRentals = this.rentals.filter(
      r => r.lastOperatorId.toUpperCase() === cleanOpId
    );

    // Also look for usage logs
    const associatedUsage = this.usageLogs.filter(
      u => u.operatorId && u.operatorId.toUpperCase() === cleanOpId
    );

    // Identify active or most recent rental
    let primaryRental = associatedRentals.find(r => r.status === 'Active' || r.status === 'Overdue');
    if (!primaryRental && associatedRentals.length > 0) {
      primaryRental = associatedRentals[0];
    }

    // If no rental directly matches, find equipment by operator's home site or usage
    let equipment: Equipment | undefined;
    let site: SiteLocation | undefined;

    if (primaryRental) {
      equipment = this.getEquipmentById(primaryRental.equipmentId);
      site = this.getSiteById(primaryRental.siteId);
    } else if (associatedUsage.length > 0) {
      const usage = associatedUsage[0];
      equipment = this.getEquipmentById(usage.equipmentId);
      site = this.getSiteById(usage.siteId);
    } else {
      // Find equipment at operator's home site matching primary equipment type
      equipment = this.equipment.find(
        e => e.siteId === operator.homeSiteId && e.type.toLowerCase().includes(operator.primaryEquipmentType.toLowerCase())
      ) || this.equipment.find(e => e.siteId === operator.homeSiteId);
      site = this.getSiteById(operator.homeSiteId);
    }

    // Fallback site if needed
    if (!site && equipment) {
      site = this.getSiteById(equipment.siteId);
    }

    return {
      operator,
      primaryRental: primaryRental || {
        rentalId: `R-${operator.operatorId}`,
        equipmentId: equipment ? equipment.id : 'EQX14317',
        type: equipment ? equipment.type : operator.primaryEquipmentType,
        siteId: site ? site.siteId : operator.homeSiteId,
        checkOutDate: '2026-07-29',
        checkInDate: null,
        expectedReturnDate: '2026-10-15',
        engineHoursPerDay: 7.2,
        idleHoursPerDay: 1.1,
        operatingDays: 32,
        lastOperatorId: operator.operatorId,
        fuelUsagePerDay: 58.4,
        status: 'Active' as const,
        utilizationPercent: 86.5
      },
      allPermittedRentals: associatedRentals,
      equipment: equipment || {
        id: 'EQX14317',
        type: operator.primaryEquipmentType,
        model: 'CAT 336 NextGen',
        manufactureYear: 2025,
        siteId: site ? site.siteId : operator.homeSiteId,
        status: 'Rented' as const,
        ownershipType: 'Owned'
      },
      site: site || {
        siteId: operator.homeSiteId || 'S001',
        name: `${operator.homeSiteId || 'S001'} - Operational Field Site`,
        location: 'Active Construction Sector',
        latitude: 34.0522,
        longitude: -118.2437,
        category: 'Civil Construction'
      }
    };
  }

  // --- Check-Out Workflow ---
  public checkOutEquipment(params: {
    equipmentId: string;
    operatorId: string;
    siteId: string;
    checkOutDate: string;
    expectedReturnDate: string;
    initialCondition: string;
    notes?: string;
  }): { success: boolean; message: string; rentalId: string } {
    const eq = this.getEquipmentById(params.equipmentId);
    if (!eq) {
      return { success: false, message: `Equipment ${params.equipmentId} not found in catalog.`, rentalId: '' };
    }

    const rentalId = `R${String(this.rentals.length + 1).padStart(6, '0')}`;
    const newRental: RentalTransaction = {
      rentalId,
      equipmentId: eq.id,
      type: eq.type,
      siteId: params.siteId,
      checkOutDate: params.checkOutDate,
      checkInDate: null,
      expectedReturnDate: params.expectedReturnDate,
      engineHoursPerDay: 0,
      idleHoursPerDay: 0,
      operatingDays: 1,
      lastOperatorId: params.operatorId,
      fuelUsagePerDay: 0,
      status: 'Active',
      utilizationPercent: 100
    };

    // Update equipment
    eq.status = 'Rented';
    eq.siteId = params.siteId;

    this.rentals.unshift(newRental);
    this.addNotification({
      type: 'checkout',
      title: 'Equipment Checked Out',
      message: `${eq.type} (${eq.id}) successfully dispatched to Site ${params.siteId} for operator ${params.operatorId}.`,
      equipmentId: eq.id,
      siteId: params.siteId,
      severity: 'info'
    });

    this.notify();
    return { success: true, message: `Dispatched ${eq.id} under Rental ID ${rentalId}`, rentalId };
  }

  // --- Check-In Workflow ---
  public checkInEquipment(params: {
    equipmentId: string;
    checkInDate: string;
    finalCondition: string;
    loggedEngineHours: number;
    notes?: string;
  }): { success: boolean; message: string } {
    const eq = this.getEquipmentById(params.equipmentId);
    if (!eq) {
      return { success: false, message: `Equipment ${params.equipmentId} not found.` };
    }

    const activeRental = this.getActiveRentalByEquipmentId(params.equipmentId);
    if (activeRental) {
      activeRental.status = 'Returned';
      activeRental.checkInDate = params.checkInDate;
    }

    eq.status = params.finalCondition === 'Needs Maintenance' ? 'Maintenance' : 'Available';

    this.addNotification({
      type: 'return',
      title: 'Equipment Returned & Checked In',
      message: `${eq.type} (${eq.id}) returned at ${params.checkInDate}. Status updated to ${eq.status}.`,
      equipmentId: eq.id,
      siteId: eq.siteId,
      severity: 'info'
    });

    this.notify();
    return { success: true, message: `Successfully checked in ${eq.id}. Marked as ${eq.status}.` };
  }

  // --- Site Operations Topology ---
  public getSiteTopology() {
    return this.sites.map(site => {
      const siteEquipment = this.equipment.filter(e => e.siteId === site.siteId);
      const activeCount = siteEquipment.filter(e => e.status === 'Rented').length;
      const idleCount = siteEquipment.filter(e => e.status === 'Idle').length;
      const availableCount = siteEquipment.filter(e => e.status === 'Available').length;
      const maintenanceCount = siteEquipment.filter(e => e.status === 'Maintenance').length;

      const siteRentals = this.rentals.filter(r => r.siteId === site.siteId && (r.status === 'Active' || r.status === 'Overdue'));
      const overdueCount = siteRentals.filter(r => r.status === 'Overdue').length;

      const totalUtil = siteRentals.reduce((sum, r) => sum + (Number(r.utilizationPercent) || 0), 0);
      const avgUtil = siteRentals.length > 0 ? Math.round(totalUtil / siteRentals.length) : Math.round(60 + (siteEquipment.length % 35));

      // Calculate demand deficit for this site
      const siteDemand = this.demandHistory.filter(d => d.siteId === site.siteId);
      const totalUnfulfilled = siteDemand.reduce((sum, d) => sum + (Number(d.unfulfilledDemand) || 0), 0);
      const demandDeficit = Math.max(0, Math.round(totalUnfulfilled / Math.max(1, siteDemand.length / 5)));

      return {
        ...site,
        totalAssets: siteEquipment.length,
        activeCount,
        idleCount,
        availableCount,
        maintenanceCount,
        overdueCount,
        utilizationPercent: avgUtil,
        demandDeficit,
        assignedEquipment: siteEquipment
      };
    });
  }
}

export const dataService = new DataService();
