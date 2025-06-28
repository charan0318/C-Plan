import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { PlansTable } from "@/components/dashboard/plans-table";
import { Plus } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Active Plans
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Monitor and manage your wallet automation plans
            </p>
          </div>
          <Link href="/planner">
            <Button className="bg-primary hover:bg-primary-dark">
              <Plus className="mr-2" size={16} />
              New Plan
            </Button>
          </Link>
        </div>
        
        <StatsCards />
        <PlansTable />
      </div>
    </div>
  );
}
