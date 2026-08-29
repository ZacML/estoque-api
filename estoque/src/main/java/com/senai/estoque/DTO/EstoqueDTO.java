package com.senai.estoque.DTO;

import java.math.BigDecimal;

public record EstoqueDTO(
        Long id,
        BigDecimal quantidade,
        Long produtoId,
        Long posicaoId
) {}