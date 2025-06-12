import React from "react";
import { Card, Button, Divider } from "@heroui/react";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import { useTheme } from "@heroui/use-theme";

interface Feature {
  id: string;
  title: string;
  description: string;
  icon: string;
}

const features: Feature[] = [
  {
    id: "design",
    title: "Elegant Design",
    description: "Meticulously crafted with attention to every detail, delivering a premium visual experience.",
    icon: "lucide:sparkles"
  },
  {
    id: "performance",
    title: "Exceptional Performance",
    description: "Optimized for speed and efficiency, ensuring a smooth and responsive user experience.",
    icon: "lucide:zap"
  },
  {
    id: "innovation",
    title: "Innovative Technology",
    description: "Cutting-edge features that push the boundaries of what's possible in digital experiences.",
    icon: "lucide:lightbulb"
  }
];

export function PremiumShowcase() {
  const { theme, setTheme } = useTheme();
  const [activeFeature, setActiveFeature] = React.useState<string>("design");
  const [isHovering, setIsHovering] = React.useState<boolean>(false);
  
  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };
  
  return (
    <div className="w-full py-16 md:py-24">
      <div className="container mx-auto px-4">
        {/* Theme toggle */}
        <div className="flex justify-end mb-8">
          <Button
            isIconOnly
            variant="light"
            aria-label="Toggle theme"
            onPress={toggleTheme}
            className="rounded-full"
          >
            <Icon 
              icon={theme === "light" ? "lucide:moon" : "lucide:sun"} 
              width={24} 
              height={24} 
              className="text-foreground"
            />
          </Button>
        </div>
        
        {/* Hero section */}
        <div className="flex flex-col items-center text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="mb-4"
          >
            <span className="text-primary font-medium tracking-wide">INTRODUCING</span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
          >
            A New Era of <span className="text-primary">Premium</span> Experience
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
            className="text-xl text-default-600 max-w-3xl"
          >
            Discover a meticulously crafted interface that combines beauty, functionality, and innovation to deliver an unparalleled digital experience.
          </motion.p>
        </div>
        
        {/* Main showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-16">
          {/* Feature navigation */}
          <div className="lg:col-span-2">
            <div className="sticky top-8 space-y-6">
              {features.map((feature) => (
                <motion.div
                  key={feature.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ x: 5 }}
                  className="cursor-pointer"
                  onClick={() => setActiveFeature(feature.id)}
                >
                  <div 
                    className={`flex items-start p-4 rounded-xl transition-all duration-300 ${
                      activeFeature === feature.id 
                        ? "bg-primary/10 border-l-4 border-primary" 
                        : "hover:bg-default-100"
                    }`}
                  >
                    <div className={`mr-4 p-3 rounded-full ${
                      activeFeature === feature.id 
                        ? "bg-primary text-white" 
                        : "bg-default-100"
                    }`}>
                      <Icon icon={feature.icon} width={24} height={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-1">{feature.title}</h3>
                      <p className="text-default-600">{feature.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          
          {/* Feature showcase */}
          <div className="lg:col-span-3">
            <motion.div
              key={activeFeature}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <Card
                className="overflow-hidden"
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
              >
                <motion.div 
                  className="relative h-[400px] bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center"
                  animate={{ 
                    backgroundPosition: isHovering ? "100% 100%" : "0% 0%" 
                  }}
                  transition={{ duration: 3, ease: "easeInOut" }}
                >
                  <motion.div
                    animate={{ 
                      y: isHovering ? -10 : 0,
                      scale: isHovering ? 1.05 : 1
                    }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="p-8"
                  >
                    <div className="flex justify-center mb-6">
                      <div className="p-4 rounded-full bg-primary/20 backdrop-blur-md">
                        <Icon 
                          icon={features.find(f => f.id === activeFeature)?.icon || "lucide:sparkles"} 
                          width={48} 
                          height={48}
                          className="text-primary"
                        />
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <h2 className="text-3xl font-bold mb-2">
                        {features.find(f => f.id === activeFeature)?.title}
                      </h2>
                      <p className="text-default-600 mb-6">
                        {features.find(f => f.id === activeFeature)?.description}
                      </p>
                      <Button 
                        color="primary" 
                        size="lg"
                        className="font-medium"
                        endContent={<Icon icon="lucide:arrow-right" />}
                      >
                        Learn More
                      </Button>
                    </div>
                  </motion.div>
                </motion.div>
                
                <Divider />
                
                <div className="p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-semibold">Ready to experience it?</h3>
                      <p className="text-default-600">Join thousands of satisfied users today.</p>
                    </div>
                    <Button 
                      color="primary" 
                      variant="flat"
                      endContent={<Icon icon="lucide:external-link" />}
                    >
                      Get Started
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
        
        {/* Testimonial section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-2xl p-8 md:p-12"
        >
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="md:w-1/3 flex justify-center">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-4xl font-bold">
                <Icon icon="lucide:quote" width={48} height={48} />
              </div>
            </div>
            <div className="md:w-2/3">
              <p className="text-xl md:text-2xl font-medium italic mb-6">
                "This premium interface has completely transformed our digital experience. The attention to detail and thoughtful design elements create a truly exceptional product that stands out from everything else on the market."
              </p>
              <div>
                <p className="font-semibold">Sarah Johnson</p>
                <p className="text-default-600">Chief Design Officer, TechCorp</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}