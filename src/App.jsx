import React, { useState, useEffect, useMemo } from 'react';
import {
  LayoutDashboard,
  Box,
  ClipboardList,
  Sparkles,
  Wrench,
  History,
  Settings,
  QrCode,
  TrendingUp
} from 'lucide-react';
import { TECHNICIANS } from './data/constants';
import { loadActiveSession, loadRegisteredUsers, saveActiveSession, saveRegisteredUsers } from './utils/authStorage';
import { getDaysUntil, getTodayDateString } from './utils/dateUtils';
import { getDefaultStore, loadStore, saveStore } from './utils/storage';
import Sidebar from './components/Sidebar/Sidebar';
import Topbar from './components/Topbar/Topbar';
import StorageWarningBanner from './components/StorageWarningBanner/StorageWarningBanner';
import ToastStack from './components/ToastStack/ToastStack';
import JudgeGuideModal from './components/JudgeGuideModal/JudgeGuideModal';
import AuthGatewayView from './pages/AuthGatewayView/AuthGatewayView';
import AnalyticsTrendsView from './pages/AnalyticsTrendsView/AnalyticsTrendsView';
import DashboardView from './pages/DashboardView/DashboardView';
import AssetsView from './pages/AssetsView/AssetsView';
import AssetDetailsView from './pages/AssetDetailsView/AssetDetailsView';
import IssuesView from './pages/IssuesView/IssuesView';
import IssueDetailsView from './pages/IssueDetailsView/IssueDetailsView';
import AITriageView from './pages/AITriageView/AITriageView';
import MaintenanceView from './pages/MaintenanceView/MaintenanceView';
import HistoryView from './pages/HistoryView/HistoryView';
import SettingsView from './pages/SettingsView/SettingsView';
import NotFoundView from './pages/NotFoundView/NotFoundView';
import PublicPortalDirectoryView from './pages/PublicPortalDirectoryView/PublicPortalDirectoryView';
import PublicQRStandaloneView from './pages/PublicQRStandaloneView/PublicQRStandaloneView';
import './App.css';

export default function App() {
  const initialLoad = useMemo(() => loadStore(), []);
  const [store, setStore] = useState(initialLoad.data);
  const [storageWarning, setStorageWarning] = useState(
    initialLoad.recoveredFromError ? initialLoad.errorMessage : null
  );

  const [registeredUsers, setRegisteredUsers] = useState(() => loadRegisteredUsers());
  const [currentUser, setCurrentUser] = useState(() => loadActiveSession());
  const [authScreen, setAuthScreen] = useState('signup'); // 'signup' | 'login'
  const [prefilledLoginEmail, setPrefilledLoginEmail] = useState('');

  const [route, setRoute] = useState({ path: '/dashboard', params: {}, query: {} });
  const [role, setRole] = useState(() => loadActiveSession()?.role || 'Administrator');
  const [activeTechFilter, setActiveTechFilter] = useState(() => {
    const sess = loadActiveSession();
    return sess?.role === 'Technician' && sess?.fullName ? sess.fullName : 'Sara Khan';
  });
  const [globalSearch, setGlobalSearch] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [judgeGuideOpen, setJudgeGuideOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const res = saveStore(store);
    if (!res.ok) setStorageWarning(res.error);
  }, [store]);

  const addToast = (message, type = 'info') => {
    const id = 'tst-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const navigateTo = (pathStr, queryObj = {}) => {
    setMobileMenuOpen(false);
    setNotifOpen(false);
    if (pathStr.startsWith('/assets/')) {
      const id = pathStr.replace('/assets/', '');
      setRoute({ path: '/assets/:id', params: { id }, query: queryObj });
    } else if (pathStr.startsWith('/issues/')) {
      const id = pathStr.replace('/issues/', '');
      setRoute({ path: '/issues/:id', params: { id }, query: queryObj });
    } else if (pathStr.startsWith('/public/assets/')) {
      const id = pathStr.replace('/public/assets/', '');
      setRoute({ path: '/public/assets/:id', params: { id }, query: queryObj });
    } else {
      setRoute({ path: pathStr, params: {}, query: queryObj });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const computeAssetStatusFromIssues = (asset, allIssues) => {
    if (asset.status === 'Retired') return 'Retired';
    const openIssues = allIssues.filter(
      (iss) => iss.assetId === asset.id && !['Resolved', 'Closed'].includes(iss.status)
    );
    if (openIssues.length === 0) return 'Operational';
    const statuses = openIssues.map((i) => i.status);
    const hasCriticalWaiting = openIssues.some(
      (i) => i.priority === 'Critical' && i.status === 'Waiting for Parts'
    );
    if (hasCriticalWaiting) return 'Out of Service';
    if (statuses.includes('Maintenance In Progress') || statuses.includes('Waiting for Parts')) {
      return 'Under Maintenance';
    }
    if (statuses.includes('Inspection Started')) return 'Under Inspection';
    return 'Issue Reported';
  };

  const createAsset = (payload) => {
    const codeNormalized = String(payload.assetCode || '').trim().toUpperCase();
    const duplicate = store.assets.some(
      (a) => a.assetCode.trim().toUpperCase() === codeNormalized
    );
    if (duplicate) {
      return { ok: false, error: `Asset code "${codeNormalized}" already exists (case-insensitive check).` };
    }
    const newAsset = {
      id: 'ast-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 5),
      assetCode: codeNormalized,
      name: payload.name.trim(),
      category: payload.category,
      model: payload.model.trim(),
      location: payload.location.trim(),
      condition: payload.condition || 'Good',
      status: payload.status || 'Operational',
      lastServiceDate: payload.lastServiceDate || getTodayDateString(),
      nextServiceDate: payload.nextServiceDate || getTodayDateString(),
      assignedTechnician: payload.assignedTechnician || 'Sara Khan',
      createdAt: new Date().toISOString(),
      publicDescription: payload.publicDescription?.trim() || 'Registered facility asset managed via MaintainIQ.'
    };
    const historyEvent = {
      id: 'hst-' + Date.now() + '-' + Math.random().toString(36).slice(2, 5),
      assetId: newAsset.id,
      issueId: null,
      timestamp: new Date().toISOString(),
      actor: `${role} (${role === 'Technician' ? activeTechFilter : 'Admin'})`,
      eventType: 'ASSET_REGISTERED',
      description: `Registered new asset ${newAsset.name} (${newAsset.assetCode}) at ${newAsset.location}.`
    };
    setStore((prev) => ({
      ...prev,
      assets: [newAsset, ...prev.assets],
      history: [historyEvent, ...prev.history]
    }));
    addToast(`Asset "${newAsset.name}" (${newAsset.assetCode}) registered!`, 'success');
    return { ok: true, asset: newAsset };
  };

  const updateAsset = (assetId, updates) => {
    const existing = store.assets.find((a) => a.id === assetId);
    if (!existing) return { ok: false, error: 'Asset not found.' };
    const codeNormalized = String(updates.assetCode ?? existing.assetCode).trim().toUpperCase();
    const duplicate = store.assets.some(
      (a) => a.id !== assetId && a.assetCode.trim().toUpperCase() === codeNormalized
    );
    if (duplicate) {
      return { ok: false, error: `Asset code "${codeNormalized}" is already used by another asset.` };
    }
    const updatedAsset = {
      ...existing,
      ...updates,
      id: existing.id,
      assetCode: codeNormalized
    };
    const historyEvent = {
      id: 'hst-' + Date.now() + '-' + Math.random().toString(36).slice(2, 5),
      assetId: existing.id,
      issueId: null,
      timestamp: new Date().toISOString(),
      actor: `${role} (${role === 'Technician' ? activeTechFilter : 'Admin'})`,
      eventType: 'ASSET_UPDATED',
      description: `Updated asset ${updatedAsset.name} (${updatedAsset.assetCode}) — Status: ${updatedAsset.status}.`
    };
    setStore((prev) => ({
      ...prev,
      assets: prev.assets.map((a) => (a.id === assetId ? updatedAsset : a)),
      history: [historyEvent, ...prev.history]
    }));
    addToast(`Saved changes to "${updatedAsset.name}".`, 'success');
    return { ok: true, asset: updatedAsset };
  };

  const retireAsset = (assetId) => {
    const existing = store.assets.find((a) => a.id === assetId);
    if (!existing) return;
    const updatedAsset = { ...existing, status: 'Retired' };
    const historyEvent = {
      id: 'hst-' + Date.now() + '-' + Math.random().toString(36).slice(2, 5),
      assetId: existing.id,
      issueId: null,
      timestamp: new Date().toISOString(),
      actor: `${role} (Admin)`,
      eventType: 'ASSET_RETIRED',
      description: `Marked asset ${existing.name} (${existing.assetCode}) as Retired.`
    };
    setStore((prev) => ({
      ...prev,
      assets: prev.assets.map((a) => (a.id === assetId ? updatedAsset : a)),
      history: [historyEvent, ...prev.history]
    }));
    addToast(`Asset "${existing.name}" marked as Retired.`, 'warning');
  };

  const createIssue = (payload) => {
    const asset = store.assets.find((a) => a.id === payload.assetId);
    if (!asset) return { ok: false, error: 'Please select a valid asset.' };
    if (asset.status === 'Retired') {
      return { ok: false, error: 'Cannot report new issues on a Retired asset.' };
    }
    const nextSeq = 101 + store.issues.length;
    const issueNumber = `ISS-2026-${nextSeq}`;
    const newIssue = {
      id: 'iss-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 5),
      issueNumber,
      assetId: asset.id,
      title: payload.title.trim(),
      description: payload.description.trim(),
      category: payload.category || asset.category,
      priority: payload.priority || 'Medium',
      reporterName: payload.reporterName?.trim() || 'Campus QR Reporter',
      createdAt: new Date().toISOString(),
      assignedTechnician: payload.assignedTechnician || asset.assignedTechnician || 'Sara Khan',
      status: payload.assignedTechnician ? 'Assigned' : 'Reported',
      aiSuggestions: payload.aiSuggestions || null,
      maintenanceRecords: []
    };
    const nextIssues = [newIssue, ...store.issues];
    const nextAssetStatus = computeAssetStatusFromIssues(asset, nextIssues);
    const historyEvent = {
      id: 'hst-' + Date.now() + '-' + Math.random().toString(36).slice(2, 5),
      assetId: asset.id,
      issueId: newIssue.id,
      timestamp: new Date().toISOString(),
      actor: newIssue.reporterName,
      eventType: 'ISSUE_REPORTED',
      description: `Reported ${newIssue.priority} priority issue ${newIssue.issueNumber}: "${newIssue.title}" on ${asset.name}. Asset status synced to ${nextAssetStatus}.`
    };
    setStore((prev) => ({
      ...prev,
      issues: nextIssues,
      assets: prev.assets.map((a) => (a.id === asset.id ? { ...a, status: nextAssetStatus } : a)),
      history: [historyEvent, ...prev.history]
    }));
    addToast(`Work order ${newIssue.issueNumber} created!`, 'success');
    return { ok: true, issue: newIssue };
  };

  const updateIssueWorkflow = (issueId, { nextStatus, assignedTechnician, note }) => {
    const issue = store.issues.find((i) => i.id === issueId);
    if (!issue) return { ok: false, error: 'Issue not found.' };
    if (issue.status === 'Closed' && nextStatus !== 'Reopened') {
      return { ok: false, error: 'Closed issues are locked and cannot be edited until Reopened.' };
    }
    if (nextStatus === 'Resolved' && (!issue.maintenanceRecords || issue.maintenanceRecords.length === 0)) {
      return {
        ok: false,
        error: 'Validation Guard: Cannot mark an issue Resolved without logging at least one Maintenance Record first.'
      };
    }
    const updatedIssue = {
      ...issue,
      status: nextStatus || issue.status,
      assignedTechnician: assignedTechnician !== undefined ? assignedTechnician : issue.assignedTechnician
    };
    const nextIssues = store.issues.map((i) => (i.id === issueId ? updatedIssue : i));
    const asset = store.assets.find((a) => a.id === issue.assetId);
    const nextAssetStatus = asset ? computeAssetStatusFromIssues(asset, nextIssues) : null;

    const eventType =
      nextStatus === 'Reopened'
        ? 'ISSUE_REOPENED'
        : nextStatus && nextStatus !== issue.status
        ? 'STATUS_CHANGED'
        : 'ISSUE_ASSIGNED';

    const parts = [];
    if (nextStatus && nextStatus !== issue.status) {
      parts.push(`Transitioned ${issue.issueNumber} from "${issue.status}" to "${nextStatus}"`);
    }
    if (assignedTechnician && assignedTechnician !== issue.assignedTechnician) {
      parts.push(`Assigned technician ${assignedTechnician}`);
    }
    if (note) parts.push(`Note: ${note}`);

    const historyEvent = {
      id: 'hst-' + Date.now() + '-' + Math.random().toString(36).slice(2, 5),
      assetId: issue.assetId,
      issueId: issue.id,
      timestamp: new Date().toISOString(),
      actor: `${role} (${role === 'Technician' ? activeTechFilter : 'Admin'})`,
      eventType,
      description: parts.join(' • ') || `Updated workflow on ${issue.issueNumber}.`
    };

    setStore((prev) => ({
      ...prev,
      issues: nextIssues,
      assets: prev.assets.map((a) =>
        a.id === issue.assetId && nextAssetStatus ? { ...a, status: nextAssetStatus } : a
      ),
      history: [historyEvent, ...prev.history]
    }));
    addToast(`Updated ${issue.issueNumber} to ${updatedIssue.status}.`, 'success');
    return { ok: true, issue: updatedIssue };
  };

  const addMaintenanceRecord = (issueId, recordPayload, markResolved = false) => {
    const issue = store.issues.find((i) => i.id === issueId);
    if (!issue) return { ok: false, error: 'Issue not found.' };
    if (issue.status === 'Closed') {
      return { ok: false, error: 'Cannot add records to a Closed issue. Reopen it first.' };
    }
    const numericCost = Number(recordPayload.cost);
    if (isNaN(numericCost) || numericCost < 0) {
      return { ok: false, error: 'Maintenance cost must be a non-negative number (0 or greater).' };
    }
    const newRecord = {
      id: 'mr-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 5),
      date: recordPayload.date || getTodayDateString(),
      technician: recordPayload.technician || issue.assignedTechnician || activeTechFilter,
      inspectionFindings: recordPayload.inspectionFindings.trim(),
      workPerformed: recordPayload.workPerformed.trim(),
      partsReplaced: recordPayload.partsReplaced?.trim() || 'None',
      cost: numericCost,
      timeSpent: recordPayload.timeSpent?.trim() || '1.0 hr',
      finalCondition: recordPayload.finalCondition || 'Good',
      notes: recordPayload.notes?.trim() || ''
    };
    const nextStatus = markResolved
      ? 'Resolved'
      : issue.status === 'Reported' || issue.status === 'Assigned'
      ? 'Maintenance In Progress'
      : issue.status;
    const updatedIssue = {
      ...issue,
      status: nextStatus,
      maintenanceRecords: [newRecord, ...(issue.maintenanceRecords || [])]
    };
    const nextIssues = store.issues.map((i) => (i.id === issueId ? updatedIssue : i));
    const asset = store.assets.find((a) => a.id === issue.assetId);
    const nextAssetStatus = asset ? computeAssetStatusFromIssues(asset, nextIssues) : 'Operational';

    const historyEvent = {
      id: 'hst-' + Date.now() + '-' + Math.random().toString(36).slice(2, 5),
      assetId: issue.assetId,
      issueId: issue.id,
      timestamp: new Date().toISOString(),
      actor: newRecord.technician,
      eventType: 'MAINTENANCE_LOGGED',
      description: `Recorded maintenance on ${asset?.name || 'Asset'} for ${issue.issueNumber} (${newRecord.workPerformed}; Parts: ${newRecord.partsReplaced}; Cost: PKR ${numericCost.toLocaleString()}).${markResolved ? ' Issue marked Resolved.' : ''}`
    };

    setStore((prev) => ({
      ...prev,
      issues: nextIssues,
      assets: prev.assets.map((a) => {
        if (a.id !== issue.assetId) return a;
        return {
          ...a,
          status: nextAssetStatus,
          condition: newRecord.finalCondition || a.condition,
          lastServiceDate: newRecord.date
        };
      }),
      history: [historyEvent, ...prev.history]
    }));
    addToast(
      markResolved
        ? `Maintenance logged & ${issue.issueNumber} Resolved!`
        : `Maintenance record saved to ${issue.issueNumber}.`,
      'success'
    );
    return { ok: true };
  };

  const updateSettings = (newSettings) => {
    const historyEvent = {
      id: 'hst-' + Date.now() + '-' + Math.random().toString(36).slice(2, 5),
      assetId: store.assets[0]?.id || 'ast-proj-01',
      issueId: null,
      timestamp: new Date().toISOString(),
      actor: `${role} (Admin)`,
      eventType: 'SETTINGS_UPDATED',
      description: `Updated organization display name to "${newSettings.organizationName}".`
    };
    setStore((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...newSettings },
      history: [historyEvent, ...prev.history]
    }));
    addToast('Organization settings updated.', 'success');
  };

  const handleResetDemoData = () => {
    const fresh = getDefaultStore();
    saveStore(fresh);
    setStore(fresh);
    setStorageWarning(null);
    addToast('Demo data restored to default SMIT Hackathon seed state.', 'info');
  };

  const kpis = useMemo(() => {
    const totalAssets = store.assets.length;
    const operationalAssets = store.assets.filter((a) => a.status === 'Operational').length;
    const openIssuesList = store.issues.filter((i) => !['Resolved', 'Closed'].includes(i.status));
    const openIssues = openIssuesList.length;
    const criticalIssues = openIssuesList.filter((i) => i.priority === 'Critical' || i.priority === 'High').length;
    const overdueMaintenance = store.assets.filter((a) => {
      if (a.status === 'Retired') return false;
      const days = getDaysUntil(a.nextServiceDate);
      return days !== null && days < 0;
    }).length;
    const totalMaintenanceCost = store.issues.reduce((sum, iss) => {
      return sum + (iss.maintenanceRecords || []).reduce((s, r) => s + (Number(r.cost) || 0), 0);
    }, 0);
    return { totalAssets, operationalAssets, openIssues, criticalIssues, overdueMaintenance, totalMaintenanceCost };
  }, [store]);

  const handleUserSignup = (signupPayload) => {
    const cleanEmail = String(signupPayload.email || '').trim().toLowerCase();
    const cleanName = String(signupPayload.fullName || '').trim();
    const password = String(signupPayload.password || '');

    if (!cleanName || !cleanEmail || !password) {
      return { ok: false, error: 'Full Name, Email, and Password are required.' };
    }
    if (password.length < 6) {
      return { ok: false, error: 'Password must be at least 6 characters long.' };
    }
    const exists = registeredUsers.some((u) => u.email.toLowerCase() === cleanEmail);
    if (exists) {
      return { ok: false, error: `Account with email "${cleanEmail}" already exists. Please sign in.` };
    }

    const newUser = {
      id: 'usr-' + Date.now().toString(36),
      fullName: cleanName,
      email: cleanEmail,
      password,
      role: signupPayload.role || 'Administrator',
      department: signupPayload.department || 'Facilities & Operations',
      organization: signupPayload.organization || store.settings.organizationName,
      createdAt: new Date().toISOString()
    };

    const nextUsers = [newUser, ...registeredUsers];
    setRegisteredUsers(nextUsers);
    saveRegisteredUsers(nextUsers);

    if (signupPayload.organization && signupPayload.organization.trim() !== store.settings.organizationName) {
      setStore((prev) => ({
        ...prev,
        settings: { ...prev.settings, organizationName: signupPayload.organization.trim() }
      }));
    }

    setPrefilledLoginEmail(cleanEmail);
    setAuthScreen('login');
    addToast(`Account created for ${cleanName}! Please sign in with your credentials.`, 'success');
    return { ok: true, user: newUser };
  };

  const handleUserLogin = ({ email, password }) => {
    const cleanEmail = String(email || '').trim().toLowerCase();
    const matched = registeredUsers.find(
      (u) => u.email.toLowerCase() === cleanEmail && u.password === password
    );
    if (!matched) {
      return { ok: false, error: 'Invalid email or password. Create an account via Sign Up or use a quick demo account below.' };
    }

    const sessionUser = {
      id: matched.id,
      fullName: matched.fullName,
      email: matched.email,
      role: matched.role,
      department: matched.department,
      organization: matched.organization,
      loggedInAt: new Date().toISOString()
    };

    setCurrentUser(sessionUser);
    saveActiveSession(sessionUser);
    setRole(matched.role || 'Administrator');
    if (matched.role === 'Technician') {
      const matchedTech = TECHNICIANS.find((t) =>
        matched.fullName.toLowerCase().includes(t.name.toLowerCase())
      );
      setActiveTechFilter(matchedTech ? matchedTech.name : TECHNICIANS[0].name);
    }

    const loginEvent = {
      id: 'hst-' + Date.now() + '-' + Math.random().toString(36).slice(2, 5),
      assetId: store.assets[0]?.id || 'ast-proj-01',
      issueId: null,
      timestamp: new Date().toISOString(),
      actor: `${matched.fullName} (${matched.role})`,
      eventType: 'USER_AUTHENTICATED',
      description: `${matched.fullName} signed in to MaintainIQ Command Center as ${matched.role}.`
    };
    setStore((prev) => ({
      ...prev,
      history: [loginEvent, ...prev.history]
    }));

    addToast(`Welcome back, ${matched.fullName} (${matched.role})!`, 'success');
    return { ok: true, user: sessionUser };
  };

  const handleLogout = () => {
    setCurrentUser(null);
    saveActiveSession(null);
    setAuthScreen('login');
    addToast('Signed out of MaintainIQ session.', 'info');
  };

  if (route.path === '/public') {
    return (
      <PublicPortalDirectoryView
        assets={store.assets}
        issues={store.issues}
        settings={store.settings}
        createIssue={createIssue}
        navigateTo={navigateTo}
      />
    );
  }

  if (route.path === '/public/assets/:id') {
    return (
      <PublicQRStandaloneView
        assetId={route.params.id}
        assets={store.assets}
        issues={store.issues}
        settings={store.settings}
        createIssue={createIssue}
        navigateTo={navigateTo}
      />
    );
  }

  if (!currentUser) {
    return (
      <AuthGatewayView
        authScreen={authScreen}
        setAuthScreen={setAuthScreen}
        prefilledLoginEmail={prefilledLoginEmail}
        registeredUsers={registeredUsers}
        onSignup={handleUserSignup}
        onLogin={handleUserLogin}
        settings={store.settings}
        toasts={toasts}
        setToasts={setToasts}
        onOpenPublicDemo={() => navigateTo('/public')}
      />
    );
  }

  const urgentIssues = store.issues
    .filter((i) => !['Resolved', 'Closed'].includes(i.status) && (i.priority === 'Critical' || i.priority === 'High'))
    .slice(0, 4);

  const navItems = [
    { path: '/dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
    { path: '/analytics', label: 'Real Charts & Trends', icon: TrendingUp, badge: 'PRO' },
    { path: '/assets', label: 'Assets & QR Tags', icon: Box, badge: kpis.totalAssets },
    { path: '/public', label: 'Public QR Portal Page', icon: QrCode, badge: 'PUBLIC' },
    { path: '/issues', label: 'Work Orders / Issues', icon: ClipboardList, badge: kpis.openIssues, critical: kpis.criticalIssues > 0 },
    { path: '/ai-triage', label: 'AI Issue Triage', icon: Sparkles },
    { path: '/maintenance', label: 'Maintenance & Schedule', icon: Wrench },
    { path: '/history', label: 'Activity Timeline', icon: History },
    { path: '/settings', label: 'Settings & Auth Users', icon: Settings }
  ];

  return (
    <div className="app-shell">
      <Sidebar
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        mobileMenuOpen={mobileMenuOpen}
        navItems={navItems}
        route={route}
        navigateTo={navigateTo}
        role={role}
        setRole={setRole}
        activeTechFilter={activeTechFilter}
        setActiveTechFilter={setActiveTechFilter}
      />

      <div className={`main-wrapper ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <Topbar
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          globalSearch={globalSearch}
          setGlobalSearch={setGlobalSearch}
          route={route}
          navigateTo={navigateTo}
          onOpenGuide={() => setJudgeGuideOpen(true)}
          urgentIssues={urgentIssues}
          notifOpen={notifOpen}
          setNotifOpen={setNotifOpen}
          role={role}
          currentUser={currentUser}
          onLogout={handleLogout}
        />

        <StorageWarningBanner message={storageWarning} onDismiss={() => setStorageWarning(null)} />
        <ToastStack toasts={toasts} setToasts={setToasts} />

        <main className="page-content">
          {route.path === '/dashboard' && (
            <DashboardView
              assets={store.assets}
              issues={store.issues}
              history={store.history}
              kpis={kpis}
              settings={store.settings}
              role={role}
              currentUser={currentUser}
              activeTechFilter={activeTechFilter}
              navigateTo={navigateTo}
            />
          )}

          {route.path === '/analytics' && (
            <AnalyticsTrendsView
              assets={store.assets}
              issues={store.issues}
              history={store.history}
              kpis={kpis}
              navigateTo={navigateTo}
            />
          )}

          {route.path === '/assets' && (
            <AssetsView
              assets={store.assets}
              settings={store.settings}
              globalSearch={globalSearch}
              setGlobalSearch={setGlobalSearch}
              initialQuery={route.query}
              createAsset={createAsset}
              updateAsset={updateAsset}
              retireAsset={retireAsset}
              navigateTo={navigateTo}
            />
          )}

          {route.path === '/assets/:id' && (
            <AssetDetailsView
              assetId={route.params.id}
              assets={store.assets}
              issues={store.issues}
              history={store.history}
              settings={store.settings}
              createIssue={createIssue}
              addToast={addToast}
              navigateTo={navigateTo}
            />
          )}

          {route.path === '/issues' && (
            <IssuesView
              issues={store.issues}
              assets={store.assets}
              globalSearch={globalSearch}
              setGlobalSearch={setGlobalSearch}
              initialQuery={route.query}
              role={role}
              activeTechFilter={activeTechFilter}
              createIssue={createIssue}
              navigateTo={navigateTo}
            />
          )}

          {route.path === '/issues/:id' && (
            <IssueDetailsView
              issueId={route.params.id}
              issues={store.issues}
              assets={store.assets}
              history={store.history}
              activeTechFilter={activeTechFilter}
              updateIssueWorkflow={updateIssueWorkflow}
              addMaintenanceRecord={addMaintenanceRecord}
              navigateTo={navigateTo}
            />
          )}

          {route.path === '/ai-triage' && (
            <AITriageView
              assets={store.assets}
              issues={store.issues}
              initialAssetId={route.query.assetId}
              createIssue={createIssue}
              addToast={addToast}
              navigateTo={navigateTo}
            />
          )}

          {route.path === '/maintenance' && (
            <MaintenanceView
              assets={store.assets}
              issues={store.issues}
              kpis={kpis}
              navigateTo={navigateTo}
            />
          )}

          {route.path === '/history' && (
            <HistoryView
              history={store.history}
              assets={store.assets}
              navigateTo={navigateTo}
            />
          )}

          {route.path === '/settings' && (
            <SettingsView
              settings={store.settings}
              store={store}
              role={role}
              setRole={setRole}
              currentUser={currentUser}
              registeredUsers={registeredUsers}
              onLogout={handleLogout}
              updateSettings={updateSettings}
              handleResetDemoData={handleResetDemoData}
              addToast={addToast}
              navigateTo={navigateTo}
            />
          )}

          {![
            '/dashboard',
            '/analytics',
            '/assets',
            '/assets/:id',
            '/issues',
            '/issues/:id',
            '/ai-triage',
            '/maintenance',
            '/history',
            '/settings'
          ].includes(route.path) && (
            <NotFoundView currentPath={route.path} navigateTo={navigateTo} />
          )}
        </main>
      </div>

      <JudgeGuideModal
        isOpen={judgeGuideOpen}
        onClose={() => setJudgeGuideOpen(false)}
        navigateTo={navigateTo}
      />
    </div>
  );
}
