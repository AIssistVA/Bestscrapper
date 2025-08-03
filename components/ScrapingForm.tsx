'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

interface ScrapingFormData {
  industry: string
  locationRadius: number
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

interface ScrapingFormProps {
  onScrapingComplete: () => void
}

export default function ScrapingForm({ onScrapingComplete }: ScrapingFormProps) {
  const [isScraping, setIsScraping] = useState(false)
  const [progress, setProgress] = useState(0)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<ScrapingFormData>()

  const onSubmit = async (data: ScrapingFormData) => {
    setIsScraping(true)
    setProgress(0)

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 10
        })
      }, 1000)

      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(data)
      })

      clearInterval(progressInterval)
      setProgress(100)

      if (response.ok) {
        const result = await response.json()
        toast.success(`Scraping completed! Found ${result.leadsScraped} leads.`)
        reset()
        onScrapingComplete()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Scraping failed')
      }
    } catch (error) {
      toast.error('Scraping failed. Please try again.')
    } finally {
      setIsScraping(false)
      setProgress(0)
    }
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Start Scraping</h3>
        {isScraping && (
          <div className="flex items-center text-sm text-gray-500">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600 mr-2"></div>
            Scraping...
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Target Industry
          </label>
          <select
            {...register('industry', { required: 'Industry is required' })}
            className="input-field"
            disabled={isScraping}
          >
            <option value="">Select Industry</option>
            {INDUSTRIES.map(industry => (
              <option key={industry} value={industry}>{industry}</option>
            ))}
          </select>
          {errors.industry && (
            <p className="mt-1 text-sm text-red-600">{errors.industry.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Location Radius (miles from Kansas City)
          </label>
          <input
            type="range"
            min="5"
            max="100"
            defaultValue="25"
            {...register('locationRadius', { 
              required: 'Location radius is required',
              valueAsNumber: true 
            })}
            className="w-full"
            disabled={isScraping}
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>5 miles</span>
            <span>25 miles</span>
            <span>100 miles</span>
          </div>
          {errors.locationRadius && (
            <p className="mt-1 text-sm text-red-600">{errors.locationRadius.message}</p>
          )}
        </div>

        {isScraping && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isScraping}
          className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isScraping ? 'Scraping...' : 'Start Scraping'}
        </button>
      </form>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Scraping Sources</h4>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            Yellow Pages
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
            Google Maps
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
            Business Directories
          </div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-xs text-blue-700">
          <strong>Note:</strong> Scraping may take several minutes depending on the number of sources and results found. 
          The system will automatically filter for businesses with 10-50 employees and $500K-$2M revenue.
        </p>
      </div>
    </div>
  )
}