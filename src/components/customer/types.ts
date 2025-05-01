export interface CustomerData {
    name: string;
    hasCard: boolean;
    cardNumber: string;
    balance: number;
    points: number;
    cardStatus: string;
    createdAt: string;
    pointsToNextReward: number;
    recentTransactions: Transaction[];
    availableRewards: Reward[];
    expiringPoints: number;
    pointsExpirationDate?: Date | null;
    
  }
  
  export interface Transaction {
    id: string;
    date: string;
    amount: string;
    items: number;
    type: string;
    status: string;
    points: number;
  }
  
  export interface Reward {
    id: string;
    name: string;
    description?: string;
    points_required: number; // 👈 Add this
    quantity: number;
    image_url?: string | null;
    is_active?: boolean | null;
    created_at?: string | null;
  }
  