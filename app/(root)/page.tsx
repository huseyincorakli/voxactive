import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
          Learn English <span className="text-blue-600">Naturally</span>
        </h1>
        <p className="text-xl text-gray-200 mb-10 max-w-3xl mx-auto">
          VoxActive helps you achieve fluency through personalized conversations, interactive exercises, and real-world practice.
        </p>
        
      </section>

      {/* YouTube Video Section */}
      <section className="container mx-auto px-6 pb-20">
        <div className="bg-gray-800 rounded-xl overflow-hidden shadow-2xl">
          <div className="aspect-w-16 aspect-h-9">
            <iframe
              className="w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px]"
              src="https://www.youtube.com/embed/_7JsfHTyqiw?si=v9nJFapqUpr_yuWI"
              title="VoxActive App Demo"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
         
        </div>
      </section>
    </div>
  );
}