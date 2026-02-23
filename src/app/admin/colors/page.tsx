'use client';

import { useState, useEffect } from 'react';
import { adminService } from '@/services/admin.service';
import { useToast } from '@/components/ui/Toast';

interface Color {
  id: number;
  name: string;
  code: string;
  hex_code: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function AdminColorsPage() {
  const [colors, setColors] = useState<Color[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingColor, setEditingColor] = useState<Color | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    hex_code: '#000000',
    sort_order: 0,
    is_active: true,
  });
  const { addToast } = useToast();

  useEffect(() => {
    loadColors();
  }, []);

  const loadColors = async () => {
    try {
      const response = await adminService.getColors();
      setColors(response as any);
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to load colors' });
    } finally {
      setLoading(false);
    }
  };

  const openModal = (color?: Color) => {
    if (color) {
      setEditingColor(color);
      setFormData({
        name: color.name,
        code: color.code,
        hex_code: color.hex_code,
        sort_order: color.sort_order,
        is_active: color.is_active,
      });
    } else {
      setEditingColor(null);
      setFormData({
        name: '',
        code: '',
        hex_code: '#000000',
        sort_order: colors.length + 1,
        is_active: true,
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingColor(null);
    setFormData({ name: '', code: '', hex_code: '#000000', sort_order: 0, is_active: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingColor) {
        await adminService.updateColor(editingColor.id, formData);
        addToast({ type: 'success', message: 'Color updated successfully' });
      } else {
        await adminService.createColor(formData);
        addToast({ type: 'success', message: 'Color created successfully' });
      }
      closeModal();
      loadColors();
    } catch (error: any) {
      addToast({
        type: 'error',
        message: error.response?.data?.message || 'Failed to save color',
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this color?')) return;

    try {
      await adminService.deleteColor(id);
      addToast({ type: 'success', message: 'Color deleted successfully' });
      loadColors();
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to delete color' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-900"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Color Management</h1>
          <p className="text-sm text-neutral-600 mt-1">Manage product colors</p>
        </div>
        <button
          onClick={() => openModal()}
          className="px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors text-sm font-medium"
        >
          + Add Color
        </button>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                Preview
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                Hex Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                Sort Order
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-neutral-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {colors.map((color) => (
              <tr key={color.id} className="hover:bg-neutral-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div
                    className="w-10 h-10 rounded-full border-2 border-neutral-200"
                    style={{ backgroundColor: color.hex_code }}
                  ></div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                  {color.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                  {color.code}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600 font-mono">
                  {color.hex_code}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                  {color.sort_order}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      color.is_active
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-neutral-100 text-neutral-600'
                    }`}
                  >
                    {color.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => openModal(color)}
                    className="text-neutral-600 hover:text-neutral-900 mr-3"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(color.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">
              {editingColor ? 'Edit Color' : 'Add New Color'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900"
                  placeholder="e.g., Navy Blue, Forest Green"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Code *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toLowerCase() })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900"
                  placeholder="e.g., navy-blue, forest-green"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Hex Code *
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={formData.hex_code}
                    onChange={(e) => setFormData({ ...formData, hex_code: e.target.value })}
                    className="w-16 h-10 border border-neutral-300 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.hex_code}
                    onChange={(e) => setFormData({ ...formData, hex_code: e.target.value })}
                    className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900 font-mono"
                    placeholder="#000000"
                    pattern="^#[0-9A-Fa-f]{6}$"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Sort Order
                </label>
                <input
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900"
                  min="0"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-neutral-900 border-neutral-300 rounded focus:ring-neutral-900"
                />
                <label htmlFor="is_active" className="ml-2 text-sm text-neutral-700">
                  Active
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors"
                >
                  {editingColor ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
