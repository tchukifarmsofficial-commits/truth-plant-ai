import React, { useEffect, useMemo, useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { supabase } from '../../lib/supabase';
import {
  AlertTriangle, BookOpen, Check, ChevronRight, Edit3, Megaphone, Plus,
  Save, Search, Send, Shield, ShoppingBag, Trash2, Users, X, MessageSquare,
} from 'lucide-react';
import { CommunityPost, Lesson, MarketPrice, User as UserType } from '../../types';

const LESSON_CATEGORIES = ['Crop Production', 'Livestock', 'Irrigation', 'Agribusiness', 'Climate Smart Agriculture', 'Farm Technology'];

type Section = 'overview' | 'farmers' | 'marketplace' | 'lessons' | 'community' | 'announcements';
type Editor = { type: 'marketplace' | 'lesson'; id?: string } | null;

export default function AdminPanel() {
  const { user, t } = useApp();
  const [section, setSection] = useState<Section>('overview');
  const [loading, setLoading] = useState(true);
  const [pendingFarmers, setPendingFarmers] = useState<UserType[]>([]);
  const [allFarmers, setAllFarmers] = useState<UserType[]>([]);
  const [marketPrices, setMarketPrices] = useState<MarketPrice[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [search, setSearch] = useState('');
  const [editor, setEditor] = useState<Editor>(null);
  const [saving, setSaving] = useState(false);
  const [announcement, setAnnouncement] = useState({ title: '', message: '' });

  const emptyMarket = { crop_name: '', market_name: '', buying_price: '', selling_price: '', unit: '50 kg bag' };
  const emptyLesson = { title: '', category: LESSON_CATEGORIES[0], content: '', video_url: '' };
  const [marketForm, setMarketForm] = useState(emptyMarket);
  const [lessonForm, setLessonForm] = useState(emptyLesson);

  const fetchData = async () => {
    setLoading(true);
    const [farmers, markets, lessonData, postData] = await Promise.all([
      supabase.from('users').select('*').eq('role', 'farmer').order('created_at', { ascending: false }),
      supabase.from('market_prices').select('*').order('updated_at', { ascending: false }),
      supabase.from('lessons').select('*').order('created_at', { ascending: false }),
      supabase.from('community_posts').select('*, user:users(*)').order('created_at', { ascending: false }),
    ]);
    const farmerRows = (farmers.data || []) as UserType[];
    setAllFarmers(farmerRows);
    setPendingFarmers(farmerRows.filter((farmer) => farmer.status === 'pending'));
    setMarketPrices((markets.data || []) as MarketPrice[]);
    setLessons((lessonData.data || []) as Lesson[]);
    setPosts((postData.data || []) as CommunityPost[]);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const stats = useMemo(() => ({
    pending: pendingFarmers.length,
    farmers: allFarmers.length,
    markets: marketPrices.length,
    lessons: lessons.length,
    posts: posts.length,
  }), [pendingFarmers, allFarmers, marketPrices, lessons, posts]);

  const notify = (message: string) => window.alert(message);

  const updateFarmer = async (id: string, status: 'approved' | 'rejected' | 'suspended') => {
    const { error } = await supabase.from('users').update({ status, is_approved: status === 'approved' }).eq('id', id);
    if (!error) fetchData(); else notify(error.message);
  };

  const deleteRecord = async (table: string, id: string) => {
    if (!window.confirm(t('Delete this item permanently?', 'Muchotse chinthu ichi kwamuyaya?'))) return;
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) notify(error.message); else fetchData();
  };

  const openEditor = (type: 'marketplace' | 'lesson', id?: string) => {
    setEditor({ type, id });
    if (type === 'marketplace') {
      const row = marketPrices.find((item) => item.id === id);
      setMarketForm(row ? { crop_name: row.crop_name, market_name: row.market_name, buying_price: String(row.buying_price ?? ''), selling_price: String(row.selling_price ?? ''), unit: row.unit } : emptyMarket);
    } else {
      const row = lessons.find((item) => item.id === id);
      setLessonForm(row ? { title: row.title, category: row.category, content: row.content || '', video_url: row.video_url || '' } : emptyLesson);
    }
  };

  const saveEditor = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editor) return;
    setSaving(true);
    const payload = editor.type === 'marketplace'
      ? { crop_name: marketForm.crop_name, market_name: marketForm.market_name, buying_price: Number(marketForm.buying_price), selling_price: Number(marketForm.selling_price), unit: marketForm.unit, updated_at: new Date().toISOString() }
      : { title: lessonForm.title, category: lessonForm.category, content: lessonForm.content, video_url: lessonForm.video_url || null, created_by: user?.id };
    const query = editor.id ? supabase.from(editor.type === 'marketplace' ? 'market_prices' : 'lessons').update(payload as any).eq('id', editor.id) : supabase.from(editor.type === 'marketplace' ? 'market_prices' : 'lessons').insert(payload as any);
    const { error } = await query;
    setSaving(false);
    if (error) notify(error.message); else { setEditor(null); fetchData(); }
  };

  const sendAnnouncement = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) return;

    const { error: announcementError } = await supabase
      .from('admin_announcements')
      .insert({ ...announcement, created_by: user.id });
    if (announcementError) {
      notify(announcementError.message);
      return;
    }

    const recipients = allFarmers.map((farmer) => ({
      user_id: farmer.id,
      type: 'announcement',
      title: announcement.title,
      title_chichewa: null,
      message: announcement.message,
      message_chichewa: null,
      is_read: false,
    }));

    if (recipients.length > 0) {
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert(recipients);
      if (notificationError) {
        notify(`Announcement saved, but notifications could not be delivered: ${notificationError.message}`);
        return;
      }
    }

    setAnnouncement({ title: '', message: '' });
    notify(t('Announcement sent to all farmers.', 'Uthenge watumizidwa kwa alimi onse.'));
  };

  if (user?.role !== 'admin') return <div className="p-8 text-center"><Shield className="mx-auto mb-3 h-12 w-12 text-gray-300" /><p className="text-gray-500">{t('Access denied', 'Mwayenera kutalikani')}</p></div>;

  const nav = [
    { id: 'overview' as Section, label: t('Overview', 'Chidule'), icon: Shield },
    { id: 'farmers' as Section, label: t('Farmers', 'Olima'), icon: Users },
    { id: 'marketplace' as Section, label: t('Marketplace', 'Msika'), icon: ShoppingBag },
    { id: 'lessons' as Section, label: t('Lessons', 'Maphunziro'), icon: BookOpen },
    { id: 'community' as Section, label: t('Community', 'Gulu'), icon: MessageSquare },
    { id: 'announcements' as Section, label: t('Announcements', 'Uthenga'), icon: Megaphone },
  ];
  const filteredMarkets = marketPrices.filter((item) => `${item.crop_name} ${item.market_name}`.toLowerCase().includes(search.toLowerCase()));
  const filteredLessons = lessons.filter((item) => item.title.toLowerCase().includes(search.toLowerCase()));

  return <div className="p-4 md:p-6 space-y-6">
    <header className="flex flex-col gap-1"><div className="flex items-center gap-3"><div className="rounded-xl bg-earth-100 p-3"><Shield className="h-6 w-6 text-earth-600" /></div><div><h1 className="text-2xl font-bold text-gray-900">{t('Admin Panel', 'Malo a Admin')}</h1><p className="text-gray-500">{t('Manage every feature from one place', 'Yendetsani mbali zonse pamalo amodzi')}</p></div></div></header>
    <nav className="flex gap-2 overflow-x-auto border-b border-gray-200 pb-3">{nav.map((item) => <button key={item.id} onClick={() => { setSection(item.id); setSearch(''); }} className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${section === item.id ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}><item.icon className="h-4 w-4" />{item.label}</button>)}</nav>

    {section === 'overview' && <><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{[
      ['Pending approvals', stats.pending, AlertTriangle, 'text-amber-600'], ['Farmers', stats.farmers, Users, 'text-green-600'], ['Marketplace items', stats.markets, ShoppingBag, 'text-blue-600'], ['Lessons', stats.lessons, BookOpen, 'text-purple-600'], ['Community posts', stats.posts, MessageSquare, 'text-pink-600'],
    ].map(([label, value, Icon, color]: any) => <div className="card p-4" key={String(label)}><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500">{label}</p><p className={`mt-1 text-2xl font-bold ${color}`}>{value}</p></div><Icon className={`h-6 w-6 ${color}`} /></div></div>)}</div><div className="card p-5"><h2 className="mb-4 font-semibold text-gray-900">{t('Quick management', 'Kuwongolera mwachangu')}</h2><div className="grid gap-3 sm:grid-cols-3"><button onClick={() => openEditor('marketplace')} className="btn-primary"><Plus className="h-4 w-4" />Add marketplace item</button><button onClick={() => openEditor('lesson')} className="btn-secondary"><Plus className="h-4 w-4" />Create lesson</button><button onClick={() => setSection('community')} className="btn-secondary"><MessageSquare className="h-4 w-4" />Moderate community</button></div></div></>}

    {section === 'farmers' && <div className="space-y-4"><h2 className="font-semibold">{t('User and farmer management', 'Kuwongolera ogwiritsa ntchito')}</h2>{allFarmers.map((farmer) => <div className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between" key={farmer.id}><div><p className="font-medium">{farmer.full_name}</p><p className="text-sm text-gray-500">{farmer.phone || farmer.email} · {farmer.district || '—'}</p></div><div className="flex items-center gap-2"><span className="badge">{farmer.status}</span>{farmer.status === 'pending' && <><button onClick={() => updateFarmer(farmer.id, 'approved')} className="btn-primary text-sm"><Check className="h-4 w-4" />Approve</button><button onClick={() => updateFarmer(farmer.id, 'rejected')} className="btn-danger text-sm"><X className="h-4 w-4" />Reject</button></>}{farmer.status === 'approved' && <button onClick={() => updateFarmer(farmer.id, 'suspended')} className="btn-danger text-sm">Suspend</button>}</div></div>)}</div>}

    {(section === 'marketplace' || section === 'lessons') && <div className="space-y-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-semibold">{section === 'marketplace' ? 'Marketplace management' : 'Lesson management'}</h2><p className="text-sm text-gray-500">Edit or delete content shown to farmers.</p></div><button onClick={() => openEditor(section === 'marketplace' ? 'marketplace' : 'lesson')} className="btn-primary"><Plus className="h-4 w-4" />Add new</button></div><div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" /><input className="input pl-9" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search content..." /></div><div className="space-y-3">{(section === 'marketplace' ? filteredMarkets : filteredLessons).map((item) => <div className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between" key={item.id}><div className="min-w-0">{section === 'marketplace' ? <><p className="font-semibold">{(item as MarketPrice).crop_name}</p><p className="text-sm text-gray-500">{(item as MarketPrice).market_name} · Buy {(item as MarketPrice).buying_price ?? '—'} · Sell {(item as MarketPrice).selling_price ?? '—'} per {(item as MarketPrice).unit}</p></> : <><p className="font-semibold">{(item as Lesson).title}</p><p className="text-sm text-gray-500">{(item as Lesson).category}</p></>}</div><div className="flex shrink-0 gap-2"><button onClick={() => openEditor(section === 'marketplace' ? 'marketplace' : 'lesson', item.id)} className="btn-secondary text-sm"><Edit3 className="h-4 w-4" />Edit</button><button onClick={() => deleteRecord(section === 'marketplace' ? 'market_prices' : 'lessons', item.id)} className="btn-danger text-sm"><Trash2 className="h-4 w-4" />Delete</button></div></div>)}{!loading && (section === 'marketplace' ? filteredMarkets : filteredLessons).length === 0 && <div className="card p-8 text-center text-gray-500">No content found.</div>}</div></div>}

    {section === 'community' && <div className="space-y-4"><div><h2 className="font-semibold">Community moderation</h2><p className="text-sm text-gray-500">Review and remove posts that do not belong in the community.</p></div>{posts.map((post) => <div className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between" key={post.id}><div><p className="text-sm text-gray-500">{post.user?.full_name || 'Community member'} · {new Date(post.created_at).toLocaleDateString()}</p><p className="mt-1 text-gray-800">{post.content}</p><p className="mt-2 text-xs text-gray-400">{post.likes_count} likes</p></div><button onClick={() => deleteRecord('community_posts', post.id)} className="btn-danger shrink-0 text-sm"><Trash2 className="h-4 w-4" />Delete</button></div>)}{!posts.length && <div className="card p-8 text-center text-gray-500">No community posts found.</div>}</div>}

    {section === 'announcements' && <form onSubmit={sendAnnouncement} className="card max-w-2xl space-y-4 p-5"><h2 className="font-semibold">Send announcement to all farmers</h2><input className="input" required placeholder="Title" value={announcement.title} onChange={(event) => setAnnouncement({ ...announcement, title: event.target.value })} /><textarea className="input min-h-32" required placeholder="Message" value={announcement.message} onChange={(event) => setAnnouncement({ ...announcement, message: event.target.value })} /><button className="btn-primary w-full"><Send className="h-4 w-4" />Send announcement</button></form>}

    {editor && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"><form onSubmit={saveEditor} className="card max-h-[90vh] w-full max-w-lg space-y-4 overflow-y-auto p-6"><div className="flex items-center justify-between"><h2 className="text-lg font-semibold">{editor.id ? 'Edit' : 'Add'} {editor.type === 'marketplace' ? 'marketplace item' : 'lesson'}</h2><button type="button" onClick={() => setEditor(null)}><X className="h-5 w-5" /></button></div>{editor.type === 'marketplace' ? <><input className="input" required placeholder="Crop name" value={marketForm.crop_name} onChange={(event) => setMarketForm({ ...marketForm, crop_name: event.target.value })} /><input className="input" required placeholder="Market name" value={marketForm.market_name} onChange={(event) => setMarketForm({ ...marketForm, market_name: event.target.value })} /><div className="grid grid-cols-2 gap-3"><input className="input" type="number" required placeholder="Buying price" value={marketForm.buying_price} onChange={(event) => setMarketForm({ ...marketForm, buying_price: event.target.value })} /><input className="input" type="number" required placeholder="Selling price" value={marketForm.selling_price} onChange={(event) => setMarketForm({ ...marketForm, selling_price: event.target.value })} /></div><input className="input" required placeholder="Unit" value={marketForm.unit} onChange={(event) => setMarketForm({ ...marketForm, unit: event.target.value })} /></> : <><input className="input" required placeholder="Lesson title" value={lessonForm.title} onChange={(event) => setLessonForm({ ...lessonForm, title: event.target.value })} /><select className="input" value={lessonForm.category} onChange={(event) => setLessonForm({ ...lessonForm, category: event.target.value })}>{LESSON_CATEGORIES.map((category) => <option key={category}>{category}</option>)}</select><textarea className="input min-h-40" required placeholder="Lesson content" value={lessonForm.content} onChange={(event) => setLessonForm({ ...lessonForm, content: event.target.value })} /><input className="input" type="url" placeholder="Video URL (optional)" value={lessonForm.video_url} onChange={(event) => setLessonForm({ ...lessonForm, video_url: event.target.value })} /></>}<div className="flex gap-3"><button type="button" className="btn-secondary flex-1" onClick={() => setEditor(null)}>Cancel</button><button className="btn-primary flex-1" disabled={saving}><Save className="h-4 w-4" />{saving ? 'Saving...' : 'Save changes'}</button></div></form></div>}
  </div>;
}
