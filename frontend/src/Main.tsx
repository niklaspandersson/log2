import React from "react";

import {Dashboard} from "./views/Dashboard";
import { ViewTypes } from "./views";

export const Main:React.FC = () => {
  const [view, setView] = React.useState<ViewTypes>('dashboard');
  
  function renderView(view:ViewTypes) {
    switch(view) {
      case 'dashboard':
        return <Dashboard navigate={id => setView(id)} />
      case 'entry':
        return <span>entry</span>
    }
  }

  return renderView(view);
}