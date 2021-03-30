import React, { useState, useEffect } from "react";
import { loadStripe } from '@stripe/stripe-js';
import Paper from "@material-ui/core/Paper";
import { Button, Typography } from "@material-ui/core";

const stripePromise = loadStripe(
    'pk_test_51IWi1NDCzbZohuMOijpMRzx7twohXqP9yTv2HIJMcUxLrYaPJEtM50aepVXa5qRP8UaSIhPzKsFMNACQsdUNfMYb00h7BfDUwz'
);

function PricingColumn({ name, description, price, lines, cta_text }) {
    const featureList = lines.map(line =>
        <div style={{ margin: "1em", textAlign: "left" }}>
            <Typography variant="body">{line}</Typography>
        </div>
    );
    return (
        <Paper
            elevation={12}
            style={{
                borderRadius: "1em",
                flexGrow: "1",
                flexBasis: "0",
                margin: "1em",
            }}
        >

            <div style={{ margin: "2em", textAlign: "-webkit-center" }}>
                <Typography style={{ margin: "0.5em" }} variant="h5">{name}</Typography>
                <Typography style={{ width: "75%" }} variant="subtitle1">{description}</Typography>
            </div>
            <div style={{ paddingTop: "2em", paddingBottom: "2em", backgroundColor: "rgba(255, 117, 13, 0.1)" }}>
                {featureList}
            </div>
            <div style={{ margin: "1em" }}>
                <div style={{ margin: "0.5em" }}>
                    <Typography style={{ verticalAlign: "super", display: "inline-block" }} variant="body">$</Typography>
                    <Typography style={{ verticalAlign: "super", display: "inline-block" }} variant="h4">{price}</Typography>
                    <Typography style={{ verticalAlign: "super", display: "inline-block" }} variant="body"> per month </Typography>
                </div>
                <Button variant="contained" color="primary" style={{ width: "90%" }}>
                    {cta_text}
                </Button>
            </div>
        </Paper>
    )
}

function PricingPage() {
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
            cta_text: "Try it out"
        },
        {
            name: "Development",
            description: "For teams that need more power",
            price: "29.99",
            lines: [
                "50GB model archive",
                "5GB stable model hosting",
                "Model deployment Status",
                "Share public models",
            ],
            cta_text: "Start Building"
        },
        {
            name: "Production",
            description: "Scale your product, comply with SLAs",
            price: "299.99",
            lines: [
                "1,000GB model archive",
                "50GB stable model hosting",
                "Long-term log storage",
                "Share public models",
            ],
            cta_text: "Scale!"
        }
    ];

    const subscriptionColumns = subscriptions.map(plan =>
        <PricingColumn {...plan} key={plan.name} />
    );

    return (
        <div style={{ textAlign: "center", width: "80%", display: "flex" }}>
            {subscriptionColumns}
        </div >
    )
};

export { PricingPage };