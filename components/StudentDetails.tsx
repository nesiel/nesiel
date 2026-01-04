import React from 'react';
import { Student } from '../types';
import { X, Trash2, TrendingUp, TrendingDown, User, BookOpen } from 'lucide-react';

interface StudentDetailsProps {
  student: Student | null;
  onClose: () => void;
  onDeleteLog: (studentName: string, index: number) => void;
  isAuthenticated: boolean;
}

export const StudentDetails: React.FC<StudentDetailsProps> = ({ student, onClose, onDeleteLog, isAuthenticated }) => {
  if (!student) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#2d1b15] w-full max-w-lg max-h-[90vh] rounded-2xl border-2 border-yellow-600 shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-4 border-b border-yellow-600/30 flex justify-between items-center bg-[#1a0f0d]">
          <div>
            <h2 className="text-xl font-bold text-yellow-500">{student.name}</h2>
            <p className="text-xs text-yellow-500/60">פירוט תנועות בחשבון</p>
          </div>
          <button onClick={onClose} className="p-2 bg-white/5 rounded-full hover:bg-white/10 text-yellow-500 transition">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {student.logs.length === 0 ? (
             <div className="text-center py-10 text-white/30">אין נתונים להצגה</div>
          ) : (
            student.logs.map((log, idx) => (
              <div key={idx} className="bg-black/20 rounded-lg p-3 border border-white/5 flex justify-between items-center group">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-sm font-bold ${log.s >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {log.k}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-white/50 border border-white/5">
                      x{log.c}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-white/40">
                    <div className="flex items-center gap-1"><BookOpen size={10} /> {log.sub}</div>
                    <div className="flex items-center gap-1"><User size={10} /> {log.teach}</div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-2 pl-2 border-r border-white/10 mr-2 pr-2">
                   <span className={`font-mono font-bold ${log.s >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {log.s > 0 ? '+' : ''}{log.s}₪
                  </span>
                  {isAuthenticated && (
                     <button 
                        onClick={() => onDeleteLog(student.name, idx)}
                        className="text-red-500/50 hover:text-red-500 transition"
                      >
                        <Trash2 size={14} />
                      </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#1a0f0d] border-t border-yellow-600/30 flex justify-between items-center">
          <span className="text-gray-400 text-sm">יתרה סופית:</span>
          <span className={`text-2xl font-bold font-mono ${student.total >= 0 ? 'text-yellow-400' : 'text-red-400'}`}>
            {student.total} ₪
          </span>
        </div>

      </div>
    </div>
  );
};
