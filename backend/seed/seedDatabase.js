// Reads backend/data/employees.csv and loads it into MongoDB.
// Run with: npm run seed  (make sure MONGO_URI is set in .env first)
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const mongoose = require('mongoose');

const connectDB = require('../config/db');
const Employee = require('../models/Employee');
const { calculateRiskScore } = require('../utils/riskScore');

const CSV_PATH = path.join(__dirname, '..', 'data', 'employees.csv');

// Maps a raw CSV row (original IBM HR Analytics column names) to our schema.
function mapRow(row) {
  const employee = {
    employeeId: Number(row.EmployeeNumber),
    age: Number(row.Age),
    attrition: row.Attrition,
    businessTravel: row.BusinessTravel,
    department: row.Department,
    distanceFromHome: Number(row.DistanceFromHome),
    education: Number(row.Education),
    educationField: row.EducationField,
    gender: row.Gender,
    jobRole: row.JobRole,
    jobSatisfaction: Number(row.JobSatisfaction),
    maritalStatus: row.MaritalStatus,
    monthlyIncome: Number(row.MonthlyIncome),
    numCompaniesWorked: Number(row.NumCompaniesWorked),
    overTime: row.OverTime,
    totalWorkingYears: Number(row.TotalWorkingYears),
    workLifeBalance: Number(row.WorkLifeBalance),
    yearsAtCompany: Number(row.YearsAtCompany),
    yearsSinceLastPromotion: Number(row.YearsSinceLastPromotion),
    yearsWithCurrManager: Number(row.YearsWithCurrManager)
  };

  const { score, level } = calculateRiskScore(employee);
  employee.riskScore = score;
  employee.riskLevel = level;

  return employee;
}

async function seedDatabase({ closeConnection = false } = {}) {
  if (!fs.existsSync(CSV_PATH)) {
    throw new Error('Could not find data/employees.csv');
  }

  await connectDB();

  const rows = [];

  await new Promise((resolve, reject) => {
    fs.createReadStream(CSV_PATH)
      // The source CSV starts with a UTF-8 BOM, which would otherwise get
      // glued onto the first header ("Age" becomes "\uFEFFAge") and silently
      // break every Age field. Strip it from headers as they're read.
      .pipe(csv({ mapHeaders: ({ header }) => header.replace(/^\uFEFF/, '') }))
      .on('data', (row) => rows.push(mapRow(row)))
      .on('end', resolve)
      .on('error', reject);
  });

  console.log(`Parsed ${rows.length} rows from CSV. Clearing existing employees...`);
  await Employee.deleteMany({});

  console.log('Inserting fresh data...');
  await Employee.insertMany(rows);

  const count = await Employee.countDocuments();
  console.log(`Done. ${count} employees in the database.`);

  if (closeConnection) {
    await mongoose.connection.close();
    process.exit(0);
  }
}

async function ensureSeeded() {
  const count = await Employee.countDocuments();
  if (count === 0) {
    console.log('Database is empty. Seeding employee data...');
    await seedDatabase({ closeConnection: false });
  }
}

if (require.main === module) {
  seedDatabase({ closeConnection: true }).catch((err) => {
    console.error('Seeding failed:', err);
    process.exit(1);
  });
}

module.exports = { seedDatabase, ensureSeeded };
