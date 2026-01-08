import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import NotFound from "pages/NotFound";
import AgentDashboard from './pages/agent-dashboard';
import CreditProfile from './pages/credit-profile';
import LoanDetails from './pages/loan-details';
import BorrowerDashboard from './pages/borrower-dashboard';
import CreateLoan from './pages/create-loan';
import PaymentProcessing from './pages/payment-processing';
import { NavigationProvider } from './contexts/NavigationContext';

const Routes = () => {
  return (
    <BrowserRouter>
      <NavigationProvider>
        <ErrorBoundary>
        <ScrollToTop />
        <RouterRoutes>
          {/* Define your route here */}
          <Route path="/" element={<BorrowerDashboard />} />
          <Route path="/agent-dashboard" element={<AgentDashboard />} />
          <Route path="/credit-profile" element={<CreditProfile />} />
          <Route path="/loan-details" element={<LoanDetails />} />
          <Route path="/borrower-dashboard" element={<BorrowerDashboard />} />
          <Route path="/create-loan" element={<CreateLoan />} />
          <Route path="/payment-processing" element={<PaymentProcessing />} />
          <Route path="*" element={<NotFound />} />
        </RouterRoutes>
        </ErrorBoundary>
      </NavigationProvider>
    </BrowserRouter>
  );
};

export default Routes;
