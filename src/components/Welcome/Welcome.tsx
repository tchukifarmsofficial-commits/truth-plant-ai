import React from 'react';
import { useApp } from '../../contexts/AppContext';
import logoAsset from '@/assets/tchuki-farms-logo.png';
import {
  Leaf, MessageSquare, Cloud, TrendingUp,
  BookOpen, Users, Mail, Phone, MapPin, ChevronRight, Droplets, Sun, Bug,
} from 'lucide-react';

const LOGO_URL = logoAsset;

const features = [
  { icon: Leaf, title: ['Plant Doctor', 'Dokotala wa Zomera'], desc: ['Scan a sick crop photo and get a real AI diagnosis with treatment steps.', 'Fotokozerani zomera zakumu ndipo mudzapeza chithunzi chenicheni chachiponda.'], color: 'text-primary-600 bg-primary-50' },
  { icon: MessageSquare, title: ['AI Assistant (Njira)', 'Wothandizira (Njira)'], desc: ['Ask any farming question in English or Chichewa and get practical advice.', 'Funsani funso lililonse la ulimi m’Chingerezi kapena Chichewa.'], color: 'text-violet-600 bg-violet-50' },
  { icon: Cloud, title: ['Weather', 'Nyengo'], desc: ['7-day forecast to help you plan planting, spraying and harvesting.', 'Chiyambi cha nyengo za masiku 7 kukuthandizani kubzala ndi kuvuna.'], color: 'text-sky-600 bg-sky-50' },
  { icon: TrendingUp, title: ['Market Prices', 'Mitengo ya Misika'], desc: ['Daily crop prices so you sell at the right time and place.', 'Mitengo ya tsiku ndi tsiku kuti mugulitse nthawi yabwino.'], color: 'text-emerald-600 bg-emerald-50' },
  { icon: BookOpen, title: ['Lessons', 'Phunziro'], desc: ['Short lessons on planting, fertilizer, pests and storage.', 'Phunziro lalikulu ndi lalikulu pa kubzala, fetereza, tizilombo ndi kusunga.'], color: 'text-orange-600 bg-orange-50' },
  { icon: Users, title: ['Community', 'Gulu'], desc: ['Connect and share with other farmers.', 'Lumikizanani ndi alimi ena.'], color: 'text-pink-600 bg-pink-50' },
];

const tips = [
  { icon: Droplets, tone: 'primary', title: ['Water early', 'Mwetsa msanga'], text: ['Water crops early morning or late evening so less water evaporates.', 'Mwetseni zomera mmawa kapena madzana kuti madzi asasambe.'] },
  { icon: Bug, tone: 'accent', title: ['Check for pests', 'Onani tizilombo'], text: ['Inspect your crops weekly — catching pests early saves your harvest.', 'Onani zomerazanu sabata lililonse — kuzindikira tizilombo msanga kumasunga zokolola.'] },
  { icon: Sun, tone: 'warning', title: ['Rotate your crops', 'Sinthanitsani mbewu'], text: ['Rotate maize with beans or groundnuts to keep your soil strong.', 'Sinthanitsani chimanga ndi mbewu kapena mtedza kuti mthunzi ukhale wamphamvu.'] },
];

const toneClass: Record<string, string> = {
  primary: 'text-primary-600 bg-primary-50',
  accent: 'text-accent-600 bg-accent-50',
  warning: 'text-warning-600 bg-warning-50',
};

interface WelcomeProps {
  onGetStarted: () => void;
}

export default function Welcome({ onGetStarted }: WelcomeProps) {
  const { t } = useApp();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50">
      <div className="mx-auto max-w-3xl px-4 py-10 md:py-14 space-y-8">

        {/* Hero */}
        <div className="card p-8 text-center relative overflow-hidden">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white border border-gray-100 overflow-hidden mb-4 shadow-sm">
            <img src={LOGO_URL} alt="Tchuki Farms logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{t('Welcome to Tchuki Farms', 'Takulandirani ku Tchuki Farms')}</h1>
          <p className="text-gray-600 mt-2 max-w-xl mx-auto">
            {t(
              'Your smart farming companion — scan sick crops, get AI diagnosis, ask farming questions, check weather and market prices, and learn — all in one app.',
              'Wothandizira wanu wa ulimi — onani zomera zakumu, pezerani chithunzi, funsani mafunso a ulimi, onani nyengo ndi mitengo, ndipo phunzirani — m’apulo imodzi.'
            )}
          </p>
          <button
            onClick={onGetStarted}
            className="btn btn-primary mt-6 inline-flex items-center gap-2 text-base px-8 py-3"
          >
            {t('Get Started', 'Yambani')}
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* What's inside */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">{t('What’s inside', 'Zili mkati')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {features.map((f) => (
              <div key={f.title[0]} className="card p-4 flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${f.color}`}>
                  <f.icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-medium text-gray-900 text-sm">{t(f.title[0], f.title[1])}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{t(f.desc[0], f.desc[1])}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Farming tips */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">{t('Quick farming tips', 'Malangizo achidule a ulimi')}</h2>
          <div className="space-y-2.5">
            {tips.map((tip) => (
              <div key={tip.title[0]} className="card p-4 flex items-start gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${toneClass[tip.tone]}`}>
                  <tip.icon className="w-4.5 h-4.5" />
                </div>
                <div>
                  <div className="font-medium text-gray-900 text-sm">{t(tip.title[0], tip.title[1])}</div>
                  <div className="text-sm text-gray-600 mt-0.5">{t(tip.text[0], tip.text[1])}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Company details */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">{t('About Tchuki Farms', 'Za Tchuki Farms')}</h2>
          <p className="text-sm text-gray-500 mb-4">
            {t('Tchuki Farms Company — serving farmers across Malawi.', 'Kampani ya Tchuki Farms — kuthandiza alimi m’Malawi.')}
          </p>
          <div className="space-y-3 text-sm">
            <a href="mailto:tchukifarmsofficial@gmail.com" className="flex items-center gap-3 text-gray-700 hover:text-primary-700 transition-colors">
              <span className="w-9 h-9 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
                <Mail className="w-4.5 h-4.5" />
              </span>
              <span>tchukifarmsofficial@gmail.com</span>
            </a>
            <a href="tel:+265986611989" className="flex items-center gap-3 text-gray-700 hover:text-primary-700 transition-colors">
              <span className="w-9 h-9 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
                <Phone className="w-4.5 h-4.5" />
              </span>
              <span>{t('Call or WhatsApp: ', 'Imani kapena WhatsApp: ')}+265 (0) 986 611 989</span>
            </a>
            <a href="https://wa.me/265986611989" target="_blank" rel="noreferrer" className="flex items-center gap-3 text-gray-700 hover:text-emerald-700 transition-colors">
              <span className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Phone className="w-4.5 h-4.5" />
              </span>
              <span>{t('Chat on WhatsApp', 'Lankhulani pa WhatsApp')}</span>
            </a>
            <div className="flex items-center gap-3 text-gray-700">
              <span className="w-9 h-9 rounded-full bg-accent-50 text-accent-600 flex items-center justify-center shrink-0">
                <MapPin className="w-4.5 h-4.5" />
              </span>
              <span>Malawi, Blantyre — Chileka</span>
            </div>
          </div>
        </div>

        <div className="text-center pb-6">
          <button onClick={onGetStarted} className="btn btn-primary inline-flex items-center gap-2 px-8 py-3 text-base">
            {t('Get Started', 'Yambani')}
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

