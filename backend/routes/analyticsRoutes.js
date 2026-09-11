const express = require('express');
const router = express.Router();

const {
  getSummary,
  getAttritionByDepartment,
  getAttritionByAgeGroup,
  getAttritionByIncomeBand,
  getOvertimeImpact,
  getKeyDrivers
} = require('../controllers/analyticsController');

router.get('/summary', getSummary);
router.get('/by-department', getAttritionByDepartment);
router.get('/by-age-group', getAttritionByAgeGroup);
router.get('/by-income-band', getAttritionByIncomeBand);
router.get('/overtime-impact', getOvertimeImpact);
router.get('/drivers', getKeyDrivers);

module.exports = router;
