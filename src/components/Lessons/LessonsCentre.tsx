import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { supabase } from '../../lib/supabase';
import {
  BookOpen, Video, FileText, ChevronRight, Search,
  Plus, X, Upload
} from 'lucide-react';
import { Lesson } from '../../types';

const CATEGORIES = [
  'Crop Production',
  'Livestock',
  'Irrigation',
  'Agribusiness',
  'Climate Smart Agriculture',
  'Farm Technology',
];

export default function LessonCentre() {
  const { user, t, language } = useApp();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newLesson, setNewLesson] = useState({
    title: '',
    category: 'Crop Production',
    content: '',
    video_url: '',
  });

  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('lessons')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setLessons(data);
    setLoading(false);
  };

  const filteredLessons = lessons.filter(lesson => {
    const matchesCategory = !selectedCategory || lesson.category === selectedCategory;
    const matchesSearch = !search ||
      lesson.title.toLowerCase().includes(search.toLowerCase()) ||
      lesson.content?.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLesson.title || !newLesson.content || !user) return;

    await supabase.from('lessons').insert({
      title: newLesson.title,
      category: newLesson.category,
      content: newLesson.content,
      video_url: newLesson.video_url || null,
      created_by: user.id,
    });

    setNewLesson({ title: '', category: 'Crop Production', content: '', video_url: '' });
    setShowAddModal(false);
    fetchLessons();
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Crop Production': return '🌱';
      case 'Livestock': return '🐄';
      case 'Irrigation': return '💧';
      case 'Agribusiness': return '📈';
      case 'Climate Smart Agriculture': return '🌍';
      case 'Farm Technology': return '🚜';
      default: return '📚';
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('Lesson Centre', 'Malo a Phunziro')}</h1>
          <p className="text-gray-500 mt-1">{t('Learn farming tips and techniques', 'Phunzirani malangizo olimira')}</p>
        </div>
        {user?.role === 'admin' && (
          <button onClick={() => setShowAddModal(true)} className="btn-primary">
            <Plus className="w-4 h-4" />
            {t('Add Lesson', 'Onjezani Phunziro')}
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('Search lessons...', 'Fufuzani mapunziro...')}
            className="input pl-10"
          />
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`btn flex-shrink-0 ${!selectedCategory ? 'btn-primary' : 'btn-secondary'}`}
        >
          {t('All', 'Onse')}
        </button>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`btn flex-shrink-0 ${selectedCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
          >
            {getCategoryIcon(cat)} {t(cat, cat)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 mx-auto text-gray-300 animate-pulse" />
        </div>
      ) : filteredLessons.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredLessons.map(lesson => (
            <div key={lesson.id} className="card-hover p-5">
              <div className="flex items-start gap-3 mb-3">
                <span className="text-2xl">{getCategoryIcon(lesson.category)}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {language === 'ny' && lesson.title_chichewa ? lesson.title_chichewa : lesson.title}
                  </h3>
                  <p className="text-xs text-gray-500">{lesson.category}</p>
                </div>
              </div>

              <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                {language === 'ny' && lesson.content_chichewa ? lesson.content_chichewa : lesson.content}
              </p>

              <div className="flex items-center gap-3 text-xs text-gray-500">
                {lesson.video_url && (
                  <span className="flex items-center gap-1">
                    <Video className="w-3 h-3" />
                    {t('Video', 'Videwo')}
                  </span>
                )}
                {lesson.document_url && (
                  <span className="flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    {t('Document', 'Chikalata')}
                  </span>
                )}
              </div>

              <button className="w-full mt-3 btn-secondary text-sm">
                {t('Read More', 'Werengani')} <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">{t('No lessons found', 'Palibe mapunziro')}</p>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">{t('Add New Lesson', 'Onjezani Phunziro')}</h2>
                <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-gray-100 rounded">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddLesson} className="space-y-4">
                <div>
                  <label className="label">{t('Title', 'Mutu')}</label>
                  <input
                    type="text"
                    value={newLesson.title}
                    onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label className="label">{t('Category', 'Gulu')}</label>
                  <select
                    value={newLesson.category}
                    onChange={(e) => setNewLesson({ ...newLesson, category: e.target.value })}
                    className="input"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">{t('Content', 'Zaziphunziro')}</label>
                  <textarea
                    value={newLesson.content}
                    onChange={(e) => setNewLesson({ ...newLesson, content: e.target.value })}
                    className="input min-h-40"
                    required
                  />
                </div>

                <div>
                  <label className="label">{t('Video URL (optional)', 'URL ya Videwo (osakam')}'</label>
                  <input
                    type="url"
                    value={newLesson.video_url}
                    onChange={(e) => setNewLesson({ ...newLesson, video_url: e.target.value })}
                    className="input"
                    placeholder="https://..."
                  />
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary flex-1">
                    {t('Cancel', 'Chotsani')}
                  </button>
                  <button type="submit" className="btn-primary flex-1">
                    <Upload className="w-4 h-4" />
                    {t('Add Lesson', 'Onjezani')}
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
