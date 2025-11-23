'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  CreditCard,
  Zap,
  TrendingUp,
  CheckCircle,
  Crown,
  Star,
  ArrowRight,
  Plus,
  History,
  Download,
  HelpCircle
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { formatCredits, formatCurrency, formatRelativeTime } from '@/lib/utils';
import { CREDIT_PACKAGES, SUBSCRIPTION_PLANS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { CreditBalance, CreditTransaction, Subscription } from '@/types';

// Mock data
const mockCreditBalance: CreditBalance = {
  balance: 50,
  totalEarned: 500,
  totalSpent: 450,
  lastUpdated: new Date().toISOString(),
};

const mockTransactions: CreditTransaction[] = [
  {
    id: '1',
    userId: 'user1',
    amount: 50,
    type: 'bonus',
    description: 'Welcome bonus',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
  },
  {
    id: '2',
    userId: 'user1',
    amount: -25,
    type: 'spend',
    referenceId: 'job1',
    description: 'product-demo.mp4 dubbing',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: '3',
    userId: 'user1',
    amount: -75,
    type: 'spend',
    referenceId: 'job2',
    description: 'tutorial-webinar.mp4 dubbing',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: '4',
    userId: 'user1',
    amount: 100,
    type: 'purchase',
    description: 'Credit package purchase',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
  },
];

const mockSubscription: Subscription = {
  id: 'sub1',
  userId: 'user1',
  planType: 'free',
  status: 'active',
  currentPeriodStart: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
  currentPeriodEnd: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15).toISOString(),
  creditsPerMonth: 50,
  createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
};

export default function BillingPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'purchase' | 'history' | 'subscription'>('overview');
  const [creditBalance, setCreditBalance] = useState<CreditBalance>(mockCreditBalance);
  const [transactions, setTransactions] = useState<CreditTransaction[]>(mockTransactions);
  const [subscription, setSubscription] = useState<Subscription>(mockSubscription);
  const [selectedPackage, setSelectedPackage] = useState(CREDIT_PACKAGES[0]);
  const [isPurchasing, setIsPurchasing] = useState(false);

  const handleCreditPurchase = async (packageId: string) => {
    const pkg = CREDIT_PACKAGES.find(p => p.id === packageId);
    if (!pkg) return;

    setIsPurchasing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update balance
      setCreditBalance(prev => ({
        ...prev,
        balance: prev.balance + pkg.credits,
        totalEarned: prev.totalEarned + pkg.credits,
      }));

      // Add transaction
      const newTransaction: CreditTransaction = {
        id: Math.random().toString(36).substring(7),
        userId: user?.id || '',
        amount: pkg.credits,
        type: 'purchase',
        description: `${pkg.credits} credits package purchase`,
        createdAt: new Date().toISOString(),
      };

      setTransactions(prev => [newTransaction, ...prev]);

      toast.success(`Successfully purchased ${pkg.credits} credits!`);
    } catch (error) {
      toast.error('Purchase failed. Please try again.');
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleSubscriptionUpgrade = async (planType: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      const plan = SUBSCRIPTION_PLANS[planType.toUpperCase() as keyof typeof SUBSCRIPTION_PLANS];
      if (!plan) return;

      setSubscription(prev => ({
        ...prev,
        planType: plan.type,
        creditsPerMonth: plan.creditsPerMonth,
        status: 'active',
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
      }));

      // Add bonus credits for upgrade
      setCreditBalance(prev => ({
        ...prev,
        balance: prev.balance + plan.creditsPerMonth,
        totalEarned: prev.totalEarned + plan.creditsPerMonth,
      }));

      toast.success(`Successfully upgraded to ${plan.name} plan!`);
    } catch (error) {
      toast.error('Upgrade failed. Please try again.');
    }
  };

  const exportTransactions = async () => {
    try {
      const csv = [
        ['Date', 'Type', 'Amount', 'Description'],
        ...transactions.map(t => [
          new Date(t.createdAt).toLocaleDateString(),
          t.type,
          t.amount.toString(),
          t.description,
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'credit-transactions.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success('Transactions exported successfully');
    } catch (error) {
      toast.error('Export failed');
    }
  };

  const getTransactionIcon = (type: CreditTransaction['type']) => {
    switch (type) {
      case 'purchase':
        return <Plus className="h-4 w-4 text-green-600" />;
      case 'spend':
        return <Zap className="h-4 w-4 text-blue-600" />;
      case 'bonus':
        return <Star className="h-4 w-4 text-yellow-600" />;
      case 'refund':
        return <ArrowRight className="h-4 w-4 text-purple-600" />;
      default:
        return <CreditCard className="h-4 w-4 text-gray-600" />;
    }
  };

  const getSubscriptionIcon = (planType: string) => {
    switch (planType) {
      case 'free':
        return <Star className="h-6 w-6 text-gray-600" />;
      case 'creator':
        return <TrendingUp className="h-6 w-6 text-blue-600" />;
      case 'professional':
        return <Crown className="h-6 w-6 text-purple-600" />;
      case 'enterprise':
        return <Crown className="h-6 w-6 text-yellow-600" />;
      default:
        return <Star className="h-6 w-6 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <span className="text-xl font-bold">PolyDub</span>
            </Link>
            <nav className="text-sm text-muted-foreground">
              <Link href="/dashboard" className="hover:text-foreground">Dashboard</Link>
              <span className="mx-2">/</span>
              <span className="text-foreground">Billing</span>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-muted rounded-lg transition-colors">
              <HelpCircle className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Billing & Credits</h1>
            <p className="text-muted-foreground">
              Manage your credits, subscription, and view transaction history
            </p>
          </div>

          {/* Credit Balance Overview */}
          <div className="bg-card rounded-lg border p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">{formatCredits(creditBalance.balance)}</h2>
                <p className="text-muted-foreground">Available Credits</p>
              </div>
              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary/10">
                <CreditCard className="h-8 w-8 text-primary" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
              <div>
                <p className="text-sm text-muted-foreground">Total Earned</p>
                <p className="font-semibold">{formatCredits(creditBalance.totalEarned)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Spent</p>
                <p className="font-semibold">{formatCredits(creditBalance.totalSpent)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Plan</p>
                <p className="font-semibold capitalize">{subscription.planType}</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-8 border-b">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'purchase', label: 'Purchase Credits' },
              { id: 'subscription', label: 'Subscription' },
              { id: 'history', label: 'Transaction History' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "px-4 py-3 border-b-2 transition-colors",
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="grid gap-8 lg:grid-cols-2">
              {/* Subscription Status */}
              <div className="bg-card rounded-lg border p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  {getSubscriptionIcon(subscription.planType)}
                  Current Subscription
                </h3>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium capitalize">{subscription.planType} Plan</span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                        {subscription.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {subscription.creditsPerMonth} credits per month
                    </p>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Next billing date</span>
                      <span>{new Date(subscription.currentPeriodEnd).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab('subscription')}
                    className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Upgrade Plan
                  </button>
                </div>
              </div>

              {/* Quick Purchase */}
              <div className="bg-card rounded-lg border p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Quick Purchase
                </h3>

                <div className="space-y-3">
                  {CREDIT_PACKAGES.slice(0, 3).map((pkg) => (
                    <button
                      key={pkg.id}
                      onClick={() => handleCreditPurchase(pkg.id)}
                      disabled={isPurchasing}
                      className="w-full p-4 border border-input rounded-lg hover:bg-muted transition-colors text-left"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{formatCredits(pkg.credits)}</div>
                          {pkg.savings > 0 && (
                            <div className="text-sm text-green-600">{pkg.savings}% savings</div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{formatCurrency(pkg.price)}</div>
                          <div className="text-sm text-muted-foreground">
                            {formatCurrency(pkg.price / pkg.credits)} each
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setActiveTab('purchase')}
                  className="w-full mt-4 px-4 py-2 border border-input rounded-lg hover:bg-muted transition-colors"
                >
                  View All Packages
                </button>
              </div>
            </div>
          )}

          {activeTab === 'purchase' && (
            <div>
              <h3 className="text-xl font-semibold mb-6">Purchase Credits</h3>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {CREDIT_PACKAGES.map((pkg) => (
                  <div
                    key={pkg.id}
                    className={cn(
                      "bg-card rounded-lg border p-6 cursor-pointer transition-all",
                      selectedPackage.id === pkg.id
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-input hover:border-primary/50"
                    )}
                    onClick={() => setSelectedPackage(pkg)}
                  >
                    <div className="text-center">
                      <div className="text-3xl font-bold mb-2">{formatCredits(pkg.credits)}</div>
                      <div className="text-2xl font-semibold mb-2">{formatCurrency(pkg.price)}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatCurrency(pkg.price / pkg.credits)} per credit
                      </div>

                      {pkg.savings > 0 && (
                        <div className="mt-4 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                          Save {pkg.savings}%
                        </div>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCreditPurchase(pkg.id);
                        }}
                        disabled={isPurchasing}
                        className="w-full mt-6 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                      >
                        {isPurchasing ? 'Processing...' : 'Purchase'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-6 bg-muted/50 rounded-lg">
                <h4 className="font-semibold mb-3">Payment Methods</h4>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Credit/Debit Cards
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-600 rounded"></div>
                    PayPal
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-600 rounded"></div>
                    Google Pay
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-black rounded"></div>
                    Apple Pay
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'subscription' && (
            <div>
              <h3 className="text-xl font-semibold mb-6">Subscription Plans</h3>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {Object.values(SUBSCRIPTION_PLANS).map((plan) => {
                  const isCurrentPlan = subscription.planType === plan.type;
                  const isUpgrade = plan.price > (SUBSCRIPTION_PLANS[subscription.planType.toUpperCase() as keyof typeof SUBSCRIPTION_PLANS]?.price || 0);

                  return (
                    <div
                      key={plan.id}
                      className={cn(
                        "bg-card rounded-lg border p-6 relative",
                        isCurrentPlan
                          ? "border-primary ring-2 ring-primary/20"
                          : "border-input",
                        plan.type === 'professional' && "ring-2 ring-purple-500/20"
                      )}
                    >
                      {plan.type === 'professional' && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs">
                            Most Popular
                          </span>
                        </div>
                      )}

                      <div className="text-center mb-6">
                        <div className="flex items-center justify-center gap-2 mb-4">
                          {getSubscriptionIcon(plan.type)}
                        </div>
                        <h4 className="text-xl font-bold mb-2">{plan.name}</h4>
                        <div className="text-3xl font-bold mb-1">
                          {plan.price === 0 ? 'Free' : formatCurrency(plan.price)}
                          {plan.price > 0 && <span className="text-lg text-muted-foreground">/month</span>}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatCredits(plan.creditsPerMonth)} per month
                        </div>
                      </div>

                      <div className="space-y-3 mb-6">
                        <h5 className="font-medium">Features:</h5>
                        <ul className="space-y-2 text-sm">
                          {plan.features.map((feature, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="space-y-3 mb-6">
                        <h5 className="font-medium">Limits:</h5>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Max file size</span>
                            <span>{formatFileSize(plan.limits.maxFileSize)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Max resolution</span>
                            <span>{plan.limits.maxResolution}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Languages</span>
                            <span>{plan.limits.languages}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleSubscriptionUpgrade(plan.type)}
                        disabled={isCurrentPlan || !isUpgrade}
                        className={cn(
                          "w-full px-4 py-3 rounded-lg transition-colors",
                          isCurrentPlan
                            ? "bg-muted text-muted-foreground cursor-not-allowed"
                            : isUpgrade
                            ? "bg-primary text-primary-foreground hover:bg-primary/90"
                            : "bg-muted text-muted-foreground cursor-not-allowed"
                        )}
                      >
                        {isCurrentPlan ? 'Current Plan' : isUpgrade ? `Upgrade to ${plan.name}` : 'Downgrade'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">Transaction History</h3>
                <button
                  onClick={exportTransactions}
                  className="flex items-center gap-2 px-4 py-2 border border-input rounded-lg hover:bg-muted transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Export CSV
                </button>
              </div>

              <div className="bg-card rounded-lg border">
                {transactions.length === 0 ? (
                  <div className="p-12 text-center">
                    <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No transactions yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Your transaction history will appear here once you start using PolyDub.
                    </p>
                    <Link
                      href="/dashboard/upload"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      Start Dubbing
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y">
                    {transactions.map((transaction) => (
                      <div key={transaction.id} className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                              {getTransactionIcon(transaction.type)}
                            </div>
                            <div>
                              <p className="font-medium">{transaction.description}</p>
                              <p className="text-sm text-muted-foreground">
                                {formatRelativeTime(transaction.createdAt)}
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className={cn(
                              "font-semibold",
                              transaction.amount > 0 ? "text-green-600" : "text-red-600"
                            )}>
                              {transaction.amount > 0 ? '+' : ''}{formatCredits(transaction.amount)}
                            </div>
                            <div className="text-sm text-muted-foreground capitalize">
                              {transaction.type}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}