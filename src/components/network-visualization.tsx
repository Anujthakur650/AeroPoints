import React from "react";
import { Card, CardBody, CardHeader } from "@heroui/react";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";

interface Route {
  from: string;
  to: string;
  points: number;
  airline: string;
  popularity: number;
}

const popularRoutes: Route[] = [
  {
    from: "New York",
    to: "London",
    points: 85000,
    airline: "British Airways",
    popularity: 95
  },
  {
    from: "Los Angeles",
    to: "Tokyo",
    points: 95000,
    airline: "ANA",
    popularity: 90
  },
  {
    from: "Dubai",
    to: "Singapore",
    points: 75000,
    airline: "Emirates",
    popularity: 88
  },
  {
    from: "Paris",
    to: "Sydney",
    points: 120000,
    airline: "Qantas",
    popularity: 85
  }
];

export function NetworkVisualization() {
  return (
    <Card className="backdrop-blur-md border border-white/10">
      <CardHeader className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Popular Flight Routes</h2>
          <p className="text-default-500">Most redeemed reward flights worldwide</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-success-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-default-500">Live Updates</span>
        </div>
      </CardHeader>
      <CardBody className="p-6">
        <div className="grid gap-4">
          {popularRoutes.map((route, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative bg-default-50 dark:bg-default-100/50 rounded-xl p-4 overflow-hidden"
            >
              <div className="absolute top-0 left-0 h-full bg-success-500/10" 
                style={{ width: `${route.popularity}%` }} 
              />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center">
                      <Icon icon="lucide:plane-takeoff" className="text-primary mr-2" />
                      <span className="font-semibold">{route.from}</span>
                    </div>
                    <div className="flex-1 h-[2px] bg-default-200 dark:bg-default-700 mx-2 relative">
                      <motion.div
                        className="absolute top-1/2 -translate-y-1/2"
                        animate={{
                          x: ["0%", "100%"],
                          scale: [1, 0.8, 1]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "linear"
                        }}
                      >
                        <Icon 
                          icon="lucide:plane" 
                          className="text-primary transform -translate-y-1/2" 
                        />
                      </motion.div>
                    </div>
                    <div className="flex items-center">
                      <Icon icon="lucide:plane-landing" className="text-primary mr-2" />
                      <span className="font-semibold">{route.to}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-xl">{route.points.toLocaleString()}</div>
                    <div className="text-sm text-default-500">points</div>
                  </div>
                </div>
                <div className="flex justify-between items-center text-sm text-default-500">
                  <div className="flex items-center gap-2">
                    <Icon icon="lucide:briefcase" size={16} />
                    <span>{route.airline}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon icon="lucide:trending-up" size={16} />
                    <span>{route.popularity}% popularity</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}