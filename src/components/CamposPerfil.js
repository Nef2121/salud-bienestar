import { StyleSheet, View } from 'react-native';

import { espacio } from '../constants/theme';
import { OBJETIVOS, SEXOS, TIPOS_SANGRE, esMenor, formatearDui } from '../utils/validators';
import Campo from './Campo';
import Mensaje from './Mensaje';
import Selector from './Selector';

// Campos del perfil, compartidos por Registro y Perfil.
// `valores` son textos; `setValor(campo, valor)` actualiza un campo.
export default function CamposPerfil({ valores, errores, setValor }) {
  const menor = esMenor(valores.edad);

  return (
    <View style={styles.grupo}>
      <Campo
        etiqueta="Nombre completo"
        value={valores.nombre}
        onChangeText={(t) => setValor('nombre', t)}
        error={errores.nombre}
        autoCapitalize="words"
        autoComplete="name"
        maxLength={60}
      />
      <Campo
        etiqueta="Edad (años)"
        value={valores.edad}
        onChangeText={(t) => setValor('edad', t.replace(/\D/g, '').slice(0, 3))}
        error={errores.edad}
        keyboardType="number-pad"
        maxLength={3}
      />
      <Selector
        etiqueta="Sexo"
        opciones={SEXOS}
        valor={valores.sexo}
        onChange={(v) => setValor('sexo', v)}
        error={errores.sexo}
      />
      <Campo
        etiqueta="Peso (kg)"
        value={valores.peso}
        onChangeText={(t) => setValor('peso', t.replace(/[^\d.,]/g, '').slice(0, 6))}
        error={errores.peso}
        keyboardType="decimal-pad"
      />
      <Campo
        etiqueta="Altura (cm)"
        value={valores.altura}
        onChangeText={(t) => setValor('altura', t.replace(/[^\d.,]/g, '').slice(0, 6))}
        error={errores.altura}
        keyboardType="decimal-pad"
      />
      <Selector
        etiqueta="Tipo de sangre"
        opciones={TIPOS_SANGRE}
        valor={valores.tipoSangre}
        onChange={(v) => setValor('tipoSangre', v)}
        error={errores.tipoSangre}
      />
      <Campo
        etiqueta={menor ? 'DUI (opcional para menores)' : 'DUI'}
        value={valores.dui}
        onChangeText={(t) => setValor('dui', formatearDui(t))}
        error={errores.dui}
        ayuda="Formato: 12345678-9"
        keyboardType="number-pad"
        maxLength={10}
      />
      {menor ? (
        <>
          <Mensaje tipo="info">
            Eres menor de edad: necesitamos el teléfono de tu padre, madre o encargado.
          </Mensaje>
          <Campo
            etiqueta="Teléfono del encargado"
            value={valores.telefonoEncargado}
            onChangeText={(t) => setValor('telefonoEncargado', t.replace(/[^\d+\s-]/g, '').slice(0, 15))}
            error={errores.telefonoEncargado}
            ayuda="8 dígitos, ejemplo: 7123-4567"
            keyboardType="phone-pad"
            autoComplete="tel"
          />
        </>
      ) : null}
      <Selector
        etiqueta="Objetivos de salud"
        opciones={OBJETIVOS}
        valor={valores.objetivos}
        onChange={(v) => setValor('objetivos', v)}
        multiple
        error={errores.objetivos}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  grupo: { gap: espacio.m },
});
