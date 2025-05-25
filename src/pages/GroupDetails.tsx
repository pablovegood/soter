import React, { useEffect, useState } from 'react';
import { IonPage, IonContent, IonButton, IonToast } from '@ionic/react';
import { useParams, useHistory } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import './Global.css';
import './GroupDetails.css';
import botonChatGrupal from './images/textBox.png';

const supabase = createClient(
  'https://vovrdtlrfiextltvpdpc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvdnJkdGxyZmlleHRsdHZwZHBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMzNTU5ODcsImV4cCI6MjA1ODkzMTk4N30.pBgPNcysidTyqpOP5900Szt4wF2It0i7SbJAUkN36NI'
);

interface Usuario {
  nickname: string;
  nombre: string;
  apellidos: string;
  telefono: string;
  domicilio?: string;
  correo?: string;
  fechadenacimiento?: string;
  foto?: string;
}

const GroupDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [grupoNombre, setGrupoNombre] = useState('');
  const [protegido, setProtegido] = useState<Usuario | null>(null);
  const [protectores, setProtectores] = useState<Usuario[]>([]);
  const [error, setError] = useState('');
  const [currentUserNickname, setCurrentUserNickname] = useState('');
  const history = useHistory();

  useEffect(() => {
    const fetchGroupDetails = async () => {
      try {
        const { data: grupo } = await supabase.from('grupo').select('*').eq('id', id).single();
        if (!grupo) return;
        setGrupoNombre(grupo.nombre);

        const { data: protegidoData } = await supabase.from('usuario').select('*').eq('nickname', grupo.protegido).single();
        setProtegido(protegidoData);

        const { data: miembros } = await supabase.from('grupomiembro').select('usuario_nickname').eq('grupo_id', id);
        type Miembro = { usuario_nickname: string };
        const protectorNicknames = (miembros as Miembro[] | null)?.map((m) => m.usuario_nickname) || [];
        const { data: protectoresData } = await supabase.from('usuario').select('*').in('nickname', protectorNicknames);
        setProtectores(protectoresData || []);

        await supabase.from('grupoadmin').select('*').eq('grupo_id', id).eq('usuario_nickname', grupo.protegido).single();
      } catch {
        setError('Error al cargar el grupo');
      }
    };

    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      history.push('/login');
    } else {
      const parsed = JSON.parse(storedUser);
      setCurrentUserNickname(parsed.nickname);
      fetchGroupDetails();
    }
  }, [history, id]);

  const calcularEdad = (fechaNacimiento: string) => {
    const nacimiento = new Date(fechaNacimiento);
    const hoy = new Date();
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
    return edad;
  };

  const handleChat = (nickname: string) => {
    history.push(`/chat/${nickname}`);
  };

  return (
    <IonPage>
      <IonContent className="group-details-page">
        <h2 className="group-title">{grupoNombre}</h2>

        <div className="group-buttons">
          <IonButton className="delete-button" routerLink="/groups">VOLVER</IonButton>
          <IonButton className="delete-button">CREAR ADMINS</IonButton>
          <IonButton className="delete-button">AÑADIR MIEMBROS</IonButton>
          <IonButton className="delete-button">ELIMINAR MIEMBROS</IonButton>
       <img src={botonChatGrupal} alt="Botón chat grupal" className="chat-group-button-img" 
  onClick={() => history.push(`/chat-grupal/${id}`)}
/>

        </div>

        {protegido && (
          <>
            <h3 className="role-title">Protegido:</h3>
            <div className={`user-card ${protegido.nickname !== currentUserNickname ? 'clickable' : ''}`} onClick={() => protegido.nickname !== currentUserNickname && handleChat(protegido.nickname)}>
              {protegido.foto && <img src={protegido.foto} alt="" className="user-image" />}
              <div className="user-info">
                <p className="name">{protegido.nombre} {protegido.apellidos}</p>
                <p>Teléfono: {protegido.telefono}</p>
                <p>{protegido.fechadenacimiento ? `${calcularEdad(protegido.fechadenacimiento)} años` : 'Edad desconocida'}</p>
              </div>
            </div>
          </>
        )}

       {protectores && protectores.length > 0 && (
  <>
    <h3 className="role-title">Protectores:</h3>
    {protectores.map((p) => (
      <div key={p.nickname} className={`user-card ${p.nickname !== currentUserNickname ? 'clickable' : ''}`} onClick={() => p.nickname !== currentUserNickname && handleChat(p.nickname)}>
        {p.foto && <img src={p.foto} alt="" className="user-image" />}
        <div className="user-info">
          <p className="name">{p.nombre} {p.apellidos}</p>
          <p>Teléfono: {p.telefono}</p>
          <p>{p.fechadenacimiento ? `${calcularEdad(p.fechadenacimiento)} años` : 'Edad desconocida'}</p>
        </div>
      </div>
    ))}
  </>
)}

        <IonToast
          isOpen={!!error}
          message={error}
          duration={2500}
          color="danger"
          onDidDismiss={() => setError('')}
        />
      </IonContent>
    </IonPage>
  );
};

export default GroupDetailsPage;
