import React, { useEffect, useState } from 'react';
import {
  IonPage,
  IonContent,
  IonAlert,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel
} from '@ionic/react';
import { personCircle, people, home, documentText, medical } from 'ionicons/icons';
import { Geolocation } from '@capacitor/geolocation'; // ⚠️ NUEVO IMPORT
import './Home.css';
import botonSos from './images/boton-sos.png';

const HomePage: React.FC = () => {
  const [showAlert, setShowAlert] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      window.location.href = '/login';
    }

    const fetchLocation = async () => {
      try {
        const permission = await Geolocation.checkPermissions();
        if (permission.location === 'denied') {
          await Geolocation.requestPermissions();
        }

        const position = await Geolocation.getCurrentPosition();
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      } catch (error) {
        console.error('Error obteniendo ubicación:', error);
      }
    };

    fetchLocation();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <IonPage>
      <IonContent className="home-content">
        <div className="page-top-spacer"></div>
        <h1 className="sos-title">MENÚ PRINCIPAL</h1>

        <div
          className="sos-button-wrapper"
          onClick={() => (window.location.href = '/emergency')}
        >
          <img src={botonSos} alt="Botón SOS" className="sos-button-img" />
        </div>
          <div className="page-top-spacer"></div>
        <div className="map-container">
          {location ? (
            <iframe
              title="Ubicación"
              src={`https://maps.google.com/maps?q=${location.lat},${location.lng}&z=15&output=embed`}
              width="80%"
              height="250"
              style={{ border: 0, borderRadius: '15px' }}
              allowFullScreen
              loading="lazy"
            ></iframe>
          ) : (
            <p style={{ color: '#2F435B', fontWeight: 'bold', textAlign: 'center' }}>
              Cargando ubicación...
            </p>
          )}
        </div>
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

      <IonAlert
        isOpen={showAlert}
        onDidDismiss={() => setShowAlert(false)}
        header="¿Cerrar sesión?"
        message="Tendrás que introducir tus credenciales de nuevo para entrar en tu cuenta."
        buttons={[
          {
            text: 'No',
            role: 'cancel',
            cssClass: 'alert-button-cancel'
          },
          {
            text: 'Sí',
            handler: handleLogout
          }
        ]}
      />
    </IonPage>
  );
};

export default HomePage;
