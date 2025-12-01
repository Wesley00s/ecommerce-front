import {PaymentType} from '../../enum/PaymentType';

export interface CreateOrderRequest {
   paymentType: PaymentType;
   cardToken?: string;
}
