import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  SidebarHamburger,
  SidebarAsk,
  SidebarWarningsNew,
  SidebarControl,
  SidebarHelp
} from '../assets/figma_icons';
import './Sidebar.css';

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const isWarningsOpen = location.pathname === '/warnings';
  
  const toggleWarnings = () => {
    if (isWarningsOpen) {
      window.dispatchEvent(new Event('close-warnings'));
    } else {
      navigate('/warnings');
    }
  };

  return (
    <aside className="sidebar">
      {/* Top section: menu toggle */}
      <div className="sidebar-top">
        <button className="sidebar-hamburger" title="Menu" onClick={toggleWarnings}>
          <img src={SidebarHamburger} alt="Menu" />
        </button>
      </div>

      <nav className="sidebar-nav">
        <NavLink 
          to="/warnings" 
          className="sidebar-icon-btn" 
          title="Warnings"
          onClick={(e) => {
            if (location.pathname === '/warnings') {
              e.preventDefault();
              window.dispatchEvent(new Event('close-warnings'));
            }
          }}
        >
          <img src={SidebarWarningsNew} alt="Warnings" />
        </NavLink>

        <NavLink 
          to="/ask" 
          className="sidebar-icon-btn" 
          title="Ask"
          onClick={(e) => {
            if (location.pathname === '/ask') {
              e.preventDefault();
              navigate('/');
            }
          }}
        >
          <img src={SidebarAsk} alt="Ask" />
        </NavLink>

        <NavLink 
          to="/control" 
          className="sidebar-icon-btn" 
          title="Settings"
          onClick={(e) => {
            if (location.pathname === '/control') {
              e.preventDefault();
              window.dispatchEvent(new Event('close-control'));
            }
          }}
        >
          <img src={SidebarControl} alt="Settings" />
        </NavLink>
      </nav>

      {/* Bottom section */}
      <div className="sidebar-bottom">
        <button className="sidebar-icon-btn" title="Help">
          <img src={SidebarHelp} alt="Help" />
        </button>
      </div>
    </aside>
  );
}
