import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const LandingPage: React.FC = () => {
  return (
    <div className="relative min-h-screen bg-[#050816] cyber-grid overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 w-full h-full">
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{
            top: "20%",
            left: "30%",
          }}
        />
        <motion.div
          className="absolute w-[300px] h-[300px] rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 blur-3xl"
          animate={{
            x: [0, -50, 0],
            y: [0, 50, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{
            top: "50%",
            right: "20%",
          }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col justify-center items-center min-h-screen px-6 py-12">
        <motion.div
          className="glass-panel rounded-2xl p-8 max-w-4xl w-full mx-auto transform-3d"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.h1 
            className="text-6xl font-bold text-center mb-6 neon-text bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            Famous Artist Remastered
          </motion.h1>

          <motion.p 
            className="text-xl text-gray-300 text-center mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
          >
            AI-powered mastering that brings your music to life with a professional, polished sound.
            Pay only $1.99 to download your mastered track.
          </motion.p>

          <motion.div 
            className="flex justify-center gap-6"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Link to="/upload">
              <Button className="hover-3d px-8 py-4 text-lg rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg neon-border">
                Get Started
              </Button>
            </Link>
          </motion.div>

          {/* Feature cards */}
          <motion.div 
            className="grid md:grid-cols-3 gap-6 mt-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            {[
              {
                title: "AI Mastering",
                description: "Professional-grade mastering powered by advanced AI",
                icon: "🤖"
              },
              {
                title: "Instant Results",
                description: "Get your mastered track in minutes, not hours",
                icon: "⚡"
              },
              {
                title: "Affordable",
                description: "Professional quality at a fraction of the cost",
                icon: "💎"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="glass-panel p-6 rounded-xl hover-3d"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2 text-blue-400">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default LandingPage;