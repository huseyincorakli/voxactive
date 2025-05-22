import { ClientCarousel } from "@/components/ClientCarousel";
import { Video, Videos } from "@/lib/constants";
import {
  Play,
  Headphones,
  Repeat2,
  Activity,
  Check,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Level ordering
const levelOrder = {
  Beginner: 1,
  Intermediate: 2,
  Advanced: 3,
};

const groupedVideos = Videos.reduce((acc, video) => {
  if (!acc[video.category]) acc[video.category] = [];
  acc[video.category].push(video);
  return acc;
}, {} as Record<string, Video[]>);

Object.keys(groupedVideos).forEach((cat) => {
  groupedVideos[cat].sort((a, b) => levelOrder[a.level] - levelOrder[b.level]);
});

const Page = () => {
  return (
    <div className="min-h-screen relative ">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/5 rounded-full blur-2xl"></div>

      {/* Hero Section - Shadowing Technique */}
      <div className="relative z-10 py-20 lg:py-32">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto text-center mb-16">
            {/* Glowing Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 backdrop-blur-sm mb-6 group hover:from-purple-500/30 hover:to-blue-500/30 transition-all duration-300">
              <Sparkles className="w-4 h-4 text-purple-400 group-hover:text-purple-300" />
              <span className="text-sm text-gray-300 font-medium">
                AI-Powered Learning
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                Shadowing
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Technique
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
              Improve your language skills by repeating the content you listen
              to
              <span className="text-transparent bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text font-semibold">
                {" "}
                effectively
              </span>
            </p>

            {/* <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 rounded-full shadow-lg hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105 gap-3 text-lg font-semibold"
              >
                <Play className="w-6 h-6" />
                Learn Technique
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500 px-8 py-4 rounded-full transition-all duration-300"
              >
                Watch Demo
              </Button>
            </div> */}
          </div>

          {/* Modern Steps Visualization */}
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
              {/* Connecting Line */}
              <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-purple-500/20 transform -translate-y-1/2 z-0"></div>

              {/* Step 1 */}
              <div className="relative group">
                <div className="bg-gradient-to-br from-gray-900 to-black border border-purple-500/20 p-8 rounded-2xl shadow-2xl backdrop-blur-sm hover:border-purple-500/40 transition-all duration-300 transform hover:scale-105 hover:shadow-purple-500/10 relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg shadow-purple-500/25 group-hover:shadow-purple-500/40 transition-all duration-300">
                    <Headphones className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center">
                    <span className="text-purple-400 font-bold text-sm">1</span>
                  </div>
                  <h3 className="text-xl font-bold text-white text-center mb-3">
                    Listen
                  </h3>
                  <p className="text-gray-400 text-center leading-relaxed">
                    Listen carefully and focus on the rhythm.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative group">
                <div className="bg-gradient-to-br from-gray-900 to-black border border-blue-500/20 p-8 rounded-2xl shadow-2xl backdrop-blur-sm hover:border-blue-500/40 transition-all duration-300 transform hover:scale-105 hover:shadow-blue-500/10 relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-all duration-300">
                    <Repeat2 className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <span className="text-blue-400 font-bold text-sm">2</span>
                  </div>
                  <h3 className="text-xl font-bold text-white text-center mb-3">
                    Repeat
                  </h3>
                  <p className="text-gray-400 text-center leading-relaxed">
                    Repeat what you hear out loud
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative group">
                <div className="bg-gradient-to-br from-gray-900 to-black border border-cyan-500/20 p-8 rounded-2xl shadow-2xl backdrop-blur-sm hover:border-cyan-500/40 transition-all duration-300 transform hover:scale-105 hover:shadow-cyan-500/10 relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg shadow-cyan-500/25 group-hover:shadow-cyan-500/40 transition-all duration-300">
                    <Activity className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-cyan-500/10 flex items-center justify-center">
                    <span className="text-cyan-400 font-bold text-sm">3</span>
                  </div>
                  <h3 className="text-xl font-bold text-white text-center mb-3">
                    Analyze
                  </h3>
                  <p className="text-gray-400 text-center leading-relaxed">
                    Identify differences in pronunciation and rhythm
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="relative group">
                <div className="bg-gradient-to-br from-gray-900 to-black border border-green-500/20 p-8 rounded-2xl shadow-2xl backdrop-blur-sm hover:border-green-500/40 transition-all duration-300 transform hover:scale-105 hover:shadow-green-500/10 relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg shadow-green-500/25 group-hover:shadow-green-500/40 transition-all duration-300">
                    <Check className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                    <span className="text-green-400 font-bold text-sm">4</span>
                  </div>
                  <h3 className="text-xl font-bold text-white text-center mb-3">
                    Learn
                  </h3>
                  <p className="text-gray-400 text-center leading-relaxed">
                    Make corrections, repeat and learn
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Collection Section */}
      <div className="relative z-10 container mx-auto px-6 py-16 space-y-16">
        {/* Section Header */}
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
              Select Video from
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Collection
            </span>
          </h2>

          <p className="text-xl text-gray-400 leading-relaxed">
            Discover
            <span className="text-transparent bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text font-semibold">
              {" "}
              amazing content
            </span>{" "}
            with our carefully curated video collection
          </p>
        </div>

        {/* Video Carousels */}
        <div className="space-y-12">
          {Object.entries(groupedVideos).map(([category, videos], index) => (
            <div key={category} className="relative">
              {/* Category Background Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-800/5 to-transparent rounded-3xl"></div>
              <div className="relative z-10">
                <ClientCarousel category={category} videos={videos} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent pointer-events-none"></div>
    </div>
  );
};

export default Page;
