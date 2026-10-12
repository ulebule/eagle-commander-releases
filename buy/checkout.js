// Paddle Billing's overlay checkout (D108).
//
// The token is Paddle's client-side token: it is made for web pages and is
// no secret. The secret half of the integration — the webhook secret and the
// API key — lives only in the Worker.
const PADDLE = {
  // "sandbox" until Paddle has approved the live account, then "production"
  // with the live token and price.
  environment: "sandbox",
  token: "test_ebeddba031173d96febc9bd5668",
  priceId: "pri_01m4qmc01cy3q4b1q6z41109ra",
  unitPrice: 9.99,
};

(() => {
  const form = document.getElementById("order");
  const quantity = document.getElementById("quantity");
  const total = document.getElementById("total");
  const failed = document.getElementById("failed");

  const euros = new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" });

  function count() {
    const n = Math.round(Number(quantity.value));
    return Number.isFinite(n) ? Math.min(100, Math.max(1, n)) : 1;
  }

  function showTotal() {
    const n = count();
    total.textContent = n === 1
      ? euros.format(PADDLE.unitPrice)
      : `${n} × ${euros.format(PADDLE.unitPrice)} = ${euros.format(n * PADDLE.unitPrice)}`;
  }

  quantity.addEventListener("input", showTotal);
  showTotal();

  if (typeof window.Paddle === "undefined") {
    failed.hidden = false;
    form.querySelector("button").disabled = true;
    return;
  }

  if (PADDLE.environment === "sandbox") Paddle.Environment.set("sandbox");
  Paddle.Initialize({ token: PADDLE.token });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    Paddle.Checkout.open({
      items: [{ priceId: PADDLE.priceId, quantity: count() }],
      settings: {
        displayMode: "overlay",
        successUrl: new URL("/thanks/", window.location.href).href,
      },
    });
  });
})();
