          {
            name: 'Reports',
            icon: ChartBarIcon,
            current: pathname.startsWith('/reports'),
            children: [
              { name: 'Attendance', href: '/reports/attendance' },
              { name: 'Engagement', href: '/reports/engagement' },
              { name: 'Email Campaigns', href: '/emails/campaigns' },
            ],
          }, 