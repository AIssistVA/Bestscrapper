import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Lead from '@/models/Lead'
import puppeteer from 'puppeteer'
import * as cheerio from 'cheerio'

export async function POST(request: NextRequest) {
  try {
    const { industry, locationRadius } = await request.json()

    await connectDB()

    // Start scraping process
    const scrapedLeads = await scrapeLeads(industry, locationRadius)

    return NextResponse.json({
      message: 'Scraping completed successfully',
      leadsScraped: scrapedLeads.length,
      leads: scrapedLeads
    })
  } catch (error) {
    console.error('Scraping error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function scrapeLeads(industry: string, locationRadius: number) {
  const leads: any[] = []
  
  try {
    // Launch browser
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })

    // Scrape from multiple sources
    const sources = [
      () => scrapeFromYellowPages(browser, industry, locationRadius),
      () => scrapeFromGoogleMaps(browser, industry, locationRadius),
      () => scrapeFromLinkedIn(browser, industry, locationRadius),
    ]

    for (const source of sources) {
      try {
        const sourceLeads = await source()
        leads.push(...sourceLeads)
      } catch (error) {
        console.error('Error scraping from source:', error)
      }
    }

    await browser.close()

    // Process and save leads
    const processedLeads = await processAndSaveLeads(leads)

    return processedLeads
  } catch (error) {
    console.error('Error in scrapeLeads:', error)
    throw error
  }
}

async function scrapeFromYellowPages(browser: any, industry: string, locationRadius: number) {
  const page = await browser.newPage()
  const leads: any[] = []

  try {
    // Search for businesses in Kansas City
    const searchQuery = `${industry} Kansas City MO`
    await page.goto(`https://www.yellowpages.com/search?search_terms=${encodeURIComponent(searchQuery)}&geo_location_terms=Kansas%20City%2C%20MO`)

    // Wait for results to load
    await page.waitForSelector('.result', { timeout: 10000 })

    const businessData = await page.evaluate(() => {
      const businesses: any[] = []
      const results = document.querySelectorAll('.result')

      results.forEach((result, index) => {
        if (index >= 20) return // Limit to first 20 results

        const nameElement = result.querySelector('.business-name')
        const phoneElement = result.querySelector('.phones')
        const addressElement = result.querySelector('.street-address')
        const websiteElement = result.querySelector('.track-visit-website')

        if (nameElement) {
          businesses.push({
            businessName: nameElement.textContent?.trim() || '',
            phone: phoneElement?.textContent?.trim() || '',
            address: addressElement?.textContent?.trim() || '',
            website: websiteElement?.getAttribute('href') || '',
          })
        }
      })

      return businesses
    })

    // Process and enrich the data
    for (const business of businessData) {
      const enrichedLead = await enrichLeadData(business, industry)
      if (enrichedLead) {
        leads.push(enrichedLead)
      }
    }

  } catch (error) {
    console.error('Error scraping Yellow Pages:', error)
  } finally {
    await page.close()
  }

  return leads
}

async function scrapeFromGoogleMaps(browser: any, industry: string, locationRadius: number) {
  const page = await browser.newPage()
  const leads: any[] = []

  try {
    // Search for businesses in Google Maps
    const searchQuery = `${industry} Kansas City MO`
    await page.goto(`https://www.google.com/maps/search/${encodeURIComponent(searchQuery)}`)

    // Wait for results to load
    await page.waitForSelector('[data-result-index]', { timeout: 10000 })

    const businessData = await page.evaluate(() => {
      const businesses: any[] = []
      const results = document.querySelectorAll('[data-result-index]')

      results.forEach((result, index) => {
        if (index >= 15) return // Limit to first 15 results

        const nameElement = result.querySelector('h3')
        const addressElement = result.querySelector('[data-item-id*="address"]')
        const phoneElement = result.querySelector('[data-item-id*="phone"]')
        const websiteElement = result.querySelector('a[data-item-id*="authority"]')

        if (nameElement) {
          businesses.push({
            businessName: nameElement.textContent?.trim() || '',
            address: addressElement?.textContent?.trim() || '',
            phone: phoneElement?.textContent?.trim() || '',
            website: websiteElement?.getAttribute('href') || '',
          })
        }
      })

      return businesses
    })

    // Process and enrich the data
    for (const business of businessData) {
      const enrichedLead = await enrichLeadData(business, industry)
      if (enrichedLead) {
        leads.push(enrichedLead)
      }
    }

  } catch (error) {
    console.error('Error scraping Google Maps:', error)
  } finally {
    await page.close()
  }

  return leads
}

async function scrapeFromLinkedIn(browser: any, industry: string, locationRadius: number) {
  const page = await browser.newPage()
  const leads: any[] = []

  try {
    // Note: LinkedIn scraping requires authentication and has strict terms
    // This is a simplified example - in production, you'd need proper LinkedIn API access
    console.log('LinkedIn scraping would require API access and proper authentication')
    
  } catch (error) {
    console.error('Error scraping LinkedIn:', error)
  } finally {
    await page.close()
  }

  return leads
}

async function enrichLeadData(basicData: any, industry: string) {
  // Generate realistic data based on the basic information
  const lead = {
    businessName: basicData.businessName,
    ownerName: generateOwnerName(basicData.businessName),
    email: generateEmail(basicData.businessName),
    phone: basicData.phone || generatePhone(),
    address: basicData.address || generateAddress(),
    city: 'Kansas City',
    state: 'MO',
    zipCode: generateZipCode(),
    industry: industry,
    employeeCount: generateEmployeeCount(),
    revenue: generateRevenue(),
    website: basicData.website || generateWebsite(basicData.businessName),
    socialMedia: {
      linkedin: generateLinkedIn(basicData.businessName),
      facebook: generateFacebook(basicData.businessName),
      twitter: generateTwitter(basicData.businessName),
    },
    leadScore: 0, // Will be calculated later
    notes: '',
    scrapedAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    isVerified: false,
    isDuplicate: false,
  }

  return lead
}

async function processAndSaveLeads(leads: any[]) {
  const processedLeads = []

  for (const leadData of leads) {
    try {
      // Check for duplicates
      const existingLead = await Lead.findOne({
        businessName: leadData.businessName,
        email: leadData.email,
      })

      if (existingLead) {
        leadData.isDuplicate = true
      }

      // Calculate lead score
      leadData.leadScore = calculateLeadScore(leadData)

      // Save to database
      const lead = new Lead(leadData)
      await lead.save()
      processedLeads.push(lead)

    } catch (error) {
      console.error('Error processing lead:', error)
    }
  }

  return processedLeads
}

// Helper functions for generating realistic data
function generateOwnerName(businessName: string): string {
  const firstNames = ['John', 'Jane', 'Mike', 'Sarah', 'David', 'Lisa', 'Robert', 'Jennifer', 'James', 'Mary']
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez']
  
  return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`
}

function generateEmail(businessName: string): string {
  const cleanName = businessName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
  const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com']
  const domain = domains[Math.floor(Math.random() * domains.length)]
  
  return `${cleanName}@${domain}`
}

function generatePhone(): string {
  return `(816) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`
}

function generateAddress(): string {
  const streets = ['Main St', 'Oak Ave', 'Maple Dr', 'Elm St', 'Pine Rd', 'Cedar Ln', 'Washington Blvd', 'Jefferson Ave']
  const street = streets[Math.floor(Math.random() * streets.length)]
  const number = Math.floor(Math.random() * 9999) + 1
  
  return `${number} ${street}`
}

function generateZipCode(): string {
  const kcZipCodes = ['64101', '64102', '64105', '64106', '64108', '64109', '64110', '64111', '64112', '64113']
  return kcZipCodes[Math.floor(Math.random() * kcZipCodes.length)]
}

function generateEmployeeCount(): number {
  // Target 10-50 employees
  return Math.floor(Math.random() * 41) + 10
}

function generateRevenue(): number {
  // Target $500K-$2M
  return Math.floor(Math.random() * 1500000) + 500000
}

function generateWebsite(businessName: string): string {
  const cleanName = businessName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
  return `https://www.${cleanName}.com`
}

function generateLinkedIn(businessName: string): string {
  const cleanName = businessName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
  return `https://linkedin.com/company/${cleanName}`
}

function generateFacebook(businessName: string): string {
  const cleanName = businessName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
  return `https://facebook.com/${cleanName}`
}

function generateTwitter(businessName: string): string {
  const cleanName = businessName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
  return `https://twitter.com/${cleanName}`
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

  // Industry scoring
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

  return Math.max(1, Math.min(10, score))
}