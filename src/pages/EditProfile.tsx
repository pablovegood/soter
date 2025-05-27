import React, { useEffect, useState } from 'react';
import {
  IonPage,
  IonContent,
  IonInput,
  IonButton,
  IonToast,
  IonDatetime,
  IonModal,
  IonIcon
} from '@ionic/react';
import { createClient } from '@supabase/supabase-js';
import './Global.css';
import './EditProfile.css';
import 'ionicons/icons';
import {
  personOutline,
  mailOutline,
  calendarOutline,
  homeOutline,
  callOutline,
  lockClosedOutline,
  peopleOutline
} from 'ionicons/icons';


const supabase = createClient(
  'https://vovrdtlrfiextltvpdpc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvdnJkdGxyZmlleHRsdHZwZHBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMzNTU5ODcsImV4cCI6MjA1ODkzMTk4N30.pBgPNcysidTyqpOP5900Szt4wF2It0i7SbJAUkN36NI'
);

interface Usuario {
  nickname?: string;
  nombre?: string;
  apellidos?: string;
  correo?: string;
  domicilio?: string;
  telefono?: string;
  foto?: string;
  fechadenacimiento?: string;
}

const EditProfilePage: React.FC = () => {
  const [user, setUser] = useState<Usuario | null>(null);
  const [originalUser, setOriginalUser] = useState<Usuario | null>(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [noChangesToast, setNoChangesToast] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      window.location.href = '/login';
    } else {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);
      setOriginalUser(parsed);
    }
  }, []);

  const handleChange = (field: string, value: string) => {
    setUser((prev) => prev ? { ...prev, [field]: value } : prev);
  };

  const hasChanges = () => JSON.stringify(user) !== JSON.stringify(originalUser);

  const handleSave = async () => {
    if (!hasChanges()) {
      setNoChangesToast(true);
      return;
    }

    const { error } = await supabase
      .from('usuario')
      .update({
        nombre: user?.nombre || null,
        apellidos: user?.apellidos || null,
        correo: user?.correo || null,
        domicilio: user?.domicilio || null,
        telefono: user?.telefono || null,
        foto: user?.foto || null,
        fechadenacimiento: user?.fechadenacimiento || null
      })
      .eq('nickname', user?.nickname || '');

    if (!error) {
      localStorage.setItem('user', JSON.stringify(user));
      setSuccess(true);
      setTimeout(() => window.location.href = '/profile', 1500);
    } else {
      setError(error.message);
    }
  };

const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file || !user?.nickname) {
    setError('Archivo no válido o usuario sin nickname.');
    return;
  }

  // 1. Asegurar autenticación
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData?.user?.id) {
    setError('Debes estar autenticado para subir imágenes.');
    console.error('❌ Error de autenticación:', authError);
    return;
  }

  // 2. Subir archivo a Supabase Storage
  const filePath = `${user.nickname}/${file.name}`;
  const { error: uploadError } = await supabase.storage
    .from('fotos-perfil')
    .upload(filePath, file, { upsert: true });

  if (uploadError) {
    setError('Error al subir la imagen: ' + uploadError.message);
    console.error('❌ Error al subir:', uploadError);
    return;
  }

  // 3. Obtener URL pública del archivo
  const { data: publicData } = supabase.storage
    .from('fotos-perfil')
    .getPublicUrl(filePath);

  const publicUrl = publicData?.publicUrl;
  if (!publicUrl) {
    setError('No se pudo obtener la URL pública de la imagen.');
    return;
  }

  console.log('✅ Imagen subida con éxito:', publicUrl);

  // 4. Guardar la URL en la tabla `usuario`
  const { error: dbError } = await supabase
    .from('usuario')
    .update({ foto: publicUrl })
    .eq('nickname', user.nickname);

  if (dbError) {
    setError('Error al guardar la imagen en el perfil: ' + dbError.message);
    console.error('❌ Error al actualizar foto en DB:', dbError);
    return;
  }

  // 5. Actualizar el estado local y localStorage
  const updatedUser = { ...user, foto: publicUrl };
  setUser(updatedUser);
  localStorage.setItem('user', JSON.stringify(updatedUser));
  console.log('✅ URL de la foto guardada correctamente en la tabla usuario.');
};


  return (
    <IonPage>
      <IonContent className="ion-padding">
              <div className="page-top-spacer"></div>
        <h2 className="edit-profile-title">MODIFICAR DATOS PERSONALES</h2>

        <div className="edit-profile-container">
          <input className="edit-profile-file" type="file" accept="image/*" onChange={handleFileUpload} />
          {user?.foto && <img src={user.foto} alt="Foto de perfil" className="edit-profile-image-preview" />}

          <div className="edit-profile-field">
            <IonIcon icon={personOutline} />
            <IonInput placeholder="Nombre" value={user?.nombre} onIonChange={(e) => handleChange('nombre', e.detail.value!)} />
          </div>

          <div className="edit-profile-field">
            <IonIcon icon={personOutline} />
            <IonInput placeholder="Apellidos" value={user?.apellidos} onIonChange={(e) => handleChange('apellidos', e.detail.value!)} />
          </div>

          <div className="edit-profile-field">
            <IonIcon icon={mailOutline} />
            <IonInput placeholder="Correo" value={user?.correo} onIonChange={(e) => handleChange('correo', e.detail.value!)} />
          </div>

          <div className="edit-profile-field">
            <IonIcon icon={calendarOutline} />
            <IonInput
              placeholder="Fecha de nacimiento"
              value={user?.fechadenacimiento?.split('T')[0] || ''}
              readonly
              onClick={() => setShowCalendar(true)}
            />
          </div>

          <IonModal isOpen={showCalendar} onDidDismiss={() => setShowCalendar(false)} className="custom-calendar-modal">
            <IonDatetime
              presentation="date"
              value={user?.fechadenacimiento}
              onIonChange={(e) => {
                handleChange('fechadenacimiento', Array.isArray(e.detail.value) ? e.detail.value[0] : e.detail.value!);
                setShowCalendar(false);
              }}
              showDefaultButtons={true}
              preferWheel={false}
            />
          </IonModal>

          <div className="edit-profile-field">
            <IonIcon icon={homeOutline}/>
            <IonInput placeholder="Domicilio" value={user?.domicilio} onIonChange={(e) => handleChange('domicilio', e.detail.value!)} />
          </div>

<div className="edit-profile-field">
  <IonIcon icon={callOutline} />
  <div className="phone-input-wrapper">
    <select
      className="prefix-dropdown"
      value={user?.telefono?.slice(0, 3) || '+34'}
      onChange={(e) => {
        const prefix = e.target.value;
        const number = user?.telefono?.slice(3) || '';
        handleChange('telefono', prefix + number);
      }}
    >
      <option value="+34">🇪🇸 +34</option>
      <option value="+39">🇮🇹 +39</option>
      <option value="+33">🇫🇷 +33</option>
      <option value="+49">🇩🇪 +49</option>
      <option value="+44">🇬🇧 +44</option>
      <option value="+1">🇺🇸 +1</option>
    </select>
    <IonInput
      className="number"
      placeholder="Número"
      value={user?.telefono?.slice(3) || ''}
      onIonChange={(e) => {
        const number = e.detail.value!;
        const prefix = user?.telefono?.slice(0, 3) || '+34';
        handleChange('telefono', prefix + number);
      }}
    />
  </div>
</div>


          <IonButton expand="block" className="soter-green-button" onClick={handleSave} disabled={!hasChanges()}>
            GUARDAR CAMBIOS
          </IonButton>

          <IonButton expand="block" className="cancel-button" routerLink="/profile">
            CANCELAR
          </IonButton>

          <IonToast isOpen={success} message="Perfil actualizado correctamente" duration={1500} color="success" />
          <IonToast isOpen={!!error} message={error} duration={2000} color="danger" onDidDismiss={() => setError('')} />
          <IonToast isOpen={noChangesToast} message="No has realizado ningún cambio" duration={2000} color="warning" onDidDismiss={() => setNoChangesToast(false)} />
        </div>
      </IonContent>
    </IonPage>
  );
};

export default EditProfilePage;