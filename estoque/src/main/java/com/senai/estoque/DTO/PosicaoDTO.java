package com.senai.estoque.DTO;

public record PosicaoDTO(
        Long id,
        Integer numero,
        Boolean ocupada,
        Long ruaId
) {}