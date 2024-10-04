import React from 'react';
import '../Styles/dashboard.css';

import TokenValidation from './TokenValidation';
import Bulkbooking from './Bulkbooking';
import TokenCount from './TokenCount';
import Sidebar from './Sidebar';

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      <Sidebar />

      {/* Main Content */}
      <div className="main-content-dashboard">
        <div className="content-columns">
          {/* Left Column: TokenValidation and TokenCount */}
          <div className="left-column">
            <div className="dashboard-section">

              <TokenValidation />
            </div>
            <div className="dashboard-section">
   
              <TokenCount />
            </div>
          </div>

          {/* Right Column: Bulkbooking */}
          <div className="right-column">
            <div className="dashboard-section">

              <Bulkbooking />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
