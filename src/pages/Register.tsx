import React, { useState } from 'react';
import {
  IonPage,
  IonContent,
  IonInput,
  IonButton,
  IonToast,
  IonSelect,
  IonSelectOption,
  IonIcon,
  IonDatetime,
  IonModal
} from '@ionic/react';
import {
  personOutline,
  mailOutline,
  calendarOutline,
  homeOutline,
  callOutline,
  lockClosedOutline
} from 'ionicons/icons';
import { createClient } from '@supabase/supabase-js';
import './Register.css';
import './Global.css';
import logo from './images/logo-soter.png';

const supabase = createClient(
  'https://vovrdtlrfiextltvpdpc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvdnJkdGxyZmlleHRsdHZwZHBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMzNTU5ODcsImV4cCI6MjA1ODkzMTk4N30.pBgPNcysidTyqpOP5900Szt4wF2It0i7SbJAUkN36NI'
);

const RegisterPage: React.FC = () => {
  const [nickname, setNickname] = useState('');
  const [nombre, setNombre] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [correo, setCorreo] = useState('');
  const [fecha, setFecha] = useState('');
  const [domicilio, setDomicilio] = useState('');
  const [prefijo, setPrefijo] = useState('+34');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!nickname || !nombre || !apellidos || !password || !repeatPassword || !fecha || !domicilio || !telefono || !correo) {
      setError('Rellena todos los campos obligatorios');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (password !== repeatPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (!/^[0-9]+$/.test(telefono)) {
      setError('El número de teléfono debe contener solo dígitos');
      return;
    }

    const fechaNacimiento = new Date(fecha);
    const hoy = new Date();
    if (fechaNacimiento > hoy) {
      setError('La fecha de nacimiento no puede ser futura');
      return;
    }

    setLoading(true);

    const telefonoCompleto = `${prefijo} ${telefono}`;

    const { data: authUser, error: authError } = await supabase.auth.signUp({
      email: correo,
      password
    });

    if (authError || !authUser.user) {
      console.error('Supabase Auth Error:', authError);
      setError('Error al registrar el usuario: ' + (authError?.message || 'Error desconocido'));
      setLoading(false);
      return;
    }

    const { error: dbError } = await supabase.from('usuario').insert([{
      nickname,
      nombre,
      apellidos,
      correo,
      fechadenacimiento: fecha,
      domicilio,
      telefono: telefonoCompleto,
      auth_id: authUser.user.id
    }]);

    if (dbError) {
      console.error('Error al insertar en usuario:', dbError);
      setError('Error al guardar en base de datos: ' + dbError.message);
    } else {
      setSuccess(true);
      setTimeout(() => (window.location.href = '/login'), 1500);
    }

    setLoading(false);
  };

  return (
    <IonPage>
      <IonContent>
        <div className="login-card">
          <div className="login-logo-wrapper">
            <img src={logo} alt="Logo Soter" className="login-logo" />
          </div>
          <h2 className="login-title">Crear cuenta</h2>

          {/* Campos de entrada */}
          {[{ label: 'Nombre de usuario*', value: nickname, setter: setNickname, icon: personOutline },
            { label: 'Nombre*', value: nombre, setter: setNombre, icon: personOutline },
            { label: 'Apellidos*', value: apellidos, setter: setApellidos, icon: personOutline },
            { label: 'Correo*', value: correo, setter: setCorreo, icon: mailOutline },
            { label: 'Domicilio*', value: domicilio, setter: setDomicilio, icon: homeOutline },
            { label: 'Contraseña*', value: password, setter: setPassword, icon: lockClosedOutline, type: 'password' },
            { label: 'Repetir contraseña*', value: repeatPassword, setter: setRepeatPassword, icon: lockClosedOutline, type: 'password' }]
            .map(({ label, value, setter, icon, type }, i) => (
              <div className="register-input-wrapper" key={i}>
                <IonIcon icon={icon} className="register-icon" />
                <IonInput className="register-styled-input" placeholder={label} value={value} type={type as import('@ionic/core').TextFieldTypes || 'text'} onIonChange={e => setter(e.detail.value!)} />
              </div>
            ))}

          <div className="register-input-wrapper" onClick={() => setShowCalendar(true)}>
            <IonIcon icon={calendarOutline} className="register-icon" />
            <IonInput className="register-styled-input" placeholder="Fecha de nacimiento*" value={fecha} readonly />
          </div>

          <IonModal isOpen={showCalendar} onDidDismiss={() => setShowCalendar(false)} className="custom-calendar-modal">
            <IonDatetime
              presentation="date"
              value={fecha}
              onIonChange={(e) => {
                setFecha(e.detail.value!.toString());
                setShowCalendar(false);
              }}
            />
          </IonModal>

          <div className="register-input-wrapper" style={{ flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <IonIcon icon={callOutline} className="register-icon" />
              <IonSelect interface="popover" mode="md" value={prefijo} onIonChange={e => setPrefijo(e.detail.value!)} className="register-prefijo">
                <IonSelectOption value="+34">🇪🇸 +34</IonSelectOption>
                <IonSelectOption value="+33">🇫🇷 +33</IonSelectOption>
                <IonSelectOption value="+39">🇮🇹 +39</IonSelectOption>
                <IonSelectOption value="+49">🇩🇪 +49</IonSelectOption>
                <IonSelectOption value="+44">🇬🇧 +44</IonSelectOption>
              </IonSelect>
              <IonInput className="register-styled-input" placeholder="Teléfono*" value={telefono} onIonChange={(e) => setTelefono(e.detail.value!)} type="tel" />
            </div>
          </div>

          <IonButton expand="block" onClick={handleRegister} className="login-submit-button" disabled={loading}>
            {loading ? 'Registrando...' : 'Registrarse'}
          </IonButton>

          <IonButton expand="block" routerLink="/login" className="return-button">
            Volver a iniciar sesión
          </IonButton>

          <IonToast isOpen={!!error} message={error} duration={3000} color="danger" onDidDismiss={() => setError('')} />
          <IonToast isOpen={success} message="Usuario registrado con éxito" duration={2000} color="success" />
        </div>
      </IonContent>
    </IonPage>
  );
};

export default RegisterPage;