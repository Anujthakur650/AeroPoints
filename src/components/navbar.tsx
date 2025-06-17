import React from "react";
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Link, Button, Avatar, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/react";
import { Icon } from "@iconify/react";

export function AppNavbar() {
  return (
    <Navbar className="bg-background/70 backdrop-blur-md border-b border-divider">
      <NavbarBrand>
        <Icon icon="lucide:plane" className="text-primary" width={28} height={28} />
        <p className="font-bold text-inherit ml-2">AeroPoints</p>
      </NavbarBrand>
      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        <NavbarItem>
          <Link color="foreground" href="#">
            Search Flights
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link color="foreground" href="#">
            My Points
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link color="foreground" href="#">
            Deals
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link color="foreground" href="#">
            Partners
          </Link>
        </NavbarItem>
      </NavbarContent>
      <NavbarContent justify="end">
        <NavbarItem className="hidden lg:flex">
          <Button color="primary" variant="flat" startContent={<Icon icon="lucide:bell" />}>
            Alerts
          </Button>
        </NavbarItem>
        <Dropdown placement="bottom-end">
          <DropdownTrigger>
            <Avatar
              isBordered
              as="button"
              className="transition-transform"
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