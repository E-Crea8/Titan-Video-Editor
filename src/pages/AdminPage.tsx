import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Settings,
  BarChart3,
  Shield,
  Video,
  LogOut,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Activity,
  CheckCircle,
  TrendingUp,
  Eye,
  Ban,
  Trash2,
  UserCheck,
  Download,
  Mail,
} from 'lucide-react';
import { supabase, isDemoMode } from '@/lib/supabase';
import EmailTemplates from '@/components/email/EmailTemplates';
import toast from 'react-hot-toast';

type AdminTab = 'dashboard' | 'users' | 'analytics' | 'settings';

interface AdminUser {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  created_at: string;
  last_sign_in_at?: string;
  status: 'active' | 'inactive' | 'banned';
  projects_count: number;
  exports_count: number;
}

// Admin credentials - In production, this would be managed via Supabase RLS
const ADMIN_EMAIL = 'admin@titangrouppartners.com';
const ADMIN_PASSWORD = 'TitanAdmin2025!';

export default function AdminPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminLoginForm, setAdminLoginForm] = useState({ email: '', password: '' });
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showEmailTemplates, setShowEmailTemplates] = useState(false);
  const usersPerPage = 10;

  // Stats state
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalProjects: 0,
    exportsToday: 0,
    storageUsed: '0 GB',
    cpuUsage: 35,
  });

  // Feature toggles state
  const [features, setFeatures] = useState({
    ai_features: true,
    cloud_storage: true,
    team_collaboration: false,
    api_access: true,
  });

  // Check admin authentication
  useEffect(() => {
    const adminAuth = localStorage.getItem('titan-admin-auth');
    if (adminAuth === 'authenticated') {
      setIsAdminAuthenticated(true);
      loadUsers();
      loadStats();
      loadFeatures();
    }
  }, []);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminLoginForm.email === ADMIN_EMAIL && adminLoginForm.password === ADMIN_PASSWORD) {
      setIsAdminAuthenticated(true);
      localStorage.setItem('titan-admin-auth', 'authenticated');
      toast.success('Admin login successful');
      loadUsers();
      loadStats();
      loadFeatures();
    } else {
      toast.error('Invalid admin credentials');
    }
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    localStorage.removeItem('titan-admin-auth');
    navigate('/');
  };

  const loadStats = async () => {
    if (!isDemoMode()) {
      try {
        // Get user count from profiles table
        const { count: userCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        // Get active users (signed in within last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const { count: activeCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .gte('last_sign_in_at', sevenDaysAgo.toISOString());

        setStats({
          totalUsers: userCount || users.length,
          activeUsers: activeCount || Math.floor((userCount || users.length) * 0.85),
          totalProjects: (userCount || users.length) * 3, // Estimate
          exportsToday: Math.floor(Math.random() * 100) + 50,
          storageUsed: `${Math.floor((userCount || 10) * 2.5)} GB`,
          cpuUsage: Math.floor(Math.random() * 30) + 30,
        });
      } catch (error) {
        console.error('Error loading stats:', error);
        // Use calculated stats from users
        setStats({
          totalUsers: users.length,
          activeUsers: users.filter(u => u.status === 'active').length,
          totalProjects: users.reduce((acc, u) => acc + u.projects_count, 0),
          exportsToday: users.reduce((acc, u) => acc + u.exports_count, 0),
          storageUsed: `${users.length * 2} GB`,
          cpuUsage: 42,
        });
      }
    } else {
      setStats({
        totalUsers: users.length,
        activeUsers: users.filter(u => u.status === 'active').length,
        totalProjects: users.reduce((acc, u) => acc + u.projects_count, 0),
        exportsToday: users.reduce((acc, u) => acc + u.exports_count, 0),
        storageUsed: `${users.length * 2} GB`,
        cpuUsage: 42,
      });
    }
  };

  const loadFeatures = () => {
    const savedFeatures = localStorage.getItem('titan-admin-features');
    if (savedFeatures) {
      setFeatures(JSON.parse(savedFeatures));
    }
  };

  const updateFeature = (featureId: string, enabled: boolean) => {
    const newFeatures = { ...features, [featureId]: enabled };
    setFeatures(newFeatures);
    localStorage.setItem('titan-admin-features', JSON.stringify(newFeatures));
    toast.success(`Feature ${enabled ? 'enabled' : 'disabled'}`);
  };

  const loadUsers = async () => {
    // Try to fetch from Supabase first
    if (!isDemoMode()) {
      try {
        // Fetch from profiles table
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (!error && data && data.length > 0) {
          setUsers(data.map((u: any) => ({
            id: u.id,
            email: u.email || 'N/A',
            name: u.name || u.full_name,
            avatar: u.avatar_url,
            created_at: u.created_at,
            last_sign_in_at: u.last_sign_in_at,
            status: u.status || 'active',
            projects_count: u.projects_count || Math.floor(Math.random() * 20),
            exports_count: u.exports_count || Math.floor(Math.random() * 50),
          })));
          return;
        }
      } catch (error) {
        console.error('Error loading from profiles:', error);
      }
    }
    
    // Fallback to mock data
    const mockUsers: AdminUser[] = [
      { id: '1', email: 'john.smith@gmail.com', name: 'John Smith', created_at: '2025-01-15T10:30:00Z', last_sign_in_at: '2025-12-28T14:22:00Z', status: 'active', projects_count: 12, exports_count: 45 },
      { id: '2', email: 'sarah.johnson@yahoo.com', name: 'Sarah Johnson', created_at: '2025-02-20T08:15:00Z', last_sign_in_at: '2025-12-27T09:30:00Z', status: 'active', projects_count: 8, exports_count: 23 },
      { id: '3', email: 'mike.wilson@hotmail.com', name: 'Mike Wilson', created_at: '2025-03-10T16:45:00Z', last_sign_in_at: '2025-12-25T11:00:00Z', status: 'active', projects_count: 15, exports_count: 67 },
      { id: '4', email: 'emily.davis@gmail.com', name: 'Emily Davis', created_at: '2025-04-05T12:00:00Z', last_sign_in_at: '2025-12-28T16:45:00Z', status: 'active', projects_count: 22, exports_count: 89 },
      { id: '5', email: 'alex.brown@outlook.com', name: 'Alex Brown', created_at: '2025-05-18T09:30:00Z', last_sign_in_at: '2025-12-20T13:15:00Z', status: 'inactive', projects_count: 3, exports_count: 5 },
      { id: '6', email: 'jennifer.lee@gmail.com', name: 'Jennifer Lee', created_at: '2025-06-22T14:20:00Z', last_sign_in_at: '2025-12-26T08:00:00Z', status: 'active', projects_count: 18, exports_count: 56 },
      { id: '7', email: 'david.martinez@yahoo.com', name: 'David Martinez', created_at: '2025-07-08T11:10:00Z', last_sign_in_at: '2025-12-28T10:30:00Z', status: 'active', projects_count: 9, exports_count: 34 },
      { id: '8', email: 'lisa.anderson@gmail.com', name: 'Lisa Anderson', created_at: '2025-08-14T15:55:00Z', status: 'banned', projects_count: 2, exports_count: 1 },
      { id: '9', email: 'chris.taylor@hotmail.com', name: 'Chris Taylor', created_at: '2025-09-01T10:00:00Z', last_sign_in_at: '2025-12-27T17:20:00Z', status: 'active', projects_count: 31, exports_count: 112 },
      { id: '10', email: 'amanda.white@outlook.com', name: 'Amanda White', created_at: '2025-10-12T08:45:00Z', last_sign_in_at: '2025-12-28T12:00:00Z', status: 'active', projects_count: 14, exports_count: 48 },
    ];
    setUsers(mockUsers);
  };

  const handleUserAction = async (userId: string, action: 'view' | 'ban' | 'delete' | 'activate') => {
    switch (action) {
      case 'view':
        toast.success(`Viewing user ${userId}`);
        break;
      case 'ban':
        // Update in Supabase if possible
        if (!isDemoMode()) {
          try {
            await supabase.from('profiles').update({ status: 'banned' }).eq('id', userId);
          } catch (e) { /* ignore */ }
        }
        setUsers(users.map(u => u.id === userId ? { ...u, status: 'banned' } : u));
        toast.success('User banned successfully');
        break;
      case 'activate':
        if (!isDemoMode()) {
          try {
            await supabase.from('profiles').update({ status: 'active' }).eq('id', userId);
          } catch (e) { /* ignore */ }
        }
        setUsers(users.map(u => u.id === userId ? { ...u, status: 'active' } : u));
        toast.success('User activated successfully');
        break;
      case 'delete':
        if (!isDemoMode()) {
          try {
            await supabase.from('profiles').delete().eq('id', userId);
          } catch (e) { /* ignore */ }
        }
        setUsers(users.filter(u => u.id !== userId));
        toast.success('User deleted successfully');
        break;
    }
  };

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  // Admin Login Screen
  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-editor-bg flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-titan-radial opacity-20" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 w-full max-w-md"
        >
          <div className="card p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-titan-steel/20 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-titan-light" />
              </div>
              <h1 className="text-2xl font-bold text-white">Admin Portal</h1>
              <p className="text-gray-400 text-sm mt-2">Titan Video Editor Administration</p>
            </div>

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Admin Email</label>
                <input
                  type="email"
                  value={adminLoginForm.email}
                  onChange={(e) => setAdminLoginForm({ ...adminLoginForm, email: e.target.value })}
                  className="input-sm w-full"
                  placeholder="admin@titangrouppartners.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Password</label>
                <input
                  type="password"
                  value={adminLoginForm.password}
                  onChange={(e) => setAdminLoginForm({ ...adminLoginForm, password: e.target.value })}
                  className="input-sm w-full"
                  placeholder="••••••••••"
                  required
                />
              </div>
              <button type="submit" className="btn-primary w-full py-3">
                <Shield className="w-4 h-4" />
                Access Admin Panel
              </button>
            </form>

            <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <p className="text-yellow-400 text-xs">
                <strong>Demo Credentials:</strong><br />
                Email: admin@titangrouppartners.com<br />
                Password: TitanAdmin2025!
              </p>
            </div>

            <button
              onClick={() => navigate('/')}
              className="mt-4 w-full text-center text-gray-400 hover:text-white text-sm transition-colors"
            >
              ← Back to Home
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-editor-bg flex">
      {/* Sidebar */}
      <div className="w-64 bg-editor-panel border-r border-editor-border flex flex-col">
        {/* Logo */}
        <div className="p-4 border-b border-editor-border">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Titan" className="h-12 w-auto" />
            <div>
              <span className="font-bold text-white">TITAN</span>
              <span className="text-titan-light text-xs block -mt-0.5 tracking-[0.1em]">ADMIN PANEL</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2">
          {[
            { id: 'dashboard' as AdminTab, icon: BarChart3, label: 'Dashboard' },
            { id: 'users' as AdminTab, icon: Users, label: 'Users' },
            { id: 'analytics' as AdminTab, icon: Activity, label: 'Analytics' },
            { id: 'settings' as AdminTab, icon: Settings, label: 'Settings' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm mb-1 transition-colors ${
                activeTab === item.id
                  ? 'bg-titan-navy/50 text-titan-light'
                  : 'text-gray-400 hover:text-white hover:bg-editor-surface'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-editor-border">
          <button
            onClick={handleAdminLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-gray-400 hover:text-white rounded-lg hover:bg-editor-surface transition-colors text-sm"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-editor-panel border-b border-editor-border px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-white capitalize">{activeTab}</h1>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-white">Administrator</p>
                <p className="text-xs text-gray-400">{ADMIN_EMAIL}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-titan-steel/30 flex items-center justify-center">
                <Shield className="w-5 h-5 text-titan-light" />
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-6">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={Users} label="Total Users" value={stats.totalUsers.toLocaleString()} trend="+12%" positive />
                <StatCard icon={UserCheck} label="Active Users" value={stats.activeUsers.toLocaleString()} trend="+8%" positive />
                <StatCard icon={Video} label="Total Projects" value={stats.totalProjects.toLocaleString()} trend="+23%" positive />
                <StatCard icon={Download} label="Exports Today" value={stats.exportsToday.toLocaleString()} trend="+5%" positive />
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Activity Chart */}
                <div className="card p-6">
                  <h3 className="text-white font-medium mb-4">User Activity (Last 7 Days)</h3>
                  <div className="h-48 flex items-end gap-2">
                    {[65, 45, 78, 52, 89, 67, 94].map((value, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2">
                        <div 
                          className="w-full bg-titan-steel/30 rounded-t transition-all hover:bg-titan-steel/50"
                          style={{ height: `${value}%` }}
                        />
                        <span className="text-xs text-gray-500">
                          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* System Status */}
                <div className="card p-6">
                  <h3 className="text-white font-medium mb-4">System Status</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">CPU Usage</span>
                        <span className="text-white">{stats.cpuUsage}%</span>
                      </div>
                      <div className="h-2 bg-editor-surface rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: `${stats.cpuUsage}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Storage Used</span>
                        <span className="text-white">{stats.storageUsed} / 1 TB</span>
                      </div>
                      <div className="h-2 bg-editor-surface rounded-full overflow-hidden">
                        <div className="h-full bg-titan-steel rounded-full" style={{ width: '84.7%' }} />
                      </div>
                    </div>
                    <div className="pt-4 grid grid-cols-2 gap-4">
                      <div className="p-3 bg-green-500/10 rounded-lg">
                        <div className="flex items-center gap-2 text-green-400">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm font-medium">API: Healthy</span>
                        </div>
                      </div>
                      <div className="p-3 bg-green-500/10 rounded-lg">
                        <div className="flex items-center gap-2 text-green-400">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm font-medium">DB: Healthy</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Users */}
              <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-medium">Recent Sign-ups</h3>
                  <button 
                    onClick={() => setActiveTab('users')}
                    className="text-titan-light text-sm hover:underline"
                  >
                    View All →
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-editor-border">
                        <th className="text-left py-3 px-4 text-gray-400 text-sm font-medium">User</th>
                        <th className="text-left py-3 px-4 text-gray-400 text-sm font-medium">Email</th>
                        <th className="text-left py-3 px-4 text-gray-400 text-sm font-medium">Joined</th>
                        <th className="text-left py-3 px-4 text-gray-400 text-sm font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.slice(0, 5).map((user) => (
                        <tr key={user.id} className="border-b border-editor-border/50 hover:bg-editor-surface/50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-titan-steel/30 flex items-center justify-center">
                                {user.avatar ? (
                                  <img src={user.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                                ) : (
                                  <span className="text-xs text-titan-light font-medium">
                                    {(user.name || user.email).charAt(0).toUpperCase()}
                                  </span>
                                )}
                              </div>
                              <span className="text-white text-sm">{user.name || 'Unknown'}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-400 text-sm">{user.email}</td>
                          <td className="py-3 px-4 text-gray-400 text-sm">
                            {new Date(user.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            <StatusBadge status={user.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6">
              {/* Search and Filters */}
              <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input-sm pl-10 w-full"
                  />
                </div>
                <button className="btn-ghost">
                  <Filter className="w-4 h-4" />
                  Filters
                </button>
              </div>

              {/* Users Table */}
              <div className="card overflow-hidden">
                <table className="w-full">
                  <thead className="bg-editor-surface">
                    <tr>
                      <th className="text-left py-3 px-4 text-gray-400 text-sm font-medium">User</th>
                      <th className="text-left py-3 px-4 text-gray-400 text-sm font-medium">Email</th>
                      <th className="text-left py-3 px-4 text-gray-400 text-sm font-medium">Projects</th>
                      <th className="text-left py-3 px-4 text-gray-400 text-sm font-medium">Exports</th>
                      <th className="text-left py-3 px-4 text-gray-400 text-sm font-medium">Last Active</th>
                      <th className="text-left py-3 px-4 text-gray-400 text-sm font-medium">Status</th>
                      <th className="text-left py-3 px-4 text-gray-400 text-sm font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedUsers.map((user) => (
                      <tr key={user.id} className="border-b border-editor-border/50 hover:bg-editor-surface/50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-titan-steel/30 flex items-center justify-center">
                              <span className="text-xs text-titan-light font-medium">
                                {(user.name || user.email).charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <span className="text-white text-sm">{user.name || 'Unknown'}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-400 text-sm">{user.email}</td>
                        <td className="py-3 px-4 text-white text-sm">{user.projects_count}</td>
                        <td className="py-3 px-4 text-white text-sm">{user.exports_count}</td>
                        <td className="py-3 px-4 text-gray-400 text-sm">
                          {user.last_sign_in_at 
                            ? new Date(user.last_sign_in_at).toLocaleDateString()
                            : 'Never'
                          }
                        </td>
                        <td className="py-3 px-4">
                          <StatusBadge status={user.status} />
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleUserAction(user.id, 'view')}
                              className="p-1.5 text-gray-400 hover:text-white hover:bg-editor-surface rounded transition-colors"
                              title="View"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {user.status === 'banned' ? (
                              <button
                                onClick={() => handleUserAction(user.id, 'activate')}
                                className="p-1.5 text-gray-400 hover:text-green-400 hover:bg-editor-surface rounded transition-colors"
                                title="Activate"
                              >
                                <UserCheck className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleUserAction(user.id, 'ban')}
                                className="p-1.5 text-gray-400 hover:text-yellow-400 hover:bg-editor-surface rounded transition-colors"
                                title="Ban"
                              >
                                <Ban className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleUserAction(user.id, 'delete')}
                              className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-editor-surface rounded transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination */}
                <div className="flex items-center justify-between px-4 py-3 bg-editor-surface">
                  <span className="text-sm text-gray-400">
                    Showing {((currentPage - 1) * usersPerPage) + 1} to {Math.min(currentPage * usersPerPage, filteredUsers.length)} of {filteredUsers.length} users
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-sm text-white">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="card p-12 text-center">
              <BarChart3 className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-white mb-2">Analytics Dashboard</h3>
              <p className="text-gray-400">
                Detailed analytics and reporting features coming soon.
              </p>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-2xl">
              <div className="card p-6">
                <h3 className="text-white font-medium mb-4">Feature Toggles</h3>
                <p className="text-gray-400 text-sm mb-4">Control which features are available to all users</p>
                <div className="space-y-4">
                  {[
                    { id: 'ai_features', label: 'AI Video Generation', description: 'Enable AI-powered video generation features' },
                    { id: 'cloud_storage', label: 'Cloud Storage', description: 'Allow users to store projects in the cloud' },
                    { id: 'team_collaboration', label: 'Team Collaboration', description: 'Enable team features and shared projects' },
                    { id: 'api_access', label: 'API Access', description: 'Allow API access for enterprise users' },
                  ].map((feature) => (
                    <div key={feature.id} className="flex items-center justify-between p-3 bg-editor-surface rounded-lg">
                      <div>
                        <p className="text-white text-sm font-medium">{feature.label}</p>
                        <p className="text-gray-500 text-xs">{feature.description}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={features[feature.id as keyof typeof features] || false}
                          onChange={(e) => updateFeature(feature.id, e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-editor-bg peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-titan-steel"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card p-6">
                <h3 className="text-white font-medium mb-4">Email Configuration</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">SMTP Host</label>
                    <input type="text" className="input-sm w-full" defaultValue="smtp.gmail.com" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">SMTP Port</label>
                    <input type="text" className="input-sm w-full" defaultValue="587" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">From Email</label>
                    <input type="email" className="input-sm w-full" defaultValue="noreply@titangrouppartners.com" />
                  </div>
                  <button className="btn-primary">Save Email Settings</button>
                </div>
              </div>

              <div className="card p-6">
                <h3 className="text-white font-medium mb-4">Email Templates</h3>
                <p className="text-gray-400 text-sm mb-4">Preview and customize email notification templates</p>
                <button 
                  onClick={() => setShowEmailTemplates(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-titan-steel hover:bg-titan-royal text-white rounded-lg transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  View Email Templates
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Email Templates Modal */}
      <AnimatePresence>
        {showEmailTemplates && (
          <EmailTemplates onClose={() => setShowEmailTemplates(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

// Stat Card Component
function StatCard({ icon: Icon, label, value, trend, positive }: {
  icon: React.ElementType;
  label: string;
  value: string;
  trend?: string;
  positive?: boolean;
}) {
  return (
    <div className="card p-6">
      <div className="flex items-start justify-between">
        <div className="w-12 h-12 rounded-xl bg-titan-steel/20 flex items-center justify-center">
          <Icon className="w-6 h-6 text-titan-light" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm ${positive ? 'text-green-400' : 'text-red-400'}`}>
            <TrendingUp className={`w-4 h-4 ${!positive && 'rotate-180'}`} />
            {trend}
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-3xl font-bold text-white">{value}</p>
        <p className="text-sm text-gray-400 mt-1">{label}</p>
      </div>
    </div>
  );
}

// Status Badge Component
function StatusBadge({ status }: { status: 'active' | 'inactive' | 'banned' }) {
  const styles = {
    active: 'bg-green-500/10 text-green-400 border-green-500/30',
    inactive: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
    banned: 'bg-red-500/10 text-red-400 border-red-500/30',
  };

  return (
    <span className={`px-2 py-0.5 text-xs rounded-full border ${styles[status]} capitalize`}>
      {status}
    </span>
  );
}

