'use client'

import { useState, useEffect, useRef } from 'react'
import { useAccount, useWaitForTransactionReceipt } from 'wagmi'
import { useQueryClient } from '@tanstack/react-query'
import { parseEther } from 'viem'
import { useRouter } from 'next/navigation'
import { useCreateCampaign } from '@/hooks/useFactory'
import { uploadImageToIPFS } from '@/lib/ipfs'

export default function CreateCampaign() {
  const { isConnected } = useAccount()
  const router = useRouter()
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [goal, setGoal] = useState('')
  const [duration, setDuration] = useState('30')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  const { createCampaign, isPending, hash, error: contractError } = useCreateCampaign()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  useEffect(() => {
    if (isSuccess) {
      queryClient.invalidateQueries()
      router.push('/')
    }
  }, [isSuccess, queryClient, router])

  if (!isConnected) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 mb-4">请先连接 MetaMask 钱包</p>
        <a href="/" className="text-indigo-600 hover:underline">返回首页</a>
      </div>
    )
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('图片大小不能超过 5MB')
      return
    }
    setImageFile(file)
    setUploadError('')
    setImagePreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!goal || !duration || !title || !description) return

    let imageUrl = ''
    if (imageFile) {
      setUploading(true)
      setUploadError('')
      try {
        imageUrl = await uploadImageToIPFS(imageFile)
      } catch (err: any) {
        setUploadError(err.message || '图片上传失败')
        setUploading(false)
        return
      }
      setUploading(false)
    }

    createCampaign(parseEther(goal), BigInt(duration), title, description, imageUrl)
  }

  const isProcessing = isPending || isConfirming || uploading

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">发起众筹</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 图片上传 */}
        <div>
          <label className="block text-sm font-medium mb-2">项目封面图</label>
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors hover:border-indigo-400 ${
              imagePreview ? 'border-indigo-300' : 'border-gray-300'
            }`}
          >
            {imagePreview ? (
              <img src={imagePreview} alt="预览" className="max-h-48 mx-auto rounded-lg" />
            ) : (
              <div className="text-gray-400">
                <p className="text-3xl mb-2">📷</p>
                <p className="text-sm">点击上传封面图片（可选，最大 5MB）</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>
          {imagePreview && (
            <button
              type="button"
              onClick={() => { setImageFile(null); setImagePreview(''); }}
              className="text-xs text-red-500 mt-1 hover:underline"
            >
              移除图片
            </button>
          )}
          {uploadError && <p className="text-red-500 text-sm mt-1">{uploadError}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">众筹标题</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="给你的众筹起个响亮的名字"
            disabled={isProcessing}
            required
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">项目描述</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="详细描述你的项目..."
            disabled={isProcessing}
            required
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">目标金额 (ETH)</label>
            <input
              type="number"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="0.1"
              step="0.01"
              min="0.01"
              disabled={isProcessing}
              required
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">筹款周期 (天)</label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="30"
              min="1"
              max="365"
              disabled={isProcessing}
              required
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            />
          </div>
        </div>

        {hash && (
          <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg break-all">
            交易Hash: {hash}
          </div>
        )}

        {contractError && (
          <div className="text-sm text-red-500 bg-red-50 p-3 rounded-lg">
            {(contractError as any).shortMessage || contractError.message}
          </div>
        )}

        <button
          type="submit"
          disabled={isProcessing || !title || !description || !goal || !duration}
          className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? '上传图片中...' : isPending ? '钱包确认中...' : isConfirming ? '交易确认中...' : '创建众筹（需钱包确认）'}
        </button>
      </form>
    </div>
  )
}
