import { HomeIcon, LayoutDashboardIcon, LucideIcon, PenToolIcon, QrCodeIcon, UserIcon, Wallet } from "lucide-react";


interface SidebarLinks {
    route: string
    title: string
    icon: LucideIcon
}

export const sidebarLinks: SidebarLinks[] = [
    {
        route: "/",
        title: "Home",
        icon: HomeIcon
    },
    {
         route: "/dashboard",
         title: "Dashboard",
         icon: LayoutDashboardIcon
    },
    {
        route: "/qr-generator",
        title: "QR Generator",
        icon: QrCodeIcon
    },
    {
        route: "/payments",
        title: "Payments",
        icon: Wallet
    },
    {
        route: "/account",
        title: "Account",
        icon: UserIcon
    },
    {
        route: "/analytics",
        title: "Analytics",
        icon: PenToolIcon
    }
]


export const imagesArr = [
    "https://img.freepik.com/premium-vector/smart-phone-with-coin-slot-coin-slot_9206-27197.jpg?w=740",
    "https://img.freepik.com/free-vector/paper-money-dollar-bills-blue-credit-card-3d-illustration-cartoon-drawing-payment-options-3d-style-white-background-payment-finances-shopping-banking-commerce-concept_778687-724.jpg?t=st=1743182744~exp=1743186344~hmac=d81efeccbc87ed3a1a1a6e24e5ed6b14c6bfe36556b5824fdb6a691f29be6dd3&w=740",
    "https://img.freepik.com/free-psd/3d-nft-icon-chain_629802-28.jpg?t=st=1743182596~exp=1743186196~hmac=a5c188d6399d8b593ae1e9d5af7164200f19460c17d1dcb720c52e6288427810&w=740",
    "https://img.freepik.com/free-photo/3d-render-online-payment-transaction-security_107791-16637.jpg?t=st=1743182858~exp=1743186458~hmac=dc0047406b2eb719ce0e9be2eca50f129f0c11499c84d058e35230b6e7f540df&w=740",
    "https://img.freepik.com/free-vector/3d-render-hand-hold-gold-credit-card-illustration_107791-17244.jpg?t=st=1743183055~exp=1743186655~hmac=b2988bc1311a1ff09f1848106f0f862f88263e18a4f74549c5eb30a4cbfbb84e&w=740"
]


export const benefits = [
    {
      title: "Fast & Low-Cost Cross-Border Payments",
      description: "StellarPay leverages the Stellar blockchain to offer instant and low-cost transactions, allowing users to send money globally without the high fees or delays of traditional financial systems.",
    },
    {
      title: "Decentralized & Secure",
      description: "With Stellar's decentralized network, StellarPay ensures transparency, security, and trust, removing the need for third-party intermediaries and giving you full control over your assets.",
    },
    {
      title: "Seamless Currency Conversion",
      description: "Easily convert between multiple fiat currencies and cryptocurrencies with Stellar’s built-in tokenization and decentralized exchange (DEX), giving you complete flexibility for cross-currency transactions.",
    },
    {
      title: "Instant Settlement & Transactions",
      description: "Stellar’s consensus protocol enables near-instant settlement of transactions, ensuring your payments and transfers are completed quickly and efficiently without waiting hours or days.",
    },
    {
      title: "Global Accessibility",
      description: "StellarPay enables users worldwide to participate in the global financial ecosystem, whether you’re in developed or underbanked regions, thanks to Stellar's low-cost, inclusive approach to digital payments.",
    },
   
  ];
  