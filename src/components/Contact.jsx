import { motion } from 'framer-motion';
import { Mail, Linkedin, Github, Phone } from 'lucide-react';

const Contact = () => {
  return (
    <section id="contact" className="py-24 bg-background relative border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-3xl md:text-3xl font-bold mb-6">
            Let's <span className="text-cyan-400">Connect</span>
          </h2>
          <p className="text-gray-400 mb-12 max-w-2xl mx-auto text-lg">
            I'm currently looking for new opportunities in AI & Full-Stack Development. Whether you have a question or just want to say hi, I'll try my best to get back to you!
          </p>

          <div className="flex flex-col md:flex-row justify-center items-center gap-8 mb-16">
            <a href="mailto:animeshyt68@gmail.com" className="flex items-center gap-3 text-gray-300 hover:text-cyan-400 transition-colors bg-white/5 px-6 py-3 rounded-xl border border-white/10 w-full md:w-auto justify-center">
              <Mail className="w-5 h-5" />
              <span>animeshyt68@gmail.com</span>
            </a>
            
            <a href="tel:+919506150136" className="flex items-center gap-3 text-gray-300 hover:text-cyan-400 transition-colors bg-white/5 px-6 py-3 rounded-xl border border-white/10 w-full md:w-auto justify-center">
              <Phone className="w-5 h-5" />
              <span>+91 9506150136</span>
            </a>
          </div>

          <div className="flex justify-center gap-6">
            <a 
              href="https://linkedin.com/in/animesh-srivastava" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-4 bg-white/5 rounded-full hover:bg-white/10 border border-white/10 text-gray-300 hover:text-cyan-400 transition-all hover:scale-110"
            >
              <Linkedin className="w-6 h-6" />
            </a>
            <a 
              href="https://github.com/animesh68" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-4 bg-white/5 rounded-full hover:bg-white/10 border border-white/10 text-gray-300 hover:text-cyan-400 transition-all hover:scale-110"
            >
              <Github className="w-6 h-6" />
            </a>
          </div>
        </motion.div>
      </div>
      
      <div className="absolute bottom-0 w-full py-6 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} Animesh Srivastava. Built with React & Three.js.</p>
      </div>
    </section>
  );
};

export default Contact;
