import React, { useEffect, useState } from 'react';
import {
  IonPage,
  IonContent,
  IonInput,
  IonButton,
  IonToast
} from '@ionic/react';
import { useLocation, useHistory } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://vovrdtlrfiextltvpdpc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvdnJkdGxyZmlleHRsdHZwZHBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMzNTU5ODcsImV4cCI6MjA1ODkzMTk4N30.pBgPNcysidTyqpOP5900Szt4wF2It0i7SbJAUkN36NI'
);

const CambiarPassword: React.FC = () => {
  const location = useLocation();
  const history = useHistory();
  const [newPassword, setNewPassword] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [tokenReady, setTokenReady] = useState(false);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const access_token = queryParams.get('access_token');

    if (!access_token) {
      setError('Token de acceso inválido o faltante');
      return;
    }

    const establecerSesion = async () => {
      const { error } = await supabase.auth.setSession({
        access_token,
        refresh_token: ''
      });

      if (error) {
        setError('No se pudo establecer la sesión');
      } else {
        setTokenReady(true);
      }
    };

    establecerSesion();
  }, [location.search]);

  const handleUpdatePassword = async () => {
    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      setError('Error al cambiar la contraseña: ' + error.message);
    } else {
      setSuccess(true);
      setTimeout(() => history.replace('/login'), 2000);
    }
  };

  return (
    <IonPage>
      <IonContent className="ion-padding login-professional-content">
        <div className="login-card">
          <h2 className="login-title">Cambiar contraseña</h2>

          {!tokenReady ? (
            <p>Verificando token...</p>
          ) : (
            <>
              <IonInput
                type="password"
                placeholder="Nueva contraseña"
                value={newPassword}
                onIonChange={(e) => setNewPassword(e.detail.value!)}
                className="styled-input"
              />
              <IonButton
                expand="block"
                onClick={handleUpdatePassword}
                style={{
                  backgroundColor: '#f59e0b',
                  color: '#fff',
                  fontWeight: 'bold',
                  borderRadius: '10px',
                  marginTop: '20px'
                }}
              >
                Guardar nueva contraseña
              </IonButton>
            </>
          )}

          <IonToast
            isOpen={success}
            message="Contraseña actualizada correctamente"
            duration={2000}
            color="success"
          />
          <IonToast
            isOpen={!!error}
            message={error}
            duration={3000}
            color="danger"
            onDidDismiss={() => setError('')}
          />
        </div>
      </IonContent>
    </IonPage>
  );
};

export default CambiarPassword;
