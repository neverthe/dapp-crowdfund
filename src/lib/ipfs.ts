const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT

/**
 * 上传图片到 Pinata IPFS
 * @returns IPFS CID (e.g. QmX...)
 */
export async function uploadImageToIPFS(file: File): Promise<string> {
  if (!PINATA_JWT) {
    throw new Error('NEXT_PUBLIC_PINATA_JWT 未配置，请先在 Pinata 后台获取 JWT')
  }

  const formData = new FormData()
  formData.append('file', file)

  const res = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${PINATA_JWT}`,
    },
    body: formData,
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`IPFS 上传失败: ${res.status} ${err}`)
  }

  const data = await res.json()
  return data.IpfsHash as string
}

export function ipfsUrl(cid: string): string {
  if (!cid) return ''
  if (cid.startsWith('http')) return cid
  return `https://gateway.pinata.cloud/ipfs/${cid.replace('ipfs://', '')}`
}
