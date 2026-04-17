// Demo accounts for testing the platform

export type UserRole = "influencer" | "company" | "admin";

export interface DemoUser {
  id: string;
  email: string;
  password: string;
  role: UserRole;
  name: string;
  avatar: string;
  avatarColor: string;
  bio?: string;
}

export const demoAccounts: DemoUser[] = [
  // Influencers
  {
    id: "inf-1",
    email: "sarah@demo.com",
    password: "demo123",
    role: "influencer",
    name: "Sarah Chen",
    avatar: "SC",
    avatarColor: "from-pink-400 to-rose-500",
    bio: "Fashion enthusiast sharing affordable style tips"
  },
  {
    id: "inf-2",
    email: "mike@demo.com",
    password: "demo123",
    role: "influencer",
    name: "Mike Chen",
    avatar: "MC",
    avatarColor: "from-blue-400 to-cyan-500",
    bio: "Tech reviewer and gaming content creator"
  },
  {
    id: "inf-3",
    email: "emma@demo.com",
    password: "demo123",
    role: "influencer",
    name: "Emma Davis",
    avatar: "ED",
    avatarColor: "from-orange-400 to-amber-500",
    bio: "Quick, healthy recipes for busy people"
  },
  // Companies
  {
    id: "comp-1",
    email: "glow@demo.com",
    password: "demo123",
    role: "company",
    name: "Glow Skincare",
    avatar: "GS",
    avatarColor: "from-green-400 to-emerald-500",
    bio: "Sustainable skincare brand"
  },
  {
    id: "comp-2",
    email: "techmaster@demo.com",
    password: "demo123",
    role: "company",
    name: "TechMaster Pro",
    avatar: "TM",
    avatarColor: "from-violet-400 to-purple-500",
    bio: "Premium tech accessories"
  },
  // Admin
  {
    id: "admin-1",
    email: "admin@lumiai.com",
    password: "admin123",
    role: "admin",
    name: "Admin User",
    avatar: "AD",
    avatarColor: "from-red-400 to-red-600",
    bio: "Platform Administrator"
  }
];

// Storage key for localStorage
const STORAGE_KEY = "lumiai_current_user";

// Auth functions
export const auth = {
  login: (email: string, password: string): DemoUser | null => {
    const user = demoAccounts.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      return user;
    }
    return null;
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEY);
  },

  getCurrentUser: (): DemoUser | null => {
    if (typeof window === "undefined") return null;
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  },

  isAdmin: (): boolean => {
    const user = auth.getCurrentUser();
    return user?.role === "admin";
  },

  isInfluencer: (): boolean => {
    const user = auth.getCurrentUser();
    return user?.role === "influencer";
  },

  isCompany: (): boolean => {
    const user = auth.getCurrentUser();
    return user?.role === "company";
  },

  isAuthenticated: (): boolean => {
    return auth.getCurrentUser() !== null;
  },

  isCreator: (): boolean => {
    const user = auth.getCurrentUser();
    return user?.role === "influencer";
  },

  isBrand: (): boolean => {
    const user = auth.getCurrentUser();
    return user?.role === "company";
  }
};
