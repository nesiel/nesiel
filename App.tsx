import React, { useState, useEffect, useRef } from 'react';
import { Database, Student, AppConfig, DEFAULT_CONFIG } from './types';
import { parseExcel } from './utils';
import { Podium } from './components/Podium';
import { StudentDetails } from './components/StudentDetails';
import { SeatingChart } from './components/SeatingChart';
import { 
  Home, ShieldCheck, ChevronUp, ChevronDown, Settings, Trash2, Trophy, FileSpreadsheet, Coins, Users, Phone, Download, UserPlus, LayoutGrid, Book, X, PlusCircle, ArrowUp, ArrowDown, GripVertical, MessageCircle
} from 'lucide-react';

function App() {
  const [db, setDb] = useState<Database>({});
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [currentView, setCurrentView] = useState<'home' | 'admin' | 'contacts' | 'seating'>('home');
  const [showAll, setShowAll] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showRules, setShowRules] = useState(false);

  // Admin View State
  const [adminOrder, setAdminOrder] = useState<string[]>(['import_behavior', 'manual_add', 'import_alfon']);
  const [isReordering, setIsReordering] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const sDb = localStorage.getItem('bank_db');
    const sCfg = localStorage.getItem('bank_cfg');
    if (sDb) setDb(JSON.parse(sDb));
    if (sCfg) setConfig({ ...DEFAULT_CONFIG, ...JSON.parse(sCfg) });
    
    // Load admin order if exists, otherwise use default
    const sOrder = localStorage.getItem('admin_order');
    if (sOrder) setAdminOrder(JSON.parse(sOrder));
  }, []);

  const saveDb = (newDb: Database) => {
    setDb(newDb);
    localStorage.setItem('bank_db', JSON.stringify(newDb));
  };

  const saveConfig = (newCfg: AppConfig) => {
    setConfig(newCfg);
    localStorage.setItem('bank_cfg', JSON.stringify(newCfg));
  };

  const saveAdminOrder = (newOrder: string[]) => {
    setAdminOrder(newOrder);
    localStorage.setItem('admin_order', JSON.stringify(newOrder));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'behavior' | 'alfon') => {
    if (e.target.files?.[0]) {
      try {
        const newDb = await parseExcel(e.target.files[0], config);
        const final = { ...db };
        Object.entries(newDb).forEach(([name, data]) => {
          const studentData = data as Student;
          if (final[name]) {
            if (type === 'behavior') {
              final[name] = { 
                ...final[name], 
                total: final[name].total + studentData.total, 
                logs: [...final[name].logs, ...studentData.logs] 
              };
            } else {
              // אלפון - רק מעדכן פרטי הורים
              final[name] = { 
                ...final[name],
                nameMother: studentData.nameMother || final[name].nameMother,
                phoneMother: studentData.phoneMother || final[name].phoneMother,
                nameFather: studentData.nameFather || final[name].nameFather,
                phoneFather: studentData.phoneFather || final[name].phoneFather,
                studentCell: studentData.studentCell || final[name].studentCell,
                homePhone: studentData.homePhone || final[name].homePhone
              };
            }
          } else {
            final[name] = studentData;
          }
        });
        saveDb(final);
        alert(type === 'behavior' ? "הנקודות עודכנו!" : "האלפון עודכן בהצלחה!");
      } catch (err) { alert("שגיאה בקובץ"); }
      e.target.value = '';
    }
  };

  const handleManualAddStudent = () => {
    const name = window.prompt("הכנס את שם התלמיד/ה:");
    if (name && name.trim()) {
      const cleanName = name.trim();
      if (db[cleanName]) {
        alert("תלמיד זה כבר קיים במערכת");
        return;
      }
      const newStudent: Student = { name: cleanName, total: 0, logs: [] };
      saveDb({ ...db, [cleanName]: newStudent });
      alert(`התלמיד ${cleanName} נוסף בהצלחה!`);
    }
  };

  const updateScore = (action: string, value: number) => {
    const newScores = { ...config.actionScores, [action]: value };
    saveConfig({ ...config, actionScores: newScores });
  };

  const handleBackup = () => {
    try {
      const data = JSON.stringify({ db, config });
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `backup_${new Date().toLocaleDateString('he-IL').replace(/\./g, '-')}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      alert("שגיאה ביצירת הגיבוי");
    }
  };

  const handleRemoveFromPodium = (studentName: string) => {
    const newDb = { ...db };
    if (newDb[studentName]) {
      newDb[studentName] = { ...newDb[studentName], isHiddenFromPodium: true };
      saveDb(newDb);
    }
  };

  const handleSendNachat = (e: React.MouseEvent, student: Student) => {
    e.stopPropagation();
    const phone = student.phoneMother || student.phoneFather;
    if (!phone) {
      alert("לא נמצא מס' טלפון להורים");
      return;
    }
    const cleanPhone = phone.startsWith('05') ? '972' + phone.substring(1) : phone;
    const message = `שמח להודיע כי בנכם ${student.name} תפקד מצוין השבוע! ללא עבירות משמעת ועם צבירת התנהגויות טובות. נחת אמיתית! 🌟`;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const isEligibleForNachat = (student: Student) => {
    const hasNegatives = student.logs.some(l => l.s < 0);
    const positiveCount = student.logs.filter(l => l.s > 0).length;
    return !hasNegatives && positiveCount >= 2;
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...adminOrder];
    if (direction === 'up') {
        if (index === 0) return;
        [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
    } else {
        if (index === newOrder.length - 1) return;
        [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    }
    saveAdminOrder(newOrder);
  };

  const handleTouchStart = () => {
    longPressTimer.current = setTimeout(() => {
        setIsReordering(true);
        if (navigator.vibrate) navigator.vibrate(50);
    }, 800);
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
    }
  };

  const renderAdminButton = (id: string, index: number) => {
    let content = null;

    if (id === 'manual_add') {
        content = (
            <button onClick={handleManualAddStudent} className="flex-1 flex items-center gap-4 text-right">
                <div className="p-2 bg-[#d4af37]/20 rounded-full group-hover:bg-[#d4af37] group-hover:text-black transition-colors text-[#d4af37]">
                    <PlusCircle size={24} />
                </div>
                <div>
                    <p className="font-bold text-sm text-[#d4af37]">הוספת תלמיד ידנית</p>
                    <p className="text-[10px] text-gray-500">הוסף שם לרשימה ללא אקסל</p>
                </div>
            </button>
        );
    } else if (id === 'import_behavior') {
        content = (
            <label className="flex-1 flex items-center gap-4 text-right cursor-pointer">
                <input type="file" className="hidden" accept=".xlsx, .xls" onChange={(e) => handleFileUpload(e, 'behavior')} disabled={isReordering} />
                <FileSpreadsheet className="text-green-400" size={32} />
                <div className="text-right">
                    <p className="font-bold text-sm text-green-100">עדכן נקודות מהאקסל</p>
                    <p className="text-[10px] text-gray-500">קריאת דיווחי התנהגות</p>
                </div>
            </label>
        );
    } else if (id === 'import_alfon') {
        content = (
            <label className="flex-1 flex items-center gap-4 text-right cursor-pointer">
                <input type="file" className="hidden" accept=".xlsx, .xls" onChange={(e) => handleFileUpload(e, 'alfon')} disabled={isReordering} />
                <UserPlus className="text-blue-400" size={32} />
                <div className="text-right">
                    <p className="font-bold text-sm text-blue-100">טען אלפון כיתתי</p>
                    <p className="text-[10px] text-gray-500">ייבוא שמות הורים וטלפונים</p>
                </div>
            </label>
        );
    }

    let containerClass = "flex items-center gap-2 p-4 rounded-2xl border transition-transform relative group ";
    if (id === 'manual_add') containerClass += "bg-[#d4af37]/10 border-[#d4af37]/20 ";
    if (id === 'import_behavior') containerClass += "bg-green-500/10 border-green-500/20 ";
    if (id === 'import_alfon') containerClass += "bg-blue-500/10 border-blue-500/20 ";
    
    if (!isReordering) containerClass += "active:scale-95 cursor-pointer ";
    
    return (
        <div 
            key={id} 
            className={containerClass}
            onTouchStart={!isReordering ? handleTouchStart : undefined}
            onTouchEnd={!isReordering ? handleTouchEnd : undefined}
            onContextMenu={(e) => {
                e.preventDefault();
                setIsReordering(true);
            }}
        >
            {isReordering && (
                <div className="flex flex-col gap-1 ml-2">
                     <button onClick={() => moveItem(index, 'up')} disabled={index === 0} className="p-1 bg-black/40 rounded text-white disabled:opacity-20"><ArrowUp size={16}/></button>
                     <button onClick={() => moveItem(index, 'down')} disabled={index === adminOrder.length - 1} className="p-1 bg-black/40 rounded text-white disabled:opacity-20"><ArrowDown size={16}/></button>
                </div>
            )}
            {content}
            {!isReordering && <div className="absolute left-2 text-gray-500/20"><GripVertical size={16}/></div>}
        </div>
    );
  };

  const sorted = (Object.values(db) as Student[]).sort((a, b) => b.total - a.total);
  const filtered = sorted.filter(s => s.name.includes(searchQuery));
  const classTotal = (Object.values(db) as Student[]).reduce((sum, s) => sum + s.total, 0);

  return (
    <div className="flex flex-col h-screen bg-[#1a0f0d] text-[#fff8e1] overflow-hidden font-sans">
      <header className="flex-none bg-[#1a0f0d] border-b-2 border-[#d4af37] p-5 flex justify-between items-center z-30 shadow-2xl relative">
        <div className="flex items-center gap-3">
          {config.logo ? (
            <img src={config.logo} className="w-10 h-10 rounded-full border-2 border-[#d4af37] object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-full border-2 border-[#d4af37]/30 bg-[#d4af37]/10 flex items-center justify-center text-[#d4af37]">
              <Coins size={20} />
            </div>
          )}
          <div>
            <h1 className="text-xl font-black text-[#d4af37] tracking-tight">הבנק הכיתתי</h1>
            <p className="text-[9px] font-bold text-[#d4af37]/50 uppercase tracking-widest">{config.slogan}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setCurrentView('contacts')} className="p-2 bg-white/5 rounded-full text-[#d4af37]">
            <Users size={20} />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-32">
        {currentView === 'home' && (
          <div className="px-4 pt-4 space-y-4 flex flex-col min-h-full">
            <div className="flex-1 flex flex-col justify-center min-h-[30vh]">
               <Podium 
                 students={sorted.filter(s => !s.isHiddenFromPodium)} 
                 onRemoveStudent={handleRemoveFromPodium}
               />
            </div>
            
            <div className="bg-gradient-to-r from-[#d4af37]/20 to-[#2d1b15] border border-[#d4af37]/30 p-4 rounded-2xl flex justify-between items-center shadow-lg">
                <div className="flex items-center gap-3">
                    <div className="bg-[#d4af37] p-2 rounded-full text-black">
                        <Coins size={20} />
                    </div>
                    <div>
                        <span className="text-xs font-bold text-[#d4af37]/70 uppercase tracking-widest block">קופה כיתתית</span>
                        <span className="font-bold text-white">סך הכל נקודות</span>
                    </div>
                </div>
                <span className="text-3xl font-black text-[#d4af37] drop-shadow-md">{classTotal}₪</span>
            </div>

             <button onClick={() => setShowRules(true)} className="w-full bg-[#2d1b15] border border-[#d4af37]/30 rounded-2xl p-4 flex items-center justify-between active:scale-95 transition-transform">
                <div className="flex items-center gap-3">
                    <div className="bg-[#d4af37]/10 p-2 rounded-full text-[#d4af37]">
                        <Book size={20} />
                    </div>
                    <span className="font-bold text-sm">תקנון הכיתה</span>
                </div>
                <ChevronDown size={16} className="text-gray-500"/>
             </button>

            <div className="bg-[#2d1b15] border border-[#d4af37]/30 rounded-[2rem] overflow-hidden shadow-2xl">
                <div className="p-5 border-b border-white/5 flex justify-between items-center">
                    <h3 className="font-bold text-[#d4af37] flex items-center gap-2"><Trophy size={16} /> טבלת הניקוד</h3>
                    <input type="text" placeholder="חפש תלמיד..." className="bg-black/30 border border-white/10 rounded-full py-1.5 px-4 text-xs w-32 outline-none" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                </div>
                <div className="divide-y divide-white/5">
                    {(searchQuery || showAll ? filtered : filtered.slice(0, 5)).map((s, i) => (
                        <div key={s.name} onClick={() => setSelectedStudent(s)} className="p-5 flex justify-between items-center active:bg-white/5 cursor-pointer">
                            <div className="flex items-center gap-4">
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${i < 3 ? 'bg-[#d4af37] text-black' : 'bg-white/10 text-gray-500'}`}>{sorted.indexOf(s) + 1}</span>
                                <span className="font-bold">{s.name}</span>
                                {isEligibleForNachat(s) && (
                                  <button 
                                    onClick={(e) => handleSendNachat(e, s)}
                                    className="p-1.5 bg-green-500/10 text-green-400 rounded-full hover:bg-green-500 hover:text-white transition-colors"
                                    title="שלח הודעת נחת על תפקוד טוב"
                                  >
                                    <MessageCircle size={14} />
                                  </button>
                                )}
                            </div>
                            <span className="font-black text-[#d4af37]">{s.total}₪</span>
                        </div>
                    ))}
                </div>
                {!searchQuery && filtered.length > 5 && (
                  <button onClick={() => setShowAll(!showAll)} className="w-full py-4 text-[10px] font-bold text-[#d4af37]/50 uppercase flex justify-center items-center gap-2 border-t border-white/5">
                    {showAll ? 'צמצם' : 'הצג הכל'} {showAll ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                  </button>
                )}
            </div>
          </div>
        )}

        {currentView === 'seating' && (
          <SeatingChart 
            students={Object.values(db)} 
            onUpdateStudent={(s) => saveDb({ ...db, [s.name]: s })}
            onBatchUpdate={(updates) => {
              const newDb = { ...db };
              updates.forEach(s => newDb[s.name] = s);
              saveDb(newDb);
            }}
          />
        )}

        {currentView === 'admin' && (
          <div className="p-6 space-y-6">
            <div className="bg-[#2d1b15] p-6 rounded-[2rem] border border-[#d4af37]/30 space-y-4 shadow-xl">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <h3 className="text-[#d4af37] font-black uppercase text-xs tracking-widest">ניהול משתמשים וקבצים</h3>
                    {isReordering ? (
                        <button onClick={() => setIsReordering(false)} className="text-xs bg-green-600 px-3 py-1 rounded text-white font-bold">סיום עריכה</button>
                    ) : (
                        <span className="text-[9px] text-gray-500 italic">לחיצה ארוכה לשינוי סדר</span>
                    )}
                </div>
                
                <div className="grid grid-cols-1 gap-3">
                  {adminOrder.map((id, index) => renderAdminButton(id, index))}
                </div>
            </div>

            <div className="bg-[#2d1b15] p-6 rounded-[2rem] border border-white/5 space-y-4 shadow-xl">
                <h3 className="text-gray-500 font-bold text-xs uppercase tracking-widest flex items-center gap-2"><Settings size={14}/> קביעת ערכי ניקוד</h3>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(config.actionScores).map(([action, score]) => (
                    <div key={action} className="bg-black/20 p-3 rounded-xl border border-white/5">
                      <label className="text-[10px] text-gray-400 block mb-1">{action}</label>
                      <input 
                        type="number" 
                        className="bg-transparent border-b border-[#d4af37]/30 w-full text-sm font-bold text-[#d4af37] outline-none text-center"
                        value={score}
                        onChange={(e) => updateScore(action, parseInt(e.target.value) || 0)}
                      />
                    </div>
                  ))}
                </div>
            </div>
            
            <div className="bg-[#2d1b15] p-6 rounded-[2rem] border border-white/5 space-y-4 shadow-xl">
                <h3 className="text-gray-500 font-bold text-xs uppercase tracking-widest flex items-center gap-2"><Book size={14}/> עריכת תקנון</h3>
                <textarea 
                  className="w-full h-32 bg-black/20 rounded-xl border border-white/10 p-4 text-sm text-white/80 focus:border-[#d4af37] outline-none resize-none"
                  value={config.rules}
                  onChange={(e) => saveConfig({...config, rules: e.target.value})}
                  placeholder="הדבק כאן את התקנון הכיתתי..."
                />
            </div>

            <div className="grid grid-cols-2 gap-3">
                <button onClick={handleBackup} className="flex items-center justify-center gap-2 p-4 bg-white/5 rounded-2xl text-xs font-bold border border-white/5 active:bg-white/10 transition-colors">
                  <Download size={16}/> גיבוי
                </button>
                <button onClick={() => setShowResetConfirm(true)} className="flex items-center justify-center gap-2 p-4 bg-red-500/10 rounded-2xl text-xs font-bold text-red-400 border border-red-500/10 active:bg-red-500/20 transition-colors">
                  <Trash2 size={16}/> איפוס מלא
                </button>
            </div>
          </div>
        )}

        {currentView === 'contacts' && (
          <div className="p-6 space-y-4">
            <h2 className="text-2xl font-black text-[#d4af37] flex items-center gap-3"><Users size={28}/> ספר טלפונים</h2>
            {sorted.map(s => (
              <div key={s.name} className="bg-[#2d1b15] p-5 rounded-3xl border border-white/5 flex justify-between items-center shadow-lg active:bg-white/5 cursor-pointer" onClick={() => setSelectedStudent(s)}>
                <div>
                  <p className="font-bold text-sm">{s.name}</p>
                  <p className="text-[10px] text-gray-500 mt-1">
                    {s.nameMother ? `אמא: ${s.nameMother}` : 'חסר פרטי אם'} • {s.nameFather ? `אבא: ${s.nameFather}` : 'חסר פרטי אב'}
                  </p>
                </div>
                <div className="p-3 bg-[#d4af37]/10 rounded-full text-[#d4af37]">
                  <Phone size={20} />
                </div>
              </div>
            ))}
          </div>
        )}

      </main>

      <nav className="flex-none bg-[#2d1b15] p-2 flex justify-around items-center border-t border-[#d4af37]/30 z-30 pb-safe shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        <button onClick={() => setCurrentView('home')} className={`p-4 rounded-2xl transition-all ${currentView === 'home' ? 'bg-[#d4af37] text-black shadow-[0_0_15px_rgba(212,175,55,0.4)] scale-110 -translate-y-2' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
          <Home size={24} />
        </button>
        <button onClick={() => setCurrentView('seating')} className={`p-4 rounded-2xl transition-all ${currentView === 'seating' ? 'bg-[#d4af37] text-black shadow-[0_0_15px_rgba(212,175,55,0.4)] scale-110 -translate-y-2' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
          <LayoutGrid size={24} />
        </button>
        <button onClick={() => setCurrentView('admin')} className={`p-4 rounded-2xl transition-all ${currentView === 'admin' ? 'bg-[#d4af37] text-black shadow-[0_0_15px_rgba(212,175,55,0.4)] scale-110 -translate-y-2' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
          <ShieldCheck size={24} />
        </button>
      </nav>

      {selectedStudent && (
        <StudentDetails 
          student={selectedStudent} 
          config={config} 
          onClose={() => setSelectedStudent(null)}
          onDeleteLog={(name, idx) => {
            const s = db[name];
            if (!s) return;
            const newLogs = [...s.logs];
            const [deletedLog] = newLogs.splice(idx, 1);
            const newTotal = s.total - (deletedLog?.s || 0);
            saveDb({ ...db, [name]: { ...s, logs: newLogs, total: newTotal } });
          }}
          onAddLog={(name, log) => {
            const s = db[name];
            if (s) {
               const newTotal = s.total + log.s;
               saveDb({ ...db, [name]: { ...s, logs: [...s.logs, log], total: newTotal } });
            }
          }}
          onMarkNachat={(name) => {
             const s = db[name];
             if (s) {
                 saveDb({ ...db, [name]: { ...s, lastNachatDate: new Date().toLocaleDateString('he-IL') } });
             }
          }}
          onUpdateStudent={(updatedStudent) => {
             saveDb({ ...db, [updatedStudent.name]: updatedStudent });
          }}
          isAuthenticated={true}
        />
      )}

      {showRules && (
         <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-[#2d1b15] w-full max-w-md rounded-3xl border border-[#d4af37]/30 p-6 relative">
               <button onClick={() => setShowRules(false)} className="absolute top-4 left-4 p-2 bg-white/5 rounded-full text-white"><X size={20}/></button>
               <h2 className="text-2xl font-black text-[#d4af37] mb-4 text-center">תקנון הכיתה</h2>
               <div className="text-white/80 whitespace-pre-line leading-relaxed text-center">
                  {config.rules}
               </div>
            </div>
         </div>
      )}

      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
           <div className="bg-[#2d1b15] w-full max-w-sm rounded-3xl border border-red-500/30 p-6 text-center">
               <h3 className="text-xl font-bold text-red-500 mb-2">אזהרה!</h3>
               <p className="text-white/80 mb-6 text-sm">פעולה זו תמחק את כל הנתונים, התלמידים וההגדרות.<br/>האם להמשיch?</p>
               <div className="flex gap-3">
                  <button onClick={() => setShowResetConfirm(false)} className="flex-1 py-3 bg-white/10 rounded-xl font-bold">ביטול</button>
                  <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-600/20">כן, אפס הכל</button>
               </div>
           </div>
        </div>
      )}
    </div>
  );
}

export default App;