'use client'

import { useAccount } from 'wagmi'

export default function StakePage() {
  const { isConnected } = useAccount()

  if (!isConnected) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 mb-4">请先连接 MetaMask 钱包</p>
        <a href="/" className="text-indigo-600 hover:underline">返回首页</a>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Staking 挖矿</h1>

      <div className="bg-white rounded-xl shadow-sm border p-6 space-y-6">
        {/* 概览 */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-4 bg-indigo-50 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">APR</p>
            <p className="text-2xl font-bold text-indigo-600">10%</p>
          </div>
          <div className="p-4 bg-indigo-50 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">TVL</p>
            <p className="text-2xl font-bold text-indigo-600">0 CROWD</p>
          </div>
          <div className="p-4 bg-indigo-50 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">我的质押</p>
            <p className="text-2xl font-bold text-indigo-600">0 CROWD</p>
          </div>
        </div>

        {/* 操作区 */}
        <div className="border-t pt-6">
          <div className="flex gap-4">
            <input
              type="number"
              placeholder="质押数量"
              className="flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">
              质押
            </button>
          </div>

          <p className="text-sm text-gray-400 mt-3">
            质押 CROWD 代币，按 APR 10% 赚取实时收益。随时可提取。
          </p>
        </div>
      </div>
    </div>
  )
}
