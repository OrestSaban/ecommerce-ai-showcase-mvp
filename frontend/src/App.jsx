import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Warnings from './pages/Warnings';
import Ask from './pages/Ask';
import Control from './pages/Control';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <nav>
          <ul>
            <li><Link to="/">Dashboard</Link></li>
            <li><Link to="/warnings">Warnings</Link></li>
            <li><Link to="/ask">Ask</Link></li>
            <li><Link to="/control">Control</Link></li>
          </ul>
        </nav>
        <hr />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/warnings" element={<Warnings />} />
          <Route path="/ask" element={<Ask />} />
          <Route path="/control" element={<Control />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
