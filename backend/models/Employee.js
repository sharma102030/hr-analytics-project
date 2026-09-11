const mongoose = require('mongoose');

// One document = one employee record from the HR dataset.
// Field names are camelCased versions of the original CSV columns
// (kept close to the source so the mapping in seed/seedDatabase.js stays obvious).
const employeeSchema = new mongoose.Schema(
  {
    employeeId: { type: Number, required: true, unique: true },
    age: Number,
    attrition: { type: String, enum: ['Yes', 'No'], required: true },
    businessTravel: String,
    department: String,
    distanceFromHome: Number,
    education: Number, // 1 = Below College ... 5 = Doctor
    educationField: String,
    gender: String,
    jobRole: String,
    jobSatisfaction: Number, // 1 = Low ... 4 = Very High
    maritalStatus: String,
    monthlyIncome: Number,
    numCompaniesWorked: Number,
    overTime: { type: String, enum: ['Yes', 'No'] },
    totalWorkingYears: Number,
    workLifeBalance: Number, // 1 = Bad ... 4 = Best
    yearsAtCompany: Number,
    yearsSinceLastPromotion: Number,
    yearsWithCurrManager: Number,

    // Computed at seed time (see utils/riskScore.js) instead of on every request,
    // since the underlying data only changes when we re-seed.
    riskScore: Number,
    riskLevel: { type: String, enum: ['Low', 'Medium', 'High'] }
  },
  { timestamps: true }
);

// Speeds up the filters used by the Employee Explorer table.
employeeSchema.index({ department: 1 });
employeeSchema.index({ riskLevel: 1 });

module.exports = mongoose.model('Employee', employeeSchema);
