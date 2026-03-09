'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/Toast';
import { adminService } from '@/services/admin.service';
import { Pencil, Trash2, Lock, Unlock, ArrowUp, ArrowDown } from 'lucide-react';

interface User {
  id: number;
  name: string;
  email: string;
  roles?: Array<{ id: number; name: string }>;
  locked_until?: string | null;
  failed_login_attempts?: number;
  created_at?: string;
}

interface UserStats {
  total_users: number;
  users_by_role: Record<string, number>;
  locked_accounts: number;
  new_users_this_month: number;
  active_users: number;
}

interface EditModalProps {
  user: User;
  onClose: () => void;
  onSave: (user: User) => void;
}

function EditUserModal({ user, onClose, onSave }: EditModalProps) {
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await adminService.updateUser(user.id, formData);
      onSave(updated);
    } catch (error) {
      console.error('Failed to update user:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Edit User</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminUsersPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [currentAdminRole, setCurrentAdminRole] = useState<string>('admin');

  useEffect(() => {
    const adminData = localStorage.getItem('admin_data');
    if (adminData) {
      const admin = JSON.parse(adminData);
      setCurrentAdminRole(admin.role || 'admin');
    }
    fetchUsers();
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await adminService.getUserStatistics();
      setStats(data);
    } catch (error: any) {
      console.error('Failed to fetch user statistics:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await adminService.getUsers({ search, role: roleFilter !== 'all' ? roleFilter : undefined });
      setUsers(response.data);
    } catch (error: any) {
      console.error('Failed to fetch users:', error);
      if (error?.response?.status === 401) {
        router.push('/admin/login');
        return;
      }
      addToast({
        type: 'error',
        message: error?.message || 'Failed to load users',
      });
    } finally {
      setLoading(false);
    }
  };

  const getUserRole = (user: User): string => {
    if (user.roles && user.roles.length > 0) {
      return user.roles[0].name;
    }
    return 'user';
  };

  const isUserLocked = (user: User): boolean => {
    if (!user.locked_until) return false;
    return new Date(user.locked_until) > new Date();
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());
    
    if (roleFilter === 'all') return matchesSearch;
    return matchesSearch && getUserRole(user) === roleFilter;
  });

  const handleEdit = (user: User) => {
    setEditingUser(user);
  };

  const handleSave = (updatedUser: User) => {
    setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
    setEditingUser(null);
    addToast({
      type: 'success',
      message: 'User updated successfully',
    });
    fetchStats();
  };

  const handleDelete = async (user: User) => {
    if (!confirm(`Are you sure you want to delete user "${user.name}"?`)) {
      return;
    }

    try {
      await adminService.deleteUser(user.id);
      setUsers(users.filter(u => u.id !== user.id));
      addToast({
        type: 'success',
        message: 'User deleted successfully',
      });
      fetchStats();
    } catch (error: any) {
      console.error('Failed to delete user:', error);
      addToast({
        type: 'error',
        message: error?.response?.data?.message || 'Failed to delete user',
      });
    }
  };

  const handleToggleLock = async (user: User) => {
    const action = isUserLocked(user) ? 'unlock' : 'lock';
    if (!confirm(`Are you sure you want to ${action} user "${user.name}"?`)) {
      return;
    }

    try {
      const updated = await adminService.toggleUserLock(user.id);
      setUsers(users.map(u => u.id === updated.id ? updated : u));
      addToast({
        type: 'success',
        message: `User ${action}ed successfully`,
      });
      fetchStats();
    } catch (error: any) {
      console.error('Failed to toggle user lock:', error);
      addToast({
        type: 'error',
        message: error?.response?.data?.message || `Failed to ${action} user`,
      });
    }
  };

  const handlePromote = async (user: User) => {
    if (!confirm(`Are you sure you want to promote user "${user.name}"?`)) {
      return;
    }

    try {
      const result = await adminService.promoteUser(user.id);
      setUsers(users.map(u => u.id === result.user.id ? result.user : u));
      addToast({
        type: 'success',
        message: result.message,
      });
      fetchStats();
    } catch (error: any) {
      console.error('Failed to promote user:', error);
      addToast({
        type: 'error',
        message: error?.response?.data?.message || 'Failed to promote user',
      });
    }
  };

  const handleDemote = async (user: User) => {
    if (!confirm(`Are you sure you want to demote user "${user.name}"?`)) {
      return;
    }

    try {
      const result = await adminService.demoteUser(user.id);
      setUsers(users.map(u => u.id === result.user.id ? result.user : u));
      addToast({
        type: 'success',
        message: result.message,
      });
      fetchStats();
    } catch (error: any) {
      console.error('Failed to demote user:', error);
      addToast({
        type: 'error',
        message: error?.response?.data?.message || 'Failed to demote user',
      });
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSave={handleSave}
        />
      )}
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Manage and monitor user accounts</p>
        </div>

        {/* Filters */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2.5 text-sm text-gray-500 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full px-4 py-2.5 text-sm text-gray-500 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Roles</option>
            <option value="user">Users</option>
            <option value="admin">Admins</option>
            <option value="super_admin">Super Admins</option>
          </select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <p className="text-sm font-medium text-gray-600">Total Users</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.total_users || users.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <p className="text-sm font-medium text-gray-600">Regular Users</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {stats?.users_by_role?.user || users.filter(u => getUserRole(u) === 'user').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <p className="text-sm font-medium text-gray-600">Admins</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              {stats?.users_by_role?.admin || users.filter(u => getUserRole(u) === 'admin').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <p className="text-sm font-medium text-gray-600">Super Admins</p>
            <p className="text-3xl font-bold text-purple-600 mt-2">
              {stats?.users_by_role?.super_admin || users.filter(u => getUserRole(u) === 'super_admin').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <p className="text-sm font-medium text-gray-600">Locked Accounts</p>
            <p className="text-3xl font-bold text-red-600 mt-2">
              {stats?.locked_accounts || users.filter(u => isUserLocked(u)).length}
            </p>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => {
                    const userRole = getUserRole(user);
                    const locked = isUserLocked(user);
                    
                    return (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                                <span className="text-sm font-medium text-white">
                                  {user.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{user.name}</div>
                              <div className="text-sm text-gray-500">ID: {user.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            userRole === 'super_admin'
                              ? 'bg-purple-100 text-purple-800'
                              : userRole === 'admin'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {userRole === 'super_admin' ? 'Super Admin' : userRole === 'admin' ? 'Admin' : 'User'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {locked ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                              Locked
                            </span>
                          ) : (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Active
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEdit(user)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Edit user"
                            >
                              <Pencil size={18} />
                            </button>
                            
                            <button
                              onClick={() => handleToggleLock(user)}
                              className={locked ? 'text-green-600 hover:text-green-900' : 'text-orange-600 hover:text-orange-900'}
                              title={locked ? 'Unlock user' : 'Lock user'}
                            >
                              {locked ? <Unlock size={18} /> : <Lock size={18} />}
                            </button>
                            
                            {currentAdminRole === 'super_admin' && (
                              <>
                                {userRole !== 'super_admin' && (
                                  <button
                                    onClick={() => handlePromote(user)}
                                    className="text-purple-600 hover:text-purple-900"
                                    title="Promote user"
                                  >
                                    <ArrowUp size={18} />
                                  </button>
                                )}
                                
                                {userRole !== 'user' && (
                                  <button
                                    onClick={() => handleDemote(user)}
                                    className="text-yellow-600 hover:text-yellow-900"
                                    title="Demote user"
                                  >
                                    <ArrowDown size={18} />
                                  </button>
                                )}
                              </>
                            )}
                            
                            <button
                              onClick={() => handleDelete(user)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete user"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
