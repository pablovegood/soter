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
import CambiarPassword from './pages/CambiarPassword';
// import AccidentsPage from './pages/Accidents';

import { App as CapacitorApp } from '@capacitor/app';

CapacitorApp.addListener('appUrlOpen', async ({ url }) => {
  if (url?.startsWith('soter://reset')) {
    const params = new URL(url).searchParams;
    const accessToken = params.get('access_token');
    const type = params.get('type');

    if (accessToken && type === 'recovery') {
      // Redirige dentro de tu app a la pantalla para cambiar la contraseña
      window.location.href = `/cambiar-password?access_token=${accessToken}`;
    }
  }
});

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';

/* Custom styles */
import './App.css';

setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <div className="background-wrapper">
      <IonReactRouter>
        <IonTabs>
          <IonRouterOutlet>
            <Route exact path="/login" component={LoginPage} />
            <Route exact path="/home" component={HomePage} />
            <Route exact path="/register" component={RegisterPage} />
            <Route exact path="/profile" component={ProfilePage} />
            <Route exact path="/edit-profile" component={EditProfilePage} />
            <Route exact path="/groups" component={GroupsPage} />
            <Route exact path="/crear-grupo" component={CrearGrupoPage} />
            <Route path="/emergency" component={EnviarEmergencia} exact />
            <Route path="/cambiar-password" component={CambiarPassword} exact />
            <Route exact path="/group-details/:id" component={GroupDetailsPage} />
            <Route path="/eliminar-grupos" component={EliminarGrupos} exact />
            <Route path="/chat/:usuario" component={PrivateChat} exact />
             <Route exact path="/healthcare" component={HealthcarePage} /> 
            <Route exact path="/">
              <Redirect to="/login" />
            </Route>
          </IonRouterOutlet>
        </IonTabs>
      </IonReactRouter>
    </div>
  </IonApp>
);

export default App;
