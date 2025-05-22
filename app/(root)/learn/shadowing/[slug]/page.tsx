import { ShadowingTechnique } from "@/components/ShadowingTechnique";
import { Videos } from "@/lib/constants";
import { Metadata } from "next";

function toSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/[^\w-]+/g, "");
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  params = await params;

  const video = Videos.find((v) => toSlug(v.title) === params.slug);

  const baseTitle = "Shadowing Technique";
  const title = video ? `${baseTitle} | ${video.title}` : baseTitle;

  return {
    title,
    description:
      "Improve your language skills by repeating the content you listen to effectively",
    openGraph: {
      title: title,
      description:
        "Improve your language skills by repeating the content you listen to effectively",
      url: `https://voxactive.huscor.tech/learn/shadowing/${params.slug}`,
      siteName: "VoxActive",
      images: [
        {
          url: "https://voxactive.huscor.tech/ai-avatar.png",
          width: 1200,
          height: 630,
        },
      ],
      locale: "en_US",
      type: "website",
    },
  };
}

export default async function Page({ params }: { params: any }) {
  params = await params;
  const video = Videos.find((v) => toSlug(v.title) === params.slug);
  if (!video) return <div>Video not found</div>;

  return (
    <div className="h-auto w-full flex">
      <ShadowingTechnique videoId={video.id} />
    </div>
  );
}
