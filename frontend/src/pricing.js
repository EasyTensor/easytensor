// Inspired by https://github.com/pricing
import React, { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import Grid from "@material-ui/core/Grid";
import { Elements, useStripe } from "@stripe/react-stripe-js";
import Paper from "@material-ui/core/Paper";
import { Button, Typography } from "@material-ui/core";
import { CheckCircle } from "@material-ui/icons";
import { green } from "@material-ui/core/colors";
import { CreateCheckoutSession, GetCustomerPortal } from "./api";
import { is_authenticated } from "./auth/helper";
import { useHistory, useLocation } from "react-router-dom";
import { useCookies } from "react-cookie";
import { CleanLink } from "./link";
import { IN_DEV } from "./constants";
export const STRIPE_API_KEY = `${process.env.REACT_APP_STRIPE_PUBLIC_KEY}`;

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const test_prices = {
  developer: "price_1IeLdaDCzbZohuMOP4JfP35M",
  business: "price_1IeLclDCzbZohuMOGit1TiJy",
};

const live_prices = {
  developer: "price_1IeLaKDCzbZohuMOZTlLShYc",
  business: "price_1IeLbwDCzbZohuMOOOwb7PgZ",
};
const prices = IN_DEV == "1" ? test_prices : live_prices;

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
    <Grid
      item
      xs={12}
      sm={6}
      md={4}
      style={{ display: "flex", justifyContent: "center" }}
    >
      <Paper
        elevation={12}
        style={{
          borderRadius: "1em",
          flexGrow: "1",
          flexBasis: "0",
          // padding: "1em",
          width: "20em",
          maxWidth: "20em",
        }}
      >
        <div
          style={{
            padding: "2em",
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
          <div style={{ paddingBottom: "1em" }}>
            <Button
              variant="contained"
              color="primary"
              style={{ width: "90%" }}
              onClick={handleOnClick}
            >
              {cta_text}
            </Button>
          </div>
        </div>
      </Paper>
    </Grid>
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
      CreateCheckoutSession(price_id).then((res) => {
        return stripe.redirectToCheckout({ sessionId: res.data.session_id });
      });
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
        "10 GB model archive",
        "1 GB preemptible model hosting",
        "Model deployment Status",
        "Share public models",
      ],
      cta_text: "Try, it out",
      price_id: "",
      button_handler: handle_try_free,
    },
    {
      name: "Developer",
      description: "For teams that need more power",
      price: "49.99",
      lines: [
        "50 GB model archive",
        "5 GB stable model hosting",
        "Private model repository",
        "Team based access control",
      ],
      cta_text: "Start Building",
      price_id: prices["developer"],
      button_handler: handle_pay,
    },
    {
      name: "Business",
      description: "Scale your product, comply with SLAs",
      price: "699.99",
      lines: [
        "1,000 GB model archive",
        "100 GB stable model hosting",
        "Long-term log storage",
        "Multi zone availability",
      ],
      cta_text: "Scale",
      price_id: prices["business"],
      button_handler: handle_pay,
    },
  ];

  const subscriptionColumns = subscriptions.map((plan) => (
    <PricingColumn {...plan} key={plan.name} key={plan.name} />
  ));

  return (
    <Elements stripe={stripePromise}>
      <Grid
        container
        direction="row"
        justify="center"
        alignItems="center"
        spacing={3}
      >
        {subscriptionColumns}
      </Grid>
    </Elements>
  );
}

function PaymentSuccessPage() {
  // query parsing inspired by https://reactrouter.com/web/example/query-parameters
  let query = useQuery();
  const session_id = query.get("session_id");
  const [customerPortal, setCustomerPortal] = useState("");
  useEffect(() => {
    if (session_id != undefined && session_id != "") {
      GetCustomerPortal(session_id).then((res) => {
        setCustomerPortal(res.data.url);
      });
    }
  }, []);
  return (
    <Grid container direction="row" justify="center" alignItems="flex-start">
      <Grid item xs={8}>
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
          <div>
            <Typography>Payment Received. Time to build!</Typography>
            <div style={{ paddingTop: "1em" }}>
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
      </Grid>
    </Grid>
  );
}

export { PricingPage, PaymentSuccessPage };
