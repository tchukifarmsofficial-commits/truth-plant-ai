import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { supabase } from '../../lib/supabase';
import {
  FolderKanban, Plus, X, Calendar, MapPin, ChevronRight,
  TrendingUp, TrendingDown, DollarSign, BarChart3
} from 'lucide-react';
import { FarmRecord, Crop } from '../../types';

export default function FarmManagement() {
  const { user, t } = useApp();
  const [records, setRecords] = useState<FarmRecord[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<FarmRecord | null>(null);
  const [formData, setFormData] = useState({
    farm_name: '',
    crop_id: '',
    crop_name: '',
    area_planted: '',
    area_unit: 'hectares',
    planting_date: '',
    expected_harvest_date: '',
    actual_harvest_date: '',
    expenses: '',
    income: '',
    yield_amount: '',
    yield_unit: 'kg',
    notes: '',
  });

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);

    const [recordsRes, cropsRes] = await Promise.all([
      supabase.from('farm_records').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('crops').select('*').order('name'),
    ]);

    if (recordsRes.data) setRecords(recordsRes.data);
    if (cropsRes.data) setCrops(cropsRes.data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const record = {
      user_id: user.id,
      farm_name: formData.farm_name,
      crop_id: formData.crop_id || null,
      crop_name: formData.crop_name,
      area_planted: parseFloat(formData.area_planted) || null,
      area_unit: formData.area_unit,
      planting_date: formData.planting_date || null,
      expected_harvest_date: formData.expected_harvest_date || null,
      actual_harvest_date: formData.actual_harvest_date || null,
      expenses: parseFloat(formData.expenses) || 0,
      income: parseFloat(formData.income) || 0,
      yield_amount: parseFloat(formData.yield_amount) || null,
      yield_unit: formData.yield_unit,
      notes: formData.notes || null,
    };

    if (editingRecord) {
      await supabase
        .from('farm_records')
        .update(record)
        .eq('id', editingRecord.id);
    } else {
      await supabase.from('farm_records').insert(record);
    }

    setShowModal(false);
    setEditingRecord(null);
    setFormData({
      farm_name: '', crop_id: '', crop_name: '', area_planted: '', area_unit: 'hectares',
      planting_date: '', expected_harvest_date: '', actual_harvest_date: '',
      expenses: '', income: '', yield_amount: '', yield_unit: 'kg', notes: '',
    });
    fetchData();
  };

  const handleEdit = (record: FarmRecord) => {
    setEditingRecord(record);
    setFormData({
      farm_name: record.farm_name,
      crop_id: record.crop_id || '',
      crop_name: record.crop_name || '',
      area_planted: record.area_planted?.toString() || '',
      area_unit: record.area_unit,
      planting_date: record.planting_date || '',
      expected_harvest_date: record.expected_harvest_date || '',
      actual_harvest_date: record.actual_harvest_date || '',
      expenses: record.expenses?.toString() || '',
      income: record.income?.toString() || '',
      yield_amount: record.yield_amount?.toString() || '',
      yield_unit: record.yield_unit,
      notes: record.notes || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('Delete this farm record?', 'Muchotsa recordi iyi?'))) return;
    await supabase.from('farm_records').delete().eq('id', id);
    fetchData();
  };

  const totalExpenses = records.reduce((sum, r) => sum + (r.expenses || 0), 0);
  const totalIncome = records.reduce((sum, r) => sum + (r.income || 0), 0);
  const profit = totalIncome - totalExpenses;
  const totalRecords = records.length;

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('Farm Management', 'Nkhaza Zolima')}</h1>
          <p className="text-gray-500 mt-1">{t('Track your farms and harvest', 'Sungani malo anu ndi zotolamo')}</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus className="w-4 h-4" />
          {t('Add Record', 'Onjezani Recordi')}
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <FolderKanban className="w-5 h-5 text-primary-600" />
            <span className="text-sm text-gray-500">{t('Total Farms', 'Malo Onse')}</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalRecords}</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-amber-600" />
            <span className="text-sm text-gray-500">{t('Expenses', 'Malaya')}</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">MK {totalExpenses.toLocaleString()}</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span className="text-sm text-gray-500">{t('Income', 'Pamakolo')}</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">MK {totalIncome.toLocaleString()}</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            {profit >= 0 ? (
              <TrendingUp className="w-5 h-5 text-green-600" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-600" />
            )}
            <span className="text-sm text-gray-500">{t('Profit/Loss', 'Patuna')}</span>
          </div>
          <p className={`text-2xl font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            MK {Math.abs(profit).toLocaleString()}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <BarChart3 className="w-12 h-12 mx-auto text-gray-300 animate-pulse" />
        </div>
      ) : records.length > 0 ? (
        <div className="space-y-3">
          {records.map((record) => (
            <div key={record.id} className="card p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{record.farm_name}</h3>
                    <span className="badge bg-primary-100 text-primary-700">{record.crop_name}</span>
                  </div>
                  <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    {record.area_planted && (
                      <div>
                        <span className="text-gray-500">{t('Area', 'Malo')}: </span>
                        <span className="font-medium">{record.area_planted} {record.area_unit}</span>
                      </div>
                    )}
                    {record.planting_date && (
                      <div>
                        <span className="text-gray-500">{t('Planted', 'Ataponya')}: </span>
                        <span className="font-medium">{record.planting_date}</span>
                      </div>
                    )}
                    {record.expenses > 0 && (
                      <div>
                        <span className="text-gray-500">{t('Expenses', 'Malaya')}: </span>
                        <span className="font-medium">MK {record.expenses.toLocaleString()}</span>
                      </div>
                    )}
                    {record.income > 0 && (
                      <div>
                        <span className="text-gray-500">{t('Income', 'Pamakolo')}: </span>
                        <span className="font-medium text-green-600">MK {record.income.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(record)}
                    className="btn-secondary text-sm"
                  >
                    {t('Edit', 'Kusintha')}
                  </button>
                  <button
                    onClick={() => handleDelete(record.id)}
                    className="btn-secondary text-sm text-red-600"
                  >
                    {t('Delete', 'Chotsa')}
                  </button>
                </div>
              </div>
              {record.notes && (
                <p className="mt-2 text-sm text-gray-600">{record.notes}</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <FolderKanban className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">{t('No farm records yet', 'Palibe recordi zolima')}</p>
          <button onClick={() => setShowModal(true)} className="btn-primary mt-3">
            <Plus className="w-4 h-4" />
            {t('Add Your First Record', 'Onjezani Recordi Yanu')}
          </button>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  {editingRecord ? t('Edit Farm Record', 'Kusintha Recordi') : t('Add Farm Record', 'Onjezani Recordi')}
                </h2>
                <button onClick={() => {
                  setShowModal(false);
                  setEditingRecord(null);
                }} className="p-1 hover:bg-gray-100 rounded">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">{t('Farm Name', 'Dzina la Malo')}</label>
                  <input
                    type="text"
                    value={formData.farm_name}
                    onChange={(e) => setFormData({ ...formData, farm_name: e.target.value })}
                    className="input"
                    required
                    placeholder={t('e.g. Back field', 'Chitsanzo: Munda wa kumbuyo')}
                  />
                </div>

                <div>
                  <label className="label">{t('Crop', 'Chomera')}</label>
                  <select
                    value={formData.crop_id}
                    onChange={(e) => {
                      const crop = crops.find(c => c.id === e.target.value);
                      setFormData({
                        ...formData,
                        crop_id: e.target.value,
                        crop_name: crop?.name || '',
                      });
                    }}
                    className="input"
                  >
                    <option value="">{t('Select crop', 'Sankhani chomera')}</option>
                    {crops.map(crop => (
                      <option key={crop.id} value={crop.id}>{crop.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">{t('Area Planted', 'Malo Wothira')}</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.area_planted}
                      onChange={(e) => setFormData({ ...formData, area_planted: e.target.value })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">{t('Unit', 'Chiyero')}</label>
                    <select
                      value={formData.area_unit}
                      onChange={(e) => setFormData({ ...formData, area_unit: e.target.value })}
                      className="input"
                    >
                      <option value="hectares">{t('Hectares', 'Ma Hektala')}</option>
                      <option value="acres">{t('Acres', 'Ma Eka')}</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">{t('Planting Date', 'Tsiku Lothira')}</label>
                    <input
                      type="date"
                      value={formData.planting_date}
                      onChange={(e) => setFormData({ ...formData, planting_date: e.target.value })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">{t('Expected Harvest', 'Zotola Mudzayemveka')}</label>
                    <input
                      type="date"
                      value={formData.expected_harvest_date}
                      onChange={(e) => setFormData({ ...formData, expected_harvest_date: e.target.value })}
                      className="input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">{t('Expenses (MK)', 'Malaya (MK)')}</label>
                    <input
                      type="number"
                      value={formData.expenses}
                      onChange={(e) => setFormData({ ...formData, expenses: e.target.value })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">{t('Income (MK)', 'Pamakolo (MK)')}</label>
                    <input
                      type="number"
                      value={formData.income}
                      onChange={(e) => setFormData({ ...formData, income: e.target.value })}
                      className="input"
                    />
                  </div>
                </div>

                <div>
                  <label className="label">{t('Yield Amount', 'Kuchuluka Kota')}</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={formData.yield_amount}
                      onChange={(e) => setFormData({ ...formData, yield_amount: e.target.value })}
                      className="input flex-1"
                    />
                    <select
                      value={formData.yield_unit}
                      onChange={(e) => setFormData({ ...formData, yield_unit: e.target.value })}
                      className="input w-20"
                    >
                      <option value="kg">kg</option>
                      <option value="bags">bags</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="label">{t('Notes', 'Mawu')}</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="input"
                    rows={2}
                  />
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={() => {
                    setShowModal(false);
                    setEditingRecord(null);
                  }} className="btn-secondary flex-1">
                    {t('Cancel', 'Chotsani')}
                  </button>
                  <button type="submit" className="btn-primary flex-1">
                    {editingRecord ? t('Save Changes', 'Sungani Zosinthwa') : t('Add Record', 'Onjezani')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
