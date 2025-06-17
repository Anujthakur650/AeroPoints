import React from "react";
import { Card, CardBody, CardHeader, Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const data = [
  { month: "Jan", points: 45000 },
  { month: "Feb", points: 52000 },
  { month: "Mar", points: 48000 },
  { month: "Apr", points: 61000 },
  { month: "May", points: 55000 },
  { month: "Jun", points: 67000 },
  { month: "Jul", points: 72000 },
  { month: "Aug", points: 69000 },
  { month: "Sep", points: 78000 },
  { month: "Oct", points: 85000 },
  { month: "Nov", points: 91000 },
  { month: "Dec", points: 95000 }
];

export function PointsAnalytics() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      viewport={{ once: true }}
    >
      <Card className="backdrop-blur-md border border-white/10">
        <CardHeader className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold">Points Analytics</h3>
            <p className="text-default-500">Your points growth over time</p>
          </div>
          <Button 
            variant="light" 
            color="primary"
            endContent={<Icon icon="lucide:download" />}
          >
            Export Data
          </Button>
        </CardHeader>
        <CardBody className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="pointsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0d8de3" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#0d8de3" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis 
                dataKey="month" 
                stroke="#888888"
                fontSize={12}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickFormatter={(value) => `${value.toLocaleString()}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "8px"
                }}
                labelStyle={{ color: "#888888" }}
              />
              <Area
                type="monotone"
                dataKey="points"
                stroke="#0d8de3"
                fillOpacity={1}
                fill="url(#pointsGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardBody>
      </Card>
    </motion.div>
  );
}