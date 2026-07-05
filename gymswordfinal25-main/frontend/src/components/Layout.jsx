import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";

export default function Layout({ children }) {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-white text-black">
      <NavBar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

