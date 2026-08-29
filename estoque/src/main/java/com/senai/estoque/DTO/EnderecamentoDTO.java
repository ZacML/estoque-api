package com.senai.estoque.DTO;

import java.math.BigDecimal;

/** Endereçamento manual de palete feito no app (rua -> posição). */
public record EnderecamentoDTO(
        Long posicaoId,
        BigDecimal quantidade
) {}
