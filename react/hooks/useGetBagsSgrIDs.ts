import { useEffect, useState } from "react"

const useGetBagsSgrIDs = () => {
  const [bagsIDs, setBagsIDs] = useState([''])
  const [sgrIDs, setSgrIDs] = useState([''])

  useEffect(() => {
    const getSettings = () => {
      fetch('/_v/private/api/cart-bags-manager/app-settings').then(async (data) => {
        const settingsResult = await data?.json()
        const settingsData = settingsResult?.data

        const bagsIdList: string[] = Object.values(settingsData?.bagsSettings)
        const sgrIdList = [...settingsData?.sgrSettings?.aluminumCanProducts?.skuIds, ...settingsData?.sgrSettings?.plasticBottleProducts?.skuIds, ...settingsData?.sgrSettings?.glassBottleProducts?.skuIds]

        setBagsIDs(bagsIdList)
        setSgrIDs(sgrIdList)
      })
    }

    getSettings()
  }, [])

  return { bagsIDs, sgrIDs }
}

export default useGetBagsSgrIDs
