import { Hero } from "@/components/home/Hero";
import { FeaturedJobs } from "@/components/jobs/FeaturedJobs";

export default function HomePage() {
  return (
    <div className="space-y-16">
      <Hero />
      <FeaturedJobs />
    </div>
  );
}
