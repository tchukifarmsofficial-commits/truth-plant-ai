import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { supabase } from '../../lib/supabase';
import { Calculator, Droplets, Calendar, Leaf, ChevronRight } from 'lucide-react';
import { Crop } from '../../types';

interface FertilizerResult {
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  totalKg: number;
  applicationSchedule: { stage: string; amount: string; timing: string }[];
}

export default function FertilizerCalculator() {
  const { t } = useApp();
  const [crops, setCrops] = useState<Crop[]>([]);
  const [selectedCrop, setSelectedCrop] = useState('');
  const [landSize, setLandSize] = useState('');
  const [landUnit, setLandUnit] = useState('hectares');
  const [fertilizerType, setFertilizerType] = useState('NPK');
  const [result, setResult] = useState<FertilizerResult | null>(null);

  useEffect(() => {
    fetchCrops();
  }, []);

  const fetchCrops = async () => {
    const { data } = await supabase.from('crops').select('*').order('name');
    if (data) setCrops(data);
  };

  const calculateFertilizer = (e: React.FormEvent) => {
    e.preventDefault();

    const size = parseFloat(landSize);
    if (isNaN(size) || size <= 0) return;

    let hectareSize = landUnit === 'acres' ? size * 0.4047 : size;

    const fertilizerRates: Record<string, { n: number; p: number; k: number }> = {
      'Maize': { n: 120, p: 60, k: 40 },
      'Rice': { n: 100, p: 50, k: 60 },
      'Tomatoes': { n: 150, p: 80, k: 120 },
      'Beans': { n: 30, p: 60, k: 40 },
      'Groundnuts': { n: 20, p: 40, k: 30 },
      'Soybeans': { n: 20, p: 50, k: 60 },
      'Cassava': { n: 50, p: 40, k: 80 },
      'Sweet Potatoes': { n: 50, p: 50, k: 100 },
      'Irish Potatoes': { n: 150, p: 80, k: 150 },
      'Onions': { n: 120, p: 60, k: 80 },
      'Cabbage': { n: 150, p: 80, k: 120 },
      'Tobacco': { n: 60, p: 40, k: 80 },
      'Cotton': { n: 80, p: 40, k: 40 },
      'Bananas': { n: 200, p: 60, k: 300 },
      'Pigeon Peas': { n: 20, p: 40, k: 30 },
    };

    const rates = fertilizerRates[selectedCrop] || { n: 100, p: 50, k: 50 };

    const nitrogen = Math.round(rates.n * hectareSize);
    const phosphorus = Math.round(rates.p * hectareSize);
    const potassium = Math.round(rates.k * hectareSize);
    const totalKg = nitrogen + phosphorus + potassium;

    let schedule: { stage: string; amount: string; timing: string }[] = [];

    if (selectedCrop === 'Maize') {
      schedule = [
        {
          stage: t('Basal Application', 'Chotsika'),
          amount: `${Math.round(totalKg * 0.5)} kg DAP`,
          timing: t('At planting', 'Pothira mbeu'),
        },
        {
          stage: t('Top Dressing 1', 'Kuthira 1'),
          amount: `${Math.round(totalKg * 0.3)} kg Urea`,
          timing: t('4-6 weeks after planting', '2-3 ndigwe patathira'),
        },
        {
          stage: t('Top Dressing 2', 'Kuthira 2'),
          amount: `${Math.round(totalKg * 0.2)} kg Urea`,
          timing: t('8-10 weeks after planting', '4-5 ndigwe patathira'),
        },
      ];
    } else {
      schedule = [
        {
          stage: t('Basal Application', 'Chotsika'),
          amount: `${Math.round(totalKg * 0.6)} kg ${fertilizerType}`,
          timing: t('Before/at planting', 'Asanathire/pothira'),
        },
        {
          stage: t('Top Dressing', 'Kuthira'),
          amount: `${Math.round(totalKg * 0.4)} kg Urea/CAN`,
          timing: t('4-6 weeks after emergence', '2-3 ndigwe patamera'),
        },
      ];
    }

    setResult({ nitrogen, phosphorus, potassium, totalKg, applicationSchedule: schedule });
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 mb-4">
          <Calculator className="w-8 h-8 text-indigo-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{t('Fertilizer Calculator', 'Chowerengera Foteleza')}</h1>
        <p className="text-gray-500 mt-1">{t('Calculate fertilizer needs for your farm', 'Werengerani foteleza yofunika pa malo anu')}</p>
      </div>

      <div className="card p-6">
        <form onSubmit={calculateFertilizer} className="space-y-5">
          <div>
            <label className="label">{t('Select Crop', 'Sankhani Chomera')}</label>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="input"
              required
            >
              <option value="">{t('Choose a crop', 'Sankhani chomera')}</option>
              {crops.map(crop => (
                <option key={crop.id} value={crop.name}>{crop.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">{t('Land Size', 'Kukula kwa Malo')}</label>
              <input
                type="number"
                value={landSize}
                onChange={(e) => setLandSize(e.target.value)}
                className="input"
                placeholder="1.5"
                min="0.1"
                step="0.1"
                required
              />
            </div>
            <div>
              <label className="label">{t('Unit', 'Chiyero')}</label>
              <select
                value={landUnit}
                onChange={(e) => setLandUnit(e.target.value)}
                className="input"
              >
                <option value="hectares">{t('Hectares', 'Ma Hektala')}</option>
                <option value="acres">{t('Acres', 'Ma Eka')}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="label">{t('Fertilizer Type', 'Mtundu wa Foteleza')}</label>
            <select
              value={fertilizerType}
              onChange={(e) => setFertilizerType(e.target.value)}
              className="input"
            >
              <option value="NPK">NPK (23:21:0)</option>
              <option value="DAP">DAP</option>
              <option value="CAN">CAN/Urea</option>
              <option value="Compound D">Compound D</option>
            </select>
          </div>

          <button type="submit" className="btn-primary w-full">
            <Calculator className="w-5 h-5" />
            {t('Calculate', 'Werengerani')}
          </button>
        </form>
      </div>

      {result && (
        <div className="card p-6 space-y-6">
          <div className="p-4 rounded-lg bg-indigo-50 border border-indigo-100">
            <div className="flex items-center gap-2 mb-3">
              <Leaf className="w-5 h-5 text-indigo-600" />
              <h3 className="font-semibold text-gray-900">{t('Nutrient Requirements', 'Zofunikira za Zakudya')}</h3>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-indigo-700">{result.nitrogen}</p>
                <p className="text-xs text-gray-500">{t('Nitrogen (N)', 'Nayitrogen')}</p>
                <p className="text-xs text-gray-400">kg/ha</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600">{result.phosphorus}</p>
                <p className="text-xs text-gray-500">{t('Phosphorus (P)', 'Fosifolas')}</p>
                <p className="text-xs text-gray-400">kg/ha</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600">{result.potassium}</p>
                <p className="text-xs text-gray-500">{t('Potassium (K)', 'Potasyamu')}</p>
                <p className="text-xs text-gray-400">kg/ha</p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-primary-50 border border-primary-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Droplets className="w-5 h-5 text-primary-600" />
                <span className="font-medium text-gray-900">{t('Total Fertilizer Needed', 'Kuyere Foteleza Yonse')}</span>
              </div>
              <span className="text-2xl font-bold text-primary-700">{result.totalKg} kg</span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-5 h-5 text-gray-600" />
              <h4 className="font-medium text-gray-900">{t('Application Schedule', 'Ndondomeko Yothira')}</h4>
            </div>
            <div className="space-y-3">
              {result.applicationSchedule.map((item, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                  <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-medium text-primary-700">{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.stage}</p>
                    <p className="text-sm text-gray-600">{item.amount}</p>
                    <p className="text-xs text-gray-500">{item.timing}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
            <p className="text-sm text-amber-800">
              <strong>{t('Note', 'Kumbukirani')}:</strong>{' '}
              {t('Actual fertilizer needs may vary based on soil type, pH, and previous crop history. Consider soil testing for accurate recommendations.', 'Foteleza yofunika ingasiye malinga ndi mthunzi. Khozani kuyeza mthunzi kuti mudziwe bwino.')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
