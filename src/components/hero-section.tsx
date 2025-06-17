import React from "react";
import { Button } from "@heroui/react";
import { Icon } from "@iconify/react";

export function HeroSection() {
  return (
   <div className="relative bg-gradient-to-r from-blue-900 to-purple-900 text-white">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://picsum.photos/id/1018/1920/1080')] bg-cover bg-center opacity-20"></div>
      </div>
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Travel Further with Your Points
          </h1>
          <p className="text-xl mb-8 text-white/80">
            Find and book premium flights using your points and miles. Get the most value from your travel rewards.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button 
              size="lg" 
              color="primary" 
              className="font-medium"
              endContent={<Icon icon="lucide:search" />}
            >
              Search Flights
            </Button>
            <Button 
              size="lg" 
              variant="bordered" 
              className="font-medium text-white border-white"
              endContent={<Icon icon="lucide:info" />}
            >
              Learn More
            </Button>
          </div>
          
          <div className="mt-12 flex flex-wrap gap-8">
            <div className="flex items-center">
              <div className="bg-white/20 p-2 rounded-full">
                <Icon icon="lucide:award" className="text-white" width={24} height={24} />
              </div>
              <span className="ml-3 text-white/90">20+ Airline Partners</span>
            </div>
            <div className="flex items-center">
              <div className="bg-white/20 p-2 rounded-full">
                <Icon icon="lucide:globe" className="text-white" width={24} height={24} />
              </div>
              <span className="ml-3 text-white/90">Global Destinations</span>
            </div>
            <div className="flex items-center">
              <div className="bg-white/20 p-2 rounded-full">
                <Icon icon="lucide:shield" className="text-white" width={24} height={24} />
              </div>
              <span className="ml-3 text-white/90">Best Value Guarantee</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}