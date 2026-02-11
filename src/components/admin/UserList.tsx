// src/pages/admin/UserList.tsx - COMPLETE USER MANAGEMENT
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  User, 
  Shield, 
  Mail, 
  Phone, 
  ArrowLeft,
  ChevronDown,
  CheckCircle,
  X 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  listCompanyUsers,
  getCompanyUser, 
  updateCompanyUser, 
  toggleCompanyUserActive 
} from '@/lib/api';

interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: string;
  is_active: boolean;
  phone?: string;
  permissions: string[];
  created_at: string;
}

const UserList: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // EDIT MODAL STATE
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editData, setEditData] = useState({
    first_name: '',
    last_name: '',
    role: '',
    is_active: true,
    phone: '',
    permissions: [] as string[]
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await listCompanyUsers();
      setUsers(response.data || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = async (user: User) => {
    try {
      setEditingUser(user);
      setEditData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        role: user.role,
        is_active: user.is_active,
        phone: user.phone || '',
        permissions: user.permissions || []
      });
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    
    setSaving(true);
    try {
      await updateCompanyUser(editingUser.id, editData);
      await fetchUsers(); // Refresh list
      setEditingUser(null);
    } catch (error) {
      console.error('Failed to update user:', error);
    } finally {
      setSaving(false);
    }
  };

  const toggleUserActive = async (userId: string, currentStatus: boolean) => {
    if (!window.confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this user?`)) {
      return;
    }
    
    try {
      await toggleCompanyUserActive(userId);
      await fetchUsers();
    } catch (error) {
      console.error('Failed to toggle user status:', error);
    }
  };

  const filteredUsers = users.filter(user => 
    `${user.first_name} ${user.last_name} ${user.email}`.toLowerCase().includes(search.toLowerCase())
  );

  const roleLabels: Record<string, string> = {
    'group_admin': 'Group Admin',
    'group_hr': 'Group HR',
    'group_finance': 'Group Finance',
    'vendor': 'Vendor',
    'employee': 'Employee',
    'sub_admin': 'Sub Admin'
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full h-full space-y-12 p-6 lg:p-12 isolate bg-transparent relative z-10"
    >
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl p-8 lg:p-12"
        style={{
          background: 'linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
        }}
      >
        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
          <div className="flex items-center gap-4">
            <motion.button
              onClick={() => navigate(-1)}
              className="p-3 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm hover:bg-white/20 transition-all duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
            <div>
              <h1 className="text-4xl lg:text-5xl font-light bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 bg-clip-text text-transparent drop-shadow-2xl">
                Users
              </h1>
              <p className="text-xl text-white/60 font-light mt-2">Manage platform users and permissions</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Search */}
      <div className="max-w-2xl">
        <input
          type="text"
          placeholder="Search users by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-16 px-8 text-xl font-light bg-white/10 border border-white/20 rounded-3xl backdrop-blur-sm text-white placeholder-white/40 focus:border-emerald-400/50 focus:outline-none focus:ring-4 focus:ring-emerald-400/20 transition-all duration-300 shadow-xl"
        />
      </div>

      {/* Users Table */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-8 py-6 text-left text-lg font-medium text-white/80">User</th>
                <th className="px-8 py-6 text-left text-lg font-medium text-white/80 hidden lg:table-cell">Role</th>
                <th className="px-8 py-6 text-left text-lg font-medium text-white/80 hidden xl:table-cell">Email</th>
                <th className="px-8 py-6 text-left text-lg font-medium text-white/80 hidden 2xl:table-cell">Phone</th>
                <th className="px-8 py-6 text-lg font-medium text-white/80">Status</th>
                <th className="px-8 py-6 text-lg font-medium text-white/80 w-32">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-20 h-20 bg-white/10 rounded-2xl animate-pulse flex items-center justify-center">
                        <User className="w-10 h-10 text-white/40" />
                      </div>
                      <span className="text-xl text-white/60">Loading users...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <User className="w-24 h-24 text-white/30" />
                      <h3 className="text-2xl font-light text-white/70">No users found</h3>
                      <p className="text-lg text-white/50 max-w-md">Try adjusting your search terms or invite new users.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, index) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className="group hover:bg-white/5 transition-colors duration-200"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="font-medium text-white text-lg">{user.first_name} {user.last_name}</div>
                          <div className="text-sm text-white/60 font-mono">{user.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 hidden lg:table-cell">
                      <span className="px-3 py-1.5 bg-gradient-to-r from-purple-500/20 to-indigo-600/20 text-purple-200 border border-purple-400/30 rounded-xl font-mono text-sm">
                        {roleLabels[user.role] || user.role}
                      </span>
                    </td>
                    <td className="px-8 py-6 hidden xl:table-cell font-mono text-white/70 text-sm max-w-xs truncate">
                      {user.email}
                    </td>
                    <td className="px-8 py-6 hidden 2xl:table-cell font-mono text-white/60 text-sm">
                      {user.phone || '—'}
                    </td>
                    <td className="px-8 py-6">
                      <span className={cn(
                        "px-3 py-1.5 rounded-full font-mono text-sm font-medium flex items-center gap-2",
                        user.is_active 
                          ? "bg-emerald-500/20 text-emerald-200 border border-emerald-400/30" 
                          : "bg-red-500/20 text-red-200 border border-red-400/30"
                      )}>
                        {user.is_active ? (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            Active
                          </>
                        ) : (
                          <>
                            <X className="w-4 h-4" />
                            Inactive
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                        <motion.button
                          onClick={() => openEditModal(user)}
                          className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-200"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Edit className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          onClick={() => toggleUserActive(user.id, user.is_active)}
                          className="p-2.5 rounded-2xl bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 transition-all duration-200"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* EDIT USER MODAL */}
      {editingUser && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl isolate"
            style={{
              background: 'linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
            }}
          >
            <div className="p-8 lg:p-12">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-[500] bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                    Edit User
                  </h2>
                  <p className="text-lg text-white/60 mt-1">Update {editingUser.first_name} {editingUser.last_name}</p>
                </div>
                <motion.button
                  onClick={() => setEditingUser(null)}
                  className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ChevronDown className="w-6 h-6" />
                </motion.button>
              </div>
              
              <form onSubmit={handleSaveUser} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-lg font-light text-white/80 block mb-3">First Name</label>
                    <input
                      type="text"
                      value={editData.first_name}
                      onChange={(e) => setEditData({ ...editData, first_name: e.target.value })}
                      className="w-full h-16 px-6 text-xl font-light bg-white/10 border border-white/20 rounded-3xl backdrop-blur-sm text-white placeholder-white/40 focus:border-emerald-400/50 focus:outline-none focus:ring-4 focus:ring-emerald-400/20 transition-all duration-300 shadow-xl"
                      disabled={saving}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-lg font-light text-white/80 block mb-3">Last Name</label>
                    <input
                      type="text"
                      value={editData.last_name}
                      onChange={(e) => setEditData({ ...editData, last_name: e.target.value })}
                      className="w-full h-16 px-6 text-xl font-light bg-white/10 border border-white/20 rounded-3xl backdrop-blur-sm text-white placeholder-white/40 focus:border-emerald-400/50 focus:outline-none focus:ring-4 focus:ring-emerald-400/20 transition-all duration-300 shadow-xl"
                      disabled={saving}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-lg font-light text-white/80 block mb-3">Role</label>
                    <select
                      value={editData.role}
                      onChange={(e) => setEditData({ ...editData, role: e.target.value })}
                      className="w-full h-16 px-6 text-xl font-light bg-white/10 border border-white/20 rounded-3xl backdrop-blur-sm text-white focus:border-emerald-400/50 focus:outline-none focus:ring-4 focus:ring-emerald-400/20 transition-all duration-300 shadow-xl appearance-none bg-no-repeat bg-right"
                      disabled={saving}
                    >
                      <option value="employee">Employee</option>
                      <option value="vendor">Vendor</option>
                      <option value="group_admin">Group Admin</option>
                      <option value="group_hr">Group HR</option>
                      <option value="group_finance">Group Finance</option>
                      <option value="sub_admin">Sub Admin</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-lg font-light text-white/80 block mb-3">Status</label>
                    <div className="flex gap-3">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          value="true"
                          checked={editData.is_active === true}
                          onChange={(e) => setEditData({ ...editData, is_active: e.target.value === 'true' })}
                          className="w-5 h-5 text-emerald-500 bg-white/10 border-white/20 rounded focus:ring-emerald-400/50"
                          disabled={saving}
                        />
                        <span className="text-lg font-light text-white/80">Active</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          value="false"
                          checked={editData.is_active === false}
                          onChange={(e) => setEditData({ ...editData, is_active: e.target.value === 'false' })}
                          className="w-5 h-5 text-red-500 bg-white/10 border-white/20 rounded focus:ring-red-400/50"
                          disabled={saving}
                        />
                        <span className="text-lg font-light text-white/80">Inactive</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-lg font-light text-white/80 block mb-3">Phone (Optional)</label>
                  <input
                    type="tel"
                    value={editData.phone}
                    onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                    className="w-full h-16 px-6 text-xl font-light bg-white/10 border border-white/20 rounded-3xl backdrop-blur-sm text-white placeholder-white/40 focus:border-emerald-400/50 focus:outline-none focus:ring-4 focus:ring-emerald-400/20 transition-all duration-300 shadow-xl"
                    disabled={saving}
                  />
                </div>

                <div className="pt-8 border-t border-white/10 flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditingUser(null)}
                    disabled={saving}
                    className="h-16 px-12 text-lg font-light border-white/20 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-3xl flex-1 shadow-xl"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={saving}
                    className="h-16 px-12 text-lg font-semibold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 rounded-3xl flex-1 shadow-2xl hover:shadow-[0_0_40px_rgba(16,_185,_129,_0.4)] flex items-center gap-3"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-6 h-6" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}

    </motion.div>
  );
};

export default UserList;
