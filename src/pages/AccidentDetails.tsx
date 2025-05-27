import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import {
  IonPage,
  IonContent,
  IonButton,
} from '@ionic/react';
import { createClient } from '@supabase/supabase-js';
import './Global.css';
import './AccidentDetails.css';
import html2pdf from 'html2pdf.js';
import { useRef } from 'react';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { FileOpener } from '@awesome-cordova-plugins/file-opener';
import { Capacitor } from '@capacitor/core';
import logo from './images/logo-soter.png';

const supabase = createClient(
  'https://vovrdtlrfiextltvpdpc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvdnJkdGxyZmlleHRsdHZwZHBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMzNTU5ODcsImV4cCI6MjA1ODkzMTk4N30.pBgPNcysidTyqpOP5900Szt4wF2It0i7SbJAUkN36NI'

);

interface Params {
  id: string;
}

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
  nombre: string;
  apellidos: string;
}

const AccidentDetails: React.FC = () => {
  const { id } = useParams<Params>();
  const history = useHistory();
const pdfRef = useRef<HTMLDivElement>(null);
const handleDownloadPDF = async () => {
  if (!pdfRef.current || !accidente) return;

  const opt = {
    margin: 0,
    filename: `accidente_${accidente.id}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  const pdfBlob = await html2pdf()
    .set(opt)
    .from(pdfRef.current)
    .outputPdf('blob');

  const reader = new FileReader();

  reader.onloadend = async () => {
    const base64data = (reader.result as string).split(',')[1];
    const fileName = `accidente_${accidente.id}.pdf`;

    const filePath = `${fileName}`;

    try {
      // 1. Guardar el archivo
      await Filesystem.writeFile({
        path: filePath,
        data: base64data,
        directory: Directory.Documents,
        recursive: true
      });

      // 2. Obtener la URI completa
      const fileUri = await Filesystem.getUri({
        directory: Directory.Documents,
        path: filePath
      });

      // 3. Intentar abrirlo (solo si estamos en móvil nativo)
      if (Capacitor.isNativePlatform()) {
        await FileOpener.open(fileUri.uri, 'application/pdf');
      } else {
        alert(`PDF guardado como ${fileName}`);
      }
    } catch (error) {
      console.error('Error al guardar o abrir el archivo:', error);
      alert('Hubo un problema al guardar o abrir el PDF.');
    }
  };

  reader.readAsDataURL(pdfBlob);
};

  const [accidente, setAccidente] = useState<Accidente | null>(null);
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: acc } = await supabase
        .from('accidente')
        .select('*')
        .eq('id', id)
        .single();

      if (acc) {
        setAccidente(acc);
        const { data: user } = await supabase
          .from('usuario')
          .select('nombre, apellidos')
          .eq('nickname', acc.persona)
          .single();

        setUsuario(user);
      }
    };

    fetchData();
  }, [id]);

  const formatearFecha = (fecha: string) =>
    new Date(fecha).toLocaleDateString('es-ES');

const renderStars = (nivel: number) => {
  return (
    <div className="stars-container">
      {'★'.repeat(nivel) + '☆'.repeat(5 - nivel)}
    </div>
  );
};


  return (
    <IonPage>
      <IonContent className="accident-details-content">
        <div className="page-top-spacer"></div>
        {accidente && (
          <>
            <h2 className="accident-details-title">DATOS ACCIDENTE N° {accidente.id}</h2>

            <div className="accident-buttons">
              <IonButton className="cancel-button" onClick={() => history.goBack()}>VOLVER</IonButton>
              <IonButton className="soter-green-button" onClick={handleDownloadPDF}>DESCARGAR</IonButton>
            </div>

 <div className="pdf-container" ref={pdfRef}>
  <div className="pdf-header">
   <img src={logo} alt="Logo Soter"  className="pdf-logo" />
  </div>

  <h1>Informe del Accidente</h1>

  <section className="pdf-section">
    <h2>Información General</h2>
    <p><strong>ID del Accidente:</strong> {accidente.id}</p>
    <p><strong>Fecha:</strong> {formatearFecha(accidente.fecha)}</p>
  </section>

  <section className="pdf-section">
    <h2>Datos del Protegido</h2>
    <p><strong>Nombre:</strong> {usuario?.nombre} {usuario?.apellidos}</p>
    <p><strong>Zona Afectada:</strong> {accidente.zona}</p>
    <p><strong>Lugar del Accidente:</strong> {accidente.lugar}</p>
  </section>

  <section className="pdf-section">
    <h2>Gravedad del Accidente</h2>
    <p className="pdf-stars">
      {'★'.repeat(accidente.gravedad) + '☆'.repeat(5 - accidente.gravedad)}
    </p>
  </section>
</div>


          </>
        )}
      </IonContent>
    </IonPage>
  );
};

export default AccidentDetails;
