import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole, UserSession, NotificationPreferences, CompanyAccount, CustomerAccount } from '../types';
import { dataService } from '../services/dataService';
import { emailService } from '../services/emailService';
import defaultCompanyUsers from '../data/authorized_company_users.json';

const INITIAL_CUSTOMER_ACCOUNTS: CustomerAccount[] = [
  {
    email: 'marcus.vance@contractor-fleet.com',
    password: 'CustomerPass2026!',
    name: 'Marcus Vance',
    operatorId: 'OP3457',
    registeredAt: '2026-01-15'
  },
  {
    email: 'terrence.walker@contractor-fleet.com',
    password: 'CustomerPass2026!',
    name: 'Terrence Walker',
    operatorId: 'OP4013',
    registeredAt: '2026-02-10'
  },
  {
    email: 'richard.stone@contractor-fleet.com',
    password: 'CustomerPass2026!',
    name: 'Richard Stone',
    operatorId: 'OP1307',
    registeredAt: '2026-03-01'
  },
  {
    email: 'samuel.hayes@contractor-fleet.com',
    password: 'CustomerPass2026!',
    name: 'Samuel Hayes',
    operatorId: 'OP2247',
    registeredAt: '2026-04-12'
  },
  {
    email: 'himasajeesh2005@gmail.com',
    password: 'CustomerPass2026!',
    name: 'Himas Ajeesh (Wheel Loader Operator)',
    operatorId: 'OP3457',
    registeredAt: '2026-05-01'
  }
];

interface AuthContextType {
  session: UserSession | null;
  isAuthenticated: boolean;
  role: UserRole | null;
  authorizedCompanyAccounts: CompanyAccount[];
  registeredCustomers: CustomerAccount[];
  loginCompany: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  loginCustomer: (email: string, pass: string, operatorId: string) => Promise<{ success: boolean; error?: string }>;
  registerCustomer: (params: { name: string; email: string; operatorId: string; password: string }) => Promise<{ success: boolean; error?: string }>;
  addCompanyMember: (member: CompanyAccount) => void;
  updateCompanyMember: (email: string, updated: Partial<CompanyAccount>) => void;
  removeCompanyMember: (email: string) => void;
  resetCompanyAccountsToDefault: () => void;
  logout: () => void;
  notificationPreferences: NotificationPreferences;
  updateNotificationPreferences: (prefs: Partial<NotificationPreferences>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_KEY = 'cat_smart_rental_session_v3';
const PREFS_KEY = 'cat_smart_rental_notification_prefs_v3';
const CUSTOMERS_KEY = 'cat_registered_customers_v3';
const COMPANY_ACCOUNTS_KEY = 'cat_authorized_company_accounts_v3';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<UserSession | null>(() => {
    try {
      const saved = localStorage.getItem(SESSION_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [authorizedCompanyAccounts, setAuthorizedCompanyAccounts] = useState<CompanyAccount[]>(() => {
    try {
      const saved = localStorage.getItem(COMPANY_ACCOUNTS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return defaultCompanyUsers as CompanyAccount[];
  });

  const [registeredCustomers, setRegisteredCustomers] = useState<CustomerAccount[]>(() => {
    try {
      const saved = localStorage.getItem(CUSTOMERS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return INITIAL_CUSTOMER_ACCOUNTS;
  });

  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferences>(() => {
    try {
      const saved = localStorage.getItem(PREFS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return {
      email: session?.email || 'himasajeesh2005@gmail.com',
      overdueAlerts: true,
      returnReminders: true,
      criticalAnomalies: true,
      highIdleAlerts: true,
      demandGapAlerts: true,
      dailyDigest: false,
      enableBrowserPush: true,
      enableAutoEmailDispatch: true,
      smtpRelayStatus: 'active'
    };
  });

  useEffect(() => {
    if (session) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      setNotificationPreferences(prev => ({ ...prev, email: session.email }));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  }, [session]);

  const saveCompanyAccounts = (accounts: CompanyAccount[]) => {
    setAuthorizedCompanyAccounts(accounts);
    try {
      localStorage.setItem(COMPANY_ACCOUNTS_KEY, JSON.stringify(accounts));
    } catch (e) {
      console.warn('Failed to persist company accounts:', e);
    }
  };

  const addCompanyMember = (member: CompanyAccount) => {
    const cleanEmail = member.email.trim().toLowerCase();
    const filtered = authorizedCompanyAccounts.filter(a => a.email.toLowerCase() !== cleanEmail);
    const updated = [
      {
        ...member,
        email: cleanEmail
      },
      ...filtered
    ];
    saveCompanyAccounts(updated);
  };

  const updateCompanyMember = (targetEmail: string, updatedFields: Partial<CompanyAccount>) => {
    const cleanEmail = targetEmail.trim().toLowerCase();
    const updated = authorizedCompanyAccounts.map(acc => {
      if (acc.email.toLowerCase() === cleanEmail) {
        return { ...acc, ...updatedFields };
      }
      return acc;
    });
    saveCompanyAccounts(updated);
  };

  const removeCompanyMember = (targetEmail: string) => {
    const cleanEmail = targetEmail.trim().toLowerCase();
    const updated = authorizedCompanyAccounts.filter(acc => acc.email.toLowerCase() !== cleanEmail);
    saveCompanyAccounts(updated);
  };

  const resetCompanyAccountsToDefault = () => {
    saveCompanyAccounts(defaultCompanyUsers as CompanyAccount[]);
  };

  const saveCustomers = (customers: CustomerAccount[]) => {
    setRegisteredCustomers(customers);
    try {
      localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
    } catch (e) {
      console.warn('Failed to persist customer accounts:', e);
    }
  };

  const updateNotificationPreferences = (prefs: Partial<NotificationPreferences>) => {
    const updated = { ...notificationPreferences, ...prefs };
    setNotificationPreferences(updated);
    localStorage.setItem(PREFS_KEY, JSON.stringify(updated));
  };

  /**
   * COMPANY LOGIN: Strictly validates against the active authorized corporate list and passwords
   */
  const loginCompany = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    if (!email || !email.trim()) {
      return { success: false, error: 'Please enter your corporate company email address.' };
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = pass ? pass.trim() : '';

    // Find authorized account from active list
    const matchedAccount = authorizedCompanyAccounts.find(
      acc => acc.email.toLowerCase() === cleanEmail
    );

    if (!matchedAccount) {
      return {
        success: false,
        error: `Access Denied. "${email}" is not authorized for Caterpillar Company Operations. Only approved corporate personnel can log in.`
      };
    }

    if (matchedAccount.password !== cleanPass) {
      return {
        success: false,
        error: `Incorrect password for ${matchedAccount.name}. Please enter your authorized corporate password.`
      };
    }

    const newSession: UserSession = {
      role: 'company',
      email: matchedAccount.email,
      name: matchedAccount.name,
      authenticatedAt: new Date().toISOString()
    };

    setSession(newSession);
    updateNotificationPreferences({ email: matchedAccount.email });

    // Automatically send session telemetry link alert
    emailService.sendSessionWelcomeAlert(matchedAccount.email, 'company').catch(e => {
      console.log('Automated welcome email trigger:', e);
    });

    return { success: true };
  };

  /**
   * CUSTOMER REGISTRATION: First time users register, set a password, and get saved
   */
  const registerCustomer = async (params: {
    name: string;
    email: string;
    operatorId: string;
    password: string;
  }): Promise<{ success: boolean; error?: string }> => {
    const { name, email, operatorId, password } = params;

    if (!email || !email.includes('@')) {
      return { success: false, error: 'Please enter a valid customer / operator email address (e.g. Gmail).' };
    }
    if (!name || name.trim().length < 2) {
      return { success: false, error: 'Please enter your full name.' };
    }
    if (!operatorId || !operatorId.trim()) {
      return { success: false, error: 'Operator ID is required (e.g. OP3457, OP4013).' };
    }
    if (!password || password.length < 4) {
      return { success: false, error: 'Password must be at least 4 characters.' };
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanOpId = operatorId.trim().toUpperCase();

    // Check if operator ID is valid in dataset
    const customerData = dataService.getCustomerData(cleanOpId);
    const resolvedName = name.trim() || (customerData?.operator?.name || `Operator ${cleanOpId}`);

    // Check if already registered
    const existingIndex = registeredCustomers.findIndex(
      c => c.email.toLowerCase() === cleanEmail || c.operatorId.toUpperCase() === cleanOpId
    );

    const newAccount: CustomerAccount = {
      email: cleanEmail,
      password: password.trim(),
      name: resolvedName,
      operatorId: cleanOpId,
      registeredAt: new Date().toISOString().split('T')[0]
    };

    let updatedList: CustomerAccount[];
    if (existingIndex >= 0) {
      updatedList = [...registeredCustomers];
      updatedList[existingIndex] = newAccount;
    } else {
      updatedList = [newAccount, ...registeredCustomers];
    }

    saveCustomers(updatedList);

    const newSession: UserSession = {
      role: 'customer',
      email: cleanEmail,
      name: resolvedName,
      operatorId: cleanOpId,
      authenticatedAt: new Date().toISOString()
    };

    setSession(newSession);
    updateNotificationPreferences({ email: cleanEmail });

    // Send automated welcome & registration alert to customer email
    emailService.dispatchAlertEmail({
      recipientEmail: cleanEmail,
      subject: `[CAT Customer Registration] Account Created for Operator ${cleanOpId}`,
      severity: 'info',
      alertType: 'CUSTOMER_REGISTRATION_SUCCESS',
      equipmentId: customerData?.equipment?.id || 'EQX14317',
      equipmentType: customerData?.equipment?.type || 'Heavy Equipment',
      siteId: customerData?.site?.siteId || 'S001',
      siteName: customerData?.site?.name || 'Operational Job Site',
      operatorName: resolvedName,
      reason: `Customer registration successful for ${resolvedName} (Operator ID ${cleanOpId}). Your account has been created with password authentication. All future alerts and maintenance status will be sent to ${cleanEmail}.`,
      recommendedAction: 'Log in anytime using your registered email and password.'
    });

    return { success: true };
  };

  /**
   * CUSTOMER LOGIN: Authenticates registered customer against saved passwords
   */
  const loginCustomer = async (email: string, pass: string, operatorId: string): Promise<{ success: boolean; error?: string }> => {
    if (!email || !email.includes('@')) {
      return { success: false, error: 'Please enter a valid customer email address.' };
    }
    if (!pass || pass.length < 4) {
      return { success: false, error: 'Password must be at least 4 characters.' };
    }
    if (!operatorId || !operatorId.trim()) {
      return { success: false, error: 'Operator ID is required for Customer Portal access.' };
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = pass.trim();
    const cleanOpId = operatorId.trim().toUpperCase();

    // Look for customer in registered accounts
    let account = registeredCustomers.find(
      c => c.email.toLowerCase() === cleanEmail && c.operatorId.toUpperCase() === cleanOpId
    );

    // Fallback search by email or operatorId if user typed email
    if (!account) {
      account = registeredCustomers.find(c => c.email.toLowerCase() === cleanEmail);
    }
    if (!account) {
      account = registeredCustomers.find(c => c.operatorId.toUpperCase() === cleanOpId);
    }

    if (!account) {
      return {
        success: false,
        error: `No registered customer account found for "${email}" with Operator ID "${cleanOpId}". If this is your first time, please click the "Register" tab to create your password.`
      };
    }

    // Verify Password
    if (account.password !== cleanPass) {
      return {
        success: false,
        error: `Incorrect password for operator ${account.name} (${account.operatorId}). Please type the password you created during registration.`
      };
    }

    const customerData = dataService.getCustomerData(account.operatorId);

    const newSession: UserSession = {
      role: 'customer',
      email: account.email,
      name: account.name || (customerData?.operator?.name || `Operator ${account.operatorId}`),
      operatorId: account.operatorId,
      authenticatedAt: new Date().toISOString()
    };

    setSession(newSession);
    updateNotificationPreferences({ email: account.email });

    // Automatically send operator telemetry link alert to the customer login email
    emailService.sendSessionWelcomeAlert(account.email, 'customer', {
      id: account.operatorId,
      name: newSession.name,
      equipmentId: customerData?.equipment?.id || 'EQX14317',
      equipmentType: customerData?.equipment?.type || 'Heavy Machinery',
      siteId: customerData?.site?.siteId || 'S001'
    }).catch(e => {
      console.log('Automated customer welcome email trigger:', e);
    });

    return { success: true };
  };

  const logout = () => {
    setSession(null);
    localStorage.removeItem(SESSION_KEY);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        isAuthenticated: !!session,
        role: session?.role || null,
        authorizedCompanyAccounts,
        registeredCustomers,
        loginCompany,
        loginCustomer,
        registerCustomer,
        addCompanyMember,
        updateCompanyMember,
        removeCompanyMember,
        resetCompanyAccountsToDefault,
        logout,
        notificationPreferences,
        updateNotificationPreferences
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
