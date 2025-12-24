import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, BarChart3, Database } from 'lucide-react';

export default function LoginPage() {
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setLoading(true);
    try {
      await signIn();
    } catch (error) {
      console.error('Login failed:', error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -top-48 -left-48 animate-pulse" />
        <div className="absolute w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl -bottom-48 -right-48 animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl mb-4 shadow-lg shadow-blue-500/50">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Mid-States Analytics</h1>
          <p className="text-slate-400">13 Week Report Dashboard</p>
        </div>

        {/* Login Card */}
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-white text-2xl">Welcome Back</CardTitle>
            <CardDescription className="text-slate-400">
              Sign in with your Microsoft account to access your analytics dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Button
              onClick={handleSignIn}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white h-12 text-base font-medium transition-all duration-200 shadow-lg shadow-blue-500/50"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center">
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 0h10v10H0V0zm11 0h10v10H11V0zM0 11h10v10H0V11zm11 0h10v10H11V11z" fill="currentColor"/>
                  </svg>
                  Sign in with Microsoft
                </span>
              )}
            </Button>

            {/* Features */}
            <div className="pt-6 border-t border-slate-700">
              <p className="text-xs text-slate-400 mb-4 text-center">Platform Features</p>
              <div className="space-y-3">
                <div className="flex items-center text-sm text-slate-300">
                  <BarChart3 className="w-4 h-4 mr-2 text-blue-400" />
                  <span>Real-time analytics and insights</span>
                </div>
                <div className="flex items-center text-sm text-slate-300">
                  <Database className="w-4 h-4 mr-2 text-cyan-400" />
                  <span>Historical data comparison</span>
                </div>
                <div className="flex items-center text-sm text-slate-300">
                  <TrendingUp className="w-4 h-4 mr-2 text-blue-400" />
                  <span>AI-powered trend analysis</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-slate-500 mt-6">
          Secure authentication powered by Microsoft Azure
        </p>
      </div>
    </div>
  );
}
