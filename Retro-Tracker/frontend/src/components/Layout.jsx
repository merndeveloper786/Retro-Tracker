// import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext.jsx';
// import { useTeam } from '../context/TeamContext.jsx';

// const Layout = ({ children }) => {
//   const { user, logout } = useAuth();
//   const { selectedTeam, teams, selectTeam, createTeam } = useTeam();
//   const navigate = useNavigate();
//   const [showTeamDropdown, setShowTeamDropdown] = useState(false);
//   const [showCreateTeam, setShowCreateTeam] = useState(false);
//   const [newTeamName, setNewTeamName] = useState('');

//   const handleLogout = () => {
//     logout();
//     navigate('/login');
//   };

//   const handleCreateTeam = async (e) => {
//     e.preventDefault();
//     if (!newTeamName.trim()) {
//       return;
//     }

//     const result = await createTeam(newTeamName.trim());
//     if (result.success) {
//       setNewTeamName('');
//       setShowCreateTeam(false);
//     } else {
//       alert(result.message || 'Failed to create team. Please try again.');
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <nav className="bg-white shadow-sm">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between h-16">
//             <div className="flex items-center">
//               <h1 className="text-xl font-bold text-gray-900 cursor-pointer" onClick={() => navigate('/dashboard')}>
//                 Retro Tracker
//               </h1>
//               <div className="ml-8 flex items-center space-x-4">
//                 <button
//                   onClick={() => navigate('/dashboard')}
//                   className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
//                 >
//                   Dashboard
//                 </button>
//                 <button
//                   onClick={() => navigate('/action-items')}
//                   className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
//                 >
//                   Action Items
//                 </button>
//                 <button
//                   onClick={() => navigate('/team-management')}
//                   className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
//                 >
//                   Team Settings
//                 </button>
//               </div>
//             </div>

//             <div className="flex items-center space-x-4">
//               <div className="relative">
//                 <button
//                   onClick={() => setShowTeamDropdown((prev) => !prev)}
//                   className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
//                 >
//                   <span>{selectedTeam?.name || 'Select Team'}</span>
//                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//                   </svg>
//                 </button>
//                 {showTeamDropdown && (
//                   <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
//                     <div className="py-1">
//                       {teams.length === 0 && (
//                         <div className="px-4 py-3 text-sm text-gray-500">No teams yet.</div>
//                       )}
//                       {teams.map((team) => (
//                         <button
//                           key={team._id}
//                           onClick={() => {
//                             selectTeam(team);
//                             setShowTeamDropdown(false);
//                           }}
//                           className={`block w-full text-left px-4 py-2 text-sm ${
//                             selectedTeam?._id === team._id
//                               ? 'bg-blue-50 text-blue-700'
//                               : 'text-gray-700 hover:bg-gray-100'
//                           }`}
//                         >
//                           {team.name}
//                         </button>
//                       ))}
//                       <button
//                         onClick={() => {
//                           setShowCreateTeam(true);
//                           setShowTeamDropdown(false);
//                         }}
//                         className="block w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-gray-100"
//                       >
//                         + Create New Team
//                       </button>
//                     </div>
//                   </div>
//                 )}
//               </div>

//               <div className="flex items-center space-x-3">
//                 <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-medium">
//                   {user?.avatarInitials || 'U'}
//                 </div>
//                 <button
//                   onClick={handleLogout}
//                   className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
//                 >
//                   Logout
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </nav>

//       {showCreateTeam && (
//         <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center px-4">
//           <div className="w-full max-w-md rounded-md bg-white p-6 shadow-xl">
//             <h3 className="text-lg font-bold text-gray-900 mb-4">Create New Team</h3>
//             <form onSubmit={handleCreateTeam} className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Team name</label>
//                 <input
//                   type="text"
//                   value={newTeamName}
//                   onChange={(e) => setNewTeamName(e.target.value)}
//                   placeholder="Team name"
//                   required
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
//                 />
//               </div>
//               <div className="flex justify-end space-x-2">
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setShowCreateTeam(false);
//                     setNewTeamName('');
//                   }}
//                   className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
//                 >
//                   Create
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
//         {children}
//       </main>
//     </div>
//   );
// };

// export default Layout;



import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useTeam } from '../context/TeamContext.jsx';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const { selectedTeam, teams, selectTeam, createTeam } = useTeam();
  const navigate = useNavigate();

  const [showTeamDropdown, setShowTeamDropdown] = useState(false);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');

  // refs for click-outside detection
  const teamDropdownRef = useRef(null);
  const teamButtonRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;

    const result = await createTeam(newTeamName.trim());
    if (result.success) {
      setNewTeamName('');
      setShowCreateTeam(false);
    } else {
      alert(result.message || 'Failed to create team. Please try again.');
    }
  };

  // Close dropdown when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event) => {
      // If dropdown isn't open, nothing to do
      if (!showTeamDropdown) return;

      // If click is on the button, keep it (button toggles dropdown)
      if (teamButtonRef.current && teamButtonRef.current.contains(event.target)) {
        return;
      }

      // If click is inside dropdown, keep it
      if (teamDropdownRef.current && teamDropdownRef.current.contains(event.target)) {
        return;
      }

      // Otherwise it's an outside click -> close dropdown
      setShowTeamDropdown(false);
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setShowTeamDropdown(false);
        setShowCreateTeam(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showTeamDropdown]);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1
                className="text-xl font-bold text-gray-900 cursor-pointer"
                onClick={() => navigate('/dashboard')}
              >
                Retro Tracker
              </h1>
              <div className="ml-8 flex items-center space-x-4">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => navigate('/action-items')}
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Action Items
                </button>
                <button
                  onClick={() => navigate('/team-management')}
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Team Settings
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <button
                  ref={teamButtonRef}
                  onClick={() => setShowTeamDropdown((prev) => !prev)}
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  <span>{selectedTeam?.name || 'Select Team'}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showTeamDropdown && (
                  // attach the ref to the dropdown so clicks inside it won't close it
                  <div
                    ref={teamDropdownRef}
                    className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50"
                  >
                    <div className="py-1">
                      {teams.length === 0 && (
                        <div className="px-4 py-3 text-sm text-gray-500">No teams yet.</div>
                      )}

                      {teams.map((team) => (
                        <button
                          key={team._id}
                          onClick={() => {
                            selectTeam(team);
                            setShowTeamDropdown(false);
                          }}
                          className={`block w-full text-left px-4 py-2 text-sm ${
                            selectedTeam?._id === team._id
                              ? 'bg-blue-50 text-blue-700'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {team.name}
                        </button>
                      ))}

                      <button
                        onClick={() => {
                          setShowCreateTeam(true);
                          setShowTeamDropdown(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-gray-100"
                      >
                        + Create New Team
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-medium">
                  {user?.avatarInitials || 'U'}
                </div>
                <button
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {showCreateTeam && (
        // clicking the backdrop (overlay) will close the modal:
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center px-4"
          onClick={(e) => {
            // only close when clicking on the backdrop itself, not the modal content
            if (e.target === e.currentTarget) {
              setShowCreateTeam(false);
              setNewTeamName('');
            }
          }}
        >
          <div className="w-full max-w-md rounded-md bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Create New Team</h3>
            <form onSubmit={handleCreateTeam} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Team name</label>
                <input
                  type="text"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder="Team name"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateTeam(false);
                    setNewTeamName('');
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
};

export default Layout;
