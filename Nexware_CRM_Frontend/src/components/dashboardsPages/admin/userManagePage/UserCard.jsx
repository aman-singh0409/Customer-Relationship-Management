import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  Shield,
  Briefcase,
  Edit3,
  CheckCircle,
  XCircle,
  Trash2,
} from "lucide-react";

const roleStyles = {
  admin: "bg-red-50 text-red-700 border-red-200 ring-1 ring-red-600/10",
  subadmin:
    "bg-green-50 text-green-700 border-green-200 ring-1 ring-green-600/10",
  teamhead:
    "bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-600/10",
  agent: "bg-blue-50 text-blue-700 border-blue-200 ring-blue-600/10",
};

const statusStyles = {
  active: "text-emerald-700 bg-emerald-50 border-emerald-200",
  inactive: "text-slate-500 bg-slate-100 border-slate-200",
  suspended: "text-red-700 bg-red-50 border-red-200",
};

const UserCard = ({ user, onEdit, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const roleClass =
    roleStyles[user.role] || "bg-gray-50 text-gray-700 border-gray-200";
  const statusKey = user.status ? user.status.toLowerCase() : "inactive";
  const statusClass = statusStyles[statusKey] || statusStyles.inactive;
  const StatusIcon = statusKey === "active" ? CheckCircle : XCircle;

  const getTeamHeadDisplay = () => {
    if (user.teamHeadId?.name) {
      return (
        <span className="font-semibold text-gray-800">
          {user.teamHeadId.name}
        </span>
      );
    }
    if (typeof user.teamHeadId === "string") {
      return (
        <span className="font-mono text-xs text-gray-500">
          ID: {user.teamHeadId}
        </span>
      );
    }
    return <span className="text-gray-400 italic">No Team Head</span>;
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`group relative bg-white border rounded-xl overflow-hidden transition-all duration-300 w-full
        ${
          isExpanded
            ? "border-indigo-500/30 shadow-lg ring-1 ring-indigo-500/10 z-10"
            : "border-gray-200 hover:border-indigo-300 hover:shadow-md"
        }`}
    >
      <div
        className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* User Info */}
        <div className="flex items-center gap-4 w-full md:w-[40%]">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 shadow-sm ${
              statusKey === "active"
                ? "bg-indigo-100 text-indigo-700"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {user.name ? user.name.charAt(0).toUpperCase() : "?"}
          </div>

          <div className="flex flex-col overflow-hidden">
            <h3 className="text-gray-900 font-semibold text-sm md:text-base truncate">
              {user.name}
            </h3>

            <div className="flex items-center gap-1.5 text-xs text-gray-500 truncate">
              <Mail className="w-3 h-3" />
              <span>{user.email}</span>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center md:justify-center w-full md:w-[20%] pl-14 md:pl-0">
          <span
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusClass}`}
          >
            <StatusIcon className="w-3.5 h-3.5" />
            <span className="capitalize">{statusKey}</span>
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 w-full md:w-[40%]">
          {/* EDIT */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit && onEdit(user);
            }}
            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            title="Edit User"
          >
            <Edit3 className="w-4 h-4" />
          </button>

          {/* DELETE */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete && onDelete(user._id);
            }}
            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete User"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {/* VIEW MORE */}
          <button
            className={`flex items-center gap-1 pl-3 pr-2 py-1.5 rounded-lg text-xs font-medium transition-all border ${
              isExpanded
                ? "bg-gray-100 text-gray-900 border-gray-200"
                : "bg-white text-indigo-600 border-transparent hover:bg-indigo-50"
            }`}
          >
            {isExpanded ? "Hide Details" : "See More"}
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Expanded section */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="border-t border-gray-100 bg-gray-50/50"
          >
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
              {/* Contact */}
              <div className="space-y-1">
                <p className="text-xs font-semibold text-gray-400 uppercase">
                  Contact
                </p>
                <div className="space-y-2 mt-1">
                  <p className="text-gray-900 font-medium">{user.name}</p>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-3.5 h-3.5" />
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{user.phone || "No phone linked"}</span>
                  </div>
                </div>
              </div>

              {/* Role */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-400 uppercase">
                  Role
                </p>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${roleClass}`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  {user.role?.toUpperCase() || "UNDEFINED"}
                </span>
              </div>

              {/* Reporting */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-400 uppercase">
                  Reporting To
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="p-1.5 bg-white rounded-md border text-gray-400 shadow-sm">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div>{getTeamHeadDisplay()}</div>
                </div>
              </div>

              {/* System */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-400 uppercase">
                  System
                </p>
                <div className="space-y-1 text-gray-500 text-xs">
                  <p>
                    Current Status:{" "}
                    <span
                      className={`font-medium ${
                        statusKey === "active"
                          ? "text-emerald-600"
                          : "text-red-500"
                      }`}
                    >
                      {user.status}
                    </span>
                  </p>

                  {user.lastLogin ? (
                    <>
                      <p>
                        Last Login Date:{" "}
                        <span className="font-medium text-gray-700">
                          {new Date(
                            user.lastLogin.loginTime
                          ).toLocaleDateString()}
                        </span>
                      </p>

                      <p>
                        Last Login Time:{" "}
                        <span className="font-medium text-gray-700">
                          {new Date(
                            user.lastLogin.loginTime
                          ).toLocaleTimeString()}
                        </span>
                      </p>
                    </>
                  ) : (
                    <p>No login record found</p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default UserCard;
