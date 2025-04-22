
import { 
    BarChart, 
    Package, 
    Ticket, 
    FileText, 
    User, 
    Settings, 
    HelpCircle,
    MessageCircle,
    Home
  } from 'lucide-react';
  import Link from 'next/link';
  import NavItems from './NavItems';
  
  export default function Sidebar({ isLightMode }: any) {
    
    const navItems = [
        { icon: BarChart, text: "Dashboard", href: "#", isActive: true },
        { icon: Home, text: "Home", href: "/" },
        {icon: MessageCircle, text: "Chat", href: "/chats"},
        { icon: Package, text: "Orders", href: "#" },
        { icon: Ticket, text: "Tickets", href: "#" },
        { icon: User, text: "Customers", href: "#" },
        { icon: Settings, text: "Settings", href: "#" },
    ]
  
    return (
      <aside className={`hidden md:flex flex-col w-64 ${isLightMode ? 'bg-white' : 'bg-slate-900 text-white'} border-r-2 border-gray-300 h-screen sticky top-20`}>
        <nav className="mt-5 px-2">
          <NavItems items={navItems} isLightMode={isLightMode} />
        </nav>
      </aside>
    );
  }