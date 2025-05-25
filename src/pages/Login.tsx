import React, { useState } from 'react';
import {
  IonPage,
  IonContent,
  IonInput,
  IonButton,
  IonToast,
  IonIcon,
  IonAlert
} from '@ionic/react';
import { lockClosedOutline, mailOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import './Login.css';
import './Global.css';
import logo from './images/logo-soter.png';
import fondo from './images/fondo_soter.png';

const supabase = createClient(
  'https://vovrdtlrfiextltvpdpc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvdnJkdGxyZmlleHRsdHZwZHBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMzNTU5ODcsImV4cCI6MjA1ODkzMTk4N30.pBgPNcysidTyqpOP5900Szt4wF2It0i7SbJAUkN36NI'
);

const LoginPage: React.FC = () => {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryMessage, setRecoveryMessage] = useState('');
  const history = useHistory();

  const handleLogin = async () => {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: correo,
      password
    });

    if (authError || !authData?.user) {
      if (authError?.message?.toLowerCase().includes('email not confirmed')) {
        setError('Debes confirmar tu correo antes de iniciar sesión.');
      } else {
        setError('Correo o contraseña incorrectos');
      }
      console.error('Auth error:', authError);
      return;
    }

    const { data: usuarioData, error: usuarioError } = await supabase
      .from('usuario')
      .select('*')
      .eq('auth_id', authData.user.id)
      .single();

    if (usuarioError || !usuarioData) {
      console.error('Usuario no encontrado:', usuarioError);
      setError('Usuario no encontrado o sin permisos');
      return;
    }

    localStorage.setItem('user', JSON.stringify(usuarioData));
    history.replace('/home');
  };

  const handlePasswordRecovery = async () => {
    const { error } = await supabase.auth.resetPasswordForEmail(recoveryEmail, {
      redirectTo: 'soter://reset'
    });

    setRecoveryMessage(
      error
        ? 'No se pudo enviar el correo. Asegúrate de que el email es correcto.'
        : 'Te hemos enviado un correo para restablecer tu contraseña.'
    );
  };

  return (
    <IonPage>
      <IonContent
        fullscreen
        className="login-professional-content"
        style={{
          backgroundImage: `url(${fondo})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="login-logo-wrapper">
          <img src={logo} alt="Logo Soter" className="login-logo" />
        </div>

        <h2 className="login-title">INICIAR SESIÓN</h2>
        <p className="login-subtitle">Introduzca su correo y contraseña.</p>

        <div className="login-input-wrapper">
          <IonIcon icon={mailOutline} className="login-icon" />
          <IonInput
            type="email"
            value={correo}
            onIonInput={(e) => setCorreo((e.target as HTMLInputElement).value)}
            placeholder="Correo electrónico"
            className="styled-input"
          />
        </div>

        <div className="login-input-wrapper">
          <IonIcon icon={lockClosedOutline} className="login-icon" />
          <IonInput
            type="password"
            value={password}
            onIonInput={(e) => setPassword((e.target as HTMLInputElement).value)}
            placeholder="Contraseña"
            className="styled-input"
          />
        </div>

        <p className="login-register-text forgot-password-link">
          ¿Olvidó su contraseña?
          <span onClick={() => setShowAlert(true)}> Recuperar contraseña </span>
        </p>

        <IonButton expand="block" className="login-submit-button" onClick={handleLogin}>
          INICIAR SESIÓN
        </IonButton>

        <p className="login-register-text">
          ¿No tiene cuenta? <span onClick={() => history.push('/register')}>Regístrese aquí</span>
        </p>

        <IonToast
          isOpen={!!error}
          message={error}
          duration={3000}
          color="danger"
          onDidDismiss={() => setError('')}
        />

        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header="Recuperar contraseña"
          inputs={[
            {
              name: 'email',
              type: 'email',
              placeholder: 'Introduce tu correo',
              value: recoveryEmail
            }
          ]}
          buttons={[
            { text: 'Cancelar', role: 'cancel' },
            {
              text: 'Enviar',
              handler: async (alertData) => {
                setRecoveryEmail(alertData.email);
                await handlePasswordRecovery();
              }
            }
          ]}
          message={recoveryMessage}
        />
      </IonContent>
    </IonPage>
  );
};

export default LoginPage;
