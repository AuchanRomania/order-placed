import React from 'react'

import OrderTotal from '../OrderTotal'
import { orderGroupQuery as oneDeliverySimple } from '../mocks/oneDeliverySimple'
import { renderWithOrder } from '../utils/testUtils'

const typedOrderGroup = oneDeliverySimple.orderGroup as OrderGroup

test('renders shipping breakdown details for a matched delivery tier', () => {
  const { queryByText } = renderWithOrder(
    typedOrderGroup,
    <OrderTotal />
  )

  expect(queryByText(/^Shipping$/i)).toBeTruthy()
  expect(queryByText(/Extra weight fee/i)).toBeTruthy()
})

test('does not render shipping breakdown details when no tier matches', () => {
  const unmatchedOrderGroup = {
    ...typedOrderGroup,
    orders: typedOrderGroup.orders.map((order, index) => {
      if (index > 0) {
        return order
      }

      return {
        ...order,
        totals: order.totals.map((total) => {
          if (total.id !== 'Items') {
            return total
          }

          return {
            ...total,
            value: 999,
          }
        }),
      }
    }),
  } as OrderGroup

  const { queryByText } = renderWithOrder(unmatchedOrderGroup, <OrderTotal />)

  expect(queryByText(/Extra weight fee/i)).toBeFalsy()
})