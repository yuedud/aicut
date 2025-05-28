import React from 'react';
import { BrowserRouter as Router, Route, Routes, NavLink } from 'react-router-dom'; // 将 Link 替换为 NavLink
import Home from './components/Home';
import ImageSegmentation from './components/ImageSegmentation';
import QA from './components/QA';
import Advantages from './components/Advantages';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <nav>
            <ul className="navbar-links">
              <span><NavLink to="/" end>首页</NavLink></span> {/* 添加 end 属性确保精确匹配 */}
              <span><NavLink to="/segmentation">AI 抠图</NavLink></span>
              <span><NavLink to="/qa">常见问题</NavLink></span>
              {/* <span><NavLink to="/advantages">优势对比</NavLink></span> */}
            </ul>
          </nav>
        </header>
        <div className='body'>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/segmentation" element={<ImageSegmentation />} />
            <Route path="/qa" element={<QA />} />
            <Route path="/advantages" element={<Advantages />} />
          </Routes>
          <footer className="footer">
            <p>&copy; {new Date().getFullYear()} AI Cut. All rights reserved.</p>
          </footer>
        </div>
      </div>
    </Router>
  );
}

export default App;