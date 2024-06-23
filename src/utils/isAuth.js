'use client'

import { useRouter, usePathname } from "next/navigation";

import useAuthStore from "src/store/useAuthStore"

const isAuth = (Component) => {
    return ({ ...props }) => {
        const router = useRouter();
        const pathname = usePathname();

        // Get the authentication status from the internal store
        const isAuthenticated = useAuthStore.useIsAuthenticated()

        // Prevent getting data from initialized store rather than persisting store (which is localstorage) by waiting for the store to be hydrated
        const hasHydrated = useAuthStore.use_hasHydrated()
        if (!hasHydrated) return

        // Redirect to login page if user is not authenticated and trying to access admin page
        if (!isAuthenticated && pathname.startsWith('/admin')) {
            router.push('/auth/login')
            return
        }

        // Redirect to admin page if user is authenticated and trying to access login page
        if (isAuthenticated && pathname.startsWith('/auth')) {
            router.push('/admin')
            return
        }

        return <Component {...props} />
    }
}

export default isAuth