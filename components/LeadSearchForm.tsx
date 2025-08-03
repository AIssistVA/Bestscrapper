'use client'

import { useState } from 'react'
import { SearchParams } from '@/types/lead'

interface LeadSearchFormProps {
  onSearch: (params: SearchParams) => void
  searchParams: SearchParams
}

const INDUSTRIES = [
  'Manufacturing',
  'Professional Services',
  'Healthcare',
  'Retail',
  'Restaurants',
  'Construction',
  'Real Estate',
  'Technology',
  'Finance',
  'Education',
  'Transportation',
  'Other'
]

export default function LeadSearchForm({ onSearch, searchParams }: LeadSearchFormProps) {
  const [formData, setFormData] = useState<SearchParams>(searchParams)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(formData)
  }

  const handleReset = () => {
    const defaultParams: SearchParams = {
      industry: '',
      locationRadius: 25,
      employeeCountMin: 10,
      employeeCountMax: 50,
      revenueMin: 500000,
      revenueMax: 2000000,
    }
    setFormData(defaultParams)
    onSearch(defaultParams)
  }

  const handleInputChange = (field: keyof SearchParams, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Search Filters</h3>
        <button
          onClick={handleReset}
          className="text-sm text-primary-600 hover:text-primary-500"
        >
          Reset
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Industry
          </label>
          <select
            value={formData.industry}
            onChange={(e) => handleInputChange('industry', e.target.value)}
            className="input-field"
          >
            <option value="">All Industries</option>
            {INDUSTRIES.map(industry => (
              <option key={industry} value={industry}>{industry}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Location Radius (miles)
          </label>
          <input
            type="range"
            min="5"
            max="100"
            value={formData.locationRadius}
            onChange={(e) => handleInputChange('locationRadius', parseInt(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>5</span>
            <span>{formData.locationRadius}</span>
            <span>100</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Employee Count
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="Min"
              value={formData.employeeCountMin}
              onChange={(e) => handleInputChange('employeeCountMin', parseInt(e.target.value) || 0)}
              className="input-field"
            />
            <input
              type="number"
              placeholder="Max"
              value={formData.employeeCountMax}
              onChange={(e) => handleInputChange('employeeCountMax', parseInt(e.target.value) || 0)}
              className="input-field"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Annual Revenue ($)
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="Min"
              value={formData.revenueMin}
              onChange={(e) => handleInputChange('revenueMin', parseInt(e.target.value) || 0)}
              className="input-field"
            />
            <input
              type="number"
              placeholder="Max"
              value={formData.revenueMax}
              onChange={(e) => handleInputChange('revenueMax', parseInt(e.target.value) || 0)}
              className="input-field"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full btn-primary"
        >
          Apply Filters
        </button>
      </form>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Quick Filters</h4>
        <div className="space-y-2">
          <button
            onClick={() => {
              const params = { ...formData, industry: 'Manufacturing' }
              setFormData(params)
              onSearch(params)
            }}
            className="block w-full text-left text-sm text-primary-600 hover:text-primary-500"
          >
            Manufacturing
          </button>
          <button
            onClick={() => {
              const params = { ...formData, industry: 'Professional Services' }
              setFormData(params)
              onSearch(params)
            }}
            className="block w-full text-left text-sm text-primary-600 hover:text-primary-500"
          >
            Professional Services
          </button>
          <button
            onClick={() => {
              const params = { ...formData, industry: 'Healthcare' }
              setFormData(params)
              onSearch(params)
            }}
            className="block w-full text-left text-sm text-primary-600 hover:text-primary-500"
          >
            Healthcare
          </button>
        </div>
      </div>
    </div>
  )
}