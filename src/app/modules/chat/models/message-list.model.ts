export interface ChatHistoryItem {
    id?:string,
    title: string;
    branches: number;
    status: 'active' | 'inactive';
    lastUpdated: string;
    branchesDetails: BranchDetail[];
    isOpen?: boolean;
  }
  
  export interface BranchDetail {
    name: string;
    timeAgo: string;
    color: string;
  }