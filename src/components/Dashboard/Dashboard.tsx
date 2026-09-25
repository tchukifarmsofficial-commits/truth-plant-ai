import React, { useEffect, useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import {
  Leaf, Bug, SprayCan, Cloud,
  TrendingUp, MessageSquare, BookOpen, Users,
  ChevronRight, Sun, Droplets, Wind
} from 'lucide-react';
import type { Page } from '../Layout/Sidebar';

interface DashboardProps {
  onNavigate: (page: Page) => void;
}

const menuCards = [
  { id: 'plant-doctor' as Page, icon: Leaf, color: 'bg-primary-100 text-primary-600', labelEn: 'Plant Doctor', labelNy: 'Dokotala wa Zomera', desc: 'AI-powered crop diagnosis' },
  { id: 'crop-diagnosis' as Page, icon: Bug, color: 'bg-amber-100 text-amber-600', labelEn: 'Crop Diagnosis', labelNy: 'Kuda Dzala', desc: 'Manual symptom check' },
  { id: 'pests-diseases' as Page, icon: SprayCan, color: 'bg-red-100 text-red-600', labelEn: 'Pests & Diseases', labelNy: 'Chipondwa', desc: 'Library & solutions' },
  { id: 'weather' as Page, icon: Cloud, color: 'bg-sky-100 text-sky-600', labelEn: 'Weather', labelNy: 'Nyengo', desc: '7-day forecast' },
  { id: 'market' as Page, icon: TrendingUp, color: 'bg-emerald-100 text-emerald-600', labelEn: 'Market Prices', labelNy: 'Mitengo', desc: 'Daily crop prices' },
  { id: 'ai-assistant' as Page, icon: MessageSquare, color: 'bg-violet-100 text-violet-600', labelEn: 'AI Assistant', labelNy: 'Wothandizira', desc: 'Bilingual farming help' },
  { id: 'lessons' as Page, icon: BookOpen, color: 'bg-orange-100 text-orange-600', labelEn: 'Lessons', labelNy: 'Phunziro', desc: 'Learn farming tips' },
  { id: 'community' as Page, icon: Users, color: 'bg-pink-100 text-pink-600', labelEn: 'Community', labelNy: 'Gulu', desc: 'Connect with farmers' },
];

const farmingTips = [
  {
    icon: Droplets,
    tone: 'primary',
    title: ['Water Management', 'Nkhaza Zamadzi'],
    text: ['Water your crops early morning or late evening to reduce evaporation.', 'Mwetseni zomera zanu madawi kapena manawa kuti madzi asamwe kumwamba.'],
  },
  {
    icon: Leaf,
    tone: 'earth',
    title: ['Soil Health', 'Thanzi la Mthunzi'],
    text: ['Add compost and organic matter to improve soil structure and crop growth.', 'Ikani manyowa ndi zinthu zachilengedwe kuti mthunzi ukhale wabwino.'],
  },
  {
    icon: Bug,
    tone: 'accent',
    title: ['Pest Prevention', 'Kuthana ndi Tizilombo'],
    text: ['Regularly inspect your crops for early signs of pest infestation.', 'Kawiriranu onani zomera zanu kuti muwone tizilombo kale.'],
  },
  {
    icon: Sun,
    tone: 'warning',
    title: ['Planting Time', 'Nthawi Yobzala'],
    text: ['Plant at the start of reliable rains and keep young seedlings protected.', 'Bzalani mvula ikayamba ndipo muteteze mbewu zazing&apos;ono.'],
  },
  {
    icon: Leaf,
    tone: 'primary',
    title: ['Crop Rotation', 'Kusinthasintha Mbewu'],
    text: ['Rotate maize with legumes like groundnuts or soybeans to restore soil nitrogen.', 'Sinthanitsani chimanga ndi mtedza kapena soyabini kuti mthunzi ube nitrogen.'],
  },
  {
    icon: Droplets,
    tone: 'earth',
    title: ['Mulching', 'Kufunda Zomera'],
    text: ['Cover soil with dry grass or crop residues to keep moisture and stop weeds.', 'Fumbirani mthunzi ndi udzu wouma kuti madzi asamve ndi udzu usamere.'],
  },
  {
    icon: Bug,
    tone: 'accent',
    title: ['Fall Armyworm', 'Kankhosi'],
    text: ['Check maize whorls early morning for fall armyworm and hand-pick or use ash.', 'Onani mitumbira ya chimanga mmawa kwa kankhosi, muchotse kapena mugwiritse phula.'],
  },
  {
    icon: Sun,
    tone: 'warning',
    title: ['Seed Selection', 'Kusankha Mbeu'],
    text: ['Use certified seed from trusted suppliers for better germination and yields.', 'Gwiritsani ntchito mbeu zovomerezeka kuchokera kwa ogulitsa odalirika.'],
  },
  {
    icon: Leaf,
    tone: 'primary',
    title: ['Fertilizer Timing', 'Nthawi ya Fetereza'],
    text: ['Apply basal fertilizer at planting and top-dress when maize is knee-high.', 'Ikani fetereza mukamabzala ndipo wonjezani chimanga chikafika mafundo.'],
  },
  {
    icon: Droplets,
    tone: 'earth',
    title: ['Water Conservation', 'Kusunga Madzi'],
    text: ['Make box ridges and tie ridges to trap rainwater in your field.', 'Pangani miphira yomangidwa kuti madzi amvula azikhala m&apos;munda.'],
  },
  {
    icon: Bug,
    tone: 'accent',
    title: ['Storage Safety', 'Kusunga Zakudya'],
    text: ['Dry grain well before storage and use airtight bags to stop weevils.', 'Umitsani tirigu bwino musanaike ndipo gwiritsani thumba lokhutira.'],
  },
  {
    icon: Sun,
    tone: 'warning',
    title: ['Diversification', 'Kulima Zosiyanasiyana'],
    text: ['Grow more than one crop to reduce risk if one crop fails or prices drop.', 'Limani zomera zosiyanasiyana kuti mukanakhala pa chitetezo ngati china chalephera.'],
  },
  {
    icon: Leaf,
    tone: 'primary',
    title: ['Weed Early', 'Kupalira Msanga'],
    text: ['Weed within the first 3 weeks after planting — weeds steal nutrients fast.', 'Palirani sabata zitatu zoyamba — udzu umabeza zakudya za zomera msanga.'],
  },
];

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { user, t } = useApp();
  // Start at a random tip each time the app opens so tips differ per visit
  const [tipOffset, setTipOffset] = useState(() => Math.floor(Math.random() * farmingTips.length));

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTipOffset((current) => (current + 1) % farmingTips.length);
    }, 8000);
    return () => window.clearInterval(timer);
  }, []);

  const visibleTips = [0, 1, 2].map((position) => farmingTips[(tipOffset + position) % farmingTips.length]);

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-600 to-primary-800 p-6 md:p-8 text-white">
        <div className="relative z-10">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            {t('Welcome back,', 'Takulandirileni,')} {user?.full_name?.split(' ')[0]}!
          </h1>
          <p className="text-primary-100 mb-6 max-w-lg">
            {t('Your smart farming companion for healthier crops and better yields.', 'Wathandizira wanu wa ulimi wabwino kuti zomera zanu zikhale zabwino.')}
          </p>
          <button
            onClick={() => onNavigate('plant-doctor')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-primary-700 rounded-lg font-medium hover:bg-primary-50 transition-colors"
          >
            <Leaf className="w-5 h-5" />
            {t('Diagnose Your Crops', 'Dzalani Zomera Zanu')}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <path fill="currentColor" d="M100,5 L195,100 L100,195 L5,100 Z" />
          </svg>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-sky-100">
              <Sun className="w-5 h-5 text-sky-600" />
            </div>
            <span className="text-sm text-gray-500">{t('Weather Today', 'Nyengo Lero')}</span>
          </div>
          <div className="flex items-end gap-4">
            <span className="text-4xl font-bold text-gray-900">26°</span>
            <div className="text-sm text-gray-500">
              <p>{t('Partly Cloudy', 'Mmata Mmata')}</p>
              <p className="flex items-center gap-1 mt-1">
                <Droplets className="w-4 h-4 text-sky-500" />
                65%
                <Wind className="w-4 h-4 ml-2" />
                12 km/h
              </p>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-warning-100">
              <TrendingUp className="w-5 h-5 text-warning-600" />
            </div>
            <span className="text-sm text-gray-500">{t('Top Market Price', 'Mitengo Yapamwamba')}</span>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xl font-bold text-gray-900">MK 850</p>
              <p className="text-sm text-gray-500">{t('per kg Soybeans', 'pa kg ya Soyabini')}</p>
            </div>
            <span className="badge bg-success-50 text-success-700">
              +12%
            </span>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('Quick Access', 'Kulowa Mwachangu')}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {menuCards.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="card-hover p-4 text-center group"
            >
              <div className={`w-14 h-14 rounded-xl ${item.color} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                <item.icon className="w-7 h-7" />
              </div>
              <p className="font-medium text-gray-900 text-sm">{t(item.labelEn, item.labelNy)}</p>
              <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="text-lg font-semibold text-gray-900">{t('Farming Tips', 'Malangizo Olimira')}</h2>
          <span className="text-xs text-gray-500">{t('Updates regularly', 'Zimasintha nthawi zonse')}</span>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {visibleTips.map((tip) => {
            const TipIcon = tip.icon;
            return (
              <div key={tip.title[0]} className={`p-4 rounded-lg bg-${tip.tone}-50 border border-${tip.tone}-100`}>
                <div className="flex items-center gap-2 mb-2">
                  <TipIcon className={`w-5 h-5 text-${tip.tone}-600`} />
                  <span className={`font-medium text-${tip.tone}-900`}>{t(tip.title[0], tip.title[1])}</span>
                </div>
                <p className={`text-sm text-${tip.tone}-800`}>{t(tip.text[0], tip.text[1])}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
