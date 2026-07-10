// components/lead/LeadEmptyState.jsx
import React from "react";
import { Search, Plus, MousePointer2, User } from "lucide-react";
import { motion } from "framer-motion";

const LeadEmptyState = ({ onAddClick }) => {

  const personaVariants = {
    hidden: { x: -150, opacity: 0, rotate: -10 },
    visible: { 
      x: -30, 
      opacity: 1, 
      rotate: 0,
      transition: { 
        type: "spring", damping: 12, stiffness: 100, delay: 0.2 
      } 
    }
  };

  const cursorVariants = {
    hidden: { x: -30, y: -40, opacity: 0 },
    visible: { 
      x: [ -30, 40 ], // Move right
      y: [ -40, 45 ],  // Move down to button
      opacity: 1,
      transition: { 
        delay: 0.8, duration: 0.6, ease: "easeInOut", times: [0, 1]
      }
    },
    click: {
      scale: [1, 0.8, 1], // The actual "click" motion
      transition: { delay: 1.4, duration: 0.2 }
    }
  };

  const buttonVariants = {
    idle: { scale: 1 },
    pressed: {
      scale: [1, 0.95, 1], // Button shrinks when clicked
      transition: { delay: 1.4, duration: 0.2 }
    }
  };

  const rippleVariants = {
    hidden: { opacity: 0, scale: 0 },
    fire: {
      opacity: [0.8, 0],
      scale: [0.5, 2.5],
      transition: { delay: 1.45, duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <div className="relative w-full h-[450px] flex flex-col items-center justify-center overflow rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50">
      
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-[0.3] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
      </div>

      {/* --- ANIMATION STAGE --- */}
      <div className="relative z-10 mb-8 w-64 h-40 flex items-center justify-center">
        
        {/* The "Boy" / Abstract Persona carrying the idea */}
        <motion.div
          variants={personaVariants}
          initial="hidden"
          animate="visible"
          className="absolute left-10 z-10 bg-white p-3 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-2"
        >
          <div className="bg-blue-100 p-2 rounded-full">
             <User className="w-6 h-6 text-blue-600" />
          </div>
          <div className="bg-slate-100 p-1.5 rounded-lg">
             <Search className="w-4 h-4 text-slate-400" />
          </div>
        </motion.div>

        {/* The Giant Clicking Cursor */}
        <motion.div
          variants={cursorVariants}
          initial="hidden"
          animate={["visible", "click"]}
          className="absolute z-30 drop-shadow-lg filter"
        >
           <MousePointer2 className="w-12 h-12 text-slate-800 fill-slate-800" strokeWidth={1} />
        </motion.div>

        {/* Center Target Circle (Where the click happens) */}
        <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center border-4 border-white shadow-sm relative">
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-ping absolute" />
          <div className="w-3 h-3 bg-blue-500 rounded-full relative z-20" />
        </div>
      </div>

      {/* --- TEXT CONTENT --- */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="relative z-10 text-center max-w-sm px-4"
      >
        <h3 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">
          Your pipeline is empty
        </h3>
        <p className="text-slate-500 mb-8 leading-relaxed">
          Seems like you haven't added any leads yet. Let's kick things off by adding your first potential customer.
        </p>

        {/* --- THE BUTTON BEING CLICKED --- */}
        <div className="relative inline-block">
          {/* The Click Ripple Effect */}
          <motion.div
              variants={rippleVariants}
              initial="hidden"
              animate="fire"
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-blue-400/30 rounded-xl z-0 pointer-events-none"
          />
          
          {/* The Actual Button */}
          <motion.button
            variants={buttonVariants}
            initial="idle"
            animate="pressed"
            onClick={onAddClick}
            className="relative z-10 group inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-600/40 hover:-translate-y-0.5"
          >
            <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform" />
            Add your first lead
          </motion.button>
        </div>
      </motion.div>

    </div>
  );
};

export default LeadEmptyState;