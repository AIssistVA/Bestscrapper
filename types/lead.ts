export interface Lead {
  id: string
  businessName: string
  ownerName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  industry: string
  employeeCount: number
  revenue: number
  website: string
  socialMedia: {
    linkedin?: string
    facebook?: string
    twitter?: string
  }
  leadScore: number
  notes: string
  scrapedAt: string
  lastUpdated: string
  isVerified: boolean
  isDuplicate: boolean
}

export interface SearchParams {
  industry: string
  locationRadius: number
  employeeCountMin: number
  employeeCountMax: number
  revenueMin: number
  revenueMax: number
}

export interface LeadStats {
  total: number
  verified: number
  highScore: number
  averageScore: number
  byIndustry: Record<string, number>
}

export interface ScrapingJob {
  id: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  progress: number
  totalLeads: number
  scrapedLeads: number
  startedAt: string
  completedAt?: string
  error?: string
}