export interface Profile {
  id: string;
  full_name: string;
  email?: string;
  role?: string;
  created_at?: string;
}

export interface Card {
  id: string;
  uid: string;
  user_id: string;
  balance: number;
  points: number;
  status: string;
  created_at: string;
  profiles?: { full_name: string };
}

export interface Transaction {
  id: string;
  amount: number;
  points: number;
  points_expires_at?: string;
  item_count: number;
  type: string;
  status: string;
  created_at: string;
  card_id: string;
  cards: Card;
  user?: Profile | null;
  base_price: number;
  has_sizes: boolean;
  selected_size: string | null;
  category: string;
  is_add_on: boolean;
  price: number;
  reference_number: string;
  final_price?: number;
  temperature?: string | null;
}

export interface Member {
  id: string;
  full_name: string;
  email: string;
  created_at: string;
  card?: {
    user_id: string;
    uid: string;
    balance: number;
    points: number;
  } | null;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  points_required: number;
  is_active: boolean;
  image_url: string | null;
  created_at: string;
  quantity?: number;
}

export interface AdminStats {
  todaySales: number;
  activeMembers: number;
  cardsIssued: number;
  totalRedemptions: number;
}

export interface DailySales {
  date: string;
  amount: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  points_value: number;
  is_active: boolean;
  image_url: string | null;
  created_at: string;
  base_price: number;
  has_sizes: boolean;
  sizes: string[];
  category: string;
  is_add_on: boolean;
  temperature?: string;
}

 export interface SupabaseTransactionResponse {
  cards: {
    uid: string;
    user_id: string;
  }[];
}