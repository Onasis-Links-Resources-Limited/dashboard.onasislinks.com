import { cn } from "../../../libs/utils";
import { ROLE_CONFIG } from "../constant";

const RoleBadge = ({ role }) => {
  const config = ROLE_CONFIG[role] || ROLE_CONFIG.viewer;
  return (
    <span className={cn(
      "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap",
      config.bg, config.text
    )}>
      {config.label}
    </span>
  );
};

export default RoleBadge;