import React from 'react';
import '../Styles/dashboard.css';

import TokenValidation from './TokenValidation';
import Bulkbooking from './Bulkbooking';
import TokenCount from './TokenCount';
import Sidebar from './Sidebar';

const Dashboard = () => {
  return (
    <div className="dashboard-container">
    

      {/* Main Content */}
      <div className="main-content-dashboard">
      <Sidebar />
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

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
