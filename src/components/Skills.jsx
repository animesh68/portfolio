import { motion } from 'framer-motion';

const skillsData = [
  {
    category: "Programming",
    items: ["Python", "Pandas", "NumPy", "SQL", "Java", "C++", "JavaScript"]
  },
  {
    category: "Data & Analytics",
    items: ["Excel", "Tableau", "Power BI", "Scikit-learn", "Matplotlib"]
  },
  {
    category: "Machine Learning",
    items: ["TensorFlow", "Keras", "NLP", "CNN", "Computer Vision", "Predictive Modeling"]
  },
  {
    category: "Cloud & Tools",
    items: ["AWS", "Azure", "Docker", "Hadoop", "Git", "VS Code", "Linux"]
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

const Skills = () => {
  return (
    <section id="skills" className="py-24 bg-background/50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
            Technical <span className="text-cyan-400">Skills</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {skillsData.map((skillGroup, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm hover:bg-white/10 transition-colors"
              >
                <h3 className="text-xl font-semibold mb-4 text-white border-b border-white/10 pb-2">
                  {skillGroup.category}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {skillGroup.items.map((item, i) => (
                    <span 
                      key={i} 
                      className="px-3 py-1 bg-cyan-900/30 text-cyan-300 rounded-full text-sm border border-cyan-800/50"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Skills;
