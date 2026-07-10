const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  service: { type: String, required: true },
  address: { type: String },
  source: { type: String, default: "Unknown" }, 
  status: { 
    type: String, 
    enum: ["Ring", "Follow Up", "Sale Done", "Not Interested", "Switch Off", "Incoming"], 
    default: "Ring" 
  },
  remarks: { type: String },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true }); 

module.exports = mongoose.model("Lead", leadSchema);
