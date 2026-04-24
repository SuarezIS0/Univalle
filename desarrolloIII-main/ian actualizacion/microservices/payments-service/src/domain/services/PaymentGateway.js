/**
 * Puerto: cualquier pasarela (Stripe, PayU, Simulada) cumple este contrato.
 * SOLID-O: para agregar una nueva pasarela, creamos otro adapter en infrastructure/
 * sin tocar casos de uso.
 */
class PaymentGateway {
  async charge(_request) { throw new Error("not implemented"); }
}
module.exports = { PaymentGateway };
