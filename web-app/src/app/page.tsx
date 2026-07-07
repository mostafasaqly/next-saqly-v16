import { getAllSectionMeta } from "@/lib/sections";
import HomeClient from "./HomeClient";

export default function Page() {
  return <HomeClient sections={getAllSectionMeta()} />;
}
