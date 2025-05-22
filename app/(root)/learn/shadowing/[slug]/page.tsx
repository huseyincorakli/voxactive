import { ShadowingTechnique } from "@/components/ShadowingTechnique";
import { Videos } from "@/lib/constants";

function toSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/[^\w-]+/g, "");
}

export default async function Page({ params }: { params: any }) {
  const { slug } = await params;
  if (!slug) return <div>Loading...</div>;
  const video = Videos.find((v) => toSlug(v.title) === slug);
  console.log(video);

  return (
    <div className="h-auto w-full flex">
      <ShadowingTechnique videoId={video.id} />
    </div>
  );
}
