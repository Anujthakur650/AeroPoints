import React from "react";
import { Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion, useScroll, useTransform } from "framer-motion";

export function ParallaxHero() {
  const ref = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.2]);

  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const x = (clientX - innerWidth / 2) / 100;
    const y = (clientY - innerHeight / 2) / 100;
    setMousePosition({ x, y });
  };

  return (
    <motion.div
      ref={ref}
      className="relative h-screen overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* Background Layers */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-primary-900/90 to-primary-800/90"
        style={{ scale }}
      />
      
      <motion.div
        className="absolute inset-0"
        style={{
          backgroundImage: "url('https://picsum.photos/id/1018/1920/1080')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          scale,
          opacity: 0.3,
          x: mousePosition.x * -10,
          y: mousePosition.y * -10
        }}
      />

      {/* Animated Particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}

      {/* Content */}
      <div className="relative container mx-auto px-4 h-full flex items-center">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100px" }}
              className="h-1 bg-primary mb-8"
              transition={{ duration: 0.8, delay: 0.5 }}
            />
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
            >
              Travel Further with Your Points
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
              className="text-xl md:text-2xl text-white/80 mb-8"
            >
              Find and book premium flights using your points and miles. 
              Get the most value from your travel rewards.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.1 }}
              className="flex flex-wrap gap-4"
            >
              <Button 
                size="lg" 
                color="primary"
                className="font-medium bg-white text-primary hover:bg-white/90"
                endContent={<Icon icon="lucide:search" />}
              >
                Search Flights
              </Button>
              <Button 
                size="lg" 
                variant="bordered" 
                className="font-medium text-white border-white hover:bg-white/10"
                endContent={<Icon icon="lucide:info" />}
              >
                Learn More
              </Button>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.3 }}
              className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              {[
                {
                  icon: "lucide:award",
                  text: "20+ Airline Partners",
                  delay: 0
                },
                {
                  icon: "lucide:globe",
                  text: "Global Destinations",
                  delay: 0.2
                },
                {
                  icon: "lucide:shield",
                  text: "Best Value Guarantee",
                  delay: 0.4
                }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 1.3 + item.delay }}
                  className="flex items-center gap-3"
                >
                  <div className="bg-white/20 p-2 rounded-full">
                    <Icon icon={item.icon} className="text-white" width={24} height={24} />
                  </div>
                  <span className="text-white/90">{item.text}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{
          y: [0, 10, 0],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <Icon 
          icon="lucide:chevrons-down" 
          className="text-white/50" 
          width={32} 
          height={32} 
        />
      </motion.div>
    </motion.div>
  );
}