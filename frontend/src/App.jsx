import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Warnings from './pages/Warnings';
import Ask from './pages/Ask';
import Control from './pages/Control';
import './App.css';

function App() {
  return (
    <Router>
      <Sidebar />
      <div className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />}>
            <Route path="warnings" element={<Warnings />} />
            <Route path="control" element={<Control />} />
          </Route>
          <Route path="/ask" element={<Ask />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
