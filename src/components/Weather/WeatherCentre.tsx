import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { supabase } from '../../lib/supabase';
import {
  Cloud, Sun, Droplets, Wind, Thermometer, Umbrella,
  AlertTriangle, Calendar, MapPin, RefreshCw
} from 'lucide-react';
import { WeatherAlert } from '../../types';

interface WeatherData {
  current: {
    temp: number;
    condition: string;
    humidity: number;
    wind: number;
    feelsLike: number;
    uvIndex: number;
  };
  forecast: { day: string; date: string; high: number; low: number; condition: string; icon: 'sun' | 'cloud' | 'rain' }[];
}

export default function WeatherCentre() {
  const { user, t } = useApp();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState(user?.district || 'Lilongwe');

  useEffect(() => {
    fetchWeatherAndAlerts();
  }, [location]);

  const fetchWeatherAndAlerts = async () => {
    setLoading(true);

    const { data: alertsData } = await supabase
      .from('weather_alerts')
      .select('*')
      .eq('is_active', true)
      .or(`district.is.null,district.eq.${location}`);
    if (alertsData) setAlerts(alertsData);

    const mockWeather: WeatherData = {
      current: {
        temp: 26,
        condition: t('Partly Cloudy', 'Mmata Mmata'),
        humidity: 65,
        wind: 12,
        feelsLike: 28,
        uvIndex: 6,
      },
      forecast: [
        { day: t('Today', 'Lero'), date: 'Jun 24', high: 28, low: 16, condition: t('Partly Cloudy', 'Mmata Mmata'), icon: 'cloud' },
        { day: t('Mon', 'Chi'), date: 'Jun 25', high: 26, low: 15, condition: t('Rain Showers', 'Vula'), icon: 'rain' },
        { day: t('Tue', 'Ll'), date: 'Jun 26', high: 24, low: 14, condition: t('Rain', 'Vula'), icon: 'rain' },
        { day: t('Wed', 'Lachi'), date: 'Jun 27', high: 25, low: 15, condition: t('Cloudy', 'Mtambo'), icon: 'cloud' },
        { day: t('Thu', 'Lachitatu'), date: 'Jun 28', high: 27, low: 16, condition: t('Sunny', 'Dzuwa'), icon: 'sun' },
        { day: t('Fri', 'Lachinayi'), date: 'Jun 29', high: 29, low: 17, condition: t('Sunny', 'Dzuwa'), icon: 'sun' },
        { day: t('Sat', 'Lachisanu'), date: 'Jun 30', high: 28, low: 16, condition: t('Partly Cloudy', 'Mmata Mmata'), icon: 'cloud' },
      ],
    };

    setTimeout(() => {
      setWeather(mockWeather);
      setLoading(false);
    }, 500);
  };

  const getWeatherIcon = (icon: 'sun' | 'cloud' | 'rain', size = 'w-8 h-8') => {
    switch (icon) {
      case 'sun':
        return <Sun className={`${size} text-yellow-500`} />;
      case 'cloud':
        return <Cloud className={`${size} text-gray-400`} />;
      case 'rain':
        return <Umbrella className={`${size} text-blue-500`} />;
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('Weather Centre', 'Malo a Nyengo')}</h1>
          <div className="flex items-center gap-1 text-gray-500 mt-1">
            <MapPin className="w-4 h-4" />
            <span>{location}, Malawi</span>
          </div>
        </div>
        <button
          onClick={fetchWeatherAndAlerts}
          disabled={loading}
          className="btn-secondary"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {t('Refresh', 'Zolengedwa')}
        </button>
      </div>

      {alerts.length > 0 && (
        <div className="space-y-3">
          {alerts.map(alert => (
            <div
              key={alert.id}
              className={`p-4 rounded-lg flex items-start gap-3 ${
                alert.severity === 'critical'
                  ? 'bg-red-50 border border-red-200'
                  : alert.severity === 'high'
                  ? 'bg-orange-50 border border-orange-200'
                  : alert.severity === 'medium'
                  ? 'bg-yellow-50 border border-yellow-200'
                  : 'bg-blue-50 border border-blue-200'
              }`}
            >
              <AlertTriangle className={`w-5 h-5 flex-shrink-0 ${
                alert.severity === 'critical' || alert.severity === 'high'
                  ? 'text-red-600'
                  : 'text-yellow-600'
              }`} />
              <div>
                <p className="font-medium text-gray-900">
                  {alert.alert_type}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {t(alert.message, alert.message_chichewa || alert.message)}
                </p>
                {alert.start_date && alert.end_date && (
                  <p className="text-xs text-gray-500 mt-1">
                    {t('Valid', 'Kuyenera')}: {alert.start_date} - {alert.end_date}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 text-primary-600 animate-spin" />
        </div>
      ) : weather && (
        <>
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-5xl font-bold text-gray-900">{weather.current.temp}°</p>
                <p className="text-gray-600">{weather.current.condition}</p>
              </div>
              <div className="text-right">
                {getWeatherIcon('cloud', 'w-16 h-16')}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                <Thermometer className="w-5 h-5 text-red-500" />
                <div>
                  <p className="text-xs text-gray-500">{t('Feels Like', 'Kumveka')}</p>
                  <p className="font-semibold text-gray-900">{weather.current.feelsLike}°</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                <Droplets className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-xs text-gray-500">{t('Humidity', 'Madzi Mmthunzi')}</p>
                  <p className="font-semibold text-gray-900">{weather.current.humidity}%</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                <Wind className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">{t('Wind', 'Mphepo')}</p>
                  <p className="font-semibold text-gray-900">{weather.current.wind} km/h</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                <Sun className="w-5 h-5 text-yellow-500" />
                <div>
                  <p className="text-xs text-gray-500">{t('UV Index', 'UV')}</p>
                  <p className="font-semibold text-gray-900">{weather.current.uvIndex}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-gray-600" />
              <h2 className="font-semibold text-gray-900">{t('7-Day Forecast', 'Mavuto a Masiku 7')}</h2>
            </div>
            <div className="space-y-2">
              {weather.forecast.map((day, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    i === 0 ? 'bg-primary-50 border border-primary-100' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {getWeatherIcon(day.icon)}
                    <div>
                      <p className="font-medium text-gray-900">{day.day}</p>
                      <p className="text-xs text-gray-500">{day.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">{day.condition}</span>
                    <div className="text-right">
                      <span className="font-semibold text-gray-900">{day.high}°</span>
                      <span className="text-gray-400 mx-1">/</span>
                      <span className="text-gray-500">{day.low}°</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="card p-5">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Umbrella className="w-5 h-5 text-blue-500" />
                {t('Farming Recommendations', 'Malangizo Olimira')}
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                  {t('Rain expected Tuesday - delay fertilizer application', 'Vula ikudikira Lachiwiri - onganizirani foteleza')}
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                  {t('Good drying weather Thursday-Saturday', 'Nyengo yabwino yowumika Lachinayi-Lachisanu')}
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-1.5 flex-shrink-0" />
                  {t('High UV - work early morning or late afternoon', 'Dzuwa lalikulu - gwirani ntchito madawi kapena manawa')}
                </li>
              </ul>
            </div>

            <div className="card p-5">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                {t('Weather Tips', 'Malangizo a Nyengo')}
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                  {t('Check forecast before spraying pesticides', 'Onani nyengo before kuthira mankhwala')}
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                  {t('Irrigate early morning to reduce evaporation', 'Mukalireni madawi kuti madzi asamwe kumwamba')}
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                  {t('Protect seedlings during heavy rain', 'Tetezeni zomera za mdera pa vula yofuwira')}
                </li>
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
