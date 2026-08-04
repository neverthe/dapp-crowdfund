'use client'

import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { config } from '@/lib/wagmi'

export function Providers({ children }: { children: React.ReactNode }) {
  // 只在首次渲染创建
  const [queryClient] = useState(() => new QueryClient())
  // 防止 SSR（服务端渲染）和客户端渲染不一致的问题。
  //SSR 搜索引擎可以抓取到内容 → 有利于 SEO。首屏加载速度快，用户立即看到内容 。渐进式增强，能看到基本内容。
  // 无 'use client'，默认 SSR：layout.tsx
  // 有 'use client'，初始 HTML 结构（静态部分）以及mounted=false 时 
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  if (!mounted) return <div className="min-h-screen flex items-center justify-center">加载中...</div>

  return (
    // (钱包状态)   (Wagmi 内部使用 React Query 来管理所有链上数据的缓存)
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}
