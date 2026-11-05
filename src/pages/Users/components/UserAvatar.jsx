import { useState } from "react";
import { User } from "lucide-react";
import { cn } from "../../../libs/utils";

const UserAvatar = ({ name, avatarUrl, size = "md", className }) => {
  const [imgError, setImgError] = useState(false);
  
  const initials = name
    ?.split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  const sizes = {
    sm: "w-7 h-7 text-xs",
    md: "w-8 h-8 text-sm",
    lg: "w-10 h-10 text-base",
    xl: "w-12 h-12 text-lg",
  };

  // If avatarUrl exists and no error yet, try to load image
  if (avatarUrl && !imgError) {
    return (
      <img
        src={avatarUrl}
        alt={name || "User"}
        className={cn("rounded-full object-cover shrink-0", sizes[size], className)}
        onError={() => setImgError(true)}
      />
    );
  }

  // Fallback: Show initials or User icon
  return (
    <div className={cn(
      "rounded-full flex items-center justify-center font-medium shrink-0",
      "bg-linear-to-br from-[#C3110C] to-[#E6501B] text-white",
      sizes[size],
      className
    )}>
      {initials || <User className="w-4 h-4" />}
    </div>
  );
};

export default UserAvatar;