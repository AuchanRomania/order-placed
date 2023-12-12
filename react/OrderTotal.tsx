import React, { FC, useEffect, useState } from 'react'
import { FormattedMessage } from 'react-intl'
import TranslateTotalizer from 'vtex.totalizer-translator/TranslateTotalizer'
import { applyModifiers, useCssHandles } from 'vtex.css-handles'
import { useIntl, defineMessages } from 'react-intl'

import FormattedPrice from './components/FormattedPrice'
import { useOrder } from './components/OrderContext'
import { getTotals } from './utils'
import TaxInfo from './TaxInfo'
import { Tooltip } from 'vtex.styleguide'
import InfoTooltip from './Icons/InfoTooltip'

const ITEMS_TOTAL_ID = 'Items'
const BAGS_ID = 'Bags'
const SGR_ID = 'SGR'

const CSS_HANDLES = [
  'totalListWrapper',
  'totalList',
  'totalListItem',
  'totalListItemLabel',
  'totalListItemValue',
  'bagsIcon',
] as const

const messages = defineMessages({
  bagsTax: { id: 'store/summary.bagsTax' },
  tooltipContent: { id: 'store/summary.tooltipContent' },
  sgrTax: { id: 'store/summary.sgrTax' }
})

const OrderTotal: FC = () => {
  const [bagsIDs, setBagsIDs] = useState([''])
  const [sgrIDs, setSgrIDs] = useState([''])
  const { items, totals, value: totalValue } = useOrder()
  const { formatMessage } = useIntl()

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

  const handles = useCssHandles(CSS_HANDLES)
  const numItems = items.reduce((acc, item) => {
    if (item.parentItemIndex === null && !bagsIDs?.includes(item.id) && !sgrIDs?.includes(item.id)) {
      return acc + item.quantity
    }
    return acc
  }, 0)

  const bagsTotal = items.reduce((acc, item) => {
    if (bagsIDs?.includes(item.id)) {
      return acc + item.price * item.quantity
    }
    return acc
  }, 0)

  const sgrTotal = items.reduce((acc, item) => {
    if (sgrIDs?.includes(item.id)) {
      return acc + item.price * item.quantity
    }
    return acc
  }, 0)

  const itemsWithoutBagsOrSgr = totals?.map(total => {
    if (total.id === ITEMS_TOTAL_ID) {
      return {
        ...total,
        value: total.value - bagsTotal - sgrTotal
      }
    }
    return total
  })

  const [newTotals, taxes] = getTotals(itemsWithoutBagsOrSgr)

  if (sgrTotal > 0) {
    const sgrTotalObject = {
      id: SGR_ID,
      name: formatMessage(messages.sgrTax),
      value: sgrTotal
    }

    const taxPosition = newTotals.findIndex((total) => total?.id === 'Tax')
    const indexToPush = taxPosition > 0 ? taxPosition : 0

    newTotals.splice(indexToPush, 0, sgrTotalObject)
  }

  if (bagsTotal > 0) {
    newTotals.push({
      id: BAGS_ID,
      name: formatMessage(messages.bagsTax),
      value: bagsTotal
    })
  }

  console.log("🚀 ~ file: OrderTotal.tsx:88 ~ newTotals:", newTotals)

  return (
    <div className={`${handles.totalListWrapper} flex-l justify-end w-100`}>
      <ul
        className={`${handles.totalList} list pa0 mt8 w-100 w-60-l c-muted-1`}
      >
        {newTotals.map((total, i) => {
          if (total.value === 0) {
            return null
          }

          return (
            <li
              className={`${applyModifiers(
                handles.totalListItem,
                total.id
              )} pv3 flex justify-between items-center`}
              key={`${total.id}_${i}`}
            >
              <span className={`${handles.totalListItemLabel} flex`}>
                <TranslateTotalizer totalizer={total} />
                {(total.id === BAGS_ID) &&
                  <div className={`${handles.bagsIcon} ml2`}>
                    <Tooltip label={formatMessage(messages.tooltipContent)}>
                      <span><InfoTooltip /></span>
                    </Tooltip>
                  </div>
                }
                {total.id === 'Items' && ` (${numItems})`}
                {total.id === 'Tax' && taxes.length > 0 && (
                  <div className="ml2 mt1">
                    <TaxInfo taxesTotals={taxes} />
                  </div>
                )}
              </span>
              <span className={`${handles.totalListItemValue} c-on-base`}>
                <FormattedPrice value={total.value} />
              </span>
            </li>
          )
        })}
        <li
          className={`${handles.totalListItem} pv3 flex justify-between items-center c-on-base t-heading-2-ns t-heading-3`}
        >
          <strong className={`${handles.totalListItemLabel}`}>
            <FormattedMessage id="store/order.totals.total" />
          </strong>
          <strong className={`${handles.totalListItemValue}`}>
            <FormattedPrice value={totalValue} />
          </strong>
        </li>
      </ul>
    </div>
  )
}

export default OrderTotal
