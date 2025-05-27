import React, { useEffect, useState, useRef } from 'react';
import {
  IonPage,
  IonContent,
  IonButton,
  IonCheckbox,
  IonLabel,
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
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

const obtenerUbicacionYDireccion = async () => {
  return new Promise<{ lat: number; lng: number; direccion: string }>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`);
          const data = await response.json();
          const direccion = data.display_name || 'Dirección no disponible';
          resolve({ lat, lng, direccion });
        } catch (error) {
          console.error('Error al obtener la dirección:', error);
          resolve({ lat, lng, direccion: 'Dirección no disponible' });
        }
      },
      (error) => {
        console.error('Error al obtener la ubicación:', error);
        reject(error);
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  });
};

const EnviarEmergencia: React.FC = () => {
  const [tiempoRestante, setTiempoRestante] = useState(15);
  const [zonaSeleccionada, setZonaSeleccionada] = useState('');
  const [gravedad, setGravedad] = useState<number>(0);
  const history = useHistory();
  const haEnviadoRef = useRef(false);

  useEffect(() => {
    const intervalo = setInterval(() => {
      setTiempoRestante((prev) => {
        if (prev <= 1) {
          clearInterval(intervalo);
          if (!haEnviadoRef.current) {
            haEnviadoRef.current = true;
            setGravedad(5);
            enviarSMS(5);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalo);
  }, []);

  const enviarSMS = async (nivelGravedad: number) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const nickname = user.nickname;

    const { data: usuario, error: errorUsuario } = await supabase
      .from('usuario')
      .select('nombre, apellidos')
      .eq('nickname', nickname)
      .single();

    if (errorUsuario || !usuario) {
      console.error('Error obteniendo usuario:', errorUsuario);
      return;
    }

    const { data: gruposProtegido } = await supabase
      .from('grupo')
      .select('id')
      .eq('protegido', nickname);

    if (!gruposProtegido || gruposProtegido.length === 0) {
      console.error('No se encontró grupo como protegido');
      return;
    }

    const grupoIds = gruposProtegido.map((g) => g.id);

    const { data: miembros } = await supabase
      .from('grupomiembro')
      .select('usuario_nickname, usuario:usuario_nickname!inner(telefono)')
      .in('grupo_id', grupoIds);

    if (!miembros) {
      console.error('No hay miembros');
      return;
    }

    let lat = 0, lng = 0, direccion = 'Desconocido';
    try {
      const res = await obtenerUbicacionYDireccion();
      lat = res.lat;
      lng = res.lng;
      direccion = res.direccion;
    } catch (e) {
      return;
    }

    const mensaje = `🚨 EMERGENCIA 🚨\nNombre: ${usuario.nombre} ${usuario.apellidos}\nZona afectada: ${zonaSeleccionada || 'No especificado'}\nGravedad: ${nivelGravedad}/5\nUbicación: https://maps.google.com/?q=${lat},${lng}`;

    for (const miembro of miembros) {
      const telefono = miembro.usuario && Array.isArray(miembro.usuario) ? miembro.usuario[0]?.telefono : miembro.usuario?.telefono;
      if (telefono) {
        const data = new URLSearchParams();
        data.append('from', 'Vonage APIs');
        data.append('text', mensaje);
        data.append('to', telefono);
        data.append('api_key', '3d1e9e87');
        data.append('api_secret', 'evuNV3MXIZomkku3');

       /* try {
          const response = await fetch('https://rest.nexmo.com/sms/json', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: data.toString(),
          });

          const result = await response.json();
          console.log('📤 Resultado Vonage:', result);
        } catch (err) {
          console.error('❌ Error al enviar con Vonage:', err);
        }*/
      }
    }

    const { error } = await supabase.from('accidente').insert({
      persona: nickname,
      gravedad: nivelGravedad,
      zona: zonaSeleccionada,
      fecha: new Date().toISOString(),
      latitud: lat,
      longitud: lng,
      lugar: direccion
    });

    if (error) {
      console.error('Error al registrar el accidente:', error);
    }

    alert('SMS enviado con Vonage y accidente registrado.');
    history.push('/home');
  };

  return (
    <IonPage>
      <IonContent className="emergencia-content">
        <div className="page-top-spacer"></div>
        <h2 className="titulo-emergencia">ENVIAR EMERGENCIA</h2>
        <p className="tiempo-restante">Tiempo: {tiempoRestante} segundos</p>

        <div className="botones-emergencia">
          <IonButton
            className="soter-green-button"
            onClick={() => {
              if (!haEnviadoRef.current) {
                haEnviadoRef.current = true;
                enviarSMS(gravedad);
              }
            }}
          >
            ENVIAR SMS
          </IonButton>
          <IonButton className="cancel-button" onClick={() => history.push('/home')}>
            CANCELAR
          </IonButton>
        </div>

        <div className="zona-afectada">
          <IonLabel><strong>Zona:</strong></IonLabel>
          {ZONAS.map((zona) => (
            <div key={zona} className="zona-item">
              <IonLabel>{zona}</IonLabel>
              <IonCheckbox
                checked={zonaSeleccionada === zona}
                onIonChange={() => setZonaSeleccionada(zona)}
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
