import LaboratoryProfile from "@/components/settings/LaboratoryProfile";
import NotificationSettings from "@/components/settings/NotificationSettings";
import SecuritySettings from "@/components/settings/SecuritySettings";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { gsap } from "gsap";
import { Calendar, Settings as SettingsIcon, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const Settings = () => {
  const pageRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState("profile");
  const { toast } = useToast();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        pageRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <div ref={pageRef}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 ">
            Configurações
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Ajuste as configurações do sistema
          </p>
        </div>
        <div className="hidden sm:block bg-gray-100 rounded-lg dark:bg-gray-800 p-1">
          <ThemeToggle />
        </div>
      </div>

      <div className="">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-8 p-1 bg-gradient-to-l from-purple-100/80 to-indigo-100/80 dark:from-neutral-950/30 dark:to-black/20 shadow-sm">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="hidden xl:block h-4 w-4" /> Perfil
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="flex items-center gap-2"
            >
              <Calendar className="hidden xl:block h-4 w-4" /> Notificações
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <SettingsIcon className="hidden xl:block h-4 w-4" /> Segurança
            </TabsTrigger>
          </TabsList>

          <div className="p-2">
            <TabsContent value="profile" className="mt-0">
              <LaboratoryProfile />
            </TabsContent>

            <TabsContent value="notifications" className="mt-0">
              <NotificationSettings />
            </TabsContent>

            <TabsContent value="security" className="mt-0">
              <SecuritySettings />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;
