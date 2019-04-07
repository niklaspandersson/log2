import React from "react";
import ReactDOM from "react-dom";
import Application from "./Application";
import * as moment from "moment";
import "../sass/main.scss";

document.addEventListener("DOMContentLoaded", () => {

    moment.locale("sv");
    ReactDOM.render(<Application />, document.getElementById("app-container"));
});
