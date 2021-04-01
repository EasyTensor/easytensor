// Inspired by https://github.com/pricing
import React, { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  CardElement,
  Elements,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import Paper from "@material-ui/core/Paper";
import { Button, Typography } from "@material-ui/core";
import { CheckCircle } from "@material-ui/icons";
import { green } from "@material-ui/core/colors";
import {
  CreateCheckoutSession,
  GetCheckoutSession,
  GetCustomerPortal,
} from "./api";
import { is_authenticated } from "./auth/helper";
import { useHistory, useLocation } from "react-router-dom";
import { useCookies } from "react-cookie";
import { CleanLink } from "./link";
export const STRIPE_API_KEY = `${process.env.REACT_APP_STRIPE_PUBLIC_KEY}`;

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const is_testing = true;
const test_prices = [
  "price_1IXsO9DCzbZohuMOL3T4bbq8",
  "price_1IalnGDCzbZohuMOkizlp1SH",
];

const live_prices = [
  "price_1IbCkzDCzbZohuMONNgCAmjT",
  "price_1IbCkuDCzbZohuMOZgawp0Sa",
];
const prices = is_testing ? test_prices : live_prices;

function PricingColumn({
  name,
  description,
  price,
  lines,
  cta_text,
  price_id,
  button_handler,
}) {
  const stripe = useStripe();
  const featureList = lines.map((line) => (
    <div key={line} style={{ margin: "1em", textAlign: "left" }}>
      <Typography variant="body1">{line}</Typography>
    </div>
  ));
  function handleOnClick() {
    button_handler(price_id, stripe);
  }

  return (
    <Paper
      elevation={12}
      style={{
        borderRadius: "1em",
        flexGrow: "1",
        flexBasis: "0",
        margin: "1em",
        width: "20em",
        maxWidth: "20em",
      }}
    >
      <div
        style={{
          margin: "2em",
          textAlign: "-webkit-center",
          minHeight: "10em",
        }}
      >
        <Typography style={{ margin: "0.5em" }} variant="h5">
          {name}
        </Typography>
        <Typography style={{ width: "75%" }} variant="subtitle1">
          {description}
        </Typography>
      </div>
      <div
        style={{
          minHeight: "20em",
          paddingTop: "2em",
          paddingBottom: "2em",
          backgroundColor: "rgba(255, 117, 13, 0.1)",
        }}
      >
        {featureList}
      </div>
      <div style={{ margin: "1em", textAlign: "center" }}>
        <div style={{ margin: "0.5em" }}>
          <Typography
            style={{ verticalAlign: "super", display: "inline-block" }}
            variant="body1"
          >
            $
          </Typography>
          <Typography
            style={{ verticalAlign: "super", display: "inline-block" }}
            variant="h4"
          >
            {price}
          </Typography>
          <Typography
            style={{ verticalAlign: "super", display: "inline-block" }}
            variant="body1"
          >
            {" "}
            per month{" "}
          </Typography>
        </div>
        <Button
          variant="contained"
          color="primary"
          style={{ width: "90%" }}
          onClick={handleOnClick}
        >
          {cta_text}
        </Button>
      </div>
    </Paper>
  );
}

function PricingPage() {
  const stripePromise = loadStripe(STRIPE_API_KEY);
  const [cookies] = useCookies();
  const history = useHistory();

  // Free plan
  function handle_try_free(_, _b) {
    if (is_authenticated(cookies)) {
      history.push("/");
    } else {
      history.push("/register");
    }
  }

  // Paid plans
  function handle_pay(price_id, stripe) {
    if (is_authenticated(cookies)) {
      CreateCheckoutSession(price_id)
        .then((res) => {
          return stripe.redirectToCheckout({ sessionId: res.data.session_id });
        })
        .then((res) => console.log(res));
    } else {
      alert(
        "You need to register before subscribing to a plan.\nRedirecting now!"
      );
      history.push("/register");
    }
  }

  // Make sure to call `loadStripe` outside of a component’s render to avoid
  // recreating the `Stripe` object on every render.

  const subscriptions = [
    {
      name: "Free",
      description: "The basics to get started quickly",
      price: "0",
      lines: [
        "10GB model archive",
        "1GB preemptible model hosting",
        "Model deployment Status",
        "Share public models",
      ],
      cta_text: "Try, it out",
      price_id: "",
      button_handler: handle_try_free,
    },
    {
      name: "Development",
      description: "For teams that need more power",
      price: "29.99",
      lines: [
        "50GB model archive",
        "5GB stable model hosting",
        "Private model repository",
        "Team based access control",
      ],
      cta_text: "Start Building",
      price_id: prices[0],
      button_handler: handle_pay,
    },
    {
      name: "Production",
      description: "Scale your product, comply with SLAs",
      price: "499.99",
      lines: [
        "1,000GB model archive",
        "50GB stable model hosting",
        "Long-term log storage",
        "Multi zone availability",
      ],
      cta_text: "Scale",
      price_id: prices[1],
      button_handler: handle_pay,
    },
  ];

  const subscriptionColumns = subscriptions.map((plan) => (
    <PricingColumn {...plan} key={plan.name} key={plan.name} />
  ));

  return (
    <Elements stripe={stripePromise}>
      <div style={{ width: "80%", display: "flex", justifyContent: "center" }}>
        {subscriptionColumns}
      </div>
    </Elements>
  );
}

function PaymentSuccessPage() {
  // query parsing inspired by https://reactrouter.com/web/example/query-parameters
  let query = useQuery();
  const session_id = query.get("session_id");
  const [customerPortal, setCustomerPortal] = useState("");
  console.log(session_id);
  useEffect(() => {
    if (session_id != undefined && session_id != "") {
      GetCheckoutSession(session_id).then((res) => console.log(res));
      GetCustomerPortal(session_id).then((res) => {
        console.log("customer portal url:", res.data.url);
        setCustomerPortal(res.data.url);
      });
    }
  }, []);
  return (
    <div
      style={{
        width: "80%",
      }}
    >
      <Paper
        elevation={12}
        style={{
          borderRadius: "1em",
          flexGrow: "1",
          flexBasis: "0",
          margin: "1em",
          textAlign: "center",
        }}
      >
        <div style={{ padding: "2em" }}>
          <CheckCircle style={{ color: green[700], fontSize: 40 }} />
        </div>
        <div style={{ paddingBottom: "2em" }}>
          <Typography>Payment Received. Time to build!</Typography>
          <div style={{ padding: "1em" }}>
            <CleanLink to="/">
              <Button color="primary" variant="contained">
                Add Model
              </Button>
            </CleanLink>
          </div>
          <div style={{ padding: "1em" }}>
            <a
              href={customerPortal}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <Button color="primary" variant="contained">
                Customer Portal
              </Button>
            </a>
          </div>
        </div>
      </Paper>
    </div>
  );
}

export { PricingPage, PaymentSuccessPage };
