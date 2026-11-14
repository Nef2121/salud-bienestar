import { SymbolView } from 'expo-symbols';

import { colores } from '../constants/theme';

// Iconos de la app. Cada uno tiene su nombre en iOS (SF Symbols) y en Android/web (Material).
const ICONOS = {
  inicio: { ios: 'house.fill', android: 'home', web: 'home' },
  actividad: { ios: 'figure.run', android: 'directions_walk', web: 'directions_walk' },
  comunidad: { ios: 'person.3.fill', android: 'groups', web: 'groups' },
  consejos: { ios: 'lightbulb.fill', android: 'lightbulb', web: 'lightbulb' },
  cuenta: { ios: 'person.fill', android: 'person', web: 'person' },
  entrenar: { ios: 'dumbbell.fill', android: 'fitness_center', web: 'fitness_center' },
  progreso: { ios: 'chart.bar.fill', android: 'bar_chart', web: 'bar_chart' },
  lista: { ios: 'list.bullet', android: 'list', web: 'list' },
  editar: { ios: 'pencil', android: 'edit', web: 'edit' },
  admin: { ios: 'shield.fill', android: 'admin_panel_settings', web: 'admin_panel_settings' },
  salir: { ios: 'rectangle.portrait.and.arrow.right', android: 'logout', web: 'logout' },
  siguiente: { ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' },
  foro: { ios: 'bubble.left.and.bubble.right.fill', android: 'forum', web: 'forum' },
};

export default function Icono({ nombre, color = colores.primario, tamano = 24 }) {
  return <SymbolView name={ICONOS[nombre]} tintColor={color} size={tamano} />;
}