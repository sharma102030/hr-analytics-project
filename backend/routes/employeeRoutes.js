const express = require('express');
const router = express.Router();

const { getEmployees, getDepartments } = require('../controllers/employeeController');

router.get('/', getEmployees);
router.get('/departments', getDepartments);

module.exports = router;
