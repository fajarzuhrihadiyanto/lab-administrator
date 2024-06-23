import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createSelectorHooks } from 'auto-zustand-selectors-hook'

const useAuthStoreBase = create(
    persist(
        set => ({
            // For internal state purposes
            _hasHydrated: false,
            setHasHydrated: (state) => set({ _hasHydrated: state }),

            user: null,
            isAuthenticated: null,
            token: null,
            login: ({ user, token }) => {
                set({ isAuthenticated: true, user, token })
            },
            logout: () => {
                set({ isAuthenticated: false, user: null, token: null})
                window.location.pathname = '/auth/login'
            },
        }),
        {
            name: 'auth-storage',

            // Set has hydrated to true after rehydrating the store
            onRehydrateStorage: () => (state) => {
                state.setHasHydrated(true)
            }
        }
    )
  
)

const useAuthStore = createSelectorHooks(useAuthStoreBase)

export default useAuthStore