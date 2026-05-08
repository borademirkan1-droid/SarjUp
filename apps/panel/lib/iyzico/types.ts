export interface IyzicoPaymentCard {
  cardHolderName: string
  cardNumber: string
  expireYear: string
  expireMonth: string
  cvc: string
  registerCard: 0 | 1
}

export interface IyzicoBuyer {
  id: string
  name: string
  surname: string
  email: string
  identityNumber: string
  phone: string
  registrationAddress: string
  city: string
  country: string
}

export interface IyzicoAddress {
  contactName: string
  city: string
  country: string
  address: string
}

export interface IyzicoBasketItem {
  id: string
  name: string
  category1: string
  itemType: 'VIRTUAL' | 'PHYSICAL'
  price: string
}

export interface IyzicoPaymentAuthRequest {
  locale: 'tr' | 'en'
  conversationId: string
  price: string
  paidPrice: string
  currency: 'TRY' | 'USD' | 'EUR'
  installment: number
  paymentChannel: 'MAIL_ORDER' | 'WEB' | 'MOBILE'
  paymentGroup: 'PRODUCT' | 'LISTING' | 'SUBSCRIPTION'
  paymentCard: IyzicoPaymentCard
  buyer: IyzicoBuyer
  shippingAddress: IyzicoAddress
  billingAddress: IyzicoAddress
  basketItems: IyzicoBasketItem[]
}

export interface IyzicoPaymentAuthResponse {
  status: 'success' | 'failure'
  locale: string
  systemTime: number
  conversationId: string
  errorCode?: string
  errorMessage?: string
  errorGroup?: string
  paymentId?: string
  paymentTransactionId?: string
  authCode?: string
  hostReference?: string
  phase?: string
}
