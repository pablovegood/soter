import React, { useState } from 'react';
import {
  IonPage,
  IonContent,
  IonButton,
  IonInput,
  IonLabel,
  IonToast,
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import './Global.css';
import './CrearGrupo.css';

const supabase = createClient(
  'https://vovrdtlrfiextltvpdpc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvdnJkdGxyZmlleHRsdHZwZHBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMzNTU5ODcsImV4cCI6MjA1ODkzMTk4N30.pBgPNcysidTyqpOP5900Szt4wF2It0i7SbJAUkN36NI'
);

const CrearGrupo: React.FC = () => {
  const history = useHistory();
  const [nombreGrupo, setNombreGrupo] = useState('');
  const [nicknameProtegido, setNicknameProtegido] = useState('');
  const [searchText, setSearchText] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<{ nickname: string }[]>([]);
  const [protectores, setProtectores] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState('');

  const handleSearchChange = async (e: CustomEvent) => {
    const text = e.detail.value;
    setSearchText(text);

    if (text.length > 2) {
      const { data } = await supabase
        .from('usuario')
        .select('nickname')
        .ilike('nickname', `%${text}%`);
      setFilteredUsers(data || []);
    } else {
      setFilteredUsers([]);
    }
  };

  const handleSelectUser = (user: { nickname: string }) => {
    if (!protectores.includes(user.nickname)) {
      setProtectores([...protectores, user.nickname]);
    }
    setSearchText('');
    setFilteredUsers([]);
  };

  const handleRemoveUser = (index: number) => {
    const nuevos = [...protectores];
    nuevos.splice(index, 1);
    setProtectores(nuevos);
  };

const handleCrearGrupo = async () => {
  if (!nombreGrupo || !nicknameProtegido) {
    setToastMessage('Por favor, indica el nombre del grupo y del protegido');
    return;
  }

  const usuario = JSON.parse(localStorage.getItem('user') || '{}');
  const nicknameCreador = usuario.nickname;

  const hoy = new Date().toISOString().split('T')[0]; // formato YYYY-MM-DD

  // Paso 1: Crear grupo con fecha
  const { data: grupoInsertado, error: errorGrupo } = await supabase
    .from('grupo')
    .insert([{ nombre: nombreGrupo, protegido: nicknameProtegido, fecha_creacion: hoy }])
    .select()
    .single();

  if (errorGrupo || !grupoInsertado) {
    console.error(errorGrupo);
    setToastMessage('Error al crear el grupo');
    return;
  }

  // Paso 2: Insertar miembros (solo tú)
  const miembros = [{
    grupo_id: grupoInsertado.id,
    usuario_nickname: nicknameCreador,
  }];

  const { error: errorMiembros } = await supabase
    .from('grupomiembro')
    .insert(miembros);

  if (errorMiembros) {
    console.error(errorMiembros);
    setToastMessage('Error al añadir miembros');
    return;
  }

  // Paso 3: Insertar admin
  const { error: errorAdmin } = await supabase
    .from('grupoadmin')
    .insert([{ grupo_id: grupoInsertado.id, usuario_nickname: nicknameCreador }]);

  if (errorAdmin) {
    console.error(errorAdmin);
    setToastMessage('Error al asignar administrador');
    return;
  }

  setToastMessage('Grupo creado con éxito');
  history.push('/groups');
};



  return (
<IonPage>
  <IonContent className="crear-grupo-content">
    <h2 className="edit-profile-title">CREAR GRUPO</h2>

    <div className="top-buttons">
      <IonButton
        style={{ backgroundColor: '#4CAF50', color: '#fff', fontWeight: 'bold', borderRadius: '8px' }}
        onClick={handleCrearGrupo}
      >
        CREAR GRUPO
      </IonButton>
      <IonButton
        style={{ backgroundColor: '#1e3a8a', color: '#fff', fontWeight: 'bold', borderRadius: '8px' }}
        onClick={() => history.push('/groups')}
      >
        CANCELAR
      </IonButton>
    </div>

    {/* CONTENEDOR CENTRALIZADO */}
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      <div className="input-group">
        <IonLabel>Nombre del grupo:</IonLabel>
        <IonInput placeholder="Nombre del grupo" value={nombreGrupo} onIonChange={(e) => setNombreGrupo(e.detail.value!)} />
      </div>

      <div className="input-group">
        <IonLabel>Nombre del protegido:</IonLabel>
        <IonInput placeholder="Nickname del protegido" value={nicknameProtegido} onIonChange={(e) => setNicknameProtegido(e.detail.value!)} />
      </div>

      <div className="input-group">
        <IonLabel>Busca miembros:</IonLabel>
        <IonInput placeholder="Busca miembros..." value={searchText} onIonInput={handleSearchChange} />
        {filteredUsers.length > 0 && (
          <div className="search-results">
            {filteredUsers.map((user) => (
              <div key={user.nickname} onClick={() => handleSelectUser(user)}>{user.nickname}</div>
            ))}
          </div>
        )}
      </div>

      <div className="selected-members">
        {protectores.map((nickname, index) => (
          <div className="chip" key={index}>
            {nickname}
            <span onClick={() => handleRemoveUser(index)}>×</span>
          </div>
        ))}
      </div>
    </div>

    <IonToast
      isOpen={!!toastMessage}
      message={toastMessage}
      duration={2000}
      onDidDismiss={() => setToastMessage('')}
    />
  </IonContent>
</IonPage>

  );
};

export default CrearGrupo;
