import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import RootLayout from './layouts/RootLayout';
import DashboardLayout from './layouts/DashboardLayout';

import Home from './pages/Home';
import ActivityDetails from './pages/ActivityDetails';
import Login from './pages/Login';

import DashboardOverview from './pages/dashboard/Overview';
import DashboardActivities from './pages/dashboard/Activities';
import DashboardProposals from './pages/dashboard/Proposals';
import DashboardMeetings from './pages/dashboard/Meetings';
import DashboardProjects from './pages/dashboard/Projects';
import DashboardUsers from './pages/dashboard/UsersPage';
import DashboardReports from './pages/dashboard/Reports';
import DashboardBackups from './pages/dashboard/Backups';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootLayout />}>
          <Route index element={<Home />} />
          <Route path="activities/:id" element={<ActivityDetails />} />
          <Route path="login" element={<Login />} />
        </Route>

        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardOverview />} />
          <Route path="activities" element={<DashboardActivities />} />
          <Route path="proposals" element={<DashboardProposals />} />
          <Route path="meetings" element={<DashboardMeetings />} />
          <Route path="projects" element={<DashboardProjects />} />
          <Route path="users" element={<DashboardUsers />} />
          <Route path="reports" element={<DashboardReports />} />
          <Route path="backups" element={<DashboardBackups />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
