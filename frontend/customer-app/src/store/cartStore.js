import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { cartService } from '../services/cartService'
import SecurityUtils from '../utils/security'

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      total: 0,
      itemCount: 0,
      isLoading: false,

      addItem: async (product, quantity = 1) => {
        if (!product || !product.id || !product.price) {
          throw new Error('Invalid product data')
        }
        
        if (quantity < 1 || quantity > 99) {
          throw new Error('Invalid quantity')
        }
        
        set({ isLoading: true })
        try {
          const response = await cartService.addItem({
            productId: SecurityUtils.sanitizeInput(product.id),
            quantity: Math.max(1, Math.min(99, quantity)),
            price: product.price
          })
          
          const existingItem = get().items.find(item => item.productId === product.id)
          
          if (existingItem) {
            set(state => ({
              items: state.items.map(item =>
                item.productId === product.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
              isLoading: false
            }))
          } else {
            set(state => ({
              items: [...state.items, {
                productId: product.id,
                product,
                quantity,
                price: product.price
              }],
              isLoading: false
            }))
          }
          
          get().calculateTotals()
          return { success: true }
        } catch (error) {
          set({ isLoading: false })
          return { success: false, error: error.message }
        }
      },

      removeItem: async (productId) => {
        set({ isLoading: true })
        try {
          await cartService.removeItem(productId)
          
          set(state => ({
            items: state.items.filter(item => item.productId !== productId),
            isLoading: false
          }))
          
          get().calculateTotals()
          return { success: true }
        } catch (error) {
          set({ isLoading: false })
          return { success: false, error: error.message }
        }
      },

      updateQuantity: async (productId, quantity) => {
        if (quantity <= 0) {
          return get().removeItem(productId)
        }
        
        set({ isLoading: true })
        try {
          await cartService.updateQuantity(productId, quantity)
          
          set(state => ({
            items: state.items.map(item =>
              item.productId === productId
                ? { ...item, quantity }
                : item
            ),
            isLoading: false
          }))
          
          get().calculateTotals()
          return { success: true }
        } catch (error) {
          set({ isLoading: false })
          return { success: false, error: error.message }
        }
      },

      clearCart: async () => {
        set({ isLoading: true })
        try {
          await cartService.clearCart()
          
          set({
            items: [],
            total: 0,
            itemCount: 0,
            isLoading: false
          })
          
          return { success: true }
        } catch (error) {
          set({ isLoading: false })
          return { success: false, error: error.message }
        }
      },

      calculateTotals: () => {
        const items = get().items
        const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
        
        set({ total, itemCount })
      },

      syncWithServer: async () => {
        try {
          const response = await cartService.getCart()
          const { items } = response.data
          
          set({ items })
          get().calculateTotals()
        } catch (error) {
          console.error('Failed to sync cart:', error)
        }
      }
    }),
    {
      name: 'peraxis-cart',
      partialize: (state) => ({
        items: state.items,
        total: state.total,
        itemCount: state.itemCount
      })
    }
  )
)