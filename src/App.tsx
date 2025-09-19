import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DarkModeProvider } from './contexts/DarkModeContext';
import Header from './components/Header';
import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import WhyPhronos from './components/WhyPhronos';
import Vision from './components/Vision';
import Footer from './components/Footer';
import JobCreators from './pages/JobCreators';
import AgentDevelopers from './pages/AgentDevelopers';

function App() {

  return (
    <DarkModeProvider>
      <Router>
        <Routes>
          <Route path="/" element={
            <div className="min-h-screen bg-white dark:bg-gray-900">
              <Header />
              <Hero />
              <HowItWorks />
              <WhyPhronos />
              <Vision />
              <Footer />
            </div>
          } />
          <Route path="/job-creators" element={<JobCreators />} />
          <Route path="/agent-developers" element={<AgentDevelopers />} />
        </Routes>
      </Router>
    </DarkModeProvider>
  );
}

export default App;