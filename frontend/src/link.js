import React from "react";
import { Link } from "react-router-dom";

const CleanLink = React.forwardRef(
  (props, ref) => (
    <Link ref={ref} {...props} style={{ textDecoration: "none", color: "inherit" }}>
      {props.children}
    </Link>
  )
);

export { CleanLink };
