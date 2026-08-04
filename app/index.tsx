import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, Button, Platform, Alert } from "react-native";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";

import {
  requestPermissaoNotificacao,
  dispararMensagemNotificacao,
  iniciarVibracao,
  executarAlarmeCompleto,
  desligarAlarmeCompleto,
  salvarAlarmeStorage,
  carregarAlarmeStorage,
  removerAlarmeStorage,
} from "../utils/notificacoesEVibracao";

export default function App() {
  const [horaAtual, setHoraAtual] = useState<Date>(new Date());
  const [horaDespertador, setHoraDespertador] = useState<Date>(new Date());
  const [showPicker, setShowPicker] = useState<boolean>(false);
  const [despertadorDefinido, setDespertadorDefinido] = useState<string | null>(null);

  // Formata a data para 24 horas (HH:mm)
  const formatar24h = (date: Date): string => {
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  // Formata o relógio principal em tempo real (HH:mm:ss)
  const formatarRelogioCompleto24h = (date: Date): string => {
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  // 1. CARREGAR ALARME SALVO + PERMISSÕES (Ao iniciar a tela)
  useEffect(() => {
    const inicializar = async () => {
      await requestPermissaoNotificacao();
      const alarmeSalvo = await carregarAlarmeStorage();
      if (alarmeSalvo) {
        setDespertadorDefinido(alarmeSalvo);
      }
    };

    inicializar();
  }, []);

  // 2. CHECAGEM DO DESPERTADOR (A cada 1 segundo)
  useEffect(() => {
    const timer = setInterval(() => {
      const agora = new Date();
      setHoraAtual(agora);

      if (despertadorDefinido) {
        const horaMinutoAtual = formatar24h(agora);

        // Quando bate HH:mm e está no segundo 0
        if (horaMinutoAtual === despertadorDefinido && agora.getSeconds() === 0) {
          executarAlarmeCompleto();
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [despertadorDefinido]);

  // 3. Manipulador do DateTimePicker
  const onChangePicker = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowPicker(Platform.OS === "ios");
    if (selectedDate) {
      setHoraDespertador(selectedDate);
    }
  };

  // 4. Salvar e Setar o Despertador
  const handleSetDespertador = async () => {
    const horaFormatada = formatar24h(horaDespertador);
    setDespertadorDefinido(horaFormatada);
    await salvarAlarmeStorage(horaFormatada); // Guarda no armazenamento local

    Alert.alert("Sucesso", `Despertador programado para ${horaFormatada}`);
  };

  // 5. Cancelar/Limpar o Despertador
  const handleLimparDespertador = async () => {
    setDespertadorDefinido(null);
    await removerAlarmeStorage();
    desligarAlarmeCompleto();
    Alert.alert("Cancelado", "Despertador removido com sucesso!");
  };

  return (
    <View style={styles.container}>
      {/* Relógio em Tempo Real */}
      <Text style={styles.label}>Hora Atual:</Text>
      <Text style={styles.clockText}>
        {formatarRelogioCompleto24h(horaAtual)}
      </Text>

      {/* Horário Definido */}
      <Text style={styles.alarmStatus}>
        {despertadorDefinido
          ? `⏰ Despertador ativo para: ${despertadorDefinido}`
          : "Nenhum despertador definido"}
      </Text>

      {/* Controles de Configuração do Despertador */}
      <View style={styles.buttonGroup}>
        <Button title="1. Selecionar Horário" onPress={() => setShowPicker(true)} />
      </View>

      {showPicker && (
        <DateTimePicker
          value={horaDespertador}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={onChangePicker}
        />
      )}

      <View style={styles.buttonGroup}>
        <Button
          title="2. Setar Despertador"
          color="#4CAF50"
          onPress={handleSetDespertador}
        />
      </View>

      {despertadorDefinido && (
        <View style={styles.buttonGroup}>
          <Button
            title="Excluir Alarme Configurado"
            color="#757575"
            onPress={handleLimparDespertador}
          />
        </View>
      )}

      <View style={styles.divider} />

      {/* Controles Rápidos e Testes */}
      <Text style={styles.label}>Testes e Controles:</Text>

      {/* LADO A LADO COM FLEX: 1 */}
      <View style={styles.buttonRow}>
        <View style={styles.flexButton}>
          <Button title="Testar Notif/Som" color="#9C27B0" onPress={dispararMensagemNotificacao} />
        </View>
        <View style={styles.flexButton}>
          <Button title="Testar Vibração" color="#FF9800" onPress={iniciarVibracao} />
        </View>
      </View>

      <View style={styles.buttonGroup}>
        <Button
          title="🔔 Testar Alarme Completo"
          color="#E91E63"
          onPress={executarAlarmeCompleto}
        />
      </View>

      <View style={styles.buttonGroup}>
        <Button
          title="🛑 Desligar Alarme / Parar Vibração"
          color="#F44336"
          onPress={desligarAlarmeCompleto}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1e1e24",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  label: {
    color: "#aaa",
    fontSize: 16,
    marginBottom: 5,
  },
  clockText: {
    color: "#00E676",
    fontSize: 42,
    fontWeight: "bold",
    marginBottom: 15,
  },
  alarmStatus: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 20,
    textAlign: "center",
  },
  buttonGroup: {
    width: "85%",
    marginVertical: 5,
  },
  buttonRow: {
    flexDirection: "row",
    width: "85%",
    marginVertical: 8,
    gap: 10, // Espaçamento moderno entre os botões
  },
  flexButton: {
    flex: 1, // Faz a View ocupar 50% do espaço disponível cada uma
  },
  divider: {
    height: 1,
    width: "85%",
    backgroundColor: "#444",
    marginVertical: 15,
  },
});