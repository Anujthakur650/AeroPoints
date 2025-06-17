import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import { motion } from "framer-motion-3d";
import * as THREE from "three";
import { Card, CardBody, Button } from "@heroui/react";
import { Icon } from "@iconify/react";

interface SeatProps {
  position: [number, number, number];
  isSelected: boolean;
  isAvailable: boolean;
  seatNumber: string;
  onSelect: () => void;
}

function Seat({ position, isSelected, isAvailable, seatNumber, onSelect }: SeatProps) {
  const [isHovered, setIsHovered] = React.useState(false);
  
  const color = isAvailable 
    ? isSelected 
      ? "#0070F3" 
      : isHovered 
        ? "#4B9FFF"
        : "#E5E7EB"
    : "#9CA3AF";

  return (
    <group position={position}>
      <motion.mesh
        onClick={() => isAvailable && onSelect()}
        onPointerOver={() => setIsHovered(true)}
        onPointerOut={() => setIsHovered(false)}
        animate={{
          scale: isSelected ? 1.1 : 1,
          y: isSelected ? 0.1 : 0
        }}
      >
        <boxGeometry args={[0.8, 0.1, 0.8]} />
        <meshStandardMaterial color={color} />
      </motion.mesh>
      <Text
        position={[0, 0.2, 0]}
        fontSize={0.2}
        color={isAvailable ? "#000000" : "#6B7280"}
      >
        {seatNumber}
      </Text>
    </group>
  );
}

function Aisle() {
  return (
    <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[0.6, 20]} />
      <meshStandardMaterial color="#1F2937" />
    </mesh>
  );
}

interface CabinSectionProps {
  startRow: number;
  endRow: number;
  selectedSeats: string[];
  onSeatSelect: (seatNumber: string) => void;
  unavailableSeats?: string[];
}

function CabinSection({ startRow, endRow, selectedSeats, onSeatSelect, unavailableSeats = [] }: CabinSectionProps) {
  const seatLetters = ['A', 'B', 'C', 'D', 'E', 'F'];
  
  return (
    <group>
      <Aisle />
      {Array.from({ length: endRow - startRow + 1 }).map((_, rowIndex) => {
        const row = startRow + rowIndex;
        return seatLetters.map((letter, seatIndex) => {
          const seatNumber = `${row}${letter}`;
          const x = (seatIndex % 3 - 1) * 1.2;
          const z = rowIndex * 1.2;
          const isAisle = seatIndex === 2;
          
          return (
            <Seat
              key={seatNumber}
              position={[x + (isAisle ? 0.6 : 0), 0, z]}
              isSelected={selectedSeats.includes(seatNumber)}
              isAvailable={!unavailableSeats.includes(seatNumber)}
              seatNumber={seatNumber}
              onSelect={() => onSeatSelect(seatNumber)}
            />
          );
        });
      })}
    </group>
  );
}

// Add interface for InteractiveSeatMap props
interface InteractiveSeatMapProps {
  flightId: string;
  onClose: () => void;
}

export function InteractiveSeatMap({ flightId, onClose }: InteractiveSeatMapProps) {
  const [selectedSeats, setSelectedSeats] = React.useState<string[]>([]);
  const [activeView, setActiveView] = React.useState<"economy" | "business" | "first">("economy");
  const [cameraPosition, setCameraPosition] = React.useState<[number, number, number]>([0, 5, 10]);
  
  // In a real application, this would fetch the actual available seats for the specified flightId
  React.useEffect(() => {
    console.log(`Loading seat map for flight ${flightId}`);
    // Here you would fetch seat availability for the specific flight
  }, [flightId]);
  
  const handleSeatSelect = (seatNumber: string) => {
    setSelectedSeats(prev => {
      if (prev.includes(seatNumber)) {
        return prev.filter(seat => seat !== seatNumber);
      } else {
        return [...prev, seatNumber];
      }
    });
  };

  return (
    <div className="h-[500px] w-full relative rounded-lg overflow-hidden border border-gray-700">
      <Canvas camera={{ position: cameraPosition, fov: 50 }}>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
        <pointLight position={[-10, -10, -10]} />
        
        <CabinSection
          startRow={1}
          endRow={12}
          selectedSeats={selectedSeats}
          onSeatSelect={handleSeatSelect}
        />
        
        <OrbitControls
          enableZoom={true}
          enablePan={true}
          enableRotate={true}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={0}
        />
      </Canvas>
      
      <div className="absolute top-4 left-4 bg-gray-900/70 backdrop-blur-md p-4 rounded-lg border border-gray-700">
        <h3 className="text-sm font-bold mb-2 text-white">Selected Seats</h3>
        {selectedSeats.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {selectedSeats.map(seat => (
              <div
                key={seat}
                className="px-2 py-1 bg-blue-600 text-white rounded-md text-xs"
              >
                {seat}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-xs">No seats selected</p>
        )}
      </div>
      
      <div className="absolute bottom-4 right-4">
        <button
          className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md ml-2"
          onClick={() => setCameraPosition([0, 5, 10])}
        >
          Reset View
        </button>
      </div>
      
      <div className="absolute bottom-4 left-4 bg-gray-900/70 backdrop-blur-md p-2 rounded-lg border border-gray-700">
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gray-300 rounded"></div>
            <span className="text-white">Available</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-600 rounded"></div>
            <span className="text-white">Selected</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gray-600 rounded"></div>
            <span className="text-white">Unavailable</span>
          </div>
        </div>
      </div>
    </div>
  );
}