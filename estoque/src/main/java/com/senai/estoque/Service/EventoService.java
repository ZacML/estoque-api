package com.senai.estoque.Service;

import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;
import java.util.Map;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * Barramento de eventos em tempo real (Server-Sent Events).
 * A Web (Angular) e o App (Expo) assinam /eventos/stream e recebem
 * a mesma notificação assim que qualquer serviço altera um dado.
 */
@Service
public class EventoService {

    /** 30 minutos; o cliente reconecta sozinho quando o emitter expira. */
    private static final long TIMEOUT = 30 * 60 * 1000L;

    private final List<SseEmitter> clientes = new CopyOnWriteArrayList<>();

    public SseEmitter inscrever() {
        SseEmitter emitter = new SseEmitter(TIMEOUT);
        clientes.add(emitter);
        emitter.onCompletion(() -> clientes.remove(emitter));
        emitter.onTimeout(() -> clientes.remove(emitter));
        emitter.onError(e -> clientes.remove(emitter));
        enviar(emitter, "conectado", Map.of("clientes", clientes.size()));
        return emitter;
    }

    public void publicar(String evento, Object payload) {
        for (SseEmitter emitter : clientes) {
            enviar(emitter, evento, payload);
        }
    }

    public int totalClientes() {
        return clientes.size();
    }

    private void enviar(SseEmitter emitter, String evento, Object payload) {
        try {
            emitter.send(SseEmitter.event().name(evento).data(payload));
        } catch (Exception e) {
            clientes.remove(emitter);
            try {
                emitter.complete();
            } catch (Exception ignored) {
                // conexão já encerrada pelo cliente
            }
        }
    }
}
