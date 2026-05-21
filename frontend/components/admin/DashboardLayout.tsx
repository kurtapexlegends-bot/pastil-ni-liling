"use client";

import React from "react";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

interface DashboardLayoutProps {
  activeTab: any;
  setActiveTab: (tab: any) => void;
  handleLogout: () => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  headerProps: {
    onAddProduct: () => void;
    onCreateHub: () => void;
  };
  children: React.ReactNode;
}

export default function DashboardLayout({
  activeTab,
  setActiveTab,
  handleLogout,
  isSidebarOpen,
  setIsSidebarOpen,
  headerProps,
  children
}: DashboardLayoutProps) {
  return (
    <div className="h-screen bg-gray-50/30 flex overflow-hidden relative">
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        handleLogout={handleLogout}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 space-y-6 overflow-y-auto h-screen relative">
        <AdminHeader
          activeTab={activeTab}
          onToggleSidebar={() => setIsSidebarOpen(true)}
          {...headerProps}
        />
        
        {children}
      </main>
    </div>
  );
}
