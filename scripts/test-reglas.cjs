const assert = require('node:assert/strict');
const {initializeApp,deleteApp}=require('firebase/app');
const {getFirestore,connectFirestoreEmulator,doc,setDoc,getDoc,deleteDoc,serverTimestamp,terminate}=require('firebase/firestore');
if(!process.env.FIRESTORE_EMULATOR_HOST)throw new Error('Estas pruebas solo se ejecutan con el emulador.');
const [host,port]=process.env.FIRESTORE_EMULATOR_HOST.split(':');
const apps=[];const dbs=[];
function cliente(uid){const app=initializeApp({projectId:'demo-salud-bienestar'},uid||'anon');apps.push(app);const db=getFirestore(app);dbs.push(db);connectFirestoreEmulator(db,host,Number(port),uid?{mockUserToken:{sub:uid,user_id:uid}}:{});return db;}
(async()=>{
 const a=cliente('alice'),b=cliente('bob'),anon=cliente();
 const registro=()=>({cifrado:'v1.'+'a'.repeat(60),actualizado:serverTimestamp()});
 for(const tipo of ['objetivos','recordatorios','comidas']){
  const ruta='users/alice/'+tipo+'/prueba';
  await setDoc(doc(a,ruta),registro());assert.equal((await getDoc(doc(a,ruta))).exists(),true);
  await assert.rejects(()=>getDoc(doc(b,ruta)),e=>e.code==='permission-denied');
  await assert.rejects(()=>getDoc(doc(anon,ruta)),e=>e.code==='permission-denied');
  await assert.rejects(()=>setDoc(doc(b,ruta),registro()),e=>e.code==='permission-denied');
  await assert.rejects(()=>setDoc(doc(a,ruta),{...registro(),nombre:'texto sin cifrar'}),e=>e.code==='permission-denied');
  await assert.rejects(()=>setDoc(doc(a,ruta),{...registro(),cifrado:'mal'}),e=>e.code==='permission-denied');
  await assert.rejects(()=>deleteDoc(doc(b,ruta)),e=>e.code==='permission-denied');
  await deleteDoc(doc(a,ruta));
 }
 const ruta='users/alice/dispositivos/prueba';
 await setDoc(doc(a,ruta),{token:'token'.repeat(10),plataforma:'android',actualizado:serverTimestamp()});
 await assert.rejects(()=>getDoc(doc(b,ruta)),e=>e.code==='permission-denied');
 await assert.rejects(()=>setDoc(doc(b,ruta),{token:'token'.repeat(10),plataforma:'android',actualizado:serverTimestamp()}),e=>e.code==='permission-denied');
 await deleteDoc(doc(a,ruta));
 await setDoc(doc(a,'users/alice/actividades_fisicas/prueba'),{uid:'alice',fecha:'2026-11-13',pasos:100,distancia:1,calorias:25,sincronizado_en:serverTimestamp()});
 await setDoc(doc(a,'users/alice/entrenamientos/prueba'),{uid:'alice',fecha:'2026-11-13',tipo:'Caminar',duracion_min:20,intensidad:'Baja',calorias:25,sincronizado_en:serverTimestamp()});
 console.log('Reglas verificadas: aislamiento, datos cifrados, dispositivos y compatibilidad con módulos del equipo.');
})().catch(e=>{console.error(e.message);process.exitCode=1;}).finally(async()=>{await Promise.all(dbs.map(terminate));await Promise.all(apps.map(deleteApp));});
