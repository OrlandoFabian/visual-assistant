import { Navigate, Route, Routes } from "react-router-dom";

import Layout from "./components/Layout";
import DocsLayout from "./components/docs/DocsLayout";
import EndpointPage from "./components/docs/pages/EndpointPage";
import ErrorEnvelope from "./components/docs/pages/ErrorEnvelope";
import Logging from "./components/docs/pages/Logging";
import Quickstart from "./components/docs/pages/Quickstart";
import RateLimiting from "./components/docs/pages/RateLimiting";
import RequestIds from "./components/docs/pages/RequestIds";
import Welcome from "./components/docs/pages/Welcome";
import DemoPage from "./pages/DemoPage";

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
