import { QueryClientProvider } from "@tanstack/react-query";
import { Switch, Route } from "wouter";
import { Toaster } from "./components/ui/toaster";
import { IncidentsProvider } from "./context/incidents-context";
import { MapProvider } from "./context/map-context";
import { AuthProvider } from "./hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";
import { queryClient } from "./lib/queryClient";
import AuthPage from "./pages/auth-page";
import HomePage from "./pages/home-page";
import NotFound from "./pages/not-found";
import StatisticsPage from "./pages/statistics-page";
import { NavigationProvider } from "./context/navigation-context";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={HomePage} />
      <Route path="/statistics" component={StatisticsPage} /> 
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MapProvider>
          <NavigationProvider>
            <IncidentsProvider>
              <Router />
              <Toaster />
            </IncidentsProvider>
          </NavigationProvider>
        </MapProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
