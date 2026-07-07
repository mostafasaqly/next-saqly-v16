// app/page.tsx
import Image from "next/image";
import heroImage from "@/public/hero.jpg"; // local import — Next.js knows width/height automatically

export default function HomePage() {
  return (
    <Image
      src={heroImage}
      alt="Hero banner"
      priority // load eagerly for above-the-fold images
    />
  );
}
