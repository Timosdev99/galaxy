"use client"

import { useState, useEffect } from 'react';
import { 
  BarChart, 
  Package, 
  Ticket, 
  Percent, 
  User, 
  FileText, 
  Settings, 
  HelpCircle, 
  Sun,
  Moon,
  Menu,
  LogOut,
  Home
} from 'lucide-react';
import { useAuth } from '../../context/authContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Dashboard() {
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [isLightMode, setIsLightMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const { user, logout } = useAuth();
  const router = useRouter();

  
  useEffect(() => {
    if (!user) {
      router.push('/');
    }
  }, [user, router]);

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme === "light") {
      setIsLightMode(true);
      document.documentElement.classList.add("light"); 
    } else {
      document.documentElement.classList.remove("light");
    }
  }, []);

  const toggleLightMode = () => {
    setIsLightMode((prev) => !prev);
    
    if (!isLightMode) {
      document.documentElement.classList.add("light");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.classList.remove("light");
      localStorage.setItem("theme", "dark");
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

 
  const getUserInitial = () => {
    if (user?.name) {
      return user.name.charAt(0).toUpperCase();
    }
    return "U";
  };

  const projects = [
    { id: 1, name: "mercerdes", dueDate: "28.04.24", status: "Completed" },
    { id: 2, name: "car rental", dueDate: "30.04.24", status: "Delayed" },
    { id: 3, name: "Hamburger", dueDate: "05.05.24", status: "  In-progress" },
    { id: 4, name: "Cloth", dueDate: "15.05.24", status: "Completed" },
    { id: 5, name: "Hotel", dueDate: "20.05.24", status: "Ongoing" }
  ];

  return (
    <div className={`min-h-screen ${isLightMode ? 'bg-white text-[#121212]' : 'bg-slate-900 text-white'}`}>
      
      <header className={`${isLightMode ? 'bg-white' : 'bg-slate-900 text-white'} border-b-2 border-gray-400 sticky top-0 z-50 py-3 md:py-5 shadow-md`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-12 sm:h-16 md:h-20">
            <div className="flex items-center">
              <button 
                className={`md:hidden mr-4 ${isLightMode ? 'text-gray-600' : 'text-white'}`}
                onClick={toggleMobileMenu}
              >
                <Menu className="h-6 w-6" />
              </button>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent truncate max-w-[200px] sm:max-w-none">
                GalaxyServices Dashboard
              </h1>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              <button
                onClick={toggleLightMode}
                className="rounded-full p-2 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-400 transition-colors duration-300"
                aria-label={isLightMode ? "Switch to dark mode" : "Switch to light mode"}
              >
                {isLightMode ? 
                  <Moon className="h-5 w-5 text-gray-700" /> : 
                  <Sun className="h-5 w-5 text-yellow-400" />
                }
              </button>
              
              {/* user profile dropdown */}
              <div className="relative">
                <button 
                  onClick={toggleProfile}
                  className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium"
                  aria-expanded={isProfileOpen}
                >
                  {getUserInitial()}
                </button>
                
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 z-50 border border-gray-200">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      {user?.id && <p className="text-xs text-gray-400 mt-1">ID: {user.id}</p>}
                    </div>
                    
                    <div className="py-1">
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col md:flex-row">
        
        {isMobileMenuOpen && (
          <aside className={`md:hidden flex flex-col w-full ${isLightMode ? 'bg-white' : 'bg-slate-900 text-white'} border-b-2 border-gray-300 z-40`}>
            <nav className="py-2">
              <a href="#" className="group flex items-center px-4 py-3 text-sm font-medium rounded-md bg-blue-50 text-blue-700">
                <BarChart className="mr-3 h-5 w-5" />
                Dashboard
              </a>
              <a href="/" className={`group flex items-center px-4 py-3 text-sm font-medium ${isLightMode ? 'text-gray-600' : 'text-gray-300'} rounded-md hover:bg-gray-700 hover:text-white`}>
              <Home className="mr-3 h-5 w-5" />
              
               Home
               
            </a>
              <a href="#" className={`group flex items-center px-4 py-3 text-sm font-medium ${isLightMode ? 'text-gray-600' : 'text-gray-300'} rounded-md hover:bg-gray-50 hover:text-gray-900`}>
                <Package className="mr-3 h-5 w-5" />
                Orders
              </a>
              <a href="#" className={`group flex items-center px-4 py-3 text-sm font-medium ${isLightMode ? 'text-gray-600' : 'text-gray-300'} rounded-md hover:bg-gray-50 hover:text-gray-900`}>
                <Ticket className="mr-3 h-5 w-5" />
                Tickets
              </a>
              <a href="#" className={`group flex items-center px-4 py-3 text-sm font-medium ${isLightMode ? 'text-gray-600' : 'text-gray-300'} rounded-md hover:bg-gray-50 hover:text-gray-900`}>
                <FileText className="mr-3 h-5 w-5" />
                Reports
              </a>
              <a href="#" className={`group flex items-center px-4 py-3 text-sm font-medium ${isLightMode ? 'text-gray-600' : 'text-gray-300'} rounded-md hover:bg-gray-50 hover:text-gray-900`}>
                <User className="mr-3 h-5 w-5" />
                Customers
              </a>
              <a href="#" className={`group flex items-center px-4 py-3 text-sm font-medium ${isLightMode ? 'text-gray-600' : 'text-gray-300'} rounded-md hover:bg-gray-50 hover:text-gray-900`}>
                <Settings className="mr-3 h-5 w-5" />
                Settings
              </a>
              <a href="#" className={`group flex items-center px-4 py-3 text-sm font-medium ${isLightMode ? 'text-gray-600' : 'text-gray-300'} rounded-md hover:bg-gray-50 hover:text-gray-900`}>
                <HelpCircle className="mr-3 h-5 w-5" />
                Support
              </a>
              <button 
                onClick={handleLogout}
                className={`group flex items-center px-4 py-3 text-sm font-medium w-full text-left ${isLightMode ? 'text-red-600' : 'text-red-400'} rounded-md hover:bg-gray-50 hover:text-red-700`}
              >
                <LogOut className="mr-3 h-5 w-5" />
                Sign Out
              </button>
            </nav>
          </aside>
        )}

        <aside className={`hidden md:flex flex-col w-64 ${isLightMode ? 'bg-white' : 'bg-slate-900 text-white'} border-r-2 border-gray-300 h-screen sticky top-20`}>
          <nav className="mt-5 px-2">
            <a href="#" className="group flex items-center px-4 py-3 text-sm font-medium rounded-md bg-blue-50 text-blue-700">
              <BarChart className="mr-3 h-5 w-5" />
              Dashboard
            </a>
            <a href="/" className={`group flex items-center px-4 py-3 text-sm font-medium ${isLightMode ? 'text-gray-600' : 'text-gray-300'} rounded-md hover:bg-gray-700 hover:text-white`}>
              <Home className="mr-3 h-5 w-5" />
              
               Home
               
            </a>
            <a href="#" className={`group flex items-center px-4 py-3 text-sm font-medium ${isLightMode ? 'text-gray-600' : 'text-gray-300'} rounded-md hover:bg-gray-700 hover:text-white`}>
              <Package className="mr-3 h-5 w-5" />
              Orders
            </a>
            <a href="#" className={`group flex items-center px-4 py-3 text-sm font-medium ${isLightMode ? 'text-gray-600' : 'text-gray-300'} rounded-md hover:bg-gray-700 hover:text-white`}>
              <Ticket className="mr-3 h-5 w-5" />
              Tickets
            </a>
            <a href="#" className={`group flex items-center px-4 py-3 text-sm font-medium ${isLightMode ? 'text-gray-600' : 'text-gray-300'} rounded-md hover:bg-gray-700 hover:text-white`}>
              <FileText className="mr-3 h-5 w-5" />
              Reports
            </a>
            <a href="#" className={`group flex items-center px-4 py-3 text-sm font-medium ${isLightMode ? 'text-gray-600' : 'text-gray-300'} rounded-md hover:bg-gray-700 hover:text-white`}>
              <User className="mr-3 h-5 w-5" />
              Customers
            </a>
            <a href="#" className={`group flex items-center px-4 py-3 text-sm font-medium ${isLightMode ? 'text-gray-600' : 'text-gray-300'} rounded-md hover:bg-gray-700 hover:text-white`}>
              <Settings className="mr-3 h-5 w-5" />
              Settings
            </a>
            <a href="#" className={`group flex items-center px-4 py-3 text-sm font-medium ${isLightMode ? 'text-gray-600' : 'text-gray-300'} rounded-md hover:bg-gray-700 hover:text-white`}>
              <HelpCircle className="mr-3 h-5 w-5" />
              Support
            </a>
            
            {/* User info display */}
            <div className=" border-t border-gray-300 pt-4 pb-2 px-4 mt-8">
              {user && (
                <div className={`flex flex-col ${isLightMode ? 'text-gray-700' : 'text-gray-300'}`}>
                  <div className="flex items-center mb-2">
                    <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white mr-2">
                      {getUserInitial()}
                    </div>
                    <div className="text-sm font-medium overflow-hidden">
                      <p className="truncate max-w-[170px]">{user.name}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 truncate max-w-[200px] mb-2">{user.email}</p>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center text-sm text-red-500 hover:text-red-600 mt-2"
                  >
                    <LogOut className="h-4 w-4 mr-1" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
            
          
          </nav>
        </aside>

        
        <main className="flex-1 p-4 sm:p-6">
          <div className="container mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-8">
              <h2 className={`text-xl sm:text-2xl font-semibold ${isLightMode ? 'text-gray-800' : 'text-white'} mb-3 sm:mb-0`}>Overview</h2>
              <div>
                <select 
                  className="bg-gray-200 rounded-lg border border-gray-300 text-black py-2 px-3 sm:py-3 sm:px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500 text-sm"
                  defaultValue="Last 30 days"
                >
                  <option>Last 7 days</option>
                  <option>Last 30 days</option>
                  <option>Last 90 days</option>
                </select>
              </div>
            </div>


            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
             
              <div className={`${isLightMode ? 'bg-white' : 'bg-slate-900'} p-4 sm:p-6 rounded-lg shadow-sm border border-gray-300`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`${isLightMode ? 'text-gray-500' : 'text-gray-300'} text-sm font-medium`}>Open Tickets</h3>
                  <span className="p-2 bg-green-50 text-green-600 rounded">
                    <span className="text-xs font-medium">↓ 8%</span>
                  </span>
                </div>
                <div className="flex items-baseline">
                  <p className={`text-2xl sm:text-3xl font-bold ${isLightMode ? 'text-gray-900' : 'text-white'}`}>42</p>
                  <p className={`ml-2 text-xs sm:text-sm ${isLightMode ? 'text-gray-500' : 'text-gray-300'}`}>/104 total</p>
                </div>
                <div className="mt-4 flex items-center text-xs sm:text-sm">
                  <Ticket className={`h-4 w-4 ${isLightMode ? 'text-gray-400' : 'text-gray-300'} mr-1`} />
                  <span className={`${isLightMode ? 'text-gray-500' : 'text-gray-300'}`}>15 high priority</span>
                </div>
              </div>

              
              <div className={`${isLightMode ? 'bg-white' : 'bg-slate-900'} p-4 sm:p-6 rounded-lg shadow-sm border border-gray-300`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`${isLightMode ? 'text-gray-500' : 'text-gray-300'} text-sm font-medium`}>Total Orders</h3>
                  <span className="p-2 bg-green-50 text-green-600 rounded">
                    <span className="text-xs font-medium">↑ 12%</span>
                  </span>
                </div>
                <div className="flex items-baseline">
                  <p className={`text-2xl sm:text-3xl font-bold ${isLightMode ? 'text-gray-900' : 'text-white'}`}>95</p>
                  <p className={`ml-2 text-xs sm:text-sm ${isLightMode ? 'text-gray-500' : 'text-gray-300'}`}>/100 target</p>
                </div>
                <div className="mt-4 flex items-center text-xs sm:text-sm">
                  <Package className={`h-4 w-4 ${isLightMode ? 'text-gray-400' : 'text-gray-300'} mr-1`} />
                  <span className={`${isLightMode ? 'text-gray-500' : 'text-gray-300'}`}>$53,900 revenue</span>
                </div>
              </div>

             
              <div className={`${isLightMode ? 'bg-white' : 'bg-slate-900'} p-4 sm:p-6 rounded-lg shadow-sm border border-gray-300`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`${isLightMode ? 'text-gray-500' : 'text-gray-300'} text-sm font-medium`}>Discount Tier</h3>
                  <span className="p-2 bg-blue-50 text-blue-600 rounded">
                    <span className="text-xs font-medium">Premium</span>
                  </span>
                </div>
                <div className="flex items-baseline">
                  <p className={`text-2xl sm:text-3xl font-bold ${isLightMode ? 'text-gray-900' : 'text-white'}`}>15%</p>
                  <p className={`ml-2 text-xs sm:text-sm ${isLightMode ? 'text-gray-500' : 'text-gray-300'}`}>standard discount</p>
                </div>
                <div className="mt-4 flex items-center text-xs sm:text-sm">
                  <Percent className={`h-4 w-4 ${isLightMode ? 'text-gray-400' : 'text-gray-300'} mr-1`} />
                  <span className={`${isLightMode ? 'text-gray-500' : 'text-gray-300'}`}>Up to 25% on bulk orders</span>
                </div>
              </div>
            </div>

            
            <div className={`${isLightMode ? 'bg-white' : 'bg-slate-900'} rounded-lg shadow-sm border border-gray-300`}>
              <div className={`border-b ${isLightMode ? 'border-gray-200' : 'border-gray-700'} p-4 sm:p-6`}>
                <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                  <h3 className={`text-lg font-medium ${isLightMode ? 'text-gray-900' : 'text-white'} mb-3 sm:mb-0`}>Service Progress</h3>
                  <div className="w-full sm:w-auto">
                    <select 
                      className="w-full sm:w-auto bg-gray-200 rounded-lg border border-gray-300 text-black py-2 px-3 text-sm leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                    >
                      <option value="All">All Status</option>
                      <option value="Completed">Completed</option>
                      <option value="Ongoing">Ongoing</option>
                      <option value="Delayed">Delayed</option>
                      <option value="At risk">At Risk</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className={`min-w-full divide-y ${isLightMode ? 'divide-gray-200' : 'divide-gray-700'}`}>
                  <thead className={isLightMode ? 'bg-gray-50' : 'bg-gray-800'}>
                    <tr>
                      <th scope="col" className={`px-4 sm:px-6 py-3 text-left text-xs font-medium ${isLightMode ? 'text-gray-500' : 'text-gray-300'} uppercase tracking-wider`}>
                        Service Name
                      </th>
                      <th scope="col" className={`px-4 sm:px-6 py-3 text-left text-xs font-medium ${isLightMode ? 'text-gray-500' : 'text-gray-300'} uppercase tracking-wider`}>
                        Due Date
                      </th>
                      <th scope="col" className={`px-4 sm:px-6 py-3 text-left text-xs font-medium ${isLightMode ? 'text-gray-500' : 'text-gray-300'} uppercase tracking-wider`}>
                        Status
                      </th>
                      <th scope="col" className={`px-4 sm:px-6 py-3 text-left text-xs font-medium ${isLightMode ? 'text-gray-500' : 'text-gray-300'} uppercase tracking-wider`}>
                        Progress
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`${isLightMode ? 'bg-white' : 'bg-slate-900'} divide-y ${isLightMode ? 'divide-gray-200' : 'divide-gray-700'}`}>
                    {projects
                      .filter(project => selectedStatus === 'All' || project.status === selectedStatus)
                      .map((project) => (
                        <tr key={project.id}>
                          <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                            <div className={`text-xs sm:text-sm font-medium ${isLightMode ? 'text-gray-900' : 'text-white'}`}>{project.name}</div>
                          </td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                            <div className={`text-xs sm:text-sm ${isLightMode ? 'text-gray-500' : 'text-gray-300'}`}>{project.dueDate}</div>
                          </td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              project.status === 'Completed' ? 'bg-green-100 text-green-800' :
                              project.status === 'Ongoing' ? 'bg-yellow-100 text-yellow-800' :
                              project.status === 'Delayed' ? 'bg-gray-100 text-gray-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {project.status}
                            </span>
                          </td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  project.status === 'Completed' ? 'bg-green-600' :
                                  project.status === 'Ongoing' ? 'bg-yellow-400' :
                                  project.status === 'Delayed' ? 'bg-gray-500' :
                                  'bg-red-500'
                                }`}
                                style={{ width: project.status === 'Completed' ? '100%' : 
                                          project.status === 'Ongoing' ? '60%' :
                                          project.status === 'Delayed' ? '30%' : '15%' }}
                              >
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}