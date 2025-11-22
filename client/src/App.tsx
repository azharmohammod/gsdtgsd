import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import DevIndex from "@/pages/dev-index";
import RegisterPage from "@/pages/register";
import LoginPage from "@/pages/login";
import PaymentPage from "@/pages/payment";
import ThankYouPage from "@/pages/thank-you";
import MemberDashboard from "@/pages/member";
import LiveEventPage from "@/pages/live";
import AdminLogin from "@/pages/admin-login";
import AdminLayout from "@/pages/admin-layout";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={DevIndex} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/payment" component={PaymentPage} />
      <Route path="/thank-you" component={ThankYouPage} />
      <Route path="/member" component={MemberDashboard} />
      <Route path="/live/:id" component={LiveEventPage} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/:rest*">
        {(params) => <AdminLayout />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
