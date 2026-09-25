export type UserRole = 'farmer' | 'admin';
export type UserStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export interface User {
  id: string;
  phone: string | null;
  email: string | null;
  full_name: string;
  role: UserRole;
  district: string | null;
  is_approved: boolean;
  status: UserStatus;
  created_at: string;
  updated_at: string;
}

export interface Crop {
  id: string;
  name: string;
  name_chichewa: string | null;
  category: string | null;
  description: string | null;
  image_url: string | null;
  created_at: string;
}

export interface Pest {
  id: string;
  name: string;
  name_chichewa: string | null;
  crops: string[];
  symptoms: string | null;
  control_chemical: string | null;
  control_organic: string | null;
  image_url: string | null;
  created_at: string;
}

export interface Disease {
  id: string;
  name: string;
  name_chichewa: string | null;
  crops: string[];
  cause: string | null;
  symptoms: string | null;
  prevention: string | null;
  treatment: string | null;
  recommended_pesticides: string | null;
  recommended_fungicides: string | null;
  image_url: string | null;
  created_at: string;
}

export interface MarketPrice {
  id: string;
  crop_id: string | null;
  crop_name: string;
  market_name: string;
  buying_price: number | null;
  selling_price: number | null;
  unit: string;
  updated_at: string;
  created_at: string;
}

export interface MarketplaceListing {
  id: string;
  seller_id: string;
  title: string;
  description: string | null;
  category: string;
  quantity: number | null;
  unit: string;
  price: number | null;
  location: string | null;
  whatsapp_number: string;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  seller?: Pick<User, 'full_name' | 'phone'>;
}

export interface WeatherAlert {
  id: string;
  alert_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  message_chichewa: string | null;
  district: string | null;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Lesson {
  id: string;
  title: string;
  title_chichewa: string | null;
  category: 'Crop Production' | 'Livestock' | 'Irrigation' | 'Agribusiness' | 'Climate Smart Agriculture' | 'Farm Technology';
  content: string | null;
  content_chichewa: string | null;
  image_url: string | null;
  video_url: string | null;
  document_url: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CommunityPost {
  id: string;
  user_id: string;
  content: string;
  image_url: string | null;
  likes_count: number;
  created_at: string;
  updated_at: string;
  user?: User;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user?: User;
}

export interface FarmRecord {
  id: string;
  user_id: string;
  farm_name: string;
  crop_id: string | null;
  crop_name: string | null;
  area_planted: number | null;
  area_unit: string;
  planting_date: string | null;
  expected_harvest_date: string | null;
  actual_harvest_date: string | null;
  expenses: number;
  income: number;
  yield_amount: number | null;
  yield_unit: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  title_chichewa: string | null;
  message: string;
  message_chichewa: string | null;
  is_read: boolean;
  created_at: string;
}

export interface AdminAnnouncement {
  id: string;
  title: string;
  title_chichewa: string | null;
  message: string;
  message_chichewa: string | null;
  created_by: string | null;
  is_active: boolean;
  created_at: string;
}

export type Language = 'en' | 'ny';

export interface AppContextType {
  user: User | null;
  language: Language;
  setUser: (user: User | null) => void;
  setLanguage: (lang: Language) => void;
  t: (en: string, ny: string) => string;
  logout: () => void;
}
