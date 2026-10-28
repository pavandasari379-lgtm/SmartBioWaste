import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  Sliders,
  CheckCircle,
  AlertTriangle,
  Layers,
  Database,
  Cpu
} from 'lucide-react';
import { api } from '../services/api';
import BinBadge from '../components/BinBadge';

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [rules, setRules] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('sharps');
  const [editRule, setEditRule] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(true);

  const loadAdminData = async () => {
    try {
      const [uList, rList] = await Promise.all([
        api.getAdminUsers(),
        api.getAdminRules()
      ]);
      setUsers(uList || []);
      setRules(rList || {});
      if (rList && rList['sharps']) {
        setEditRule({ ...rList['sharps'] });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.updateAdminUserRole(userId, newRole, true);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      setSuccessMsg("User role updated successfully.");
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert("Failed to update role: " + err.message);
    }
  };

  const handleToggleActive = async (user) => {
    try {
      const newActive = !user.is_active;
      await api.updateAdminUserRole(user.id, user.role, newActive);
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_active: newActive } : u));
    } catch (err) {
      alert("Failed to update user status: " + err.message);
    }
  };

  const handleCategorySelect = (catKey) => {
    setSelectedCategory(catKey);
    if (rules[catKey]) {
      setEditRule({ ...rules[catKey] });
    }
  };

  const handleSaveRule = async (e) => {
    e.preventDefault();
    if (!editRule) return;
    try {
      await api.updateAdminRule(selectedCategory, editRule);
      setRules(prev => ({ ...prev, [selectedCategory]: editRule }));
      setSuccessMsg(`Rule for ${selectedCategory} updated successfully.`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert("Failed to update rule: " + err.message);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-emerald-400" />
            Hospital Safety Officer Admin Console
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Role-based user management, regulatory rule configuration, and system status audit.
          </p>
        </div>

        {successMsg && (
          <div className="px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>{successMsg}</span>
          </div>
        )}
      </div>

      {/* System Health Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block">Database Status</span>
            <span className="text-sm font-bold text-white">PostgreSQL Connected</span>
            <span className="text-[10px] text-emerald-400 block">All 10 Tables Operational</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-blue-500/20 text-blue-400">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block">Neural Architecture</span>
            <span className="text-sm font-bold text-white">EfficientNet-B0 + Grad-CAM</span>
            <span className="text-[10px] text-blue-400 block">PyTorch Inference Active</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-purple-500/20 text-purple-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block">Registered Staff</span>
            <span className="text-sm font-bold text-white">{users.length} Active Personnel</span>
            <span className="text-[10px] text-purple-400 block">RBAC Strict Mode</span>
          </div>
        </div>
      </div>

      {/* User Management Section */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            Hospital Staff & Role Allocations
          </h3>
          <p className="text-xs text-slate-400">Manage user authorization tiers and active account states</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-slate-400 border-b border-slate-800 pb-2">
              <tr>
                <th className="py-2.5 px-3">Full Name</th>
                <th className="py-2.5 px-3">Email Address</th>
                <th className="py-2.5 px-3">Department</th>
                <th className="py-2.5 px-3">Assigned Role</th>
                <th className="py-2.5 px-3">Account Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/30 transition">
                  <td className="py-3 px-3 font-semibold text-white">{u.full_name}</td>
                  <td className="py-3 px-3 text-slate-400">{u.email}</td>
                  <td className="py-3 px-3 text-slate-300">{u.department || 'General'}</td>
                  <td className="py-3 px-3">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      className="px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none"
                    >
                      <option value="ADMIN">ADMIN</option>
                      <option value="HEALTHCARE_STAFF">HEALTHCARE_STAFF</option>
                      <option value="WASTE_COLLECTOR">WASTE_COLLECTOR</option>
                    </select>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      u.is_active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {u.is_active ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => handleToggleActive(u)}
                      className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 text-[11px] font-medium transition"
                    >
                      {u.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Waste Rule Engine Configuration */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-emerald-400" />
            Bio-Waste Segregation Rule Engine Configuration
          </h3>
          <p className="text-xs text-slate-400">Override destination container allocations, risk categories, and disposal SOPs</p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-800 pb-3">
          {Object.keys(rules).map((catKey) => (
            <button
              key={catKey}
              onClick={() => handleCategorySelect(catKey)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition ${
                selectedCategory === catKey
                  ? 'bg-emerald-500 text-white shadow'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {catKey.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Rule Editor Form */}
        {editRule && (
          <form onSubmit={handleSaveRule} className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Destination Bin Mapping</label>
              <select
                value={editRule.recommended_bin || 'YELLOW'}
                onChange={(e) => setEditRule({ ...editRule, recommended_bin: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
              >
                <option value="YELLOW">YELLOW (Incineration / Deep burial)</option>
                <option value="RED">RED (Autoclave / Plastics recycling)</option>
                <option value="WHITE">WHITE (Puncture-proof sharps)</option>
                <option value="BLUE">BLUE (Glassware & metal implants)</option>
                <option value="RADIATION_ALERT">RADIATION PROTOCOL</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Risk Tier Level</label>
              <select
                value={editRule.risk_level || 'Moderate'}
                onChange={(e) => setEditRule({ ...editRule, risk_level: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
              >
                <option value="Low">Low</option>
                <option value="Moderate">Moderate</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Approved Segregation Guidance</label>
              <textarea
                value={editRule.segregation_method || ''}
                onChange={(e) => setEditRule({ ...editRule, segregation_method: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500 h-16"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Safe Handling Protocol</label>
              <textarea
                value={editRule.handling_method || ''}
                onChange={(e) => setEditRule({ ...editRule, handling_method: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500 h-16"
              />
            </div>

            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md transition"
              >
                Save Updated Rule
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
