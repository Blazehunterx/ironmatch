import React, { useState } from 'react';
import { CalendarDays, Edit2, Check } from 'lucide-react';
import { DayOfWeek, TimeBlock, ALL_DAYS, ALL_TIME_BLOCKS, AvailabilitySlot } from '../../types/database';

interface ProfileScheduleProps {
    availability: AvailabilitySlot[];
    onToggleBlock: (day: DayOfWeek, block: TimeBlock) => void;
}

const ProfileSchedule: React.FC<ProfileScheduleProps> = ({ availability, onToggleBlock }) => {
    const [isEditing, setIsEditing] = useState(false);

    const isDayBlockActive = (day: DayOfWeek, block: TimeBlock) => {
        return availability?.find(a => a.day === day)?.blocks.includes(block) || false;
    };

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <div className="flex justify-between items-center mb-3">
                <h4 className="font-semibold text-white flex items-center gap-2"><CalendarDays size={16} className="text-lime" /> Schedule</h4>
                <button onClick={() => setIsEditing(!isEditing)} className="text-gray-500 hover:text-lime">
                    {isEditing ? <Check size={16} /> : <Edit2 size={16} />}
                </button>
            </div>
            {isEditing ? (
                <div className="grid grid-cols-4 gap-1">
                    {ALL_DAYS.map(day => (
                        <React.Fragment key={day}>
                            <div className="text-[10px] font-bold text-gray-500 uppercase flex items-center">{day}</div>
                            {ALL_TIME_BLOCKS.map(block => (
                                <button
                                    key={`${day}-${block}`}
                                    onClick={() => onToggleBlock(day, block)}
                                    className={`p-1.5 rounded-lg text-[10px] border transition-all ${isDayBlockActive(day, block) ? 'bg-lime/20 border-lime/40 text-lime' : 'bg-gray-800/50 border-gray-800 text-gray-600'}`}
                                >
                                    {block.charAt(0)}
                                </button>
                            ))}
                        </React.Fragment>
                    ))}
                </div>
            ) : (
                <div className="flex flex-wrap gap-1.5">
                    {availability?.map(slot => (
                        <div key={slot.day} className="text-[10px] bg-gray-800 border border-gray-700/50 rounded-lg px-2 py-1">
                            <span className="font-bold text-white">{slot.day}:</span> {slot.blocks.join(', ')}
                        </div>
                    )) || <p className="text-sm text-gray-500">No schedule.</p>}
                </div>
            )}
        </div>
    );
};

export default ProfileSchedule;
