import { motion } from 'framer-motion';

const About = () => {
  return (
    <section id="about" className="py-24 bg-background relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
            About <span className="text-cyan-400">Me</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
              <h3 className="text-2xl font-semibold mb-4 text-white">Professional Summary</h3>
              <p className="text-gray-300 leading-relaxed text-lg">
                AI and Full-Stack Developer specializing in building intelligent, scalable web applications and data-driven systems. Proficient in Python and JavaScript, with hands-on experience in machine learning, NLP, and modern AI frameworks to develop predictive models and automated analytics solutions. Adept at integrating AI capabilities into full-stack architectures, delivering end-to-end products that transform data into actionable insights. Passionate about leveraging cutting-edge technologies to solve real-world problems and continuously enhance system performance.
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                <h3 className="text-xl font-semibold text-white">KIET Group of Institutions</h3>
                <p className="text-cyan-400">B.Tech in Computer Science & Eng. (AI)</p>
                <div className="flex justify-between text-gray-400 text-sm mt-2">
                  <span>2024 - 2028</span>
                  <span>CGPA: 7.99</span>
                </div>
              </div>
              
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                <h3 className="text-xl font-semibold text-white">Oxford Public School</h3>
                <p className="text-gray-300">Class XII (CBSE)</p>
                <div className="flex justify-between text-gray-400 text-sm mt-2">
                  <span>2022 - 2024</span>
                  <span>Percentage: 87.8%</span>
                </div>
              </div>
              
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                <h3 className="text-xl font-semibold text-white">GN National Public School</h3>
                <p className="text-gray-300">Class X (CBSE)</p>
                <div className="flex justify-between text-gray-400 text-sm mt-2">
                  <span>2020 - 2021</span>
                  <span>Percentage: 94.8%</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default About;
