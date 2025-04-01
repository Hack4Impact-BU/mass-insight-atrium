"use client";

import { Button, Menu, MenuItem, Stack } from "@mui/material";
import { usePathname, useRouter } from "next/navigation";
import { useRef, useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [eventsAnchorEl, setEventsAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const eventsOpen = Boolean(eventsAnchorEl);
  const [reportsAnchorEl, setReportsAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const reportsOpen = Boolean(reportsAnchorEl);
  const handleEventsClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (pathname.includes("events") || pathname.includes("emails")) {
      setEventsAnchorEl(eventsUnderlineRef.current);
    } else {
      setEventsAnchorEl(event.currentTarget);
    }
  };
  const handleReportsClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (pathname.includes("data")) {
      setReportsAnchorEl(reportsUnderlineRef.current);
    } else {
      setReportsAnchorEl(event.currentTarget);
    }
  };
  const handleClose = (path: string) => {
    console.log(path);
    if (path !== "") {
      router.push(path);
    }
    setEventsAnchorEl(null);
    setReportsAnchorEl(null);
  };
  const eventsUnderlineRef = useRef(null);
  const reportsUnderlineRef = useRef(null);
  return (
    <div className="flex justify-center">
      <Stack direction="row" spacing={15}>
        <div>
          <Button onClick={() => router.push("/")}>Dashboard</Button>
          {pathname === "/" && <div className="h-[2px] bg-red-600"></div>}
        </div>
        <div>
          <Button
            id="events-button"
            aria-controls={eventsOpen ? "events-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={eventsOpen ? "true" : undefined}
            onClick={handleEventsClick}
          >
            Events
          </Button>
          {(pathname.includes("events") || pathname.includes("emails")) &&
            "/" && (
              <div
                ref={eventsUnderlineRef}
                className="h-[2px] bg-red-600"
              ></div>
            )}
          <Menu
            id="events-menu"
            anchorEl={eventsAnchorEl}
            open={eventsOpen}
            onClose={() => handleClose("")}
          >
            <MenuItem
              onClick={() => {
                handleClose("/events/create");
              }}
            >
              Create Event
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleClose("/events/manage");
              }}
            >
              Manage Events Created
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleClose("/emails/steps/one");
              }}
            >
              Send Emails
            </MenuItem>
          </Menu>
        </div>
        <div>
          <Button
            id="events-button"
            aria-controls={reportsOpen ? "reports-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={reportsOpen ? "true" : undefined}
            onClick={handleReportsClick}
          >
            Reports
          </Button>
          {pathname.includes("data") && "/" && (
            <div ref={reportsUnderlineRef} className="h-[2px] bg-red-600"></div>
          )}
          <Menu
            id="events-menu"
            anchorEl={reportsAnchorEl}
            open={reportsOpen}
            onClose={() => handleClose("")}
          >
            <MenuItem
              onClick={() => {
                handleClose("/upload-data");
              }}
            >
              Data Entry
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleClose("/manage-reports");
              }}
            >
              Manage Reports
            </MenuItem>
          </Menu>
        </div>
      </Stack>
    </div>
  );
}
