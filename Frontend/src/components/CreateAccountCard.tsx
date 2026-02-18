import { useState } from "react";
import { accountApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CreateAccountCard = () => {
  const [accountType, setAccountType] = useState("");
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState(false);
  const { toast } = useToast();

  const handleCreate = async () => {
    if (!accountType) return;
    setLoading(true);
    try {
      await accountApi.create({ accountType });
      setCreated(true);
      toast({ title: "Account created!", description: `Your ${accountType} account is now active.` });
      setTimeout(() => {
        setCreated(false);
        setAccountType("");
      }, 3000);
    } catch (err: any) {
      toast({
        title: "Failed to create account",
        description: err.response?.data?.message || "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="glass-card animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Plus className="w-5 h-5 text-primary" />
          Open New Account
        </CardTitle>
        <CardDescription>Create a new bank account to manage your finances</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Account Type</Label>
          <Select value={accountType} onValueChange={setAccountType}>
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Select account type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="savings">Savings Account</SelectItem>
              <SelectItem value="checking">Checking Account</SelectItem>
              <SelectItem value="business">Business Account</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={handleCreate}
          disabled={!accountType || loading}
          className="w-full h-11 gradient-primary border-0"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : created ? (
            <CheckCircle2 className="w-4 h-4 mr-2" />
          ) : (
            <Plus className="w-4 h-4 mr-2" />
          )}
          {created ? "Account Created!" : "Create Account"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default CreateAccountCard;
