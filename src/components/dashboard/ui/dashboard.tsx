
import { useState } from 'react';
import { SidebarInset,  SidebarProvider } from '@/components/ui/sidebar';
import { Users, DollarSign, Eye } from 'lucide-react';
import { DashboardCard } from '@/components/ui/dashboard-card';
import { RevenueChart  } from '@/components/ui/revenue-chart';
import { UsersTable } from '@/components/ui/users-table';
import { QuickActions } from '@/components/ui/quick-actions';
import { SystemStatus } from '@/components/ui/system-status';
import { RecentActivity } from '@/components/ui/recent-activity';
import {DashboardHeader } from '@/components/ui/dashboard-header';
import { AdminSidebar } from '@/components/ui/admin-sidebar';


const stats = [
    {
        title: 'Total Users',
        value: '12,545',
        change: '+124%',
        changeType: 'positive' as const,
        icon: Users,
        color: 'text-blue-500',
        bgcolor: 'bg-blue-500/10',
    },
    {
        title: 'Revenue',
        value: '$45,607',
        change: '+8.2%',
        changeType: 'positive' as const,
        icon: DollarSign,
        color: 'text-green-500',
        bgcolor: 'bg-green-500/10',
    },
    {
        title: 'Page Views',
        value: '34,567',
        change: '-2.5%',
        changeType: 'negative' as const,
        icon: Eye,
        color: 'text-orange-500',
        bgcolor: 'bg-orange-500/10',

        },
];


export default function AdminDashboard() {
    const [isRefreshing, setIsRefreshing ] = useState(false);
    const [searchQuery, setSearchQuery]  = useState('');


    const handleRefresh = async () => {
        setIsRefreshing(true);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setIsRefreshing(false);
    };

    const handleExport = () => {
        console.log('Exporting data...')
    };

    const handleAddUser = () => {
        console.log('Adding new user...');
    };

    return (
        <SidebarProvider>
            <AdminSidebar />
            <SidebarInset>
                <DashboardHeader
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  onRefresh={handleRefresh}
                  onExport={handleExport}
                  isRefreshing={isRefreshing}

                />

                <div className="flex flex-1 flex-col gap-2 p-2 pt-0 sm:gap-4 sm:p-4">
                    <div className="min-h-[calc(100vh-4rem)] flex-1 rounded-lg p-3 sm:rounded-xl sm:p-4 md:p-6">
                        <div className="mx-auto max-w-6xl space-y-4 sm:space-y-6">
                            <div className="px-2 sm:px-0">
                                <h1 className="text-2xl font-bold tracking-right sm:text-3xl">
                                    Welcome Admin
                                </h1>
                            </div>

                            {/* Stats Cards */}
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2. sm:gap-4 lg:grid-cols-4">
                                {stats.map((stat, index) => (
                                    <DashboardCard key={stat.title} stat={stat} index={index} />
                                ))}
                            </div>

                            {/* Main Content Grid */}
                            <div className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-3">
                                {/* Charts section */}
                                <div className="space-y-4 sm:space-y-6v xl:col-space-2">
                                    <RevenueChart />
                                    <UsersTable onAddUser={handleAddUser} />
                                </div>

                                {/* sidebar Section */}
                                <div className="space-y-4 sm:space-y-6">
                                    <QuickActions
                                       onAddUser={handleAddUser}
                                       onExport={handleExport}

                                       />
                                       <SystemStatus />
                                       <RecentActivity />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );

}
