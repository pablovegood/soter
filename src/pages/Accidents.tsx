import React, { useCallback, useEffect, useState } from 'react';
import {
  IonPage,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonLabel,
  IonTabBar,
  IonTabButton,
  IonIcon
} from '@ionic/react';
import { createClient } from '@supabase/supabase-js';
import { personCircle, people, home, documentText, medical } from 'ionicons/icons';
import './Global.css';
import './Accidents.css';

const supabase = createClient(
  'https://vovrdtlrfiextltvpdpc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvdnJkdGxyZmlleHRsdHZwZHBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMzNTU5ODcsImV4cCI6MjA1ODkzMTk4N30.pBgPNcysidTyqpOP5900Szt4wF2It0i7SbJAUkN36NI'
);

interface Accidente {
  id: number;
  persona: string;
  zona: string;
  lugar: string;
  gravedad: number;
  escenario: string | null;
  fecha: string;
}

interface Usuario {
  nickname: string;
  nombre: string;
  apellidos: string;
}

const AccidentsPage: React.FC = () => {
  const [accidentesPropios, setAccidentesPropios] = useState<Accidente[]>([]);
  const [accidentesProtectores, setAccidentesProtectores] = useState<{ accidente: Accidente, protegido: Usuario }[]>([]);
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchAccidentes = useCallback(async () => {
    const { data: propios } = await supabase
      .from('accidente')
      .select('*')
      .eq('persona', currentUser.nickname)
      .order('fecha', { ascending: false });

    setAccidentesPropios(propios || []);

    const { data: grupos } = await supabase
      .from('grupomiembro')
      .select('grupo_id')
      .eq('usuario_nickname', currentUser.nickname);

    const ids = grupos?.map(g => g.grupo_id) || [];

    const { data: grupoDatos } = await supabase
      .from('grupo')
      .select('protegido')
      .in('id', ids);

    const protegidos = grupoDatos?.map(g => g.protegido) || [];

    if (protegidos.length > 0) {
      const { data: accProtectores } = await supabase
        .from('accidente')
        .select('*')
        .in('persona', protegidos);

      const { data: userData } = await supabase
        .from('usuario')
        .select('nickname, nombre, apellidos')
        .in('nickname', protegidos);

      const detalles = accProtectores
        ?.map((acc) => {
          const protegido = userData?.find(u => u.nickname === acc.persona);
          if (protegido) {
            return { accidente: acc, protegido };
          }
          return null;
        })
        .filter((item): item is { accidente: Accidente; protegido: Usuario } => item !== null) || [];

      setAccidentesProtectores(detalles);
    }
  }, [currentUser.nickname]);

  useEffect(() => {
    if (!currentUser?.nickname) return;
    fetchAccidentes();
  }, [currentUser?.nickname, fetchAccidentes]);

  const formatearFecha = (fecha: string) =>
    new Date(fecha).toLocaleDateString('es-ES');

  return (
    <IonPage>
      <IonContent className="accident-page">
        <h2 className="sos-title">REGISTRO ACCIDENTES</h2>

        <h3 className="accident-subtitle">Propios:</h3>
        {accidentesPropios.map(acc => (
          <IonCard key={acc.id} className="accident-card">
            <IonCardHeader>
              <IonCardTitle>ID: {acc.id}</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              Fecha: {formatearFecha(acc.fecha)}<br />
              Zona: {acc.zona}
            </IonCardContent>
          </IonCard>
        ))}

        <h3 className="accident-subtitle">Como protector:</h3>
        {accidentesProtectores.map(({ accidente, protegido }) => (
          <IonCard key={accidente.id} className="accident-card">
            <IonCardHeader>
              <IonCardTitle>ID: {accidente.id}</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              Protegido: {protegido?.nombre} {protegido?.apellidos}<br />
              Fecha: {formatearFecha(accidente.fecha)}<br />
              Zona: {accidente.zona}
            </IonCardContent>
          </IonCard>
        ))}
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

export default AccidentsPage;
