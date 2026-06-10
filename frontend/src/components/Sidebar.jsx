import { NavLink } from 'react-router-dom';
import {
  SidebarHamburger,
  SidebarDashboard,
  SidebarAsk,
  SidebarWarnings,
  SidebarControl,
  SidebarHelp
} from '../assets/figma_icons';
import './Sidebar.css';

export default function Sidebar() {
  return (
    <aside className="sidebar">
      {/* Top section: menu toggle */}
      <div className="sidebar-top">
        <button className="sidebar-hamburger" title="Menu">
          <img src={SidebarHamburger} alt="Menu" />
        </button>
      </div>

      {/* Navigation icons */}
      <nav className="sidebar-nav">
        <NavLink to="/" className="sidebar-icon-btn" title="Dashboard">
          <img src={SidebarDashboard} alt="Dashboard" />
        </NavLink>

        <NavLink to="/ask" className="sidebar-icon-btn" title="Ask">
          <img src={SidebarAsk} alt="Ask" />
        </NavLink>

        <NavLink to="/warnings" className="sidebar-icon-btn" title="Warnings">
          <img src={SidebarWarnings} alt="Warnings" />
        </NavLink>

        <NavLink to="/control" className="sidebar-icon-btn" title="Control">
          <img src={SidebarControl} alt="Control" />
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
