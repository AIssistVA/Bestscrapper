import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Lead from '@/models/Lead'

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const industry = searchParams.get('industry')
    const employeeCountMin = searchParams.get('employeeCountMin')
    const employeeCountMax = searchParams.get('employeeCountMax')
    const revenueMin = searchParams.get('revenueMin')
    const revenueMax = searchParams.get('revenueMax')
    const limit = parseInt(searchParams.get('limit') || '100')
    const page = parseInt(searchParams.get('page') || '1')

    // Build query
    const query: any = {}

    if (industry) {
      query.industry = { $regex: industry, $options: 'i' }
    }

    if (employeeCountMin || employeeCountMax) {
      query.employeeCount = {}
      if (employeeCountMin) query.employeeCount.$gte = parseInt(employeeCountMin)
      if (employeeCountMax) query.employeeCount.$lte = parseInt(employeeCountMax)
    }

    if (revenueMin || revenueMax) {
      query.revenue = {}
      if (revenueMin) query.revenue.$gte = parseInt(revenueMin)
      if (revenueMax) query.revenue.$lte = parseInt(revenueMax)
    }

    // Execute query with pagination
    const skip = (page - 1) * limit
    
    const leads = await Lead.find(query)
      .sort({ scrapedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    const total = await Lead.countDocuments(query)

    return NextResponse.json(leads)
  } catch (error) {
    console.error('Error fetching leads:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const leadData = await request.json()
    
    // Calculate lead score based on various factors
    leadData.leadScore = calculateLeadScore(leadData)
    
    const lead = new Lead(leadData)
    await lead.save()

    return NextResponse.json(lead, { status: 201 })
  } catch (error) {
    console.error('Error creating lead:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function calculateLeadScore(leadData: any): number {
  let score = 5 // Base score

  // Employee count scoring
  if (leadData.employeeCount >= 20 && leadData.employeeCount <= 50) {
    score += 2
  } else if (leadData.employeeCount >= 10 && leadData.employeeCount < 20) {
    score += 1
  }

  // Revenue scoring
  if (leadData.revenue >= 1000000 && leadData.revenue <= 2000000) {
    score += 2
  } else if (leadData.revenue >= 500000 && leadData.revenue < 1000000) {
    score += 1
  }

  // Industry scoring (focus on target industries)
  const targetIndustries = ['Manufacturing', 'Professional Services', 'Healthcare']
  if (targetIndustries.includes(leadData.industry)) {
    score += 1
  }

  // Website presence
  if (leadData.website) {
    score += 1
  }

  // Social media presence
  if (leadData.socialMedia?.linkedin) {
    score += 1
  }

  // Ensure score is between 1 and 10
  return Math.max(1, Math.min(10, score))
}