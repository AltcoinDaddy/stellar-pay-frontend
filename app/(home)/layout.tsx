import Sidebar from "@/components/shared/Sidebar";
import React from "react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <section className="min-h-screen container flex w-[1440px]">
      <Sidebar />
      <div className="flex w-full justify-start mx-auto mt-10 ml-5 mb-5  items-center">
        {children}
      </div>
    </section>
  );
};

export default Layout;
