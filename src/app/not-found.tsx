import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

/**
 * Deliberately a server component with no Suspense boundary.
 *
 * This page was previously "use client" wrapped in <Suspense fallback={null}>.
 * Nothing inside it suspends, so the boundary only served to flush an empty
 * shell — which committed a 200 status before notFound() could set 404. Every
 * notFound() in the app was therefore served as a soft 404, which Google treats
 * as a crawl-budget bug and refuses to index correctly.
 */
export const metadata: Metadata = {
    title: 'Page Not Found',
    robots: { index: false, follow: true },
}

export default function NotFound() {
    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <CardTitle className="text-4xl">404</CardTitle>
                    <CardDescription>Page Not Found</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p>Sorry, we couldn’t find the page you’re looking for.</p>
                    <div className="flex flex-wrap items-center justify-center gap-3">
                        <Button asChild>
                            <Link href="/">Go to Homepage</Link>
                        </Button>
                        <Button asChild variant="outline">
                            <Link href="/jobs">Browse Jobs</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
