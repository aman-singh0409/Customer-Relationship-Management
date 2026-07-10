import React from "react";
import { motion, AnimatePresence } from "framer-motion";

const Loader = ({
  type = "spinner",
  size = "md", 
  color = "text-indigo-600",
  text,
  className = "",
  width = "w-full",
  height = "h-4",
  fullScreenState = true,
}) => {
  const getSphereConfig = (currentSize) => {
    switch (currentSize) {
      case "xs": return { sizeClass: "w-5 h-5", rings: 6, border: "border-[1px]", step: 30 };
      case "sm": return { sizeClass: "w-8 h-8", rings: 10, border: "border-[1px]", step: 18 }; // Small optimized
      case "md": return { sizeClass: "w-16 h-16", rings: 16, border: "border-[1.5px]", step: 12 }; // Medium optimized
      case "xl": return { sizeClass: "w-48 h-48", rings: 28, border: "border-2", step: 8 };
      case "lg": 
      default:   return { sizeClass: "w-32 h-32", rings: 22, border: "border-2", step: 10 };
    }
  };

  const sphereConfig = getSphereConfig(size);
  const borderColorClass = color.replace("text-", "border-");

  if (type === "sphere") {
    return (
      <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
        <div 
          className={`relative ${sphereConfig.sizeClass}`} 
          style={{ transformStyle: 'preserve-3d', animation: 'spinSphere 8s linear infinite' }}
        >
          {[...Array(sphereConfig.rings)].map((_, i) => (
            <div
              key={i}
              className={`absolute inset-0 rounded-full ${sphereConfig.border} ${borderColorClass} opacity-80`}
              style={{
                transform: `rotateY(${i * sphereConfig.step}deg) rotateX(45deg)`,
              }}
            />
          ))}
        </div>
        
        {text && (
          <p className={`font-medium tracking-wider uppercase ${size === 'xs' || size === 'sm' ? 'text-[10px]' : 'text-xs'} ${color}`}>
            {text}
          </p>
        )}
        
        <style>{`
          @keyframes spinSphere {
            0% { transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg); }
            100% { transform: rotateX(360deg) rotateY(360deg) rotateZ(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (type === "fullscreen") {
    return (
      <AnimatePresence>
        {fullScreenState && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-9999 flex items-center justify-center bg-white/80 backdrop-blur-xl"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="flex flex-col items-center gap-6 p-8"
            >
              {/* Ab ye parent se pass kiya hua 'size' use karega */}
              <Loader type="sphere" size={size} color={color} text={text || "Loading..."} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  if (type === "skeleton") {
    return (
      <div
        className={`relative overflow-hidden bg-gray-100 rounded-lg isolate ${width} ${height} ${className}`}
      >
        <div 
          className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-linear-to-r from-transparent via-white/60 to-transparent" 
        />
        <style>{`
          @keyframes shimmer {
            100% { transform: translateX(100%); }
          }
        `}</style>
      </div>
    );
  }

  if (type === "dots") {
    return (
      <div className={`flex items-center space-x-1 ${className}`}>
        {[0, 0.15, 0.3].map((delay, i) => (
          <div
            key={i}
            className={`rounded-full ${color.replace('text-', 'bg-')} animate-bounce ${size === 'sm' ? 'w-1 h-1' : 'w-1.5 h-1.5'}`}
            style={{ animationDelay: `${delay}s` }}
          />
        ))}
      </div>
    );
  }

  // Default Spinner
  const spinnerSize = size === 'lg' ? 32 : (size === 'sm' ? 16 : 20);
  
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg
        className={`animate-spin ${color}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        style={{ width: spinnerSize, height: spinnerSize }}
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      {text && <span className={`font-medium text-gray-600 ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>{text}</span>}
    </div>
  );
};

export default Loader;