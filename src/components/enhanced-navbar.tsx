import React from "react";
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Link, Button, Avatar, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { ThemeToggle } from "./theme-toggle";

export function EnhancedNavbar() {
  const navItemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.1 * i,
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1]
      }
    })
  };

  return (
    <Navbar className="bg-background/80 backdrop-blur-md border-b border-divider">
      <NavbarBrand as={motion.div} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
        <Icon icon="lucide:plane" className="text-primary" width={28} height={28} />
        <p className="font-bold text-inherit ml-2">HeroUI</p>
      </NavbarBrand>
      
      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        {["Search Flights", "My Points", "Deals", "Partners"].map((item, i) => (
          <NavbarItem key={item}>
            <motion.div custom={i} variants={navItemVariants} initial="hidden" animate="visible">
              <Link color="foreground" href="#" className="relative group">
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </motion.div>
          </NavbarItem>
        ))}
      </NavbarContent>
      
      <NavbarContent justify="end">
        <NavbarItem>
          <ThemeToggle />
        </NavbarItem>
        <NavbarItem className="hidden lg:flex">
          <Button 
            color="primary" 
            variant="flat" 
            startContent={<Icon icon="lucide:bell" />}
            className="transition-transform hover:scale-105"
          >
            Alerts
          </Button>
        </NavbarItem>
        <Dropdown placement="bottom-end">
          <DropdownTrigger>
            <Avatar
              isBordered
              as="button"
              className="transition-transform hover:scale-105"
              color="primary"
              name="Jason Smith"
              size="sm"
              src="https://i.pravatar.cc/150?u=a042581f4e29026704d"
            />
          </DropdownTrigger>
          <DropdownMenu aria-label="Profile Actions" variant="flat">
            <DropdownItem key="profile" className="h-14 gap-2">
              <p className="font-semibold">Signed in as</p>
              <p className="font-semibold">jason@example.com</p>
            </DropdownItem>
            <DropdownItem key="settings">My Profile</DropdownItem>
            <DropdownItem key="points">My Points (125,000)</DropdownItem>
            <DropdownItem key="trips">My Trips</DropdownItem>
            <DropdownItem key="settings">Settings</DropdownItem>
            <DropdownItem key="help_and_feedback">Help & Feedback</DropdownItem>
            <DropdownItem key="logout" color="danger">
              Log Out
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </NavbarContent>
    </Navbar>
  );
}