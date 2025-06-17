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
  gradient: string;
  delay?: number;
}

function StatCard({ icon, label, value, prefix = "", suffix = "", gradient, delay = 0 }: StatCardProps) {
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
      whileHover={{ y: -5 }}
    >
      <Card className="border-none shadow-lg overflow-hidden">
        <CardBody className={`p-6 bg-gradient-to-br ${gradient}`}>
          <div className="flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-white/10">
                <Icon icon={icon} className="text-white" width={24} height={24} />
              </div>
              <p className="text-lg text-white/90">{label}</p>
            </div>
            <div className="flex items-baseline gap-1">
              <p className="text-3xl font-bold text-white">
                {prefix}
                <animated.span>
                  {number.to(n => Math.floor(n).toLocaleString())}
                </animated.span>
                {suffix}
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
}

export function StatsDashboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        icon="lucide:award"
        label="Total Points"
        value={125000}
        gradient="from-blue-500 to-blue-600"
        delay={0}
      />
      <StatCard
        icon="lucide:plane"
        label="Flights Booked"
        value={24}
        gradient="from-purple-500 to-purple-600"
        delay={200}
      />
      <StatCard
        icon="lucide:map"
        label="Destinations"
        value={15}
        gradient="from-emerald-500 to-emerald-600"
        delay={400}
      />
      <StatCard
        icon="lucide:trending-up"
        label="Points Growth"
        value={32}
        suffix="%"
        gradient="from-amber-500 to-amber-600"
        delay={600}
      />
    </div>
  );
}