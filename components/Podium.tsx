import React from 'react';
import { Student } from '../types';
import { Trophy } from 'lucide-react';

interface PodiumProps {
  students: Student[];
}

export const Podium: React.FC<PodiumProps> = ({ students }) => {
  // We need top 3. Logic: 2nd place (left), 1st place (center), 3rd place (right)
  const first = students[0];
  const second = students[1];
  const third = students[2];

  if (!first) return null;

  return (
    <div className="flex justify-center items-end h-48 gap-3 mb-8 px-4">
      {/* 2nd Place */}
      <div className="flex flex-col items-center w-1/3 z-10">
        {second && (
          <>
            <div className="mb-2 text-center">
               <span className="text-xs font-bold block text-gray-300 truncate w-20">{second.name}</span>
               <span className="text-sm font-bold text-yellow-500">{second.total}₪</span>
            </div>
            <div className="w-full bg-gray-400 h-24 rounded-t-lg shadow-[0_0_15px_rgba(192,192,192,0.3)] flex items-center justify-center border-t-2 border-gray-300">
               <span className="text-2xl font-bold text-gray-800">2</span>
            </div>
          </>
        )}
      </div>

      {/* 1st Place */}
      <div className="flex flex-col items-center w-1/3 z-20 -mx-2">
        <div className="mb-2 text-center flex flex-col items-center animate-bounce">
            <Trophy className="w-6 h-6 text-yellow-400 mb-1" />
            <span className="text-sm font-bold block text-yellow-100 truncate w-24">{first.name}</span>
            <span className="text-lg font-bold text-yellow-400 drop-shadow-md">{first.total}₪</span>
        </div>
        <div className="w-full bg-yellow-500 h-32 rounded-t-lg shadow-[0_0_25px_rgba(212,175,55,0.6)] flex items-center justify-center border-t-4 border-yellow-200 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-yellow-300/20 to-transparent"></div>
            <span className="text-4xl font-bold text-yellow-900 relative z-10">1</span>
        </div>
      </div>

      {/* 3rd Place */}
      <div className="flex flex-col items-center w-1/3 z-10">
        {third && (
          <>
            <div className="mb-2 text-center">
                <span className="text-xs font-bold block text-amber-700 truncate w-20">{third.name}</span>
                <span className="text-sm font-bold text-yellow-500">{third.total}₪</span>
            </div>
            <div className="w-full bg-amber-700 h-16 rounded-t-lg shadow-[0_0_15px_rgba(205,127,50,0.3)] flex items-center justify-center border-t-2 border-amber-600">
                <span className="text-2xl font-bold text-amber-950">3</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
