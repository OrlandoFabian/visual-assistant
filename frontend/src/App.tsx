import { Route, Routes } from "react-router-dom";

import Layout from "./components/Layout";
import DemoPage from "./pages/DemoPage";
import DocsPage from "./pages/DocsPage";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<DemoPage />} />
        <Route path="/docs" element={<DocsPage />} />
      </Routes>
    </Layout>
  );
}
