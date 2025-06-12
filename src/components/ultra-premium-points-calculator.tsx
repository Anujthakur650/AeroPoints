import React from "react";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";

const airlines = [
  { key: "delta", label: "Delta SkyMiles", icon: "logos:delta-airlines", multiplier: 1.2 },
  { key: "united", label: "United MileagePlus", icon: "logos:united-airlines", multiplier: 1.1 },
  { key: "american", label: "American AAdvantage", icon: "logos:american-airlines", multiplier: 1.15 },
  { key: "british", label: "British Airways Avios", icon: "logos:british-airways", multiplier: 1.3 },
  { key: "emirates", label: "Emirates Skywards", icon: "logos:emirates", multiplier: 1.4 }
];

export function UltraPremiumPointsCalculator() {
  const [selectedAirline, setSelectedAirline] = React.useState("delta");
  const [points, setPoints] = React.useState("50000");
  const [isCalculating, setIsCalculating] = React.useState(false);
  const [showResult, setShowResult] = React.useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);

  const selectedAirlineData = airlines.find(airline => airline.key === selectedAirline);
  const baseValue = parseInt(points) || 0;
  const estimatedValue = Math.round(baseValue * 0.015 * (selectedAirlineData?.multiplier || 1));
  const valueRange = {
    low: Math.round(estimatedValue * 0.8),
    high: Math.round(estimatedValue * 1.2)
  };

  const handleCalculate = () => {
    if (!points || parseInt(points) <= 0) return;
    
    setIsCalculating(true);
    setTimeout(() => {
      setIsCalculating(false);
      setShowResult(true);
    }, 1500);
  };

  const handlePointsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, '');
    setPoints(value);
    setShowResult(false);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  return (
    <div className="calculator-section">
      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-3 glass-badge mb-6">
            <Icon icon="lucide:calculator" className="text-gold-primary" />
            <span className="text-gold-primary font-medium uppercase tracking-wide">Points Calculator</span>
          </div>
          
          <h2 className="calculator-main-title">
            Discover Your Points Value
          </h2>
          
          <p className="calculator-subtitle">
            Calculate the true value of your reward points with our premium estimation tool.
          </p>
        </motion.div>

        {/* Calculator Container */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="calculator-container"
        >
          <div className="calculator-content">
            <div className="calculator-header">
              <h3 className="calculator-title">
                <Icon icon="lucide:calculator" className="calculator-icon" />
                Premium Points Estimator
              </h3>
              <p className="calculator-subtitle">
                Get accurate valuations based on current market rates
              </p>
            </div>

            <div className="space-y-8">
              {/* Airline Selection */}
              <div className="form-group">
                <label className="form-label">
                  <Icon icon="lucide:award" className="form-label-icon" />
                  Select Reward Program
                </label>
                <select 
                  value={selectedAirline}
                  onChange={(e) => {
                    setSelectedAirline(e.target.value);
                    setShowResult(false);
                  }}
                  className="reward-program-dropdown"
                >
                  {airlines.map((airline) => (
                    <option key={airline.key} value={airline.key}>
                      {airline.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Points Input */}
              <div className="form-group">
                <label className="form-label">
                  <Icon icon="lucide:coins" className="form-label-icon" />
                  Points Amount
                </label>
                <input
                  type="text"
                  value={points ? formatNumber(parseInt(points)) : ''}
                  onChange={handlePointsChange}
                  placeholder="Enter your points amount"
                  className="points-input"
                />
              </div>

              {/* Calculate Button */}
              <motion.button
                onClick={handleCalculate}
                disabled={!points || parseInt(points) <= 0 || isCalculating}
                className="calculate-button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isCalculating ? (
                  <div className="flex items-center justify-center gap-3">
                    <Icon icon="lucide:loader-2" className="animate-spin" />
                    <span>Calculating Value...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-3">
                    <Icon icon="lucide:calculator" className="button-icon" />
                    <span>Calculate Points Value</span>
                  </div>
                )}
              </motion.button>

              {/* Results Display */}
              {showResult && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="results-container"
                >
                  <div className="results-header">
                    <div className="flex items-center gap-3 mb-4">
                      <Icon icon="lucide:dollar-sign" className="text-emerald-400 text-2xl" />
                      <div>
                        <h4 className="results-title">Estimated Cash Value</h4>
                        <p className="results-subtitle">Based on current market rates</p>
                      </div>
                    </div>
                  </div>

                  <div className="value-display">
                    <div className="primary-value">
                      <span className="currency-symbol">$</span>
                      <span className="value-amount">{formatNumber(valueRange.low)}</span>
                      <span className="value-separator"> - </span>
                      <span className="value-amount">{formatNumber(valueRange.high)}</span>
                    </div>
                    <div className="value-per-point">
                      {(estimatedValue / parseInt(points) * 1000).toFixed(2)}¢ per point
                    </div>
                  </div>

                  <div className="results-disclaimer">
                    <Icon icon="lucide:info" width={16} height={16} />
                    <span>
                      Values are estimates based on current redemption rates and may vary.
                    </span>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 