const Employee = require('../models/Employee');

// GET /api/employees?page=1&limit=10&department=Sales&risk=High&search=23
async function getEmployees(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));

    const filter = {};

    if (req.query.department && req.query.department !== 'All') {
      filter.department = req.query.department;
    }

    if (req.query.risk && req.query.risk !== 'All') {
      filter.riskLevel = req.query.risk;
    }

    if (req.query.search) {
      const search = req.query.search.trim();
      const asNumber = Number(search);
      filter.$or = [
        { jobRole: { $regex: search, $options: 'i' } },
        ...(Number.isNaN(asNumber) ? [] : [{ employeeId: asNumber }])
      ];
    }

    const [employees, total] = await Promise.all([
      Employee.find(filter)
        .select('-__v -_id -createdAt -updatedAt')
        .sort({ riskScore: -1, employeeId: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Employee.countDocuments(filter)
    ]);

    res.json({
      employees,
      page,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      totalResults: total
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/employees/departments
// Powers the department filter dropdown without hardcoding names in the frontend.
async function getDepartments(req, res, next) {
  try {
    const departments = await Employee.distinct('department');
    res.json(departments.sort());
  } catch (err) {
    next(err);
  }
}

module.exports = { getEmployees, getDepartments };
