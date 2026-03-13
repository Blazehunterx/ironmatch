import React, { useState } from 'react';
import { Activity, Edit2, Check } from 'lucide-react';

interface ProfileBioProps {
    bio: string;
    onSave: (newBio: string) => void;
}

const ProfileBio: React.FC<ProfileBioProps> = ({ bio, onSave }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [text, setText] = useState(bio);

    const handleSave = () => {
        setIsEditing(false);
        onSave(text);
    };

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <div className="flex justify-between items-center mb-3">
                <h4 className="font-semibold text-white flex items-center gap-2">
                    <Activity size={16} className="text-lime" /> About
                </h4>
                <button 
                    onClick={() => {
                        if (isEditing) handleSave();
                        else setIsEditing(true);
                    }} 
                    className="text-gray-500 hover:text-lime"
                >
                    {isEditing ? <Check size={16} /> : <Edit2 size={16} />}
                </button>
            </div>
            {isEditing ? (
                <div className="space-y-3">
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="w-full bg-oled border border-gray-800 rounded-xl p-3 text-sm text-gray-300 focus:outline-none focus:border-lime"
                        rows={3}
                    />
                    <button onClick={handleSave} className="w-full py-2 bg-lime text-oled rounded-lg text-xs font-bold">Save</button>
                </div>
            ) : (
                <p className="text-sm text-gray-400 leading-relaxed italic">"{bio || 'No bio yet.'}"</p>
            )}
        </div>
    );
};

export default ProfileBio;
