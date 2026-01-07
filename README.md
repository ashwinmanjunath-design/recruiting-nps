# Candidate 360° Post-interview NPS Dashboard

A comprehensive full-stack application for tracking and analyzing candidate experience through Net Promoter Score (NPS) surveys in the recruiting process.

## 🚀 Features

- **Dashboard**: Real-time NPS metrics, response rates, and key insights
- **Trends**: Historical analysis with interactive charts
- **Geographic**: Region-based NPS breakdown with world map visualization
- **Cohorts**: Compare candidate groups and analyze feedback themes
- **Actions**: Manage action items based on candidate feedback
- **Authentication**: Secure login with JWT tokens
- **Real-time Analytics**: Live data updates and comprehensive reporting

## 📊 Screenshots

Based on the 5 UI/UX mockups provided:
1. Dashboard - Overview with NPS gauge, metrics cards, and cohort breakdown
2. Trends - Stacked area charts and response rate analysis
3. Geographic - Interactive world map with regional insights
4. Cohorts - Cohort builder and comparison tools
5. Actions - Action item management with feedback themes

## 🛠️ Tech Stack

### Frontend
- **React** 19 with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **Recharts** for data visualization
- **React Router** for navigation
- **Axios** for API calls
- **Lucide React** for icons

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **Prisma** ORM for database management
- **PostgreSQL** database
- **JWT** for authentication
- **Bcrypt** for password hashing
- **Zod** for validation

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

### Setup

1. **Clone and navigate to project**
```bash
cd candidate-360-nps
```

2. **Install dependencies**
```bash
npm run setup
```

3. **Configure environment**
```bash
cp .env.example .env
```

Edit `.env` with your database credentials and settings:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/candidate_360_nps"
JWT_SECRET=your-secret-key-min-32-characters
PORT=4000
```

4. **Setup database**
```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed database with sample data
npm run db:seed
```

5. **Start development servers**
```bash
# Start both backend and frontend
npm run dev

# Or start individually:
npm run dev:backend  # Backend on http://localhost:4000
npm run dev:frontend # Frontend on http://localhost:5173
```

## 🎯 Default Credentials

After seeding the database, use these credentials:

```
Email: admin@example.com
Password: admin123
```

## 📁 Project Structure

```
candidate-360-nps/
├── server/                 # Backend Express API
│   ├── src/
│   │   ├── routes/        # API route handlers
│   │   ├── middleware/    # Auth & other middleware
│   │   ├── database/      # Seed scripts
│   │   └── index.ts       # Server entry point
│   └── tsconfig.json
├── client/                # Frontend React app
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable components
│   │   ├── api/           # API client
│   │   └── App.tsx        # App entry point
│   └── vite.config.ts
├── prisma/
│   └── schema.prisma      # Database schema
└── package.json
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user

### Dashboard
- `GET /api/dashboard/overview` - Get overview metrics
- `GET /api/dashboard/insights` - Get actionable insights
- `GET /api/dashboard/cohorts-mini` - Get cohort summary

### Trends
- `GET /api/trends/history` - Get NPS history
- `GET /api/trends/response-rate` - Get response rate trends
- `GET /api/trends/insights` - Get trend insights

### Geographic
- `GET /api/geographic/regions` - Get regional NPS data
- `GET /api/geographic/map-data` - Get map visualization data
- `GET /api/geographic/insights` - Get geographic insights

### Cohorts
- `GET /api/cohorts/analysis` - Get cohort analysis
- `GET /api/cohorts/comparison` - Compare two cohorts
- `GET /api/cohorts/feedback-themes` - Get feedback themes
- `GET /api/cohorts/scatter-data` - Get scatter plot data

### Actions
- `GET /api/actions` - List all action items
- `POST /api/actions` - Create new action
- `PATCH /api/actions/:id` - Update action
- `DELETE /api/actions/:id` - Delete action
- `GET /api/actions/themes` - Get feedback themes
- `GET /api/actions/history` - Get action history

### Surveys
- `GET /api/surveys` - List surveys
- `GET /api/surveys/:token` - Get survey by token
- `POST /api/surveys/submit` - Submit survey response
- `POST /api/surveys/create` - Create new survey

## 🎨 UI Components

### Dashboard Page
- NPS Score gauge with breakdown
- Total invitations card
- Response rate with trend
- Median time to feedback
- Actionable insights panel
- Cohort mini-table

### Trends Page
- Stacked area chart for NPS composition
- Dual-axis line chart for response rate & time
- Notable events timeline
- Trend indicators

### Geographic Page
- Interactive world map
- Regional performance table
- Selected region details
- Geographic insights panel

### Cohorts Page
- Cohort builder with filters
- Comparison table
- Scatter plot visualization
- Feedback themes by cohort

### Actions Page
- Action items table with priorities
- Positive/negative feedback themes
- History log
- Create action modal

## 🔧 Configuration

### Database Schema

The application uses Prisma with the following main models:
- `User` - System users
- `Candidate` - Job candidates
- `Survey` - Survey invitations
- `SurveyTemplate` - Survey templates
- `SurveyQuestion` - Survey questions
- `SurveyResponse` - Candidate responses
- `FeedbackTheme` - Extracted themes
- `ActionItem` - Action items
- `NPSMetric` - Cached metrics

### Environment Variables

See `.env.example` for all available configuration options.

## 📊 Sample Data

The seed script creates:
- 1 admin user
- 100 sample candidates
- 80 survey responses (80% response rate)
- 6 feedback themes (3 positive, 3 negative)
- 4 action items with different priorities
- Historical NPS data

## 🚀 Deployment

### Backend (Express API)

1. Build the backend:
```bash
npm run build:backend
```

2. Set production environment variables

3. Deploy to your platform (Heroku, AWS, etc.)

### Frontend (React App)

1. Update API URL in `client/src/api/client.ts`

2. Build the frontend:
```bash
npm run build:frontend
```

3. Deploy the `client/dist` folder to your hosting (Vercel, Netlify, etc.)

### Database

1. Set up PostgreSQL instance
2. Update `DATABASE_URL` in environment
3. Run migrations:
```bash
npx prisma migrate deploy
```

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test
```

## 📝 License

MIT License - feel free to use this project for your recruiting analytics needs!

## 👥 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 🤝 Support

For questions or issues, please open an issue on GitHub or contact the development team.

## 🎯 Roadmap

- [ ] Email integration for survey distribution
- [ ] SmartRecruiters webhook integration
- [ ] Advanced filtering and segmentation
- [ ] Custom dashboard widgets
- [ ] PDF export for reports
- [ ] Real-time notifications
- [ ] Mobile responsive improvements
- [ ] Dark mode support

---

**Built with ❤️ for better candidate experience**

