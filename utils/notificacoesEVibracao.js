import { Vibration } from "react-native";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";

const CHAVE_STORAGE_ALARME = "@despertador_horario";

// Configura como a notificação se comporta na tela/barra de status
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldShowList: true,
    shouldShowBanner: true,
    shouldSetBadge: false,
  }),
});

// 1. Pedir permissão ao sistema
export async function requestPermissaoNotificacao() {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

// 2. Notificação da barra com Som do Sistema
export async function dispararMensagemNotificacao() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "⏰ DESPERTADOR!",
      body: "Está na hora! Seu alarme disparou.",
      sound: "default", // Usa o som de notificação padrão do SO
    },
    trigger: null, // Dispara imediatamente
  });
}

// 3. Funções de Vibração
export function iniciarVibracao() {
  Vibration.vibrate([500, 500], true);
}

export function pararVibracao() {
  Vibration.cancel();
}

// 4. Executar Alarme Completo (Vibração + Notificação/Som do Sistema)
export async function executarAlarmeCompleto() {
  iniciarVibracao();
  await dispararMensagemNotificacao();
}

// 5. Parar Alarme
export function desligarAlarmeCompleto() {
  pararVibracao();
}

// --- FUNÇÕES DE PERSISTÊNCIA (Estilo LocalStorage) ---

// Salva o alarme no dispositivo
export async function salvarAlarmeStorage(horario) {
  try {
    await AsyncStorage.setItem(CHAVE_STORAGE_ALARME, horario);
  } catch (e) {
    console.error("Erro ao salvar o alarme no storage:", e);
  }
}

// Carrega o alarme salvo no dispositivo ao abrir o app
export async function carregarAlarmeStorage() {
  try {
    return await AsyncStorage.getItem(CHAVE_STORAGE_ALARME);
  } catch (e) {
    console.error("Erro ao carregar o alarme do storage:", e);
    return null;
  }
}

// Remove o alarme do dispositivo
export async function removerAlarmeStorage() {
  try {
    await AsyncStorage.removeItem(CHAVE_STORAGE_ALARME);
  } catch (e) {
    console.error("Erro ao remover o alarme do storage:", e);
  }
}