import { Navigate, Route, Routes } from 'react-router-dom';
import { AboutPage } from './pages/AboutPage';
import { AcademyPage } from './pages/AcademyPage';
import { AdminPage } from './pages/AdminPage';
import { AuthPage } from './pages/AuthPage';
import { ClinicPage } from './pages/ClinicPage';
import { DoctorPage } from './pages/DoctorPage';
import { DoctorsPage } from './pages/DoctorsPage';
import { FaqPage } from './pages/FaqPage';
import { HomePage } from './pages/HomePage';
import { ShowcasePage } from './pages/ShowcasePage';
import { VideosPage } from './pages/VideosPage';

export default function App() {
  return (
    <Routes>
      <Route element={<HomePage />} path="/" />
      <Route element={<ClinicPage />} path="/clinic" />
      <Route element={<DoctorsPage />} path="/doctors" />
      <Route element={<DoctorPage />} path="/doctor" />
      <Route element={<AcademyPage />} path="/academy" />
      <Route element={<VideosPage />} path="/videos" />
      <Route element={<AboutPage />} path="/about" />
      <Route element={<FaqPage />} path="/faq" />
      <Route element={<AuthPage />} path="/auth" />
      <Route element={<AdminPage />} path="/admin" />
      <Route
        element={
          <ShowcasePage
            actionHref="#laboratory-catalog"
            actionLabel="Our Services"
            catalogId="laboratory-catalog"
            description="A high-tech digital laboratory equipped with the latest machinery for precise and fast production of custom dental solutions."
            heroImage="/assets/images/lab-hero.svg"
            pageTitle="Integrat — Laboratory"
            title="LABORATORY"
          />
        }
        path="/laboratory"
      />
      <Route
        element={
          <ShowcasePage
            actionHref="#store-catalog"
            actionLabel="Browse Catalog"
            catalogId="store-catalog"
            description="Professional dental equipment, instruments, and exclusive educational materials directly from Integrat Clinic."
            heroImage="/assets/images/store-hero.svg"
            pageTitle="Integrat — Store"
            title="STORE"
          />
        }
        path="/store"
      />
      <Route element={<Navigate replace to="/" />} path="*" />
    </Routes>
  );
}
