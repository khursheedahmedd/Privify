import "./globals.css";  // ✅ Corrected path
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";


export const metadata = {
  title: {
    default: "Privify",
    template: "%s | Privify",
  },
  description:
    "Privify is an advanced image analysis tool that identifies potential risks and vulnerabilities in your images, including metadata leakage, person identification, location info, copyright infringement, and security concerns. It provides a detailed summary and ranking of these risks, describes the image, lists detected objects, warns of any breaches through detected objects, and maps detected locations. Finally, it offers an option to remove all security vulnerabilities and download a safe image ready for sharing.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="">
        <Navbar />
        <main className="">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
