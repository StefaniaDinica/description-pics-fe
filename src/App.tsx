import React from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import {
  BrowserRouter as Router,
  Routes,
  Route
} from "react-router-dom";
import Home from './components/Home';
import Page404 from './components/Page404';
import UploadPicture from './components/UploadPicture';
import ScanPicture from './components/ScanPicture';

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/upload-picture' element={<UploadPicture />} />
        <Route path='/scan-picture12' element={<ScanPicture />} />
        <Route path='*' element={<Page404 />} />
      </Routes>
    </Router>
  );
}

export default App;
