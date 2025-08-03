'use client'

import { useState, useEffect } from 'react'
import DashboardHeader from '@/components/DashboardHeader'
import LeadSearchForm from '@/components/LeadSearchForm'
import LeadTable from '@/components/LeadTable'
import LeadStats from '@/components/LeadStats'
import ScrapingForm from '@/components/ScrapingForm'
import { Lead } from '@/types/lead'

export default function DashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchParams, setSearchParams] = useState({
    industry: '',
    locationRadius: 25,
    employeeCountMin: 10,
    employeeCountMax: 50,
    revenueMin: 500000,
    revenueMax: 2000000,
  })

  useEffect(() => {
    fetchLeads()
  }, [])

  useEffect(() => {
    filterLeads()
  }, [leads, searchParams])

  const fetchLeads = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/leads')
      
      if (response.ok) {
        const data = await response.json()
        setLeads(data)
      }
    } catch (error) {
      console.error('Error fetching leads:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterLeads = () => {
    let filtered = leads

    if (searchParams.industry) {
      filtered = filtered.filter(lead => 
        lead.industry.toLowerCase().includes(searchParams.industry.toLowerCase())
      )
    }

    filtered = filtered.filter(lead => 
      lead.employeeCount >= searchParams.employeeCountMin &&
      lead.employeeCount <= searchParams.employeeCountMax
    )

    filtered = filtered.filter(lead => 
      lead.revenue >= searchParams.revenueMin &&
      lead.revenue <= searchParams.revenueMax
    )

    setFilteredLeads(filtered)
  }

  const handleSearch = (params: typeof searchParams) => {
    setSearchParams(params)
  }

  const handleExport = async (format: 'csv' | 'sheets') => {
    try {
      const response = await fetch('/api/leads/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          format,
          leads: filteredLeads
        })
      })

      if (response.ok) {
        if (format === 'csv') {
          const blob = await response.blob()
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = 'kansas-city-leads.csv'
          a.click()
        } else {
          const data = await response.json()
          window.open(data.url, '_blank')
        }
      }
    } catch (error) {
      console.error('Export error:', error)
    }
  }

  const handleScrapingComplete = () => {
    fetchLeads()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              <ScrapingForm onScrapingComplete={handleScrapingComplete} />
              <LeadSearchForm 
                onSearch={handleSearch}
                searchParams={searchParams}
              />
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <LeadStats leads={filteredLeads} />
              
              <div className="mt-6">
                <LeadTable 
                  leads={filteredLeads}
                  isLoading={isLoading}
                  onExport={handleExport}
                  onRefresh={fetchLeads}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}