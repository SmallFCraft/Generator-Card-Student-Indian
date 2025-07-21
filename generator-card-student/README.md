# Indian Student ID Card Generator

A modern web application that generates realistic Indian student ID cards for Babu Banarasi Das University using React 19, Next.js 15, and Google Gemini AI.

## Features

- **Manual Data Entry**: Fill in student information via a clean, modern form
- **AI-Powered Generation**: Auto-generate realistic Indian student data using Google Gemini AI
- **Photo Upload**: Upload student photos with 3:4 ratio support
- **Real-time Preview**: See the generated card in real-time as you input data
- **Canvas-based Rendering**: High-quality card generation using HTML5 Canvas
- **Download Functionality**: Download generated cards as PNG images
- **Form Validation**: Comprehensive validation for all input fields
- **Responsive Design**: Works on desktop and mobile devices

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

### Manual Entry
1. Fill in the student information form
2. Upload a student photo (optional)
3. See the real-time preview
4. Download the generated card

### Auto-Generate
1. Click "Auto Generate" button
2. AI generates realistic data
3. Review and modify if needed
4. Download the completed card

## Student Information Fields

- **Student Name**: Realistic Indian names
- **Father's Name**: Authentic Indian father names
- **Mobile Number**: Valid Indian format (+91 XXXXXXXXXX)
- **Batch Year**: Ensures students are 18+ years old
- **Photo**: 3:4 ratio positioned on right side

## Troubleshooting

1. **API Key Error**: Check your Gemini API key in `.env.local`
2. **Template Not Loading**: Ensure `card-student.png` is in `public` folder
3. **Build Errors**: Verify all dependencies are installed
