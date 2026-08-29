package com.senai.estoque.DTO;

public record DocaDTO(
        Long id,
        Integer numero,
        Boolean expedicao,
        Boolean ocupada
) {}