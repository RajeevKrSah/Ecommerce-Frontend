'use client';

import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/Toast';

export default function ProfilePage() {
  const { user, logout, logoutAll } = useAuth();
  const { addToast } = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      addToast({
        type: 'success',
        message: 'Logged out successfully',
      });
    } catch (error) {
      addToast({
        type: 'error',
        message: 'Failed to logout',
      });
    }
  };

  const handleLogoutAll = async () => {
    if (!confirm('This will log you out from all devices. Continue?')) return;
    
    try {
      await logoutAll();
      addToast({
        type: 'success',
        message: 'Logged out from all devices',
      });
    } catch (error) {
      addToast({
        type: 'error',
        message: 'Failed to logout from all devices',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <p className="text-gray-900">{user?.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <p className="text-gray-900">{user?.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
              <p className="text-gray-900 font-mono">#{user?.id}</p>
            </div>
            {user?.role && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                  {user.role.toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Account Security */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Security</h2>
          <div className="space-y-3">
            <button className="w-full px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
              Change Password
            </button>
            <button className="w-full px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
              Enable Two-Factor Authentication
            </button>
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 text-left"
            >
              Sign Out
            </button>
            <button
              onClick={handleLogoutAll}
              className="w-full px-4 py-2 text-sm font-medium text-red-600 border border-red-300 rounded-lg hover:bg-red-50 text-left"
            >
              Sign Out from All Devices
            </button>
          </div>
        </div>
      </div>

      {/* Account Status */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Email Verification</p>
            <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
              user?.email_verified_at ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {user?.email_verified_at ? 'Verified' : 'Pending'}
            </span>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Member Since</p>
            <p className="text-sm font-medium text-gray-900">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric'
              }) : 'Today'}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Account Type</p>
            <p className="text-sm font-medium text-gray-900">Standard</p>
          </div>
        </div>
      </div>
    </div>
  );
}
