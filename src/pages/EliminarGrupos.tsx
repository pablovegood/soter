import React, { useEffect, useState } from 'react';
import {
  IonPage, IonContent, IonButton, IonCheckbox, IonToast
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import './Global.css';
import './EliminarGrupos.css';

const supabase = createClient(
  'https://vovrdtlrfiextltvpdpc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvdnJkdGxyZmlleHRsdHZwZHBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMzNTU5ODcsImV4cCI6MjA1ODkzMTk4N30.pBgPNcysidTyqpOP5900Szt4wF2It0i7SbJAUkN36NI'
);

const EliminarGrupos: React.FC = () => {
  const history = useHistory();
  interface Grupo {
    id: number;
    nombre: string;
    protegido: boolean;
    miembros: number;
  }
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [seleccionados, setSeleccionados] = useState<number[]>([]);
  const [toastMessage, setToastMessage] = useState('');

  const usuario = JSON.parse(localStorage.getItem('user') || '{}');

useEffect(() => {
  const cargarGruposAdmin = async () => {
    const { data: adminGroups, error: errorAdmin } = await supabase
      .from('grupoadmin')
      .select('grupo_id')
      .eq('usuario_nickname', usuario.nickname);

    if (errorAdmin || !adminGroups) {
      console.error(errorAdmin);
      setToastMessage('Error al cargar grupos donde eres administrador');
      return;
    }

    const ids = adminGroups.map(g => g.grupo_id);

    if (ids.length === 0) {
      setGrupos([]); // No hay grupos para mostrar
      return;
    }

    const { data: gruposData, error: errorGrupos } = await supabase
      .from('grupo')
      .select('id, nombre, protegido')
      .in('id', ids);

    if (errorGrupos || !gruposData) {
      console.error(errorGrupos);
      setToastMessage('Error al cargar los detalles de los grupos');
      return;
    }

    // Cargar miembros por grupo
    const { data: miembrosData, error: errorMiembros } = await supabase
      .from('grupomiembro')
      .select('grupo_id')
      .in('grupo_id', ids);

    if (errorMiembros) {
      console.error(errorMiembros);
      setToastMessage('Error al contar miembros');
      return;
    }

    const miembrosPorGrupo = miembrosData.reduce((acc, curr) => {
      acc[curr.grupo_id] = (acc[curr.grupo_id] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const formateados = gruposData.map(grupo => ({
      id: grupo.id,
      nombre: grupo.nombre,
      protegido: grupo.protegido,
      miembros: miembrosPorGrupo[grupo.id] || 0
    }));

    setGrupos(formateados);
  };

  cargarGruposAdmin();
}, [usuario.nickname]);



  const toggleSeleccionado = (id: number) => {
    setSeleccionados(prev =>
      prev.includes(id) ? prev.filter(gid => gid !== id) : [...prev, id]
    );
  };

const eliminarSeleccionados = async () => {
  try {
    // 1. Eliminar de grupoadmin
    const { error: errorAdmins } = await supabase
      .from('grupoadmin')
      .delete()
      .in('grupo_id', seleccionados);

    if (errorAdmins) throw errorAdmins;

    // 2. Eliminar de grupomiembro
    const { error: errorMiembros } = await supabase
      .from('grupomiembro')
      .delete()
      .in('grupo_id', seleccionados);

    if (errorMiembros) throw errorMiembros;

    // 3. Eliminar de grupo (último paso)
    const { error: errorGrupos } = await supabase
      .from('grupo')
      .delete()
      .in('id', seleccionados);

    if (errorGrupos) throw errorGrupos;

    setToastMessage('Grupos eliminados correctamente');
    history.push('/groups');
  } catch (error) {
    console.error('Error en la eliminación:', error);
    setToastMessage('Error al eliminar grupos');
  }
};


  return (
    <IonPage>
      <IonContent className="crear-grupo-content">
        <h2 className="edit-profile-title">ELIMINAR GRUPOS</h2>

        <div className="top-buttons">
          <IonButton
            style={{ backgroundColor: '#d32f2f', color: 'white', fontWeight: 'bold' }}
            onClick={eliminarSeleccionados}
            disabled={seleccionados.length === 0}
          >
            ELIMINAR GRUPO
          </IonButton>
          <IonButton
            style={{ backgroundColor: '#1e3a8a', color: 'white', fontWeight: 'bold' }}
            onClick={() => history.push('/groups')}
          >
            CANCELAR
          </IonButton>
        </div>

        <div className="eliminar-grupo-container">
  {grupos.map((grupo) => (
    <div className="grupo-tarjeta" key={grupo.id}>
      <div className="grupo-info">
        <strong>{grupo.nombre}</strong><br />
        Protegido: {grupo.protegido}<br />
        {grupo.miembros} miembros
      </div>
      <IonCheckbox
        className="checkbox-right"
        checked={seleccionados.includes(grupo.id)}
        onIonChange={() => toggleSeleccionado(grupo.id)}
      />
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

export default EliminarGrupos;
