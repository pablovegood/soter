import { Redirect, Route } from 'react-router-dom';
import {
  IonApp,
  IonRouterOutlet,
  IonTabs,
  setupIonicReact
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';

import LoginPage from './pages/Login';
import HomePage from './pages/Home';
import RegisterPage from './pages/Register';
import ProfilePage from './pages/Profile';
import EditProfilePage from './pages/EditProfile';
import GroupsPage from './pages/Groups';
import CrearGrupoPage from './pages/CrearGrupo';
import GroupDetailsPage from './pages/GroupDetails';
import HealthcarePage from './pages/Healthcare';
import PrivateChat from './pages/PrivateChat';
import EnviarEmergencia from './pages/EnviarEmergencia';
import EliminarGrupos from './pages/EliminarGrupos';
import AddMembersPage from './pages/AddMembers';
import AccidentsPage from './pages/Accidents';
import AccidentDetails from './pages/AccidentDetails';
import SessionChecker from './pages/SessionChecker';
import RemoveMembers from './pages/RemoveMembers';
import AddAdmins from './pages/AddAdmins';
import GroupChat from './pages/GroupChat';

import { App as CapacitorApp } from '@capacitor/app';

CapacitorApp.addListener('appUrlOpen', async ({ url }) => {
  if (url?.startsWith('soter://reset')) {
    const params = new URL(url).searchParams;
    const accessToken = params.get('access_token');
    const type = params.get('type');

    if (accessToken && type === 'recovery') {
      window.location.href = `/cambiar-password?access_token=${accessToken}`;
    }
  }
});


import '@ionic/react/css/core.css';

import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';


import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

import '@ionic/react/css/palettes/dark.system.css';


import './theme/variables.css';


import './App.css';

setupIonicReact();

const isAuthenticated = () => {
  const user = localStorage.getItem('user');
  return user !== null;
};

const App: React.FC = () => (
  <IonApp>
    <div className="background-wrapper">
      <IonReactRouter>
        <IonTabs>
          <IonRouterOutlet>

            {/* Pública */}
            
            <Route exact path="/login" component={LoginPage} />
            <Route exact path="/register" component={RegisterPage} />
            <Route exact path="/" component={SessionChecker} />

            {/* Privadas */}
            {isAuthenticated() ? (
              <>
                <Route exact path="/home" component={HomePage} />
                <Route exact path="/profile" component={ProfilePage} />
                <Route exact path="/edit-profile" component={EditProfilePage} />
                <Route exact path="/groups" component={GroupsPage} />
                <Route exact path="/crear-grupo" component={CrearGrupoPage} />
                <Route exact path="/group-details/:id" component={GroupDetailsPage} />
                <Route exact path="/group-details/:id/chat/:nickname" component={PrivateChat} />
                <Route exact path="/emergency" component={EnviarEmergencia} />
                <Route exact path="/eliminar-grupos" component={EliminarGrupos} />
                <Route path="/add-members/:id" component={AddMembersPage} />
                <Route exact path="/accidents" component={AccidentsPage} />
                <Route exact path="/accident/:id" component={AccidentDetails} />
                <Route exact path="/healthcare" component={HealthcarePage} />
                <Route path="/remove-members/:id" component={RemoveMembers} exact />
                <Route path="/add-admins/:id" component={AddAdmins} exact />
                <Route path="/group-chat/:id" component={GroupChat} />


              </>
            ) : (
              <>    
                <Route path="*">
                  <Redirect to="/" />
                </Route>
              </>
            )}

          </IonRouterOutlet>
        </IonTabs>
      </IonReactRouter>
    </div>
  </IonApp>
);

export default App;
