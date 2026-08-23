import "server-only";
import Iyzipay from "iyzipay";

export function getIyzico() {
  const apiKey = process.env.IYZICO_API_KEY;
  const secretKey = process.env.IYZICO_SECRET_KEY;
  const uri = process.env.IYZICO_BASE_URL ?? "https://sandbox-api.iyzipay.com";

  if (!apiKey || !secretKey) {
    return null;
  }

  return new Iyzipay({ apiKey, secretKey, uri });
}

export function iyzicoCall<TRequest, TResult>(
  fn: (data: TRequest, callback: (err: Error, result: TResult) => void) => void,
  data: TRequest
) {
  return new Promise<TResult>((resolve, reject) => {
    fn(data, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}

// @types/iyzipay incorrectly types checkoutFormInitialize.create as requiring
// installments/paymentCard (copied from the 3DS request type). The hosted
// checkout form never takes card data — the buyer enters it on iyzico's page.
export type CheckoutFormInitializeData = Omit<
  Iyzipay.ThreeDSInitializePaymentRequestData,
  "installments" | "paymentCard"
>;

export function checkoutFormInitializeCall(
  iyzico: Iyzipay,
  data: CheckoutFormInitializeData
) {
  return iyzicoCall<CheckoutFormInitializeData, Iyzipay.CheckoutFormInitialResult>(
    iyzico.checkoutFormInitialize.create.bind(iyzico.checkoutFormInitialize) as unknown as (
      data: CheckoutFormInitializeData,
      callback: (err: Error, result: Iyzipay.CheckoutFormInitialResult) => void
    ) => void,
    data
  );
}

export { Iyzipay };
