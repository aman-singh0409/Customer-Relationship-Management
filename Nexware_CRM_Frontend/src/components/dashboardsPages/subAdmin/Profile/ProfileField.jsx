import React from "react";

const ProfileField = ({ label, value, icon: Icon, disabled, onChange, helperText }) => {
  return (
    <div className="group">
      <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
        {label}
      </label>
      <div className="relative">
        <span className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors 
          ${disabled ? "text-gray-400" : "text-indigo-500"}`}>
          <Icon size={18} />
        </span>

        <input
          type="text"
          value={value || ""}
          readOnly={disabled}
          onChange={onChange}
          className={`
            w-full pl-11 pr-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 outline-none
            ${disabled 
              ? "bg-gray-50 text-gray-600 border border-transparent cursor-default" // View Mode
              : "bg-white text-gray-900 border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10" // Edit Mode
            }
          `}
        />
      </div>
      {/* Optional Helper Text for Read-Only fields */}
      {helperText && disabled && (
        <p className="mt-1 ml-1 text-xs text-gray-400">{helperText}</p>
      )}
    </div>
  );
};

export default ProfileField;