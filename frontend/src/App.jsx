import { useEffect, useState } from 'react';
import apiClient from './api/client.js';

import Header from './components/Header.jsx';
import HeroStat from './components/HeroStat.jsx';
import StatStrip from './components/StatStrip.jsx';
import DepartmentChart from './components/DepartmentChart.jsx';
import OvertimeImpact from './components/OvertimeImpact.jsx';
import IncomeBandChart from './components/IncomeBandChart.jsx';
import AgeGroupChart from './components/AgeGroupChart.jsx';
import KeyDrivers from './components/KeyDrivers.jsx';
import Recommendations from './components/Recommendations.jsx';
import EmployeeExplorer from './components/EmployeeExplorer.jsx';
import Footer from './components/Footer.jsx';

export default function App() {
  const [summary, setSummary] = useState(null);
  const [departmentData, setDepartmentData] = useState([]);
  const [ageGroupData, setAgeGroupData] = useState([]);
  const [incomeBandData, setIncomeBandData] = useState([]);
  const [overtimeData, setOvertimeData] = useState([]);
  const [driversData, setDriversData] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fire every summary-level request in parallel — they're independent of each other.
    Promise.all([
      apiClient.get('/analytics/summary'),
      apiClient.get('/analytics/by-department'),
      apiClient.get('/analytics/by-age-group'),
      apiClient.get('/analytics/by-income-band'),
      apiClient.get('/analytics/overtime-impact'),
      apiClient.get('/analytics/drivers')
    ])
      .then(([summaryRes, deptRes, ageRes, incomeRes, otRes, driversRes]) => {
        setSummary(summaryRes.data);
        setDepartmentData(deptRes.data);
        setAgeGroupData(ageRes.data);
        setIncomeBandData(incomeRes.data);
        setOvertimeData(otRes.data);
        setDriversData(driversRes.data);
      })
      .catch(() => {
        setError('Could not reach the backend. Is it running on the URL in your .env?');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="page">
        <Header />
        <p className="state-message">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <Header />
        <p className="state-message">{error}</p>
      </div>
    );
  }

  return (
    <div className="page">
      <Header />
      <HeroStat summary={summary} departmentData={departmentData} overtimeData={overtimeData} />
      <StatStrip summary={summary} />

      <div className="chart-grid">
        <DepartmentChart data={departmentData} companyAvg={summary.attritionRate} />
        <OvertimeImpact data={overtimeData} />
      </div>
      <div className="chart-grid">
        <IncomeBandChart data={incomeBandData} />
        <AgeGroupChart data={ageGroupData} />
      </div>

      <KeyDrivers data={driversData} />
      <Recommendations
        summary={summary}
        departmentData={departmentData}
        overtimeData={overtimeData}
        driversData={driversData}
      />
      <EmployeeExplorer />

      <Footer />
    </div>
  );
}
