
import React, { useState } from 'react';
import { Student, AppConfig } from '../types';
import { X, Trash2, Calendar, MessageCircle, Phone, Heart, Users, GraduationCap, PlusCircle, Check, MinusCircle, Mail, Smartphone, Home } from 'lucide-react';

interface StudentDetailsProps {
  student: Student | null;
  config: AppConfig;
  onClose: () => void;
  onDeleteLog: (studentName: string, index: number) => void;
  onAddLog: (studentName: string, log: any) => void;
  onMarkNachat: (studentName: string) => void;
  onUpdateStudent: (student: Student) => void;
  isAuthenticated: boolean;
}

export const StudentDetails: React.FC<StudentDetailsProps> = ({ student, config, onClose, onDeleteLog, onAddLog, onMarkNachat, isAuthenticated }) => {
  const [showAddAction, setShowAddAction] = useState(false);
  const [isManualInput, setIsManualInput] = useState(false);
  
  // State for adding action
  const [selectedAction, setSelectedAction] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [customScore, setCustomScore] = useState<string>("0");

  if (!student) return null;

  const handleWhatsApp = (phone: string, parentName: string) => {
    if (!phone) return;
    const cleanPhone = phone.startsWith('05') ? '972' + phone.substring(1) : phone;
    const message = `שלום ${parentName || 'הורה'} יקר/ה, רציתי לשתף בנחת מהכיתה! ${student.name} מתקדם/ת יפה מאוד וצובר/ת נקודות זכות על התנהגות והשקעה. כל הכבוד! 🌟`;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
    onMarkNachat(student.name);
  };

  const handleSubmitAction = () => {
    let reason = "";
    let score = 0;

    if (isManualInput) {
      if (!customReason) return alert("יש להזין סיבה");
      reason = customReason;
      score = parseInt(customScore) || 0;
    } else {
      if (!selectedAction) return alert("יש לבחור פעולה");
      reason = selectedAction;
      score = config.actionScores[selectedAction] || 0;
    }

    onAddLog(student.name, {
      sub: "ידני",
      teach: "מחנך/ת",
      k: reason,
      c: 1,
      s: score,
      d: new Date().toLocaleDateString('he-IL')
    });

    // Reset form
    setShowAddAction(false);
    setIsManualInput(false);
    setSelectedAction("");
    setCustomReason("");
    setCustomScore("0");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#2d1b15] w-full max-w-lg max-h-[90vh] rounded-[2.5rem] border-2 border-[#d4af37]/40 shadow-2xl flex flex-col overflow-hidden relative">
        
        <div className="p-6 pb-2 flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-bold text-[#d4af37]">{student.name}</h2>
            <div className="flex flex-col gap-1 mt-1">
                <p className="text-[#d4af37]/50 text-xs italic">מאזן אישי בבנק הכיתתי</p>
                <div className="flex flex-wrap gap-2">
                    {student.studentCell && (
                        <span className="flex items-center gap-1 text-[10px] bg-white/5 px-2 py-0.5 rounded-full text-gray-400">
                            <Smartphone size={10} /> {student.studentCell}
                        </span>
                    )}
                    {student.homePhone && (
                        <span className="flex items-center gap-1 text-[10px] bg-white/5 px-2 py-0.5 rounded-full text-gray-400">
                            <Home size={10} /> {student.homePhone}
                        </span>
                    )}
                </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-white/5 rounded-full hover:bg-white/10 text-[#d4af37]">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Quick Actions / Manual Add */}
          {isAuthenticated && (
            <div className="bg-[#d4af37]/5 p-4 rounded-3xl border border-[#d4af37]/20">
               {!showAddAction ? (
                 <button 
                    onClick={() => setShowAddAction(true)}
                    className="w-full py-3 bg-[#d4af37] text-black font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 hover:bg-[#c4a030] transition active:scale-95"
                 >
                    <PlusCircle size={18} /> הוסף פעולה ידנית
                 </button>
               ) : (
                 <div className="space-y-3 animate-in slide-in-from-top-2">
                    <div className="flex gap-2">
                       <button 
                          onClick={() => setIsManualInput(false)}
                          className={`flex-1 py-2 text-xs font-bold rounded-lg border transition ${!isManualInput ? 'bg-[#d4af37] text-black border-[#d4af37]' : 'bg-transparent text-gray-400 border-white/10'}`}
                       >
                          רשימה קיימת
                       </button>
                       <button 
                          onClick={() => setIsManualInput(true)}
                          className={`flex-1 py-2 text-xs font-bold rounded-lg border transition ${isManualInput ? 'bg-[#d4af37] text-black border-[#d4af37]' : 'bg-transparent text-gray-400 border-white/10'}`}
                       >
                          הקלדה חופשית
                       </button>
                    </div>

                    {!isManualInput ? (
                        <select 
                          className="w-full bg-black/40 border border-[#d4af37]/30 text-white p-3 rounded-xl outline-none text-sm"
                          value={selectedAction}
                          onChange={(e) => setSelectedAction(e.target.value)}
                        >
                          <option value="">בחר התנהגות...</option>
                          {Object.entries(config.actionScores).map(([action, score]) => (
                             <option key={action} value={action}>{action} ({(score as number) > 0 ? '+' : ''}{score})</option>
                          ))}
                        </select>
                    ) : (
                        <div className="flex gap-2">
                           <input 
                              type="text" 
                              placeholder="תיאור הפעולה..." 
                              className="flex-[2] bg-black/40 border border-[#d4af37]/30 text-white p-3 rounded-xl outline-none text-sm"
                              value={customReason}
                              onChange={(e) => setCustomReason(e.target.value)}
                           />
                           <input 
                              type="number" 
                              placeholder="ניקוד" 
                              className="flex-1 bg-black/40 border border-[#d4af37]/30 text-white p-3 rounded-xl outline-none text-sm text-center"
                              value={customScore}
                              onChange={(e) => setCustomScore(e.target.value)}
                           />
                        </div>
                    )}

                    <div className="flex gap-2 pt-2">
                       <button onClick={() => setShowAddAction(false)} className="flex-1 py-2 bg-white/5 text-gray-400 rounded-xl text-xs font-bold">ביטול</button>
                       <button onClick={handleSubmitAction} className="flex-[2] py-2 bg-green-600 text-white rounded-xl text-xs font-bold shadow-lg flex items-center justify-center gap-2">
                          <Check size={14}/> אשר הוספה
                       </button>
                    </div>
                 </div>
               )}
            </div>
          )}

          {/* Parents Section */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-2 mr-1">
              <Users size={12}/> אנשי קשר ודיווחי נחת
            </h3>
            <div className="grid grid-cols-1 gap-2">
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col justify-center">
                <div className="flex justify-between items-center mb-1">
                  <div>
                    <p className="text-xs font-bold text-pink-400">אמא: {student.nameMother || "לא ידוע"}</p>
                    <p className="text-[10px] text-gray-500">{student.phoneMother || "---"}</p>
                    {student.emailMother && <p className="text-[9px] text-gray-600 flex items-center gap-1 mt-0.5"><Mail size={8}/> {student.emailMother}</p>}
                  </div>
                  <div className="flex gap-2">
                    {student.phoneMother && (
                      <>
                        <button onClick={() => window.open(`tel:${student.phoneMother}`)} className="p-2 bg-white/10 rounded-full text-white"><Phone size={14}/></button>
                        <button onClick={() => handleWhatsApp(student.phoneMother!, student.nameMother || 'אמא')} className="p-2 bg-green-500/20 rounded-full text-green-400"><MessageCircle size={14}/></button>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col justify-center">
                <div className="flex justify-between items-center mb-1">
                  <div>
                    <p className="text-xs font-bold text-blue-400">אבא: {student.nameFather || "לא ידוע"}</p>
                    <p className="text-[10px] text-gray-500">{student.phoneFather || "---"}</p>
                    {student.emailFather && <p className="text-[9px] text-gray-600 flex items-center gap-1 mt-0.5"><Mail size={8}/> {student.emailFather}</p>}
                  </div>
                  <div className="flex gap-2">
                    {student.phoneFather && (
                      <>
                        <button onClick={() => window.open(`tel:${student.phoneFather}`)} className="p-2 bg-white/10 rounded-full text-white"><Phone size={14}/></button>
                        <button onClick={() => handleWhatsApp(student.phoneFather!, student.nameFather || 'אבא')} className="p-2 bg-green-500/20 rounded-full text-green-400"><MessageCircle size={14}/></button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Logs */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-2 mr-1">
              <Calendar size={12}/> פירוט פעולות וניקוד
            </h3>
            <div className="space-y-2">
              {student.logs.length === 0 ? (
                <div className="text-center py-10 text-white/10 text-xs">טרם נרשמו פעולות</div>
              ) : (
                student.logs.slice().reverse().map((log, idx) => (
                  <div key={idx} className="bg-black/20 p-4 rounded-2xl border border-white/5 flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${log.s >= 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                          {log.c} פעמים
                        </span>
                        <p className={`font-bold text-sm ${log.s >= 0 ? 'text-green-100' : 'text-red-200'}`}>{log.k}</p>
                      </div>
                      <div className="flex flex-wrap gap-2 text-[10px] text-gray-500 mt-2">
                        <span className="bg-white/5 px-2 py-0.5 rounded flex items-center gap-1"><GraduationCap size={10}/> {log.sub}</span>
                        <span className="bg-white/5 px-2 py-0.5 rounded flex items-center gap-1"><Users size={10}/> {log.teach}</span>
                        <span className="text-gray-600">{log.d}</span>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className={`font-black text-lg ${log.s >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {log.s > 0 ? '+' : ''}{log.s}₪
                      </p>
                      {isAuthenticated && (
                        <button onClick={() => onDeleteLog(student.name, student.logs.length - 1 - idx)} className="text-red-500/20 hover:text-red-500 transition-colors mt-2">
                          <Trash2 size={12}/>
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="p-6 bg-[#1a0f0d] border-t border-[#d4af37]/20 flex justify-between items-center">
          <div className="flex items-center gap-2 text-[#d4af37]/60">
            <Heart size={16} className="animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest">סך הכל עושר כיתתי</span>
          </div>
          <span className="text-3xl font-black text-[#d4af37]">{student.total}₪</span>
        </div>
      </div>
    </div>
  );
};
