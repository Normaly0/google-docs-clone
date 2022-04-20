import React from 'react'
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';

import TextEditor from './TextEditor';
import Dashboard from './Dashboard';

function App() {

  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/home" />} />
          <Route path="/home" element={<Dashboard />} />
          <Route path="/documents/:id" element={<TextEditor />} />z
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;