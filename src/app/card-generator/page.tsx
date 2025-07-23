"use client";

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Download, Sparkles, FileText } from 'lucide-react';

// Types
interface University {
  name: string;
  shortName: string;
  logo: string;
}

// University data
const universities: University[] = [
  {
    name: "Indian Institute of Technology Bombay",
    shortName: "IITB",
    logo: "https://upload.wikimedia.org/wikipedia/en/1/1d/Indian_Institute_of_Technology_Bombay_Logo.svg"
  },
  {
    name: "Indian Institute of Technology Delhi", 
    shortName: "IITD",
    logo: "https://upload.wikimedia.org/wikipedia/en/f/fd/Indian_Institute_of_Technology_Delhi_Logo.svg"
  },
  {
    name: "Indian Institute of Science Bangalore",
    shortName: "IISc", 
    logo: "https://engageindia.ca/wp-content/uploads/2017/01/IISc-500x500.png"
  },
  {
    name: "Indian Institute of Technology Madras",
    shortName: "IITM",
    logo: "https://upload.wikimedia.org/wikipedia/en/6/69/IIT_Madras_Logo.svg"
  },
  {
    name: "Indian Institute of Technology Kanpur",
    shortName: "IITK", 
    logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTzlbzSORQuaiBM1uuqdVUtJh3WB0-YjbTMiA&s"
  },
  {
    name: "Indian Institute of Technology Kharagpur",
    shortName: "IITKgp",
    logo: "https://upload.wikimedia.org/wikipedia/en/1/1c/IIT_Kharagpur_Logo.svg"
  },
  {
    name: "University of Delhi",
    shortName: "DU",
    logo: "https://upload.wikimedia.org/wikipedia/commons/e/e9/University_of_delhi_logo.png"
  },
  {
    name: "Jawaharlal Nehru University", 
    shortName: "JNU",
    logo: "https://pbs.twimg.com/media/GAgQfbPbsAADBVf.jpg"
  },
  {
    name: "Indian Institute of Management Ahmedabad",
    shortName: "IIMA",
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/c/cd/IIM%2C_Ahmedabad_Logo.svg/1200px-IIM%2C_Ahmedabad_Logo.svg.png"
  },
  {
    name: "Banaras Hindu University",
    shortName: "BHU", 
    logo: "https://upload.wikimedia.org/wikipedia/en/c/ca/Banaras_Hindu_University_Emblem_Seal_Transparent.png"
  }
];

// Indian names
const indianNames = [
  "Aarav Sharma", "Vivaan Patel", "Aditya Gupta", "Vihaan Singh", "Arjun Kumar",
  "Sai Reddy", "Reyansh Agarwal", "Ayaan Khan", "Krishna Joshi", "Ishaan Verma", 
  "Ananya Sharma", "Diya Patel", "Aadhya Gupta", "Kavya Singh", "Anvi Kumar",
  "Saanvi Reddy", "Larisa Agarwal", "Myra Khan", "Aanya Joshi", "Pihu Verma",
  "Aryan Mehta", "Kabir Nair", "Shivansh Roy", "Atharv Das", "Rudra Bose",
  "Priya Iyer", "Riya Ghosh", "Sara Banerjee", "Tara Kulkarni", "Nisha Desai"
];

// Departments
const departments = [
  "Computer Science", "Information Technology", "Electronics Engineering",
  "Mechanical Engineering", "Civil Engineering", "Chemical Engineering", 
  "Biotechnology", "Physics", "Mathematics", "Chemistry", "Business Administration",
  "Economics", "Psychology", "English Literature", "History", "Political Science"
];

export default function CardGeneratorPage() {
  // Add CSS styles for shine effect
  const shineStyles = `
    @keyframes shine {
      0% {
        transform: translateX(-100%) translateY(-100%) rotate(30deg);
      }
      100% {
        transform: translateX(100%) translateY(100%) rotate(30deg);
      }
    }

    .shine-effect {
      position: relative;
      overflow: hidden;
      box-shadow: 0 0 30px rgba(59, 130, 246, 0.3), 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      transform: scale(1.02);
      transition: all 0.3s ease;
    }

    .shine-overlay {
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: linear-gradient(
        45deg,
        transparent 30%,
        rgba(255, 255, 255, 0.3) 50%,
        rgba(255, 255, 255, 0.6) 52%,
        rgba(255, 255, 255, 0.3) 54%,
        transparent 70%
      );
      animation: shine 2s ease-in-out;
      pointer-events: none;
    }

    @keyframes sparkle {
      0%, 100% {
        opacity: 0;
        transform: scale(0);
      }
      50% {
        opacity: 1;
        transform: scale(1);
      }
    }

    .sparkle {
      position: absolute;
      width: 6px;
      height: 6px;
      background: radial-gradient(circle, #fff 0%, #ffd700 50%, transparent 70%);
      border-radius: 50%;
      animation: sparkle 1.5s ease-in-out infinite;
    }

    .sparkle-1 {
      top: 20%;
      left: 15%;
      animation-delay: 0.2s;
    }

    .sparkle-2 {
      top: 60%;
      left: 80%;
      animation-delay: 0.5s;
    }

    .sparkle-3 {
      top: 30%;
      left: 70%;
      animation-delay: 0.8s;
    }

    .sparkle-4 {
      top: 80%;
      left: 25%;
      animation-delay: 1.1s;
    }

    .sparkle-5 {
      top: 45%;
      left: 50%;
      animation-delay: 1.4s;
    }

    .sparkle-6 {
      top: 15%;
      left: 30%;
      animation-delay: 0.3s;
    }

    .sparkle-7 {
      top: 25%;
      left: 85%;
      animation-delay: 0.7s;
    }

    .sparkle-8 {
      top: 10%;
      left: 60%;
      animation-delay: 1.0s;
    }
  `;

  // Inject styles
  if (typeof document !== 'undefined') {
    const styleElement = document.getElementById('shine-styles');
    if (!styleElement) {
      const style = document.createElement('style');
      style.id = 'shine-styles';
      style.textContent = shineStyles;
      document.head.appendChild(style);
    }
  }
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [cardGenerated, setCardGenerated] = useState(false);
  const [showShineEffect, setShowShineEffect] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Utility functions
  const getRandomElement = (array: unknown[]) => {
    return array[Math.floor(Math.random() * array.length)];
  };

  const generateRandomDate = () => {
    const today = new Date();
    const minAge = 20;
    const maxAge = 25;
    
    const randomAge = minAge + Math.floor(Math.random() * (maxAge - minAge + 1));
    const birthYear = today.getFullYear() - randomAge;
    const birthMonth = Math.floor(Math.random() * 12) + 1;
    const birthDay = Math.floor(Math.random() * 28) + 1;
    
    return `${birthYear}-${birthMonth.toString().padStart(2, '0')}-${birthDay.toString().padStart(2, '0')}`;
  };

  const generateStudentID = (universityShort: string) => {
    const year = new Date().getFullYear();
    const randomNumber = Math.floor(Math.random() * 9999999999).toString().padStart(10, '0');
    return `${universityShort}${year}.${randomNumber}`;
  };

  const generateCourse = () => {
    const currentYear = new Date().getFullYear();
    const startYear = currentYear;
    const endYear = startYear + 4;
    return `${startYear} - ${endYear}`;
  };

  const generateClass = () => {
    const deptCodes = ["CS", "IT", "EE", "ME", "CE", "CHE", "BT"];
    const degrees = ["BTech", "MTech", "PhD", "BSc", "MSc"];
    const year = new Date().getFullYear();
    
    return `${getRandomElement(deptCodes)}-${getRandomElement(degrees)}-${year}`;
  };

  const generateValidUntil = () => {
    const today = new Date();
    const validDate = new Date(today.getFullYear() + 3, today.getMonth(), today.getDate());
    return validDate.toLocaleDateString('en-GB');
  };

  // Get random student photo
  const getRandomStudentPhoto = async () => {
    try {
      const response = await fetch('/api/load-faces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          "type": "R",
          "age": "21-35", 
          "race": "asian",
          "emotion": "none"
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.fc && data.fc.length > 0) {
          const randomIndex = Math.floor(Math.random() * data.fc.length);
          const imageUrl = data.fc[randomIndex];
          return imageUrl;
        } else {
          throw new Error('No images in response');
        }
      } else {
        const errorData = await response.json();
        throw new Error(`HTTP ${response.status}: ${errorData.error || response.statusText}`);
      }
    } catch (error) {
      throw error;
    }
  };

  const generateStudentCard = async () => {
    setIsGenerating(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const university = getRandomElement(universities) as University;
      const studentName = getRandomElement(indianNames) as string;
      const department = getRandomElement(departments) as string;
      const dob = generateRandomDate();
      const course = generateCourse();
      const studentClass = generateClass();
      const studentID = generateStudentID(university.shortName);
      const validUntil = generateValidUntil();

      // Get student photo
      const studentPhoto = await getRandomStudentPhoto();

      // Update card information
      const universityNameEl = document.getElementById('university-name');
      const studentNameEl = document.getElementById('student-name');
      const studentDobEl = document.getElementById('student-dob');
      const studentCourseEl = document.getElementById('student-course');
      const studentClassEl = document.getElementById('student-class');
      const studentDepartmentEl = document.getElementById('student-department');
      const studentIdEl = document.getElementById('student-id');
      const validUntilEl = document.getElementById('valid-until');
      const universityLogoEl = document.getElementById('university-logo') as HTMLImageElement;
      const studentPhotoEl = document.getElementById('student-photo') as HTMLImageElement;
      const barcodeEl = document.getElementById('barcode') as HTMLImageElement;

      if (universityNameEl) universityNameEl.textContent = university.name;
      if (studentNameEl) studentNameEl.textContent = studentName;
      if (studentDobEl) studentDobEl.textContent = dob;
      if (studentCourseEl) studentCourseEl.textContent = course;
      if (studentClassEl) studentClassEl.textContent = studentClass;
      if (studentDepartmentEl) studentDepartmentEl.textContent = department;
      if (studentIdEl) studentIdEl.innerHTML = `🆔 Student ID: ${studentID}`;
      if (validUntilEl) validUntilEl.textContent = validUntil;
      
      if (universityLogoEl) universityLogoEl.src = university.logo;
      if (studentPhotoEl) studentPhotoEl.src = studentPhoto;
      
      // Update barcode
      const barcodeUrl = `/api/barcode?data=${encodeURIComponent(university.name)}&code=Code128`;
      if (barcodeEl) barcodeEl.src = barcodeUrl;
      
      await new Promise(resolve => setTimeout(resolve, 1000));

      setCardGenerated(true);

      // Trigger shine effect
      setShowShineEffect(true);
      setTimeout(() => setShowShineEffect(false), 2000); // Remove after 2 seconds

      toast.success('🎉 Student card generated successfully!');

    } catch (error) {
      console.error('Generation error:', error);
      toast.error(`❌ Unable to generate student card. ${error}`);
    } finally {
      setIsGenerating(false);
    }
  };



  const downloadCard = async () => {
    if (!cardRef.current) return;

    setIsDownloading(true);

    try {
      // Dynamic import html2canvas-pro
      const html2canvas = (await import('html2canvas-pro')).default;

      // Create a clean copy of the card for capture
      const originalCard = cardRef.current;
      const cardClone = originalCard.cloneNode(true) as HTMLElement;

      // Remove problematic elements and styles
      cardClone.querySelectorAll('.shine-overlay, .sparkle').forEach(el => el.remove());
      cardClone.style.transform = 'none';
      cardClone.style.boxShadow = 'none';
      cardClone.style.filter = 'none';

      // Temporarily add clone to DOM for capture
      cardClone.style.position = 'absolute';
      cardClone.style.left = '-9999px';
      cardClone.style.top = '0';
      document.body.appendChild(cardClone);

      const canvas = await html2canvas(cardClone, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false
      });

      // Remove clone
      document.body.removeChild(cardClone);

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          link.download = `student-card-${timestamp}.png`;
          link.href = url;

          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          URL.revokeObjectURL(url);
          toast.success('💾 Card downloaded as PNG successfully!');
        }
      }, 'image/png', 1.0);

    } catch (error) {
      console.error('Download error:', error);
      toast.error(`❌ Unable to download card. ${error}`);
    } finally {
      setIsDownloading(false);
    }
  };

  const downloadCardAsPDF = async () => {
    if (!cardRef.current) return;

    setIsDownloading(true);

    try {
      // Dynamic imports
      const html2canvas = (await import('html2canvas-pro')).default;
      const jsPDF = (await import('jspdf')).default;

      // Create a clean copy of the card for capture
      const originalCard = cardRef.current;
      const cardClone = originalCard.cloneNode(true) as HTMLElement;

      // Remove problematic elements and styles
      cardClone.querySelectorAll('.shine-overlay, .sparkle').forEach(el => el.remove());
      cardClone.style.transform = 'none';
      cardClone.style.boxShadow = 'none';
      cardClone.style.filter = 'none';

      // Temporarily add clone to DOM for capture
      cardClone.style.position = 'absolute';
      cardClone.style.left = '-9999px';
      cardClone.style.top = '0';
      document.body.appendChild(cardClone);

      const canvas = await html2canvas(cardClone, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false
      });

      // Remove clone
      document.body.removeChild(cardClone);

      const imgData = canvas.toDataURL('image/png');

      // Create PDF with card dimensions
      const cardWidth = 85.6; // Credit card width in mm
      const cardHeight = 53.98; // Credit card height in mm

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [cardWidth, cardHeight]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, cardWidth, cardHeight);

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      pdf.save(`student-card-${timestamp}.pdf`);

      toast.success('📄 Card downloaded as PDF successfully!');

    } catch (error) {
      console.error('PDF Download error:', error);
      toast.error(`❌ Unable to download PDF. ${error}`);
    } finally {
      setIsDownloading(false);
    }
  };

  // Generate initial card on load
  useEffect(() => {
    generateStudentCard();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-indigo-100 p-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center py-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Main
              </Button>
            </Link>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🎓 Student Card Generator
          </h1>
          <p className="text-gray-600">
            Create professional student ID cards for Indian Universities
          </p>
        </div>
        
        {/* Controls */}
        <Card className="p-6 mb-8 bg-white/80 backdrop-blur-sm">
          <h2 className="text-xl font-semibold mb-4 text-center">🚀 Card Generator</h2>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button
              onClick={generateStudentCard}
              disabled={isGenerating}
              className="min-w-[180px]"
              size="lg"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {isGenerating ? "Generating..." : "🎲 Generate New Card"}
            </Button>
            <Button
              onClick={downloadCard}
              disabled={!cardGenerated || isDownloading}
              variant="outline"
              className="min-w-[180px]"
              size="lg"
            >
              <Download className="h-4 w-4 mr-2" />
              {isDownloading ? "Downloading..." : "💾 Download PNG"}
            </Button>
            <Button
              onClick={downloadCardAsPDF}
              disabled={!cardGenerated || isDownloading}
              variant="outline"
              className="min-w-[180px]"
              size="lg"
            >
              <FileText className="h-4 w-4 mr-2" />
              {isDownloading ? "Downloading..." : "📄 Download PDF"}
            </Button>
          </div>
        </Card>

        {/* Student Card */}
        <div className="flex justify-center">
          <div
            ref={cardRef}
            className={`w-[650px] min-h-[400px] bg-white border-none rounded-2xl shadow-2xl overflow-hidden font-sans relative transition-all duration-300 hover:shadow-3xl hover:-translate-y-1 ${
              showShineEffect ? 'shine-effect' : ''
            }`}
          >
            {/* Shine overlay - covers entire card including header */}
            {showShineEffect && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl z-50">
                <div className="shine-overlay"></div>
                {/* Sparkle particles */}
                <div className="sparkle sparkle-1"></div>
                <div className="sparkle sparkle-2"></div>
                <div className="sparkle sparkle-3"></div>
                <div className="sparkle sparkle-4"></div>
                <div className="sparkle sparkle-5"></div>
                <div className="sparkle sparkle-6"></div>
                <div className="sparkle sparkle-7"></div>
                <div className="sparkle sparkle-8"></div>
              </div>
            )}
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 min-h-[90px] flex items-center gap-5 relative">
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-400 via-yellow-400 via-green-400 via-blue-400 to-purple-400"></div>
              <Image
                id="university-logo"
                className="w-[85px] h-[85px] object-contain bg-white rounded-xl p-1.5 shadow-lg flex-shrink-0"
                src="https://i.pinimg.com/736x/64/07/67/6407676eb7f221b13cf517923d0c3652.jpg"
                alt="University Logo"
                width={85}
                height={85}
                unoptimized
              />
              <div className="flex flex-col justify-center">
                <div id="university-name" className="text-2xl font-bold tracking-wide mb-1 text-shadow">
                  Manipal Academy of Higher Education
                </div>
                <div className="text-yellow-300 text-xl font-semibold">
                  STUDENT CARD
                </div>
              </div>
            </div>

            {/* Info Section */}
            <div className="flex flex-wrap p-6 gap-6">
              <Image
                id="student-photo"
                className="w-[120px] h-[145px] object-cover border-2 border-gray-300 rounded-xl bg-gray-100 shadow-lg transition-transform hover:scale-105"
                src="https://channel.mediacdn.vn/prupload/879/2018/05/img20180503174618883.jpg"
                alt="Student Photo"
                width={120}
                height={145}
                unoptimized
              />
              <div className="flex-1 text-lg min-w-[250px]">
                {/* Student Name - Full width */}
                <div className="mb-3 p-2 rounded-lg hover:bg-gray-50 transition-colors border-b border-gray-200">
                  <span className="text-blue-700 font-semibold inline-block min-w-[120px]">👤 Name:</span>
                  <span id="student-name" className="font-bold text-xl text-gray-800">Jayson Jame</span>
                </div>

                {/* Two column layout for other info */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="mb-2 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <span className="text-blue-700 font-semibold block text-sm">📅 DOB:</span>
                    <span id="student-dob" className="font-medium">2003-10-10</span>
                  </div>
                  <div className="mb-2 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <span className="text-blue-700 font-semibold block text-sm">📚 Course:</span>
                    <span id="student-course" className="font-medium">2025 - 2028</span>
                  </div>
                  <div className="mb-2 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <span className="text-blue-700 font-semibold block text-sm">🎒 Class:</span>
                    <span id="student-class" className="font-medium">MIT-CS-BTech-2024</span>
                  </div>
                  <div className="mb-2 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <span className="text-blue-700 font-semibold block text-sm">🏛️ Department:</span>
                    <span id="student-department" className="font-medium">Information Technology</span>
                  </div>
                </div>

                {/* Valid until - Full width */}
                <div className="mt-3 p-2 rounded-lg ">
                  <span className="text-gray-700 font-semibold inline-block min-w-[120px]">⏰ Valid until:</span>
                  <span id="valid-until" className="font-bold text-gray-800">30/12/2027</span>
                </div>
              </div>
            </div>

            {/* Barcode */}
            <div className="flex justify-center px-6 mt-4 mb-3">
              <Image
                id="barcode"
                className="w-[90%] h-12 rounded shadow-sm border border-gray-200"
                src="/api/barcode?data=Manipal Academy of Higher Education&code=Code128"
                alt="Barcode"
                width={540}
                height={50}
                unoptimized
              />
            </div>

            {/* Bottom Info */}
            <div className="flex justify-between items-center px-6 pb-4">
              <div className="text-sm text-gray-700 bg-white px-4 py-2 rounded-lg font-semibold shadow-sm border border-gray-200">
                <span id="student-id">🆔 Student ID: MAHE2025.0370467829</span>
              </div>
              <div className="text-sm text-gray-700 bg-white px-4 py-2 rounded-lg font-semibold shadow-sm border border-gray-200">
                🇮🇳 India
              </div>
            </div>
          </div>
        </div>


      </div>
    </div>
  );
}
