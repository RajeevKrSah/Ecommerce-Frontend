import api from '@/lib/api';
import { User } from '@/types/auth';

export interface RoleChangeLog {
  id: number;
  performed_by: number;
  target_user_id: number;
  old_role: string;
  new_role: string;
  ip_address: string;
  created_at: string;
  performer?: User;
  target_user?: User;
}

export const roleService = {
  async promoteUser(userId: number): Promise<{ message: string; user: User; log: RoleChangeLog }> {
    const response = await api.post(`/admin/users/${userId}/promote`);
    return response.data;
  },

  async demoteUser(userId: number): Promise<{ message: string; user: User; log: RoleChangeLog }> {
    const response = await api.post(`/admin/users/${userId}/demote`);
    return response.data;
  },

  async getRoleChangeLogs(params?: {
    user_id?: number;
    page?: number;
  }): Promise<{
    data: RoleChangeLog[];
    current_page: number;
    last_page: number;
    total: number;
  }> {
    const response = await api.get('/admin/role-change-logs', { params });
    return response.data;
  },

  getUserRoleDisplay(user: User): string {
    if (!user.roles || user.roles.length === 0) return 'User';
    
    const role = user.roles[0].name;
    return role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  },

  getUserRoleName(user: User): 'user' | 'admin' | 'super_admin' {
    if (!user.roles || user.roles.length === 0) return 'user';
    return user.roles[0].name;
  },

  canPromote(userRole: 'user' | 'admin' | 'super_admin'): boolean {
    return userRole !== 'super_admin';
  },

  canDemote(userRole: 'user' | 'admin' | 'super_admin'): boolean {
    return userRole !== 'user';
  },

  getNextRole(currentRole: 'user' | 'admin' | 'super_admin'): 'user' | 'admin' | 'super_admin' | null {
    if (currentRole === 'user') return 'admin';
    if (currentRole === 'admin') return 'super_admin';
    return null;
  },

  getPreviousRole(currentRole: 'user' | 'admin' | 'super_admin'): 'user' | 'admin' | 'super_admin' | null {
    if (currentRole === 'super_admin') return 'admin';
    if (currentRole === 'admin') return 'user';
    return null;
  }
};
