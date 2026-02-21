import { useAuth } from "@/contexts/AuthContext";
import DashboardHeader from "@/components/DashboardHeader";
import CreateAccountCard from "@/components/CreateAccountCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, TrendingUp, Shield, ArrowUpRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { accountApi } from "@/lib/api";

const Dashboard = () => {
  const { user } = useAuth();

  /*  Fetch user accounts dynamically */
  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ["accounts"],
    queryFn: async () => {
      const res = await accountApi.getAll();
      return res.data;
    },
  });

  /*  Total Balance */
  const totalBalance = accounts.length;

  const stats = [
    {
      label: "Total Balance",
      value: isLoading ? "Loading..." : `₹${(totalBalance * 1000).toFixed(2)}`,
      icon: Wallet,
      change: "+0%",
    },
    {
      label: "Accounts",
      value: isLoading ? "..." : accounts.length.toString(),
      icon: TrendingUp,
      change: "Active",
    },
    {
      label: "Security",
      value: "Strong",
      icon: Shield,
      change: "Verified",
    },
  ];

  return (
    <div className="min-h-screen bg-background dark">
      <DashboardHeader />

      <main className="container px-6 py-8 max-w-6xl">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-foreground">
            Good{" "}
            {new Date().getHours() < 12
              ? "morning"
              : new Date().getHours() < 18
              ? "afternoon"
              : "evening"}
            ,{" "}
            <span className="text-gradient">
              {user?.name || "there"}
            </span>
          </h1>

          <p className="text-muted-foreground mt-1">
            Here's an overview of your finances
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {stats.map((stat, i) => (
            <Card
              key={i}
              className="glass-card animate-fade-in"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <stat.icon className="w-4 h-4 text-primary" />
              </CardHeader>

              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {stat.value}
                </div>

                <div className="flex items-center gap-1 mt-1">
                  <ArrowUpRight className="w-3 h-3 text-success" />
                  <span className="text-xs text-success">
                    {stat.change}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="max-w-lg">
          <CreateAccountCard />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;