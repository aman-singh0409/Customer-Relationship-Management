import React from "react";
import { Camera, Trash2 } from "lucide-react";

const ProfileImage = ({ name, avatarUrl, isEditing }) => {
  const initials = name
    ? name.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2)
    : "NP";

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="relative group">
        <div className={`w-32 h-32 rounded-full flex items-center justify-center border-4 border-white shadow-xl overflow-hidden
          ${!avatarUrl ? 'bg-linear-to-br from-indigo-100 to-white' : 'bg-gray-100'}
        `}>
          {avatarUrl ? (
            <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <span className="text-4xl font-bold text-indigo-600">{initials}</span>
          )}
        </div>
        
        {/* Hover Edit Indicator (Optional Visual Flair) */}
        {isEditing && (
          <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
            <Camera className="text-white" size={24} />
          </div>
        )}
      </div>

      {/* Buttons only show in Edit Mode */}
      {isEditing && (
        <div className="flex flex-col gap-2 w-full animate-in fade-in slide-in-from-top-2">
          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-semibold hover:bg-indigo-100 transition-colors">
            <Camera size={16} /> Upload New
          </button>
          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-50 transition-colors">
            <Trash2 size={16} /> Remove
          </button>
          <p className="text-xs text-gray-400 text-center mt-1">
            Max size: 800KB
          </p>
        </div>
      )}
    </div>
  );
};

export default ProfileImage;