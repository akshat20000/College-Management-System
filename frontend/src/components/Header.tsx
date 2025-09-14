
import { Link } from 'react-router-dom'
import type { JSX } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState, AppDispatch } from '../store/store'
import { logout } from '../features/user/userslice'
import { authService } from '../services/authServices'

export function Header(): JSX.Element {
  const {user: currentuser} = useSelector((state: RootState) => state.user)
const dispatch = useDispatch<AppDispatch>()
  
  const handleLogout = async () => {
  await authService.logout();  
  dispatch(logout());           
};
//  console.log(currentuser)
  return (
    <header className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-xl font-bold text-purple-600">Attendance Portal</Link>
        <div className="flex items-center gap-4">
          <span className="text-gray-700">Hello, {currentuser?.name ?? 'Guest' }!</span><br></br>
          <span className="text-gray-700"> {currentuser?.cmsid ?? '-'}</span>
          <button onClick={handleLogout} className="rounded-md bg-red-500 px-4 py-2 text-white hover:bg-red-600">
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}