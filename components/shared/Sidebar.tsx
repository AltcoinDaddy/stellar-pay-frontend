"use client";

import { sidebarLinks } from "@/constants";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Sidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="border-light-500 border-r flex flex-col lg:w-[250px] py-[30px] items-start  h-screen left-0 top-0 sticky justify-between max-sm:hidden gap-10 px-[20px]">
      {/* MERCHANT TOOL LOGO */}
      <div className="flex gap-2 justify-center text-2xl leading-normal tracking-tight items-center ">StellarPay</div>
      {/* DASHBOARD LINKS */}

      <div className="flex flex-1 flex-col gap-6">
        {sidebarLinks.map((link, index) => {
             const isActive = link.route === pathname
          return (
            <Link
              className={`flex items-center gap-2 hover:bg-purple-600 hover:text-white p-3 rounded-[10px] ${isActive ? "bg-purple-600 text-white": ""}`}
              key={index}
              href={link.route}
            >
              <link.icon className="size-6" />
              <h2
                className={`text-base leading-normal`}
              >
                {link.title}
              </h2>
            </Link>
          );
        })}
      </div>
    </aside>
  );
};

export default Sidebar;
