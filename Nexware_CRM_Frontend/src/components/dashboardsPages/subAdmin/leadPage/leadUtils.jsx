import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  PhoneIncoming, 
  PhoneOff, 
  Phone,
  HelpCircle,
  Ban
} from "lucide-react";
export const getStatusColor = (status) => {
  switch (status) {
    case "Sale Done":
    case "Won":
      return "bg-emerald-50 text-emerald-700 border border-emerald-200";
      
    case "Not Interested":
    case "Lost":
      return "bg-red-50 text-red-700 border border-red-200";
      
    case "Follow Up":
      return "bg-amber-50 text-amber-700 border border-amber-200";
      
    case "Incoming":
      return "bg-blue-50 text-blue-700 border border-blue-200";
      
    case "Ring":
    case "Ringing":
      return "bg-indigo-50 text-indigo-700 border border-indigo-200";
      
    case "Switch Off":
      return "bg-slate-100 text-slate-600 border border-slate-200";
      
    default:
      return "bg-gray-50 text-gray-600 border border-gray-200";
  }
};
export const getStatusIcon = (status) => {
  switch (status) {
    case "Sale Done":
    case "Won":
      return <CheckCircle2 className="w-3.5 h-3.5" />;
      
    case "Not Interested":
    case "Lost":
      return <Ban className="w-3.5 h-3.5" />;
      
    case "Follow Up":
      return <Clock className="w-3.5 h-3.5" />;
      
    case "Incoming":
      return <PhoneIncoming className="w-3.5 h-3.5" />;
      
    case "Ring":
    case "Ringing":
      return <Phone className="w-3.5 h-3.5" />;
      
    case "Switch Off":
      return <PhoneOff className="w-3.5 h-3.5" />;
      
    default:
      return <HelpCircle className="w-3.5 h-3.5" />;
  }
};