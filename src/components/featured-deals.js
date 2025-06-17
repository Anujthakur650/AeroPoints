import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, CardBody, CardFooter, Button, Image, Chip } from "@heroui/react";
import { Icon } from "@iconify/react";
const featuredDeals = [
    {
        id: "1",
        destination: "Tokyo, Japan",
        image: "https://picsum.photos/id/1016/600/400",
        pointsRequired: 85000,
        airline: "ANA",
        cabinClass: "Business",
        departureDate: "Jun 15, 2024",
        returnDate: "Jun 29, 2024",
        discount: 20
    },
    {
        id: "2",
        destination: "Paris, France",
        image: "https://picsum.photos/id/1019/600/400",
        pointsRequired: 65000,
        airline: "Air France",
        cabinClass: "Premium Economy",
        departureDate: "Jul 10, 2024",
        returnDate: "Jul 24, 2024",
        discount: 15
    },
    {
        id: "3",
        destination: "Bali, Indonesia",
        image: "https://picsum.photos/id/1036/600/400",
        pointsRequired: 75000,
        airline: "Singapore Airlines",
        cabinClass: "Business",
        departureDate: "Aug 5, 2024",
        returnDate: "Aug 19, 2024",
        discount: 25
    }
];
export function FeaturedDeals() {
    return (_jsxs("div", { className: "my-12", children: [_jsxs("div", { className: "flex justify-between items-center mb-6", children: [_jsx("h2", { className: "text-2xl font-bold", children: "Featured Point Deals" }), _jsx(Button, { variant: "light", color: "primary", endContent: _jsx(Icon, { icon: "lucide:arrow-right" }), children: "View All Deals" })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: featuredDeals.map((deal) => (_jsxs(Card, { className: "overflow-hidden", children: [_jsxs("div", { className: "relative", children: [_jsx(Image, { removeWrapper: true, alt: deal.destination, className: "z-0 w-full h-48 object-cover", src: deal.image }), _jsx("div", { className: "absolute top-2 right-2", children: _jsxs(Chip, { color: "primary", variant: "solid", className: "font-bold", children: [deal.discount, "% OFF"] }) })] }), _jsxs(CardBody, { className: "p-4", children: [_jsxs("div", { className: "flex justify-between items-start", children: [_jsx("h3", { className: "text-xl font-bold", children: deal.destination }), _jsxs("div", { className: "flex flex-col items-end", children: [_jsx("p", { className: "text-sm text-default-500", children: "From" }), _jsxs("p", { className: "font-bold text-lg", children: [deal.pointsRequired.toLocaleString(), " pts"] })] })] }), _jsxs("div", { className: "mt-3 space-y-2", children: [_jsxs("div", { className: "flex items-center text-sm", children: [_jsx(Icon, { icon: "lucide:plane", className: "mr-2 text-default-500" }), _jsxs("span", { children: [deal.airline, " \u2022 ", deal.cabinClass] })] }), _jsxs("div", { className: "flex items-center text-sm", children: [_jsx(Icon, { icon: "lucide:calendar", className: "mr-2 text-default-500" }), _jsxs("span", { children: [deal.departureDate, " - ", deal.returnDate] })] })] })] }), _jsx(CardFooter, { className: "p-4 pt-0", children: _jsx(Button, { color: "primary", fullWidth: true, children: "View Deal" }) })] }, deal.id))) })] }));
}
