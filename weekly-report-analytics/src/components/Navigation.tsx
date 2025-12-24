import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { BarChart3, Upload, Brain, Shield, LogOut, TrendingUp } from 'lucide-react';

export default function Navigation({ children }: { children: React.ReactNode }) {
  const { permissions, signOut } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/', label: 'Dashboard', icon: BarChart3 },
    { path: '/insights', label: 'AI Insights', icon: Brain },
    ...(permissions?.role === 'admin'
      ? [
          { path: '/upload', label: 'Upload', icon: Upload },
          { path: '/admin', label: 'Admin', icon: Shield }
        ]
      : []
    )
  ];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/50">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Mid-States Analytics</h1>
                <p className="text-xs text-slate-500">13 Week Report Dashboard</p>
              </div>
            </Link>

            {/* Navigation Items */}
            <div className="flex items-center space-x-2">
              {navItems.map(item => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link key={item.path} to={item.path}>
                    <Button
                      variant={active ? 'default' : 'ghost'}
                      className={active ? 'bg-blue-600 hover:bg-blue-700' : ''}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
            </div>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                      {getInitials(permissions?.displayName || 'U')}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{permissions?.displayName}</p>
                    <p className="text-xs text-slate-500">{permissions?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-xs text-slate-500">
                  Role: {permissions?.role}
                </DropdownMenuItem>
                {permissions?.role !== 'admin' && (
                  <DropdownMenuItem className="text-xs text-slate-500">
                    Sheet Access: {permissions?.allowedSheets.length}
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()} className="text-red-600">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="min-h-[calc(100vh-73px)]">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6">
        <div className="px-6 text-center">
          <p className="text-sm text-slate-500">
            Mid-States Analytics Platform © {new Date().getFullYear()}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Secure staffing data analytics powered by Firebase and Claude AI
          </p>
        </div>
      </footer>
    </div>
  );
}
