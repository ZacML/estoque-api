package com.senai.estoque.DTO;

import java.math.BigDecimal;

/** Quantidade realmente contada pelo operador no coletor. */
public record ConferenciaDTO(
        BigDecimal quantidadeConferida
) {}
