'use client'

import { useRouter } from 'next/navigation'

import useAuthStore from 'src/store/useAuthStore'

const Page = () => {
    const router = useRouter()

    // Get the authentication state from internal store
    const isAuthenticated = useAuthStore.useIsAuthenticated()

    // Wait until the store has been hydrated
    const hasHydrated = useAuthStore.use_hasHydrated()
    if (!hasHydrated) return

    // Redirect to the appropriate page
    if (!isAuthenticated) router.push('/auth/login')
    else router.push('/admin')

    return <></>
}

export default Page
