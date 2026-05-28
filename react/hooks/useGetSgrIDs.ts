import { useEffect, useState } from "react"

const useGetBagsSgrIDs = () => {
  const [sgrIDs, setSgrIDs] = useState<string[]>()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const getSettings = () => {
      if (typeof fetch !== 'function') {
        if (isMounted) {
          setIsLoading(false)
        }
        return
      }

      fetch('/auchan/v1/cart-manager/app-settings').then(async (data) => {
        const settingsResult = await data?.json()
        const settingsData = settingsResult?.data


        const sgrSettings = settingsData?.sgrSettings
        let sgrIdList: string[] = []

        Object.keys(sgrSettings ?? {}).forEach((key) => {
          const categorySkuIds = sgrSettings[key]?.skuIds
          if (categorySkuIds?.length) {
            sgrIdList = sgrIdList.concat(categorySkuIds)
          }
        })


        if (isMounted) {
          setSgrIDs(sgrIdList)
          setIsLoading(false)
        }

      }).catch((e) => {
        console.error('fetch app setting error:', e)
        if (isMounted) {
          setIsLoading(false)
        }
      })
    }

    getSettings()

    return () => {
      isMounted = false
    }
  }, [])

  return { sgrIDs, isLoading }
}

export default useGetBagsSgrIDs
