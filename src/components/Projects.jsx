import { motion } from 'framer-motion';

const projects = [
  {
    title: "Debunkify: AI Misinformation Detection System",
    tech: ["Python", "NLP", "Scikit-Learn"],
    points: [
      "Built an NLP system with 86% accuracy using TF-IDF vectorization and Logistic Regression.",
      "Analyzed 5,000+ records and implemented scraping scripts to validate claims against 3 trusted sources.",
      "Engineered a custom preprocessing pipeline (Stemming, Lemmatization) to improve model robustness.",
      "Automated fact-checking workflows, reducing manual review time by 60%."
    ],
    github: "#"
  },
  {
    title: "Face Expression Music Recommendation",
    tech: ["Python", "CNN", "Keras", "OpenCV"],
    points: [
      "Developed a Deep Learning CNN model achieving 92% accuracy for real-time emotion classification.",
      "Optimized processing pipelines to handle live webcam data at 25+ FPS using OpenCV's Haar Cascades.",
      "Integrated with external APIs to dynamically generate playlists based on 6 identified emotional states.",
      "Documented model performance using confusion matrices and Grad-CAM for better interpretability."
    ],
    github: "#"
  },
  {
    title: "Nocturne.ai – AI Quant Research Terminal",
    tech: ["Full-Stack", "AI", "Fintech"],
    points: [
      "Built a full-stack fintech analytics platform processing 1,000+ social sentiment signals and AI-insights.",
      "Implemented a Reddit scraper collecting 5,000+ financial discussions from major communities.",
      "Designed interactive dashboards visualizing 4 trading indicators: sentiment trend, engagement, velocity, and price predictions.",
      "Integrated 2 AI models (Amazon Nova + Gemini API) to generate automated analysis for stock tickers."
    ],
    github: "#"
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
};

const cardVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
};

const Projects = () => {
  return (
    <section id="projects" className="py-24 bg-background/50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
          Featured <span className="text-cyan-400">Projects</span>
        </h2>
        
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {projects.map((project, idx) => (
            <motion.div 
              key={idx}
              variants={cardVariants}
              whileHover={{ y: -10, transition: { duration: 0.2 } }}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm flex flex-col h-full group"
            >
              <div className="mb-4">
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors">
                  {project.title}
                </h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tech.map((t, i) => (
                    <span key={i} className="text-xs px-2 py-1 bg-cyan-900/40 text-cyan-300 rounded-md border border-cyan-800/30">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              
              <ul className="text-gray-400 text-sm space-y-2 mb-6 flex-grow list-disc pl-4">
                {project.points.map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
              
              <div className="mt-auto pt-4 border-t border-white/10">
                <a href={project.github} className="text-sm font-medium text-white hover:text-cyan-400 flex items-center transition-colors">
                  View Project
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Projects;
