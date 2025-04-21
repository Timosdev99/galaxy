
import { useState } from 'react';
import StatusBadge from './StatusBadge';

export default function ProjectTable({ isLightMode }: any) {
  const [selectedStatus, setSelectedStatus] = useState('All');

  const projects = [
    { id: 1, name: "mercerdes", dueDate: "28.04.24", status: "Completed" },
    { id: 2, name: "car rental", dueDate: "30.04.24", status: "Delayed" },
    { id: 3, name: "Hamburger", dueDate: "05.05.24", status: "In-progress" },
    { id: 4, name: "Cloth", dueDate: "15.05.24", status: "Completed" },
    { id: 5, name: "Hotel", dueDate: "20.05.24", status: "Ongoing" }
  ];

  const getProgressWidth = (status: any) => {
    switch(status) {
      case 'Completed': return '100%';
      case 'Ongoing': return '60%';
      case 'In-progress': return '45%';
      case 'Delayed': return '30%';
      default: return '15%';
    }
  };

  const getProgressColor = (status: any) => {
    switch(status) {
      case 'Completed': return 'bg-green-600';
      case 'Ongoing': return 'bg-yellow-400';
      case 'In-progress': return 'bg-blue-500';
      case 'Delayed': return 'bg-gray-500';
      default: return 'bg-red-500';
    }
  };

  return (
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
              <option value="In-progress">In Progress</option>
              <option value="Delayed">Delayed</option>
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
                    <StatusBadge status={project.status} />
                  </td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getProgressColor(project.status)}`}
                        style={{ width: getProgressWidth(project.status) }}
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
  );
}