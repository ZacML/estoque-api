package com.senai.estoque.database.repository;

import com.senai.estoque.database.model.Movimentacao;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MovimentacaoRepository extends JpaRepository<Movimentacao, Long> {

    // saídas que ainda precisam de autorização (dashboard / docas)
    List<Movimentacao> findAllBySaidaTrueAndAutorizadaFalse();

    List<Movimentacao> findAllByDocaId(Long docaId);

    boolean existsByProdutoId(Long produtoId);
}