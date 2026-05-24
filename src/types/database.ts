// 数据库类型定义

export type UserRole = 'tourist' | 'guide' | 'admin'
export type CertificationType = 'individual' | 'enterprise'
export type VerificationStatus = 'pending' | 'verified' | 'rejected'
export type PostType = 'image' | 'video' | 'carousel'
export type PlanStatus = 'draft' | 'published' | 'archived'
export type Difficulty = 'easy' | 'moderate' | 'challenging'
export type EscrowStatus =
  | 'pending_payment'
  | 'paid_to_escrow'
  | 'guide_accepted'
  | 'service_in_progress'
  | 'service_completed'
  | 'tourist_confirmed'
  | 'funds_released'
  | 'disputed'
  | 'refunded'
  | 'cancelled'
export type MessageType = 'text' | 'image' | 'plan_card' | 'order_card' | 'system'
export type VisaServiceType = 'l_visa' | 'transit_exemption' | 'e_visa' | 'other'
export type VisaStatus =
  | 'submitted' | 'under_review' | 'additional_info_needed'
  | 'quoted' | 'processing' | 'approved' | 'rejected'
export type FavoriteTarget = 'post' | 'plan' | 'guide'

// 用户
export interface Profile {
  id: string
  email: string
  display_name: string
  avatar_url: string | null
  phone: string | null
  role: UserRole
  bio: string | null
  country: string | null
  language: string[]
  created_at: string
  updated_at: string
}

// 导游资质
export interface GuideProfile {
  id: string
  certification_type: CertificationType
  real_name: string | null
  passport_number: string | null
  guide_cert_number: string | null
  guide_cert_url: string | null
  company_name: string | null
  business_license: string | null
  business_license_url: string | null
  specialties: string[]
  languages_spoken: string[]
  service_cities: string[]
  years_experience: number
  verification_status: VerificationStatus
  rating_avg: number
  review_count: number
  profile?: Profile
}

// 导游方案
export interface TourPlan {
  id: string
  guide_id: string
  title: string
  subtitle: string | null
  description: string
  cover_image_url: string
  gallery_urls: string[]
  destinations: Destination[]
  itinerary: ItineraryDay[]
  duration_days: number
  max_group_size: number
  price_cny: number
  currency: string
  price_breakdown: Record<string, number>
  includes: string[]
  excludes: string[]
  highlights: string[]
  tags: string[]
  difficulty: Difficulty | null
  status: PlanStatus
  view_count: number
  booking_count: number
  created_at: string
  updated_at: string
  guide?: GuideProfile
}

export interface Destination {
  city: string
  spots: string[]
}

export interface ItineraryDay {
  day: number
  title: string
  description: string
  spots: string[]
  meals: string
}

// 内容帖子
export interface Post {
  id: string
  author_id: string
  post_type: PostType
  title: string
  description: string | null
  media_urls: string[]
  video_url: string | null
  thumbnail_url: string | null
  linked_plan_id: string | null
  tags: string[]
  destination: string | null
  likes_count: number
  comments_count: number
  favorites_count: number
  shares_count: number
  view_count: number
  status: 'draft' | 'published' | 'hidden'
  created_at: string
  updated_at: string
  author?: Profile
  linked_plan?: TourPlan
  is_favorited?: boolean
}

// 订单
export interface Order {
  id: string
  order_number: string
  tourist_id: string
  guide_id: string
  plan_id: string
  plan_snapshot: Record<string, unknown>
  custom_requests: string | null
  agreed_price_cny: number
  currency: string
  travel_start_date: string
  travel_end_date: string
  group_size: number
  payment_method: string | null
  paid_at: string | null
  escrow_status: EscrowStatus
  emergency_contact_name: string | null
  emergency_contact_phone: string | null
  trip_share_token: string | null
  guide_accepted_at: string | null
  service_started_at: string | null
  service_ended_at: string | null
  tourist_confirmed_at: string | null
  funds_released_at: string | null
  stripe_payment_intent_id: string | null
  stripe_session_id: string | null
  created_at: string
  updated_at: string
  tourist?: Profile
  guide?: GuideProfile
  plan?: TourPlan
}

// 会话
export interface ChatConversation {
  id: string
  participant_a: string
  participant_b: string
  related_plan_id: string | null
  related_order_id: string | null
  last_message_at: string
  last_message_preview: string | null
  created_at: string
  otherUser?: Profile
}

// 消息
export interface ChatMessage {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  message_type: MessageType
  metadata: Record<string, unknown>
  is_read: boolean
  read_at: string | null
  created_at: string
  sender?: Profile
}

// 签证申请
export interface VisaApplication {
  id: string
  user_id: string
  service_type: VisaServiceType
  nationality: string
  passport_number: string
  passport_expiry: string
  intended_entry_date: string
  intended_stay_days: number
  entry_city: string | null
  purpose: string
  personal_info: Record<string, unknown>
  uploaded_docs: string[]
  quoted_price_cny: number | null
  payment_status: 'unpaid' | 'paid' | 'refunded'
  application_status: VisaStatus
  created_at: string
  updated_at: string
}

// 评价
export interface Review {
  id: string
  order_id: string
  tourist_id: string
  guide_id: string
  rating: number
  content: string | null
  images: string[]
  created_at: string
  tourist?: Profile
}

// 提现申请
export type PayoutStatus = 'pending' | 'approved' | 'rejected' | 'paid'

export interface PayoutRequest {
  id: string
  guide_id: string
  amount_cny: number
  bank_info: Record<string, string>
  status: PayoutStatus
  requested_at: string
  processed_at: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

// 收藏
export interface Favorite {
  id: string
  user_id: string
  target_type: FavoriteTarget
  target_id: string
  created_at: string
}
