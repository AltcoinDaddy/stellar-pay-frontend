// "use client";

// import Link from "next/link";
// import { Button } from "@/components/ui/button";
// import { useRouter } from "next/navigation";
// import { useState } from "react";
// import Sidebar from "@/components/shared/Sidebar";
import Link from "next/link";
import RootLayout from "../layout";
import { Code, FeatherIcon, HomeIcon, Wallet } from "lucide-react";
import ImageCarousel from "@/components/shared/ImageCarousel";
import { benefits, imagesArr } from "@/constants";
import FeatureCard from "@/components/shared/FeatureCard";

export default function Page() {
  // const router = useRouter();
  // const [isLoading, setIsLoading] = useState(false);

  // // Function to handle the Get Started button click
  // const handleGetStarted = () => {
  //   setIsLoading(true);
  //   // Navigate to the dashboard page (or wherever you want to direct new users)
  //   setTimeout(() => {
  //     router.push("/dashboard");
  //   }, 500); // Small delay to show loading state
  // };


  const features = [
    {
      Icon: HomeIcon,
      title: "Dashboard",
      description: "View your account summary and recent transactions",
      className: ""
    },
    {
      Icon: Code,
      title: "QR Generator",
      description: "Create payment QR codes for your customers",
      className: ""
    },
    {
      Icon: Wallet,
      title: "Payments",
      description: "Track and manage your payment history",
      className: ""
    }, {
      Icon: FeatherIcon ,
      title: "Account",
      description: "With Your Stellar Account, Your Privacy is Guaranteed!!",
      className: ""
    }
  ]

  return (
      <div className="flex w-full flex-col gap-6 ">
        <h1 className="text-5xl font-bold leading-tight tracking-tight">Stellar Merchant Tool</h1>
        <p className="text-lg mb-8">Welcome to your Stellar payment processing dashboard</p>
        {/* IMAGES */}
        {/* <ImageCarousel images={imagesArr} benefits={benefits} interval={5000}/> */}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
          {features.map((feature, index)=> (
            <FeatureCard  {...feature} key={index}/>
          ))}
        </div>


      </div>
  );
}
