// app/layout.js (Server Component - sans 'use client')
import { Outfit } from "next/font/google";
import "./globals.css";
import ClientProviders from "@/components/ClientProviders";
import AuthInitializer from "@/components/AuthInitializer";
const outfit = Outfit({ subsets: ['latin'], weight: ["300", "400", "500"] });
import { AppContextProvider } from "@/context/AppContext";
export const metadata = {
  title: "QuickCart - GreatStack",
  description: "E-Commerce with Next.js",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${outfit.className} antialiased text-gray-700`}>
        <ClientProviders>
            <AuthInitializer> 
               <AppContextProvider authData={authData}>
               {children}</AppContextProvider>
            </AuthInitializer>
      
        </ClientProviders>
      </body>
    </html>
  );
}