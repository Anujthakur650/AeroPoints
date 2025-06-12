import React from "react";
import { Card, CardBody, CardHeader, Progress, Tabs, Tab, Divider, Button, Badge } from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";

interface PointsHistory {
  month: string;
  earned: number;
  redeemed: number;
}

const pointsHistory: PointsHistory[] = [
  { month: "Jan", earned: 5000, redeemed: 0 },
  { month: "Feb", earned: 3500, redeemed: 0 },
  { month: "Mar", earned: 4200, redeemed: 10000 },
  { month: "Apr", earned: 6500, redeemed: 0 },
  { month: "May", earned: 7800, redeemed: 0 },
  { month: "Jun", earned: 4500, redeemed: 25000 },
];

interface UpcomingTrip {
  id: string;
  destination: string;
  departureDate: string;
  airline: string;
  status: "confirmed" | "pending" | "completed";
}

const upcomingTrips: UpcomingTrip[] = [
  {
    id: "1",
    destination: "Tokyo, Japan",
    departureDate: "Aug 15, 2024",
    airline: "ANA",
    status: "confirmed"
  },
  {
    id: "2",
    destination: "Paris, France",
    departureDate: "Oct 22, 2024",
    airline: "Air France",
    status: "pending"
  }
];

export function UserDashboard() {
  const [activeTab, setActiveTab] = React.useState("overview");
  
  const totalPoints = 125000;
  const eliteStatus = "Gold";
  const eliteProgress = 75;
  
  // Calculate points trend
  const totalEarned = pointsHistory.reduce((sum, month) => sum + month.earned, 0);
  const totalRedeemed = pointsHistory.reduce((sum, month) => sum + month.redeemed, 0);
  const netChange = totalEarned - totalRedeemed;
  
  return (
    <div className="my-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        viewport={{ once: true }}
      >
        <h2 className="text-2xl font-bold mb-6">Your Rewards Dashboard</h2>
      </motion.div>
      
      <Tabs 
        aria-label="Dashboard Tabs" 
        color="primary" 
        variant="underlined"
        selectedKey={activeTab}
        onSelectionChange={(key) => setActiveTab(key as string)}
        classNames={{
          tabList: "gap-6",
          cursor: "w-full bg-primary",
          tab: "max-w-fit px-0 h-12"
        }}
      >
        <Tab
          key="overview"
          title={
            <div className="flex items-center gap-2">
              <Icon icon="lucide:layout-dashboard" />
              <span>Overview</span>
            </div>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            {/* Points Summary Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true }}
            >
              <Card className="bg-gradient-to-br from-primary-900/80 to-primary-800 text-white backdrop-blur-md border border-white/10 overflow-hidden">
                <div className="absolute top-0 right-0 opacity-10">
                  <Icon icon="lucide:award" width={120} height={120} />
                </div>
                <CardBody className="p-6">
                  <h3 className="text-lg font-medium text-white/80">Total Points Balance</h3>
                  <div className="flex items-end gap-2 mt-2">
                    <p className="text-4xl font-bold">{totalPoints.toLocaleString()}</p>
                    <div className={`text-sm mb-1 ${netChange >= 0 ? 'text-success-300' : 'text-danger-300'}`}>
                      <span className="flex items-center">
                        {netChange >= 0 ? (
                          <Icon icon="lucide:trending-up" className="mr-1" />
                        ) : (
                          <Icon icon="lucide:trending-down" className="mr-1" />
                        )}
                        {Math.abs(netChange).toLocaleString()} pts
                      </span>
                    </div>
                  </div>
                  <p className="text-white/60 text-sm mt-1">Last updated: Today</p>
                  
                  <Divider className="my-4 bg-white/20" />
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-white/80">Elite Status: {eliteStatus}</span>
                      <span className="text-sm text-white/80">{eliteProgress}%</span>
                    </div>
                    <Progress 
                      value={eliteProgress} 
                      color="success"
                      size="sm"
                      radius="full"
                      classNames={{
                        track: "bg-white/20",
                        indicator: "bg-gradient-to-r from-success-400 to-success-300"
                      }}
                    />
                    <p className="text-xs text-white/60 mt-2">
                      25,000 more points needed for Platinum status
                    </p>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
            
            {/* Upcoming Trips Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
              viewport={{ once: true }}
              className="md:col-span-2"
            >
              <Card className="backdrop-blur-md border border-white/10 h-full">
                <CardHeader className="flex justify-between items-center">
                  <h3 className="text-lg font-bold">Upcoming Reward Trips</h3>
                  <Button 
                    size="sm" 
                    variant="flat" 
                    color="primary"
                    endContent={<Icon icon="lucide:plus" />}
                  >
                    Book New Trip
                  </Button>
                </CardHeader>
                <CardBody className="p-4">
                  {upcomingTrips.length > 0 ? (
                    <div className="space-y-4">
                      {upcomingTrips.map((trip) => (
                        <div 
                          key={trip.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-default-50 dark:bg-default-100/50"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-primary/10 text-primary">
                              <Icon icon="lucide:plane" width={20} height={20} />
                            </div>
                            <div>
                              <p className="font-medium">{trip.destination}</p>
                              <p className="text-sm text-default-500">
                                {trip.departureDate} • {trip.airline}
                              </p>
                            </div>
                          </div>
                          <Badge 
                            color={
                              trip.status === "confirmed" 
                                ? "success" 
                                : trip.status === "pending" 
                                ? "warning" 
                                : "default"
                            }
                            variant="flat"
                          >
                            {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-default-500">No upcoming trips</p>
                      <Button 
                        color="primary" 
                        variant="flat" 
                        size="sm"
                        className="mt-2"
                      >
                        Book a trip with your points
                      </Button>
                    </div>
                  )}
                </CardBody>
              </Card>
            </motion.div>
            
            {/* Points Activity Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
              viewport={{ once: true }}
              className="md:col-span-3"
            >
              <Card className="backdrop-blur-md border border-white/10">
                <CardHeader className="flex justify-between items-center">
                  <h3 className="text-lg font-bold">Points Activity</h3>
                  <Button 
                    size="sm" 
                    variant="light" 
                    color="primary"
                    endContent={<Icon icon="lucide:download" />}
                  >
                    Export
                  </Button>
                </CardHeader>
                <CardBody className="p-4">
                  <div className="h-64 w-full">
                    <div className="flex h-full">
                      {pointsHistory.map((month, index) => (
                        <div key={index} className="flex-1 flex flex-col justify-end items-center gap-2">
                          <div className="w-full flex flex-col items-center gap-1">
                            <div 
                              className="w-4/5 bg-success-500/80 rounded-t-md" 
                              style={{ height: `${(month.earned / 10000) * 100}px` }}
                              title={`Earned: ${month.earned} points`}
                            ></div>
                            {month.redeemed > 0 && (
                              <div 
                                className="w-4/5 bg-danger-500/80 rounded-t-md" 
                                style={{ height: `${(month.redeemed / 10000) * 100}px` }}
                                title={`Redeemed: ${month.redeemed} points`}
                              ></div>
                            )}
                          </div>
                          <span className="text-xs text-default-500">{month.month}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-center gap-6 mt-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-success-500 rounded-full"></div>
                      <span className="text-sm">Points Earned</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-danger-500 rounded-full"></div>
                      <span className="text-sm">Points Redeemed</span>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          </div>
        </Tab>
        <Tab
          key="activity"
          title={
            <div className="flex items-center gap-2">
              <Icon icon="lucide:activity" />
              <span>Activity</span>
            </div>
          }
        >
          <div className="p-4 text-center">
            <p className="text-default-500">Detailed activity history will appear here.</p>
          </div>
        </Tab>
        <Tab
          key="rewards"
          title={
            <div className="flex items-center gap-2">
              <Icon icon="lucide:gift" />
              <span>Rewards</span>
            </div>
          }
        >
          <div className="p-4 text-center">
            <p className="text-default-500">Available rewards and redemption options will appear here.</p>
          </div>
        </Tab>
        <Tab
          key="preferences"
          title={
            <div className="flex items-center gap-2">
              <Icon icon="lucide:settings" />
              <span>Preferences</span>
            </div>
          }
        >
          <div className="p-4 text-center">
            <p className="text-default-500">Account preferences and settings will appear here.</p>
          </div>
        </Tab>
      </Tabs>
    </div>
  );
}