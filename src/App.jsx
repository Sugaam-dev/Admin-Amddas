import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import './App.css';
import Login from './Components/Login';
import Home from './Components/Home';
import PrivateRoute from './Components/PrivateRoute';
import MenuChange from './Components/MenuChange';
import Report from './Components/Report';
import Menus from './Components/Test';
import Bulkbooking from './Components/Bulkbooking';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AddFoodItemModal from './Components/MenusChangeModel/AddFoodItemModal';
import MenusChange from './Components/Menuchangeitem';

function App() {
  return (
<>
    <ToastContainer/>
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

<Route
          path="/home/bulkbooking"
          element={
            <PrivateRoute>
   <Bulkbooking/>
           
            </PrivateRoute>
          }
        />
<Route
          path="/menuChange"
          element={
            <PrivateRoute>
              <Menus/>
           
            </PrivateRoute>
          }
        />
        <Route
          path="/MenuChangeItem"
          element={
            <PrivateRoute>
              <MenusChange/>
           
            </PrivateRoute>
          }
        />

          </Routes>
         

    </Router>
    </>
  );
}

export default App;
