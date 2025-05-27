import React, { useEffect, useState } from 'react';
import {
  IonPage,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel
} from '@ionic/react';
import { personCircle, people, home, documentText, medical } from 'ionicons/icons';
import { createClient } from '@supabase/supabase-js';
import './Healthcare.css';
import seedrandom from 'seedrandom';

const supabase = createClient(
  'https://vovrdtlrfiextltvpdpc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvdnJkdGxyZmlleHRsdHZwZHBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMzNTU5ODcsImV4cCI6MjA1ODkzMTk4N30.pBgPNcysidTyqpOP5900Szt4wF2It0i7SbJAUkN36NI'
);

interface ConsejoSalud {
  id: number;
  descripcion: string;
  fuente: string;
}

const HealthcarePage: React.FC = () => {
  const [consejos, setConsejos] = useState<ConsejoSalud[]>([]);

useEffect(() => {
  const fetchConsejos = async () => {
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const rng = seedrandom(today); // Semilla basada en la fecha actual

    const { data, error } = await supabase.from('consejo_salud').select('*');

    if (!error && data) {
      const shuffled = [...data];

      // Fisher–Yates shuffle usando seed
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }

      setConsejos(shuffled.slice(0, 5)); // Solo 5 consejos
    }
  };

  fetchConsejos();
}, []);

  return (
    <IonPage>
      <IonContent className="healthcare-content">
         <div className="page-top-spacer"></div>
        <div className="consejos-wrapper">
          <h2 className="sos-title">Consejos del Día sobre Salud</h2>

          {consejos.length === 0 ? (
            <p style={{ color: '#34445B', fontStyle: 'italic' }}>Cargando consejos del día...</p>
          ) : (
            consejos.map((item, index) => (
              <IonCard key={item.id} className="healthcare-card">
                <IonCardHeader>
                  <IonCardTitle className="card-title">
                    {index + 1}. {item.descripcion}
                  </IonCardTitle>
                </IonCardHeader>
                <IonCardContent className="card-source">
                  Fuente: {item.fuente}
                </IonCardContent>
              </IonCard>
            ))
          )}
        </div>
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

export default HealthcarePage;