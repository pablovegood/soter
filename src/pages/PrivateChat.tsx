// PrivateChat.tsx
import React, { useEffect, useState, useRef } from 'react';
import { IonPage, IonContent, IonButton, IonInput } from '@ionic/react';
import { useParams, useHistory } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import './PrivateChat.css';

const supabase = createClient('https://vovrdtlrfiextltvpdpc.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvdnJkdGxyZmlleHRsdHZwZHBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMzNTU5ODcsImV4cCI6MjA1ODkzMTk4N30.pBgPNcysidTyqpOP5900Szt4wF2It0i7SbJAUkN36NI');

const PrivateChat: React.FC = () => {
  const { usuario } = useParams<{ usuario: string }>();
  const [mensaje, setMensaje] = useState('');
  type Mensaje = {
    id: number;
    autor: string;
    texto: string;
    chatprivado_id: number;
    fecha: string;
  };
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  type Receptor = { nombre: string; apellidos: string; [key: string]: unknown } | null;
  const [receptor, setReceptor] = useState<Receptor>(null);
  const [chatId, setChatId] = useState<number | null>(null);
  const history = useHistory();
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const mensajesRef = useRef<HTMLDivElement>(null);

  const getOrCreateChat = React.useCallback(async () => {
    const [a, b] = [currentUser.nickname, usuario].sort();
    let { data: chat } = await supabase.from('chatprivado').select('*').eq('usuario1', a).eq('usuario2', b).single();
    if (!chat) {
      const { data } = await supabase.from('chatprivado').insert({ usuario1: a, usuario2: b }).select().single();
      chat = data;
    }
    setChatId(chat.id);

    const otro = chat.usuario1 === currentUser.nickname ? chat.usuario2 : chat.usuario1;
    const { data: userData } = await supabase.from('usuario').select('nombre, apellidos').eq('nickname', otro).single();
    setReceptor(userData);

    return chat.id;
  }, [currentUser.nickname, usuario]);

  const fetchMensajes = React.useCallback(async (chatId: number) => {
    const { data } = await supabase.from('mensaje_privado').select('*').eq('chatprivado_id', chatId).order('fecha', { ascending: true });
    setMensajes(data || []);
    setTimeout(scrollToBottom, 100);
  }, []);

  const scrollToBottom = () => {
    mensajesRef.current?.scrollTo({ top: mensajesRef.current.scrollHeight, behavior: 'smooth' });
  };

  useEffect(() => {
    getOrCreateChat().then(fetchMensajes);
  }, [getOrCreateChat, fetchMensajes]);

  const enviarMensaje = async () => {
    if (!mensaje.trim() || chatId === null) return;
    await supabase.from('mensaje_privado').insert({
      autor: currentUser.nickname,
      texto: mensaje,
      chatprivado_id: chatId,
      fecha: new Date().toISOString()
    });
    setMensaje('');
    fetchMensajes(chatId);
  };

  const formatHora = (iso: string) => {
    const fecha = new Date(iso);
    return fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Europe/Madrid' });
  };

  return (
    <IonPage>
      <div className="chat-header fixed">
        <IonButton className="back-button" onClick={() => history.goBack()}>VOLVER</IonButton>
        {receptor && (
          <div className="chat-nombre chat-nombre-inline">{receptor.nombre} {receptor.apellidos}</div>
        )}
      </div>

      <IonContent className="private-chat">
        <div className="mensajes-container" ref={mensajesRef}>
          {mensajes.map((m) => (
            <div key={m.id} className={`mensaje ${m.autor === currentUser.nickname ? 'propio' : 'ajeno'}`}>
              <p>{m.texto}</p>
              <span className="timestamp">{formatHora(m.fecha)}</span>
            </div>
          ))}
        </div>
      </IonContent>

      <div className="enviar-container fixed">
        <IonInput
          value={mensaje}
          placeholder="Escribe un mensaje..."
          onIonChange={e => setMensaje(e.detail.value!)}
          className="input-mensaje"
        />
        <IonButton onClick={enviarMensaje}>ENVIAR</IonButton>
      </div>
    </IonPage>
  );
};

export default PrivateChat;
