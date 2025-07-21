# Multi-University Student ID Card Generator

A modern web application that generates realistic Indian student ID cards for multiple universities using React 19, Next.js 15, and Google Gemini AI.

## Features

- **Multiple University Support**: Generate cards for different Indian universities
- **Card Template Selection**: Choose from various university card templates
- **Dynamic Form Fields**: Form fields adapt based on selected university template
- **Manual Data Entry**: Fill in student information via a clean, modern form
- **AI-Powered Generation**: Auto-generate realistic student data using Google Gemini AI
- **Photo Upload**: Upload student photos with configurable positioning
- **Real-time Preview**: See the generated card in real-time as you input data
- **Canvas-based Rendering**: High-quality card generation using HTML5 Canvas
- **Download Functionality**: Download generated cards as PNG images
- **Form Validation**: Comprehensive validation for all input fields
- **Responsive Design**: Works on desktop and mobile devices
- **Secure Template System**: Template images served securely via API routes

## Tech Stack

- **Frontend**: React 19, Next.js 15, TypeScript
- **Styling**: TailwindCSS, Shadcn UI
- **AI Integration**: Google Gemini 2.5 Flash API
- **Image Processing**: HTML5 Canvas, html2canvas
- **Notifications**: Sonner (Toast notifications)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Google Gemini API key

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
```

3. Add your Google Gemini API key to `.env.local`:
```env
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Getting a Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the key and add it to your `.env.local` file

## Usage

### Card Template Selection
1. Choose from available university templates
2. Each template has different form fields and layouts

### Manual Entry
1. Select a university card template
2. Fill in the student information form (fields vary by template)
3. Upload a student photo (optional)
4. See the real-time preview
5. Download the generated card

### Auto-Generate
1. Select a university template
2. Click "Auto Generate" button
3. AI generates realistic data based on template
4. Review and modify if needed
5. Download the completed card

## Supported Universities

### Babu Banarasi Das University
- **Fields**: Student Name, Father's Name, Mobile Number, Batch Year
- **Template**: Traditional Indian university card design

### Indian Institute of Technology Madras
- **Fields**: Name, Date of Birth, Enrollment No, Department, Address, Date of Issue, Valid Until
- **Template**: Modern IIT card design

## Adding New Universities

The system is designed to be easily extensible. To add a new university:

1. **Add Images**:
   - Add demo image to `public/img/demo/` (for user selection)
   - Add template image to `public/img/phoi/` (for actual rendering)

2. **Update Configuration**:
   - Add new `CardType` enum value in `src/types/card.ts`
   - Add new template configuration in `src/config/cardTemplates.ts`
   - Define form fields, text positions, and photo positioning

3. **Template Configuration Structure**:
   ```typescript
   {
     id: CardType.YOUR_UNIVERSITY,
     name: 'University Name',
     description: 'Description',
     demoImagePath: '/img/demo/your-card.png',
     templateImagePath: '/img/phoi/your-card.png',
     dimensions: { width: 800, height: 500 },
     formFields: [...], // Define required fields
     textPositions: {...}, // Define text positioning
     photoPosition: {...} // Define photo positioning
   }
   ```

4. The system will automatically:
   - Show the new template in card selector
   - Generate appropriate forms
   - Handle data validation
   - Render cards with correct positioning

## Architecture

### Key Components

- **CardSelector**: Allows users to choose university templates
- **StudentForm**: Dynamic form that adapts to selected template
- **CardPreview**: Canvas-based card rendering with real-time preview
- **StudentCardGenerator**: Main orchestrator component

### Security Features

- Template images served via secure API routes (`/api/template/[cardType]`)
- Demo images publicly accessible for selection
- Template images in `phoi` folder protected from direct access

### Data Flow

1. User selects card template → CardSelector
2. Form fields update → StudentForm (dynamic based on template)
3. User fills data → Real-time validation
4. Canvas renders card → CardPreview (using template config)
5. User downloads → High-quality PNG export

## Troubleshooting

1. **API Key Error**: Check your Gemini API key in `.env.local`
2. **Template Not Loading**: Ensure `card-student.png` is in `public` folder
3. **Build Errors**: Verify all dependencies are installed
