// src/components/Report.js
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import '../Styles/Report.css'; 

function Report() {
  // State for selected domain
  const [selectedDomain, setSelectedDomain] = useState('@borgwarner.com');

  // States for start and end dates
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // State to control the visibility of the download button
  const [showDownload, setShowDownload] = useState(false);

  // Handler for the primary button click
  const handleButtonClick = () => {
    if (selectedDomain && startDate && endDate) {
      setShowDownload(true);
      // Additional logic for report generation can be added here
    } else {
      alert('Please fill in all fields.');
    }
  };

  return (
    <div className="report" style={{display:"flex"}}>
      <Sidebar />
      <div className="report-content">
        <h2 className="report-title">Generate Report</h2>

        {/* Dropdown for Domain Selection */}
        <div className="form-group">
          <label htmlFor="domain-select" className="form-label">Select Domain:</label>
          <select
            id="domain-select"
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value)}
            className="form-select"
          >
            <option value="" disabled>Select a domain</option>
            <option value="domain1.com">@borgwarner.com</option>
            <option value="domain2.com">@gmail.com</option>
            {/* Add more domains as needed */}
          </select>
        </div>

        {/* Date Pickers for Start and End Dates */}
        <div className="form-group">
          <label htmlFor="start-date" className="form-label"> From Date:</label>
          <input
            type="date"
            id="start-date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="end-date" className="form-label">To Date:</label>
          <input
            type="date"
            id="end-date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="form-input"
          />
        </div>

        {/* Primary Button */}
        <div className="button-group">
          <button onClick={handleButtonClick} className="btn submit-btn">
            Generate Report
          </button>
          {showDownload && (
            <button className="btn download-btn">
              Download Report
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Report;
