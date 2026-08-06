import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// components 폴더에 만든 페이지들 불러오기
import Start from './components/Start';
import Login from './components/Login';
import Signup from './components/Signup';
import Main from './components/Main';
import Contact from './components/Contact';
import CreateImage from './components/CreateImage';
import ManageImage from './components/ManageImage';
import SendMms from './components/SendMms';
import CheckMms from './components/CheckMms';
import Setting from './components/Setting';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* 첫 시작/랜딩 페이지 */}
        <Route path="/" element={<Start />} />
        <Route path="/start" element={<Start />} />
        
        {/* 인증 페이지 */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* 대시보드 및 주요 서비스 페이지 */}
        <Route path="/main" element={<Main />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/createimage" element={<CreateImage />} />
        <Route path="/manageimage" element={<ManageImage />} />
        <Route path="/sendmms" element={<SendMms />} />
        <Route path="/checkmms" element={<CheckMms />} />
        <Route path="/setting" element={<Setting />} />
      </Routes>
    </Router>
  );
}