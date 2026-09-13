import React, { useState, useRef } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  CheckCircle2, 
  ShieldAlert, 
  Building2, 
  UserCheck, 
  Calendar, 
  RotateCcw,
  Sparkles,
  AlertTriangle,
  Scale,
  ShieldCheck,
  Clock,
  Ban,
  Zap,
  Home,
  KeyRound,
  Check
} from 'lucide-react';
import { BookingInquiry, HostelConfig } from '../types';
import { 
  generateRentAgreementPDF, 
  triggerFileDownload, 
  printDocumentSheet 
} from '../lib/pdfExportUtil';

interface StudentRentAgreementDocProps {
  student: BookingInquiry;
  config: HostelConfig;
}

export default function StudentRentAgreementDoc({
  student,
  config
}: StudentRentAgreementDocProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Editable fields for the agreement
  const [studentName, setStudentName] = useState(student.fullName || '');
  const [guardianName, setGuardianName] = useState('');
  const [permanentAddress, setPermanentAddress] = useState(student.hometown || '');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [studentPhone, setStudentPhone] = useState(student.phone || '');
  const [guardianPhone, setGuardianPhone] = useState((student as any).parentPhone || student.guardianPhone || '');
  const [roomNumber, setRoomNumber] = useState(student.roomNumber || 'Room Assigned');
  const [admissionDate, setAdmissionDate] = useState(student.checkInDate || new Date().toISOString().split('T')[0]);
  const [securityDeposit, setSecurityDeposit] = useState(student.roomType === 'single' ? '4000' : '3000');
  const [month1Deposit, setMonth1Deposit] = useState(student.roomType === 'single' ? '2000' : '1500');
  const [month2Deposit, setMonth2Deposit] = useState(student.roomType === 'single' ? '2000' : '1500');

  const handleDownloadPDF = async () => {
    setIsExporting(true);
    setDownloadSuccess(false);

    try {
      const doc = generateRentAgreementPDF(
        {
          studentName,
          guardianName,
          permanentAddress,
          aadhaarNumber,
          studentPhone,
          guardianPhone,
          roomNumber,
          admissionDate,
          securityDeposit,
          month1Deposit,
          month2Deposit
        },
        config
      );

      const filename = `Modanwal_Hostel_Rent_Agreement_${(studentName || 'Student').replace(/\s+/g, '_')}.pdf`;
      // Save directly with jsPDF for instant download
      doc.save(filename);
      // Also trigger blob download for compatibility
      const blob = doc.output('blob');
      triggerFileDownload(blob, filename);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      console.error('Error generating Agreement PDF:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    if (printRef.current) {
      printDocumentSheet(`${config.hostelName || 'Modanwal Boys Hostel'} Rent Agreement & Rules`, printRef.current);
    } else {
      window.print();
    }
  };

  const handleResetToBlank = () => {
    setStudentName('');
    setGuardianName('');
    setPermanentAddress('');
    setAadhaarNumber('');
    setStudentPhone('');
    setGuardianPhone('');
    setRoomNumber('');
    setAdmissionDate('');
    setSecurityDeposit('');
    setMonth1Deposit('');
    setMonth2Deposit('');
  };

  const handleFillFromProfile = () => {
    setStudentName(student.fullName || '');
    setPermanentAddress(student.hometown || '');
    setStudentPhone(student.phone || '');
    setGuardianPhone((student as any).parentPhone || student.guardianPhone || '');
    setRoomNumber(student.roomNumber || 'Room Assigned');
    setAdmissionDate(student.checkInDate || new Date().toISOString().split('T')[0]);
    setSecurityDeposit(student.roomType === 'single' ? '4000' : '3000');
    setMonth1Deposit(student.roomType === 'single' ? '2000' : '1500');
    setMonth2Deposit(student.roomType === 'single' ? '2000' : '1500');
  };

  return (
    <div className="space-y-6 animate-fadeIn" id="student-rent-agreement-module">
      
      {/* Action Bar / Controls Banner */}
      <div className="bg-slate-900 text-white p-5 rounded-3xl border border-slate-800 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-amber-400" />
            <h3 className="font-display font-black text-base sm:text-lg">
              हॉस्टल किराया अनुबंध एवं नियम पुस्तिका (Legal Rent Agreement & Rule Book)
            </h3>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            आधिकारिक 2-पेज लीगल PDF डाउनलोड करें या सीधे A4 प्रिंट निकालें। विद्यार्थी व अभिभावक द्वारा हस्ताक्षरित होना अनिवार्य है।
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleFillFromProfile}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Auto-fill with student profile details"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Auto Fill
          </button>

          <button
            type="button"
            onClick={handleResetToBlank}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Clear all fields for blank printable sheet"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Blank Form
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Print entire agreement with official Hindi format"
          >
            <Printer className="w-3.5 h-3.5" /> Print A4 / Save PDF
          </button>

          <button
            type="button"
            onClick={handleDownloadPDF}
            disabled={isExporting}
            className={`px-4 py-2 ${downloadSuccess ? 'bg-emerald-700' : 'bg-emerald-600 hover:bg-emerald-700'} disabled:opacity-50 text-white text-xs font-black rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer`}
          >
            {downloadSuccess ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />
                <span>PDF Downloaded!</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>{isExporting ? 'Generating PDF...' : 'Download Official PDF'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Quick Summary Highlights for Student */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-xs">
          <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-black text-amber-950 block">किराया देय तिथि: हर माह 5 तारीख</span>
            <span className="text-amber-900 leading-relaxed">
              5 तारीख तक एडवांस किराया अनिवार्य। 10 तारीख तक जमा न होने पर कमरा खाली करवा लिया जाएगा।
            </span>
          </div>
        </div>

        <div className="bg-indigo-50/90 border border-indigo-200 rounded-2xl p-4 flex items-start gap-3 text-xs">
          <ShieldAlert className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-black text-indigo-950 block">60 दिन (2 माह) की पूर्व लिखित सूचना</span>
            <span className="text-indigo-900 leading-relaxed">
              हॉस्टल छोड़ने व सिक्योरिटी एडजस्ट कराने हेतु 60 दिन पूर्व लिखित सूचना अनिवार्य है।
            </span>
          </div>
        </div>

        <div className="bg-rose-50/90 border border-rose-200 rounded-2xl p-4 flex items-start gap-3 text-xs">
          <Ban className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-black text-rose-950 block">जीरो टॉलरेंस: नशा, शराब व मारपीट</span>
            <span className="text-rose-900 leading-relaxed">
              परिसर में शराब, सिगरेट या गुंडागर्दी पर तुरंत निष्कासन, डिपाजिट जब्ती एवं पुलिस कार्रवाई।
            </span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* PRINTABLE AGREEMENT DOCUMENT SHEET (A4 Structured Paper) */}
      {/* ======================================================== */}
      <div 
        ref={printRef}
        className="bg-white p-6 sm:p-10 rounded-3xl border-2 border-slate-800 shadow-2xl space-y-6 text-slate-900 mx-auto max-w-4xl font-sans"
      >
        
        {/* Document Header - Legal Stamp Style */}
        <div className="border-2 border-slate-900 rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white p-5 text-center relative">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Building2 className="w-6 h-6 text-amber-400" />
              <h1 className="font-black text-xl sm:text-2xl tracking-wide uppercase text-white">
                {config.hostelName || 'MODANWAL BOYS HOSTEL'}
              </h1>
            </div>
            <h2 className="font-bold text-sm sm:text-base text-amber-300">
              हॉस्टल प्रवेश अनुबंध, किराया समझौता एवं सख्त आचार संहिता (Lease Deed & Code of Conduct)
            </h2>
            <p className="text-[11px] text-slate-300 mt-1">
              निकट श्री रामस्वरूप मेमोरियल यूनिवर्सिटी (SRMU), ग्राम-तिन्दोला, बाराबंकी (उ.प्र.) • 24x7 हेल्पलाइन: {config.phone || '+91 99361 80282'}
            </p>
          </div>

          <div className="bg-slate-100 px-4 py-2 border-t border-slate-300 flex flex-wrap items-center justify-between text-xs font-mono font-bold text-slate-700">
            <span>अनुबंध क्रमांक: MBH/AGR/{new Date().getFullYear()}/{roomNumber ? roomNumber.replace(/[^0-9]/g, '') : '101'}</span>
            <span>दिनांक (Date): {admissionDate || new Date().toLocaleDateString('en-IN')}</span>
          </div>
        </div>

        {/* Section 1: विद्यार्थी एवं कमरा आवंटन विवरण (Student & Allotment Particulars) */}
        <div className="space-y-3">
          <div className="bg-slate-900 text-white px-3.5 py-1.5 rounded-lg font-black text-xs uppercase tracking-wider flex items-center justify-between">
            <span>1. विद्यार्थी एवं कमरा आवंटन विवरण (Resident Particulars):</span>
            <span className="text-amber-400 text-[10px] font-mono">भाग - 1</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3.5 text-xs bg-slate-50/70 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 border-b border-slate-300 pb-1.5">
              <span className="font-bold text-slate-700 whitespace-nowrap">• विद्यार्थी का पूरा नाम:</span>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="पूरा नाम दर्ज करें"
                className="w-full bg-transparent font-black text-slate-900 focus:outline-none focus:bg-amber-50 px-1 py-0.5 rounded"
              />
            </div>

            <div className="flex items-center gap-2 border-b border-slate-300 pb-1.5">
              <span className="font-bold text-slate-700 whitespace-nowrap">• पिता / अभिभावक का नाम:</span>
              <input
                type="text"
                value={guardianName}
                onChange={(e) => setGuardianName(e.target.value)}
                placeholder="पिता का नाम"
                className="w-full bg-transparent font-black text-slate-900 focus:outline-none focus:bg-amber-50 px-1 py-0.5 rounded"
              />
            </div>

            <div className="flex items-center gap-2 border-b border-slate-300 pb-1.5 md:col-span-2">
              <span className="font-bold text-slate-700 whitespace-nowrap">• स्थायी पता (Permanent Address):</span>
              <input
                type="text"
                value={permanentAddress}
                onChange={(e) => setPermanentAddress(e.target.value)}
                placeholder="गांव / शहर, तहसील, जिला, राज्य एवं पिन कोड"
                className="w-full bg-transparent font-bold text-slate-900 focus:outline-none focus:bg-amber-50 px-1 py-0.5 rounded"
              />
            </div>

            <div className="flex items-center gap-2 border-b border-slate-300 pb-1.5">
              <span className="font-bold text-slate-700 whitespace-nowrap">• आधार कार्ड नंबर (Aadhaar No):</span>
              <input
                type="text"
                value={aadhaarNumber}
                onChange={(e) => setAadhaarNumber(e.target.value)}
                placeholder="XXXX XXXX XXXX"
                className="w-full bg-transparent font-mono font-bold text-slate-900 focus:outline-none focus:bg-amber-50 px-1 py-0.5 rounded"
              />
            </div>

            <div className="flex items-center gap-2 border-b border-slate-300 pb-1.5">
              <span className="font-bold text-slate-700 whitespace-nowrap">• विद्यार्थी का मोबाइल नंबर:</span>
              <input
                type="text"
                value={studentPhone}
                onChange={(e) => setStudentPhone(e.target.value)}
                placeholder="10 अंकों का मोबाइल नंबर"
                className="w-full bg-transparent font-mono font-bold text-slate-900 focus:outline-none focus:bg-amber-50 px-1 py-0.5 rounded"
              />
            </div>

            <div className="flex items-center gap-2 border-b border-slate-300 pb-1.5">
              <span className="font-bold text-slate-700 whitespace-nowrap">• पिता/अभिभावक का मोबाइल नं.:</span>
              <input
                type="text"
                value={guardianPhone}
                onChange={(e) => setGuardianPhone(e.target.value)}
                placeholder="अभिभावक का फोन नंबर"
                className="w-full bg-transparent font-mono font-bold text-slate-900 focus:outline-none focus:bg-amber-50 px-1 py-0.5 rounded"
              />
            </div>

            <div className="flex items-center gap-2 border-b border-slate-300 pb-1.5">
              <span className="font-bold text-slate-700 whitespace-nowrap">• आवंटित कमरा नंबर (Room No):</span>
              <input
                type="text"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                placeholder="उदा. Room 102"
                className="w-full bg-transparent font-black text-indigo-900 focus:outline-none focus:bg-amber-50 px-1 py-0.5 rounded"
              />
            </div>

            <div className="flex items-center gap-2 border-b border-slate-300 pb-1.5">
              <span className="font-bold text-slate-700 whitespace-nowrap">• प्रवेश की तिथि (Admission Date):</span>
              <input
                type="text"
                value={admissionDate}
                onChange={(e) => setAdmissionDate(e.target.value)}
                placeholder="DD/MM/YYYY"
                className="w-full bg-transparent font-bold text-slate-900 focus:outline-none focus:bg-amber-50 px-1 py-0.5 rounded"
              />
            </div>

            <div className="flex items-center gap-2 border-b border-slate-300 pb-1.5 md:col-span-2">
              <span className="font-bold text-slate-700 whitespace-nowrap">• सिक्योरिटी मनी (Security Money):</span>
              <span className="font-black text-slate-900">₹</span>
              <input
                type="text"
                value={securityDeposit}
                onChange={(e) => setSecurityDeposit(e.target.value)}
                placeholder="कुल सिक्योरिटी राशि"
                className="w-24 bg-transparent font-mono font-black text-slate-900 focus:outline-none focus:bg-amber-50 px-1 py-0.5 rounded"
              />
              <span className="text-slate-600 text-[11px] ml-1">
                (किश्त 1: ₹
                <input
                  type="text"
                  value={month1Deposit}
                  onChange={(e) => setMonth1Deposit(e.target.value)}
                  className="w-14 bg-transparent font-bold text-slate-900 text-center border-b border-slate-400 focus:outline-none"
                />
                , किश्त 2: ₹
                <input
                  type="text"
                  value={month2Deposit}
                  onChange={(e) => setMonth2Deposit(e.target.value)}
                  className="w-14 bg-transparent font-bold text-slate-900 text-center border-b border-slate-400 focus:outline-none"
                />
                )
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: 8 सख्त नियम एवं शर्तें (8 Essential Terms & Conditions) */}
        <div className="space-y-4 pt-2">
          <div className="bg-rose-950 text-white px-3.5 py-1.5 rounded-lg font-black text-xs uppercase tracking-wider flex items-center justify-between">
            <span>2. अनिवार्य एवं सख्त नियम एवं शर्तें (Terms & Conditions):</span>
            <span className="text-rose-300 text-[10px] font-mono">भाग - 2</span>
          </div>

          <div className="space-y-3 text-xs text-slate-800">
            
            {/* Rule 1 */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <h4 className="font-black text-slate-950 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] font-black flex items-center justify-center">1</span>
                <span>किराया जमा करने की तिथि और जुर्माना (Rent Advance & Eviction):</span>
              </h4>
              <p className="mt-1 pl-7 text-slate-700 leading-relaxed">
                हर महीने की <strong>5 तारीख तक</strong> कमरे का किराया एडवांस में जमा करना अनिवार्य है। यदि <strong>10 तारीख तक</strong> किराया जमा नहीं होता है, तो हॉस्टल प्रबंधन को बिना किसी पूर्व सूचना के कमरा खाली करवाने का पूर्ण अधिकार होगा।
              </p>
            </div>

            {/* Rule 2 */}
            <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200">
              <h4 className="font-black text-amber-950 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-600 text-white text-[10px] font-black flex items-center justify-center">2</span>
                <span>सिक्योरिटी मनी और 60 दिन की पूर्व सूचना (Security Deposit & 60-Day Notice):</span>
              </h4>
              <p className="mt-1 pl-7 text-amber-900 leading-relaxed">
                हॉस्टल में <strong>कम से कम 3 महीने रहना अनिवार्य</strong> है। 3 महीने से पहले हॉस्टल छोड़ने पर सिक्योरिटी मनी 100% जब्त (Forfeit) होगी। सिक्योरिटी मनी किसी भी दशा में नकद वापस नहीं होगी, यह अंतिम महीने के किराये में एडजस्ट की जाएगी। सिक्योरिटी एडजस्ट कराने हेतु <strong>पूरे 2 महीने (60 दिन) पहले लिखित सूचना देना अनिवार्य</strong> है। बिना 60 दिन की पूर्व सूचना के हॉस्टल छोड़ने पर कोई एडजस्टमेंट नहीं होगा।
              </p>
            </div>

            {/* Rule 3 */}
            <div className="p-3 bg-rose-50/70 rounded-xl border border-rose-200">
              <h4 className="font-black text-rose-950 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-rose-600 text-white text-[10px] font-black flex items-center justify-center">3</span>
                <span>जीरो टॉलरेंस - नशा, शराब और मारपीट (Zero Tolerance - Discipline):</span>
              </h4>
              <p className="mt-1 pl-7 text-rose-900 leading-relaxed font-medium">
                हॉस्टल परिसर, कमरों या छत पर <strong>शराब, सिगरेट, गुटखा या किसी भी प्रकार का नशा करना सख्त वर्जित (Strictly Prohibited)</strong> है। किसी भी प्रकार की गाली-गलौज, लड़ाई या गुंडागर्दी पर विद्यार्थी को तुरंत निष्कासित किया जाएगा, सिक्योरिटी जब्त होगी एवं पुलिस में शिकायत दर्ज होगी।
              </p>
            </div>

            {/* Rule 4 */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <h4 className="font-black text-slate-950 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] font-black flex items-center justify-center">4</span>
                <span>बिजली के भारी उपकरण एवं संपत्ति का नुकसान (Electrical Appliances & Damage):</span>
              </h4>
              <p className="mt-1 pl-7 text-slate-700 leading-relaxed">
                कमरे में हीटर, कुकिंग इंडक्शन या अत्यधिक बिजली खींचने वाले उपकरण चलाना सख्त मना है। हॉस्टल की संपत्ति (फर्नीचर, पंखे, नल, स्विच) को नुकसान पहुंचाने पर 100% लागत की वसूली विद्यार्थी से की जाएगी।
              </p>
            </div>

            {/* Rule 5 */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <h4 className="font-black text-slate-950 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] font-black flex items-center justify-center">5</span>
                <span>बाहरी मित्रों का रात्रि विश्राम निषेध (Strict No-Guest Policy):</span>
              </h4>
              <p className="mt-1 pl-7 text-slate-700 leading-relaxed">
                किसी भी बाहरी व्यक्ति, सहपाठी या मित्र को कमरे में रात्रि विश्राम (Night Stay) कराने की बिल्कुल अनुमति नहीं है। मिलने हेतु ग्राउंड फ्लोर विज़िटर लाउंज का ही उपयोग करें।
              </p>
            </div>

            {/* Rule 6 */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <h4 className="font-black text-slate-950 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] font-black flex items-center justify-center">6</span>
                <span>प्रबंधन द्वारा औचक निरीक्षण (Right of Surprise Inspection):</span>
              </h4>
              <p className="mt-1 pl-7 text-slate-700 leading-relaxed">
                सुरक्षा, शांति और नियमों के पालन हेतु हॉस्टल प्रबंधन/वार्डन के पास किसी भी समय (दिन या रात) कमरों की चेकिंग करने का पूर्ण कानूनी अधिकार सुरक्षित है।
              </p>
            </div>

            {/* Rule 7 */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <h4 className="font-black text-slate-950 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] font-black flex items-center justify-center">7</span>
                <span>कीमती सामानों की सुरक्षा एवं ताला (Safety of Valuables & Locks):</span>
              </h4>
              <p className="mt-1 pl-7 text-slate-700 leading-relaxed">
                विद्यार्थी अपने लैपटॉप, मोबाइल एवं नकद सामान की सुरक्षा के लिए स्वयं उत्तरदायी होंगे। कमरे से बाहर जाते समय ताला अवश्य लगाएं। चोरी होने पर प्रबंधन उत्तरदायी नहीं होगा।
              </p>
            </div>

            {/* Rule 8 */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <h4 className="font-black text-slate-950 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] font-black flex items-center justify-center">8</span>
                <span>दीवारों का रखरखाव एवं अध्ययन शांति (Wall Hygiene & Silence Hours):</span>
              </h4>
              <p className="mt-1 pl-7 text-slate-700 leading-relaxed">
                दीवारों पर पोस्टर चिपकाना, कील ठोकना या गुटखा थूकना सख्त मना है। रंगाई-पुताई का खर्च सिक्योरिटी से काटा जाएगा। रात्रि 11:00 बजे से प्रातः 6:00 बजे तक पूर्ण शांति बनाए रखें।
              </p>
            </div>

          </div>
        </div>

        {/* Section 3: कानूनी घोषणा एवं शपथ (Legal Undertaking & Declaration) */}
        <div className="pt-2 space-y-4">
          <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl text-xs font-semibold text-amber-950 leading-relaxed">
            <span className="font-black text-sm block mb-1 text-amber-950">
              शपथ एवं कानूनी घोषणा (Resident & Guardian Declaration):
            </span>
            "मैंने ऊपर उल्लिखित सभी 8 सख्त नियमों, किराया भुगतान की 5 तारीख की समय-सीमा, न्यूनतम 3 माह के ठहराव तथा हॉस्टल छोड़ने से पूर्व 60 दिन (2 माह) की अनिवार्य पूर्व सूचना की शर्तों को भली-भांति पढ़ व समझ लिया है। मैं इन सभी नियमों का शत-प्रतिशत निष्ठा से पालन करने का वचन देता हूँ। किसी भी नियम के उल्लंघन की स्थिति में हॉस्टल प्रबंधन द्वारा निष्कासन एवं डिपाजिट जब्ती का निर्णय अंतिम व सर्वमान्य होगा।"
          </div>

          {/* 4 Signature Blocks */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 text-xs text-center">
            <div className="space-y-6">
              <div className="border-b-2 border-dashed border-slate-700 h-10"></div>
              <span className="font-bold text-slate-900 block text-[11px]">
                विद्यार्थी के हस्ताक्षर<br /><span className="text-slate-500 font-normal">(Signature of Student)</span>
              </span>
            </div>

            <div className="space-y-6">
              <div className="border-b-2 border-dashed border-slate-700 h-10 font-mono font-bold text-slate-800 pt-4 text-[11px]">
                {admissionDate || new Date().toLocaleDateString('en-IN')}
              </div>
              <span className="font-bold text-slate-900 block text-[11px]">
                हस्ताक्षर दिनांक<br /><span className="text-slate-500 font-normal">(Date of Signing)</span>
              </span>
            </div>

            <div className="space-y-6">
              <div className="border-b-2 border-dashed border-slate-700 h-10"></div>
              <span className="font-bold text-slate-900 block text-[11px]">
                अभिभावक के हस्ताक्षर<br /><span className="text-slate-500 font-normal">(Signature of Parent)</span>
              </span>
            </div>

            <div className="space-y-6">
              <div className="border-b-2 border-dashed border-slate-700 h-10 font-black text-indigo-950 pt-4 text-[11px]">
                {config.caretakerName || 'Authorized Signatory'}
              </div>
              <span className="font-bold text-slate-900 block text-[11px]">
                हॉस्टल मालिक / वार्डन<br /><span className="text-slate-500 font-normal">(Hostel Proprietor / Seal)</span>
              </span>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="pt-4 border-t border-slate-200 text-center text-[10px] text-slate-500 font-medium">
          {config.hostelName || 'Modanwal Boys Hostel'} Official Record Copy • Tindola, Barabanki • Helpline: {config.phone}
        </div>

      </div>

    </div>
  );
}
