import React from "react";
import { Card, CardBody } from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { useSpring, animated } from "react-spring";

interface StatCardProps {
  icon: string;
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  color: string;
  delay?: number;
}

function StatCard({ icon, label, value, prefix = "", suffix = "", color, delay = 0 }: StatCardProps) {
  const { number } = useSpring({
    from: { number: 0 },
    to: { number: value },
    delay: 500 + delay,
    config: { mass: 1, tension: 20, friction: 10 }
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: delay / 1000 }}
      viewport={{ once: true }}
    >
      <Card className="backdrop-blur-md border border-white/10">
        <CardBody className="flex items-center gap-4">
          <div className={`p-3 rounded-xl ${color}`}>
            <Icon icon={icon} className="text-white" width={24} height={24} />
          </div>
          <div>
            <p className="text-default-500 text-sm">{label}</p>
            <p className="text-2xl font-bold">
              {prefix}
              <animated.span>
                {number.to(n => Math.floor(n).toLocaleString())}
              </animated.span>
              {suffix}
            </p>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
}

export function AnimatedStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        icon="lucide:award"
        label="Total Points"
        value={125000}
        color="bg-primary"
        delay={0}
      />
      <StatCard
        icon="lucide:plane"
        label="Flights Booked"
        value={24}
        color="bg-secondary"
        delay={200}
      />
      <StatCard
        icon="lucide:map"
        label="Destinations"
        value={15}
        color="bg-success-500"
        delay={400}
      />
      <StatCard
        icon="lucide:trending-up"
        label="Points Growth"
        value={32}
        suffix="%"
        color="bg-warning-500"
        delay={600}
      />
    </div>
  );
}