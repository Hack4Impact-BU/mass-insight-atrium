"use client";

import { Button, Menu, MenuItem, Stack, CircularProgress } from "@mui/material";
import { usePathname, useRouter } from "next/navigation";
import { useRef, useState, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface NavItem {
  label: string;
  path: string;
  subItems?: NavItem[];
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    path: "/dashboard",
  },
  {
    label: "Events",
    path: "/events",
    subItems: [
      { label: "Create Event", path: "/events/create/start" },
      { label: "Manage Events Created", path: "/events/manage" },
      { label: "Send Emails", path: "/emails/steps/one" },
      { label: "Email Campaigns", path: "/emails/campaigns" },
      { label: "Create Event Attendance Report", path: "/events/report-attendance/create" },
    ],
  },
  {
    label: "Reports",
    path: "/reports",
    subItems: [
      { label: "Upload Reports", path: "/reports" },
    ],
  },
];

// Memoize the NavItem component to prevent unnecessary re-renders
const NavItem = memo(({ 
  item, 
  isActive, 
  loading, 
  onMenuClick, 
  onClose, 
  menuAnchorEl 
}: { 
  item: NavItem;
  isActive: (path: string) => boolean;
  loading: string | null;
  onMenuClick: (event: React.MouseEvent<HTMLButtonElement>, item: NavItem) => void;
  onClose: (path: string) => void;
  menuAnchorEl: { [key: string]: HTMLElement | null };
}) => {
  const underlineRef = useRef<HTMLDivElement | null>(null);

  return (
    <div className="relative">
      <Button
        onClick={(e) => onMenuClick(e, item)}
        disabled={loading === item.path}
        className="relative"
      >
        {item.label}
        {loading === item.path && (
          <CircularProgress
            size={16}
            className="absolute right-0 top-1/2 -translate-y-1/2 ml-2"
          />
        )}
      </Button>
      <AnimatePresence>
        {isActive(item.path) && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            exit={{ width: 0 }}
            transition={{ duration: 0.2 }}
            className="h-[2px] bg-red-600 absolute bottom-0"
            ref={underlineRef}
          />
        )}
      </AnimatePresence>
      {item.subItems && (
        <Menu
          anchorEl={menuAnchorEl[item.label]}
          open={Boolean(menuAnchorEl[item.label])}
          onClose={() => onClose("")}
          TransitionProps={{
            enter: true,
            exit: true,
          }}
        >
          {item.subItems.map((subItem) => (
            <MenuItem
              key={subItem.path}
              onClick={() => onClose(subItem.path)}
              disabled={loading === subItem.path}
            >
              {subItem.label}
              {loading === subItem.path && (
                <CircularProgress size={16} className="ml-2" />
              )}
            </MenuItem>
          ))}
        </Menu>
      )}
    </div>
  );
});

NavItem.displayName = 'NavItem';

const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState<{ [key: string]: HTMLElement | null }>({});

  const handleNavigation = useCallback(async (path: string) => {
    try {
      setLoading(path);
      await router.push(path);
    } catch (error) {
      console.error('Navigation error:', error);
    } finally {
      setLoading(null);
    }
  }, [router]);

  const handleMenuClick = useCallback((event: React.MouseEvent<HTMLButtonElement>, item: NavItem) => {
    if (item.subItems) {
      setMenuAnchorEl(prev => ({
        ...prev,
        [item.label]: event.currentTarget
      }));
    } else {
      handleNavigation(item.path);
    }
  }, [handleNavigation]);

  const handleClose = useCallback((path: string) => {
    if (path) {
      handleNavigation(path);
    }
    setMenuAnchorEl({});
  }, [handleNavigation]);

  const isActive = useCallback((path: string) => {
    return pathname.startsWith(path);
  }, [pathname]);

  return (
    <div className="flex justify-center py-4 bg-white shadow-sm">
      <Stack direction="row" spacing={15}>
        {NAV_ITEMS.map((item) => (
          <NavItem
            key={item.label}
            item={item}
            isActive={isActive}
            loading={loading}
            onMenuClick={handleMenuClick}
            onClose={handleClose}
            menuAnchorEl={menuAnchorEl}
          />
        ))}
      </Stack>
    </div>
  );
};

export default memo(Navbar);
