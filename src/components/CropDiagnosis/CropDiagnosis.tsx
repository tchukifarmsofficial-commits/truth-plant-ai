import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { supabase } from '../../lib/supabase';
import { Bug, Search, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';
import { Crop, Disease, Pest } from '../../types';

interface DiagnosisResult {
  possibleCauses: string[];
  solutions: string[];
  prevention: string[];
}

export default function CropDiagnosis() {
  const { user, t } = useApp();
  const [crops, setCrops] = useState<Crop[]>([]);
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [pests, setPests] = useState<Pest[]>([]);
  const [selectedCrop, setSelectedCrop] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DiagnosisResult | null>(null);

  React.useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [cropsData, diseasesData, pestsData] = await Promise.all([
      supabase.from('crops').select('*').order('name'),
      supabase.from('diseases').select('*'),
      supabase.from('pests').select('*'),
    ]);
    if (cropsData.data) setCrops(cropsData.data);
    if (diseasesData.data) setDiseases(diseasesData.data);
    if (pestsData.data) setPests(pestsData.data);
  };

  const handleDiagnose = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCrop || !symptoms || !user) return;

    setLoading(true);

    try {
      const relatedDiseases = diseases.filter(d => d.crops.includes(selectedCrop));
      const relatedPests = pests.filter(p => p.crops.includes(selectedCrop));

      const matchedDiseases = relatedDiseases.filter(d =>
        d.symptoms?.toLowerCase().includes(symptoms.toLowerCase()) ||
        symptoms.toLowerCase().includes(d.name.toLowerCase())
      );
      const matchedPests = relatedPests.filter(p =>
        p.symptoms?.toLowerCase().includes(symptoms.toLowerCase()) ||
        symptoms.toLowerCase().includes(p.name.toLowerCase())
      );

      const possibleCauses: string[] = [];
      const solutions: string[] = [];
      const prevention: string[] = [];

      matchedDiseases.forEach(d => {
        possibleCauses.push(`Disease: ${d.name} - ${d.cause || 'Unknown cause'}`);
        if (d.treatment) solutions.push(d.treatment);
        if (d.prevention) prevention.push(d.prevention);
      });

      matchedPests.forEach(p => {
        possibleCauses.push(`Pest: ${p.name}`);
        if (p.control_chemical) solutions.push(`Chemical control: ${p.control_chemical}`);
        if (p.control_organic) solutions.push(`Organic control: ${p.control_organic}`);
      });

      if (possibleCauses.length === 0) {
        possibleCauses.push(
          t('Unable to identify specific cause', 'Sitikhoza kudziwa chifukwa'),
          t('Consider consulting a local agricultural expert', 'Khozani kufunsaninso ndi wodziwa za ulimi')
        );
        solutions.push(t('Keep plants well-watered and monitor for changes', 'Mukalireni zomera moyenera ndipo pameneni zatsinikiza'));
      }

      await supabase.from('diagnoses').insert({
        user_id: user.id,
        crop: selectedCrop,
        diagnosis_type: 'manual',
        symptoms,
        result: { possibleCauses, solutions, prevention } as unknown as Record<string, unknown>,
      });

      setResult({
        possibleCauses: [...new Set(possibleCauses)],
        solutions: [...new Set(solutions)],
        prevention: [...new Set(prevention)],
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 mb-4">
          <Bug className="w-8 h-8 text-amber-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{t('Crop Diagnosis', 'Kuda Dzala Zomera')}</h1>
        <p className="text-gray-500 mt-1">{t('Describe symptoms for diagnosis', 'Fotokozani zizindikiro kuti tifufuze')}</p>
      </div>

      <div className="card p-6">
        <form onSubmit={handleDiagnose} className="space-y-5">
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
                <option key={crop.id} value={crop.name}>
                  {crop.name} {crop.name_chichewa && `(${crop.name_chichewa})`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">{t('Describe Symptoms', 'Fotokozani Zizindikiro')}</label>
            <textarea
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              className="input min-h-32"
              placeholder={t('Example: My maize leaves are turning yellow and have brown spots', 'Chitsanzo: Masamba a chimanga anga akutama mankhwala akuda')}
              required
            />
          </div>

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? (
              <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <>
                <Search className="w-5 h-5" />
                {t('Diagnose', 'Fufuzani')}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>

      {result && (
        <div className="card p-6 space-y-6">
          <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 border border-amber-100">
            <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900">{t('Diagnosis Results', 'Mavuto a Fufuzo')}</h3>
              <p className="text-sm text-gray-600">{t('Based on your symptoms', 'Malinga ndi zizindikiro zanu')}</p>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              {t('Possible Causes', 'Zingakhale Chifukwa')}
            </h4>
            <ul className="space-y-2">
              {result.possibleCauses.map((cause, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                  {cause}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              {t('Solutions & Treatment', 'Makhalidwe Odziwa')}
            </h4>
            <ul className="space-y-2">
              {result.solutions.map((sol, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                  {sol}
                </li>
              ))}
            </ul>
          </div>

          {result.prevention.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">{t('Prevention Tips', 'Malangizo Ochezga')}</h4>
              <ul className="space-y-2">
                {result.prevention.map((p, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
