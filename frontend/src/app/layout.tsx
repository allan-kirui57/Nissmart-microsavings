import type { Metadata } from "next";
import "./globals.css";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
} from "@/components/ui/sidebar";

const navItems = [
  { label: "Dashboard", href: "/" },
  { label: "Users", href: "/users" },
  { label: "Settings", href: "/settings" },
];

export const metadata: Metadata = {
  title: "Nissmart Admin",
  description: "Admin dashboard for Nissmart micro-savings.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">


        <SidebarProvider>
          <div className="flex min-h-screen w-full bg-background text-foreground">
            <Sidebar className="border-r bg-card">
              <SidebarHeader>
                <div className="flex items-center gap-3 px-3 py-4 text-lg font-semibold">
                  <span className="rounded-lg bg-emerald-500 px-2 py-1 text-xs font-bold uppercase tracking-widest text-emerald-50 shadow-sm">
                    NM
                  </span>
                  <div className="flex flex-col leading-tight">
                    <span className="text-sm font-semibold text-slate-100">
                      Nissmart Admin
                    </span>
                    <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">
                      Micro-savings Ops
                    </span>
                  </div>
                </div>
              </SidebarHeader>
              <SidebarContent>
                <SidebarGroup>
                  <SidebarGroupLabel>General</SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {navItems.map((item) => (
                        <SidebarMenuItem key={item.label}>
                          <SidebarMenuButton asChild>
                            <a href={item.href}>{item.label}</a>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              </SidebarContent>
              <SidebarFooter className="border-t border-slate-800 px-3 py-3 text-[11px] text-slate-500">
                Empowering families. Transforming generations.
              </SidebarFooter>
              <SidebarRail />
            </Sidebar>




            {children}


          </div>
        </SidebarProvider>

      </body>
    </html>
  );
}
