import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Lead from '@/models/Lead'
import { google } from 'googleapis'
import { createObjectCsvWriter } from 'csv-writer'

export async function POST(request: NextRequest) {
  try {
    const { format, leads } = await request.json()

    if (format === 'csv') {
      return await exportToCSV(leads)
    } else if (format === 'sheets') {
      return await exportToGoogleSheets(leads)
    } else {
      return NextResponse.json(
        { error: 'Invalid export format' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function exportToCSV(leads: any[]) {
  const csvData = leads.map(lead => ({
    'Business Name': lead.businessName,
    'Owner Name': lead.ownerName,
    'Email': lead.email,
    'Phone': lead.phone,
    'Address': lead.address,
    'City': lead.city,
    'State': lead.state,
    'Zip Code': lead.zipCode,
    'Industry': lead.industry,
    'Employee Count': lead.employeeCount,
    'Revenue': lead.revenue,
    'Website': lead.website,
    'LinkedIn': lead.socialMedia?.linkedin || '',
    'Lead Score': lead.leadScore,
    'Notes': lead.notes,
    'Scraped At': new Date(lead.scrapedAt).toLocaleDateString(),
    'Verified': lead.isVerified ? 'Yes' : 'No',
    'Duplicate': lead.isDuplicate ? 'Yes' : 'No',
  }))

  const csvContent = [
    // Header row
    Object.keys(csvData[0] || {}).join(','),
    // Data rows
    ...csvData.map(row => Object.values(row).map(value => `"${value}"`).join(','))
  ].join('\n')

  return new NextResponse(csvContent, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="kansas-city-leads.csv"',
    },
  })
}

async function exportToGoogleSheets(leads: any[]) {
  try {
    // Initialize Google Sheets API
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS || '{}'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    })

    const sheets = google.sheets({ version: 'v4', auth })

    // Create a new spreadsheet
    const spreadsheet = await sheets.spreadsheets.create({
      requestBody: {
        properties: {
          title: `Kansas City Leads - ${new Date().toLocaleDateString()}`,
        },
      },
    })

    const spreadsheetId = spreadsheet.data.spreadsheetId!

    // Prepare data for Google Sheets
    const values = [
      // Header row
      [
        'Business Name',
        'Owner Name',
        'Email',
        'Phone',
        'Address',
        'City',
        'State',
        'Zip Code',
        'Industry',
        'Employee Count',
        'Revenue',
        'Website',
        'LinkedIn',
        'Lead Score',
        'Notes',
        'Scraped At',
        'Verified',
        'Duplicate',
      ],
      // Data rows
      ...leads.map(lead => [
        lead.businessName,
        lead.ownerName,
        lead.email,
        lead.phone,
        lead.address,
        lead.city,
        lead.state,
        lead.zipCode,
        lead.industry,
        lead.employeeCount,
        lead.revenue,
        lead.website,
        lead.socialMedia?.linkedin || '',
        lead.leadScore,
        lead.notes,
        new Date(lead.scrapedAt).toLocaleDateString(),
        lead.isVerified ? 'Yes' : 'No',
        lead.isDuplicate ? 'Yes' : 'No',
      ]),
    ]

    // Update the spreadsheet with data
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'A1:R1',
      valueInputOption: 'RAW',
      requestBody: {
        values,
      },
    })

    // Format the header row
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            repeatCell: {
              range: {
                sheetId: 0,
                startRowIndex: 0,
                endRowIndex: 1,
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: {
                    red: 0.2,
                    green: 0.4,
                    blue: 0.8,
                  },
                  textFormat: {
                    bold: true,
                    foregroundColor: {
                      red: 1,
                      green: 1,
                      blue: 1,
                    },
                  },
                },
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat)',
            },
          },
        ],
      },
    })

    const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}`
    
    return NextResponse.json({ url })
  } catch (error) {
    console.error('Google Sheets export error:', error)
    return NextResponse.json(
      { error: 'Failed to export to Google Sheets' },
      { status: 500 }
    )
  }
}