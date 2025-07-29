import { NavLink } from "react-router-dom"
import { HomeIcon, CalendarIcon, UserIcon } from "lucide-react"
import clsx from "clsx"

const navigation = [
  { name: "Dashboard", href: "/", icon: HomeIcon },
  { name: "Interviews", href: "/interviews", icon: CalendarIcon },
  { name: "Profile", href: "/profile", icon: UserIcon },
]

const Sidebar = () => {
  return (
    <div className="w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen">
      <nav className="mt-8 px-4">
        <ul className="space-y-2">
          {navigation.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.href}
                className={({ isActive }) =>
                  clsx(
                    "group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                    isActive
                      ? "bg-primary-100 text-primary-700"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                  )
                }
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}

export default Sidebar
