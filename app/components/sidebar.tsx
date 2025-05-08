'use client';

import { usePathname } from 'next/navigation';
import { ChartBarIcon } from '@heroicons/react/24/outline';

const navigation = [
  {
    name: 'Reports',
    icon: ChartBarIcon,
    current: false,
    children: [
      { name: 'Attendance', href: '/reports/attendance' },
      { name: 'Engagement', href: '/reports/engagement' },
      { name: 'Email Campaigns', href: '/emails/campaigns' },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r">
      <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
        <nav className="mt-5 flex-1 space-y-1 px-2">
          {navigation.map((item) => (
            <div key={item.name}>
              <div className="flex items-center px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50">
                <item.icon className="mr-3 h-6 w-6" aria-hidden="true" />
                {item.name}
              </div>
              {item.children && (
                <div className="ml-4 mt-1 space-y-1">
                  {item.children.map((child) => (
                    <a
                      key={child.name}
                      href={child.href}
                      className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                        pathname === child.href
                          ? 'bg-gray-100 text-gray-900'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      {child.name}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
} 