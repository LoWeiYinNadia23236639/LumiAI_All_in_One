export type CampaignType = "paid" | "barter" | "affiliate" | "ambassador";

export type PaymentKind = "campaign_fee" | "retainer" | "commission" | "barter_value";

export interface PaymentRow {
  id: string;
  campaign_id: string;
  creator_id: string;
  amount: number;
  kind: PaymentKind;
  status: "pending" | "paid" | "confirmed";
  paid_at: string | null;
  confirmed_at: string | null;
  note: string | null;
  created_at: string;
}

export const CAMPAIGN_TYPES: CampaignType[] = [
  "paid",
  "barter",
  "affiliate",
  "ambassador",
];

export interface CampaignRow {
  id: string;
  brand_id: string;
  title: string;
  description: string | null;
  budget: number;
  status: string;
  created_at: string;
  campaign_type: CampaignType;
  requirements: string | null;
  deliverables: string | null;
  deadline: string | null;
  niche: string | null;
  product_name: string | null;
  product_value: number;
  commission_rate: number | null;
  discount_code: string | null;
  shop_url: string | null;
  contract_months: number | null;
  retainer_fee: number | null;
  exclusivity: boolean;
  starts_on: string | null;
  ends_on: string | null;
  terms: string | null;
  usage_rights_months: number;
  review_rounds: number;
}

export interface ApplicationRow {
  id: string;
  campaign_id: string;
  creator_id: string;
  status: string;
  message: string | null;
  created_at: string;
  offer: boolean;
  offered_price: number | null;
  shipping_address: string | null;
  tracking_number: string | null;
  shipping_status: string;
}

export interface PlatformLink {
  name: string;
  url: string;
  followers: number;
}

export interface CreatorProfile {
  id: string;
  role: string;
  name: string;
  follower_count: number;
  niche: string;
  is_admin: boolean;
  created_at: string;
  bio: string | null;
  avatar_url: string | null;
  location: string | null;
  rate_min: number | null;
  rate_max: number | null;
  platforms: PlatformLink[];
  portfolio_urls: string[];
}
