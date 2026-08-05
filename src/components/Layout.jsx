import AuroraBackground from "./AuroraBackground";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function Layout({ children, hideFooter = false }) {
  return (
    <div className="relative min-h-screen">
      <AuroraBackground />
      <Navbar />
      <main className="relative z-10 px-5 sm:px-6 md:px-10">{children}</main>
      {!hideFooter && <Footer />}
    </div>
  );
}
