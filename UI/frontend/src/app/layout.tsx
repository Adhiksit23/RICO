import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

export const metadata = {
  title: "Machine AI",
  description: "Industrial AI Dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
  <div className="flex bg-[#0B1120] text-white">
    <Sidebar />

    <div className="flex-1 flex flex-col">
      <Topbar />

      <main className="flex-1">
        {children}
      </main>
    </div>
  </div>
     </body>
    </html>
  );
}
