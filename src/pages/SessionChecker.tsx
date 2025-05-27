import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { IonPage, IonContent, IonSpinner } from '@ionic/react';
import { createClient } from '@supabase/supabase-js';
import './SessionChecker.css';

const supabase = createClient(
  'https://vovrdtlrfiextltvpdpc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvdnJkdGxyZmlleHRsdHZwZHBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMzNTU5ODcsImV4cCI6MjA1ODkzMTk4N30.pBgPNcysidTyqpOP5900Szt4wF2It0i7SbJAUkN36NI'
);

const SessionChecker: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const history = useHistory();

useEffect(() => {
  const checkSession = async () => {
    console.log('[SessionChecker] Comprobando sesión...');

    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
      const { data: userInfo } = await supabase
        .from('usuario')
        .select('*')
        .eq('auth_id', session.user.id)
        .single();

      if (userInfo) {
        console.log('[SessionChecker] Usuario autenticado → /home');
        localStorage.setItem('user', JSON.stringify(userInfo));
        history.replace('/home');
      } else {
        console.log('[SessionChecker] Usuario no válido → /login');
        await supabase.auth.signOut();
        history.replace('/login');
      }
    } else {
      console.log('[SessionChecker] No hay sesión → /login');
      history.replace('/login');
    }

    setLoading(false);
  };

  checkSession();
}, [history]);


  if (loading) {
    return (
      <IonPage className="splash-logo"></IonPage>
   
    );
  }

  return null;
};

export default SessionChecker;
