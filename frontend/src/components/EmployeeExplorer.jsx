import { useEffect, useState } from 'react';
import apiClient from '../api/client.js';

const RISK_BADGE_CLASS = {
  Low: 'badge badge--low',
  Medium: 'badge badge--medium',
  High: 'badge badge--high'
};

export default function EmployeeExplorer() {
  const [departments, setDepartments] = useState([]);
  const [department, setDepartment] = useState('All');
  const [risk, setRisk] = useState('All');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [employees, setEmployees] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch the department list once, for the filter dropdown.
  useEffect(() => {
    apiClient.get('/employees/departments').then((res) => setDepartments(res.data)).catch(() => {});
  }, []);

  // Debounce the free-text search so we're not firing a request on every keystroke.
  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(timeout);
  }, [search]);

  // Re-fetch whenever a filter, the debounced search, or the page changes.
  useEffect(() => {
    setLoading(true);
    apiClient
      .get('/employees', { params: { page, limit: 8, department, risk, search: debouncedSearch } })
      .then((res) => {
        setEmployees(res.data.employees);
        setTotalPages(res.data.totalPages);
        setTotalResults(res.data.totalResults);
      })
      .finally(() => setLoading(false));
  }, [page, department, risk, debouncedSearch]);

  // Any filter change should reset back to page 1.
  function handleFilterChange(setter) {
    return (e) => {
      setter(e.target.value);
      setPage(1);
    };
  }

  return (
    <section>
      <p className="section-heading">Employee explorer</p>
      <p className="section-intro">
        Search and filter individual records, including the rule-based risk flag computed at
        load time (overtime + stalled promotion + low satisfaction + poor work-life balance).
      </p>

      <div className="explorer-controls">
        <input
          type="text"
          placeholder="Search by job role or employee ID..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
        <select value={department} onChange={handleFilterChange(setDepartment)}>
          <option value="All">All departments</option>
          {departments.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <select value={risk} onChange={handleFilterChange(setRisk)}>
          <option value="All">All risk levels</option>
          <option value="High">High risk</option>
          <option value="Medium">Medium risk</option>
          <option value="Low">Low risk</option>
        </select>
      </div>

      <div className="panel" style={{ padding: 0 }}>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Department</th>
              <th>Job role</th>
              <th>Age</th>
              <th>Monthly income</th>
              <th>Tenure</th>
              <th>Overtime</th>
              <th>Risk</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="state-message">Loading employees...</td></tr>
            ) : employees.length === 0 ? (
              <tr><td colSpan={8} className="state-message">No employees match these filters.</td></tr>
            ) : (
              employees.map((emp) => (
                <tr key={emp.employeeId}>
                  <td>{emp.employeeId}</td>
                  <td>{emp.department}</td>
                  <td>{emp.jobRole}</td>
                  <td>{emp.age}</td>
                  <td>${emp.monthlyIncome.toLocaleString()}</td>
                  <td>{emp.yearsAtCompany} yrs</td>
                  <td>{emp.overTime}</td>
                  <td><span className={RISK_BADGE_CLASS[emp.riskLevel]}>{emp.riskLevel}</span></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
        <span>Page {page} of {totalPages} · {totalResults} employees</span>
        <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
      </div>
    </section>
  );
}
