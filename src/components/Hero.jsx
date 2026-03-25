import { motion } from 'framer-motion';
import InteractiveBlob from './InteractiveBlob';

const Hero = () => {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* 3D Background */}
      <div className="absolute inset-0 z-0">
        <InteractiveBlob />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-4 text-white">
            Animesh <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">Srivastava</span>
          </h1>
          <h2 className="text-2xl md:text-3xl text-gray-300 mb-8 font-light">
            AI & Full-Stack Developer
          </h2>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="flex justify-center gap-4 pointer-events-auto"
          >
            <a href="#projects" className="px-8 py-3 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white font-semibold transition-all shadow-[0_0_15px_rgba(8,145,178,0.5)]">
              View Work
            </a>
            <a href="#contact" className="px-8 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold backdrop-blur-sm border border-white/10 transition-all">
              Contact Me
            </a>
          </motion.div>
        </motion.div>
      </div>
      
      {/* Subtle overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background pointer-events-none z-0"></div>
    </section>
  );
};

export default Hero;
