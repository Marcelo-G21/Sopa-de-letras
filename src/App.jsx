import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import CategoryMenu from "./components/CategoryMenu";
import LevelSelector from "./components/LevelSelector";
import WordSearchGame from "./components/WordSearchGame";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CategoryMenu />} />
        <Route path="/category/:name" element={<LevelSelector />} />
        <Route path="/category/:name/level/:level" element={<WordSearchGame />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;
