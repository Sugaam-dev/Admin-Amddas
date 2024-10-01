import React, { useState } from "react";

// Import react-pro-sidebar components
import {
  Sidebar,
  Menu,
  MenuItem,
  SubMenu,
  useProSidebar,
  ProSidebarProvider,
} from "react-pro-sidebar";

// Import icons from react icons
import { FaList, FaRegHeart } from "react-icons/fa";
import { FiHome, FiLogOut, FiArrowLeftCircle, FiArrowRightCircle } from "react-icons/fi";
import { RiPencilLine } from "react-icons/ri";
import { BiCog } from "react-icons/bi";

// Import sidebar CSS
// import 'react-pro-sidebar/dist/css/styles.css';
import "../Styles/Header.css";
import { useNavigate } from "react-router-dom";

const Header = () => {
  // Create initial menuCollapse state using useState hook
  const [menuCollapse, setMenuCollapse] = useState(false);

  // Function to toggle menuCollapse state
  const menuIconClick = () => {
    setMenuCollapse(!menuCollapse);

    const navigate=useNavigate()
    const home=()=>{
      navigate('/aa')
    }
  };

  return (
    <ProSidebarProvider>
      <div id="header">
        <Sidebar collapsed={menuCollapse}>
          <div className="logotext">
            <p>{menuCollapse ? "Logo" : "Big Logo"}</p>
          </div>
          <div className="closemenu" onClick={menuIconClick}>
            {menuCollapse ? <FiArrowRightCircle /> : <FiArrowLeftCircle />}
          </div>
          <Menu iconShape="square">
            <MenuItem active={true} icon={<FiHome />}>
              Home
            </MenuItem>
            <MenuItem icon={<FaList />}>Category</MenuItem>
            <MenuItem icon={<FaRegHeart />}>Favourite</MenuItem>
            <MenuItem icon={<RiPencilLine />}>Author</MenuItem>
            <MenuItem icon={<BiCog />}>Settings</MenuItem>
          </Menu>
          <Menu iconShape="square">
            <MenuItem icon={<FiLogOut />}>Logout</MenuItem>
          </Menu>
        </Sidebar>
      </div>
    </ProSidebarProvider>
  );
};

export default Header;
