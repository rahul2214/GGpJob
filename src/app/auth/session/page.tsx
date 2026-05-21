"use client";

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase-client';
import { LoaderCircle } from 'lucide-react';

function AuthSessionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const setSupabaseSession = async () => {
      const accessToken = searchParams.get('access_token');
      const refreshToken = searchParams.get('refresh_token');
      const next = searchParams.get('next') || '/';

      if (!accessToken || !refreshToken) {
        setStatus('error');
        setErrorMsg('Invalid session parameters.');
        return;
      }

      try {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error) {
          throw error;
        }

        // Session successfully restored client-side. Redirect to final path.
        router.replace(next);
      } catch (err: any) {
        console.error('Error setting client session:', err);
        setStatus('error');
        setErrorMsg(err.message || 'Failed to initialize session.');
      }
    };

    setSupabaseSession();
  }, [searchParams, router]);

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 p-8 text-center animate-fade-in">
          <div className="text-red-600 text-sm bg-red-50 rounded-xl px-4 py-3 mb-6 text-left border border-red-100">
            {errorMsg}
          </div>
          <button
            onClick={() => router.replace('/login')}
            className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-md shadow-indigo-100"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 p-8 text-center">
        <LoaderCircle className="w-10 h-10 animate-spin text-indigo-600 mx-auto mb-4" />
        <p className="text-slate-600 font-medium">Restoring your session...</p>
      </div>
    </div>
  );
}

export default function AuthSessionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 p-8 text-center">
          <LoaderCircle className="w-10 h-10 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Loading session helper...</p>
        </div>
      </div>
    }>
      <AuthSessionContent />
    </Suspense>
  );
}
