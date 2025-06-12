import React from "react";
import { Card, CardBody, CardHeader, Input, Button, Divider, Select, SelectItem } from "@heroui/react";
import { Icon } from "@iconify/react";

const airlines = [
  { key: "delta", label: "Delta SkyMiles" },
  { key: "united", label: "United MileagePlus" },
  { key: "american", label: "American AAdvantage" },
  { key: "british", label: "British Airways Avios" },
  { key: "emirates", label: "Emirates Skywards" }
];

export function PointsCalculator() {
  const [selectedAirline, setSelectedAirline] = React.useState("delta");
  const [points, setPoints] = React.useState("50000");

  const handleCalculate = () => {
    console.log("Calculating value for", points, "points on", selectedAirline);
  };

  return (
    <Card className="w-full shadow-md">
      <CardHeader className="flex gap-3">
        <Icon icon="lucide:calculator" className="text-primary" width={24} height={24} />
        <div className="flex flex-col">
          <p className="text-lg font-bold">Points Value Calculator</p>
          <p className="text-small text-default-500">Estimate the value of your reward points</p>
        </div>
      </CardHeader>
      <Divider />
      <CardBody className="p-4">
        <div className="space-y-4">
          <Select 
            label="Select Reward Program" 
            selectedKeys={[selectedAirline]} 
            onSelectionChange={(keys) => {
              const selected = Array.from(keys)[0] as string;
              setSelectedAirline(selected);
            }}
          >
            {airlines.map((item) => (
              <SelectItem key={item.key} value={item.key}>
                {item.label}
              </SelectItem>
            ))}
          </Select>
          
          <Input
            type="number"
            label="Points Amount"
            placeholder="Enter points amount"
            value={points}
            onValueChange={setPoints}
            startContent={
              <div className="pointer-events-none flex items-center">
                <Icon icon="lucide:award" className="text-default-400" />
              </div>
            }
          />
          
          <Button 
            color="primary" 
            fullWidth
            onPress={handleCalculate}
          >
            Calculate Value
          </Button>
          
          <div className="bg-default-100 p-3 rounded-lg mt-4">
            <p className="text-center text-sm text-default-600">Estimated Value</p>
            <p className="text-center text-xl font-bold">$750 - $950</p>
            <p className="text-center text-xs text-default-500">Based on current redemption rates</p>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}