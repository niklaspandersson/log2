import React from 'react';
import './App.scss';

import { UserContext } from "./hooks/useUser";
import { authService } from "./services";

import { UserInfo } from './models/user';

import {Welcome} from './views/Welcome';
import {Main} from './Main';

function App() {
  const [user, setUser] = React.useState<UserInfo>();
  //const [state, dispatcher] = useBooks();

  React.useEffect(() => {
    authService.refresh()
      .then(user => {
        setUser(user);
      })
      .then(console.log)
      .catch(res => console.log("not logged in", res));
  }, []);

  return (
    <UserContext.Provider value={user}>
      <div className="app">
          {user 
            ? <Main />
            : <Welcome onLogin={user => setUser(user)} onLoginFail={err => console.warn(err)} />
          }
      </div>
    </UserContext.Provider>);
}

export default App;
