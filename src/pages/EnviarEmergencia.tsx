import React, { useEffect, useState } from 'react';
import {
  IonPage,
  IonContent,
  IonButton,
  IonCheckbox,
  IonLabel,
} from '@ionic/react';
import './Global.css';
import './EnviarEmergencia.css';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://vovrdtlrfiextltvpdpc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvdnJkdGxyZmlleHRsdHZwZHBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMzNTU5ODcsImV4cCI6MjA1ODkzMTk4N30.pBgPNcysidTyqpOP5900Szt4wF2It0i7SbJAUkN36NI'
);


const ZONAS = [
  'Cabeza', 'Cuello', 'Espalda', 'Cadera', 'Codos', 'Rodillas', 'Tobillos'
];

const EnviarEmergencia: React.FC = () => {
  const [tiempoRestante, setTiempoRestante] = useState(60);
  const [zonasSeleccionadas, setZonasSeleccionadas] = useState<string[]>([]);
  const [gravedad, setGravedad] = useState<number>(0);

  useEffect(() => {
    const intervalo = setInterval(() => {
      setTiempoRestante((prev) => {
        if (prev <= 1) {
          clearInterval(intervalo);
          setGravedad(5); // gravedad máxima
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalo);
  }, []);

  const toggleZona = (zona: string) => {
    setZonasSeleccionadas((prev) =>
      prev.includes(zona) ? prev.filter((z) => z !== zona) : [...prev, zona]
    );
  };

const enviarSMS = async () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const nickname = user.nickname;

  // 1. Obtener datos del usuario actual
  const { data: usuario, error: errorUsuario } = await supabase
    .from('usuario')
    .select('nombre, apellidos')
    .eq('nickname', nickname)
    .single();

  if (errorUsuario || !usuario) {
    console.error('Error obteniendo usuario:', errorUsuario);
    return;
  }

  // 2. Obtener grupos donde el usuario es protegido
  const { data: grupos, error: errorGrupos } = await supabase
    .from('grupo')
    .select('id')
    .eq('protegido', nickname);

  if (errorGrupos || !grupos || grupos.length === 0) {
    console.error('No se encontró grupo como protegido');
    return;
  }

  const grupoId = grupos[0].id;

  // 3. Obtener los teléfonos de los miembros del grupo
  const { data: miembros, error: errorMiembros } = await supabase
    .from('grupomiembro')
    .select('usuario_nickname, usuario:usuario_nickname!inner(telefono)')
    .eq('grupo_id', grupoId);

  if (errorMiembros || !miembros) {
    console.error('Error obteniendo miembros:', errorMiembros);
    return;
  }

  // 4. Obtener ubicación actual
  const obtenerUbicacion = (): Promise<{ lat: number; lng: number }> =>
    new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        reject,
        { enableHighAccuracy: true, timeout: 5000 }
      );
    });

  let ubicacion;
  try {
    ubicacion = await obtenerUbicacion();
  } catch (e) {
    console.error('Error obteniendo ubicación:', e);
    return;
  }

  // 5. Crear contenido del mensaje
  const mensaje = `
🚨 EMERGENCIA 🚨
Nombre: ${usuario.nombre} ${usuario.apellidos}
Zonas afectadas: ${zonasSeleccionadas.join(', ') || 'No especificado'}
Gravedad: ${gravedad}/5
Ubicación: https://maps.google.com/?q=${ubicacion.lat},${ubicacion.lng}
  `;

  // 6. Simular envío a cada número
  miembros.forEach((miembro) => {
    // usuario es un array debido al join, tomamos el primero
    const telefono = miembro.usuario && Array.isArray(miembro.usuario) ? miembro.usuario[0]?.telefono : undefined;
    if (telefono) {
      console.log(`📤 Enviando SMS a ${telefono}:`);
      console.log(mensaje);
      // Aquí integras con tu backend o API SMS
    }
  });

  alert('SMS de emergencia enviado');
};


  return (
    <IonPage>
      <IonContent className="emergencia-content">
        <h2 className="titulo-emergencia">ENVIAR EMERGENCIA</h2>
        <p className="tiempo-restante">Tiempo: {tiempoRestante} segundos</p>

        <div className="botones-emergencia">
          <IonButton color="medium" onClick={() => window.history.back()}>CANCELAR</IonButton>
          <IonButton
            style={{ backgroundColor: '#F6A03D', color: 'white', fontWeight: 'bold' }}
            onClick={enviarSMS}
          >
            ENVIAR SMS
          </IonButton>
        </div>

        <div className="zona-afectada">
  <IonLabel><strong>Zona:</strong></IonLabel>
  {ZONAS.map((zona) => (
    <div key={zona} className="zona-item">
      <IonLabel>{zona}</IonLabel>
      <IonCheckbox
        checked={zonasSeleccionadas.includes(zona)}
        onIonChange={() => toggleZona(zona)}
      />
    </div>
  ))}
</div>


        <div className="gravedad">
          <IonLabel><strong>Nivel de Gravedad:</strong></IonLabel>
          <div className="estrellas">
            {[1, 2, 3, 4, 5].map((estrella) => (
              <span
                key={estrella}
                className={`estrella ${gravedad >= estrella ? 'activa' : ''}`}
                onClick={() => setGravedad(estrella)}
              >
                ★
              </span>
            ))}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default EnviarEmergencia;
