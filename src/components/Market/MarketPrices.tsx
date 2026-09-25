import React, { useEffect, useState } from 'react';
import { Link, MapPin, Plus, RefreshCw, Search, Upload, X } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { supabase } from '../../lib/supabase';
import { Crop, MarketplaceListing, MarketPrice } from '../../types';

const emptyListing = { title: '', description: '', category: 'Fresh produce', quantity: '', unit: 'kg', price: '', location: '', whatsapp_number: '' };

export default function MarketPrices() {
  const { user, t } = useApp();
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [form, setForm] = useState(emptyListing);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const fetchData = async () => {
    setLoading(true);
    const [pricesRes, cropsRes, listingsRes] = await Promise.all([
      supabase.from('market_prices').select('*').order('crop_name'),
      supabase.from('crops').select('*'),
      // Keep this query independent of the optional users foreign-key relationship.
      supabase.from('marketplace_listings').select('*').eq('is_active', true).order('created_at', { ascending: false }),
    ]);
    if (pricesRes.data) setPrices(pricesRes.data);
    if (cropsRes.data) setCrops(cropsRes.data);
    if (listingsRes.error) {
      setMessage(listingsRes.error.message);
    } else if (listingsRes.data) {
      setListings(listingsRes.data as MarketplaceListing[]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const updateForm = (key: keyof typeof emptyListing, value: string) => setForm(current => ({ ...current, [key]: value }));

  const selectImage = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { setMessage(t('Please choose an image file.', 'Sankhani chithunzi.')); return; }
    if (file.size > 5 * 1024 * 1024) { setMessage(t('Image must be smaller than 5 MB.', 'Chithunzi chikhale chochepera 5 MB.')); return; }
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
    setMessage('');
  };

  const submitListing = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) { setMessage(t('Please sign in before adding a listing.', 'Lowani kaye musanayike malonda.')); return; }
    const title = form.title.trim();
    const whatsapp = form.whatsapp_number.trim();
    const quantity = form.quantity ? Number(form.quantity) : null;
    const price = form.price ? Number(form.price) : null;
    if (!title || !whatsapp) { setMessage(t('Add a product name and WhatsApp number.', 'Lembani dzina la zokolola ndi nambala ya WhatsApp.')); return; }
    if ((quantity !== null && (!Number.isFinite(quantity) || quantity < 0)) || (price !== null && (!Number.isFinite(price) || price < 0))) {
      setMessage(t('Quantity and price must be valid positive numbers.', 'Kuchuluka ndi mtengo ziyenera kukhala manambala oyenera.'));
      return;
    }
    setSaving(true); setMessage('');
    try {
      let imageUrl: string | null = null;
      if (image) {
        const extension = image.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
        const objectPath = `marketplace/${user.id}/${crypto.randomUUID()}.${extension}`;
        const upload = await supabase.storage.from('marketplace-images').upload(objectPath, image, { contentType: image.type, upsert: false });
        if (upload.error) {
          console.warn('Image upload failed:', upload.error.message);
        } else {
          const signed = await supabase.storage.from('marketplace-images').createSignedUrl(objectPath, 60 * 60 * 24 * 365 * 5);
          imageUrl = signed.data?.signedUrl ?? null;
        }
      }

      const { error } = await supabase.from('marketplace_listings').insert({
        seller_id: user.id, title, description: form.description.trim() || null, category: form.category,
        quantity, unit: form.unit.trim() || 'kg', price,
        location: form.location.trim() || user.district || null, whatsapp_number: whatsapp, image_url: imageUrl, is_active: true,
      });
      if (error) {
        if (error.code === '23503') throw new Error(t('Your account was not found. Please sign out, register again, and then publish your listing.', 'Akaunti yanu sinapezeke. Tulukani, lembetsani kachiwiri, kenako ikani malonda anu.'));
        throw new Error(`Listing could not be saved: ${error.message}`);
      }
      setForm(emptyListing); setImage(null); setImagePreview(''); setShowForm(false); setMessage(t('Your listing is live.', 'Malonda anu ali pa msika.')); await fetchData();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : t('Could not publish listing. Please try again.', 'Zalephera kuyika malonda.'));
    } finally { setSaving(false); }
  };

  const filteredListings = listings.filter(item => `${item.title} ${item.category} ${item.location || ''}`.toLowerCase().includes(search.toLowerCase()));
  const whatsappUrl = (number: string) => `https://wa.me/${number.replace(/[^0-9]/g, '')}`;

  return <main className="space-y-6 p-4 md:p-6">
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div><h1 className="text-2xl font-bold text-gray-900">{t('Marketplace', 'Msika')}</h1><p className="mt-1 text-gray-500">{t('Buy fresh produce directly from local farmers.', 'Gulani zokolola kwa alimi amderalo.')}</p></div>
      <button className="btn-primary flex items-center justify-center gap-2" onClick={() => setShowForm(true)}><Plus className="h-4 w-4" />{t('Sell produce', 'Gulitsa zokolola')}</button>
    </header>

    {message && <div className="rounded-lg border border-primary-100 bg-primary-50 p-3 text-sm text-primary-800" role="status">{message}</div>}
    <div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" /><input className="input w-full pl-9" value={search} onChange={event => setSearch(event.target.value)} placeholder={t('Search produce, location or category', 'Sakani zokolola kapena malo')} /></div>

    <section aria-labelledby="listings-heading"><div className="mb-4 flex items-center justify-between"><h2 id="listings-heading" className="text-lg font-semibold text-gray-900">{t('Available produce', 'Zokolola zomwe zilipo')}</h2><button onClick={fetchData} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100" aria-label={t('Refresh listings', 'Tsitsani malonda')}><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /></button></div>
      {loading ? <div className="flex justify-center py-10"><RefreshCw className="h-7 w-7 animate-spin text-primary-600" /></div> : filteredListings.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{filteredListings.map(item => <article className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm" key={item.id}>{item.image_url ? <img src={item.image_url} alt={item.title} className="h-44 w-full object-cover" /> : <div className="flex h-44 items-center justify-center bg-primary-50 text-sm text-primary-700">{t('No image added', 'Palibe chithunzi')}</div>}<div className="space-y-3 p-4"><div><span className="text-xs font-medium uppercase tracking-wide text-primary-600">{item.category}</span><h3 className="mt-1 text-lg font-semibold text-gray-900">{item.title}</h3><p className="mt-1 line-clamp-2 text-sm text-gray-600">{item.description || t('Fresh produce from a local farmer.', 'Zokolola zatsopano za mlimi waderalo.')}</p></div><div className="flex flex-wrap gap-3 text-xs text-gray-500">{item.location && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{item.location}</span>}{item.quantity && <span>{item.quantity} {item.unit}</span>}</div><div className="flex items-center justify-between border-t pt-3"><strong className="text-primary-700">{item.price ? `MK ${item.price.toLocaleString()}` : t('Price on request', 'Funsani mtengo')}</strong><a className="flex items-center gap-1 rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700" href={whatsappUrl(item.whatsapp_number)} target="_blank" rel="noreferrer"><Link className="h-4 w-4" />WhatsApp</a></div></div></article>)}</div> : <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center text-sm text-gray-500">{t('No produce listings yet. Be the first farmer to sell here.', 'Palibe malonda. Khalani woyamba kuyika zokolola.')}</div>}
    </section>

    {showForm && <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 p-4" role="dialog" aria-modal="true" aria-labelledby="listing-title"><div className="mx-auto my-6 max-w-xl rounded-2xl bg-white p-5 shadow-xl"><div className="mb-5 flex items-center justify-between"><h2 id="listing-title" className="text-xl font-bold text-gray-900">{t('Add produce listing', 'Ikani zokolola')}</h2><button onClick={() => setShowForm(false)} aria-label={t('Close', 'Tsekani')}><X className="h-5 w-5" /></button></div><form onSubmit={submitListing} className="space-y-4"><input required className="input w-full" value={form.title} onChange={event => updateForm('title', event.target.value)} placeholder={t('What are you selling?', 'Mukugulitsa chiyani?')} /><textarea className="input min-h-20 w-full" value={form.description} onChange={event => updateForm('description', event.target.value)} placeholder={t('Describe quality, harvest date or delivery details', 'Fotokozani zokolola zanu')} /><div className="grid grid-cols-2 gap-3"><select className="input" value={form.category} onChange={event => updateForm('category', event.target.value)}><option>Fresh produce</option><option>Grains</option><option>Livestock</option><option>Processed food</option><option>Other</option></select><input className="input" value={form.location} onChange={event => updateForm('location', event.target.value)} placeholder={t('Location', 'Malo')} /></div><div className="grid grid-cols-2 gap-3"><input type="number" min="0" className="input" value={form.quantity} onChange={event => updateForm('quantity', event.target.value)} placeholder={t('Quantity', 'Kuchuluka')} /><input className="input" value={form.unit} onChange={event => updateForm('unit', event.target.value)} placeholder="kg, bags, crates" /></div><div className="grid grid-cols-2 gap-3"><input type="number" min="0" className="input" value={form.price} onChange={event => updateForm('price', event.target.value)} placeholder={t('Price (MK)', 'Mtengo (MK)')} /><input required type="tel" className="input" value={form.whatsapp_number} onChange={event => updateForm('whatsapp_number', event.target.value)} placeholder="WhatsApp number" /></div><label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-gray-300 p-4 text-sm text-gray-600"><Upload className="h-5 w-5 text-primary-600" /><span>{image ? image.name : t('Upload a product image (max 5 MB)', 'Ikani chithunzi cha zokolola')}</span><input type="file" accept="image/*" className="sr-only" onChange={event => selectImage(event.target.files?.[0])} /></label>{imagePreview && <img src={imagePreview} alt={t('Selected product preview', 'Chithunzi chosankhidwa')} className="h-36 w-full rounded-lg object-cover" />}<button disabled={saving} className="btn-primary w-full" type="submit">{saving ? t('Publishing...', 'Ikuyika...') : t('Publish listing', 'Ikani malonda')}</button></form></div></div>}
  </main>;
}
