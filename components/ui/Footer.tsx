"use client"
import { GithubIcon, Linkedin, LinkedinIcon } from "lucide-react";
import Link from "next/link";

import { usePathname } from "next/navigation";

const Footer = () => {
  const pathname = usePathname();

  // Don't render footer if not on home page
  if (pathname !== "/") {
    return null;
  }
  return (
    <footer 
      className="relative w-full py-6 mt-10 bg-zinc-900  border-zinc-800"
      role="contentinfo"
    >
      <div className="w-full px-4 sm:px-6 mx-auto max-w-[85rem]">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="text-center text-gray-400 text-sm">
            <p>This is a demo application. You agree that your information is stored for limit checking</p>
          </div>
          
          <div className="flex items-center gap-6">
            <Link 
              href="https://github.com/huseyincorakli" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="GitHub Profile"
            >
              <GithubIcon className="h-5 w-5" />
            </Link>
            
            <Link 
              href="https://linkedin.com/in/huseyincorakli" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="LinkedIn Profile"
            >
              <LinkedinIcon className="h-5 w-5" />
            </Link>
          </div>
          
          <div className="text-gray-500 text-xs mt-2">
            <p>© {new Date().getFullYear()} VoxActive. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;