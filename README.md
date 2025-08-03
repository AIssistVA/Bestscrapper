# Kansas City B2B Lead Scraper

A comprehensive web application for scraping and managing B2B leads in the Kansas City, Missouri area. Built with Next.js, React, and MongoDB, this application provides powerful lead generation capabilities with advanced filtering, scoring, and export features.

## 🚀 Features

### Core Functionality
- **Lead Scraping**: Automated collection of business data from multiple sources
- **Lead Scoring**: Intelligent scoring system (1-10) based on business characteristics
- **Data Validation**: Built-in validation and duplicate detection
- **Export Options**: CSV and Google Sheets export functionality
- **Search & Filter**: Advanced filtering by industry, location, employee count, and revenue
- **No Authentication Required**: Simple, direct access to all features

### Target Criteria
- **Business Size**: 10-50 employees
- **Revenue Range**: $500K-$2M annual revenue
- **Industries**: Manufacturing, Professional Services, Healthcare, Retail, Restaurants, Construction, Real Estate
- **Location**: Kansas City, Missouri area

### Data Collected
- Business name and owner information
- Contact details (email, phone, address)
- Industry classification
- Employee count and revenue estimates
- Website and social media presence
- Lead scoring and verification status

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Headless UI
- **Backend**: Node.js, Next.js API Routes
- **Database**: MongoDB with Mongoose ODM
- **Web Scraping**: Puppeteer, Cheerio
- **Export**: Google Sheets API, CSV generation
- **Deployment**: Vercel-ready

## 📋 Prerequisites

- Node.js 18+ 
- MongoDB (local or cloud)
- Google Cloud Platform account (for Google Sheets export)
- npm or yarn package manager

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd kansas-city-lead-scraper
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your configuration:
```env
MONGODB_URI=mongodb://localhost:27017/kc-lead-scraper
GOOGLE_SHEETS_CREDENTIALS={"your-google-service-account-json"}
```

### 4. Database Setup
Ensure MongoDB is running locally or update the `MONGODB_URI` to point to your cloud database.

### 5. Google Sheets API Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google Sheets API
4. Create a service account and download the JSON key
5. Paste the JSON content into `GOOGLE_SHEETS_CREDENTIALS` in your `.env.local`

### 6. Run the Application
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 📖 Usage Guide



### Lead Management
1. **View Leads**: Access the dashboard to see all scraped leads
2. **Filter Results**: Use the sidebar filters to narrow down results
3. **Sort Data**: Click column headers to sort by different criteria
4. **Export Data**: Use the export buttons to download CSV or create Google Sheets

### Lead Scraping
1. Navigate to the scraping section
2. Select target industry and location radius
3. Start the scraping process
4. Monitor progress and view results

### Lead Scoring
The system automatically scores leads (1-10) based on:
- Employee count (10-50 employees = higher score)
- Revenue range ($500K-$2M = higher score)
- Industry focus (target industries = bonus points)
- Online presence (website, social media = bonus points)

## 🔧 Configuration

### Customizing Target Industries
Edit the `INDUSTRIES` array in `components/LeadSearchForm.tsx`:
```typescript
const INDUSTRIES = [
  'Manufacturing',
  'Professional Services',
  'Healthcare',
  // Add your target industries
]
```

### Adjusting Lead Scoring
Modify the `calculateLeadScore` function in `app/api/leads/route.ts`:
```typescript
function calculateLeadScore(leadData: any): number {
  let score = 5 // Base score
  
  // Add your scoring logic here
  
  return Math.max(1, Math.min(10, score))
}
```

### Scraping Sources
Configure scraping sources in `app/api/scrape/route.ts`:
```typescript
const sources = [
  () => scrapeFromYellowPages(browser, industry, locationRadius),
  () => scrapeFromGoogleMaps(browser, industry, locationRadius),
  // Add more sources as needed
]
```

## 🚀 Deployment

### Vercel Deployment
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

### Environment Variables for Production
```env
MONGODB_URI=your-production-mongodb-uri
GOOGLE_SHEETS_CREDENTIALS=your-production-google-credentials
NEXTAUTH_URL=https://your-domain.vercel.app
```

### Database Setup
For production, use MongoDB Atlas or another cloud MongoDB provider:
1. Create a cluster
2. Set up database user
3. Configure network access
4. Get connection string and add to environment variables

## 🔒 Security Features

- **Input Validation**: Server-side validation for all inputs
- **Rate Limiting**: Built-in protection against abuse
- **CORS Protection**: Configured for security
- **Helmet.js**: Security headers

## 📊 Data Structure

### Lead Schema
```typescript
interface Lead {
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
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## ⚠️ Legal Considerations

- **Terms of Service**: Ensure compliance with target websites' terms of service
- **Rate Limiting**: Implement appropriate delays between requests
- **Data Privacy**: Follow applicable data protection regulations
- **API Usage**: Respect API rate limits and terms of service

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation
- Review the code comments

## 🔄 Updates

Stay updated with the latest features and improvements by:
- Watching the repository
- Checking the releases page
- Following the changelog

---

**Built with ❤️ for Kansas City businesses**