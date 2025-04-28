export interface CustomerData {
    name: string;
    hasCard: boolean;
    cardNumber: string;
    balance: number;
    points: number;
    pointsToNextReward: number;
    recentTransactions: Transaction[];
    availableRewards: Reward[];
  }
  
  export interface Transaction {
    id: string;
    date: string;
    amount: string;
    items: number;
    type: string;
    status: string;
    pointsEarned: number;
  }
  
  export interface Reward {
    id: string;
    name: string;
    description: string;
    points: number;
    quantity: number;
  }