import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import './App.css';
import Login from './Components/Login';
import Home from './Components/Home';
import PrivateRoute from './Components/PrivateRoute';
import MenuChange from './Components/MenuChange';
import Report from './Components/Report';


function App() {
  return (
    <Router>
     {/* <Sidebar/> */}
          <Routes>
           <Route path='/' element={<Login/>}/>
  



 {/* Protect home route */}
 <Route
          path="/home"
          element={
            <PrivateRoute>
              <Home />
           
            </PrivateRoute>
          }
        />

<Route
          path="/home/menu"
          element={
            <PrivateRoute>
          <MenuChange/>
           
            </PrivateRoute>
          }
        />

<Route
          path="/home/report"
          element={
            <PrivateRoute>
   <Report/>
           
            </PrivateRoute>
          }
        />


          </Routes>
         

    </Router>
  );
}

export default App;
