export interface EstCostComponent {
  name: string
  unit: string
  hourlyQuantity: string
  monthlyQuantity: string
  price: string
  hourlyCost: string
  monthlyCost: string
  priceNotFound: boolean
}

export interface EstCostData {
  components: EstCostComponent[]
  total_in_month: string
}
