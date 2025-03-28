import Sidebar from "@/components/shared/Sidebar";
import React from "react";

const Layout = ({children}: {children: React.ReactNode}) => {
  return (
    <section className="min-h-screen w-full container mx-auto">
      <Sidebar />
        <div className="w-full max-w-5xl flex flex-1 justify-center">
        {children}
        </div>
    </section>
  );
};

export default Layout;

