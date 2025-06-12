import React from "react";
import { Link, Divider } from "@heroui/react";
import { Icon } from "@iconify/react";

export function Footer() {
  return (
    <footer className="bg-background py-12 border-t border-divider">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <Icon icon="lucide:plane" className="text-primary" width={24} height={24} />
              <h3 className="font-bold text-lg ml-2">AeroPoints</h3>
            </div>
            <p className="text-default-500 text-sm mb-4">
              Find and book premium flights using your points and miles. Get the most value from your travel rewards.
            </p>
            <div className="flex space-x-4">
              <Link href="#" aria-label="Facebook">
                <Icon icon="lucide:facebook" width={20} height={20} />
              </Link>
              <Link href="#" aria-label="Twitter">
                <Icon icon="lucide:twitter" width={20} height={20} />
              </Link>
              <Link href="#" aria-label="Instagram">
                <Icon icon="lucide:instagram" width={20} height={20} />
              </Link>
              <Link href="#" aria-label="LinkedIn">
                <Icon icon="lucide:linkedin" width={20} height={20} />
              </Link>
            </div>
          </div>
          
          <div>
            <h3 className="font-bold mb-4">Company</h3>
            <ul className="space-y-2">
              <li><Link href="#" color="foreground" className="text-sm">About Us</Link></li>
              <li><Link href="#" color="foreground" className="text-sm">Careers</Link></li>
              <li><Link href="#" color="foreground" className="text-sm">Press</Link></li>
              <li><Link href="#" color="foreground" className="text-sm">Partners</Link></li>
              <li><Link href="#" color="foreground" className="text-sm">Contact</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><Link href="#" color="foreground" className="text-sm">Points Guide</Link></li>
              <li><Link href="#" color="foreground" className="text-sm">Airline Partners</Link></li>
              <li><Link href="#" color="foreground" className="text-sm">Travel Blog</Link></li>
              <li><Link href="#" color="foreground" className="text-sm">FAQ</Link></li>
              <li><Link href="#" color="foreground" className="text-sm">Help Center</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><Link href="#" color="foreground" className="text-sm">Terms of Service</Link></li>
              <li><Link href="#" color="foreground" className="text-sm">Privacy Policy</Link></li>
              <li><Link href="#" color="foreground" className="text-sm">Cookie Policy</Link></li>
              <li><Link href="#" color="foreground" className="text-sm">Accessibility</Link></li>
              <li><Link href="#" color="foreground" className="text-sm">Security</Link></li>
            </ul>
          </div>
        </div>
        
        <Divider className="my-8" />
        
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-default-500 text-sm">
            &copy; {new Date().getFullYear()} AeroPoints. All rights reserved.
          </p>
          <div className="flex items-center mt-4 md:mt-0">
            <img src="https://picsum.photos/id/237/40/25" alt="Payment method" className="h-6 mr-2" />
            <img src="https://picsum.photos/id/238/40/25" alt="Payment method" className="h-6 mr-2" />
            <img src="https://picsum.photos/id/239/40/25" alt="Payment method" className="h-6 mr-2" />
            <img src="https://picsum.photos/id/240/40/25" alt="Payment method" className="h-6" />
          </div>
        </div>
      </div>
    </footer>
  );
}