import { Navigate, Route, Routes } from "react-router-dom";

import DocsLayout from "./components/DocsLayout";
import Layout from "./components/Layout";
import DemoPage from "./pages/DemoPage";
import EndpointPage from "./pages/EndpointPage";
import ErrorEnvelope from "./pages/ErrorEnvelope";
import Logging from "./pages/Logging";
import Quickstart from "./pages/Quickstart";
import RateLimiting from "./pages/RateLimiting";
import RequestIds from "./pages/RequestIds";
import Welcome from "./pages/Welcome";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<DemoPage />} />
        <Route path="/docs" element={<DocsLayout />}>
          <Route index element={<Navigate to="welcome" replace />} />
          <Route path="welcome" element={<Welcome />} />
          <Route path="quickstart" element={<Quickstart />} />
          <Route path="error-envelope" element={<ErrorEnvelope />} />
          <Route path="rate-limiting" element={<RateLimiting />} />
          <Route path="request-ids" element={<RequestIds />} />
          <Route path="logging" element={<Logging />} />
          <Route path="endpoints/:slug" element={<EndpointPage />} />
        </Route>
      </Routes>
    </Layout>
  );
}
