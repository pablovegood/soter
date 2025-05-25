import React, { useEffect, useState } from 'react';
import {
  IonPage,
  IonContent,
  IonInput,
  IonButton,
  IonToast,
  IonLabel
} from '@ionic/react';
import { useParams, useHistory } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import './Global.css';
import './AddMembers.css';

const supabase = createClient(
  'https://vovrdtlrfiextltvpdpc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvdnJkdGxyZmlleHRsdHZwZHBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMzNTU5ODcsImV4cCI6MjA1ODkzMTk4N30.pBgPNcysidTyqpOP5900Szt4wF2It0i7SbJAUkN36NI'
);

const AddMembersPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [grupoNombre, setGrupoNombre] = useState('');
  const [search, setSearch] = useState('');
  const [usuarios, setUsuarios] = useState<{ nickname: string }[]>([]);
  const [seleccionados, setSeleccionados] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState('');
  const history = useHistory();

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchGrupoNombre = async () => {
      const { data } = await supabase.from('grupo').select('nombre').eq('id', id).single();
      if (data) setGrupoNombre(data.nombre);
    };
    fetchGrupoNombre();
  }, [id]);

  useEffect(() => {
    const fetchUsuarios = async () => {
      if (search.length < 2) return setUsuarios([]);

      const { data: miembrosActuales } = await supabase
        .from('grupomiembro')
        .select('usuario_nickname')
        .eq('grupo_id', id);

      const yaMiembros = miembrosActuales?.map(m => m.usuario_nickname) || [];
      yaMiembros.push(currentUser.nickname);

      const { data } = await supabase
        .from('usuario')
        .select('nickname')
        .ilike('nickname', `%${search}%`);

      const filtrados = data?.filter(u => !yaMiembros.includes(u.nickname)) || [];
      setUsuarios(filtrados);
    };

    fetchUsuarios();
  }, [search, id, currentUser.nickname]);

  const toggleSeleccion = (nickname: string) => {
    setSeleccionados(prev =>
      prev.includes(nickname) ? prev.filter(n => n !== nickname) : [...prev, nickname]
    );
  };

  const handleConfirmar = async () => {
    if (seleccionados.length === 0) return;

    const nuevos = seleccionados.map(nick => ({ grupo_id: Number(id), usuario_nickname: nick }));
    const { error } = await supabase.from('grupomiembro').insert(nuevos);

    if (error) {
      setToastMessage('Error al añadir miembros');
    } else {
      setToastMessage('Miembros añadidos correctamente');
      history.push(`/group-details/${id}`);
    }
  };

  return (
    <IonPage>
      <IonContent className="crear-grupo-content">
        <h2 className="edit-profile-title">
          AÑADIR MIEMBRO(S) A<br />LA {grupoNombre.toUpperCase()}
        </h2>

        <div className="top-buttons">
          <IonButton className="boton-soter-verde" onClick={handleConfirmar}>
            AÑADIR MIEMBROS
          </IonButton>
          <IonButton className="boton-soter-azul" onClick={() => history.push(`/group-details/${id}`)}>
            CANCELAR
          </IonButton>
        </div>

        <div className="input-group">
          <IonLabel>Busca miembros:</IonLabel>
          <IonInput
            placeholder="Busca miembros"
            value={search}
            onIonInput={e => setSearch(e.detail.value ?? '')}
          />
          <div className="search-results">
            {usuarios.map(u => (
              <div key={u.nickname} onClick={() => toggleSeleccion(u.nickname)}>
                {u.nickname}
              </div>
            ))}
          </div>
        </div>

        <div className="selected-members">
          {seleccionados.map(nick => (
            <div key={nick} className="chip">
              {nick} <span onClick={() => toggleSeleccion(nick)}>×</span>
            </div>
          ))}
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

export default AddMembersPage;
