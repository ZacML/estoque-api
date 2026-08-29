package com.senai.estoque.database.repository;

import com.senai.estoque.database.model.Estoque;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EstoqueRepository extends JpaRepository<Estoque, Long> {
    List<Estoque> findAllByProdutoId(Long produtoId);
    List<Estoque> findAllByPosicaoId(Long posicaoId);
}
