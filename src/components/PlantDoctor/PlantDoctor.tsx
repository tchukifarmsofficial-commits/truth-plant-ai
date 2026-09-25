import React, { useState, useRef } from 'react';
import { useApp } from '../../contexts/AppContext';
import { supabase } from '../../lib/supabase';
import {
  Camera, Upload, X, AlertCircle, CheckCircle2,
  Leaf, Bug, Droplets, Pill, Shield
} from 'lucide-react';

interface DiagnosisResult {
  crop: string;
  disease?: string | null;
  pest?: string | null;
  issue: string;
  cause: string;
  symptoms: string;
  prevention: string;
  treatment: string;
  pesticides?: string | null;
  fungicides?: string | null;
  confidence?: number;
  severity?: string;
  disclaimer?: string;
}

export default function PlantDoctor() {
  const { user, t } = useApp();
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [error, setError] = useState('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setResult(null);
      setError('');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setResult(null);
      setError('');
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile || !user) return;

    setLoading(true);
    setError('');

    try {
      if (!preview) throw new Error('The image is still loading. Please select it again.');

      // Analyze first so storage permissions cannot hide a successful diagnosis.
      const diagnosisResult = await analyzeImage(preview);

      let publicUrl: string | null = null;
      const fileExt = selectedFile.name.split('.').pop() || 'jpg';
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('diagnosis-images')
        .upload(fileName, selectedFile, { contentType: selectedFile.type, upsert: false });

      if (!uploadError) {
        const signed = await supabase.storage.from('diagnosis-images').createSignedUrl(fileName, 60 * 60 * 24 * 365 * 5);
        publicUrl = signed.data?.signedUrl ?? null;
      }


      const { error: saveError } = await supabase.from('diagnoses').insert({
        user_id: user.id,
        crop: diagnosisResult.crop,
        diagnosis_type: 'image',
        image_url: publicUrl,
        result: diagnosisResult as unknown as Record<string, unknown>,
      });

      if (saveError) console.warn('[PlantDoctor] Diagnosis was analyzed but could not be saved:', saveError.message);
      setResult(diagnosisResult);
    } catch (error) {
      console.error('[PlantDoctor] Diagnosis failed:', error);
      const message = error instanceof Error ? error.message : '';
      setError(message || t('Failed to analyze image. Please try again.', 'Tatole kuda chithunzi. Yesaninso.'));
    } finally {
      setLoading(false);
    }
  };

  const analyzeImage = async (imageData: string): Promise<DiagnosisResult> => {
    const response = await fetch('/api/plant-diagnosis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: imageData }),
    });

    const data = await response.json().catch(() => null);
    if (!response.ok || !data || data.error) {
      throw new Error(data?.error || `Plant Doctor request failed (${response.status}).`);
    }
    return data as DiagnosisResult;
  };

  const clearImage = () => {
    setSelectedFile(null);
    setPreview(null);
    setResult(null);
    setError('');
    if (galleryInputRef.current) galleryInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 mb-4">
          <Leaf className="w-8 h-8 text-primary-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{t('Plant Doctor', 'Dokotala wa Zomera')}</h1>
        <p className="text-gray-500 mt-1">{t('Upload a photo of your crop for AI-powered diagnosis', 'Ikani chithunzi cha zomera zanu kuti AI idzale')}</p>
      </div>

      <div className="card p-6">
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
            preview
              ? 'border-primary-300 bg-primary-50'
              : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
          }`}
        >
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileSelect}
            className="hidden"
          />

          {preview ? (
            <div className="relative">
              <img
                src={preview}
                alt="Preview"
                className="max-h-64 mx-auto rounded-lg"
              />
              <button
                onClick={clearImage}
                className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => galleryInputRef.current?.click()}
              className="cursor-pointer"
            >
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <Camera className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-700 font-medium mb-1">
                {t('Take or upload a photo', 'Khalani chithunzi kapena ikani')}
              </p>
              <p className="text-sm text-gray-500">
                {t('Drag and drop or click to select', 'Kokani nawikani kapena dinani kusankha')}
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-3 justify-center mt-6">
          <button
            onClick={() => galleryInputRef.current?.click()}
            className="btn-secondary"
          >
            <Upload className="w-4 h-4" />
            {t('Gallery', 'Ma Gallery')}
          </button>
          <button
            onClick={() => cameraInputRef.current?.click()}
            className="btn-primary"
          >
            <Camera className="w-4 h-4" />
            {t('Camera', 'Kamera')}
          </button>
        </div>

        {error && (
          <div className="mt-4 bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        {selectedFile && !result && (
          <div className="mt-6">
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? (
                <>
                  <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                  {t('Analyzing...', 'Kukuda...')}
                </>
              ) : (
                <>
                  <Leaf className="w-5 h-5" />
                  {t('Diagnose Crop', 'Dzalani Zomera')}
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {result && (
        <div className="card p-6 space-y-6">
          <div className="flex items-start gap-4 p-4 rounded-lg bg-primary-50 border border-primary-100">
            <div className="p-2 rounded-lg bg-primary-100">
              <CheckCircle2 className="w-6 h-6 text-primary-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{result.issue}</h3>
              <p className="text-sm text-gray-600 mt-1">
                {t('Crop', 'Chomera')}: <span className="font-medium">{result.crop}</span>
                {result.disease && (
                  <span className="ml-2 badge bg-purple-100 text-purple-700">{t('Disease', 'Matenda')}</span>
                )}
                {result.pest && (
                  <span className="ml-2 badge bg-red-100 text-red-700">{t('Pest', 'Tizilombo')}</span>
                )}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded bg-gray-100">
                <AlertCircle className="w-4 h-4 text-gray-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">{t('Cause', 'Chifukwa')}</p>
                <p className="text-sm text-gray-600">{result.cause}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded bg-red-100">
                <Bug className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">{t('Symptoms', 'Zizindikiro')}</p>
                <p className="text-sm text-gray-600">{result.symptoms}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded bg-primary-100">
                <Shield className="w-4 h-4 text-primary-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">{t('Prevention', 'Chitetezo')}</p>
                <p className="text-sm text-gray-600">{result.prevention}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded bg-green-100">
                <Droplets className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">{t('Treatment', 'Thandizo')}</p>
                <p className="text-sm text-gray-600">{result.treatment}</p>
              </div>
            </div>

            {(result.pesticides || result.fungicides) && (
              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded bg-amber-100">
                  <Pill className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    {result.pesticides ? t('Recommended Pesticides', 'Mankhwala Ochipondwa') : t('Recommended Fungicides', 'Mankhwala a Matenda')}
                  </p>
                  <p className="text-sm text-gray-600">{result.pesticides || result.fungicides}</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
            {typeof result.confidence === 'number' && result.confidence > 0 && (
              <span className="badge bg-gray-100 text-gray-700">
                {t('Confidence', 'Kutsimikiza')}: {Math.round(result.confidence * 100)}%
              </span>
            )}
            {result.severity && result.severity !== 'unknown' && (
              <span className="badge bg-amber-50 text-amber-700">
                {t('Severity', 'Kukula kwa vuto')}: {result.severity}
              </span>
            )}
          </div>

          {result.disclaimer && (
            <p className="text-xs text-gray-500 border-t border-gray-100 pt-3">{result.disclaimer}</p>
          )}

          <button onClick={clearImage} className="btn-outline w-full">
            {t('Diagnose Another Plant', 'Dzalani Zomera Zina')}
          </button>
        </div>
      )}
    </div>
  );
}
