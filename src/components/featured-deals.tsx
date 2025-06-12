import React from "react";
import { Card, CardBody, CardFooter, Button, Image, Chip } from "@heroui/react";
import { Icon } from "@iconify/react";

interface Deal {
  id: string;
  destination: string;
  image: string;
  pointsRequired: number;
  airline: string;
  cabinClass: string;
  departureDate: string;
  returnDate: string;
  discount: number;
}

const featuredDeals: Deal[] = [
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
  return (
    <div className="my-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Featured Point Deals</h2>
        <Button variant="light" color="primary" endContent={<Icon icon="lucide:arrow-right" />}>
          View All Deals
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {featuredDeals.map((deal) => (
          <Card key={deal.id} className="overflow-hidden">
            <div className="relative">
              <Image
                removeWrapper
                alt={deal.destination}
                className="z-0 w-full h-48 object-cover"
                src={deal.image}
              />
              <div className="absolute top-2 right-2">
                <Chip color="primary" variant="solid" className="font-bold">
                  {deal.discount}% OFF
                </Chip>
              </div>
            </div>
            <CardBody className="p-4">
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-bold">{deal.destination}</h3>
                <div className="flex flex-col items-end">
                  <p className="text-sm text-default-500">From</p>
                  <p className="font-bold text-lg">{deal.pointsRequired.toLocaleString()} pts</p>
                </div>
              </div>
              
              <div className="mt-3 space-y-2">
                <div className="flex items-center text-sm">
                  <Icon icon="lucide:plane" className="mr-2 text-default-500" />
                  <span>{deal.airline} • {deal.cabinClass}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Icon icon="lucide:calendar" className="mr-2 text-default-500" />
                  <span>{deal.departureDate} - {deal.returnDate}</span>
                </div>
              </div>
            </CardBody>
            <CardFooter className="p-4 pt-0">
              <Button color="primary" fullWidth>
                View Deal
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}