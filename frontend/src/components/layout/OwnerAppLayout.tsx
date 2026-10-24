import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import { useNovaStore } from '../../store/useNovaStore';
import { novaApi } from '../../lib/api';
import { Logo } from '../ui/Logo';
import { can } from '../../lib/permissions';
import { UserRole } from '../../types';
import {
  Home,
  QrCode,
  Users,
  Tag,
  Star,
  CheckSquare,
  FileText,
  BarChart3,
  Settings,
  Bell,
  Search,
  Plus,
  ShieldCheck,
  Sparkles,
  Menu,
  X,
  ExternalLink,
  ChevronDown,
  UserCheck,
  MessageSquareQuote,
  Coffee,
  Check,
  LogOut,
} from 'lucide-react';

export const OwnerAppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showSimulateModal, setShowSimulateModal] = useState(false);
  const [simulateContact, setSimulateContact] = useState('98201 10001');
  const [simulateSuccess, setSimulateSuccess] = useState<string | null>(null);

  const navigate = useNavigate();

  const {
    ownerName,
    businessName,
    settings,
    customers,
    tasks,
    currentRole,
    setRole,
    setCurrentUser,
    loadFromBackend,
    logout,
    toggleDemoMode,
    flipDemoCustomerConsent,
    addCheckIn,
  } = useNovaStore();

  useEffect(() => {
    novaApi.getMe()
      .then((res) => {
        if (res.success && res.user) {
          setCurrentUser(res.user);
        }
      })
      .catch(() => {
        if (!localStorage.getItem('nova_auth_token')) {
          navigate('/login');
        }
      });
    loadFromBackend();
  }, []);

  const demoCustomer = customers.find((c) => c.id === settings.demoCustomerId);
  const isDemoCustomerConsented = demoCustomer?.consent.personalisedOffers ?? false;
  const pendingTasksCount = tasks.filter((t) => !t.completed).length;

  const allNavItems = [
    { label: 'Dashboard', path: '/app', icon: Home, end: true, permission: 'view_dashboard' as const },
    { label: 'My QR code', path: '/app/qr', icon: QrCode, permission: 'manage_qr' as const },
    { label: 'Customers', path: '/app/customers', icon: Users, badge: customers.length.toString(), permission: 'view_customers' as const },
    { label: 'Category offers', path: '/app/offers', icon: Tag, permission: 'view_offers' as const },
    { label: 'Reviews', path: '/app/reviews', icon: Star, permission: 'view_reviews' as const },
    { label: 'Tasks', path: '/app/tasks', icon: CheckSquare, badge: pendingTasksCount ? pendingTasksCount.toString() : undefined, permission: 'view_tasks' as const },
    { label: 'Templates', path: '/app/templates', icon: MessageSquareQuote, permission: 'view_templates' as const },
    { label: 'Impact', path: '/app/impact', icon: BarChart3, permission: 'view_impact' as const },
    { label: 'Consent & audit', path: '/app/consent-log', icon: FileText, permission: 'view_consent_log' as const },
    { label: 'Settings', path: '/app/settings', icon: Settings, permission: 'edit_settings' as const },
  ];

  // RBAC Filtered navigation
  const visibleNavItems = allNavItems.filter((item) => can(currentRole, item.permission));

  const handleSimulateCheckInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = addCheckIn({
      contact: simulateContact,
      consentGranted: true,
    });
    setSimulateSuccess(`Checked in ${res.customer.name} (${res.customer.id}). Visits: ${res.customer.visitCount}. Tier: ${res.customer.category}.`);
    setTimeout(() => {
      setSimulateSuccess(null);
      setShowSimulateModal(false);
    }, 2500);
  };

  const rolesList = ['owner', 'manager', 'staff', 'auditor'] as const;

  return (
    <div className="min-h-screen bg-[#F6F6F7] flex flex-col lg:flex-row text-[#0B0B0C]">
      
      {/* Mobile Drawer Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-72 bg-white border-r border-black/[0.07] z-50 flex flex-col justify-between transition-transform duration-200 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Logo & Close button on mobile */}
          <div className="h-20 px-6 flex items-center justify-between border-b border-black/[0.05]">
            <Logo size="md" showSubtitle={true} />
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-[#6E6E73] hover:bg-black/5 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick "Create / Offer" Button with RBAC disable check */}
          <div className="p-4">
            {can(currentRole, 'send_offers') ? (
              <button
                onClick={() => navigate('/app/offers')}
                className="w-full h-11 rounded-[12px] bg-[#2F6BFF] hover:bg-[#1F58E6] text-white font-medium text-xs transition-all shadow-[0_2px_8px_rgba(47,107,255,0.2)] flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create category offer</span>
              </button>
            ) : (
              <button
                disabled
                title="Your role can't do this"
                className="w-full h-11 rounded-[12px] bg-[#F1F1F2] text-[#9A9A9E] font-medium text-xs flex items-center justify-center gap-2 cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
                <span>Offers (Restricted)</span>
              </button>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="px-3 space-y-1">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-[14px] text-[13px] font-medium transition-all ${
                      isActive
                        ? 'bg-[#F1F1F2] text-[#0B0B0C] shadow-2xs font-semibold'
                        : 'text-[#6E6E73] hover:text-[#0B0B0C] hover:bg-black/[0.03]'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 stroke-[1.75]" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white border border-black/[0.08] text-[#3A3A3D] tabular-nums">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer: Role badge & Quick check-in link */}
        <div className="p-4 border-t border-black/[0.05] space-y-3">
          <div className="p-3.5 rounded-[18px] bg-[#F9F9FA] border border-black/[0.05]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-[#0B0B0C]">{businessName}</span>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-[#2F6BFF]/10 text-[#2F6BFF] font-bold">
                {currentRole}
              </span>
            </div>
            <div className="text-[11px] text-[#6E6E73]">
              Counter QR &bull; Active
            </div>
          </div>

          <Link
            to={`/checkin/${settings.shopId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3 py-2 rounded-[12px] text-xs text-[#2F6BFF] hover:bg-[#2F6BFF]/5 font-medium transition-colors"
          >
            <span>Open counter check-in</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={async () => {
              await logout();
              navigate('/login');
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-[12px] text-xs text-[#EF4444] hover:bg-[#EF4444]/10 font-medium transition-colors cursor-pointer"
          >
            <span>Sign out</span>
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top App Bar */}
        <header className="h-20 bg-white border-b border-black/[0.06] px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 sticky top-0 z-30">
          
          {/* Left: Mobile menu & Date */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-[#0B0B0C] hover:bg-black/5 cursor-pointer"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Date Tag */}
            <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-[#6E6E73] bg-[#F6F6F7] px-3 py-1.5 rounded-full border border-black/[0.05]">
              <span className="w-2 h-2 rounded-full bg-[#2F6BFF]" />
              <span>Saturday, 24 October 2026</span>
            </div>

            {/* Search */}
            <div className="relative hidden xl:block w-56">
              <Search className="w-3.5 h-3.5 text-[#9A9A9E] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full h-8 pl-8 pr-3 text-xs bg-[#F9F9FA] rounded-[10px] border border-black/[0.08] focus:bg-white outline-none"
              />
            </div>
          </div>

          {/* Right: Simulate checkin, Demo flip, Role switcher, Privacy badge */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
            
            {/* Presenter "Simulate check-in" button */}
            <button
              onClick={() => setShowSimulateModal(true)}
              className="h-8 px-3 rounded-[10px] bg-[#0B0B0C] hover:bg-[#2F6BFF] text-white text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
              title="Fast presenter tool to check in a patron"
            >
              <Coffee className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Simulate check-in</span>
            </button>

            {/* Role Switcher Pill */}
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="h-8 px-2.5 rounded-[10px] bg-[#F6F6F7] hover:bg-[#EFEFEF] border border-black/[0.08] text-xs font-semibold text-[#0B0B0C] flex items-center gap-1.5 cursor-pointer"
                title="Switch role for demo presentation"
              >
                <UserCheck className="w-3.5 h-3.5 text-[#2F6BFF]" />
                <span className="capitalize">{currentRole}</span>
                <ChevronDown className="w-3 h-3 text-[#6E6E73]" />
              </button>

              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-[16px] shadow-xl border border-black/[0.08] p-2 z-50 space-y-1">
                  <div className="px-2 py-1 text-[11px] font-semibold uppercase text-[#9A9A9E]">
                    Switch role (Demo)
                  </div>
                  {rolesList.map((r) => (
                    <button
                      key={r}
                      onClick={async () => {
                        setShowRoleMenu(false);
                        try {
                          const res = await novaApi.demoLogin(r);
                          if (res.success && res.user) {
                            setCurrentUser(res.user, res.token);
                          }
                        } catch (_) {
                          setRole(r);
                        }
                        if (r === 'staff') navigate('/app/tasks');
                        else if (r === 'auditor') navigate('/app/consent-log');
                        else navigate('/app');
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded-[10px] text-xs font-medium capitalize flex items-center justify-between cursor-pointer ${
                        currentRole === r
                          ? 'bg-[#2F6BFF]/10 text-[#2F6BFF] font-bold'
                          : 'text-[#3A3A3D] hover:bg-[#F6F6F7]'
                      }`}
                    >
                      <span>{r}</span>
                      {currentRole === r && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Privacy Badge */}
            <div className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#16A34A] text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Privacy mode: ON</span>
            </div>

            {/* Demo Mode Toggle & Fast Flip Button */}
            <div className="flex items-center gap-1.5 bg-[#F6F6F7] p-1 rounded-[12px] border border-black/[0.06]">
              <button
                onClick={toggleDemoMode}
                className={`px-2 py-1 rounded-[8px] text-[11px] font-medium transition-all cursor-pointer flex items-center gap-1 ${
                  settings.demoMode ? 'bg-[#1EC7A0] text-white' : 'text-[#6E6E73]'
                }`}
              >
                <Sparkles className="w-3 h-3" />
                <span className="hidden sm:inline">DEMO</span>
              </button>

              {settings.demoMode && (
                <button
                  onClick={flipDemoCustomerConsent}
                  className="px-2 py-1 rounded-[8px] bg-white border border-black/[0.1] text-[11px] font-semibold text-[#0B0B0C] hover:bg-[#F9F9FA] cursor-pointer flex items-center gap-1"
                  title="Flip Diya Patel (C-1002) consent between ON and OFF"
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isDemoCustomerConsented ? 'bg-[#22C55E]' : 'bg-[#EF4444]'}`} />
                  <span>Diya: {isDemoCustomerConsented ? 'ON' : 'OFF'}</span>
                </button>
              )}
            </div>

            {/* Owner Avatar */}
            <div
              onClick={() => navigate('/app/settings')}
              className="w-8 h-8 rounded-full bg-[#2F6BFF] text-white font-bold text-xs flex items-center justify-center cursor-pointer shadow-2xs"
              title="Settings"
            >
              {ownerName.charAt(0)}
            </div>

            {/* Quick Header Sign out button */}
            <button
              onClick={async () => {
                await logout();
                navigate('/login');
              }}
              className="h-8 px-2.5 rounded-[10px] bg-[#F6F6F7] hover:bg-[#FEE2E2] hover:text-[#DC2626] border border-black/[0.08] text-xs font-semibold text-[#6E6E73] flex items-center gap-1 cursor-pointer transition-colors"
              title="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>

          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>

      </div>

      {/* Simulate Check-in Modal */}
      {showSimulateModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[28px] max-w-md w-full p-6 sm:p-8 border border-black/[0.08] shadow-2xl">
            <div className="w-12 h-12 rounded-[16px] bg-[#2F6BFF]/10 text-[#2F6BFF] flex items-center justify-center mb-4">
              <Coffee className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-bold text-[#0B0B0C] mb-1">
              Presenter Check-in Simulator
            </h3>
            <p className="text-xs text-[#6E6E73] mb-5">
              Simulates a counter customer check-in. If the phone/email exists, visit count increments. Otherwise a new patron is registered.
            </p>

            <form onSubmit={handleSimulateCheckInSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-[#3A3A3D] mb-1">
                  Customer phone or email
                </label>
                <input
                  type="text"
                  value={simulateContact}
                  onChange={(e) => setSimulateContact(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-[12px] bg-[#F9F9FA] border border-black/[0.1] text-xs font-mono outline-none focus:bg-white focus:border-[#2F6BFF]"
                  placeholder="98201 10001 or newpatron@example.com"
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSimulateContact('98201 10001')}
                  className="text-[11px] px-2 py-1 rounded bg-[#F6F6F7] hover:bg-[#E5E5EA] text-[#6E6E73]"
                >
                  Existing: Aarav
                </button>
                <button
                  type="button"
                  onClick={() => setSimulateContact('98201 10002')}
                  className="text-[11px] px-2 py-1 rounded bg-[#F6F6F7] hover:bg-[#E5E5EA] text-[#6E6E73]"
                >
                  Existing: Diya
                </button>
                <button
                  type="button"
                  onClick={() => setSimulateContact(`guest${Date.now().toString().slice(-4)}@chai.com`)}
                  className="text-[11px] px-2 py-1 rounded bg-[#F6F6F7] hover:bg-[#E5E5EA] text-[#2F6BFF]"
                >
                  Generate New Guest
                </button>
              </div>

              {simulateSuccess && (
                <div className="p-3 rounded-[12px] bg-[#22C55E]/15 text-[#16A34A] text-xs font-medium flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>{simulateSuccess}</span>
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSimulateModal(false)}
                  className="flex-1 h-10 rounded-[12px] bg-[#F1F1F2] text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-10 rounded-[12px] bg-[#2F6BFF] hover:bg-[#1F58E6] text-white text-xs font-semibold transition-all cursor-pointer shadow-xs"
                >
                  Execute check-in
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
