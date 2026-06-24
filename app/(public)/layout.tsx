import { Header } from "@/components/Blufacade/Header";
import { Footer } from "@/components/Blufacade/Footer";
import { ScrollToTop } from "@/components/Blufacade/ScrollToTop";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen relative w-full">
      <ScrollToTop />
      <Header />
      <div className="flex-grow">
        {children}
      </div>
      <Footer />
    </div>
  );
}
