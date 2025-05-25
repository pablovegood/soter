import React, { useEffect, useState } from 'react';
import {
  IonPage,
  IonContent,
  IonButton,
  IonTabBar,
  IonTabButton,
  IonToast,
  IonIcon,
  IonLabel
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { personCircle, home, documentText, people, medical } from 'ionicons/icons';
import './Global.css';
import './Groups.css';

const supabase = createClient(
  'https://vovrdtlrfiextltvpdpc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvdnJkdGxyZmlleHRsdHZwZHBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMzNTU5ODcsImV4cCI6MjA1ODkzMTk4N30.pBgPNcysidTyqpOP5900Szt4wF2It0i7SbJAUkN36NI'
);

const GroupsPage: React.FC = () => {
  interface Grupo {
    id: number;
    nombre: string;
    protegido: string;
    fecha_creacion?: string;
  }

  const [grupoProtegido, setGrupoProtegido] = useState<Grupo | null>(null);
  const [gruposProtectores, setGruposProtectores] = useState<Grupo[]>([]);
  const [error, setError] = useState('');
  const [esAdmin, setEsAdmin] = useState(false);
  const history = useHistory();

  useEffect(() => {
    const usuario = JSON.parse(localStorage.getItem('user') || '{}');
    if (usuario.nickname) {
      fetchGrupos(usuario.nickname);
      comprobarSiEsAdmin(usuario.nickname);
    }
  }, []);

  const comprobarSiEsAdmin = async (nickname: string) => {
    const { data, error } = await supabase
      .from('grupoadmin')
      .select('grupo_id')
      .eq('usuario_nickname', nickname);

    if (error) {
      console.error('Error comprobando si es admin:', error);
    }

    setEsAdmin(!!(data && data.length > 0));
  };

  const fetchGrupos = async (nickname: string) => {
    try {
      // Grupo donde soy protegido (solo uno)
      const { data: gruposP } = await supabase
        .from('grupo')
        .select('id, nombre, protegido, fecha_creacion')
        .eq('protegido', nickname);

      if (gruposP && gruposP.length > 0) {
        setGrupoProtegido(gruposP[0]);
      } else {
        setGrupoProtegido(null);
      }

      // Grupos donde soy protector (miembro)
      const { data: miembroData } = await supabase
        .from('grupomiembro')
        .select('grupo_id')
        .eq('usuario_nickname', nickname);

      const ids = miembroData?.map((item) => item.grupo_id) || [];

      const { data: protectores, error: errG } = await supabase
        .from('grupo')
        .select('id, nombre, protegido, fecha_creacion')
        .in('id', ids);

      if (!errG) {
        setGruposProtectores(protectores || []);
      }
    } catch (err) {
      console.error("Error cargando grupos:", err);
      setError('Error al cargar los grupos');
    }
  };

  return (
    <IonPage>
      <IonContent>
        <h2 className="sos-title">GRUPOS</h2>

        <div className="groups-buttons">
          <IonButton className="soter-green-button" routerLink="/crear-grupo">
            CREAR GRUPO
          </IonButton>
          {esAdmin && (
            <IonButton className="soter-yellow-button" routerLink="/eliminar-grupos">
              ELIMINAR GRUPOS
            </IonButton>
          )}
        </div>

        {grupoProtegido && (
          <div className="grupo-section">
            <h3 style={{ textAlign: 'center', color: '#0c0c0c' }}>Grupo en el que soy protegido:</h3>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
              <div className="grupo-card" onClick={() => history.push(`/group-details/${grupoProtegido.id}`)}>
                <p className="grupo-nombre">{grupoProtegido.nombre}</p>
                <p className="grupo-detalle">
                  Fecha de creación: {grupoProtegido.fecha_creacion
                    ? new Date(grupoProtegido.fecha_creacion).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : 'No disponible'}
                </p>
              </div>
            </div>
          </div>
        )}

        {gruposProtectores.length > 0 && (
          <div className="grupo-section">
            <h3 style={{ textAlign: 'center', color: '#0c0c0c' }}>Grupos en los que soy protector:</h3>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              {gruposProtectores.map((grupo) => (
                <div key={grupo.id} className="grupo-card clickable-card" onClick={() => history.push(`/group-details/${grupo.id}`)}>
                  <p className="grupo-nombre">{grupo.nombre}</p>
                  <p className="grupo-detalle">Protegido: {grupo.protegido}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <IonToast
          isOpen={!!error}
          message={error}
          duration={2500}
          color="danger"
          onDidDismiss={() => setError('')}
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

export default GroupsPage;
