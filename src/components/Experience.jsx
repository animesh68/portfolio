import { motion } from 'framer-motion';

const Experience = () => {
  return (
    <section id="experience" className="py-24 bg-background relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
            Experience & <span className="text-cyan-400">Achievements</span>
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Experience */}
            <div>
              <h3 className="text-2xl font-semibold mb-6 flex items-center text-white">
                <span className="w-8 h-px bg-cyan-400 mr-4"></span>
                Experience
              </h3>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-cyan-400 to-blue-600"></div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-xl font-bold text-white">Deloitte Australia</h4>
                    <p className="text-cyan-400">Data Analytics Job Simulation (Forage)</p>
                  </div>
                  <span className="px-3 py-1 bg-white/10 text-xs rounded-full border border-white/20">Remote</span>
                </div>
                <ul className="space-y-3 text-gray-300 mt-6 list-disc list-inside">
                  <li>Cleaned and transformed <strong className="text-white">2,000+</strong> records using SQL and Excel to ensure high data integrity.</li>
                  <li>Uncovered <strong className="text-white">3 key business risk areas</strong> and presented visual insights to support decision-making.</li>
                  <li>Developed dashboards that reduced recurring reporting time by <strong className="text-white">30%</strong> for key stakeholders.</li>
                </ul>
              </div>
            </div>

            {/* Achievements & Certifications */}
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-semibold mb-6 flex items-center text-white">
                  <span className="w-8 h-px bg-cyan-400 mr-4"></span>
                  Certifications
                </h3>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                  <ul className="space-y-4">
                    <li className="flex flex-col">
                      <span className="text-white font-medium">AWS Certified Cloud Practitioner</span>
                      <span className="text-sm text-cyan-400">Amazon Web Services</span>
                    </li>
                    <li className="flex flex-col">
                      <span className="text-white font-medium">Data Analytics Bootcamp</span>
                      <span className="text-sm text-cyan-400">Alex The Analyst</span>
                    </li>
                    <li className="flex flex-col">
                      <span className="text-white font-medium">AI For Everyone</span>
                      <span className="text-sm text-cyan-400">DeepLearning.AI</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-semibold mb-6 flex items-center text-white">
                  <span className="w-8 h-px bg-cyan-400 mr-4"></span>
                  Leadership & Activities
                </h3>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                  <ul className="space-y-4 text-gray-300">
                    <li>
                      <strong className="text-white">Marketing Coordinator:</strong> Geek Room, KIET – Spearheaded social media outreach and event growth.
                    </li>
                    <li>
                      <strong className="text-white">MUN Speaker:</strong> KIET MUN Society – Participated in debates regarding international data privacy laws.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Experience;
