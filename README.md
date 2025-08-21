# BRM Renewal Calendar

## Quick Start
1. Backend: `cd server && pip install -r requirements.txt && python run.py`
2. Frontend: `cd client && npm install && npm start`
3. Visit: http://localhost:3000/

## API Endpoints
- GET /health
- POST /upload
- GET /agreements
- GET /calendar
- GET /calendar/upcoming

A full-stack application that ingests Purchase Agreement PDFs and presents an intelligent renewal calendar to help companies track contract obligations and deadlines.

## 🎯 What I Built

### Core MVP Features ✅
- **PDF Upload & Processing**: Drag-and-drop interface for uploading purchase agreement PDFs
- **AI-Powered Data Extraction**: Automatically extracts vendor, dates, terms, and obligations from PDFs using LLMs
- **Visual Calendar**: Interactive month-view calendar showing all renewal events with color-coding
- **Renewal Calendar**: List views of upcoming events (30/90 day windows) with urgency indicators
- **Agreement Management**: Full CRUD operations with inline editing capabilities
- **Smart Date Sync**: Calendar events automatically update when agreement dates are modified
- **Dashboard Analytics**: Key metrics showing active agreements, total value, and urgent items
- **Event Highlighting**: Click calendar events to highlight corresponding agreements
- **Cross-platform Setup**: Automated setup script that works on Windows, macOS, and Linux
- **Error Handling**: User-friendly notifications and error states
- **Data Validation**: Form validation with business logic (end dates after start dates, etc.)

## 🛠️ What I Didn't Build (Prioritization Decisions)

### Intentionally Excluded for MVP ❌
- **User Authentication**: Would add significant complexity for a demo; focused on core contract management
- **Multi-tenant Architecture**: Single-tenant keeps the demo simple while showing core functionality
- **Email Notifications**: Would require email service integration; visual indicators achieve same UX goal
- **File Storage in Cloud**: Local storage sufficient for demo; shows data flow without infrastructure complexity
- **Advanced PDF OCR**: PDFplumber handles structured PDFs well; OCR would add cost/complexity for diminishing returns
- **Recurring Event Logic**: Focused on showing dates rather than complex recurrence patterns
- **Export Features**: Would be nice-to-have but doesn't demonstrate core value proposition
- **Audit Trails**: Important for production but not for demonstrating the workflow

### Why These Decisions Matter 💡
In a startup environment, these features would come later because:
1. **Authentication** comes after proving product-market fit
2. **Infrastructure scaling** happens after validating the core workflow  
3. **Advanced features** get prioritized based on user feedback
4. **Integration complexity** should be minimized until the core value is proven

## 🔧 Architecture & Tools Used

### Backend Stack
- **Flask** - Lightweight, perfect for MVPs and API development
- **SQLAlchemy** - ORM for clean database operations and easy migration to PostgreSQL
- **SQLite** - Zero-config database perfect for development and demos
- **PDFplumber** - Robust PDF text extraction, handles tables and complex layouts
- **OpenRouter API** - Unified access to multiple LLMs (used Claude 3.5 Sonnet)
- **Flask-CORS** - Enable cross-origin requests for separate frontend
- **Python-dateutil** - Robust date parsing for extracted text

### Frontend Stack  
- **React** - Component-based architecture, great for interactive UIs
- **Lucide React** - Clean, consistent iconography
- **Vanilla CSS/Inline Styles** - Kept styling simple to focus on functionality
- **Fetch API** - Native browser API, no need for additional dependencies

### Key Technical Decisions

#### 1. **Database Schema Design**
- **Normalized structure**: Separate tables for agreements, dates, products, renewal terms
- **Why**: Allows complex queries and future feature expansion
- **Trade-off**: Slightly more complex than denormalized, but much more flexible

#### 2. **PDF Processing: PDFplumber over OCR**
- **Why**: Most business contracts are digital PDFs with selectable text
- **Trade-off**: Won't handle scanned documents, but covers 80% of use cases with much less complexity

#### 3. **Styling: Inline Styles over CSS Framework**
- **Why**: Faster development, no external dependencies, easier to customize
- **Trade-off**: Less maintainable long-term, but perfect for MVP/demo


## 🔮 Next Priorities (If I Had More Time)

1. **Bulk Operations**: Select and delete multiple agreements
2. **Search & Filtering**: Find agreements by vendor, date range, or value
3. **Data Export**: CSV/Excel export for external analysis

### Longer term
1. **Email Notifications**: Configurable alerts for upcoming deadlines
2. **Document Storage**: Cloud file storage instead of temporary processing
3. **Advanced Calendar Views**: Week/agenda views, timezone support
4. **Multi-user Support**: Authentication, user roles, shared workspaces


## 🚀 Setup Instructions

### Prerequisites
- Python 3.7+ 
- Node.js 14+
- OpenRouter API key (provided separately)

### Automated Setup (Recommended)
```bash
# Clone the repository
git clone https://github.com/siddaay/renewal-calendar.git
cd renewal-calendar

# Run cross-platform setup script
python setup.py

# The script will:
# 1. Create virtual environment
# 2. Install Python dependencies  
# 3. Install Node.js dependencies
# 4. Create .env file template
```

### Manual Setup
```bash
# Backend setup
cd server
python -m venv brm_venv
source brm_venv/bin/activate  # On Windows: brm_venv\Scripts\activate
pip install -r requirements.txt

# Add your OpenRouter API key to server/.env
echo "OPENROUTER_API_KEY=your-key-here" >> .env

# Frontend setup
cd ../client
npm install
```

### Running the Application
```bash
# Terminal 1: Start backend
cd server
source ../brm_venv/bin/activate  # On Windows: ..\brm_venv\Scripts\activate
python run.py

# Terminal 2: Start frontend  
cd client
npm start

# Open http://localhost:3000
```

## 📋 Testing the Application

1. **Upload a PDF**: Drag any purchase agreement PDF to the upload area
2. **View Extraction**: Check the dashboard for new agreement data
3. **Explore Calendar**: Navigate the visual calendar to see events
4. **Edit Agreement**: Click edit on any agreement to modify dates
5. **Observe Sync**: Watch calendar events update automatically
6. **Click Events**: Click calendar events to highlight agreements