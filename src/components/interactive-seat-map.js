import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import { motion } from "framer-motion-3d";
function Seat({ position, isSelected, isAvailable, seatNumber, onSelect }) {
    const [isHovered, setIsHovered] = React.useState(false);
    const color = isAvailable
        ? isSelected
            ? "#0070F3"
            : isHovered
                ? "#4B9FFF"
                : "#E5E7EB"
        : "#9CA3AF";
    return (_jsxs("group", { position: position, children: [_jsxs(motion.mesh, { onClick: () => isAvailable && onSelect(), onPointerOver: () => setIsHovered(true), onPointerOut: () => setIsHovered(false), animate: {
                    scale: isSelected ? 1.1 : 1,
                    y: isSelected ? 0.1 : 0
                }, children: [_jsx("boxGeometry", { args: [0.8, 0.1, 0.8] }), _jsx("meshStandardMaterial", { color: color })] }), _jsx(Text, { position: [0, 0.2, 0], fontSize: 0.2, color: isAvailable ? "#000000" : "#6B7280", children: seatNumber })] }));
}
function Aisle() {
    return (_jsxs("mesh", { position: [0, -0.05, 0], rotation: [-Math.PI / 2, 0, 0], children: [_jsx("planeGeometry", { args: [0.6, 20] }), _jsx("meshStandardMaterial", { color: "#1F2937" })] }));
}
function CabinSection({ startRow, endRow, selectedSeats, onSeatSelect, unavailableSeats = [] }) {
    const seatLetters = ['A', 'B', 'C', 'D', 'E', 'F'];
    return (_jsxs("group", { children: [_jsx(Aisle, {}), Array.from({ length: endRow - startRow + 1 }).map((_, rowIndex) => {
                const row = startRow + rowIndex;
                return seatLetters.map((letter, seatIndex) => {
                    const seatNumber = `${row}${letter}`;
                    const x = (seatIndex % 3 - 1) * 1.2;
                    const z = rowIndex * 1.2;
                    const isAisle = seatIndex === 2;
                    return (_jsx(Seat, { position: [x + (isAisle ? 0.6 : 0), 0, z], isSelected: selectedSeats.includes(seatNumber), isAvailable: !unavailableSeats.includes(seatNumber), seatNumber: seatNumber, onSelect: () => onSeatSelect(seatNumber) }, seatNumber));
                });
            })] }));
}
export function InteractiveSeatMap({ flightId, onClose }) {
    const [selectedSeats, setSelectedSeats] = React.useState([]);
    const [activeView, setActiveView] = React.useState("economy");
    const [cameraPosition, setCameraPosition] = React.useState([0, 5, 10]);
    // In a real application, this would fetch the actual available seats for the specified flightId
    React.useEffect(() => {
        console.log(`Loading seat map for flight ${flightId}`);
        // Here you would fetch seat availability for the specific flight
    }, [flightId]);
    const handleSeatSelect = (seatNumber) => {
        setSelectedSeats(prev => {
            if (prev.includes(seatNumber)) {
                return prev.filter(seat => seat !== seatNumber);
            }
            else {
                return [...prev, seatNumber];
            }
        });
    };
    return (_jsxs("div", { className: "h-[500px] w-full relative rounded-lg overflow-hidden border border-gray-700", children: [_jsxs(Canvas, { camera: { position: cameraPosition, fov: 50 }, children: [_jsx("ambientLight", { intensity: 0.5 }), _jsx("spotLight", { position: [10, 10, 10], angle: 0.15, penumbra: 1 }), _jsx("pointLight", { position: [-10, -10, -10] }), _jsx(CabinSection, { startRow: 1, endRow: 12, selectedSeats: selectedSeats, onSeatSelect: handleSeatSelect }), _jsx(OrbitControls, { enableZoom: true, enablePan: true, enableRotate: true, maxPolarAngle: Math.PI / 2, minPolarAngle: 0 })] }), _jsxs("div", { className: "absolute top-4 left-4 bg-gray-900/70 backdrop-blur-md p-4 rounded-lg border border-gray-700", children: [_jsx("h3", { className: "text-sm font-bold mb-2 text-white", children: "Selected Seats" }), selectedSeats.length > 0 ? (_jsx("div", { className: "flex flex-wrap gap-2", children: selectedSeats.map(seat => (_jsx("div", { className: "px-2 py-1 bg-blue-600 text-white rounded-md text-xs", children: seat }, seat))) })) : (_jsx("p", { className: "text-gray-400 text-xs", children: "No seats selected" }))] }), _jsx("div", { className: "absolute bottom-4 right-4", children: _jsx("button", { className: "px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md ml-2", onClick: () => setCameraPosition([0, 5, 10]), children: "Reset View" }) }), _jsx("div", { className: "absolute bottom-4 left-4 bg-gray-900/70 backdrop-blur-md p-2 rounded-lg border border-gray-700", children: _jsxs("div", { className: "flex items-center gap-3 text-xs", children: [_jsxs("div", { className: "flex items-center gap-1", children: [_jsx("div", { className: "w-3 h-3 bg-gray-300 rounded" }), _jsx("span", { className: "text-white", children: "Available" })] }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx("div", { className: "w-3 h-3 bg-blue-600 rounded" }), _jsx("span", { className: "text-white", children: "Selected" })] }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx("div", { className: "w-3 h-3 bg-gray-600 rounded" }), _jsx("span", { className: "text-white", children: "Unavailable" })] })] }) })] }));
}
