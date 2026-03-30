import { BrowserRouter, Route, Routes } from "react-router-dom";

import { Layout } from "./components/Layout";
import { DashboardPage } from "./pages/DashboardPage";
import { PrinterDetailPage } from "./pages/PrinterDetailPage";

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/printers/:id" element={<PrinterDetailPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
