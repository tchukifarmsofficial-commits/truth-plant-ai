import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { supabase } from '../../lib/supabase';
import { Bug, AlertCircle, Search, Leaf, Shield, Droplets, ChevronDown, ChevronUp } from 'lucide-react';
import { Crop, Disease, Pest } from '../../types';

type View = 'pests' | 'diseases';
type Tab = 'all' | 'my-crops';

interface DiseaseCardProps {
  disease: Disease;
  language: 'en' | 'ny';
}

interface PestCardProps {
  pest: Pest;
  language: 'en' | 'ny';
}

function DiseaseCard({ disease, language }: DiseaseCardProps) {
  const [expanded, setExpanded] = useState(false);
  const { t } = useApp();

  return (
    <div className="card p-4">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-red-100">
          <AlertCircle className="w-5 h-5 text-red-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">
            {language === 'ny' && disease.name_chichewa ? disease.name_chichewa : disease.name}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {t('Crops', 'Zomera')}: {disease.crops.join(', ')}
          </p>
        </div>
      </div>

      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-center gap-1 mt-3 text-sm text-primary-600 hover:text-primary-700"
      >
        {expanded ? t('Show Less', 'Onani Mwachepa') : t('Show Details', 'Onani Mwatsataneka')}
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-gray-100 space-y-3">
          {disease.cause && (
            <div className="flex items-start gap-2">
              <AlertTriangleIcon className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-gray-500">{t('Cause', 'Chifukwa')}</p>
                <p className="text-sm text-gray-700">{disease.cause}</p>
              </div>
            </div>
          )}
          {disease.symptoms && (
            <div className="flex items-start gap-2">
              <Bug className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-gray-500">{t('Symptoms', 'Zizindikiro')}</p>
                <p className="text-sm text-gray-700">{disease.symptoms}</p>
              </div>
            </div>
          )}
          {disease.prevention && (
            <div className="flex items-start gap-2">
              <Shield className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-gray-500">{t('Prevention', 'Chitetezo')}</p>
                <p className="text-sm text-gray-700">{disease.prevention}</p>
              </div>
            </div>
          )}
          {disease.treatment && (
            <div className="flex items-start gap-2">
              <Droplets className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-gray-500">{t('Treatment', 'Thandizo')}</p>
                <p className="text-sm text-gray-700">{disease.treatment}</p>
              </div>
            </div>
          )}
          {disease.recommended_fungicides && (
            <div className="mt-2 p-2 rounded bg-amber-50 text-sm">
              <span className="font-medium text-amber-800">{t('Fungicides', 'Mankhwala a Matenda')}:</span>{' '}
              <span className="text-amber-700">{disease.recommended_fungicides}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AlertTriangleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  );
}

function PestCard({ pest, language }: PestCardProps) {
  const [expanded, setExpanded] = useState(false);
  const { t } = useApp();

  return (
    <div className="card p-4">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-amber-100">
          <Bug className="w-5 h-5 text-amber-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">
            {language === 'ny' && pest.name_chichewa ? pest.name_chichewa : pest.name}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {t('Crops affected', 'Zomera zozudwa')}: {pest.crops.join(', ')}
          </p>
        </div>
      </div>

      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-center gap-1 mt-3 text-sm text-primary-600 hover:text-primary-700"
      >
        {expanded ? t('Show Less', 'Onani Mwachepa') : t('Show Details', 'Onani Mwatsataneka')}
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-gray-100 space-y-3">
          {pest.symptoms && (
            <div className="flex items-start gap-2">
              <Bug className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-gray-500">{t('Symptoms of damage', 'Zizindikiro zauvu')}</p>
                <p className="text-sm text-gray-700">{pest.symptoms}</p>
              </div>
            </div>
          )}
          {pest.control_chemical && (
            <div className="flex items-start gap-2">
              <Droplets className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-gray-500">{t('Chemical Control', 'Chenjezo cha Manhkwala')}</p>
                <p className="text-sm text-gray-700">{pest.control_chemical}</p>
              </div>
            </div>
          )}
          {pest.control_organic && (
            <div className="flex items-start gap-2">
              <Leaf className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-gray-500">{t('Organic Control', 'Chenjezo Cha Chilengedwe')}</p>
                <p className="text-sm text-gray-700">{pest.control_organic}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function PestsDiseases() {
  const { user, language, t } = useApp();
  const [view, setView] = useState<View>('diseases');
  const [tab, setTab] = useState<Tab>('all');
  const [search, setSearch] = useState('');
  const [crops, setCrops] = useState<Crop[]>([]);
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [pests, setPests] = useState<Pest[]>([]);
  const [userCropNames, setUserCropNames] = useState<string[]>([]);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    const [cropsRes, diseasesRes, pestsRes] = await Promise.all([
      supabase.from('crops').select('*').order('name'),
      supabase.from('diseases').select('*'),
      supabase.from('pests').select('*'),
    ]);

    if (cropsRes.data) setCrops(cropsRes.data);
    if (diseasesRes.data) setDiseases(diseasesRes.data);
    if (pestsRes.data) setPests(pestsRes.data);

    if (user && cropsRes.data) {
      const { data: userCrops } = await supabase
        .from('user_crops')
        .select('crop_id')
        .eq('user_id', user.id);

      if (userCrops && cropsRes.data) {
        const names = userCrops
          .map((uc: any) => cropsRes.data?.find((c: any) => c.id === uc.crop_id)?.name)
          .filter(Boolean) as string[];
        setUserCropNames(names);
      }
    }
  };

  const filterByCrop = (cropNames: string[]) => {
    if (tab === 'all') return cropNames;
    return cropNames.filter(c => userCropNames.includes(c));
  };

  const filteredDiseases = diseases.filter(d =>
    filterByCrop(d.crops).length > 0 &&
    (search === '' || d.name.toLowerCase().includes(search.toLowerCase()))
  );

  const filteredPests = pests.filter(p =>
    filterByCrop(p.crops).length > 0 &&
    (search === '' || p.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
          {view === 'diseases' ? (
            <AlertCircle className="w-8 h-8 text-red-600" />
          ) : (
            <Bug className="w-8 h-8 text-amber-600" />
          )}
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{t('Pests & Diseases Library', 'Libulale ya Tizilombo ndi Matenda')}</h1>
        <p className="text-gray-500 mt-1">{t('Learn to identify and manage crop threats', 'Phunzirani kudziwa ndi kuthana ndi zovuta za zomera')}</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('Search...', 'Fufuzani...')}
            className="input pl-10"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setTab('all')}
            className={`btn ${tab === 'all' ? 'btn-primary' : 'btn-secondary'}`}
          >
            {t('All', 'Onse')}
          </button>
          <button
            onClick={() => setTab('my-crops')}
            className={`btn ${tab === 'my-crops' ? 'btn-primary' : 'btn-secondary'}`}
          >
            {t('My Crops', 'Zomera Zanga')}
          </button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setView('diseases')}
          className={`btn flex-shrink-0 ${view === 'diseases' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <AlertCircle className="w-4 h-4" />
          {t('Diseases', 'Matenda')} ({filteredDiseases.length})
        </button>
        <button
          onClick={() => setView('pests')}
          className={`btn flex-shrink-0 ${view === 'pests' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Bug className="w-4 h-4" />
          {t('Pests', 'Tizilombo')} ({filteredPests.length})
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {view === 'diseases' && filteredDiseases.map(disease => (
          <DiseaseCard key={disease.id} disease={disease} language={language} />
        ))}
        {view === 'pests' && filteredPests.map(pest => (
          <PestCard key={pest.id} pest={pest} language={language} />
        ))}
      </div>

      {view === 'diseases' && filteredDiseases.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>{t('No diseases found matching your criteria', 'Palibe matenda omwe akufanana ndi zimene mukufuna')}</p>
        </div>
      )}

      {view === 'pests' && filteredPests.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Bug className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>{t('No pests found matching your criteria', 'Palibe tizilombo tomwe akufanana ndi zimene mukufuna')}</p>
        </div>
      )}
    </div>
  );
}
