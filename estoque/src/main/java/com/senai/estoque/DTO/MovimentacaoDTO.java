package com.senai.estoque.DTO;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record MovimentacaoDTO(
        Long id,
        Boolean saida,
        LocalDateTime dataHora,
        BigDecimal quantidade,
        BigDecimal quantidadeConferida,
        Boolean conferida,
        String placa,
        String motorista,
        String transportadora,
        String nota,
        Boolean autorizada,
        Boolean liberada,
        Long produtoId,
        Long posicaoId,
        Long docaId
) {}
