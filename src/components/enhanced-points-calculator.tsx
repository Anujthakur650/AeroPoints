import React from "react";
import { Card, CardBody, CardHeader, Input, Button, Divider, Select, SelectItem } from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";

const airlines = [
  { key: "delta", label: "Delta SkyMiles", icon: "logos:delta-airlines" },
  { key: "united", label: "United MileagePlus", icon: "logos:united-airlines" },
  { key: "american", label: "American AAdvantage", icon: "logos:american-airlines" },
  { key: "british", label: "British Airways Avios", icon: "logos:british-airways" },
  { key: "emirates", label: "Emirates Skywards", icon: "logos:emirates" }
];

export function EnhancedPointsCalculator() {
  const [selectedAirline, setSelectedAirline] = React.useState("delta");
  const [points, setPoints] = React.useState("50000");
  const [isCalculating, setIsCalculating] = React.useState(false);
  const [showResult, setShowResult] = React.useState(false);

  const handleCalculate = () => {
    setIsCalculating(true);
    setTimeout(() => {
      setIsCalculating(false);
      setShowResult(true);
    }, 1000);
  };

  return (
    <div className="container mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        viewport={{ once: true }}
        className="max-w-3xl mx-auto"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: "80px" }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            viewport={{ once: true }}
            className="h-1 bg-primary mb-4 mx-auto"
          />
          <h2 className="text-3xl font-bold mb-3" style={{ fontFamily: 'var(--font-heading)' }}>Points Value Calculator</h2>
          <p className="text-default-500 max-w-lg mx-auto">
            Discover the true value of your reward points and make informed decisions about your next redemption
          </p>
        </div>
        
        <Card className="shadow-xl backdrop-blur-card bg-background/80 border border-white/10 hover-lift" style={{ boxShadow: 'var(--card-shadow)' }}>
          <CardHeader className="px-6 py-5 flex gap-4 items-center">
            <div className="p-3 rounded-full bg-primary/10">
              <Icon icon="lucide:calculator" className="text-primary" width={24} height={24} />
            </div>
            <div className="flex flex-col">
              <p className="text-xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>Estimate Your Points Value</p>
              <p className="text-small text-default-500">Get an accurate valuation based on current market rates</p>
            </div>
          </CardHeader>
          <Divider className="opacity-20" />
          <CardBody className="px-6 py-5">
            <div className="space-y-6">
              <div>
                <label className="flex items-center gap-2 mb-1.5 text-sm font-medium">
                  <Icon icon="lucide:award" className="text-primary" width={14} height={14} />
                  <span>Reward Program</span>
                </label>
                <Select 
                  selectedKeys={[selectedAirline]} 
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as string;
                    setSelectedAirline(selected);
                    setShowResult(false);
                  }}
                  className="transition-all duration-300 hover:scale-[1.01] focus-within:scale-[1.01]"
                  classNames={{
                    base: "max-w-full",
                    trigger: "h-12 bg-default-100/20 hover:bg-default-100/30 border-default-200/30 hover:border-primary/40 data-[focused=true]:border-primary rounded-xl transition-all duration-200",
                    value: "text-default-800",
                    popover: "bg-background/95 backdrop-blur-lg border border-default-200/30 rounded-xl shadow-xl"
                  }}
                  listboxProps={{
                    itemClasses: {
                      base: "text-default-800 data-[hover=true]:bg-default-100/50 data-[hover=true]:text-default-900 rounded-lg transition-colors",
                      selectedIcon: "text-primary"
                    }
                  }}
                  popoverProps={{
                    classNames: {
                      content: "p-1 overflow-hidden"
                    }
                  }}
                  startContent={
                    <div className="pointer-events-none flex items-center">
                      <Icon icon="lucide:award" className="text-default-400" />
                    </div>
                  }
                  renderValue={(items) => {
                    const item = items[0];
                    const airline = airlines.find(a => a.key === item.key);
                    return (
                      <div className="flex items-center gap-2">
                        <Icon icon={airline?.icon || "lucide:award"} width={20} height={20} />
                        <span>{item.textValue}</span>
                      </div>
                    );
                  }}
                >
                  {airlines.map((item) => (
                    <SelectItem 
                      key={item.key} 
                      value={item.key}
                      startContent={<Icon icon={item.icon} width={20} height={20} />}
                    >
                      {item.label}
                    </SelectItem>
                  ))}
                </Select>
              </div>
              
              <div>
                <label className="flex items-center gap-2 mb-1.5 text-sm font-medium">
                  <Icon icon="lucide:trending-up" className="text-primary" width={14} height={14} />
                  <span>Points Amount</span>
                </label>
                <Input
                  type="number"
                  placeholder="Enter points amount"
                  value={points}
                  onValueChange={(value) => {
                    setPoints(value);
                    setShowResult(false);
                  }}
                  startContent={
                    <div className="pointer-events-none flex items-center">
                      <Icon icon="lucide:trending-up" className="text-default-400" />
                    </div>
                  }
                  classNames={{
                    base: "max-w-full",
                    mainWrapper: "h-12",
                    inputWrapper: "h-12 bg-default-100/20 hover:bg-default-100/30 border-default-200/30 hover:border-primary/40 data-[focused=true]:border-primary rounded-xl transition-all duration-200",
                    input: "placeholder:text-default-400/50 text-default-800",
                  }}
                  className="transition-all duration-300 hover:scale-[1.01] focus-within:scale-[1.01]"
                />
              </div>
              
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  color="primary" 
                  fullWidth
                  onPress={handleCalculate}
                  isLoading={isCalculating}
                  className="h-12 rounded-xl font-medium bg-gradient-to-r from-primary-500 to-primary-600 shadow-lg shadow-primary-500/20"
                  startContent={!isCalculating && <Icon icon="lucide:calculator" width={18} height={18} />}
                >
                  {isCalculating ? "Calculating..." : "Calculate Value"}
                </Button>
              </motion.div>
              
              {showResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="p-6 rounded-xl border border-primary/20 bg-gradient-to-br from-primary-500/10 to-primary-600/5 backdrop-blur-sm"
                >
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-primary/20">
                        <Icon icon="lucide:dollar-sign" className="text-primary" width={20} height={20} />
                      </div>
                      <div>
                        <p className="text-sm text-default-500">Estimated Cash Value</p>
                        <p className="text-2xl font-bold text-primary">$750 - $950</p>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-default-400">Value per 1,000 points</p>
                      <p className="text-lg font-semibold">${(850 / (parseInt(points) / 1000)).toFixed(2)}</p>
                    </div>
                  </div>
                  <p className="text-xs text-default-500 mt-2 flex items-center gap-1">
                    <Icon icon="lucide:info" width={12} height={12} />
                    <span>Based on current redemption rates and market conditions</span>
                  </p>
                </motion.div>
              )}
            </div>
          </CardBody>
        </Card>
      </motion.div>
    </div>
  );
}