import { ReactNode } from "react";

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
    type: ReactNode;
    id: string;
    amount: number;
    item_count: number;
    type: string;
    status: string;
    created_at: string;
    card_id: string;
    cards: Card;
    user?: Profile | null;
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
  }
  
  export interface AdminStats {
    todaySales: number;
    activeMembers: number;
    pointsRedeemed: number;
    cardsIssued: number;
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
  }

export interface EnhancedTransaction extends Transaction {
    card: Card;
    user: Profile | null;
  }