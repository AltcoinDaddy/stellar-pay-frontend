// app/payments/page.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  RefreshCw,
  ExternalLink,
  Copy,
  Check,
  FileText,
  ArrowUpRight,
  ArrowDownLeft,
  Info,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Payment {
  id: string;
  date: string;
  amount: string;
  asset: string;
  from?: string;
  to: string;
  memo?: string;
  hash?: string;
  status: "success" | "pending" | "failed";
  operation_type?: string;
  transaction_hash?: string;
  created_at: string; // ISO date string
}

export default function PaymentsPage() {
  const [stellarAddress, setStellarAddress] = useState("");
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [copied, setCopied] = useState(false);

  // Load stored address on component mount
  useEffect(() => {
    const storedAddress = localStorage.getItem("stellarAddress");
    if (storedAddress) {
      setStellarAddress(storedAddress);
      fetchPayments(storedAddress);
    }
  }, []);

  // Filter payments when search term, active tab, or payments change
  useEffect(() => {
    if (payments.length === 0) {
      setFilteredPayments([]);
      return;
    }

    let filtered = [...payments];

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (payment) =>
          payment.id.toLowerCase().includes(term) ||
          payment.memo?.toLowerCase().includes(term) ||
          payment.amount.toLowerCase().includes(term) ||
          payment.asset.toLowerCase().includes(term) ||
          payment.from?.toLowerCase().includes(term) ||
          payment.to.toLowerCase().includes(term)
      );
    }

    // Filter by status
    if (activeTab !== "all") {
      filtered = filtered.filter((payment) => payment.status === activeTab);
    }

    setFilteredPayments(filtered);
  }, [searchTerm, activeTab, payments]);

  const fetchPayments = async (address: string) => {
    if (!address) return;

    setIsLoading(true);
    try {
      // Check if account exists
      const accountResponse = await fetch(`/api/account?publicKey=${address}`);
      const accountData = await accountResponse.json();

      if (!accountData.exists) {
        alert(
          "Account Not Found: This Stellar address has not been activated on the network yet."
        );
        setPayments([]);
        setIsLoading(false);
        return;
      }

      // Using the correct parameter name now
      const response = await fetch(`/api/payments?publicKey=${address}`);
      const data = await response.json();

      if (data.success && data.payments) {
        // Format payments with enhanced information
        const formattedPayments: Payment[] = data.payments.map((p: any) => {
          return {
            id:
              p.id ||
              p.transaction_hash ||
              Math.random().toString(36).substring(2, 10),
            date: new Date(p.created_at).toLocaleString(),
            created_at: p.created_at,
            amount: p.amount || "0",
            asset: p.asset_code || "XLM",
            from: p.from || "Unknown",
            to: p.to || "Unknown",
            memo: p.memo || "",
            hash: p.transaction_hash || p.id,
            status: p.status || "success",
            operation_type: p.type || p.operation_type || "payment",
            transaction_hash: p.transaction_hash || "",
          };
        });

        setPayments(formattedPayments);
      } else {
        setPayments([]);
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
      alert("Error: Failed to load payment history. Please try again.");
      setPayments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAccount = () => {
    if (!stellarAddress) {
      alert("Error: Please enter a Stellar address");
      return;
    }

    localStorage.setItem("stellarAddress", stellarAddress);
    fetchPayments(stellarAddress);
  };

  const viewPaymentDetails = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowDetailDialog(true);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const viewOnExplorer = (hash: string) => {
    if (hash) {
      window.open(
        `https://stellar.expert/explorer/public/tx/${hash}`,
        "_blank"
      );
    }
  };

  // Helper to format address for display
  const formatAddress = (address: string) => {
    if (!address || address === "Unknown") {
      return "Unknown Address";
    }
    return `${address.substring(0, 4)}...${address.substring(
      address.length - 4
    )}`;
  };

  // Helper to determine if a transaction is incoming or outgoing
  const isIncomingPayment = (payment: Payment) => {
    return payment.to === stellarAddress;
  };

  // Helper to format transaction amount with proper styling
  const formatAmount = (payment: Payment) => {
    const amount = parseFloat(payment.amount);
    if (amount === 0) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center text-gray-500">
                <span>0 {payment.asset}</span>
                <Info className="h-3 w-3 ml-1" />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                This is a zero-value transaction, likely an account activation
                or memo-only transaction.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return isIncomingPayment(payment) ? (
      <span className="text-green-600 font-medium">
        +{payment.amount} {payment.asset}
      </span>
    ) : (
      <span className="text-orange-600 font-medium">
        -{payment.amount} {payment.asset}
      </span>
    );
  };

  return (
    <div className="space-y-6 w-full">
      <div className="flex flex-col md:gap-4">
        <h1 className="text-3xl font-bold">Payments</h1>
        <p className="text-white">View and manage your payment transactions</p>
      </div>

      <Card className="bg-black text-white">
        <CardHeader>
          <CardTitle>Stellar Account</CardTitle>
          <CardDescription>
            Enter your Stellar address to view payment history
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <Label htmlFor="stellarAddress" className="sr-only">
                Stellar Address
              </Label>
              <Input
                id="stellarAddress"
                placeholder="Enter your Stellar address (G...)"
                value={stellarAddress}
                onChange={(e) => setStellarAddress(e.target.value)}
                className="text-white"
              />
            </div>
            <Button onClick={loadAccount} disabled={isLoading}>
              {isLoading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                "Load Payments"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {stellarAddress && (
        <Card className="bg-black text-white w-full border">
          <CardHeader>
            <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 ">
              <div className="flex gap-2 flex-col">
                <CardTitle>Payment History</CardTitle>
                <CardDescription>Your payment transactions</CardDescription>
              </div>
              <div className="flex w-full md:w-auto space-x-2">
                <div className="relative flex-1 md:w-60">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-white" />
                  <Input
                    placeholder="Search payments..."
                    className=" text-white placeholder:text-white pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button
                  variant="outline"
                  className="bg-black text-white"
                  onClick={() => fetchPayments(stellarAddress)}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="bg-black text-white">
            <Tabs
              defaultValue="all"
              onValueChange={setActiveTab}
              className="bg-black text-white"
            >
              <TabsList className="mb-4 bg-black text-white">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="success">Successful</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="failed">Failed</TabsTrigger>
              </TabsList>
              <div>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <RefreshCw className="h-8 w-8 animate-spin text-white" />
                  </div>
                ) : filteredPayments.length > 0 ? (
                  <div className="rounded-md border">
                    <Table className="">
                      <TableHeader>
                        <TableRow className="bg-black hover:bg-black">
                          <TableHead className="text-white">Date</TableHead>
                          <TableHead className="text-white">Type</TableHead>
                          <TableHead className="text-white">Amount</TableHead>
                          <TableHead className="hidden md:table-cell text-white">
                            To/From
                          </TableHead>
                          <TableHead className="text-white">Status</TableHead>
                          <TableHead className="text-right text-white">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody className="hover:bg-none bg-black text-white">
                        {filteredPayments.map((payment) => (
                          <TableRow
                            key={payment.id}
                            className={`
                              ${parseFloat(payment.amount) === 0
                                ? "bg-gray-50"
                                : ""} hover:bg-black bg-black text-white
                            `}
                          >
                            <TableCell className="font-medium">
                              {payment.date}
                            </TableCell>
                            <TableCell>
                              {isIncomingPayment(payment) ? (
                                <span className="flex items-center text-green-600">
                                  <ArrowDownLeft className="h-4 w-4 mr-1" />
                                  Receive
                                </span>
                              ) : (
                                <span className="flex items-center text-orange-600">
                                  <ArrowUpRight className="h-4 w-4 mr-1" />
                                  Send
                                </span>
                              )}
                            </TableCell>
                            <TableCell>{formatAmount(payment)}</TableCell>
                            <TableCell className="hidden md:table-cell">
                              {isIncomingPayment(payment) ? (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span className="text-green-600">
                                        From:{" "}
                                        {payment.from === "Unknown"
                                          ? "Unknown (possibly new account)"
                                          : formatAddress(payment.from || "")}
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>
                                        {payment.from === "Unknown"
                                          ? "This could be a network operation or account creation"
                                          : payment.from}
                                      </p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              ) : (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span className="text-orange-600">
                                        To: {formatAddress(payment.to)}
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>{payment.to}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  payment.status === "success"
                                    ? "default"
                                    : payment.status === "pending"
                                    ? "outline"
                                    : "destructive"
                                }
                              >
                                {payment.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => viewPaymentDetails(payment)}
                                className="bg-black text-white hover:bg-black hover:text-white"
                              >
                                View Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center w-full">
                    <FileText className="h-12 w-12 text-white mb-4" />
                    <h3 className="text-lg font-medium">No payments found</h3>
                    <p className="text-sm text-white">
                      {searchTerm
                        ? "No payments match your search criteria."
                        : "We couldn't find any payments for this account."}
                    </p>
                  </div>
                )}
              </div>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Payment Details Dialog */}
      {selectedPayment && (
        <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
          <DialogContent className="sm:max-w-md bg-black text-white">
            <DialogHeader>
              <DialogTitle>Payment Details</DialogTitle>
              <DialogDescription>
                Transaction information and details
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-4">
              <div className="space-y-1">
                <Label className="text-xs text-white">Date</Label>
                <div>{selectedPayment.date}</div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-white">Type</Label>
                <div className="capitalize">
                  {selectedPayment.operation_type}
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-white">Amount</Label>
                <div
                  className={
                    parseFloat(selectedPayment.amount) === 0
                      ? "text-gray-500"
                      : isIncomingPayment(selectedPayment)
                      ? "text-green-600 font-medium"
                      : "text-orange-600 font-medium"
                  }
                >
                  {parseFloat(selectedPayment.amount) === 0
                    ? `0 ${selectedPayment.asset} (Zero-value transaction)`
                    : `${isIncomingPayment(selectedPayment) ? "+" : "-"}${
                        selectedPayment.amount
                      } ${selectedPayment.asset}`}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-white">From</Label>
                  <div className="flex items-center space-x-2 text-sm bg-black text-white hover:bg-black hover:text-white">
                    <span
                      className={
                        selectedPayment.from === "Unknown"
                          ? "text-gray-500 italic"
                          : ""
                      }
                    >
                      {selectedPayment.from === "Unknown"
                        ? "Unknown Source"
                        : formatAddress(selectedPayment.from || "")}
                    </span>
                    {selectedPayment.from !== "Unknown" && (
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6 bg-black text-white hover:bg-black hover:text-white"
                        onClick={() =>
                          copyToClipboard(selectedPayment.from || "")
                        }
                      >
                        {copied ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    )}
                  </div>
                  {selectedPayment.from === "Unknown" && (
                    <p className="text-xs text-white">
                      This could be a network operation, account creation, or
                      the data is unavailable
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-white">To</Label>
                  <div className="flex items-center space-x-2 text-sm">
                    <span>{formatAddress(selectedPayment.to)}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-6 w-6 bg-black text-white hover:bg-black hover:text-white"
                      onClick={() => copyToClipboard(selectedPayment.to)}
                    >
                      {copied ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
              {selectedPayment.memo && (
                <div className="space-y-1">
                  <Label className="text-xs text-white">Memo</Label>
                  <div className="text-sm bg-slate-50 p-2 rounded-md">
                    {selectedPayment.memo}
                  </div>
                </div>
              )}
              <div className="space-y-1">
                <Label className="text-xs text-white">Transaction Hash</Label>
                <div className="flex items-center space-x-2 text-sm">
                  <span className="font-mono">
                    {selectedPayment.hash?.substring(0, 10)}...
                    {selectedPayment.hash?.substring(
                      selectedPayment.hash.length - 10
                    )}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-6 w-6 bg-black text-white hover:bg-black hover:text-white"
                    onClick={() => copyToClipboard(selectedPayment.hash || "")}
                  >
                    {copied ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
            <DialogFooter className="flex justify-between sm:justify-between">
              <Button
                variant="secondary"
                onClick={() => setShowDetailDialog(false)}
                className="bg-black text-white hover:bg-black hover:text-white border"
              >
                Close
              </Button>
              {selectedPayment.hash && (
                <Button
                  variant="outline"
                  onClick={() => viewOnExplorer(selectedPayment.hash || "")}
                  className="bg-black text-white hover:bg-black hover:text-white"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View on Explorer
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
