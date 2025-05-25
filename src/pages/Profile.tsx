import React, { useEffect, useState } from 'react';
import {
  IonPage,
  IonContent,
  IonButton,
  IonAlert,
  IonImg,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel
} from '@ionic/react';
import { createClient } from '@supabase/supabase-js';
import { useHistory } from 'react-router-dom';
import { personCircle, people, home, documentText, medical } from 'ionicons/icons';
import './Profile.css';
import placeholder from './images/placeholder.jpg';
import fondo from './images/fondo_soter.png';

const supabase = createClient(
  'https://vovrdtlrfiextltvpdpc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvdnJkdGxyZmlleHRsdHZwZHBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMzNTU5ODcsImV4cCI6MjA1ODkzMTk4N30.pBgPNcysidTyqpOP5900Szt4wF2It0i7SbJAUkN36NI'
);

interface User {
  nickname: string;
  nombre: string;
  apellidos: string;
  correo?: string;
  fechadenacimiento: string;
  telefono: string;
  domicilio: string;
  foto?: string;
}

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [edad, setEdad] = useState<number | null>(null);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showLogoutAlert, setShowLogoutAlert] = useState(false); // NUEVO
  const history = useHistory();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      window.location.href = '/login';
    } else {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);

      if (parsedUser.fechadenacimiento) {
        const fechaNac = new Date(parsedUser.fechadenacimiento);
        const hoy = new Date();
        let age = hoy.getFullYear() - fechaNac.getFullYear();
        const m = hoy.getMonth() - fechaNac.getMonth();
        if (m < 0 || (m === 0 && hoy.getDate() < fechaNac.getDate())) {
          age--;
        }
        setEdad(age);
      }
    }
  }, []);

  const handleDeleteAccount = async () => {
    if (!user?.nickname) return;

    const fotoPath = user.foto
      ? user.foto.split('/storage/v1/object/public/fotos-perfil/')[1]
      : null;

    if (fotoPath) {
      const { error: storageError } = await supabase
        .storage
        .from('fotos-perfil')
        .remove([fotoPath]);

      if (storageError) {
        console.error('Error al eliminar la imagen:', storageError.message);
      }
    }

    const { error } = await supabase
      .from('usuario')
      .delete()
      .eq('nickname', user.nickname);

    if (!error) {
      localStorage.removeItem('user');
      window.location.href = '/register';
    } else {
      alert('Error al borrar la cuenta. Intenta de nuevo.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    history.push('/login');
  };

  return (
    <IonPage>
      <IonContent
        className="profile-container"
        style={{
          backgroundImage: `url(${fondo})`,
          backgroundSize: 'cover',
          backgroundPosition: 'down',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <h2 className="profile-title">DATOS PERSONALES</h2>

        <div className="profile-dni-card">
          <IonImg
            src={user?.foto || placeholder}
            alt="Foto de perfil"
            className="profile-photo"
          />
          <div className="profile-info">
            <h3>{user?.nombre} {user?.apellidos}</h3>
            <p><strong>Usuario:</strong> {user?.nickname}</p>
            <p><strong>Edad:</strong> {edad ?? 'Desconocida'}</p>
            <p><strong>Teléfono:</strong> {user?.telefono}</p>
            <p><strong>Correo:</strong> {user?.correo || 'No especificado'}</p>
            <p><strong>Domicilio:</strong> {user?.domicilio}</p>
          </div>
        </div>

        <div className="profile-buttons">
          <IonButton expand="block" className="soter-green-button" routerLink="/edit-profile">
            Editar Perfil
          </IonButton>

          <IonButton className="soter-yellow-button" onClick={() => setShowLogoutAlert(true)}>
            Cerrar Sesión
          </IonButton>

          <IonButton className="delete-button" onClick={() => setShowDeleteAlert(true)}>
            Borrar Cuenta
          </IonButton>
        </div>

        {/* Alerta eliminar cuenta */}
        <IonAlert
          isOpen={showDeleteAlert}
          onDidDismiss={() => setShowDeleteAlert(false)}
          header="¿Estás seguro?"
          message="Si borras tu cuenta, perderás todos tus datos y no podrás recuperarlos. Esta acción es irreversible."
          buttons={[
            {
              text: 'Cancelar',
              role: 'cancel',
            },
            {
              text: 'Sí, borrar',
              handler: handleDeleteAccount,
            },
          ]}
        />

        {/* Alerta cerrar sesión */}
        <IonAlert
          isOpen={showLogoutAlert}
          onDidDismiss={() => setShowLogoutAlert(false)}
          header="¿Está seguro de querer cerrar sesión?"
          message="Tendrá que volver a introducir sus credenciales."
          buttons={[
            {
              text: 'Cancelar',
              role: 'cancel'
            },
            {
              text: 'Sí, cerrar sesión',
              handler: handleLogout
            }
          ]}
        />
      </IonContent>

      <IonTabBar slot="bottom">
        <IonTabButton tab="profile" href="/profile">
          <IonIcon icon={personCircle} />
          <IonLabel>Perfil</IonLabel>
        </IonTabButton>
        <IonTabButton tab="groups" href="/groups">
          <IonIcon icon={people} />
          <IonLabel>Grupos</IonLabel>
        </IonTabButton>
        <IonTabButton tab="home" href="/home">
          <IonIcon icon={home} />
          <IonLabel>Inicio</IonLabel>
        </IonTabButton>
        <IonTabButton tab="accidents" href="/accidents">
          <IonIcon icon={documentText} />
          <IonLabel>Accidentes</IonLabel>
        </IonTabButton>
        <IonTabButton tab="healthcare" href="/healthcare">
          <IonIcon icon={medical} />
          <IonLabel>Salud</IonLabel>
        </IonTabButton>
      </IonTabBar>
    </IonPage>
  );
};

export default ProfilePage;