package com.senai.estoque.database.repository;

import com.senai.estoque.database.model.Posicao;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PosicaoRepository extends JpaRepository<Posicao, Long> {
    List<Posicao> findAllByRuaId(Long ruaId);
    List<Posicao> findAllByOcupada(Boolean ocupada);
}
