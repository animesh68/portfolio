import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Skills from './components/Skills';
import Experience from './components/Experience';
import Projects from './components/Projects';
import Contact from './components/Contact';
import CursorTrail from './components/CursorTrail';

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground dark selection:bg-primary selection:text-primary-foreground">
      <CursorTrail />
      <Navbar />
      <main>
        <Hero />
        <About />
        <Skills />
        <Experience />
        <Projects />
      </main>
      <Contact />
    </div>
  );
}

export default App;
