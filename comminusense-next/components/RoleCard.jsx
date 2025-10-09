import { User, Settings, Wrench, BarChart3, Shield, UserCog } from 'lucide-react';

// Icon components using Lucide React icons
const UserIcon = () => <User className="w-12 h-12" />;
const UsersIcon = () => <UserCog className="w-12 h-12" />;
const ChartIcon = () => <BarChart3 className="w-12 h-12" />;
const WrenchIcon = () => <Wrench className="w-12 h-12" />;
const SettingsIcon = () => <Settings className="w-12 h-12" />;
const ShieldIcon = () => <Shield className="w-12 h-12" />;

const iconMap = {
  user: UserIcon,
  users: UsersIcon,
  chart: ChartIcon,
  wrench: WrenchIcon,
  settings: SettingsIcon,
  shield: ShieldIcon,
};

export default function RoleCard({ id, label, description, icon, isSelected, onClick }) {
  const IconComponent = iconMap[icon] || UserIcon;

  return (
    <button
      onClick={onClick}
      className={`
        relative w-full p-8 rounded-xl text-center
        transition-all duration-200
        border-2
        ${
          isSelected
            ? "bg-[#1a1a1a] border-[#1a1a1a] text-white"
            : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-md text-gray-900"
        }
      `}
      role="radio"
      aria-checked={isSelected}
      aria-label={`Select ${label} role`}
    >
      {/* Icon */}
      <div className={`flex justify-center mb-4 ${isSelected ? "text-white" : "text-gray-700"}`}>
        <IconComponent />
      </div>

      {/* Role Content */}
      <div>
        <h3 className="text-xl font-semibold mb-2">
          {label}
        </h3>
        <p className={`text-sm leading-relaxed ${isSelected ? "text-gray-300" : "text-gray-600"}`}>
          {description}
        </p>
      </div>
    </button>
  );
}