import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin-sidebar";
import { Switch, Route } from "wouter";
import AdminDashboard from "./admin-dashboard";
import AdminUsers from "./admin-users";
import AdminAdmins from "./admin-admins";
import AdminEvents from "./admin-events";
import AdminGifts from "./admin-gifts";
import AdminWebsite from "./admin-website";
import AdminTerms from "./admin-terms";
import AdminReviews from "./admin-reviews";

export default function AdminLayout() {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AdminSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center gap-2 border-b p-4">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <h2 className="text-sm font-medium text-muted-foreground">แผงควบคุมแอดมิน</h2>
          </header>
          <main className="flex-1 overflow-y-auto p-6">
            <Switch>
              <Route path="/admin/dashboard" component={AdminDashboard} />
              <Route path="/admin/users" component={AdminUsers} />
              <Route path="/admin/admins" component={AdminAdmins} />
              <Route path="/admin/events" component={AdminEvents} />
              <Route path="/admin/gifts" component={AdminGifts} />
              <Route path="/admin/website" component={AdminWebsite} />
              <Route path="/admin/terms" component={AdminTerms} />
              <Route path="/admin/reviews" component={AdminReviews} />
              <Route path="/admin">
                {() => {
                  // Redirect to dashboard
                  window.location.href = "/admin/dashboard";
                  return null;
                }}
              </Route>
            </Switch>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
