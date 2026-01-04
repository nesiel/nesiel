import React, { useState, useEffect, useRef } from 'react';
import { Database, Student, AppConfig, DEFAULT_CONFIG } from './types';
import { parseExcel, fileToBase64 } from './utils';
import { Podium } from './components/Podium';
import { StudentDetails } from './components/StudentDetails';
import { 
  Home, 
  ShoppingBag, 
  Settings, 
  Upload, 
  ShieldCheck, 
  LogOut, 
  Camera, 
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
  Search,
  Lock
} from 'lucide-react';

type ViewState = 'home' | 'shop' | 'admin';

function App() {
  const [db, setDb] = useState<Database>({});
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [showAll, setShowAll] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Auth Modal State
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authInput, setAuthInput] = useState("");
  const [authTarget, setAuthTarget] = useState<'admin_access' | 'student_view' | null>(null);
  const [pendingStudent, setPendingStudent] = useState<Student | null>(null);

  // Initialize from LocalStorage
  useEffect(() => {
    try {
      const storedDb = localStorage.getItem('bank_db');
      const storedCfg = localStorage.getItem('bank_cfg');
      if (storedDb) setDb(JSON.parse(storedDb));
      if (storedCfg) setConfig({ ...DEFAULT_CONFIG, ...JSON.parse(storedCfg) });
    } catch (e) {
      console.error("Error loading local storage", e);
    }
  }, []);

  // Save Config
  const saveConfig = (newConfig: AppConfig) => {
    setConfig(newConfig);
    localStorage.setItem('bank_cfg', JSON.stringify(newConfig));
  };

  // Handle Excel Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const newDb = await parseExcel(e.target.files[0]);
        setDb(newDb);
        localStorage.setItem('bank_db', JSON.stringify(newDb));
        alert('הנתונים עודכנו בהצלחה!');
      } catch (err) {
        alert('שגיאה בטעינת הקובץ. ודא שהוא תקין.');
        console.error(err);
      }
    }
  };

  // Handle Image Uploads
  const handleImageUpload = async (key: 'logo' | 'classImg', file: File) => {
    try {
      const base64 = await fileToBase64(file);
      const newConfig = { ...config, [key]: base64 };
      saveConfig(newConfig);
    } catch (e) {
      alert("שגיאה בהעלאת תמונה");
    }
  };

  // Delete Log Logic
  const handleDeleteLog = (studentName: string, index: number) => {
    if (!window.confirm("האם למחוק את הפעולה הזו?")) return;
    
    const newDb = { ...db };
    const student = newDb[studentName];
    if (student) {
      const log = student.logs[index];
      student.total -= log.s; // Reverse score
      student.logs.splice(index, 1); // Remove log
      setDb(newDb);
      localStorage.setItem('bank_db', JSON.stringify(newDb));
      
      // Update selected student view if open
      if (selectedStudent && selectedStudent.name === studentName) {
        setSelectedStudent({ ...student });
      }
    }
  };

  // Auth Handling
  const handleAuthSubmit = () => {
    if (authInput === config.pass) {
      if (authTarget === 'admin_access') {
        saveConfig({ ...config, isAuth: true });
        setCurrentView('admin');
      } else if (authTarget === 'student_view' && pendingStudent) {
        saveConfig({ ...config, isAuth: true });
        setSelectedStudent(pendingStudent);
        setPendingStudent(null);
      }
      setShowAuthModal(false);
      setAuthInput("");
    } else {
      alert("סיסמה שגויה");
    }
  };

  const attemptOpenStudent = (student: Student) => {
    if (config.isAuth) {
      setSelectedStudent(student);
    } else {
      setPendingStudent(student);
      setAuthTarget('student_view');
      setShowAuthModal(true);
    }
  };

  const attemptAdminAccess = () => {
    if (config.isAuth) {
      setCurrentView('admin');
    } else {
      setAuthTarget('admin_access');
      setShowAuthModal(true);
    }
  };

  // Derived Data
  const sortedStudents = (Object.values(db) as Student[]).sort((a, b) => b.total - a.total);
  const filteredStudents = sortedStudents.filter(s => s.name.includes(searchQuery));
  const displayStudents = showAll ? filteredStudents : filteredStudents.slice(0, 5);

  return (
    <div className="flex flex-col h-screen bg-[#2d1b15] text-[#fff8e1] font-sans">
      
      {/* --- Sidebar / Header --- */}
      <header className="flex-none bg-[#1a0f0d] border-b-2 border-[#d4af37] p-4 flex items-center justify-between z-30 shadow-lg relative">
        <div className="absolute top-1 right-2 text-[10px] text-[#d4af37]/60 font-mono">בס"ד</div>
        <div className="flex items-center gap-3 pt-2">
            {config.logo && (
                <img src={config.logo} alt="Logo" className="h-10 w-10 object-contain rounded-full border border-[#d4af37]" />
            )}
            <div>
                <h1 className="text-xl font-bold text-[#d4af37] leading-none">הבנק הכיתתי</h1>
                <p className="text-xs text-[#d4af37]/70 italic mt-1">{config.slogan}</p>
            </div>
        </div>
        {config.isAuth && (
            <div className="bg-yellow-500/10 px-2 py-1 rounded border border-yellow-500/30">
                <ShieldCheck size={16} className="text-green-400" />
            </div>
        )}
      </header>

      {/* --- Main Content --- */}
      <main className="flex-1 overflow-y-auto pb-24 relative">
        
        {/* Class Image Banner */}
        {config.classImg && currentView === 'home' && (
            <div className="w-full h-32 md:h-48 relative mb-6">
                <img src={config.classImg} className="w-full h-full object-cover opacity-60 mask-image-gradient" alt="Class" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2d1b15] to-transparent"></div>
            </div>
        )}

        {/* --- VIEW: HOME --- */}
        {currentView === 'home' && (
            <div className="px-4 pt-4 animate-in slide-in-from-bottom-5 duration-500">
                <Podium students={sortedStudents} />

                <div className="bg-black/30 border border-[#d4af37]/40 rounded-xl overflow-hidden backdrop-blur-sm shadow-xl">
                    <div className="p-4 border-b border-[#d4af37]/20 flex justify-between items-center bg-[#d4af37]/5">
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-[#d4af37] flex items-center gap-2">
                                טבלת המובילים
                            </h3>
                        </div>
                        <div className="relative">
                            <input 
                                type="text" 
                                placeholder="חיפוש..." 
                                className="bg-black/40 border border-[#d4af37]/30 rounded-full py-1 px-3 pl-8 text-xs w-32 focus:outline-none focus:border-[#d4af37] transition-all"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    if(e.target.value) setShowAll(true);
                                }}
                            />
                            <Search size={12} className="absolute left-2 top-2 text-gray-500" />
                        </div>
                    </div>
                    
                    <div className="divide-y divide-[#d4af37]/10">
                        {displayStudents.map((s, idx) => (
                            <div 
                                key={s.name} 
                                onClick={() => attemptOpenStudent(s)}
                                className="p-4 flex items-center justify-between hover:bg-[#d4af37]/10 active:bg-[#d4af37]/20 transition cursor-pointer group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${idx < 3 ? 'bg-[#d4af37] text-black shadow-[0_0_10px_#d4af37]' : 'bg-white/10 text-gray-400'}`}>
                                        {/* Since idx is based on filtered list, we need the real rank if searching? 
                                            For simplicity, we show index in list. */}
                                        {sortedStudents.indexOf(s) + 1}
                                    </div>
                                    <span className="font-medium group-hover:text-[#d4af37] transition">{s.name}</span>
                                </div>
                                <span className="font-mono font-bold text-[#d4af37]">{s.total}₪</span>
                            </div>
                        ))}
                    </div>
                    
                    {!searchQuery && (
                        <button 
                            onClick={() => setShowAll(!showAll)}
                            className="w-full py-3 text-center text-xs text-[#d4af37]/70 hover:text-[#d4af37] hover:bg-white/5 transition flex items-center justify-center gap-1"
                        >
                            {showAll ? (
                                <>הסתר את שאר הכיתה <ChevronUp size={14} /></>
                            ) : (
                                <>הצג את כל הכיתה <ChevronDown size={14} /></>
                            )}
                        </button>
                    )}
                </div>
            </div>
        )}

        {/* --- VIEW: SHOP --- */}
        {currentView === 'shop' && (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-300">
                <ShoppingBag size={64} className="text-[#d4af37] mb-4 opacity-50" />
                <h2 className="text-2xl font-bold text-[#d4af37] mb-2">החנות בבנייה</h2>
                <p className="text-white/50">בקרוב תוכלו לרכוש פרסים שווים עם הכסף שצברתם!</p>
            </div>
        )}

        {/* --- VIEW: ADMIN --- */}
        {currentView === 'admin' && (
            <div className="p-4 space-y-4 animate-in slide-in-from-right duration-300">
                <div className="bg-red-900/20 border border-red-500/30 p-4 rounded-xl flex justify-between items-center">
                    <span className="text-red-200 text-sm">מצב מנהל פעיל</span>
                    <button 
                        onClick={() => {
                            saveConfig({ ...config, isAuth: false });
                            setCurrentView('home');
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs flex items-center gap-2"
                    >
                        <LogOut size={12} /> התנתק
                    </button>
                </div>

                <div className="bg-black/30 border border-[#d4af37]/30 rounded-xl p-5 backdrop-blur-sm">
                    <h3 className="text-[#d4af37] font-bold mb-4 flex items-center gap-2"><Upload size={18}/> נתונים</h3>
                    <div className="relative group">
                        <input 
                            type="file" 
                            accept=".xlsx, .xls"
                            onChange={handleFileUpload}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="border-2 border-dashed border-[#d4af37]/30 rounded-lg p-6 text-center group-hover:bg-[#d4af37]/5 transition">
                            <p className="text-sm text-gray-300">לחץ להעלאת קובץ אקסל חדש</p>
                            <p className="text-xs text-gray-500 mt-1">עדכון הציונים והנתונים</p>
                        </div>
                    </div>
                </div>

                <div className="bg-black/30 border border-[#d4af37]/30 rounded-xl p-5 backdrop-blur-sm space-y-4">
                    <h3 className="text-[#d4af37] font-bold flex items-center gap-2"><Settings size={18}/> הגדרות עיצוב</h3>
                    
                    <div>
                        <label className="text-xs text-gray-400 mb-1 block">סלוגן הכיתה</label>
                        <input 
                            type="text" 
                            value={config.slogan}
                            onChange={e => saveConfig({...config, slogan: e.target.value})}
                            className="w-full bg-black/50 border border-[#d4af37]/30 rounded p-2 text-sm text-[#d4af37] focus:border-[#d4af37] outline-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <label className="block p-3 border border-[#d4af37]/30 rounded-lg text-center hover:bg-white/5 cursor-pointer transition">
                            <span className="text-xs block mb-2 text-gray-300">לוגו מוסד</span>
                            <ImageIcon className="mx-auto text-[#d4af37] mb-2" size={24} />
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files && handleImageUpload('logo', e.target.files[0])} />
                            <span className="text-[10px] bg-[#d4af37]/20 px-2 py-1 rounded text-[#d4af37]">בחר קובץ</span>
                        </label>
                        <label className="block p-3 border border-[#d4af37]/30 rounded-lg text-center hover:bg-white/5 cursor-pointer transition">
                            <span className="text-xs block mb-2 text-gray-300">תמונת רקע</span>
                            <Camera className="mx-auto text-[#d4af37] mb-2" size={24} />
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files && handleImageUpload('classImg', e.target.files[0])} />
                             <span className="text-[10px] bg-[#d4af37]/20 px-2 py-1 rounded text-[#d4af37]">בחר קובץ</span>
                        </label>
                    </div>
                </div>

                <div className="bg-black/30 border border-[#d4af37]/30 rounded-xl p-5 backdrop-blur-sm space-y-4">
                     <h3 className="text-[#d4af37] font-bold flex items-center gap-2"><Lock size={18}/> אבטחה</h3>
                     <div className="flex gap-2">
                        <input 
                             type="text" 
                             placeholder="סיסמה חדשה"
                             className="flex-1 bg-black/50 border border-[#d4af37]/30 rounded p-2 text-sm text-[#d4af37] focus:border-[#d4af37] outline-none"
                             id="newPassInput"
                        />
                        <button 
                            onClick={() => {
                                const el = document.getElementById('newPassInput') as HTMLInputElement;
                                if(el.value) {
                                    saveConfig({...config, pass: el.value});
                                    alert("הסיסמה עודכנה");
                                    el.value = "";
                                }
                            }}
                            className="bg-[#d4af37] text-black font-bold px-4 rounded text-sm hover:bg-[#b5952f]"
                        >
                            עדכן
                        </button>
                     </div>
                </div>
            </div>
        )}

      </main>

      {/* --- Bottom Navigation --- */}
      <nav className="fixed bottom-0 w-full bg-[#1a0f0d] border-t border-[#d4af37]/30 flex justify-around p-2 pb-safe z-40 shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
        <button 
            onClick={() => setCurrentView('home')} 
            className={`flex flex-col items-center p-2 rounded-lg transition duration-300 w-20 ${currentView === 'home' ? 'text-[#d4af37] bg-white/5' : 'text-gray-500 hover:text-gray-300'}`}
        >
            <Home size={24} />
            <span className="text-[10px] mt-1 font-medium">בית</span>
        </button>
        <button 
            onClick={() => setCurrentView('shop')} 
            className={`flex flex-col items-center p-2 rounded-lg transition duration-300 w-20 ${currentView === 'shop' ? 'text-[#d4af37] bg-white/5' : 'text-gray-500 hover:text-gray-300'}`}
        >
            <ShoppingBag size={24} />
            <span className="text-[10px] mt-1 font-medium">חנות</span>
        </button>
        <button 
            onClick={attemptAdminAccess}
            className={`flex flex-col items-center p-2 rounded-lg transition duration-300 w-20 ${currentView === 'admin' ? 'text-[#d4af37] bg-white/5' : 'text-gray-500 hover:text-gray-300'}`}
        >
            <ShieldCheck size={24} />
            <span className="text-[10px] mt-1 font-medium">מנהל</span>
        </button>
      </nav>

      {/* --- Modals --- */}
      <StudentDetails 
        student={selectedStudent} 
        onClose={() => setSelectedStudent(null)} 
        onDeleteLog={handleDeleteLog}
        isAuthenticated={config.isAuth}
      />

      {showAuthModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 bg-black/90 backdrop-blur-sm animate-in fade-in">
             <div className="bg-[#2d1b15] w-full max-w-xs p-6 rounded-xl border border-[#d4af37] shadow-2xl text-center">
                <Lock size={32} className="mx-auto text-[#d4af37] mb-4" />
                <h3 className="text-lg font-bold text-white mb-4">נדרשת סיסמה</h3>
                <input 
                    type="password"
                    autoFocus
                    className="w-full bg-black/50 border border-[#d4af37]/50 rounded p-3 text-center text-white text-lg tracking-widest focus:outline-none focus:border-[#d4af37] mb-4"
                    value={authInput}
                    onChange={(e) => setAuthInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAuthSubmit()}
                />
                <div className="flex gap-2">
                    <button onClick={() => { setShowAuthModal(false); setAuthInput(""); }} className="flex-1 py-2 rounded bg-white/10 text-gray-300">ביטול</button>
                    <button onClick={handleAuthSubmit} className="flex-1 py-2 rounded bg-[#d4af37] text-black font-bold shadow-[0_0_10px_#d4af37]">אישור</button>
                </div>
             </div>
        </div>
      )}

    </div>
  );
}

export default App;