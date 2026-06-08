import { MessagesSquare, Activity, User, Gamepad2, Send } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/I18nProvider";

export const BottomNav = () => {
  const { t } = useI18n();
  // Order: النشاط | الرسائل | غرف | العب | الملف
  const tabs = [
    { to: "/activity", label: t("nav.activity"), icon: Activity },
    { to: "/messages", label: "الرسائل", icon: Send },
    { to: "/", label: t("nav.lounge"), icon: MessagesSquare },
    { to: "/play", label: t("nav.play"), icon: Gamepad2 },
    { to: "/profile", label: t("nav.profile"), icon: User },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/85 backdrop-blur-lg">
      <div className="mx-auto flex max-w-2xl items-center justify-around px-4 py-2">
        {tabs.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end
            className={({ isActive }) =>
              cn(
                "flex flex-1 flex-col items-center gap-1 rounded-xl py-2 text-xs font-medium transition-smooth",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={cn("h-5 w-5 transition-spring", isActive && "scale-110")} strokeWidth={isActive ? 2.5 : 2} />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
