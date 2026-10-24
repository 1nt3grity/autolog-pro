import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Gauge, Car, Stethoscope, Menu } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const LOGO_URL = 'https://media.base44.com/images/public/6adca41a71da92dee5d62b28/c777466c4_logo.png';

const NAV = [
  { to: '/', label: 'Dashboard', icon: Gauge, end: true },
  { to: '/garage', label: 'Garage', icon: Car },
  { to: '/diagnostics', label: 'Diagnostics', icon: Stethoscope }
];

function NavItems({ onNavigate }) {
  return (
    <nav className="space-y-1">
      {NAV.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200',
              isActive
                ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-sidebar-primary/20'
                : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
            )
          }
        >
          <Icon className="h-[18px] w-[18px] transition-transform duration-200 group-hover:scale-110" />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <Image src={LOGO_URL} alt="AutoLog Pro" className="h-9 w-9 rounded-lg object-contain" />
      <div className="leading-tight">
        <p className="font-heading text-[15px] font-semibold tracking-tight">AutoLog Pro</p>
        <p className="text-[11px] uppercase tracking-[0.16em] text-sidebar-foreground/45">My garage</p>
      </div>
    </div>
  );
}

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col justify-between bg-sidebar px-5 py-7 lg:flex">
        <div className="space-y-9">
          <Brand />
          <NavItems />
        </div>
        <p className="text-[11px] leading-relaxed text-sidebar-foreground/35">
          Private record keeping. Only you can see this garage.
        </p>
      </aside>

      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-background/85 px-4 py-3 backdrop-blur-xl lg:hidden">
        <div className="flex items-center gap-2.5">
          <Image src={LOGO_URL} alt="AutoLog Pro" className="h-8 w-8 rounded-lg object-contain" />
          <span className="font-heading text-sm font-semibold tracking-tight">AutoLog Pro</span>
        </div>
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[264px] border-none bg-sidebar p-5 pt-8">
            <div className="space-y-8">
              <Brand />
              <NavItems onNavigate={() => setMobileOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>
      </header>

      <main className="lg:pl-[248px]">
        <div className="mx-auto w-full max-w-6xl px-4 pb-20 pt-6 sm:px-6 lg:px-10 lg:pt-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}