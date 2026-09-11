const Employee = require('../models/Employee');

// Small helper so we're not repeating the same rounding line everywhere.
const round1 = (n) => Math.round((n + Number.EPSILON) * 10) / 10;

// GET /api/analytics/summary
// Headline numbers for the top of the dashboard.
async function getSummary(req, res, next) {
  try {
    const [result] = await Employee.aggregate([
      {
        $group: {
          _id: null,
          totalEmployees: { $sum: 1 },
          attritionCount: { $sum: { $cond: [{ $eq: ['$attrition', 'Yes'] }, 1, 0] } },
          avgAge: { $avg: '$age' },
          avgMonthlyIncome: { $avg: '$monthlyIncome' },
          avgYearsAtCompany: { $avg: '$yearsAtCompany' }
        }
      }
    ]);

    if (!result) return res.json({ totalEmployees: 0 });

    const attritionRate = (result.attritionCount / result.totalEmployees) * 100;

    res.json({
      totalEmployees: result.totalEmployees,
      attritionCount: result.attritionCount,
      attritionRate: round1(attritionRate),
      avgAge: round1(result.avgAge),
      avgMonthlyIncome: Math.round(result.avgMonthlyIncome),
      avgYearsAtCompany: round1(result.avgYearsAtCompany)
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/analytics/by-department
// This is the MongoDB equivalent of:
//   SELECT department, COUNT(*), SUM(attrition='Yes') FROM employees GROUP BY department
async function getAttritionByDepartment(req, res, next) {
  try {
    const rows = await Employee.aggregate([
      {
        $group: {
          _id: '$department',
          total: { $sum: 1 },
          left: { $sum: { $cond: [{ $eq: ['$attrition', 'Yes'] }, 1, 0] } }
        }
      },
      {
        $project: {
          _id: 0,
          department: '$_id',
          total: 1,
          left: 1,
          attritionRate: { $multiply: [{ $divide: ['$left', '$total'] }, 100] }
        }
      },
      { $sort: { attritionRate: -1 } }
    ]);

    res.json(rows.map((r) => ({ ...r, attritionRate: round1(r.attritionRate) })));
  } catch (err) {
    next(err);
  }
}

// GET /api/analytics/by-age-group
// $bucket groups documents into ranges in one pass instead of us looping in JS.
async function getAttritionByAgeGroup(req, res, next) {
  try {
    const boundaries = [18, 25, 35, 45, 55, 61]; // upper bound is exclusive
    const labels = ['18-24', '25-34', '35-44', '45-54', '55-60'];

    const rows = await Employee.aggregate([
      {
        $bucket: {
          groupBy: '$age',
          boundaries,
          default: '61+',
          output: {
            total: { $sum: 1 },
            left: { $sum: { $cond: [{ $eq: ['$attrition', 'Yes'] }, 1, 0] } }
          }
        }
      }
    ]);

    const shaped = rows.map((r) => {
      const label = typeof r._id === 'number' ? labels[boundaries.indexOf(r._id)] : r._id;
      return {
        ageGroup: label,
        total: r.total,
        left: r.left,
        attritionRate: round1((r.left / r.total) * 100)
      };
    });

    res.json(shaped);
  } catch (err) {
    next(err);
  }
}

// GET /api/analytics/by-income-band
async function getAttritionByIncomeBand(req, res, next) {
  try {
    const boundaries = [0, 3000, 6000, 10000, 15000, 20001];
    const labels = ['<3k', '3k-6k', '6k-10k', '10k-15k', '15k-20k'];

    const rows = await Employee.aggregate([
      {
        $bucket: {
          groupBy: '$monthlyIncome',
          boundaries,
          default: '20k+',
          output: {
            total: { $sum: 1 },
            left: { $sum: { $cond: [{ $eq: ['$attrition', 'Yes'] }, 1, 0] } }
          }
        }
      }
    ]);

    const shaped = rows.map((r) => {
      const label = typeof r._id === 'number' ? labels[boundaries.indexOf(r._id)] : r._id;
      return {
        incomeBand: label,
        total: r.total,
        left: r.left,
        attritionRate: round1((r.left / r.total) * 100)
      };
    });

    res.json(shaped);
  } catch (err) {
    next(err);
  }
}

// GET /api/analytics/overtime-impact
async function getOvertimeImpact(req, res, next) {
  try {
    const rows = await Employee.aggregate([
      {
        $group: {
          _id: '$overTime',
          total: { $sum: 1 },
          left: { $sum: { $cond: [{ $eq: ['$attrition', 'Yes'] }, 1, 0] } }
        }
      }
    ]);

    const shaped = rows.map((r) => ({
      overTime: r._id,
      total: r.total,
      left: r.left,
      attritionRate: round1((r.left / r.total) * 100)
    }));

    res.json(shaped);
  } catch (err) {
    next(err);
  }
}

// GET /api/analytics/drivers
// Compares average values of several factors between employees who left
// and employees who stayed. This is the "why" behind the headline number.
async function getKeyDrivers(req, res, next) {
  try {
    const rows = await Employee.aggregate([
      {
        $group: {
          _id: '$attrition',
          avgMonthlyIncome: { $avg: '$monthlyIncome' },
          avgYearsAtCompany: { $avg: '$yearsAtCompany' },
          avgYearsSincePromotion: { $avg: '$yearsSinceLastPromotion' },
          avgDistanceFromHome: { $avg: '$distanceFromHome' },
          avgJobSatisfaction: { $avg: '$jobSatisfaction' },
          avgWorkLifeBalance: { $avg: '$workLifeBalance' }
        }
      }
    ]);

    const stayed = rows.find((r) => r._id === 'No') || {};
    const left = rows.find((r) => r._id === 'Yes') || {};

    const metrics = [
      { key: 'avgMonthlyIncome', label: 'Avg. monthly income ($)', decimals: 0 },
      { key: 'avgYearsAtCompany', label: 'Avg. years at company', decimals: 1 },
      { key: 'avgYearsSincePromotion', label: 'Avg. years since last promotion', decimals: 1 },
      { key: 'avgDistanceFromHome', label: 'Avg. distance from home (km)', decimals: 1 },
      { key: 'avgJobSatisfaction', label: 'Avg. job satisfaction (1-4)', decimals: 2 },
      { key: 'avgWorkLifeBalance', label: 'Avg. work-life balance (1-4)', decimals: 2 }
    ];

    const shaped = metrics.map((m) => {
      const stayedVal = stayed[m.key] || 0;
      const leftVal = left[m.key] || 0;
      const factor = Math.pow(10, m.decimals);
      return {
        metric: m.label,
        stayed: Math.round(stayedVal * factor) / factor,
        left: Math.round(leftVal * factor) / factor
      };
    });

    res.json(shaped);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getSummary,
  getAttritionByDepartment,
  getAttritionByAgeGroup,
  getAttritionByIncomeBand,
  getOvertimeImpact,
  getKeyDrivers
};
